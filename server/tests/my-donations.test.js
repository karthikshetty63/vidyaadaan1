import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import process from "node:process";
import { after, before, describe, test } from "node:test";
import { PASSWORD, createAdmin, createClient, donorData, login, ngoData, registerActive, schoolData, startTestServer } from "./helpers.js";

// Razorpay test-mode keys for this run only (random secret, nothing real), and a fake Orders API.
const KEY_SECRET = randomBytes(24).toString("hex");
process.env.RAZORPAY_KEY_ID = "rzp_test_VidyadaanMyDonations";
process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
const { setRazorpayFetch } = await import("../services/razorpay.js");

const FIELDS = ["amount", "createdAt", "currency", "id", "mode", "paymentId", "project", "school", "status", "verifiedAt"];

let server;
let admin;
const newClient = () => createClient(server.baseUrl);
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const signedIn = async (factory, role, overrides) => {
    const data = factory(overrides);
    await registerActive(newClient(), data);
    const c = newClient();
    assert.equal((await login(c, data.email, PASSWORD, role)).status, 200);
    return { c, data };
};
const approvedProject = async (schoolOverrides, title) => {
    const school = await signedIn(schoolData, "school", schoolOverrides);
    const res = await school.c.post("/api/school/projects", {
        json: { title, category: "Library", priority: "High", budget: "100000", studentsBenefited: "120", expectedCompletion: inDays(90), problem: "The school has no library; 120 students have no books beyond their textbooks." },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    assert.equal((await admin.patch(`/api/admin/projects/${res.body.project.id}/approve`)).status, 200);
    return res.body.project;
};
/** Start a donation; with `pay`, also verify it the way Razorpay Checkout would. */
const donate = async (c, projectId, amount, { pay = true } = {}) => {
    const started = await c.post("/api/donations", { json: { projectId, amount } });
    assert.equal(started.status, 201, JSON.stringify(started.body));
    if (!pay) return { ...started.body.donation, orderId: started.body.checkout.orderId };
    const orderId = started.body.checkout.orderId;
    const paymentId = `pay_${randomBytes(7).toString("hex")}`;
    const signature = createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex");
    const verified = await c.post(`/api/donations/${started.body.donation.id}/verify`, { json: { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } });
    assert.equal(verified.status, 200, JSON.stringify(verified.body));
    return { ...verified.body.donation, orderId };
};

before(async () => {
    setRazorpayFetch(async (_url, init) => {
        const body = JSON.parse(init.body);
        return Response.json({ id: `order_${randomBytes(7).toString("hex")}`, entity: "order", amount: body.amount, currency: body.currency, receipt: body.receipt, status: "created" });
    });
    server = await startTestServer();
    const credentials = await createAdmin();
    admin = newClient();
    assert.equal((await login(admin, credentials.email, PASSWORD, "admin")).status, 200);
});
after(() => server.stop());

describe("GET /api/donations/mine", () => {
    test("a donor gets their own confirmed donations, newest first, with the need and the school's name and place", async () => {
        const library = await approvedProject({ schoolName: "Govt. High School, Karkala", district: "Udupi", state: "Karnataka" }, "Library shelves and books");
        const water = await approvedProject({ schoolName: "Govt. Primary School, Melur", district: "Madurai", state: "Tamil Nadu" }, "Drinking water purifier");
        const donor = await signedIn(donorData, "donor");
        const first = await donate(donor.c, library.id, 1500);
        const second = await donate(donor.c, water.id, 700);
        const unpaid = await donate(donor.c, water.id, 900, { pay: false });

        const res = await donor.c.get("/api/donations/mine");
        assert.equal(res.status, 200);
        const list = res.body.donations;
        assert.deepEqual(list.map((d) => d.id), [second.id, first.id], "newest first; the unpaid order is not a donation");
        assert.ok(!list.some((d) => d.id === unpaid.id));
        for (const d of list) assert.deepEqual(Object.keys(d).sort(), FIELDS);
        assert.deepEqual(list[1].project, { id: library.id, title: "Library shelves and books" });
        assert.deepEqual(list[1].school, { name: "Govt. High School, Karkala", district: "Udupi", state: "Karnataka" });
        assert.equal(list[1].amount, 1500);
        assert.equal(list[1].status, "PAID");
        assert.equal(list[1].mode, "test");
        assert.equal(list[1].paymentId, first.paymentId);
        assert.ok(list[1].verifiedAt);
        const text = JSON.stringify(res.body);
        for (const hidden of [first.orderId, second.orderId, "orderId", "donor", "udise", "bankAccount", "ifsc"]) {
            assert.ok(!text.includes(hidden), `${hidden} leaked`);
        }
    });

    test("each donor sees only their own; a new donor sees an empty list", async () => {
        const project = await approvedProject({}, "Science kits");
        const a = await signedIn(donorData, "donor", { name: "Asha Rao" });
        const b = await signedIn(donorData, "donor", { name: "Bharat Shetty" });
        const mine = await donate(a.c, project.id, 500);
        await donate(b.c, project.id, 800);

        const aList = (await a.c.get("/api/donations/mine")).body.donations;
        assert.deepEqual(aList.map((d) => d.id), [mine.id]);
        const bText = JSON.stringify((await b.c.get("/api/donations/mine")).body);
        assert.ok(!bText.includes(mine.id) && !bText.includes("Asha"), "another donor's donation leaked");

        const fresh = await signedIn(donorData, "donor");
        assert.deepEqual((await fresh.c.get("/api/donations/mine")).body, { donations: [] });
    });

    test("only signed-in donors: schools, NGOs and admins get 403, signed-out visitors 401", async () => {
        const school = (await signedIn(schoolData, "school")).c;
        const ngo = (await signedIn(ngoData, "ngo")).c;
        for (const [who, c, expected] of [["school", school, 403], ["ngo", ngo, 403], ["admin", admin, 403], ["signed out", newClient(), 401]]) {
            assert.equal((await c.get("/api/donations/mine")).status, expected, who);
        }
    });
});
