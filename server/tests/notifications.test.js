import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import process from "node:process";
import { after, before, beforeEach, describe, test } from "node:test";
import { FRONTEND_ORIGIN, PASSWORD, createAdmin, createClient, donorData, login, ngoData, paymentForm, register, registerActive, schoolData, startTestServer } from "./helpers.js";

// Notifications (what each account sees and the count on the bell) and the emails for important moments.
// Razorpay and the email service are both faked: nothing here leaves this computer.
const KEY_SECRET = randomBytes(24).toString("hex");
process.env.RAZORPAY_KEY_ID = "rzp_test_VidyadaanNotifications";
process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
const { setRazorpayFetch } = await import("../services/razorpay.js");
const { setEmailTransport } = await import("../services/emailService.js");
const { notificationEmailsSettled } = await import("../services/notificationEmails.js");

// In-memory stand-in for the email service: every "sent" email lands in the outbox.
const outbox = [];
let failSending = false;
const EMAIL_FROM = "VIDYADAAN <no-reply@vidyadaan.test>";

let server;
let admin;
let User;
const newClient = () => createClient(server.baseUrl);
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
let n = 0;
let ref = 0;

const signedIn = async (factory, role, overrides) => {
    const data = factory(overrides);
    await registerActive(newClient(), data);
    const c = newClient();
    assert.equal((await login(c, data.email, PASSWORD, role)).status, 200);
    const user = await User.findOne({ email: data.email.toLowerCase() });
    return { c, data, id: String(user._id) };
};
const createProject = async (c, overrides = {}) => {
    const res = await c.post("/api/school/projects", {
        json: {
            title: `Computer lab with 10 PCs ${(n += 1)}`, category: "Computer Lab", priority: "High", budget: "100000", studentsBenefited: "200",
            problem: "The school has no computers; 200 students have never used one before class 10.", expectedCompletion: inDays(90), ...overrides,
        },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.project;
};
const approvedProject = async (c, overrides) => {
    const project = await createProject(c, overrides);
    assert.equal((await admin.patch(`/api/admin/projects/${project.id}/approve`)).status, 200);
    return project;
};
const createEvent = async (c, overrides = {}) => {
    const res = await c.post("/api/school/events", {
        json: {
            title: `Annual Sports Day ${(n += 1)}`, type: "Sports Day", date: inDays(30), venue: "School playground", expectedStudents: "300",
            description: "Track events, kabaddi and kho-kho for classes 1 to 7, with prizes for every class.", helpNeeded: ["Volunteers", "Prizes or gifts"], ...overrides,
        },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.event;
};
const approvedEvent = async (c, overrides) => {
    const event = await createEvent(c, overrides);
    assert.equal((await admin.patch(`/api/admin/events/${event.id}/approve`)).status, 200);
    return event;
};
const commit = async (c, projectId, parts) => assert.equal((await c.post(`/api/projects/${projectId}/commitments`, { json: { parts } })).status, 201);
const payDirect = async (c, projectId, parts) => {
    const res = await c.post(`/api/projects/${projectId}/payments`, {
        form: paymentForm({ parts, method: "Bank transfer (NEFT/RTGS/IMPS)", reference: `UTR${String((ref += 1)).padStart(9, "0")}`, paidOn: inDays(0), note: "" }),
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.payment;
};
/** What Razorpay Checkout hands the browser after paying `orderId`. */
const checkoutSuccess = (orderId) => {
    const paymentId = `pay_${randomBytes(7).toString("hex")}`;
    return { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: createHmac("sha256", KEY_SECRET).update(`${orderId}|${paymentId}`).digest("hex") };
};
const donate = async (c, projectId, amount, { pay = true } = {}) => {
    const started = await c.post("/api/donations", { json: { projectId, amount } });
    assert.equal(started.status, 201, JSON.stringify(started.body));
    if (pay) assert.equal((await c.post(`/api/donations/${started.body.donation.id}/verify`, { json: checkoutSuccess(started.body.checkout.orderId) })).status, 200);
    return started.body.donation;
};
const offerHelp = async (c, eventId, body) => assert.equal((await c.post(`/api/events/${eventId}/offers`, { json: body })).status, 201);

const notifications = async (c) => {
    const res = await c.get("/api/notifications");
    assert.equal(res.status, 200, JSON.stringify(res.body));
    return res.body;
};
const count = async (c) => (await c.get("/api/notifications/count")).body;
const titled = (items, title) => items.filter((item) => item.title === title);
const one = (items, title) => {
    const found = titled(items, title);
    assert.equal(found.length, 1, `expected one “${title}” in ${JSON.stringify(items.map((i) => i.title))}`);
    return found[0];
};
/** Emails sent so far, once every one still on its way has finished. */
const sent = async () => {
    await notificationEmailsSettled();
    return outbox;
};

before(async () => {
    process.env.EMAIL_FROM = EMAIL_FROM;
    setEmailTransport({
        sendMail: async (message) => {
            if (failSending) throw new Error("Email service unavailable (simulated)");
            outbox.push(message);
            return { messageId: `test-${outbox.length}` };
        },
    });
    setRazorpayFetch(async (_url, init) => {
        const body = JSON.parse(init.body);
        return Response.json({ id: `order_${randomBytes(7).toString("hex")}`, entity: "order", amount: body.amount, currency: body.currency, receipt: body.receipt, status: "created" });
    });
    server = await startTestServer();
    User = (await import("../models/User.js")).default;
    const credentials = await createAdmin();
    admin = newClient();
    assert.equal((await login(admin, credentials.email, PASSWORD, "admin")).status, 200);
});
after(() => server.stop());
beforeEach(async () => {
    await notificationEmailsSettled();
    outbox.length = 0;
    failSending = false;
    process.env.EMAIL_FROM = EMAIL_FROM;
});

describe("what a school sees", () => {
    test("things waiting for the school come first, each with a button to the page where it is handled", async () => {
        const school = await signedIn(schoolData, "school");
        const ngo = await signedIn(ngoData, "ngo", { ngoName: "Shiksha Mitra Trust" });
        const donor = await signedIn(donorData, "donor", { name: "Anita Rao" });

        const lab = await approvedProject(school.c, { title: "Computer lab for class 8" });
        const toilets = await createProject(school.c, { title: "Toilet block repair", category: "Toilets & Sanitation" });
        assert.equal((await admin.patch(`/api/admin/projects/${toilets.id}/reject`, { json: { reason: "Please attach the contractor's estimate." } })).status, 200);
        await commit(ngo.c, lab.id, [1, 2]);
        const payment = await payDirect(ngo.c, lab.id, [1, 2]);
        const sports = await approvedEvent(school.c, { title: "Sports Day 2026" });
        await offerHelp(donor.c, sports.id, { kinds: ["Volunteers"], message: "I can bring five volunteers.", shareContact: true });
        const fair = await createEvent(school.c, { title: "Science fair" });
        assert.equal((await admin.patch(`/api/admin/events/${fair.id}/reject`, { json: { reason: "Please say which classes take part." } })).status, 200);

        const list = await notifications(school.c);
        assert.equal(list.actions.length, 4);
        assert.equal(list.summary, "4 things need your action");
        assert.ok(list.actions.every((item) => item.kind === "action" && item.button && item.to && item.at));

        const pay = one(list.actions, "A payment is waiting for you to check");
        assert.equal(pay.id, `payment-${payment.id}`);
        assert.match(pay.text, /₹40,000 from Shiksha Mitra Trust for “Computer lab for class 8” \(parts 1 and 2\)/);
        assert.deepEqual([pay.button, pay.to], ["Check payment", "/dashboard/school/donations"]);

        const offer = one(list.actions, "An offer of help is waiting for your answer");
        assert.match(offer.text, /Anita Rao offers Volunteers for “Sports Day 2026”/);
        assert.deepEqual([offer.button, offer.to], ["Answer offer", "/dashboard/school/events"]);

        const changes = one(list.actions, "Changes requested for a project");
        assert.equal(changes.detail, "Changes requested: Please attach the contractor's estimate.");
        assert.deepEqual([changes.button, changes.to, changes.tone], ["Edit and resubmit", `/dashboard/school/progress?project=${toilets.id}`, "danger"]);
        assert.equal(one(list.actions, "Changes requested for an event").detail, "Changes requested: Please say which classes take part.");

        // The news: what was approved and who committed.
        assert.match(one(list.news, "Project approved").text, /“Computer lab for class 8” is now open to NGOs and donors/);
        assert.match(one(list.news, "Event approved").text, /Sports Day 2026/);
        const committed = one(list.news, "An NGO committed to fund your project");
        assert.match(committed.text, /Shiksha Mitra Trust committed ₹40,000 to “Computer lab for class 8” \(parts 1 and 2\)/);
        assert.ok(list.news.every((item) => item.kind === "news" && !item.button));
        const times = list.news.map((item) => new Date(item.at).getTime());
        assert.deepEqual(times, [...times].sort((a, b) => b - a), "newest first");

        // Dealing with each one takes it off the list.
        assert.equal((await school.c.patch(`/api/school/payments/${payment.id}/accept`)).status, 200);
        const events = (await school.c.get("/api/school/events")).body.events;
        const offerId = events.find((e) => e.id === sports.id).offers[0].id;
        assert.equal((await school.c.patch(`/api/school/events/${sports.id}/offers/${offerId}`, { json: { decision: "ACCEPTED" } })).status, 200);
        assert.equal((await school.c.patch(`/api/school/projects/${toilets.id}`, { json: { problem: "The toilet block is unusable; the contractor's estimate is attached to this request." } })).status, 200);
        assert.equal((await school.c.patch(`/api/school/events/${fair.id}`, { json: { helpDetails: "Classes 6 to 8 take part." } })).status, 200);
        const after = await notifications(school.c);
        assert.deepEqual(after.actions, []);
        assert.equal(after.summary, "Nothing is waiting for you");
    });

    test("money that arrives is news: an NGO's online payment, and donations as amounts only (never who gave)", async () => {
        const school = await signedIn(schoolData, "school");
        const ngo = await signedIn(ngoData, "ngo", { ngoName: "Vidya Seva Trust" });
        const donor = await signedIn(donorData, "donor", { name: "Kiran Hegde-Private" });
        const project = await approvedProject(school.c, { title: "Library books" });
        await commit(ngo.c, project.id, [1]);
        const started = await ngo.c.post(`/api/projects/${project.id}/payments/online`, { json: { parts: [1] } });
        assert.equal(started.status, 201, JSON.stringify(started.body));
        assert.equal((await ngo.c.post(`/api/projects/payments/${started.body.payment.id}/verify`, { json: checkoutSuccess(started.body.checkout.orderId) })).status, 200);
        await donate(donor.c, project.id, 1500);
        await donate(donor.c, project.id, 900, { pay: false });

        const list = await notifications(school.c);
        assert.deepEqual(list.actions, [], "an online payment is already verified: nothing for the school to check");
        assert.match(one(list.news, "An NGO paid online").text, /Vidya Seva Trust paid ₹20,000 for “Library books” through Razorpay/);
        const donation = one(list.news, "A donation arrived");
        assert.match(donation.text, /A donor gave ₹1,500 to “Library books”/);
        assert.equal(donation.to, "/dashboard/school/donations");
        const text = JSON.stringify(list);
        for (const hidden of ["Kiran", donor.data.email, donor.id, "₹900", "order_", "pay_"]) assert.ok(!text.includes(hidden), `${hidden} leaked to the school`);
    });
});

describe("a school's payment QR", () => {
    test("a rejected QR waits for the school with the reason; a new one clears it, and its approval is news", async () => {
        const school = await signedIn(schoolData, "school");
        const saveQr = (link) => school.c.put("/api/profile/payment-qr", { json: { link } });
        const first = "upi://pay?pa=Q123456789@ybl&pn=GOVT%20PRIMARY%20SCHOOL&mc=8211&mode=02&purpose=00";
        const second = "upi://pay?pa=Q987654321@ybl&pn=GOVT%20PRIMARY%20SCHOOL";

        // A QR for the UPI ID verified at registration needs no review, so there is nothing to tell.
        assert.equal((await saveQr("upi://pay?pa=school@sbi&pn=Govt%20Primary%20School&cu=INR")).body.paymentQr.status, "ACTIVE");
        assert.deepEqual([(await notifications(school.c)).actions, (await notifications(school.c)).news], [[], []]);

        assert.equal((await saveQr(first)).body.paymentQr.status, "PENDING");
        assert.equal((await admin.patch(`/api/admin/payment-qrs/${school.id}/reject`, { json: { link: first, reason: "This QR belongs to a personal account." } })).status, 200);
        const waiting = one((await notifications(school.c)).actions, "Your payment QR was not approved");
        assert.equal(waiting.detail, "Reason: This QR belongs to a personal account.");
        assert.deepEqual([waiting.button, waiting.to, waiting.tone], ["Upload another QR", "/dashboard/school", "danger"]);

        assert.equal((await saveQr(second)).body.paymentQr.status, "PENDING");
        assert.deepEqual((await notifications(school.c)).actions, [], "the new QR is with the team: nothing for the school to do");
        assert.equal((await admin.patch(`/api/admin/payment-qrs/${school.id}/approve`, { json: { link: second } })).status, 200);
        const list = await notifications(school.c);
        assert.deepEqual(list.actions, []);
        assert.match(one(list.news, "Your payment QR was approved").text, /NGOs paying your school can scan it now/);
        // The QR itself (a way to pay the school) is never repeated in a notification.
        assert.ok(!JSON.stringify(list).includes("Q987654321"));
    });
});

describe("what an NGO and a donor see", () => {
    test("an NGO is reminded of parts it hasn't paid for, then hears the school's decision", async () => {
        const school = await signedIn(schoolData, "school", { schoolName: "Govt. High School, Karkala" });
        const ngo = await signedIn(ngoData, "ngo");
        const project = await approvedProject(school.c, { title: "Drinking water purifier" });
        assert.deepEqual((await notifications(ngo.c)).actions, []);

        await commit(ngo.c, project.id, [2, 3]);
        const unpaid = one((await notifications(ngo.c)).actions, "Parts are waiting for your payment");
        assert.equal(unpaid.id, `unpaid-${project.id}`);
        assert.match(unpaid.text, /₹40,000 for “Drinking water purifier” \(parts 2 and 3\)/);
        assert.deepEqual([unpaid.button, unpaid.to], ["Pay for your parts", "/dashboard/ngo#funding"]);

        // Once the proof is sent there is nothing more for the NGO to do until the school decides.
        const first = await payDirect(ngo.c, project.id, [2, 3]);
        assert.deepEqual((await notifications(ngo.c)).actions, []);
        assert.equal((await school.c.patch(`/api/school/payments/${first.id}/reject`, { json: { reason: "No such credit in our account on that date." } })).status, 200);
        let list = await notifications(ngo.c);
        const rejected = one(list.news, "The school rejected your payment");
        assert.match(rejected.text, /Govt\. High School, Karkala could not confirm ₹40,000 for “Drinking water purifier”/);
        assert.equal(rejected.detail, "Reason: No such credit in our account on that date.");
        assert.equal(rejected.tone, "danger");
        assert.equal(list.actions.length, 1, "the parts are open for a new payment");

        const second = await payDirect(ngo.c, project.id, [2, 3]);
        assert.equal((await school.c.patch(`/api/school/payments/${second.id}/accept`)).status, 200);
        list = await notifications(ngo.c);
        assert.deepEqual(list.actions, []);
        assert.match(one(list.news, "The school accepted your payment").text, /Govt\. High School, Karkala confirmed ₹40,000 for “Drinking water purifier”/);
        assert.equal(titled(list.news, "The school rejected your payment").length, 1, "the earlier decision stays in the history");
    });

    test("an NGO's own online payment is confirmed; an offer of help it made is answered with the school's note", async () => {
        const school = await signedIn(schoolData, "school", { schoolName: "Govt. Primary School, Melur" });
        const ngo = await signedIn(ngoData, "ngo");
        const project = await approvedProject(school.c, { title: "Science kits" });
        await commit(ngo.c, project.id, [5]);
        const started = await ngo.c.post(`/api/projects/${project.id}/payments/online`, { json: { parts: [5] } });
        assert.equal((await ngo.c.post(`/api/projects/payments/${started.body.payment.id}/verify`, { json: checkoutSuccess(started.body.checkout.orderId) })).status, 200);
        const event = await approvedEvent(school.c, { title: "Annual Day" });
        await offerHelp(ngo.c, event.id, { kinds: ["Prizes or gifts"] });
        assert.equal(titled((await notifications(ngo.c)).news, "A school declined your offer of help").length, 0, "an unanswered offer is not news");
        const offerId = (await school.c.get("/api/school/events")).body.events[0].offers[0].id;
        assert.equal((await school.c.patch(`/api/school/events/${event.id}/offers/${offerId}`, { json: { decision: "DECLINED", note: "We already have enough prizes." } })).status, 200);

        const list = await notifications(ngo.c);
        assert.deepEqual(list.actions, []);
        assert.match(one(list.news, "Online payment confirmed").text, /₹20,000 for “Science kits”, verified with Razorpay/);
        const answer = one(list.news, "A school declined your offer of help");
        assert.match(answer.text, /Govt\. Primary School, Melur · “Annual Day”/);
        assert.equal(answer.detail, "School's note: We already have enough prizes.");
        assert.equal(answer.to, "/dashboard/ngo#events");
    });

    test("a donor sees confirmed donations (never an unpaid attempt) and the school's answer to an offer", async () => {
        const school = await signedIn(schoolData, "school", { schoolName: "Govt. High School, Udupi" });
        const donor = await signedIn(donorData, "donor");
        const project = await approvedProject(school.c, { title: "Classroom benches" });
        await donate(donor.c, project.id, 2500);
        await donate(donor.c, project.id, 700, { pay: false });
        const event = await approvedEvent(school.c, { title: "Republic Day programme" });
        await offerHelp(donor.c, event.id, { kinds: ["Volunteers"], shareContact: true });
        const offerId = (await school.c.get("/api/school/events")).body.events[0].offers[0].id;
        assert.equal((await school.c.patch(`/api/school/events/${event.id}/offers/${offerId}`, { json: { decision: "ACCEPTED", note: "Please come by 8 am." } })).status, 200);

        const list = await notifications(donor.c);
        assert.deepEqual(list.actions, [], "a donor never has anything waiting");
        const donation = one(list.news, "Donation confirmed");
        assert.match(donation.text, /₹2,500 to “Classroom benches” · Govt\. High School, Udupi/);
        assert.equal(donation.detail, "Razorpay test mode: no real money was charged.");
        assert.equal(donation.to, "/dashboard/donor#donations");
        const answer = one(list.news, "A school accepted your offer of help");
        assert.equal(answer.detail, "School's note: Please come by 8 am.");
        assert.equal(answer.to, "/dashboard/donor#events");
        assert.ok(!JSON.stringify(list).includes("₹700"));
    });

    test("an account the VIDYADAAN team approved is told so", async () => {
        const data = donorData();
        assert.equal((await register(newClient(), data)).status, 201);
        const account = await User.findOne({ email: data.email.toLowerCase() });
        assert.equal((await admin.patch(`/api/admin/accounts/${account._id}/approve`)).status, 200);
        const c = newClient();
        assert.equal((await login(c, data.email, PASSWORD, "donor")).status, 200);
        const list = await notifications(c);
        assert.equal(one(list.news, "Your account was approved").tone, "success");
        assert.equal(list.unread, 1);
    });
});

describe("the number on the bell", () => {
    test("everything is new until the account looks; looking clears the count, and only later items count again", async () => {
        const school = await signedIn(schoolData, "school");
        const ngo = await signedIn(ngoData, "ngo");
        assert.deepEqual(await count(school.c), { unread: 0, waiting: 0 });

        const project = await approvedProject(school.c);
        await commit(ngo.c, project.id, [1]);
        const first = await notifications(school.c);
        assert.equal(first.unread, 2);
        assert.equal(first.seenAt, null);
        assert.ok(first.news.every((item) => item.isNew));
        assert.deepEqual(await count(school.c), { unread: 2, waiting: 0 });

        // Opening the page marks the list it showed as seen.
        const seen = await school.c.post("/api/notifications/seen", { json: { asOf: first.asOf } });
        assert.equal(seen.status, 200);
        assert.equal(seen.body.seenAt, first.asOf);
        assert.deepEqual(await count(school.c), { unread: 0, waiting: 0 });
        const second = await notifications(school.c);
        assert.equal(second.news.length, 2, "seen items stay in the list");
        assert.ok(second.news.every((item) => !item.isNew));

        // Something new: only it counts, and it is the only one marked new.
        await payDirect(ngo.c, project.id, [1]);
        assert.deepEqual(await count(school.c), { unread: 1, waiting: 1 });
        const third = await notifications(school.c);
        assert.deepEqual(third.actions.map((item) => item.isNew), [true]);
        assert.ok(third.news.every((item) => !item.isNew));

        // Seen, but not dealt with: it stops counting as new and keeps waiting.
        assert.equal((await school.c.post("/api/notifications/seen")).status, 200);
        assert.deepEqual(await count(school.c), { unread: 0, waiting: 1 });
        // The NGO's bell is its own.
        assert.equal((await count(ngo.c)).unread, 0);
    });

    test("“seen” never reaches into the future, never moves backwards, and refuses anything that isn't a date", async () => {
        const donor = await signedIn(donorData, "donor");
        for (const asOf of ["yesterday", 12345, "", null]) assert.equal((await donor.c.post("/api/notifications/seen", { json: { asOf } })).status, 400, JSON.stringify(asOf));

        const before = Date.now();
        const future = await donor.c.post("/api/notifications/seen", { json: { asOf: new Date(Date.now() + 86400000).toISOString() } });
        assert.equal(future.status, 200);
        const seenAt = new Date(future.body.seenAt).getTime();
        assert.ok(seenAt >= before && seenAt <= Date.now(), "a future time is treated as now");

        const older = await donor.c.post("/api/notifications/seen", { json: { asOf: new Date(Date.now() - 3600000).toISOString() } });
        assert.equal(older.status, 200);
        assert.equal(older.body.seenAt, future.body.seenAt, "an older list doesn't undo a newer one");
        assert.equal(String((await User.findById(donor.id)).notificationsSeenAt.toISOString()), future.body.seenAt);
    });
});

describe("who may ask", () => {
    test("only a signed-in school, NGO or donor: admins get 403 and visitors 401", async () => {
        for (const [method, path] of [["get", "/api/notifications"], ["get", "/api/notifications/count"], ["post", "/api/notifications/seen"]]) {
            assert.equal((await admin[method](path)).status, 403, `admin ${path}`);
            assert.equal((await newClient()[method](path)).status, 401, `visitor ${path}`);
        }
    });

    test("an account gets only its own notifications, with nothing private in them, and they are never cached", async () => {
        const school = await signedIn(schoolData, "school");
        const otherSchool = await signedIn(schoolData, "school");
        const ngo = await signedIn(ngoData, "ngo");
        const otherNgo = await signedIn(ngoData, "ngo");
        const project = await approvedProject(school.c, { title: "Only this school's roof repair" });
        await commit(ngo.c, project.id, [1]);
        await payDirect(ngo.c, project.id, [1]);

        for (const stranger of [otherSchool, otherNgo]) {
            const list = await notifications(stranger.c);
            assert.deepEqual([list.actions, list.news, list.unread], [[], [], 0]);
        }
        const res = await school.c.get("/api/notifications");
        assert.equal(res.headers.get("cache-control"), "no-store");
        assert.equal((await school.c.get("/api/notifications/count")).headers.get("cache-control"), "no-store");
        assert.deepEqual(Object.keys(res.body).sort(), ["actions", "asOf", "news", "seenAt", "summary", "unread"]);
        for (const item of [...res.body.actions, ...res.body.news]) {
            assert.deepEqual(Object.keys(item).filter((key) => !["detail", "button"].includes(key)).sort(), ["at", "id", "isNew", "kind", "text", "title", "to", "tone"]);
        }
        const text = JSON.stringify([res.body, await notifications(ngo.c)]);
        for (const hidden of ["password", "tokenVersion", "bankAccount", "ifsc", school.data.bankAccount, school.data.email, ngo.data.email, "UTR0", "proof"]) {
            assert.ok(!text.includes(hidden), `${hidden} leaked`);
        }
    });
});

describe("emails for the important moments", () => {
    test("account approved: a sign-in link. Account rejected: the reason and how to reach the team", async () => {
        const approved = ngoData({ contactName: "Meera Nair" });
        const rejected = schoolData({ principalName: "Ravi Shankar" });
        assert.equal((await register(newClient(), approved)).status, 201);
        assert.equal((await register(newClient(), rejected)).status, 201);
        const [a, r] = await Promise.all([approved, rejected].map((d) => User.findOne({ email: d.email.toLowerCase() })));
        assert.equal((await admin.patch(`/api/admin/accounts/${a._id}/approve`)).status, 200);
        assert.equal((await admin.patch(`/api/admin/accounts/${r._id}/reject`, { json: { reason: "The UDISE code does not match the school named." } })).status, 200);

        const emails = await sent();
        assert.equal(emails.length, 2);
        const welcome = emails.find((m) => m.to === a.email);
        assert.equal(welcome.subject, "Your VIDYADAAN account is approved");
        assert.equal(welcome.from, EMAIL_FROM);
        assert.match(welcome.text, new RegExp(`Hello ${a.name},`));
        assert.match(welcome.text, /approved your NGO account\. You can sign in now\./);
        assert.ok(welcome.text.includes(`Sign in: ${FRONTEND_ORIGIN}/login/ngo`));
        assert.ok(welcome.html.includes(`href="${FRONTEND_ORIGIN}/login/ngo"`));

        const sorry = emails.find((m) => m.to === r.email);
        assert.equal(sorry.subject, "Your VIDYADAAN registration was not approved");
        assert.ok(sorry.text.includes("REASON: The UDISE code does not match the school named."));
        assert.ok(sorry.text.includes(`${FRONTEND_ORIGIN}/contact`));
        for (const m of emails) assert.ok(!/password|token/i.test(m.text), "no secrets in the email");
    });

    test("project and event decisions go to the school, with the reviewer's words when changes are requested", async () => {
        const school = await signedIn(schoolData, "school");
        const good = await approvedProject(school.c, { title: "Roof repair for the east wing" });
        const bad = await createProject(school.c, { title: "New furniture <b>urgent</b>" });
        assert.equal((await admin.patch(`/api/admin/projects/${bad.id}/reject`, { json: { reason: "Please say how many benches & desks are needed." } })).status, 200);
        const event = await approvedEvent(school.c, { title: "Independence Day" });
        const fair = await createEvent(school.c, { title: "Book fair" });
        assert.equal((await admin.patch(`/api/admin/events/${fair.id}/reject`, { json: { reason: "Please add the venue." } })).status, 200);

        const emails = await sent();
        assert.equal(emails.length, 4);
        assert.ok(emails.every((m) => m.to === school.data.email.toLowerCase()), "only the school is emailed");
        const bySubject = (subject) => emails.find((m) => m.subject === subject);

        const approved = bySubject("Your project is approved: Roof repair for the east wing");
        assert.match(approved.text, /NGOs and donors can now see it and fund it\./);
        assert.ok(!/alum/i.test(approved.text), "no alumni were emailed, so the email doesn't say they were");
        assert.ok(approved.text.includes(`View project: ${FRONTEND_ORIGIN}/dashboard/school/progress?project=${good.id}`));

        const changes = bySubject("Changes requested for your project: New furniture <b>urgent</b>");
        assert.ok(changes.text.includes("CHANGES REQUESTED: Please say how many benches & desks are needed."));
        assert.ok(changes.text.includes(`Edit project: ${FRONTEND_ORIGIN}/dashboard/school/progress?project=${bad.id}`));
        // Whatever a person typed is escaped in the HTML version.
        assert.ok(changes.html.includes("New furniture &lt;b&gt;urgent&lt;/b&gt;") && !changes.html.includes("<b>urgent</b>"));
        assert.ok(changes.html.includes("benches &amp; desks"));

        assert.match(bySubject("Your event is approved: Independence Day").text, /NGOs and donors can now see it and offer help/);
        assert.ok(bySubject("Changes requested for your event: Book fair").text.includes("CHANGES REQUESTED: Please add the venue."));
        assert.ok(event.id);
    });

    test("a school's decision on a payment goes to the NGO that paid", async () => {
        const school = await signedIn(schoolData, "school", { schoolName: "Govt. High School, Sagar" });
        const ngo = await signedIn(ngoData, "ngo");
        const project = await approvedProject(school.c, { title: "Smart classroom" });
        await commit(ngo.c, project.id, [1, 2, 3]);
        const first = await payDirect(ngo.c, project.id, [1]);
        const second = await payDirect(ngo.c, project.id, [2, 3]);
        await sent();
        outbox.length = 0;

        assert.equal((await school.c.patch(`/api/school/payments/${first.id}/accept`)).status, 200);
        assert.equal((await school.c.patch(`/api/school/payments/${second.id}/reject`, { json: { reason: "The amount credited was ₹4,000, not ₹40,000." } })).status, 200);
        const emails = await sent();
        assert.equal(emails.length, 2);
        assert.ok(emails.every((m) => m.to === ngo.data.email.toLowerCase()));
        const accepted = emails.find((m) => m.subject === "Payment accepted: ₹20,000 to Govt. High School, Sagar");
        assert.match(accepted.text, /confirmed that your payment of ₹20,000 for “Smart classroom” \(part 1\) reached its account/);
        const rejected = emails.find((m) => m.subject === "Payment not confirmed: ₹40,000 to Govt. High School, Sagar");
        assert.ok(rejected.text.includes("THE SCHOOL'S REASON: The amount credited was ₹4,000, not ₹40,000."));
        assert.match(rejected.text, /Your parts stay reserved for your NGO/);
        assert.ok(rejected.text.includes(`Open Funding: ${FRONTEND_ORIGIN}/dashboard/ngo#funding`));
        for (const m of emails) assert.ok(!/UTR0|bank account number|ifsc/i.test(m.text), "no payment reference or bank details in the email");
    });

    test("a school's answer to an offer of help goes to whoever offered, with the school's note", async () => {
        const school = await signedIn(schoolData, "school", { schoolName: "Govt. Primary School, Honnali" });
        const ngo = await signedIn(ngoData, "ngo");
        const donor = await signedIn(donorData, "donor");
        const event = await approvedEvent(school.c, { title: "Annual Sports Meet" });
        await offerHelp(ngo.c, event.id, { kinds: ["Volunteers"] });
        await offerHelp(donor.c, event.id, { kinds: ["Prizes or gifts"], shareContact: true });
        await sent();
        outbox.length = 0;

        const offers = (await school.c.get("/api/school/events")).body.events[0].offers;
        const offerOf = (role) => offers.find((o) => o.role === role).id;
        assert.equal((await school.c.patch(`/api/school/events/${event.id}/offers/${offerOf("ngo")}`, { json: { decision: "ACCEPTED", note: "Please call the office on Monday." } })).status, 200);
        assert.equal((await school.c.patch(`/api/school/events/${event.id}/offers/${offerOf("donor")}`, { json: { decision: "DECLINED" } })).status, 200);

        const emails = await sent();
        assert.equal(emails.length, 2);
        const yes = emails.find((m) => m.to === ngo.data.email.toLowerCase());
        assert.equal(yes.subject, "Your offer of help was accepted: Annual Sports Meet");
        assert.match(yes.text, /Govt\. Primary School, Honnali has accepted your offer \(Volunteers\) for “Annual Sports Meet”/);
        assert.ok(yes.text.includes("NOTE FROM THE SCHOOL: Please call the office on Monday."));
        assert.ok(yes.text.includes(`${FRONTEND_ORIGIN}/dashboard/ngo#events`));
        const no = emails.find((m) => m.to === donor.data.email.toLowerCase());
        assert.equal(no.subject, "Your offer of help was declined: Annual Sports Meet");
        assert.ok(!no.text.includes("NOTE FROM THE SCHOOL"));
        assert.ok(no.text.includes(`${FRONTEND_ORIGIN}/dashboard/donor#events`));
        // The school's own contact details are never sent to supporters.
        for (const m of emails) assert.ok(!m.text.includes(school.data.email) && !m.text.includes(school.data.phone));
    });

    test("an email that can't be sent never changes the action: it still succeeds and still shows under Notifications", async () => {
        const school = await signedIn(schoolData, "school");
        failSending = true;
        const project = await approvedProject(school.c, { title: "Playground equipment" });
        const event = await approvedEvent(school.c);
        assert.equal((await sent()).length, 0);
        const list = await notifications(school.c);
        assert.match(one(list.news, "Project approved").text, /Playground equipment/);
        assert.equal(titled(list.news, "Event approved").length, 1);
        assert.ok(project.id && event.id);
    });

    test("without an email service nothing is sent and every action still works", async () => {
        delete process.env.EMAIL_FROM;
        const school = await signedIn(schoolData, "school");
        const ngo = await signedIn(ngoData, "ngo");
        const project = await approvedProject(school.c);
        await commit(ngo.c, project.id, [4]);
        const payment = await payDirect(ngo.c, project.id, [4]);
        assert.equal((await school.c.patch(`/api/school/payments/${payment.id}/accept`)).status, 200);
        assert.equal((await sent()).length, 0);
        assert.equal(titled((await notifications(ngo.c)).news, "The school accepted your payment").length, 1);
    });
});
