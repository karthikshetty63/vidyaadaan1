// Live VIDYADAAN facts for the help assistant, so it can answer "what's the status of my project?".
// The AI never touches the database: this file runs a few fixed, read-only lookups, only for the
// signed-in account itself (or, for admins, the review queues admins already see), and turns them into
// short text. Visitors get none. Only lookups the question asks about are run, each capped at 8 items.
import { partStatus, toPartnerViews } from "../controllers/approvedProjectController.js";
import Alumni from "../models/Alumni.js";
import Donation from "../models/Donation.js";
import FundingPayment from "../models/FundingPayment.js";
import Project, { PENDING_REVIEW_FILTER } from "../models/Project.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";
import { FUNDING_PARTS } from "../../shared/projectRules.js";

const MAX_ITEMS = 8;

const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
const day = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "unknown date");
const quote = (s) => `“${String(s).replace(/\s+/g, " ").trim()}”`;

const REVIEW_LABELS = { PENDING_REVIEW: "pending review", OPEN: "approved", REJECTED: "changes requested" };
const PART_LABELS = { AWAITING_PAYMENT: "not paid yet", PAYMENT_SUBMITTED: "payment waiting for the school to check", RECEIVED: "received by the school" };

// ─── School ──────────────────────────────────────────────────────────────────
const schoolProjects = async (user) => {
    const [projects, total] = await Promise.all([
        Project.find({ school: user._id }).sort({ createdAt: -1 }).limit(MAX_ITEMS).lean(),
        Project.countDocuments({ school: user._id }),
    ]);
    if (!projects.length) return "Your school has not created any projects yet.";
    const lines = projects.map((p) => {
        const review = REVIEW_LABELS[p.reviewStatus || "PENDING_REVIEW"];
        const reason = p.reviewStatus === "REJECTED" && p.rejectionReason ? ` (reason: ${quote(p.rejectionReason)})` : "";
        const work = p.reviewStatus === "OPEN" ? `; work status ${p.status}; NGO parts taken ${(p.fundingParts || []).length} of ${FUNDING_PARTS}` : "";
        return `- ${quote(p.title)}: ${review}${reason}${work}; budget ${inr(p.budget)}; raised ${inr(p.raised)}`;
    });
    return `Your school's projects (${total} in all; newest ${projects.length} shown):\n${lines.join("\n")}`;
};

const schoolPayments = async (user) => {
    const toCheck = await FundingPayment.countDocuments({ school: user._id, status: "SUBMITTED" });
    return `NGO payments waiting for your school to check under Donation History: ${toCheck}.`;
};

const schoolAlumni = async (user) => {
    const [active, inactive] = await Promise.all([
        Alumni.countDocuments({ school: user._id, status: "ACTIVE" }),
        Alumni.countDocuments({ school: user._id, status: "INACTIVE" }),
    ]);
    return `Your school's alumni list: ${active} active (emailed when a project is approved), ${inactive} inactive.`;
};

// ─── NGO and donor ───────────────────────────────────────────────────────────
const openNeeds = async (user) => {
    const projects = await Project.findVisibleToPublic({ status: { $ne: "Completed" } }).sort({ reviewedAt: -1, _id: -1 }).limit(MAX_ITEMS).lean();
    const views = await toPartnerViews(projects, user._id, { activeOnly: true });
    if (!views.length) return "There are no approved school needs open for funding right now.";
    const lines = views.map((v) => {
        const place = [v.school.name, v.school.district].filter(Boolean).join(", ");
        // Donors never see NGO commitments; NGOs see how many parts are still free.
        const parts = user.role === "ngo" ? `; ${v.parts.filter((p) => !p.takenBy).length} of ${FUNDING_PARTS} parts free` : "";
        return `- ${quote(v.title)} (${place}; ${v.category}): budget ${inr(v.budget)}; raised ${inr(v.raised)}${parts}`;
    });
    return `Approved school needs open for support (newest ${views.length}):\n${lines.join("\n")}`;
};

const ngoCommitments = async (user) => {
    const projects = await Project.findVisibleToPublic({ "fundingParts.ngo": user._id }).limit(MAX_ITEMS).lean();
    if (!projects.length) return "Your NGO has not committed to any school needs yet.";
    const lines = projects.map((p) => {
        const mine = p.fundingParts.filter((f) => f.ngo.equals(user._id));
        const parts = mine.map((f) => `part ${f.part} ${inr(f.amount)} ${PART_LABELS[partStatus(f)]}`).join(", ");
        return `- ${quote(p.title)} (work status ${p.status}): ${parts}`;
    });
    return `Your NGO's commitments (up to ${MAX_ITEMS}):\n${lines.join("\n")}`;
};

