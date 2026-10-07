import mongoose from "mongoose";
import Project from "../models/Project.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";

// One approved project for anyone, signed in or not: the page an alumni email's "View project" opens.
// Pending, rejected and missing projects, and projects of a school whose account is no longer active,
// all get the same 404, so a visitor can't tell which of these it is.

const notFound = (res) => res.status(404).json({ message: "Project not found." });

/**
 * The only project fields a visitor ever gets: the need as the school described it, its budget, the money
 * confirmed for it, and the school's name and place. Never the school's contact details, bank or UPI
 * details, UDISE code or documents; nothing from the admin review; no NGO commitments or payments; no
 * donors or donations; no photos or other files (they are private).
 */
const toPublicView = (p, school) => ({
    id: p._id.toString(),
    title: p.title,
    category: p.category,
    priority: p.priority,
    status: p.status,
    problem: p.problem,
    budget: p.budget,
    // Money confirmed for this project, kept by the server (NGO payments the school accepted plus verified donations).
    raised: p.raised,
    studentsBenefited: p.studentsBenefited,
    expectedCompletion: p.expectedCompletion.toISOString().slice(0, 10),
    materials: p.materials,
    school: { name: school?.schoolName || "Government school", district: school?.district || "", state: school?.state || "" },
});

// GET /api/public/projects/:id — no sign-in needed.
export const getPublicProject = async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) return notFound(res);
    try {
        // findOneVisibleToPublic only ever returns approved (OPEN) projects. Only the fields shown are read.
        const project = await Project.findOneVisibleToPublic({ _id: req.params.id })
            .select("school title category priority status problem budget raised studentsBenefited expectedCompletion materials")
            .lean();
        if (!project) return notFound(res);

        // As in the NGO and donor lists: a school whose account is no longer active drops out, with its projects.
        const [schoolActive, profile] = await Promise.all([
            User.exists({ _id: project.school, role: "school", accountStatus: "active" }),
            SchoolProfile.findOne({ userId: project.school }).select("schoolName district state").lean(),
        ]);
        if (!schoolActive) return notFound(res);

        // Always the latest figures (e.g. right after a donation), never a cached copy.
        res.set("Cache-Control", "no-store");
        return res.json({ project: toPublicView(project, profile) });
    } catch (error) {
        return next(error);
    }
};
