// Read-only data for the admin Control Tower. Every figure is counted from VIDYADAAN's own records by
// the database; nothing here changes a record. NGO commitments (promises), NGO payments and donor
// donations are always kept apart, and money only counts as confirmed the way the rest of the app counts
// it: an NGO payment once the school accepted it (or Razorpay verified an online one), a donation once the
// server verified its Razorpay signature. Lists are paginated and return only what monitoring needs:
// never emails, phone numbers, addresses, bank details, PAN, documents, passwords or payment signatures.
import mongoose from "mongoose";
import ActivityEvent from "../models/ActivityEvent.js";
import Alumni from "../models/Alumni.js";
import AlumniNotification from "../models/AlumniNotification.js";
import Donation from "../models/Donation.js";
import DonorProfile from "../models/DonorProfile.js";
import FundingPayment from "../models/FundingPayment.js";
import NGOProfile from "../models/NGOProfile.js";
import Project, { PENDING_REVIEW_FILTER } from "../models/Project.js";
import SchoolEvent from "../models/SchoolEvent.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";
import Volunteer from "../models/Volunteer.js";
import { activityLabel } from "../../shared/activityRules.js";
import { HISTORY_MARKER_KEY } from "./activityHistory.js";
import { maskReference } from "./activityLog.js";

const DAY = 24 * 60 * 60 * 1000;
// Queued work older than this is flagged as waiting too long.
export const STALE_AFTER_DAYS = 7;
// How many examples each check returns (its count is always the full number).
const CHECK_EXAMPLES = 20;

const id = (value) => (value ? String(value) : null);
const ids = (values) => [...new Set(values.filter(Boolean).map(String))].filter((v) => mongoose.isValidObjectId(v)).map((v) => new mongoose.Types.ObjectId(v));
const sumBy = (rows, match, field = "amount") => rows.filter(match).reduce((s, r) => s + (r[field] || 0), 0);

/** Escapes text for use in a case-insensitive "contains" search. */
export const containsRegex = (text) => new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

// ─── Names ───────────────────────────────────────────────────────────────────
/**
 * Display names for accounts: the school's or NGO's name (not the person's), the donor's or admin's name.
 * @returns {Promise<Map<string, { id, role, name, status, district?, state?, city? }>>}
 */
export const accountNames = async (values) => {
    const list = ids(values);
    if (!list.length) return new Map();
    const [users, schools, ngos, donors] = await Promise.all([
        User.find({ _id: { $in: list } }).select("name role accountStatus").lean(),
        SchoolProfile.find({ userId: { $in: list } }).select("userId schoolName district state").lean(),
        NGOProfile.find({ userId: { $in: list } }).select("userId ngoName district state").lean(),
        DonorProfile.find({ userId: { $in: list } }).select("userId city state").lean(),
    ]);
    const map = new Map(users.map((u) => [id(u._id), { id: id(u._id), role: u.role, name: u.name, status: u.accountStatus }]));
    for (const s of schools) Object.assign(map.get(id(s.userId)) || {}, { name: s.schoolName || map.get(id(s.userId))?.name, district: s.district, state: s.state });
    for (const n of ngos) Object.assign(map.get(id(n.userId)) || {}, { name: n.ngoName || map.get(id(n.userId))?.name, district: n.district, state: n.state });
    for (const d of donors) Object.assign(map.get(id(d.userId)) || {}, { city: d.city, state: d.state });
    return map;
};
const nameOf = (names, value) => (value ? names.get(id(value))?.name || "Deleted account" : null);

/** User ids whose own name, or school/NGO name, contains `q`. */
const accountsMatching = async (q, role) => {
    const rx = containsRegex(q);
    const [users, schools, ngos] = await Promise.all([
        User.find({ name: rx, ...(role ? { role } : {}) }).select("_id").limit(1000).lean(),
        !role || role === "school" ? SchoolProfile.find({ $or: [{ schoolName: rx }, { district: rx }] }).select("userId").limit(1000).lean() : [],
        !role || role === "ngo" ? NGOProfile.find({ $or: [{ ngoName: rx }, { district: rx }] }).select("userId").limit(1000).lean() : [],
    ]);
    return ids([...users.map((u) => u._id), ...schools.map((s) => s.userId), ...ngos.map((n) => n.userId)]);
};

const page = async (model, filter, { page: n, limit }, { sort, select }) => {
    const [total, rows] = await Promise.all([
        model.countDocuments(filter),
        model.find(filter).sort(sort).skip((n - 1) * limit).limit(limit).select(select).lean(),
    ]);
    return { total, rows };
};
const pageResult = (items, total, { page: n, limit }) => ({ items, total, page: n, limit, pages: Math.max(1, Math.ceil(total / limit)), hasMore: n * limit < total });

const dateFilter = (from, to) => (from || to ? { ...(from ? { $gte: from } : {}), ...(to ? { $lte: to } : {}) } : null);

// ─── Overview ────────────────────────────────────────────────────────────────
const groupCounts = (rows) => Object.fromEntries(rows.map((r) => [r._id, { count: r.count, amount: r.amount || 0 }]));

