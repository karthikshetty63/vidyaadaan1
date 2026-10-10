// Fills the activity log with what VIDYADAAN's records already show about the past, once, when the log is
// first introduced. Nothing is invented: every event comes from a date stored on a real record (when an
// account registered and was approved, a project was submitted and reviewed, a part was committed, a
// payment was recorded and decided, a donation was started and verified, a QR was saved and reviewed).
//
// These events are marked source "records". They show each record's LATEST state only: a project that
// was rejected and then resubmitted shows only its latest submission, a withdrawn commitment leaves no
// trace, and sign-ins before the log existed were never recorded anywhere. From the import onwards the
// live log records everything as it happens.
import ActivityEvent from "../models/ActivityEvent.js";
import Donation from "../models/Donation.js";
import FundingPayment from "../models/FundingPayment.js";
import Project from "../models/Project.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";
import { ACTIVITY_ACTIONS } from "../../shared/activityRules.js";
import { cleanDetails, maskReference } from "./activityLog.js";

export const HISTORY_MARKER_KEY = "system.history_imported";
const BATCH = 500;

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const time = (d) => new Date(d).getTime();

/**
 * Imports the history once. Safe to call on every start: it does nothing after the first import, and
 * every event has a unique key, so even two servers starting together can't duplicate an event.
 * @returns {Promise<{ imported: number, skipped: boolean, cutoff?: Date }>}
 */
