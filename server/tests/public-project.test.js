import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import process from "node:process";
import { after, before, describe, test } from "node:test";
import { PASSWORD, createAdmin, createClient, donorData, login, ngoData, paymentForm, registerActive, schoolData, startTestServer } from "./helpers.js";

// Razorpay test-mode keys for this run only (random secret, nothing real), and a fake Orders API.
const KEY_SECRET = randomBytes(24).toString("hex");
process.env.RAZORPAY_KEY_ID = "rzp_test_VidyadaanPublicPage";
process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
const { setRazorpayFetch } = await import("../services/razorpay.js");

// Everything the public page may show, and nothing else.
const PUBLIC_FIELDS = ["budget", "category", "expectedCompletion", "id", "materials", "priority", "problem", "raised", "school", "status", "studentsBenefited", "title"];
const PUBLIC_SCHOOL_FIELDS = ["district", "name", "state"];

let server;
let admin;
let User;
let Project;
const newClient = () => createClient(server.baseUrl);
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const getPublic = (id, client = newClient()) => client.get(`/api/public/projects/${id}`);

let n = 0;
const projectData = (overrides = {}) => ({
    title: `Smart classroom for Class 7 ${(n += 1)}`,
    category: "Digital Learning",
    problem: "Class 7 has no projector or screen, so 60 students learn science only from the textbook.",
    priority: "High",
    budget: "100000",
    studentsBenefited: "60",
    expectedCompletion: inDays(90),
    materials: "Projector, Screen",
    ...overrides,
});
const signedIn = async (factory, role, overrides) => {
    const data = factory(overrides);
    await registerActive(newClient(), data);
    const c = newClient();
    assert.equal((await login(c, data.email, PASSWORD, role)).status, 200);
    return { c, data };
};
const createProject = async (c, overrides) => {
    const res = await c.post("/api/school/projects", { json: projectData(overrides) });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.project;
};
/** A signed-in school with one project, approved by the admin. */
const approvedProject = async (schoolOverrides, projectOverrides) => {
    const school = await signedIn(schoolData, "school", schoolOverrides);
    const project = await createProject(school.c, projectOverrides);
    assert.equal((await admin.patch(`/api/admin/projects/${project.id}/approve`)).status, 200);
    return { school, project };
};
/** Every string value anywhere in a JSON response. */
const allText = (value) => JSON.stringify(value);

before(async () => {
    setRazorpayFetch(async (_url, init) => {
        const body = JSON.parse(init.body);
        return Response.json({ id: `order_${randomBytes(7).toString("hex")}`, entity: "order", amount: body.amount, currency: body.currency, receipt: body.receipt, status: "created" });
    });
    server = await startTestServer();
    User = (await import("../models/User.js")).default;
    Project = (await import("../models/Project.js")).default;
    const credentials = await createAdmin();
    admin = newClient();
    assert.equal((await login(admin, credentials.email, PASSWORD, "admin")).status, 200);
});
after(() => server.stop());

