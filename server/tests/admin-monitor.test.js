import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import process from "node:process";
import { after, before, describe, test } from "node:test";
import { PASSWORD, createAdmin, createClient, donorData, login, ngoData, paymentForm, registerActive, schoolData, startTestServer } from "./helpers.js";

// The admin Control Tower: read-only, admin-only monitoring (/api/admin/monitor/...) and the activity log.
// Razorpay test-mode keys for this run only (random; nothing here reaches Razorpay).
const KEY_SECRET = randomBytes(24).toString("hex");
process.env.RAZORPAY_KEY_ID = "rzp_test_VidyadaanMonitor1";
process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;

// Everything created by this file happens after this moment (the history import test relies on it).
const FILE_START = new Date();

let server;
let admin;
let adminId;
let models;
let activityWritesSettled;
let importActivityHistory;
const newClient = () => createClient(server.baseUrl);
const MONITOR = ["overview", "checks", "schools", "ngos", "donors", "projects", "ngo-payments", "donations", "activity"];
const get = (c, path) => c.get(`/api/admin/monitor/${path}`);

const fakeRazorpay = async (_url, init) => {
    const body = JSON.parse(init.body);
    return Response.json({ id: `order_${randomBytes(7).toString("hex")}`, entity: "order", amount: body.amount, currency: body.currency, receipt: body.receipt, status: "created" });
};
const signed = (orderId, paymentId = `pay_${randomBytes(7).toString("hex")}`) => ({
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex"),
});
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const signedIn = async (factory, role, overrides) => {
    const data = factory(overrides);
    await registerActive(newClient(), data);
    const c = newClient();
    assert.equal((await login(c, data.email, PASSWORD, role)).status, 200);
    return { c, data };
};
let n = 0;
const createProject = async (c, overrides = {}) => {
    const res = await c.post("/api/school/projects", {
        json: {
            title: `Science lab benches ${(n += 1)}`, category: "Science Laboratory", priority: "High", budget: "100000", studentsBenefited: "150",
            problem: "Class 8 to 10 have no lab benches, so practicals are only demonstrated by the teacher.", expectedCompletion: inDays(90), ...overrides,
        },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.project;
};

// The scenario every test reads.
const s = {};

before(async () => {
    server = await startTestServer();
    models = {
        User: (await import("../models/User.js")).default,
        Project: (await import("../models/Project.js")).default,
        Donation: (await import("../models/Donation.js")).default,
        FundingPayment: (await import("../models/FundingPayment.js")).default,
        ActivityEvent: (await import("../models/ActivityEvent.js")).default,
        DonorProfile: (await import("../models/DonorProfile.js")).default,
    };
    await models.ActivityEvent.init();
    ({ activityWritesSettled } = await import("../services/activityLog.js"));
    ({ importActivityHistory } = await import("../services/activityHistory.js"));
    (await import("../services/razorpay.js")).setRazorpayFetch(fakeRazorpay);

    const credentials = await createAdmin({ name: "Monitor Admin" });
    admin = newClient();
    assert.equal((await login(admin, credentials.email, PASSWORD, "admin")).status, 200);
    adminId = String((await models.User.findOne({ email: credentials.email }))._id);

    // A school with an approved, a pending and a rejected project.
    s.school = await signedIn(schoolData, "school", { schoolName: "Govt. High School, Kemmannu" });
    s.approved = await createProject(s.school.c, { title: "Science lab benches for Kemmannu" });
    assert.equal((await admin.patch(`/api/admin/projects/${s.approved.id}/approve`)).status, 200);
    s.pending = await createProject(s.school.c, { title: "Kemmannu playground fence" });
    s.rejected = await createProject(s.school.c, { title: "Kemmannu roof repair" });
    assert.equal((await admin.patch(`/api/admin/projects/${s.rejected.id}/reject`, { json: { reason: "Please attach the contractor's quotation." } })).status, 200);

    // An NGO commits parts 1 and 2 (₹20,000 each): part 1's payment is accepted, part 2's rejected.
    s.ngo = await signedIn(ngoData, "ngo", { ngoName: "Udupi Shiksha Trust" });
    assert.equal((await s.ngo.c.post(`/api/projects/${s.approved.id}/commitments`, { json: { parts: [1, 2] } })).status, 201);
    s.ref1 = "UTR777000111";
    s.ref2 = "UTR777000222";
    const pay = (parts, reference) => s.ngo.c.post(`/api/projects/${s.approved.id}/payments`, { form: paymentForm({ parts, method: "Bank transfer (NEFT/RTGS/IMPS)", reference, paidOn: inDays(0), note: "" }) });
    const p1 = await pay([1], s.ref1);
    const p2 = await pay([2], s.ref2);
    assert.equal(p1.status, 201);
    assert.equal(p2.status, 201);
    assert.equal((await s.school.c.patch(`/api/school/payments/${p1.body.payment.id}/accept`)).status, 200);
    assert.equal((await s.school.c.patch(`/api/school/payments/${p2.body.payment.id}/reject`, { json: { reason: "No credit on that date." } })).status, 200);

    // A donor: ₹5,000 verified, ₹1,000 started but never paid, and one payment with a bad signature.
    s.donor = await signedIn(donorData, "donor", { name: "Anita Monitor" });
    const d1 = await s.donor.c.post("/api/donations", { json: { projectId: s.approved.id, amount: 5000 } });
    assert.equal(d1.status, 201, JSON.stringify(d1.body));
    s.paymentId = `pay_${randomBytes(7).toString("hex")}`;
    assert.equal((await s.donor.c.post(`/api/donations/${d1.body.donation.id}/verify`, { json: signed(d1.body.checkout.orderId, s.paymentId) })).status, 200);
    const d2 = await s.donor.c.post("/api/donations", { json: { projectId: s.approved.id, amount: 1000 } });
    assert.equal(d2.status, 201);
    const forged = { ...signed(d2.body.checkout.orderId), razorpay_signature: "0".repeat(64) };
    assert.equal((await s.donor.c.post(`/api/donations/${d2.body.donation.id}/verify`, { json: forged })).status, 400);

    // A registration still waiting for an admin, and two failed sign-ins (one unknown account).
    s.waiting = schoolData({ schoolName: "Govt. School, Hebri (waiting)" });
    assert.equal((await newClient().post("/api/auth/register", { form: (await import("./helpers.js")).registrationForm(s.waiting, (await import("./helpers.js")).requiredFiles("school")) })).status, 201);
    assert.equal((await login(newClient(), s.school.data.email, "Wrong-pass-123", "school")).status, 401);
    s.unknownEmail = `nobody.${randomBytes(4).toString("hex")}@example.com`;
    assert.equal((await login(newClient(), s.unknownEmail, "Wrong-pass-123", "school")).status, 401);

    await activityWritesSettled();
});
after(() => server.stop());

// ─── Who may see it ──────────────────────────────────────────────────────────
describe("authorization", () => {
    test("signed out: 401 on every monitoring endpoint", async () => {
        for (const path of MONITOR) assert.equal((await get(newClient(), path)).status, 401, path);
    });

    test("schools, NGOs and donors are refused (403), whatever they send", async () => {
        for (const who of [s.school, s.ngo, s.donor]) {
            for (const path of MONITOR) assert.equal((await get(who.c, path)).status, 403, path);
            const forged = await who.c.get("/api/admin/monitor/overview?role=admin", { headers: { "X-Role": "admin" } });
            assert.equal(forged.status, 403);
        }
    });

    test("an admin can read every endpoint; nothing can be written", async () => {
        for (const path of MONITOR) {
            const res = await get(admin, path);
            assert.equal(res.status, 200, `${path}: ${JSON.stringify(res.body).slice(0, 200)}`);
            assert.ok(res.body.generatedAt);
            assert.equal(res.headers.get("cache-control"), "no-store");
        }
        for (const method of ["post", "patch", "delete"]) {
            assert.equal((await admin[method]("/api/admin/monitor/overview", { json: {} })).status, 404, method);
        }
    });

    test("an admin whose account stops being active loses access at once", async () => {
        const other = await createAdmin({ name: "Former Admin" });
        const c = newClient();
        assert.equal((await login(c, other.email, PASSWORD, "admin")).status, 200);
        assert.equal((await get(c, "overview")).status, 200);
        await models.User.updateOne({ email: other.email }, { $set: { role: "donor" } });
        assert.equal((await get(c, "overview")).status, 401);
    });
});

// ─── Figures ─────────────────────────────────────────────────────────────────
describe("overview: figures match the records", () => {
    test("accounts, projects, commitments, NGO payments and donations", async () => {
        const o = (await get(admin, "overview")).body;
        const { User } = models;
        for (const role of ["school", "ngo", "donor"]) {
            for (const status of ["pending", "active", "rejected"]) {
                assert.equal(o.accounts[role]?.[status] || 0, await User.countDocuments({ role, accountStatus: status }), `${role} ${status}`);
            }
        }
        assert.deepEqual({ total: o.projects.total, pendingReview: o.projects.pendingReview, rejected: o.projects.rejected, approved: o.projects.approved }, { total: 3, pendingReview: 1, rejected: 1, approved: 1 });
        assert.equal(o.projects.approvedBudget, 100000);
        // Commitments (promises) are separate from money: part 1 received, part 2 back to awaiting payment.
        assert.deepEqual(o.commitments.received, { count: 1, amount: 20000 });
        assert.deepEqual(o.commitments.awaitingPayment, { count: 1, amount: 20000 });
        assert.deepEqual(o.commitments.paymentSubmitted, { count: 0, amount: 0 });
        assert.deepEqual(o.ngoPayments.direct.ACCEPTED, { count: 1, amount: 20000 });
        assert.deepEqual(o.ngoPayments.direct.REJECTED, { count: 1, amount: 20000 });
        assert.deepEqual(o.ngoPayments.direct.SUBMITTED, { count: 0, amount: 0 });
        // Only the verified donation counts; the started one is shown separately.
        assert.equal(o.donations.PAID.count, 1);
        assert.equal(o.donations.PAID.amount, 5000);
        assert.equal(o.donations.PAID.test.amount, 5000);
        assert.equal(o.donations.CREATED.count, 1);
        assert.equal(o.donations.CREATED.amount, 1000);
        assert.deepEqual(o.funding, { raisedOnProjects: 25000, confirmedNgoPayments: 20000, confirmedDonations: 5000, difference: 0 });
    });

    test("work queues", async () => {
        const o = (await get(admin, "overview")).body;
        assert.equal(o.queues.accounts.count, 1);
        assert.equal(o.queues.accounts.byRole.school.count, 1);
        assert.equal(o.queues.projects.count, 1);
        assert.equal(o.queues.paymentQrs.count, 0);
        assert.equal(o.queues.schoolPaymentChecks.count, 0);
        assert.ok(o.activity.last24h.failedSignIns >= 2);
    });

    test("a tampered “raised” is caught: totals differ and the check names the project", async () => {
        const { Project } = models;
        assert.equal((await get(admin, "checks")).body.checks.find((c) => c.key === "raised-mismatch").count, 0);
        await Project.updateOne({ _id: s.approved.id }, { $inc: { raised: 999 } });
        try {
            const o = (await get(admin, "overview")).body;
            assert.equal(o.funding.difference, 999);
            const mismatch = (await get(admin, "checks")).body.checks.find((c) => c.key === "raised-mismatch");
            assert.equal(mismatch.count, 1);
            assert.equal(mismatch.severity, "critical");
            assert.deepEqual(mismatch.items[0], {
                projectId: s.approved.id, title: "Science lab benches for Kemmannu", school: "Govt. High School, Kemmannu", raised: 25999, expected: 25000, ngoPayments: 20000, donations: 5000,
            });
            const row = (await get(admin, "projects?q=Science%20lab%20benches%20for%20Kemmannu")).body.items[0];
            assert.equal(row.consistent, false);
        } finally {
            await Project.updateOne({ _id: s.approved.id }, { $inc: { raised: -999 } });
        }
    });

    test("a verified donation that isn't counted in raised is flagged", async () => {
        const { Donation } = models;
        const stray = await Donation.create({ donor: (await models.User.findOne({ email: s.donor.data.email }))._id, project: s.approved.id, school: (await models.Project.findById(s.approved.id)).school, amount: 700, mode: "test", orderId: "order_stray1", paymentId: "pay_stray1", status: "PAID", verifiedAt: new Date() });
        try {
            const check = (await get(admin, "checks")).body.checks.find((c) => c.key === "donation-not-counted");
            assert.equal(check.count, 1);
            assert.equal(check.items[0].amount, 700);
            assert.equal(check.items[0].donor, "Anita Monitor");
        } finally {
            await Donation.deleteOne({ _id: stray._id });
        }
    });
});

// ─── Lists ───────────────────────────────────────────────────────────────────
describe("lists", () => {
    test("schools, NGOs, donors and projects carry figures from their own records", async () => {
        const school = (await get(admin, "schools?q=Kemmannu")).body.items;
        assert.equal(school.length, 1);
        assert.deepEqual(school[0].projects, { total: 3, approved: 1, rejected: 1, pendingReview: 1 });
        assert.equal(school[0].raised, 25000);
        assert.equal(school[0].approvedBudget, 100000);

        const ngo = (await get(admin, "ngos?q=Udupi%20Shiksha")).body.items[0];
        assert.deepEqual(ngo.commitments, { projects: 1, parts: 2, amount: 40000, received: 20000 });
        assert.deepEqual(ngo.payments.accepted, { count: 1, amount: 20000 });
        assert.equal(ngo.payments.rejected.count, 1);

        const donor = (await get(admin, "donors?q=Anita%20Monitor")).body.items[0];
        assert.equal(donor.donations.verified, 1);
        assert.equal(donor.donations.verifiedAmount, 5000);
        assert.equal(donor.donations.notCompleted, 1);

        const pending = (await get(admin, "projects?review=PENDING_REVIEW&q=Kemmannu")).body.items;
        assert.deepEqual(pending.map((p) => p.title), ["Kemmannu playground fence"]);
        const approved = (await get(admin, "projects?review=OPEN&q=Kemmannu")).body.items[0];
        assert.equal(approved.consistent, true);
        assert.deepEqual(approved.confirmed, { ngoPayments: 20000, donations: 5000, verifiedDonationsNotCounted: 0 });
        assert.equal(approved.committed, 40000);
    });

    test("NGO payments and donations: statuses, counting and masked references", async () => {
        const accepted = (await get(admin, "ngo-payments?status=ACCEPTED")).body.items;
        assert.equal(accepted.length, 1);
        assert.equal(accepted[0].counted, true);
        assert.equal(accepted[0].reference, "••••0111");
        const rejected = (await get(admin, "ngo-payments?status=REJECTED")).body.items[0];
        assert.equal(rejected.counted, false);
        assert.equal(rejected.rejectionReason, "No credit on that date.");

        const paid = (await get(admin, "donations?status=PAID")).body.items;
        assert.equal(paid.length, 1);
        assert.equal(paid[0].countedInRaised, true);
        assert.equal(paid[0].paymentId, s.paymentId);
        const started = (await get(admin, "donations?status=CREATED")).body.items;
        assert.equal(started.length, 1);
        assert.equal(started[0].countedInRaised, false);
    });

    test("pagination: pages, totals and the last page", async () => {
        const { User, DonorProfile } = models;
        const now = Date.now();
        const extra = await User.insertMany(Array.from({ length: 23 }, (_, i) => ({ name: `Paged Donor ${i}`, email: `paged.${i}.${now}@example.com`, password: "x".repeat(60), role: "donor", accountStatus: "active" })));
        await DonorProfile.insertMany(extra.map((u) => ({ userId: u._id, city: "Mysuru", state: "Karnataka" })));
        const total = await User.countDocuments({ role: "donor" });
        const first = (await get(admin, "donors?limit=10")).body;
        assert.equal(first.total, total);
        assert.equal(first.items.length, 10);
        assert.equal(first.pages, Math.ceil(total / 10));
        assert.equal(first.hasMore, true);
        const last = (await get(admin, `donors?limit=10&page=${first.pages}`)).body;
        assert.equal(last.items.length, total - (first.pages - 1) * 10);
        assert.equal(last.hasMore, false);
        const all = [];
        for (let p = 1; p <= first.pages; p += 1) all.push(...(await get(admin, `donors?limit=10&page=${p}`)).body.items.map((d) => d.id));
        assert.equal(new Set(all).size, total, "every donor exactly once across the pages");
        assert.equal((await get(admin, "donors?q=Paged%20Donor&limit=50")).body.total, 23);
    });

    test("bad queries are refused (400), unknown records are 404, and no match is an empty page", async () => {
        for (const query of ["donors?limit=51", "donors?limit=0", "donors?page=0", "donors?limit=ten", "donors?status=blocked", "projects?review=MAYBE", "activity?role=superuser",
            "activity?from=2026-13-40", "activity?from=2026-10-09&to=2026-10-01", `activity?q=${"x".repeat(81)}`, "activity?actorId=not-an-id", "ngo-payments?channel=CASH", "donations?mode=prod"]) {
            const res = await get(admin, query);
            assert.equal(res.status, 400, query);
            assert.ok(res.body.message);
        }
        assert.equal((await get(admin, "activity/not-an-id")).status, 400);
        assert.equal((await get(admin, "activity/0123456789abcdef01234567")).status, 404);
        const empty = (await get(admin, "activity?from=2099-01-01")).body;
        assert.deepEqual({ items: empty.items, total: empty.total, pages: empty.pages, hasMore: empty.hasMore }, { items: [], total: 0, pages: 1, hasMore: false });
        assert.deepEqual((await get(admin, "schools?q=no-school-has-this-name")).body.items, []);
    });
});

// ─── Privacy ─────────────────────────────────────────────────────────────────
describe("privacy", () => {
    test("no response contains emails, phones, bank details, PAN, password hashes, tokens or signatures", async () => {
        const events = (await get(admin, "activity?limit=50")).body.items;
        const detail = (await get(admin, `activity/${events[0].id}`)).body;
        const all = JSON.stringify([detail, ...(await Promise.all(MONITOR.map(async (path) => (await get(admin, `${path}?limit=50`.replace("overview?limit=50", "overview").replace("checks?limit=50", "checks"))).body)))]);
        const forbidden = [
            s.school.data.email, s.ngo.data.email, s.donor.data.email, s.waiting.email, s.unknownEmail,
            "9876543210", "98765 43210", "080 2345 6789", s.school.data.bankAccount, s.school.data.ifsc, s.ngo.data.pan,
            s.ref1, s.ref2, "$2a$", "$2b$", "passwordResetToken", "googleId", "razorpay_signature", "tokenVersion", KEY_SECRET, process.env.JWT_SECRET,
        ];
        for (const value of forbidden) assert.ok(!all.includes(value), `leaked: ${value}`);
        assert.ok(!/@example\.(com|org|gov\.in)/.test(all), "no email addresses at all");
    });
});

// ─── The activity log ────────────────────────────────────────────────────────
describe("activity log", () => {
    const find = async (query) => (await get(admin, `activity?limit=50&${query}`)).body.items;

    test("workflow actions are recorded live with actor, role, target and result", async () => {
        const payments = await find("category=payment");
        const by = (action) => payments.find((e) => e.action === action);
        assert.equal(by("payment.submitted").actor.role, "ngo");
        assert.equal(by("payment.submitted").actor.name, "Udupi Shiksha Trust");
        assert.equal(by("payment.submitted").details.reference.startsWith("••••"), true);
        assert.equal(by("payment.accepted").actor.role, "school");
        assert.equal(by("payment.accepted").actor.name, "Govt. High School, Kemmannu");
        assert.equal(by("payment.rejected").details.reason, "No credit on that date.");
        assert.ok(payments.every((e) => e.source === "live"));

        const projects = await find("category=project");
        const rejected = projects.find((e) => e.action === "project.rejected");
        assert.equal(rejected.actor.id, adminId);
        assert.equal(rejected.actor.role, "admin");
        assert.equal(rejected.target.label, "Kemmannu roof repair");
        assert.equal(rejected.details.reason, "Please attach the contractor's quotation.");

        const donations = await find("category=donation");
        assert.equal(donations.find((e) => e.action === "donation.verified").details.paymentId, s.paymentId);
        const failed = donations.find((e) => e.action === "donation.verification_failed");
        assert.equal(failed.result, "failure");
        assert.equal(failed.actor.name, "Anita Monitor");

        const commitments = await find("category=funding");
        assert.deepEqual(commitments.find((e) => e.action === "commitment.created").details.parts, [1, 2]);
    });

    test("failed sign-ins are recorded without what was typed", async () => {
        const failures = await find("category=auth&result=failure");
        const wrong = failures.find((e) => e.details.reason === "wrong_password");
        assert.equal(wrong.actor.name, "Govt. High School, Kemmannu");
        const unknown = failures.find((e) => e.details.reason === "unknown_account");
        assert.equal(unknown.actor.role, "visitor");
        assert.equal(unknown.actor.id, null);
        const raw = JSON.stringify(await models.ActivityEvent.find({}).lean());
        assert.ok(!raw.includes(s.unknownEmail) && !raw.includes("Wrong-pass-123"), "the typed email and password are never stored");
    });

    test("filters: role, result, date range, actor and record", async () => {
        const ngoEvents = await find("role=ngo");
        assert.ok(ngoEvents.length > 0 && ngoEvents.every((e) => e.actor.role === "ngo"));
        assert.ok((await find("result=failure")).every((e) => e.result === "failure"));
        const today = new Date().toISOString().slice(0, 10);
        assert.ok((await find(`from=${today}&to=${today}`)).length > 0);
        const onProject = await find(`targetId=${s.approved.id}`);
        assert.ok(onProject.length > 0 && onProject.every((e) => e.target.id === s.approved.id));
        assert.ok(onProject.some((e) => e.action === "project.approved") && onProject.some((e) => e.action === "commitment.created"));
        assert.ok((await find(`actorId=${adminId}`)).every((e) => e.actor.id === adminId));
        assert.ok((await find("q=Kemmannu%20roof")).some((e) => e.action === "project.rejected"));
    });

    test("one event in detail, with the names it mentions", async () => {
        const event = (await find("category=payment")).find((e) => e.action === "payment.accepted");
        const { body, status } = await get(admin, `activity/${event.id}`);
        assert.equal(status, 200);
        assert.equal(body.event.details.ngo, "Udupi Shiksha Trust");
        assert.equal(body.event.details.amount, 20000);
    });

    test("if recording an event fails, the user's action still works", async () => {
        const { ActivityEvent } = models;
        const original = ActivityEvent.create;
        const logged = [];
        const originalError = console.error;
        ActivityEvent.create = async () => {
            throw new Error("database unavailable");
        };
        console.error = (...args) => logged.push(args.join(" "));
        try {
            assert.equal((await login(newClient(), s.donor.data.email, PASSWORD, "donor")).status, 200);
            await activityWritesSettled();
        } finally {
            ActivityEvent.create = original;
            console.error = originalError;
        }
        assert.match(logged.join("\n"), /Activity "auth.signed_in" could not be recorded: database unavailable/);
    });
});

// ─── Earlier activity, from the records ──────────────────────────────────────
describe("history import", () => {
    test("rebuilds earlier events from stored dates, labelled as records, once", async () => {
        const { User, Project, ActivityEvent } = models;
        const daysAgo = (d) => new Date(FILE_START.getTime() - d * 86400000);
        // Records from before the activity log existed (written straight to the database, as old data was).
        const old = (await User.collection.insertOne({ name: "Old School Principal", email: `old.${Date.now()}@example.com`, role: "school", accountStatus: "active", tokenVersion: 0, createdAt: daysAgo(30), updatedAt: daysAgo(29), statusChangedAt: daysAgo(29), statusChangedBy: new (await import("mongoose")).default.Types.ObjectId(adminId) })).insertedId;
        await Project.collection.insertOne({
            school: old, title: "Old library shelves", category: "Library", problem: "Books are kept in boxes on the floor of Class 5.", priority: "Medium", budget: 5000, raised: 0,
            studentsBenefited: 40, expectedCompletion: daysAgo(-60), location: "", materials: [], status: "Open", reviewStatus: "REJECTED", rejectionReason: "Add a quotation.",
            reviewedBy: new (await import("mongoose")).default.Types.ObjectId(adminId), reviewedAt: daysAgo(19), submittedAt: daysAgo(20), fundingParts: [], createdAt: daysAgo(20), updatedAt: daysAgo(19),
        });
        const before = await ActivityEvent.countDocuments({});
        const first = await importActivityHistory({ now: FILE_START });
        assert.equal(first.skipped, false);
        // Only records dated before the log started: registered, approved, submitted, rejected.
        assert.equal(first.imported, 4);
        const records = (await get(admin, "activity?source=records&limit=50")).body.items;
        assert.deepEqual(records.map((e) => e.action).sort(), ["account.approved", "account.registered", "project.rejected", "project.submitted"]);
        assert.ok(records.every((e) => new Date(e.at) < FILE_START));
        const rejected = records.find((e) => e.action === "project.rejected");
        assert.equal(rejected.actor.role, "admin");
        assert.equal(rejected.actor.id, adminId);
        assert.equal(rejected.details.reason, "Add a quotation.");

        const second = await importActivityHistory({ now: new Date() });
        assert.equal(second.skipped, true);
        assert.equal(await ActivityEvent.countDocuments({}), before + 5, "4 records + the import marker, and nothing on the second run");
        const o = (await get(admin, "overview")).body;
        assert.equal(new Date(o.activity.historyImportedAt).getTime(), FILE_START.getTime());
        assert.equal(o.activity.historyImported, 4);
    });
});