export const importActivityHistory = async ({ now = new Date() } = {}) => {
    if (await ActivityEvent.exists({ key: HISTORY_MARKER_KEY })) return { imported: 0, skipped: true };

    // Everything from this moment on is recorded live, so history stops here.
    const cutoff = now;
    let ops = [];
    let imported = 0;
    const flush = async () => {
        if (!ops.length) return;
        const result = await ActivityEvent.bulkWrite(ops, { ordered: false });
        imported += result.upsertedCount || 0;
        ops = [];
    };
    const add = async ({ key, at, action, actor, target, details, result = "success" }) => {
        if (!at || !(new Date(at) < cutoff)) return;
        ops.push({
            updateOne: {
                filter: { key },
                update: {
                    $setOnInsert: {
                        key,
                        at: new Date(at),
                        action,
                        category: ACTIVITY_ACTIONS[action].category,
                        result,
                        actor: { id: actor.id || null, role: actor.role, name: actor.name || "" },
                        target: { type: target.type, id: target.id || null, label: String(target.label || "").slice(0, 200) },
                        details: cleanDetails(details),
                        source: "records",
                    },
                },
                upsert: true,
            },
        });
        if (ops.length >= BATCH) await flush();
    };

    // Accounts: registration, and the latest approval or rejection.
    for await (const u of User.find({ role: { $in: ["school", "ngo", "donor"] } }).select("name role accountStatus createdAt statusChangedAt statusChangedBy rejectionReason").lean().cursor()) {
        const target = { type: "account", id: u._id, label: u.name };
        await add({ key: `account.registered:${u._id}`, at: u.createdAt, action: "account.registered", actor: { id: u._id, role: u.role, name: u.name }, target, details: { role: u.role } });
        if (u.statusChangedAt && u.accountStatus !== "pending") {
            const action = u.accountStatus === "active" ? "account.approved" : "account.rejected";
            await add({
                key: `${action}:${u._id}:${time(u.statusChangedAt)}`,
                at: u.statusChangedAt,
                action,
                actor: { id: u.statusChangedBy, role: "admin" },
                target,
                details: { role: u.role, ...(action === "account.rejected" ? { reason: u.rejectionReason } : {}) },
            });
        }
    }

    // Projects: the latest submission, the latest review, and every part an NGO still holds.
    const titles = new Map();
    for await (const p of Project.find({}).select("title school budget reviewStatus reviewedAt reviewedBy rejectionReason submittedAt createdAt fundingParts").lean().cursor()) {
        titles.set(String(p._id), p.title);
        const target = { type: "project", id: p._id, label: p.title };
        const submittedAt = p.submittedAt || p.createdAt;
        await add({ key: `project.submitted:${p._id}:${time(submittedAt)}`, at: submittedAt, action: "project.submitted", actor: { id: p.school, role: "school" }, target, details: { budget: p.budget } });
        if (p.reviewedAt && ["OPEN", "REJECTED"].includes(p.reviewStatus)) {
            const action = p.reviewStatus === "OPEN" ? "project.approved" : "project.rejected";
            await add({
                key: `${action}:${p._id}:${time(p.reviewedAt)}`,
                at: p.reviewedAt,
                action,
                actor: { id: p.reviewedBy, role: "admin" },
                target,
                details: { schoolId: p.school, ...(action === "project.rejected" ? { reason: p.rejectionReason } : {}) },
            });
        }
        // Parts committed in one request share their commitment time.
        const commitments = new Map();
        for (const f of p.fundingParts || []) {
            const key = `${f.ngo}:${time(f.committedAt)}`;
            const group = commitments.get(key) || { ngo: f.ngo, at: f.committedAt, parts: [], amount: 0 };
            group.parts.push(f.part);
            group.amount += f.amount;
            commitments.set(key, group);
        }
        for (const [key, c] of commitments) {
            await add({
                key: `commitment.created:${p._id}:${key}`,
                at: c.at,
                action: "commitment.created",
                actor: { id: c.ngo, role: "ngo" },
                target,
                details: { parts: c.parts, amount: c.amount, schoolId: p.school },
            });
        }
    }
    const paymentTarget = (doc) => ({ type: doc.amount !== undefined && doc.donor ? "donation" : "payment", id: doc._id, label: `${inr(doc.amount)} · ${titles.get(String(doc.project)) || "a school need"}` });

    // NGO payments: recorded or started, then the school's decision or the online verification.
    for await (const pay of FundingPayment.find({}).select("project school ngo parts amount channel method reference status submittedAt reviewedAt rejectionReason mode").lean().cursor()) {
        const target = paymentTarget(pay);
        const base = { projectId: pay.project, projectTitle: titles.get(String(pay.project)), schoolId: pay.school, parts: pay.parts, amount: pay.amount };
        if (pay.channel === "ONLINE") {
            await add({ key: `payment.online_started:${pay._id}`, at: pay.submittedAt, action: "payment.online_started", result: "info", actor: { id: pay.ngo, role: "ngo" }, target, details: { ...base, channel: "ONLINE", mode: pay.mode } });
            if (pay.reviewedAt && ["ACCEPTED", "REFUND_DUE"].includes(pay.status)) {
                const action = pay.status === "ACCEPTED" ? "payment.online_verified" : "payment.refund_due";
                await add({ key: `${action}:${pay._id}`, at: pay.reviewedAt, action, result: pay.status === "ACCEPTED" ? "success" : "failure", actor: { id: pay.ngo, role: "ngo" }, target, details: { ...base, channel: "ONLINE", mode: pay.mode, status: pay.status } });
            }
            continue;
        }
        await add({
            key: `payment.submitted:${pay._id}`,
            at: pay.submittedAt,
            action: "payment.submitted",
            actor: { id: pay.ngo, role: "ngo" },
            target,
            details: { ...base, channel: "DIRECT", method: pay.method, reference: maskReference(pay.reference) },
        });
        if (pay.reviewedAt && ["ACCEPTED", "REJECTED"].includes(pay.status)) {
            const action = pay.status === "ACCEPTED" ? "payment.accepted" : "payment.rejected";
            await add({
                key: `${action}:${pay._id}`,
                at: pay.reviewedAt,
                action,
                actor: { id: pay.school, role: "school" },
                target,
                details: { ...base, ngoId: pay.ngo, channel: "DIRECT", ...(action === "payment.rejected" ? { reason: pay.rejectionReason } : {}) },
            });
        }
    }

    // Donations: started, then verified with Razorpay.
    for await (const d of Donation.find({}).select("donor project school amount status mode createdAt verifiedAt paymentId").lean().cursor()) {
        const target = paymentTarget(d);
        const details = { projectId: d.project, projectTitle: titles.get(String(d.project)), schoolId: d.school, amount: d.amount, mode: d.mode };
        await add({ key: `donation.started:${d._id}`, at: d.createdAt, action: "donation.started", result: "info", actor: { id: d.donor, role: "donor" }, target, details });
        if (d.status === "PAID" && d.verifiedAt) {
            await add({ key: `donation.verified:${d._id}`, at: d.verifiedAt, action: "donation.verified", actor: { id: d.donor, role: "donor" }, target, details: { ...details, paymentId: d.paymentId } });
        }
    }

    // Payment QRs: the latest one saved, and its review.
    for await (const s of SchoolProfile.find({ paymentQr: { $exists: true } }).select("userId paymentQr").lean().cursor()) {
        const qr = s.paymentQr;
        if (!qr?.submittedAt) continue;
        const target = { type: "qr", id: s.userId, label: "School payment QR" };
        await add({ key: `qr.submitted:${s.userId}:${time(qr.submittedAt)}`, at: qr.submittedAt, action: "qr.submitted", actor: { id: s.userId, role: "school" }, target, details: { status: qr.status, upiId: qr.upiId } });
        if (qr.reviewedAt && ["ACTIVE", "REJECTED"].includes(qr.status)) {
            const action = qr.status === "ACTIVE" ? "qr.approved" : "qr.rejected";
            await add({
                key: `${action}:${s.userId}:${time(qr.reviewedAt)}`,
                at: qr.reviewedAt,
                action,
                actor: { id: qr.reviewedBy, role: "admin" },
                target,
                details: { schoolId: s.userId, upiId: qr.upiId, ...(action === "qr.rejected" ? { reason: qr.rejectionReason } : {}) },
            });
        }
    }

    await flush();
    // The marker: from here on, the live log. Its unique key also stops a second import.
    try {
        await ActivityEvent.create({
            key: HISTORY_MARKER_KEY,
            at: cutoff,
            action: HISTORY_MARKER_KEY,
            category: "system",
            result: "info",
            actor: { id: null, role: "system", name: "VIDYADAAN" },
            target: { type: "", id: null, label: "" },
            details: { imported },
            source: "system",
        });
    } catch (error) {
        if (error.code !== 11000) throw error;
    }
    return { imported, skipped: false, cutoff };
};