describe("GET /api/public/projects/:id", () => {
    test("(1, 11) an approved project loads with no sign-in, showing only the public fields", async () => {
        const { project } = await approvedProject({ schoolName: "Govt. Higher Primary School, Udupi", district: "Udupi", state: "Karnataka" });
        const c = newClient();
        assert.equal(c.cookie, "", "not signed in");
        const res = await getPublic(project.id, c);
        assert.equal(res.status, 200, JSON.stringify(res.body));
        assert.equal(res.headers.get("cache-control"), "no-store");

        const p = res.body.project;
        assert.deepEqual(Object.keys(p).sort(), PUBLIC_FIELDS);
        assert.deepEqual(Object.keys(p.school).sort(), PUBLIC_SCHOOL_FIELDS);
        assert.deepEqual(p, {
            id: project.id,
            title: project.title,
            category: "Digital Learning",
            priority: "High",
            status: "Open",
            problem: project.problem,
            budget: 100000,
            raised: 0,
            studentsBenefited: 60,
            expectedCompletion: project.expectedCompletion,
            materials: ["Projector", "Screen"],
            school: { name: "Govt. Higher Primary School, Udupi", district: "Udupi", state: "Karnataka" },
        });
    });

    test("signed-in users of every role get exactly the same public view", async () => {
        const { school, project } = await approvedProject();
        const expected = (await getPublic(project.id)).body;
        for (const c of [school.c, admin, (await signedIn(ngoData, "ngo")).c, (await signedIn(donorData, "donor")).c]) {
            const res = await getPublic(project.id, c);
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expected);
        }
    });

    test("(2, 3) pending and rejected projects are not public (the same 404 as a missing one)", async () => {
        const school = await signedIn(schoolData, "school");
        const pending = await createProject(school.c);
        const rejected = await createProject(school.c);
        assert.equal((await admin.patch(`/api/admin/projects/${rejected.id}/reject`, { json: { reason: "Please add an itemised budget." } })).status, 200);

        for (const id of [pending.id, rejected.id]) {
            const res = await getPublic(id);
            assert.equal(res.status, 404);
            assert.deepEqual(res.body, { message: "Project not found." });
        }
        // Even its own school, signed in, gets nothing from the public endpoint.
        assert.equal((await getPublic(pending.id, school.c)).status, 404);
    });

    test("(9) missing and malformed ids get 404", async () => {
        for (const id of ["0123456789abcdef01234567", "not-an-id", "1", "%24where"]) {
            const res = await getPublic(id);
            assert.equal(res.status, 404, id);
            assert.deepEqual(res.body, { message: "Project not found." });
        }
    });

    test("a project whose school account is no longer active is not public", async () => {
        const { school, project } = await approvedProject();
        await User.updateOne({ email: school.data.email.toLowerCase() }, { $set: { accountStatus: "rejected" } });
        assert.equal((await getPublic(project.id)).status, 404);
    });

    test("a completed project stays public, shown as Completed", async () => {
        const { school, project } = await approvedProject();
        assert.equal((await school.c.patch(`/api/school/projects/${project.id}`, { json: { status: "Completed" } })).status, 200);
        const res = await getPublic(project.id);
        assert.equal(res.status, 200);
        assert.equal(res.body.project.status, "Completed");
    });

    test("(4, 5, 6) no school contact, bank, UPI, UDISE or account details; nothing about another school", async () => {
        const { school, project } = await approvedProject({ schoolName: "Govt. Model School, Karkala", district: "Udupi", state: "Karnataka" });
        const other = await approvedProject({ schoolName: "Govt. High School, Bhatkal", district: "Uttara Kannada", state: "Karnataka" });
        const res = await getPublic(project.id);
        const text = allText(res.body);

        const d = school.data;
        for (const [what, value] of [
            ["login email", d.email], ["principal", d.principalName], ["phone", "9876543210"], ["address", d.address],
            ["UDISE", d.udise], ["bank account", d.bankAccount], ["IFSC", d.ifsc], ["UPI", d.upi],
        ]) {
            assert.ok(!text.toLowerCase().includes(String(value).toLowerCase()), `${what} leaked`);
        }
        const schoolUser = await User.findOne({ email: d.email.toLowerCase() }).lean();
        assert.ok(!text.includes(schoolUser._id.toString()), "the school's account id leaked");
        for (const key of ["udise", "bankAccount", "ifsc", "upi", "paymentQr", "email", "phone", "documents", "photo", "accountStatus"]) {
            assert.ok(!(key in res.body.project.school), key);
        }
        for (const value of [other.school.data.schoolName, other.school.data.email, other.school.data.udise, other.project.title, "Uttara Kannada"]) {
            assert.ok(!text.includes(value), `another school's data leaked: ${value}`);
        }
    });

    test("no review data: who approved it, when, or any rejection reason", async () => {
        const school = await signedIn(schoolData, "school");
        const project = await createProject(school.c);
        assert.equal((await admin.patch(`/api/admin/projects/${project.id}/reject`, { json: { reason: "Secret internal note for the school." } })).status, 200);
        assert.equal((await school.c.patch(`/api/school/projects/${project.id}`, { json: { budget: "90000" } })).status, 200, "resubmitted");
        assert.equal((await admin.patch(`/api/admin/projects/${project.id}/approve`)).status, 200);

        const res = await getPublic(project.id);
        const stored = await Project.findById(project.id).lean();
        const text = allText(res.body);
        for (const value of [stored.reviewedBy.toString(), "Secret internal note", "PENDING_REVIEW", '"OPEN"', "reviewedAt", "submittedAt", "createdAt", "updatedAt", "_id", "__v"]) {
            assert.ok(!text.includes(value), `${value} leaked`);
        }
    });

    test("(7) no NGO information: who committed, which parts, or any payment, reference or proof", async () => {
        const { school, project } = await approvedProject();
        const ngo = await signedIn(ngoData, "ngo", { ngoName: "Udupi Shiksha Trust" });
        assert.equal((await ngo.c.post(`/api/projects/${project.id}/commitments`, { json: { parts: [1, 2] } })).status, 201);
        const paid = await ngo.c.post(`/api/projects/${project.id}/payments`, {
            form: paymentForm({ parts: [1, 2], method: "Bank transfer (NEFT/RTGS/IMPS)", reference: "UTR-PUBLIC-PAGE-001", paidOn: new Date().toISOString().slice(0, 10), note: "Paid by our treasurer" }),
        });
        assert.equal(paid.status, 201, JSON.stringify(paid.body));
        // The school accepts it: the money now counts towards `raised`.
        assert.equal((await school.c.patch(`/api/school/payments/${paid.body.payment.id}/accept`)).status, 200);

        const res = await getPublic(project.id);
        assert.equal(res.status, 200);
        assert.equal(res.body.project.raised, 40000, "the accepted payment counts");
        const text = allText(res.body);
        const ngoUser = await User.findOne({ email: ngo.data.email.toLowerCase() }).lean();
        for (const value of ["Udupi Shiksha Trust", ngo.data.email, ngoUser._id.toString(), "UTR-PUBLIC-PAGE-001", "Paid by our treasurer", paid.body.payment.id, "fundingParts", "parts", "committed", "payment", "proof"]) {
            assert.ok(!text.includes(value), `${value} leaked`);
        }
    });

    test("(8) no donor information, even after a verified donation", async () => {
        const { project } = await approvedProject();
        const donor = await signedIn(donorData, "donor", { name: "Anjali Hegde" });
        const started = await donor.c.post("/api/donations", { json: { projectId: project.id, amount: 2500 } });
        assert.equal(started.status, 201, JSON.stringify(started.body));
        const orderId = started.body.checkout.orderId;
        const paymentId = `pay_${randomBytes(7).toString("hex")}`;
        const signature = createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
        const verified = await donor.c.post(`/api/donations/${started.body.donation.id}/verify`, {
            json: { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature },
        });
        assert.equal(verified.status, 200, JSON.stringify(verified.body));

        const res = await getPublic(project.id);
        assert.equal(res.body.project.raised, 2500, "the verified donation counts");
        const text = allText(res.body);
        const donorUser = await User.findOne({ email: donor.data.email.toLowerCase() }).lean();
        for (const value of ["Anjali Hegde", donor.data.email, donor.data.phone, donorUser._id.toString(), started.body.donation.id, orderId, paymentId, "countedDonations", "donation"]) {
            assert.ok(!text.toLowerCase().includes(String(value).toLowerCase()), `${value} leaked`);
        }
    });

    test("(10) raised is the database's value, whatever it is", async () => {
        const { project } = await approvedProject();
        for (const raised of [0, 37500, 100000]) {
            await Project.updateOne({ _id: project.id }, { $set: { raised } });
            const res = await getPublic(project.id);
            assert.equal(res.body.project.raised, raised);
            assert.equal(res.body.project.budget, 100000);
        }
    });

    test("only GET: nothing can be changed through the public path", async () => {
        const { project } = await approvedProject();
        for (const method of ["post", "patch", "put", "delete"]) {
            const res = await newClient()[method](`/api/public/projects/${project.id}`, { json: { raised: 999999, reviewStatus: "REJECTED" } });
            assert.equal(res.status, 404, method);
        }
        const stored = await Project.findById(project.id).lean();
        assert.equal(stored.raised, 0);
        assert.equal(stored.reviewStatus, "OPEN");
    });
});
