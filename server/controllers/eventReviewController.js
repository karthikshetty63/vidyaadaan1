import mongoose from "mongoose";
import SchoolEvent from "../models/SchoolEvent.js";
import User from "../models/User.js";
import { logActivity } from "../services/activityLog.js";
import { toAdminView } from "../services/eventViews.js";
import { EVENT_REVIEW_STATUSES, validateEventRejectionReason } from "../../shared/eventRules.js";
import { eventTarget } from "./eventController.js";
import { schoolSummaries } from "./projectReviewController.js";

// Admin review of school events, the same way projects are reviewed.
// Approve: PENDING_REVIEW → OPEN (NGOs and donors can now see it and offer help).
// Reject (with a reason): PENDING_REVIEW → REJECTED; it returns to review when its school edits it.

const LIST_LIMIT = 200;
const notFound = (res) => res.status(404).json({ message: "Event not found." });
const findReviewable = async (id) => (mongoose.isValidObjectId(id) ? SchoolEvent.findById(id) : null);

const notWaiting = (res, event) =>
    res.status(409).json({
        message: `This event is not waiting for review (it is ${event.reviewStatus === "OPEN" ? "already approved" : "rejected"}).`,
        reviewStatus: event.reviewStatus,
    });

// GET /api/admin/events?status=PENDING_REVIEW|OPEN|REJECTED
export const listEventsForReview = async (req, res, next) => {
    const reviewStatus = req.query.status ?? "PENDING_REVIEW";
    if (!EVENT_REVIEW_STATUSES.includes(reviewStatus)) {
        return res.status(400).json({ message: "status must be PENDING_REVIEW, OPEN or REJECTED." });
    }
    try {
        // The review queue is first come, first served; decided events show the latest first.
        const sort = reviewStatus === "PENDING_REVIEW" ? { submittedAt: 1, createdAt: 1 } : { reviewedAt: -1, _id: -1 };
        const [events, counts] = await Promise.all([
            SchoolEvent.find({ reviewStatus }).sort(sort).limit(LIST_LIMIT).lean(),
            SchoolEvent.aggregate([{ $group: { _id: "$reviewStatus", count: { $sum: 1 } } }]),
        ]);
        const schools = await schoolSummaries([...new Set(events.map((e) => e.school.toString()))]);
        return res.json({
            events: events.map((e) => toAdminView(e, schools.get(e.school.toString()))),
            counts: Object.fromEntries(EVENT_REVIEW_STATUSES.map((s) => [s, counts.find((c) => c._id === s)?.count || 0])),
        });
    } catch (error) {
        return next(error);
    }
};

// GET /api/admin/events/:id
export const getEventForReview = async (req, res, next) => {
    try {
        const event = await findReviewable(req.params.id);
        if (!event) return notFound(res);
        const schools = await schoolSummaries([event.school]);
        return res.json({ event: toAdminView(event, schools.get(event.school.toString())) });
    } catch (error) {
        return next(error);
    }
};

// PATCH /api/admin/events/:id/approve
export const approveEvent = async (req, res, next) => {
    try {
        const event = await findReviewable(req.params.id);
        if (!event) return notFound(res);
        const school = await User.findById(event.school).select("accountStatus").lean();
        if (school?.accountStatus !== "active") {
            return res.status(409).json({ message: "This school's account is not active, so its event can't be approved." });
        }
        // One atomic step, and only while the event is still waiting.
        const updated = await SchoolEvent.findOneAndUpdate(
            { _id: event._id, reviewStatus: "PENDING_REVIEW" },
            { $set: { reviewStatus: "OPEN", reviewedBy: req.user._id, reviewedAt: new Date() }, $unset: { rejectionReason: "" } },
            { returnDocument: "after" }
        );
        if (!updated) return notWaiting(res, await SchoolEvent.findById(event._id).lean());
        logActivity(req, { action: "event.approved", target: eventTarget(updated), details: { schoolId: updated.school } });
        const schools = await schoolSummaries([updated.school]);
        return res.json({ message: "Event approved. NGOs and donors can now see it and offer help.", event: toAdminView(updated, schools.get(updated.school.toString())) });
    } catch (error) {
        return next(error);
    }
};

// PATCH /api/admin/events/:id/reject  { reason }
export const rejectEvent = async (req, res, next) => {
    const { error, value: reason } = validateEventRejectionReason(req.body?.reason);
    if (error) return res.status(400).json({ message: error, errors: { reason: error } });
    try {
        const event = await findReviewable(req.params.id);
        if (!event) return notFound(res);
        const updated = await SchoolEvent.findOneAndUpdate(
            { _id: event._id, reviewStatus: "PENDING_REVIEW" },
            { $set: { reviewStatus: "REJECTED", rejectionReason: reason, reviewedBy: req.user._id, reviewedAt: new Date() } },
            { returnDocument: "after" }
        );
        if (!updated) return notWaiting(res, await SchoolEvent.findById(event._id).lean());
        logActivity(req, { action: "event.rejected", target: eventTarget(updated), details: { schoolId: updated.school, reason } });
        const schools = await schoolSummaries([updated.school]);
        return res.json({ message: "Event rejected. The school can see the reason and resubmit.", event: toAdminView(updated, schools.get(updated.school.toString())) });
    } catch (rejectError) {
        return next(rejectError);
    }
};