const donorDonations = async (user) => {
    const paid = { donor: user._id, status: "PAID" };
    const [latest, totals] = await Promise.all([
        Donation.find(paid).sort({ verifiedAt: -1, _id: -1 }).limit(5).populate("project", "title").lean(),
        Donation.aggregate([{ $match: paid }, { $group: { _id: null, count: { $sum: 1 }, total: { $sum: "$amount" } } }]),
    ]);
    const { count = 0, total = 0 } = totals[0] || {};
    if (!count) return "You have no confirmed donations yet.";
    const lines = latest.map((d) => `- ${inr(d.amount)} to ${quote(d.project?.title || "a school need")} on ${day(d.verifiedAt || d.createdAt)}${d.mode === "test" ? " (test mode, no real money)" : ""}`);
    return `Your confirmed donations: ${count}, ${inr(total)} in all. Latest:\n${lines.join("\n")}`;
};

// ─── Admin ───────────────────────────────────────────────────────────────────
const adminQueues = async () => {
    const [accounts, pendingProjects, projectCount, pendingQrs] = await Promise.all([
        User.aggregate([{ $match: { accountStatus: "pending" } }, { $group: { _id: "$role", count: { $sum: 1 } } }]),
        Project.find(PENDING_REVIEW_FILTER).sort({ submittedAt: 1, createdAt: 1 }).limit(5).select("title school submittedAt createdAt").lean(),
        Project.countDocuments(PENDING_REVIEW_FILTER),
        SchoolProfile.countDocuments({ "paymentQr.status": "PENDING" }),
    ]);
    const byRole = Object.fromEntries(accounts.map((a) => [a._id, a.count]));
    const names = new Map(
        (await SchoolProfile.find({ userId: { $in: pendingProjects.map((p) => p.school) } }).select("userId schoolName").lean())
            .map((s) => [s.userId.toString(), s.schoolName])
    );
    const oldest = pendingProjects.map((p) => `- ${quote(p.title)} from ${names.get(p.school.toString()) || "a school"}, submitted ${day(p.submittedAt || p.createdAt)}`);
    return [
        `Accounts waiting for approval: ${byRole.school || 0} schools, ${byRole.ngo || 0} NGOs, ${byRole.donor || 0} donors.`,
        `Projects waiting for review: ${projectCount}.${oldest.length ? ` Oldest first:\n${oldest.join("\n")}` : ""}`,
        `School payment QRs waiting for review: ${pendingQrs}.`,
    ].join("\n");
};

// ─── Which lookups a question asks for ───────────────────────────────────────
const LOOKUPS = {
    school: [
        { label: "Your projects", when: /\b(my|our)\b.*\bprojects?\b|\bprojects?\b.*\b(status|approv\w*|reject\w*|pending|review\w*|raised|funded|progress)\b|\b(status|approved|rejected|pending)\b/i, run: schoolProjects },
        { label: "Payments to check", when: /\bpayments?\b|\bpaid\b|\bproof\b|\bto check\b/i, run: schoolPayments },
        { label: "Your alumni", when: /\balumn/i, run: schoolAlumni },
    ],
    ngo: [
        { label: "Open school needs", when: /\bneeds?\b|\bopen\b|\bavailable\b|\bbrowse\b|\bwhich (projects?|schools?)\b|\bschools? (to|i can) (fund|support)\b/i, run: openNeeds },
        { label: "Your commitments", when: /\b(my|our)\b.*\b(commit\w*|parts?|payments?|funding|projects?|needs?)\b|\bcommitments?\b|\bwithdraw/i, run: ngoCommitments },
    ],
    donor: [
        { label: "Open school needs", when: /\bneeds?\b|\bopen\b|\bavailable\b|\bwhich (projects?|schools?)\b|\bwhere (can|should) i donate\b/i, run: openNeeds },
        { label: "Your donations", when: /\b(my|i)\b.*\b(donations?|donated|gave|given|history|total)\b|\bhow much (have )?i\b/i, run: donorDonations },
    ],
    admin: [
        { label: "Review queues", when: /\bpending\b|\bwaiting\b|\bqueue\b|\bhow many\b|\bto (review|approve)\b|\bcount\b/i, run: adminQueues },
    ],
};

/**
 * The live facts a question asks about, for this signed-in user only. A failed lookup is left out
 * (and logged) rather than failing the answer.
 * @returns {Promise<{ label: string, text: string }[]>}
 */
export const liveDataFor = async (user, persona, message) => {
    if (!user || !LOOKUPS[persona.key]) return [];
    const wanted = LOOKUPS[persona.key].filter((lookup) => lookup.when.test(message));
    const results = await Promise.all(
        wanted.map(async ({ label, run }) => {
            try {
                return { label, text: await run(user) };
            } catch (error) {
                console.error(`Chatbot live data "${label}" failed:`, error.message);
                return null;
            }
        })
    );
    return results.filter(Boolean);
};
