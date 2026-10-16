import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import process from "node:process";
import { after, before, describe, test } from "node:test";
import { PASSWORD, createAdmin, createClient, donorData, login, ngoData, paymentForm, registerActive, schoolData, startTestServer } from "./helpers.js";

// The home page's public data: the list of open school needs (GET /api/public/projects) and the recent-
// activity strip (GET /api/public/activity). Anyone may read them; they must show only approved needs of
// active schools, only public fields, and never names, amounts or test-mode payments in the activity.
const KEY_SECRET = randomBytes(24).toString("hex");
process.env.RAZORPAY_KEY_ID = "rzp_test_VidyadaanHome01";
process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;

let server;
let admin;
let models;
let activityWritesSettled;
const newClient = () => createClient(server.baseUrl);
const visitor = () => newClient();
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const fakeRazorpay = async (_url, init) => {
    const body = JSON.parse(init.body);
    return Response.json({ id: `order_${randomBytes(7).toString("hex")}`, entity: "order", amount: body.amount, currency: body.currency, receipt: body.receipt, status: "created" });
};
const signed = (orderId) => {
    const paymentId = `pay_${randomBytes(7).toString("hex")}`;
    return { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex") };
};
const signedIn = async (factory, role, overrides) => {
    const data = factory(overrides);
    await registerActive(newClient(), data);
    const c = newClient();
    assert.equal((await login(c, data.email, PASSWORD, role)).status, 200);
    return { c, data };
};
const create = async (c, overrides) => {
    const res = await c.post("/api/school/projects", {
        json: {
            title: "Library shelves", category: "Library", priority: "Medium", budget: "50000", studentsBenefited: "120",
            problem: "Class 5 keeps its 400 books in cardboard boxes on the floor, so most of them are damaged and the children can't borrow them at all. The school needs proper shelves.",
            expectedCompletion: inDays(60), ...overrides,
        },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.project;
};
const approve = async (project) => assert.equal((await admin.patch(`/api/admin/projects/${project.id}/approve`)).status, 200);

const s = {};

before(async () => {
    server = await startTestServer();
    models = {
        User: (await import("../models/User.js")).default,
        Project: (await import("../models/Project.js")).default,
    };
    ({ activityWritesSettled } = await import("../services/activityLog.js"));
    (await import("../services/razorpay.js")).setRazorpayFetch(fakeRazorpay);
    const credentials = await createAdmin();
    admin = newClient();
    assert.equal((await login(admin, credentials.email, PASSWORD, "admin")).status, 200);

    // School A (Udupi): an open need, a completed one, one waiting for review and one rejected.
    s.a = await signedIn(schoolData, "school", { schoolName: "Govt. School, Kemmannu", district: "Udupi", state: "Karnataka" });
    s.open = await create(s.a.c, { title: "Science lab benches", category: "Science Laboratory", budget: "100000" });
    await approve(s.open);
    s.done = await create(s.a.c, { title: "Drinking water filter", category: "Drinking Water" });
    await approve(s.done);
    assert.equal((await s.a.c.patch(`/api/school/projects/${s.done.id}`, { json: { status: "Completed" } })).status, 200);
    s.pending = await create(s.a.c, { title: "Secret pending playground" });
    s.rejected = await create(s.a.c, { title: "Rejected roof plan" });
    assert.equal((await admin.patch(`/api/admin/projects/${s.rejected.id}/reject`, { json: { reason: "Add a quotation." } })).status, 200);

    // School B (Tamil Nadu): one open need.
    s.b = await signedIn(schoolData, "school", { schoolName: "Govt. School, Hosur", district: "Krishnagiri", state: "Tamil Nadu" });
    s.bOpen = await create(s.b.c, { title: "Toilet block for girls", category: "Toilets & Sanitation" });
    await approve(s.bOpen);

    // School C: approved, then its account is rejected, so its need drops out everywhere.
    s.c = await signedIn(schoolData, "school", { schoolName: "Govt. School, Hidden", district: "Mandya", state: "Karnataka" });
    s.cOpen = await create(s.c.c, { title: "Hidden school classroom" });
    await approve(s.cOpen);
    const cUser = await models.User.findOne({ email: s.c.data.email.toLowerCase() });
    assert.equal((await admin.patch(`/api/admin/accounts/${cUser._id}/reject`, { json: { reason: "Documents could not be verified." } })).status, 200);

    // An NGO commits to 2 parts of A's open need and pays one directly; the school accepts it.
    s.ngo = await signedIn(ngoData, "ngo", { ngoName: "Udupi Shiksha Trust" });
    assert.equal((await s.ngo.c.post(`/api/projects/${s.open.id}/commitments`, { json: { parts: [1, 2] } })).status, 201);
    const paid = await s.ngo.c.post(`/api/projects/${s.open.id}/payments`, { form: paymentForm({ parts: [1], method: "UPI", reference: "UTR555000111", paidOn: inDays(0), note: "" }) });
    assert.equal(paid.status, 201);
    assert.equal((await s.a.c.patch(`/api/school/payments/${paid.body.payment.id}/accept`)).status, 200);

    // A donor gives to B's need in Razorpay test mode (no real money).
    s.donor = await signedIn(donorData, "donor", { name: "Anita Private" });
    const d = await s.donor.c.post("/api/donations", { json: { projectId: s.bOpen.id, amount: 2500 } });
    assert.equal(d.status, 201, JSON.stringify(d.body));
    assert.equal((await s.donor.c.post(`/api/donations/${d.body.donation.id}/verify`, { json: signed(d.body.checkout.orderId) })).status, 200);
    await activityWritesSettled();
});
after(() => server.stop());

describe("GET /api/public/projects (open needs)", () => {
    test("anyone sees only approved, unfinished needs of active schools, newest first", async () => {
        const res = await visitor().get("/api/public/projects");
        assert.equal(res.status, 200);
        assert.equal(res.headers.get("cache-control"), "no-store");
        assert.deepEqual(res.body.items.map((p) => p.title), ["Toilet block for girls", "Science lab benches"]);
        assert.equal(res.body.total, 2);
    });

    test("each card has only public fields, with a short summary instead of the whole problem", async () => {
        const card = (await visitor().get("/api/public/projects?q=Science")).body.items[0];
        assert.deepEqual(Object.keys(card).sort(), ["budget", "category", "expectedCompletion", "id", "materials", "priority", "raised", "school", "status", "studentsBenefited", "summary", "title"]);
        assert.deepEqual(card.school, { name: "Govt. School, Kemmannu", district: "Udupi", state: "Karnataka" });
        assert.equal(card.raised, 20000);
        assert.ok(card.summary.length <= 161 && card.summary.endsWith("…"));
        const all = JSON.stringify((await visitor().get("/api/public/projects?limit=24")).body);
        for (const secret of [s.a.data.email, s.a.data.bankAccount, s.a.data.ifsc, s.a.data.udise, "fundingParts", "reviewedBy", "rejectionReason", "Udupi Shiksha Trust", "Anita Private"]) {
            assert.ok(!all.includes(secret), `leaked: ${secret}`);
        }
    });

    test("filters: category, state and search (title, school or district)", async () => {
        const get = async (query) => (await visitor().get(`/api/public/projects?${query}`)).body.items.map((p) => p.title);
        assert.deepEqual(await get("category=Library"), []);
        assert.deepEqual(await get("category=Toilets%20%26%20Sanitation"), ["Toilet block for girls"]);
        assert.deepEqual(await get("state=Karnataka"), ["Science lab benches"]);
        assert.deepEqual(await get("q=hosur"), ["Toilet block for girls"]);
        assert.deepEqual(await get("q=udupi"), ["Science lab benches"]);
        assert.deepEqual(await get("q=benches&state=Tamil%20Nadu"), []);
        assert.deepEqual(await get("q=Hidden"), [], "a rejected school's need never appears");
    });

    test("the filters offered are the categories and states that have open needs", async () => {
        const { filters } = (await visitor().get("/api/public/projects")).body;
        assert.deepEqual(filters.categories, [{ value: "Science Laboratory", count: 1 }, { value: "Toilets & Sanitation", count: 1 }]);
        assert.deepEqual(filters.states, [{ value: "Karnataka", count: 1 }, { value: "Tamil Nadu", count: 1 }]);
    });

    test("pages, and bad queries are refused", async () => {
        const first = (await visitor().get("/api/public/projects?limit=1")).body;
        assert.deepEqual({ count: first.items.length, pages: first.pages, hasMore: first.hasMore }, { count: 1, pages: 2, hasMore: true });
        const second = (await visitor().get("/api/public/projects?limit=1&page=2")).body;
        assert.equal(second.hasMore, false);
        assert.notEqual(second.items[0].id, first.items[0].id);
        for (const query of ["limit=25", "limit=0", "page=0", "page=x", "category=Spaceship", "state=Atlantis", `q=${"x".repeat(61)}`]) {
            assert.equal((await visitor().get(`/api/public/projects?${query}`)).status, 400, query);
        }
    });
});

describe("GET /api/public/activity (recent activity strip)", () => {
    test("real events about public needs, described without names or amounts", async () => {
        const res = await visitor().get("/api/public/activity");
        assert.equal(res.status, 200);
        const kinds = res.body.items.map((e) => `${e.kind}:${e.project.title}`);
        assert.ok(kinds.includes("need_approved:Science lab benches"));
        assert.ok(kinds.includes("need_approved:Toilet block for girls"));
        assert.ok(kinds.includes("ngo_committed:Science lab benches"));
        assert.ok(kinds.includes("school_received:Science lab benches"));
        const committed = res.body.items.find((e) => e.kind === "ngo_committed");
        assert.equal(committed.parts, 2);
        assert.equal(committed.place, "Udupi, Karnataka");
        for (const e of res.body.items) assert.deepEqual(Object.keys(e).sort().filter((k) => k !== "parts"), ["at", "id", "kind", "place", "project"]);
    });

    test("never test-mode donations, pending or rejected projects, or schools that are no longer active", async () => {
        const items = (await visitor().get("/api/public/activity")).body.items;
        assert.ok(!items.some((e) => e.kind === "donor_supported"), "the test-mode donation isn't shown as real money");
        const titles = items.map((e) => e.project.title);
        for (const hidden of ["Secret pending playground", "Rejected roof plan", "Hidden school classroom"]) assert.ok(!titles.includes(hidden), hidden);
        const raw = JSON.stringify(items);
        for (const secret of ["Udupi Shiksha Trust", "Anita Private", "20000", "2500", s.a.data.email, s.ngo.data.email]) assert.ok(!raw.includes(secret), `leaked: ${secret}`);
    });

    test("a live (non-test) verified donation does appear, still anonymous", async () => {
        const { recordActivity } = await import("../services/activityLog.js");
        await recordActivity({ action: "donation.verified", actor: { role: "donor", name: "Anita Private" }, target: { type: "donation", label: "₹999 · Toilet block for girls" }, details: { projectId: s.bOpen.id, amount: 999, mode: "live" } });
        const items = (await visitor().get("/api/public/activity")).body.items;
        const supported = items.find((e) => e.kind === "donor_supported");
        assert.equal(supported.project.title, "Toilet block for girls");
        assert.ok(!JSON.stringify(supported).includes("999") && !JSON.stringify(supported).includes("Anita"));
    });
});
