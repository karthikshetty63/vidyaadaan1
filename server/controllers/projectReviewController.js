import mongoose from "mongoose";
import Project, { PENDING_REVIEW_FILTER } from "../models/Project.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";
import { logActivity, projectTarget } from "../services/activityLog.js";
import { queueProjectApprovalEmails } from "../services/alumniNotifications.js";
import { emailProjectDecision } from "../services/notificationEmails.js";
import { PROJECT_REJECTION_REASON_MAX, PROJECT_REJECTION_REASON_MIN, PROJECT_REVIEW_STATUSES } from "../../shared/projectRules.js";
import { projectToClient } from "./projectController.js";

// Admin review of school projects: the same Project records the schools create and edit.
// Approve: PENDING_REVIEW → OPEN, then the school's active alumni are emailed (in the background).
// Reject (with a reason): PENDING_REVIEW → REJECTED.
// Nothing else is allowed; a rejected project returns to PENDING_REVIEW only when its school edits it.

const LIST_LIMIT = 200;
const filterFor = (reviewStatus) => (reviewStatus === "PENDING_REVIEW" ? PENDING_REVIEW_FILTER : { reviewStatus });
const notFound = (res) => res.status(404).json({ message: "Project not found." });

/** The school behind each project: display name, place (and its map location, if set), and whether its account is still active. */
export const schoolSummaries = async (schoolIds) => {
    const [profiles, users] = await Promise.all([
        SchoolProfile.find({ userId: { $in: schoolIds } }).select("userId schoolName udise district state mapLocation").lean(),
        User.find({ _id: { $in: schoolIds } }).select("name email accountStatus").lean(),
    ]);
    const profileById = new Map(profiles.map((p) => [p.userId.toString(), p]));
    return new Map(
        users.map((u) => {
            const profile = profileById.get(u._id.toString());
            return [
                u._id.toString(),
                {
                    id: u._id.toString(),
                    name: profile?.schoolName || u.name,
                    udise: profile?.udise || null,
                    district: profile?.district || null,
                    state: profile?.state || null,
                    // Admins only (this is the admin review): where the school is on the map.
                    mapLocation: profile?.mapLocation ? { lat: profile.mapLocation.lat, lng: profile.mapLocation.lng } : null,
                    contactName: u.name,
                    email: u.email,
                    accountStatus: u.accountStatus,
                },
            ];
        })
    );
};

const findReviewable = async (id) => (mongoose.isValidObjectId(id) ? Project.findById(id) : null);

/** Why a project can't be approved/rejected right now (it isn't waiting for review). */
const notWaiting = (res, project) =>
    res.status(409).json({
        message: `This project is not waiting for review (it is ${project.reviewStatus === "OPEN" ? "already approved" : "rejected"}).`,
        reviewStatus: project.reviewStatus,
    });

// GET /api/admin/projects?status=PENDING_REVIEW|OPEN|REJECTED
export const listProjectsForReview = async (req, res, next) => {
    const reviewStatus = req.query.status ?? "PENDING_REVIEW";
    if (!PROJECT_REVIEW_STATUSES.includes(reviewStatus)) {
        return res.status(400).json({ message: "status must be PENDING_REVIEW, OPEN or REJECTED." });
    }
    try {
        // The review queue is first come, first served; decided projects show the latest first.
        const sort = reviewStatus === "PENDING_REVIEW" ? { submittedAt: 1, createdAt: 1 } : { reviewedAt: -1, _id: -1 };
        const [projects, counts] = await Promise.all([
            Project.find(filterFor(reviewStatus)).sort(sort).limit(LIST_LIMIT).lean(),
            Project.aggregate([{ $group: { _id: { $ifNull: ["$reviewStatus", "PENDING_REVIEW"] }, count: { $sum: 1 } } }]),
        ]);
        const schools = await schoolSummaries([...new Set(projects.map((p) => p.school.toString()))]);
        return res.json({
            projects: projects.map((p) => ({ ...projectToClient(p), school: schools.get(p.school.toString()) || null })),
            counts: Object.fromEntries(PROJECT_REVIEW_STATUSES.map((s) => [s, counts.find((c) => c._id === s)?.count || 0])),
        });
    } catch (error) {
        return next(error);
    }
};

