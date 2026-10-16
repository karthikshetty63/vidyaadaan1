import mongoose from "mongoose";
import Project from "../models/Project.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";
import { PROJECT_CATEGORIES } from "../../shared/projectRules.js";
import { SCHOOL_STATES } from "../../shared/registrationRules.js";

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

// ─── The home page's list of open needs ─────────────────────────────────────
const LIST_LIMIT_MAX = 24;
const LIST_LIMIT_DEFAULT = 9;
const SEARCH_MAX = 60;
const SUMMARY_MAX = 160;
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** A card on the home page: the public view, with a short summary instead of the whole problem. */
const toPublicCard = (p, school) => {
    const { problem, ...view } = toPublicView(p, school);
    // Cut at a word boundary.
    const summary = problem.length > SUMMARY_MAX ? `${problem.slice(0, SUMMARY_MAX).replace(/\s+\S*$/, "")}…` : problem;
    return { ...view, summary };
};

const readListQuery = (query) => {
    const int = (value, fallback, max) => {
        if (value === undefined || value === "") return fallback;
        const n = Number(value);
        return Number.isInteger(n) && n >= 1 && n <= max ? n : null;
    };
    const page = int(query.page, 1, 500);
    const limit = int(query.limit, LIST_LIMIT_DEFAULT, LIST_LIMIT_MAX);
    if (page === null || limit === null) return { error: `page must be 1–500 and limit 1–${LIST_LIMIT_MAX}.` };
    const category = query.category || "";
    if (category && !PROJECT_CATEGORIES.includes(category)) return { error: "Unknown category." };
    const state = query.state || "";
    if (state && !SCHOOL_STATES.includes(state)) return { error: "Unknown state." };
    const q = typeof query.q === "string" ? query.q.trim() : "";
    if (q.length > SEARCH_MAX) return { error: `Search can be at most ${SEARCH_MAX} characters.` };
    return { value: { page, limit, category, state, q } };
};

// GET /api/public/projects?category=&state=&q=&page=&limit= — approved needs still open for support, newest
// first, for anyone (the home page). The same rules as the NGO and donor lists: approved, not completed, and
// the school's account still active. The same fields as one project's public page.
export const listPublicProjects = async (req, res, next) => {
    const { error, value } = readListQuery(req.query || {});
    if (error) return res.status(400).json({ message: error });
    const { page, limit, category, state, q } = value;
    try {
        const activeSchools = (await User.find({ role: "school", accountStatus: "active" }).select("_id").lean()).map((u) => u._id);
        const base = { reviewStatus: "OPEN", status: { $ne: "Completed" }, school: { $in: activeSchools } };

        const filter = { ...base, ...(category ? { category } : {}) };
        if (state || q) {
            const rx = q ? new RegExp(escapeRegex(q), "i") : null;
            const profiles = await SchoolProfile.find({
                userId: { $in: activeSchools },
                ...(state ? { state } : {}),
                ...(rx ? { $or: [{ schoolName: rx }, { district: rx }] } : {}),
            }).select("userId").lean();
            const matchingSchools = profiles.map((p) => p.userId);
            if (rx) {
                // The title, or the school's name or district.
                const inState = state ? (await SchoolProfile.find({ userId: { $in: activeSchools }, state }).select("userId").lean()).map((p) => p.userId) : activeSchools;
                filter.$or = [{ title: rx, school: { $in: inState } }, { school: { $in: matchingSchools } }];
            } else {
                filter.school = { $in: matchingSchools };
            }
        }

        const fields = "school title category priority status problem budget raised studentsBenefited expectedCompletion materials";
        const [total, rows, byCategory, bySchool] = await Promise.all([
            Project.countDocuments(filter),
            Project.find(filter).sort({ reviewedAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).select(fields).lean(),
            // What the filters offer: every category and state that has open needs (whatever is chosen now).
            Project.aggregate([{ $match: base }, { $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
            Project.aggregate([{ $match: base }, { $group: { _id: "$school", count: { $sum: 1 } } }]),
        ]);
        const profiles = await SchoolProfile.find({ userId: { $in: [...new Set([...rows.map((r) => String(r.school)), ...bySchool.map((s) => String(s._id))])] } })
            .select("userId schoolName district state")
            .lean();
        const profileOf = new Map(profiles.map((p) => [String(p.userId), p]));
        const states = new Map();
        for (const { _id, count } of bySchool) {
            const st = profileOf.get(String(_id))?.state;
            if (st) states.set(st, (states.get(st) || 0) + count);
        }

        res.set("Cache-Control", "no-store");
        return res.json({
            items: rows.map((p) => toPublicCard(p, profileOf.get(String(p.school)))),
            total,
            page,
            limit,
            pages: Math.max(1, Math.ceil(total / limit)),
            hasMore: page * limit < total,
            filters: {
                categories: byCategory.map((c) => ({ value: c._id, count: c.count })),
                states: [...states].sort(([a], [b]) => a.localeCompare(b)).map(([st, count]) => ({ value: st, count })),
            },
        });
    } catch (err) {
        return next(err);
    }
};