/** Every headline figure, counted by the database now. */
export const getOverview = async () => {
    const now = Date.now();
    const [accounts, projects, parts, payments, donations, pendingAccounts, pendingProjects, pendingQrs, paymentsToCheck, alumniEmails, activity, failedSignIns, liveSince, marker] =
        await Promise.all([
            User.aggregate([{ $group: { _id: { role: "$role", status: "$accountStatus" }, count: { $sum: 1 } } }]),
            Project.aggregate([
                { $group: { _id: { review: { $ifNull: ["$reviewStatus", "PENDING_REVIEW"] }, status: "$status" }, count: { $sum: 1 }, budget: { $sum: "$budget" }, raised: { $sum: "$raised" } } },
            ]),
            Project.aggregate([
                { $unwind: "$fundingParts" },
                {
                    $group: {
                        _id: { $cond: [{ $ifNull: ["$fundingParts.receivedAt", false] }, "RECEIVED", { $cond: [{ $ifNull: ["$fundingParts.payment", false] }, "PAYMENT_SUBMITTED", "AWAITING_PAYMENT"] }] },
                        count: { $sum: 1 },
                        amount: { $sum: "$fundingParts.amount" },
                    },
                },
            ]),
            FundingPayment.aggregate([{ $group: { _id: { channel: { $ifNull: ["$channel", "DIRECT"] }, status: "$status" }, count: { $sum: 1 }, amount: { $sum: "$amount" } } }]),
            Donation.aggregate([{ $group: { _id: { status: "$status", mode: "$mode" }, count: { $sum: 1 }, amount: { $sum: "$amount" } } }]),
            User.aggregate([{ $match: { accountStatus: "pending" } }, { $group: { _id: "$role", count: { $sum: 1 }, oldest: { $min: "$createdAt" } } }]),
            Project.aggregate([{ $match: PENDING_REVIEW_FILTER }, { $group: { _id: null, count: { $sum: 1 }, oldest: { $min: { $ifNull: ["$submittedAt", "$createdAt"] } } } }]),
            SchoolProfile.aggregate([{ $match: { "paymentQr.status": "PENDING" } }, { $group: { _id: null, count: { $sum: 1 }, oldest: { $min: "$paymentQr.submittedAt" } } }]),
            FundingPayment.aggregate([{ $match: { status: "SUBMITTED" } }, { $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$amount" }, oldest: { $min: "$submittedAt" } } }]),
            AlumniNotification.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
            ActivityEvent.aggregate([{ $match: { at: { $gte: new Date(now - DAY) }, source: "live" } }, { $group: { _id: "$result", count: { $sum: 1 } } }]),
            ActivityEvent.countDocuments({ action: "auth.sign_in_failed", at: { $gte: new Date(now - DAY) } }),
            ActivityEvent.findOne({ source: "live" }).sort({ at: 1 }).select("at").lean(),
            ActivityEvent.findOne({ key: HISTORY_MARKER_KEY }).select("at details").lean(),
        ]);

    // School events: by review state, the review queue, and the offers of help made so far.
    const [eventCounts, pendingEvents, eventOffers] = await Promise.all([
        SchoolEvent.aggregate([{ $group: { _id: "$reviewStatus", count: { $sum: 1 } } }]),
        SchoolEvent.aggregate([{ $match: { reviewStatus: "PENDING_REVIEW" } }, { $group: { _id: null, count: { $sum: 1 }, oldest: { $min: "$submittedAt" } } }]),
        SchoolEvent.aggregate([{ $unwind: "$offers" }, { $group: { _id: "$offers.status", count: { $sum: 1 } } }]),
    ]);
    const eventCount = (status) => eventCounts.find((r) => r._id === status)?.count || 0;
    const offerCount = (status) => eventOffers.find((r) => r._id === status)?.count || 0;

    const byRole = {};
    for (const { _id, count } of accounts) {
        byRole[_id.role] ||= { pending: 0, active: 0, rejected: 0, total: 0 };
        byRole[_id.role][_id.status] = count;
        byRole[_id.role].total += count;
    }

    const projectStats = { total: 0, pendingReview: 0, rejected: 0, approved: 0, byStatus: { Open: 0, "In Progress": 0, "On Hold": 0, Completed: 0 }, approvedBudget: 0, raised: 0 };
    for (const { _id, count, budget, raised } of projects) {
        projectStats.total += count;
        projectStats.raised += raised;
        if (_id.review === "OPEN") {
            projectStats.approved += count;
            projectStats.approvedBudget += budget;
            projectStats.byStatus[_id.status] = (projectStats.byStatus[_id.status] || 0) + count;
        } else if (_id.review === "REJECTED") projectStats.rejected += count;
        else projectStats.pendingReview += count;
    }

    const partsByStatus = groupCounts(parts);
    const pay = (channel, status) => payments.find((p) => p._id.channel === channel && p._id.status === status) || { count: 0, amount: 0 };
    const ngoPayments = {
        direct: Object.fromEntries(["SUBMITTED", "ACCEPTED", "REJECTED"].map((s) => [s, { count: pay("DIRECT", s).count, amount: pay("DIRECT", s).amount }])),
        online: Object.fromEntries(["CREATED", "ACCEPTED", "REFUND_DUE"].map((s) => [s, { count: pay("ONLINE", s).count, amount: pay("ONLINE", s).amount }])),
    };
    const don = (status, mode) => donations.filter((d) => d._id.status === status && (!mode || d._id.mode === mode));
    const donationStats = Object.fromEntries(
        ["PAID", "CREATED"].map((status) => [
            status,
            {
                count: don(status).reduce((s, r) => s + r.count, 0),
                amount: don(status).reduce((s, r) => s + r.amount, 0),
                test: { count: don(status, "test").reduce((s, r) => s + r.count, 0), amount: don(status, "test").reduce((s, r) => s + r.amount, 0) },
                live: { count: don(status, "live").reduce((s, r) => s + r.count, 0), amount: don(status, "live").reduce((s, r) => s + r.amount, 0) },
            },
        ])
    );

    // What "raised" should add up to across all projects, from the authoritative records.
    const confirmedNgo = ngoPayments.direct.ACCEPTED.amount + ngoPayments.online.ACCEPTED.amount;
    const confirmedDonations = donationStats.PAID.amount;
    const pendingByRole = Object.fromEntries(pendingAccounts.map((r) => [r._id, { count: r.count, oldest: r.oldest }]));
    const queue = (rows) => ({ count: rows[0]?.count || 0, oldest: rows[0]?.oldest || null, ...(rows[0]?.amount !== undefined ? { amount: rows[0].amount } : {}) });

    return {
        generatedAt: new Date().toISOString(),
        accounts: { school: byRole.school, ngo: byRole.ngo, donor: byRole.donor, admin: byRole.admin },
        projects: projectStats,
        commitments: {
            awaitingPayment: partsByStatus.AWAITING_PAYMENT || { count: 0, amount: 0 },
            paymentSubmitted: partsByStatus.PAYMENT_SUBMITTED || { count: 0, amount: 0 },
            received: partsByStatus.RECEIVED || { count: 0, amount: 0 },
        },
        ngoPayments,
        donations: donationStats,
        // Offers of help are promises, never money.
        events: {
            total: eventCounts.reduce((sum, r) => sum + r.count, 0),
            pendingReview: eventCount("PENDING_REVIEW"),
            approved: eventCount("OPEN"),
            rejected: eventCount("REJECTED"),
            offers: { waiting: offerCount("OFFERED"), accepted: offerCount("ACCEPTED"), declined: offerCount("DECLINED") },
        },
        funding: {
            raisedOnProjects: projectStats.raised,
            confirmedNgoPayments: confirmedNgo,
            confirmedDonations,
            // Positive or negative: "raised" doesn't match the confirmed records (see the checks for which projects).
            difference: projectStats.raised - confirmedNgo - confirmedDonations,
        },
        queues: {
            accounts: { count: pendingAccounts.reduce((s, r) => s + r.count, 0), byRole: pendingByRole, oldest: pendingAccounts.reduce((o, r) => (!o || r.oldest < o ? r.oldest : o), null) },
            projects: queue(pendingProjects),
            events: queue(pendingEvents),
            paymentQrs: queue(pendingQrs),
            // Checked by the schools, not by admins: shown so admins can see payments waiting too long.
            schoolPaymentChecks: queue(paymentsToCheck),
        },
        alumniEmails: Object.fromEntries(["PENDING", "SENDING", "SENT", "FAILED"].map((s) => [s, alumniEmails.find((r) => r._id === s)?.count || 0])),
        activity: {
            last24h: { total: activity.reduce((s, r) => s + r.count, 0), failures: activity.find((r) => r._id === "failure")?.count || 0, failedSignIns },
            liveSince: liveSince?.at || marker?.at || null,
            historyImportedAt: marker?.at || null,
            historyImported: marker?.details?.imported ?? null,
        },
    };
};

// ─── Checks: inconsistencies and things worth a look ─────────────────────────
const check = (key, title, description, severity, source, count, items) => ({ key, title, description, severity, source, count, items, truncated: count > items.length });

/**
 * Each check counts the matching records and returns a few examples. Severity: "critical" means the money
 * figures disagree with the records; "warning" needs a look; "info" is for awareness only.
 */
export const getChecks = async () => {
    const now = Date.now();
    const staleBefore = new Date(now - STALE_AFTER_DAYS * DAY);
    const projectsColl = Project.collection.name;
    const paymentsColl = FundingPayment.collection.name;
    const donationsColl = Donation.collection.name;

    const [mismatch, uncounted, partsWithoutPayment, paymentsWithoutParts, overfunded, refundDue, stalePayments, staleAccounts, duplicateRefs, repeatedRejections, failedSignIns, verificationFailures, abandonedDonations, abandonedOnline, failedEmails] =
        await Promise.all([
            // 1. "raised" must equal accepted NGO payments plus the verified donations counted on the project.
            Project.aggregate([
                { $project: { title: 1, school: 1, budget: 1, raised: 1, countedDonations: { $ifNull: ["$countedDonations", []] } } },
                { $lookup: { from: paymentsColl, let: { p: "$_id" }, pipeline: [{ $match: { $expr: { $eq: ["$project", "$$p"] }, status: "ACCEPTED" } }, { $group: { _id: null, sum: { $sum: "$amount" } } }], as: "accepted" } },
                { $lookup: { from: donationsColl, let: { counted: "$countedDonations" }, pipeline: [{ $match: { $expr: { $in: ["$_id", "$$counted"] }, status: "PAID" } }, { $group: { _id: null, sum: { $sum: "$amount" } } }], as: "donated" } },
                { $addFields: { ngo: { $ifNull: [{ $arrayElemAt: ["$accepted.sum", 0] }, 0] }, donors: { $ifNull: [{ $arrayElemAt: ["$donated.sum", 0] }, 0] } } },
                { $addFields: { expected: { $add: ["$ngo", "$donors"] } } },
                { $match: { $expr: { $ne: ["$raised", "$expected"] } } },
                { $project: { title: 1, school: 1, raised: 1, expected: 1, ngo: 1, donors: 1 } },
            ]),
            // 2. Verified donations not yet counted in their project's "raised" (normally fixed by a retry).
            Donation.aggregate([
                { $match: { status: "PAID" } },
                { $lookup: { from: projectsColl, let: { d: "$_id", p: "$project" }, pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$p"] }, { $in: ["$$d", { $ifNull: ["$countedDonations", []] }] }] } } }, { $project: { _id: 1 } }], as: "counted" } },
                { $match: { counted: { $size: 0 } } },
                { $project: { donor: 1, project: 1, amount: 1, verifiedAt: 1 } },
            ]),
            // 3. Parts marked received without an accepted payment behind them.
            Project.aggregate([
                { $unwind: "$fundingParts" },
                { $match: { "fundingParts.receivedAt": { $ne: null } } },
                { $lookup: { from: paymentsColl, localField: "fundingParts.payment", foreignField: "_id", as: "payment" } },
                { $match: { $or: [{ payment: { $size: 0 } }, { "payment.status": { $ne: "ACCEPTED" } }] } },
                { $project: { title: 1, school: 1, part: "$fundingParts.part", ngo: "$fundingParts.ngo", amount: "$fundingParts.amount" } },
            ]),
            // 4. Accepted payments whose parts aren't all marked received.
            FundingPayment.aggregate([
                { $match: { status: "ACCEPTED" } },
                { $lookup: { from: projectsColl, localField: "project", foreignField: "_id", as: "proj" } },
                {
                    $addFields: {
                        receivedParts: {
                            $size: {
                                $filter: {
                                    input: { $ifNull: [{ $arrayElemAt: ["$proj.fundingParts", 0] }, []] },
                                    as: "f",
                                    cond: { $and: [{ $eq: ["$$f.payment", "$_id"] }, { $ne: [{ $ifNull: ["$$f.receivedAt", null] }, null] }] },
                                },
                            },
                        },
                    },
                },
                { $match: { $expr: { $ne: ["$receivedParts", { $size: "$parts" }] } } },
                { $project: { project: 1, ngo: 1, school: 1, amount: 1, parts: 1, receivedParts: 1, channel: 1 } },
            ]),
            // 5. More raised than the budget.
            Project.find({ $expr: { $gt: ["$raised", "$budget"] } }).select("title school budget raised").limit(CHECK_EXAMPLES).lean(),
            // 6. Online NGO payments received for parts already paid: VIDYADAAN owes a refund.
            FundingPayment.find({ status: "REFUND_DUE" }).select("project ngo amount reviewedAt razorpayPaymentId").sort({ reviewedAt: 1 }).lean(),
            // 7. Direct NGO payments the school hasn't checked for a week.
            FundingPayment.find({ status: "SUBMITTED", submittedAt: { $lt: staleBefore } }).select("project school ngo amount submittedAt").sort({ submittedAt: 1 }).lean(),
            // 8. Registrations waiting a week for an admin.
            User.find({ accountStatus: "pending", createdAt: { $lt: staleBefore } }).select("role createdAt").sort({ createdAt: 1 }).lean(),
            // 9. The same transaction reference recorded by different NGOs (each NGO can't reuse its own).
            FundingPayment.aggregate([
                { $match: { channel: { $ne: "ONLINE" }, status: { $ne: "REJECTED" } } },
                { $group: { _id: "$reference", ngos: { $addToSet: "$ngo" }, count: { $sum: 1 }, amount: { $sum: "$amount" } } },
                { $match: { "ngos.1": { $exists: true } } },
            ]),
            // 10. NGOs whose payments schools have rejected three or more times.
            FundingPayment.aggregate([{ $match: { status: "REJECTED" } }, { $group: { _id: "$ngo", count: { $sum: 1 }, last: { $max: "$reviewedAt" } } }, { $match: { count: { $gte: 3 } } }, { $sort: { count: -1 } }]),
            // 11. Accounts with five or more failed sign-ins in a day (recorded since the log started).
            ActivityEvent.aggregate([
                { $match: { action: "auth.sign_in_failed", at: { $gte: new Date(now - DAY) }, "actor.id": { $ne: null } } },
                { $group: { _id: "$actor.id", count: { $sum: 1 }, role: { $first: "$actor.role" }, last: { $max: "$at" } } },
                { $match: { count: { $gte: 5 } } },
                { $sort: { count: -1 } },
            ]),
            // 12. Payments or donations whose Razorpay signature didn't verify, in the last week.
            ActivityEvent.find({ action: { $in: ["payment.verification_failed", "donation.verification_failed"] }, at: { $gte: new Date(now - 7 * DAY) } })
                .select("at action actor target")
                .sort({ at: -1 })
                .lean(),
            // 13–14. Payments started but never completed (a day or more ago): usually the payer closed Razorpay.
            Donation.countDocuments({ status: "CREATED", createdAt: { $lt: new Date(now - DAY) } }),
            FundingPayment.countDocuments({ status: "CREATED", submittedAt: { $lt: new Date(now - DAY) } }),
            // 15. Alumni emails that couldn't be sent.
            AlumniNotification.countDocuments({ status: "FAILED" }),
        ]);

    const names = await accountNames([
        ...mismatch.map((p) => p.school),
        ...uncounted.map((d) => d.donor),
        ...partsWithoutPayment.flatMap((p) => [p.school, p.ngo]),
        ...paymentsWithoutParts.map((p) => p.ngo),
        ...overfunded.map((p) => p.school),
        ...refundDue.map((p) => p.ngo),
        ...stalePayments.flatMap((p) => [p.school, p.ngo]),
        ...duplicateRefs.flatMap((d) => d.ngos),
        ...repeatedRejections.map((r) => r._id),
        ...failedSignIns.map((f) => f._id),
        ...verificationFailures.map((v) => v.actor?.id),
    ]);
    const titles = new Map(
        (await Project.find({ _id: { $in: ids([...uncounted.map((d) => d.project), ...paymentsWithoutParts.map((p) => p.project), ...refundDue.map((p) => p.project), ...stalePayments.map((p) => p.project)]) } }).select("title").lean())
            .map((p) => [id(p._id), p.title])
    );
    const take = (rows, map) => rows.slice(0, CHECK_EXAMPLES).map(map);

    return {
        generatedAt: new Date().toISOString(),
        staleAfterDays: STALE_AFTER_DAYS,
        checks: [
            check("raised-mismatch", "Raised doesn't match the records", "The project's “raised” isn't the sum of its accepted NGO payments and its counted, verified donations.", "critical", "records", mismatch.length,
                take(mismatch, (p) => ({ projectId: id(p._id), title: p.title, school: nameOf(names, p.school), raised: p.raised, expected: p.expected, ngoPayments: p.ngo, donations: p.donors }))),
            check("donation-not-counted", "Verified donations not counted in raised", "Razorpay verified these donations, but they aren't counted on their project yet. Normally a repeat verification fixes this.", "critical", "records", uncounted.length,
                take(uncounted, (d) => ({ donationId: id(d._id), donor: nameOf(names, d.donor), project: titles.get(id(d.project)) || null, amount: d.amount, verifiedAt: d.verifiedAt }))),
            check("received-without-payment", "Parts received without an accepted payment", "A funding part is marked received, but no accepted payment covers it.", "critical", "records", partsWithoutPayment.length,
                take(partsWithoutPayment, (p) => ({ projectId: id(p._id), title: p.title, part: p.part, ngo: nameOf(names, p.ngo), amount: p.amount }))),
            check("payment-parts-not-received", "Accepted payments with parts not received", "The payment was accepted, but some of its parts aren't marked received.", "critical", "records", paymentsWithoutParts.length,
                take(paymentsWithoutParts, (p) => ({ paymentId: id(p._id), project: titles.get(id(p.project)) || null, ngo: nameOf(names, p.ngo), amount: p.amount, parts: p.parts, receivedParts: p.receivedParts, channel: p.channel || "DIRECT" }))),
            check("overfunded", "More raised than the budget", "The project's raised amount is above its budget.", "critical", "records", overfunded.length,
                take(overfunded, (p) => ({ projectId: id(p._id), title: p.title, school: nameOf(names, p.school), budget: p.budget, raised: p.raised }))),
            check("refund-due", "Online NGO payments to refund", "Razorpay took these payments, but their parts had already been paid another way, so they weren't counted. VIDYADAAN owes a refund.", "warning", "records", refundDue.length,
                take(refundDue, (p) => ({ paymentId: id(p._id), ngo: nameOf(names, p.ngo), project: titles.get(id(p.project)) || null, amount: p.amount, razorpayPaymentId: p.razorpayPaymentId, since: p.reviewedAt }))),
            check("stale-school-checks", `Direct payments unchecked for over ${STALE_AFTER_DAYS} days`, "NGOs sent proof, but the school hasn't accepted or rejected the payment.", "warning", "records", stalePayments.length,
                take(stalePayments, (p) => ({ paymentId: id(p._id), school: nameOf(names, p.school), ngo: nameOf(names, p.ngo), project: titles.get(id(p.project)) || null, amount: p.amount, submittedAt: p.submittedAt }))),
            check("stale-registrations", `Registrations waiting over ${STALE_AFTER_DAYS} days`, "These accounts are still waiting for an admin's decision.", "warning", "records", staleAccounts.length,
                take(staleAccounts, (u) => ({ accountId: id(u._id), role: u.role, registeredAt: u.createdAt }))),
            check("shared-reference", "Same transaction reference from different NGOs", "Different NGOs recorded direct payments with the same reference. It may be a coincidence or a copied receipt.", "warning", "records", duplicateRefs.length,
                take(duplicateRefs, (d) => ({ reference: maskReference(d._id), ngos: d.ngos.map((n) => nameOf(names, n)), payments: d.count, amount: d.amount }))),
            check("repeated-rejections", "NGOs with 3 or more rejected payments", "Schools rejected several payments from these NGOs (money not received, or wrong proof).", "warning", "records", repeatedRejections.length,
                take(repeatedRejections, (r) => ({ ngoId: id(r._id), ngo: nameOf(names, r._id), rejected: r.count, last: r.last }))),
            check("failed-sign-ins", "Accounts with 5+ failed sign-ins in 24 hours", "Repeated wrong passwords on one account. Recorded only since the activity log started.", "warning", "activity log", failedSignIns.length,
                take(failedSignIns, (f) => ({ accountId: id(f._id), account: nameOf(names, f._id), role: f.role, failures: f.count, last: f.last }))),
            check("verification-failures", "Payments that failed Razorpay verification (7 days)", "A payment's signature didn't match, so nothing was recorded. Recorded only since the activity log started.", "warning", "activity log", verificationFailures.length,
                take(verificationFailures, (v) => ({ eventId: id(v._id), at: v.at, action: activityLabel(v.action), by: nameOf(names, v.actor?.id), record: v.target?.label || null }))),
            check("abandoned-payments", "Payments started but not completed", "Razorpay orders created a day or more ago that were never paid (usually the payer closed the window). Nothing was counted.", "info", "records", abandonedDonations + abandonedOnline,
                [{ donations: abandonedDonations, ngoOnlinePayments: abandonedOnline }]),
            check("alumni-email-failures", "Alumni emails that failed", "Project-approval emails to alumni that couldn't be sent.", "info", "records", failedEmails, []),
        ],
    };
};

// ─── Lists ───────────────────────────────────────────────────────────────────
const byId = (rows, key = "_id") => new Map(rows.map((r) => [id(r[key]), r]));

export const listSchools = async ({ q, status, paging }) => {
    const filter = { role: "school", ...(status ? { accountStatus: status } : {}) };
    if (q) filter._id = { $in: await accountsMatching(q, "school") };
    const { total, rows } = await page(User, filter, paging, { sort: { createdAt: -1, _id: -1 }, select: "name accountStatus createdAt statusChangedAt" });
    const list = rows.map((u) => u._id);
    const [profiles, projects, toCheck, alumni] = await Promise.all([
        SchoolProfile.find({ userId: { $in: list } }).select("userId schoolName district state paymentQr.status mapLocation.setAt").lean(),
        Project.aggregate([
            { $match: { school: { $in: list } } },
            {
                $group: {
                    _id: "$school",
                    total: { $sum: 1 },
                    approved: { $sum: { $cond: [{ $eq: ["$reviewStatus", "OPEN"] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ["$reviewStatus", "REJECTED"] }, 1, 0] } },
                    budget: { $sum: { $cond: [{ $eq: ["$reviewStatus", "OPEN"] }, "$budget", 0] } },
                    raised: { $sum: "$raised" },
                },
            },
        ]),
        FundingPayment.aggregate([{ $match: { school: { $in: list }, status: "SUBMITTED" } }, { $group: { _id: "$school", count: { $sum: 1 } } }]),
        Alumni.aggregate([{ $match: { school: { $in: list }, status: "ACTIVE" } }, { $group: { _id: "$school", count: { $sum: 1 } } }]),
    ]);
    const p = byId(profiles, "userId");
    const pr = byId(projects);
    const tc = byId(toCheck);
    const al = byId(alumni);
    const items = rows.map((u) => {
        const profile = p.get(id(u._id)) || {};
        const stats = pr.get(id(u._id)) || { total: 0, approved: 0, rejected: 0, budget: 0, raised: 0 };
        return {
            id: id(u._id),
            name: profile.schoolName || u.name,
            district: profile.district || "",
            state: profile.state || "",
            accountStatus: u.accountStatus,
            registeredAt: u.createdAt,
            decidedAt: u.statusChangedAt || null,
            projects: { total: stats.total, approved: stats.approved, rejected: stats.rejected, pendingReview: stats.total - stats.approved - stats.rejected },
            approvedBudget: stats.budget,
            raised: stats.raised,
            paymentsToCheck: tc.get(id(u._id))?.count || 0,
            qrStatus: profile.paymentQr?.status || null,
            hasMapLocation: Boolean(profile.mapLocation?.setAt),
            activeAlumni: al.get(id(u._id))?.count || 0,
        };
    });
    return pageResult(items, total, paging);
};

export const listNgos = async ({ q, status, paging }) => {
    const filter = { role: "ngo", ...(status ? { accountStatus: status } : {}) };
    if (q) filter._id = { $in: await accountsMatching(q, "ngo") };
    const { total, rows } = await page(User, filter, paging, { sort: { createdAt: -1, _id: -1 }, select: "name accountStatus createdAt statusChangedAt" });
    const list = rows.map((u) => u._id);
    const [profiles, commitments, payments, volunteers] = await Promise.all([
        NGOProfile.find({ userId: { $in: list } }).select("userId ngoName district state").lean(),
        Project.aggregate([
            // Only projects these NGOs hold parts of (uses the fundingParts.ngo index), then their parts.
            { $match: { "fundingParts.ngo": { $in: list } } },
            { $unwind: "$fundingParts" },
            { $match: { "fundingParts.ngo": { $in: list } } },
            {
                $group: {
                    _id: "$fundingParts.ngo",
                    parts: { $sum: 1 },
                    projects: { $addToSet: "$_id" },
                    committed: { $sum: "$fundingParts.amount" },
                    received: { $sum: { $cond: [{ $ifNull: ["$fundingParts.receivedAt", false] }, "$fundingParts.amount", 0] } },
                },
            },
        ]),
        FundingPayment.aggregate([{ $match: { ngo: { $in: list } } }, { $group: { _id: { ngo: "$ngo", status: "$status" }, count: { $sum: 1 }, amount: { $sum: "$amount" } } }]),
        Volunteer.aggregate([{ $match: { ngo: { $in: list } } }, { $group: { _id: "$ngo", count: { $sum: 1 } } }]),
    ]);
    const p = byId(profiles, "userId");
    const c = byId(commitments);
    const v = byId(volunteers);
    const items = rows.map((u) => {
        const mine = payments.filter((r) => id(r._id.ngo) === id(u._id));
        const of = (status) => {
            const row = mine.find((r) => r._id.status === status);
            return { count: row?.count || 0, amount: row?.amount || 0 };
        };
        const commit = c.get(id(u._id)) || { parts: 0, projects: [], committed: 0, received: 0 };
        return {
            id: id(u._id),
            name: p.get(id(u._id))?.ngoName || u.name,
            district: p.get(id(u._id))?.district || "",
            state: p.get(id(u._id))?.state || "",
            accountStatus: u.accountStatus,
            registeredAt: u.createdAt,
            decidedAt: u.statusChangedAt || null,
            commitments: { projects: commit.projects.length, parts: commit.parts, amount: commit.committed, received: commit.received },
            payments: {
                waitingForSchool: of("SUBMITTED"),
                accepted: of("ACCEPTED"),
                rejected: of("REJECTED"),
                refundDue: of("REFUND_DUE"),
                unpaidOnlineOrders: of("CREATED").count,
            },
            volunteers: v.get(id(u._id))?.count || 0,
        };
    });
    return pageResult(items, total, paging);
};

export const listDonors = async ({ q, status, paging }) => {
    const filter = { role: "donor", ...(status ? { accountStatus: status } : {}) };
    if (q) filter._id = { $in: await accountsMatching(q, "donor") };
    const { total, rows } = await page(User, filter, paging, { sort: { createdAt: -1, _id: -1 }, select: "name accountStatus createdAt statusChangedAt" });
    const list = rows.map((u) => u._id);
    const [profiles, donations] = await Promise.all([
        DonorProfile.find({ userId: { $in: list } }).select("userId city state").lean(),
        Donation.aggregate([{ $match: { donor: { $in: list } } }, { $group: { _id: { donor: "$donor", status: "$status", mode: "$mode" }, count: { $sum: 1 }, amount: { $sum: "$amount" }, last: { $max: "$verifiedAt" } } }]),
    ]);
    const p = byId(profiles, "userId");
    const items = rows.map((u) => {
        const mine = donations.filter((r) => id(r._id.donor) === id(u._id));
        const paid = mine.filter((r) => r._id.status === "PAID");
        return {
            id: id(u._id),
            name: u.name,
            city: p.get(id(u._id))?.city || "",
            state: p.get(id(u._id))?.state || "",
            accountStatus: u.accountStatus,
            registeredAt: u.createdAt,
            decidedAt: u.statusChangedAt || null,
            donations: {
                verified: paid.reduce((s, r) => s + r.count, 0),
                verifiedAmount: paid.reduce((s, r) => s + r.amount, 0),
                testMode: paid.filter((r) => r._id.mode === "test").reduce((s, r) => s + r.count, 0),
                notCompleted: mine.filter((r) => r._id.status === "CREATED").reduce((s, r) => s + r.count, 0),
                lastVerifiedAt: paid.reduce((last, r) => (r.last && (!last || r.last > last) ? r.last : last), null),
            },
        };
    });
    return pageResult(items, total, paging);
};

export const listProjects = async ({ q, review, status, paging }) => {
    const filter = {};
    if (review === "PENDING_REVIEW") Object.assign(filter, PENDING_REVIEW_FILTER);
    else if (review) filter.reviewStatus = review;
    if (status) filter.status = status;
    if (q) {
        const schools = await accountsMatching(q, "school");
        filter.$and = [{ $or: [{ title: containsRegex(q) }, { school: { $in: schools } }] }];
    }
    const { total, rows } = await page(Project, filter, paging, {
        sort: { createdAt: -1, _id: -1 },
        select: "title category priority school budget raised status reviewStatus submittedAt reviewedAt createdAt fundingParts +countedDonations",
    });
    const list = rows.map((r) => r._id);
    const [accepted, donations, names] = await Promise.all([
        FundingPayment.aggregate([{ $match: { project: { $in: list }, status: "ACCEPTED" } }, { $group: { _id: "$project", amount: { $sum: "$amount" } } }]),
        Donation.find({ project: { $in: list }, status: "PAID" }).select("project amount").lean(),
        accountNames(rows.map((r) => r.school)),
    ]);
    const acc = byId(accepted);
    const items = rows.map((p) => {
        const counted = new Set((p.countedDonations || []).map(String));
        const mine = donations.filter((d) => id(d.project) === id(p._id));
        const countedDonations = sumBy(mine, (d) => counted.has(id(d._id)));
        const ngoPayments = acc.get(id(p._id))?.amount || 0;
        const parts = p.fundingParts || [];
        return {
            id: id(p._id),
            title: p.title,
            category: p.category,
            priority: p.priority,
            school: { id: id(p.school), name: nameOf(names, p.school), district: names.get(id(p.school))?.district || "" },
            reviewStatus: p.reviewStatus || "PENDING_REVIEW",
            status: p.status,
            budget: p.budget,
            raised: p.raised,
            committed: parts.reduce((s, f) => s + f.amount, 0),
            partsTaken: parts.length,
            partsReceived: parts.filter((f) => f.receivedAt).length,
            confirmed: { ngoPayments, donations: countedDonations, verifiedDonationsNotCounted: sumBy(mine, (d) => !counted.has(id(d._id))) },
            // The same rule as the "raised doesn't match" check.
            consistent: p.raised === ngoPayments + countedDonations,
            submittedAt: p.submittedAt || p.createdAt,
            reviewedAt: p.reviewedAt || null,
        };
    });
    return pageResult(items, total, paging);
};

export const listNgoPayments = async ({ q, channel, status, from, to, paging }) => {
    const filter = {};
    if (channel === "DIRECT") filter.channel = { $ne: "ONLINE" };
    else if (channel === "ONLINE") filter.channel = "ONLINE";
    if (status) filter.status = status;
    const when = dateFilter(from, to);
    if (when) filter.submittedAt = when;
    if (q) {
        const [accountsFound, projects] = await Promise.all([accountsMatching(q), Project.find({ title: containsRegex(q) }).select("_id").limit(1000).lean()]);
        filter.$or = [{ ngo: { $in: accountsFound } }, { school: { $in: accountsFound } }, { project: { $in: projects.map((p) => p._id) } }];
    }
    const { total, rows } = await page(FundingPayment, filter, paging, {
        sort: { submittedAt: -1, _id: -1 },
        select: "project school ngo parts amount channel method reference status submittedAt reviewedAt rejectionReason mode proof orderId razorpayPaymentId paidOn",
    });
    const [names, projects] = await Promise.all([
        accountNames(rows.flatMap((r) => [r.school, r.ngo])),
        Project.find({ _id: { $in: rows.map((r) => r.project) } }).select("title").lean(),
    ]);
    const titles = byId(projects);
    const items = rows.map((r) => ({
        id: id(r._id),
        project: { id: id(r.project), title: titles.get(id(r.project))?.title || null },
        school: { id: id(r.school), name: nameOf(names, r.school) },
        ngo: { id: id(r.ngo), name: nameOf(names, r.ngo) },
        parts: r.parts,
        amount: r.amount,
        channel: r.channel || "DIRECT",
        method: r.method,
        // Direct: the bank reference, masked. Online: Razorpay's own order and payment IDs.
        reference: r.channel === "ONLINE" ? null : maskReference(r.reference),
        orderId: r.channel === "ONLINE" ? r.orderId || null : null,
        razorpayPaymentId: r.channel === "ONLINE" ? r.razorpayPaymentId || null : null,
        mode: r.mode || null,
        status: r.status,
        // Only ACCEPTED counts towards "raised"; the others are shown for monitoring.
        counted: r.status === "ACCEPTED",
        hasProof: Boolean(r.proof),
        paidOn: r.paidOn,
        submittedAt: r.submittedAt,
        reviewedAt: r.reviewedAt || null,
        rejectionReason: r.rejectionReason || null,
    }));
    return pageResult(items, total, paging);
};

export const listDonations = async ({ q, status, mode, from, to, paging }) => {
    const filter = {};
    if (status) filter.status = status;
    if (mode) filter.mode = mode;
    const when = dateFilter(from, to);
    if (when) filter.createdAt = when;
    if (q) {
        const [accountsFound, projects] = await Promise.all([accountsMatching(q, "donor"), Project.find({ title: containsRegex(q) }).select("_id").limit(1000).lean()]);
        filter.$or = [{ donor: { $in: accountsFound } }, { project: { $in: projects.map((p) => p._id) } }, { orderId: q }, { paymentId: q }];
    }
    const { total, rows } = await page(Donation, filter, paging, { sort: { createdAt: -1, _id: -1 }, select: "donor project school amount status mode orderId paymentId createdAt verifiedAt" });
    const [names, projects] = await Promise.all([
        accountNames(rows.flatMap((r) => [r.donor, r.school])),
        Project.find({ _id: { $in: rows.map((r) => r.project) } }).select("title +countedDonations").lean(),
    ]);
    const proj = byId(projects);
    const items = rows.map((r) => {
        const counted = (proj.get(id(r.project))?.countedDonations || []).some((d) => id(d) === id(r._id));
        return {
            id: id(r._id),
            donor: { id: id(r.donor), name: nameOf(names, r.donor) },
            project: { id: id(r.project), title: proj.get(id(r.project))?.title || null },
            school: { id: id(r.school), name: nameOf(names, r.school) },
            amount: r.amount,
            status: r.status,
            mode: r.mode,
            orderId: r.orderId,
            paymentId: r.paymentId || null,
            // A verified donation counts once it is in its project's "raised"; CREATED never counts.
            countedInRaised: counted,
            createdAt: r.createdAt,
            verifiedAt: r.verifiedAt || null,
        };
    });
    return pageResult(items, total, paging);
};

// ─── Activity ────────────────────────────────────────────────────────────────
const eventToClient = (e, names) => ({
    id: id(e._id),
    at: e.at,
    action: e.action,
    label: activityLabel(e.action),
    category: e.category,
    result: e.result,
    source: e.source,
    actor: { id: id(e.actor?.id), role: e.actor?.role, name: (e.actor?.id && names.get(id(e.actor.id))?.name) || e.actor?.name || (e.actor?.role === "visitor" ? "Unknown visitor" : e.actor?.role === "system" ? "VIDYADAAN" : "Not recorded") },
    target: {
        type: e.target?.type || "",
        id: id(e.target?.id),
        // Accounts and QRs show the account's current name (a school's or NGO's name, not the person's).
        label: (["account", "qr", "profile"].includes(e.target?.type) && e.target?.id && names.get(id(e.target.id))?.name) || e.target?.label || "",
    },
    details: e.details || {},
});

export const listActivity = async ({ q, role, category, result, source, actorId, targetId, from, to, paging }) => {
    const filter = {};
    if (role) filter["actor.role"] = role;
    if (category) filter.category = category;
    if (result) filter.result = result;
    if (source) filter.source = source;
    if (actorId) filter["actor.id"] = new mongoose.Types.ObjectId(actorId);
    if (targetId) filter["target.id"] = new mongoose.Types.ObjectId(targetId);
    const when = dateFilter(from, to);
    if (when) filter.at = when;
    if (q) {
        const rx = containsRegex(q);
        const accountsFound = await accountsMatching(q);
        filter.$or = [{ "target.label": rx }, { "actor.name": rx }, { action: rx }, { "actor.id": { $in: accountsFound } }, { "target.id": { $in: accountsFound } }];
    }
    const { total, rows } = await page(ActivityEvent, filter, paging, { sort: { at: -1, _id: -1 }, select: "-key" });
    const names = await accountNames(rows.flatMap((e) => [e.actor?.id, ["account", "qr", "profile"].includes(e.target?.type) ? e.target.id : null]));
    return pageResult(rows.map((e) => eventToClient(e, names)), total, paging);
};

export const getActivityEvent = async (eventId) => {
    const e = await ActivityEvent.findById(eventId).select("-key").lean();
    if (!e) return null;
    const names = await accountNames([e.actor?.id, e.target?.id, e.details?.schoolId, e.details?.ngoId]);
    const event = eventToClient(e, names);
    // Names for the ids a detail may mention.
    for (const key of ["schoolId", "ngoId"]) {
        if (e.details?.[key]) event.details[key.replace("Id", "")] = nameOf(names, e.details[key]);
    }
    return event;
};