// GET /api/admin/projects/:id
export const getProjectForReview = async (req, res, next) => {
    try {
        const project = await findReviewable(req.params.id);
        if (!project) return notFound(res);
        const schools = await schoolSummaries([project.school]);
        return res.json({ project: { ...projectToClient(project), school: schools.get(project.school.toString()) || null } });
    } catch (error) {
        return next(error);
    }
};

// PATCH /api/admin/projects/:id/approve
export const approveProject = async (req, res, next) => {
    try {
        const project = await findReviewable(req.params.id);
        if (!project) return notFound(res);
        const school = await User.findById(project.school).select("accountStatus").lean();
        if (school?.accountStatus !== "active") {
            return res.status(409).json({ message: "This school's account is not active, so its project can't be approved." });
        }

        // One atomic step, and only while the project is still waiting: approving twice, or
        // approving a rejected project, fails instead of overwriting.
        const updated = await Project.findOneAndUpdate(
            { _id: project._id, ...PENDING_REVIEW_FILTER },
            { $set: { reviewStatus: "OPEN", reviewedBy: req.user._id, reviewedAt: new Date() }, $unset: { rejectionReason: "" } },
            { returnDocument: "after" }
        );
        if (!updated) return notWaiting(res, await Project.findById(project._id).lean());

        // Only this request moved the project to OPEN, so only it tells the school's alumni.
        const alumniEmails = await notifyAlumni(updated, req.app.locals.frontendOrigin);
        logActivity(req, { action: "project.approved", target: projectTarget(updated), details: { schoolId: updated.school, budget: updated.budget, alumniEmails: alumniEmails.status, alumniQueued: alumniEmails.queued || 0 } });
        // The school is told too, in the background.
        emailProjectDecision(req.app.locals.frontendOrigin, updated, { approved: true, alumniQueued: alumniEmails.status === "QUEUED" ? alumniEmails.queued : 0 });
        return res.json({
            message: `Project approved. It is now open. ${alumniEmails.message}`,
            project: projectToClient(updated),
            alumniEmails: { status: alumniEmails.status, queued: alumniEmails.queued },
        });
    } catch (error) {
        return next(error);
    }
};

const ALUMNI_EMAIL_MESSAGES = {
    QUEUED: ({ queued }) => `Emails to ${queued} ${queued === 1 ? "alum" : "alumni"} of the school have been queued.`,
    ALREADY_QUEUED: () => "Emails to the school's alumni were already queued.",
    NO_ALUMNI: () => "The school has no active alumni to email.",
    EMAIL_UNAVAILABLE: () => "Alumni emails were not sent: email is not set up on the server.",
    ERROR: () => "Alumni emails could not be queued; see the server log.",
};

/** Never throws: the project is approved whatever happens to the emails. */
const notifyAlumni = async (project, frontendOrigin) => {
    let result;
    try {
        result = await queueProjectApprovalEmails(project, { frontendOrigin });
    } catch (error) {
        console.error(`Project ${project._id} was approved, but its alumni emails could not be queued:`, error.message);
        result = { status: "ERROR", queued: 0 };
    }
    return { ...result, message: ALUMNI_EMAIL_MESSAGES[result.status](result) };
};

// PATCH /api/admin/projects/:id/reject  { reason }
export const rejectProject = async (req, res, next) => {
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
    if (reason.length < PROJECT_REJECTION_REASON_MIN || reason.length > PROJECT_REJECTION_REASON_MAX) {
        const message = `Give a rejection reason between ${PROJECT_REJECTION_REASON_MIN} and ${PROJECT_REJECTION_REASON_MAX} characters.`;
        return res.status(400).json({ message, errors: { reason: message } });
    }
    try {
        const project = await findReviewable(req.params.id);
        if (!project) return notFound(res);
        const updated = await Project.findOneAndUpdate(
            { _id: project._id, ...PENDING_REVIEW_FILTER },
            { $set: { reviewStatus: "REJECTED", rejectionReason: reason, reviewedBy: req.user._id, reviewedAt: new Date() } },
            { returnDocument: "after" }
        );
        if (!updated) return notWaiting(res, await Project.findById(project._id).lean());
        logActivity(req, { action: "project.rejected", target: projectTarget(updated), details: { schoolId: updated.school, reason } });
        emailProjectDecision(req.app.locals.frontendOrigin, updated, { approved: false, reason });
        return res.json({ message: "Project rejected. The school can see the reason and resubmit.", project: projectToClient(updated) });
    } catch (error) {
        return next(error);
    }
};
