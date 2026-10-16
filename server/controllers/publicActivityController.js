import ActivityEvent from "../models/ActivityEvent.js";
import Project from "../models/Project.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";

// The home page's "happening on VIDYADAAN" strip: a few recent, real events from the activity log, made
// safe for anyone to see. Only events about approved projects of active schools; never a person's or an
// NGO's name, never an amount, never anything from a school's private records; and no test-mode payments
// (no real money moved, so they aren't shown as if it had).

/** What may appear, and how the browser describes it (kind). */
const PUBLIC_EVENTS = {
    "project.approved": "need_approved",
    "commitment.created": "ngo_committed",
    "payment.accepted": "school_received",
    "payment.online_verified": "school_received",
    "donation.verified": "donor_supported",
};
const SHOWN = 12;
// Read a few more than shown: some drop out (test payments, projects no longer public).
const READ = 60;

const projectIdOf = (e) => (e.action.startsWith("payment.") || e.action.startsWith("donation.") ? e.details?.projectId : e.target?.id);

// GET /api/public/activity — no sign-in needed.
export const listPublicActivity = async (_req, res, next) => {
    try {
        const events = await ActivityEvent.find({ action: { $in: Object.keys(PUBLIC_EVENTS) }, result: "success" })
            .sort({ at: -1, _id: -1 })
            .limit(READ)
            .select("at action target.id details.projectId details.parts details.mode")
            .lean();
        const real = events.filter((e) => e.details?.mode !== "test" && projectIdOf(e));

        // Only approved projects of schools whose accounts are active (the same rule as every public page).
        const projects = await Project.findVisibleToPublic({ _id: { $in: real.map(projectIdOf) } }).select("title school").lean();
        const [activeSchools, profiles] = await Promise.all([
            User.find({ _id: { $in: projects.map((p) => p.school) }, role: "school", accountStatus: "active" }).select("_id").lean(),
            SchoolProfile.find({ userId: { $in: projects.map((p) => p.school) } }).select("userId district state").lean(),
        ]);
        const active = new Set(activeSchools.map((u) => String(u._id)));
        const placeOf = new Map(profiles.map((p) => [String(p.userId), [p.district, p.state].filter(Boolean).join(", ")]));
        const visible = new Map(projects.filter((p) => active.has(String(p.school))).map((p) => [String(p._id), p]));

        const items = [];
        for (const e of real) {
            const project = visible.get(String(projectIdOf(e)));
            if (!project) continue;
            items.push({
                id: String(e._id),
                at: e.at,
                kind: PUBLIC_EVENTS[e.action],
                // NGO commitments: how many of the 5 parts (never the amount or the NGO).
                ...(e.action === "commitment.created" ? { parts: Array.isArray(e.details?.parts) ? e.details.parts.length : 1 } : {}),
                project: { id: String(project._id), title: project.title },
                place: placeOf.get(String(project.school)) || "",
            });
            if (items.length === SHOWN) break;
        }

        res.set("Cache-Control", "no-store");
        return res.json({ items, generatedAt: new Date().toISOString() });
    } catch (error) {
        return next(error);
    }
};
