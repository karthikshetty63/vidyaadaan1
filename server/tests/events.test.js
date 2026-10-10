import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import { PASSWORD, createAdmin, createClient, donorData, login, ngoData, registerActive, schoolData, startTestServer } from "./helpers.js";
import { EVENT_HELP_KINDS, OFFERS_PER_EVENT_MAX, validateEvent, validateEventOffer, validateOfferDecision } from "../../shared/eventRules.js";

// School events and offers of help, NGO and donor profile editing, and the school's list of donations.

let server;
let admin;
let models;
let activityWritesSettled;
const newClient = () => createClient(server.baseUrl);
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

const signedIn = async (factory, role, overrides) => {
    const data = factory(overrides);
    await registerActive(newClient(), data);
    const c = newClient();
    assert.equal((await login(c, data.email, PASSWORD, role)).status, 200);
    const user = await models.User.findOne({ email: data.email.toLowerCase() });
    return { c, data, id: String(user._id) };
};
let n = 0;
const eventData = (overrides = {}) => ({
    title: `Annual Sports Day ${(n += 1)}`,
    type: "Sports Day",
    date: inDays(30),
    venue: "School playground",
    description: "Track events, kabaddi and kho-kho for classes 1 to 7, with prizes for every class.",
    expectedStudents: "300",
    helpNeeded: ["Volunteers", "Prizes or gifts"],
    helpDetails: "Ten volunteers to run the events, and 60 medals.",
    ...overrides,
});
const createEvent = async (c, overrides) => {
    const res = await c.post("/api/school/events", { json: eventData(overrides) });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.event;
};
const approve = async (id) => assert.equal((await admin.patch(`/api/admin/events/${id}/approve`)).status, 200);
const approvedEvent = async (c, overrides) => {
    const event = await createEvent(c, overrides);
    await approve(event.id);
    return event;
};
const openEvents = async (c) => (await c.get("/api/events")).body.events;

before(async () => {
    server = await startTestServer();
    models = {
        User: (await import("../models/User.js")).default,
        SchoolEvent: (await import("../models/SchoolEvent.js")).default,
        Donation: (await import("../models/Donation.js")).default,
        Project: (await import("../models/Project.js")).default,
        ActivityEvent: (await import("../models/ActivityEvent.js")).default,
    };
    ({ activityWritesSettled } = await import("../services/activityLog.js"));
    const credentials = await createAdmin();
    admin = newClient();
    assert.equal((await login(admin, credentials.email, PASSWORD, "admin")).status, 200);
});
after(() => server.stop());

describe("event rules", () => {
    test("a new event needs a name, type, future date, description, students and at least one kind of help", () => {
        assert.deepEqual(Object.keys(validateEvent({}).errors).sort(), ["date", "description", "expectedStudents", "helpNeeded", "title", "type"]);
        assert.deepEqual(validateEvent(eventData()).errors, {});
        assert.match(validateEvent(eventData({ date: inDays(-1) })).errors.date, /can't be in the past/);
        assert.match(validateEvent(eventData({ date: inDays(800) })).errors.date, /within the next 2 years/);
        assert.ok(validateEvent(eventData({ type: "Rave" })).errors.type);
        assert.ok(validateEvent(eventData({ helpNeeded: ["Money in cash"] })).errors.helpNeeded);
        assert.ok(validateEvent(eventData({ description: "Too short" })).errors.description);
        // Help kinds come back in the list's own order, without duplicates.
        assert.deepEqual(validateEvent(eventData({ helpNeeded: ["Sponsorship", "Volunteers", "Volunteers"] })).values.helpNeeded, ["Volunteers", "Sponsorship"]);
    });

    test("offers: a donor must agree to share their name and email; “Other” needs a message", () => {
        assert.deepEqual(validateEventOffer({ kinds: ["Volunteers"] }, { role: "ngo" }).errors, {});
        assert.ok(validateEventOffer({ kinds: [] }, { role: "ngo" }).errors.kinds);
        assert.ok(validateEventOffer({ kinds: ["Other"] }, { role: "ngo" }).errors.message);
        assert.ok(validateEventOffer({ kinds: ["Volunteers"] }, { role: "donor" }).errors.shareContact);
        assert.ok(validateEventOffer({ kinds: ["Volunteers"], shareContact: "yes" }, { role: "donor" }).errors.shareContact);
        assert.deepEqual(validateEventOffer({ kinds: ["Volunteers"], shareContact: true }, { role: "donor" }).errors, {});
        // An NGO can't send fields that aren't its own, such as an amount.
        assert.ok(validateEventOffer({ kinds: ["Sponsorship"], amount: 5000 }, { role: "ngo" }).errors.amount);
        assert.ok(validateEventOffer({ kinds: ["Volunteers"], message: "x".repeat(501) }, { role: "ngo" }).errors.message);
    });

    test("a school's answer is Accept or Decline, with an optional short note", () => {
        assert.deepEqual(validateOfferDecision({ decision: "ACCEPTED", note: " Thank you " }).values, { decision: "ACCEPTED", note: "Thank you" });
        assert.ok(validateOfferDecision({ decision: "MAYBE" }).errors.decision);
        assert.ok(validateOfferDecision({ decision: "DECLINED", note: "x".repeat(301) }).errors.note);
        assert.ok(validateOfferDecision({ decision: "ACCEPTED", status: "ACCEPTED" }).errors.status);
    });
});

describe("posting and reviewing an event", () => {
    test("a school posts an event; it waits for review and nobody else can see it", async () => {
        const school = await signedIn(schoolData, "school");
        const ngo = await signedIn(ngoData, "ngo");
        const created = await school.c.post("/api/school/events", { json: eventData({ title: "Science fair for class 8" }) });
        assert.equal(created.status, 201);
        assert.equal(created.body.event.reviewStatus, "PENDING_REVIEW");
        assert.equal(created.body.event.status, "Scheduled");
        assert.deepEqual(created.body.event.offers, []);
        assert.equal((await school.c.get("/api/school/events")).body.events.length, 1);
        assert.ok(!(await openEvents(ngo.c)).some((e) => e.title === "Science fair for class 8"));
        // It can't be offered help before approval either.
        assert.equal((await ngo.c.post(`/api/events/${created.body.event.id}/offers`, { json: { kinds: ["Volunteers"] } })).status, 404);
    });

    test("fields the school may not set are refused; only schools can post", async () => {
        const school = await signedIn(schoolData, "school");
        for (const extra of [{ reviewStatus: "OPEN" }, { school: "000000000000000000000000" }, { offers: [] }, { status: "Completed" }]) {
            const res = await school.c.post("/api/school/events", { json: { ...eventData(), ...extra } });
            assert.equal(res.status, 400, JSON.stringify(extra));
            assert.match(res.body.message, /Unexpected field/);
        }
        const ngo = await signedIn(ngoData, "ngo");
        const donor = await signedIn(donorData, "donor");
        assert.equal((await ngo.c.post("/api/school/events", { json: eventData() })).status, 403);
        assert.equal((await donor.c.get("/api/school/events")).status, 403);
        assert.equal((await newClient().get("/api/school/events")).status, 401);
        assert.equal((await newClient().get("/api/events")).status, 401);
        assert.equal((await school.c.get("/api/events")).status, 403);
    });

    test("only admins review; approve once, reject with a reason, never for an inactive school", async () => {
        const school = await signedIn(schoolData, "school", { schoolName: "Govt. School, Brahmavar" });
        const event = await createEvent(school.c);
        const other = await createEvent(school.c);
        assert.equal((await school.c.patch(`/api/admin/events/${event.id}/approve`)).status, 403);
        assert.equal((await newClient().get("/api/admin/events")).status, 401);

        const queue = await admin.get("/api/admin/events");
        assert.equal(queue.status, 200);
        const row = queue.body.events.find((e) => e.id === event.id);
        assert.equal(row.school.name, "Govt. School, Brahmavar");
        assert.ok(queue.body.counts.PENDING_REVIEW >= 2);
        assert.equal((await admin.get(`/api/admin/events/${event.id}`)).body.event.title, event.title);
        assert.equal((await admin.get("/api/admin/events?status=LATER")).status, 400);

        assert.equal((await admin.patch(`/api/admin/events/${other.id}/reject`, { json: { reason: "no" } })).status, 400);
        const rejected = await admin.patch(`/api/admin/events/${other.id}/reject`, { json: { reason: "Please say where the event will be held." } });
        assert.equal(rejected.status, 200);
        assert.equal(rejected.body.event.reviewStatus, "REJECTED");
        assert.equal((await admin.patch(`/api/admin/events/${other.id}/approve`)).status, 409);

        const approved = await admin.patch(`/api/admin/events/${event.id}/approve`);
        assert.equal(approved.status, 200);
        assert.equal(approved.body.event.reviewStatus, "OPEN");
        assert.equal((await admin.patch(`/api/admin/events/${event.id}/approve`)).status, 409);
        assert.equal((await admin.patch(`/api/admin/events/${event.id}/reject`, { json: { reason: "Changed my mind." } })).status, 409);

        const waiting = await createEvent(school.c);
        await models.User.updateOne({ _id: school.id }, { $set: { accountStatus: "rejected" } });
        const refused = await admin.patch(`/api/admin/events/${waiting.id}/approve`);
        assert.equal(refused.status, 409);
        assert.match(refused.body.message, /not active/);
    });

    test("editing: anything while waiting, resubmit after changes are requested, only date and status once approved", async () => {
        const school = await signedIn(schoolData, "school");
        const event = await createEvent(school.c);
        const patch = (id, json) => school.c.patch(`/api/school/events/${id}`, { json });

        const edited = await patch(event.id, { title: "Annual Sports Day (edited)", helpNeeded: ["Volunteers"] });
        assert.equal(edited.status, 200);
        assert.equal(edited.body.event.reviewStatus, "PENDING_REVIEW");
        assert.equal((await patch(event.id, { status: "Completed" })).status, 400, "no status before approval");

        assert.equal((await admin.patch(`/api/admin/events/${event.id}/reject`, { json: { reason: "Add the number of students." } })).status, 200);
        assert.equal((await school.c.get("/api/school/events")).body.events.find((e) => e.id === event.id).rejectionReason, "Add the number of students.");
        const resubmitted = await patch(event.id, { expectedStudents: 320 });
        assert.equal(resubmitted.body.message, "Event sent for review again.");
        assert.equal(resubmitted.body.event.reviewStatus, "PENDING_REVIEW");
        assert.equal(resubmitted.body.event.rejectionReason, null);

        await approve(event.id);
        const locked = await patch(event.id, { description: "A completely different event that nobody reviewed at all." });
        assert.equal(locked.status, 400);
        assert.match(locked.body.message, /can't be changed/);
        assert.equal((await patch(event.id, { date: inDays(-2) })).status, 400, "not into the past");
        const postponed = await patch(event.id, { date: inDays(45) });
        assert.equal(postponed.status, 200);
        assert.equal(postponed.body.event.date, inDays(45));
        assert.equal(postponed.body.event.reviewStatus, "OPEN", "a new date needs no second review");
        assert.equal((await patch(event.id, { status: "Cancelled" })).body.event.status, "Cancelled");

        // Another school's event doesn't exist for this one.
        const stranger = await signedIn(schoolData, "school");
        assert.equal((await stranger.c.patch(`/api/school/events/${event.id}`, { json: { status: "Scheduled" } })).status, 404);
    });
});

describe("offers of help", () => {
    test("NGOs and donors see approved, upcoming events: the event and the school's name and place, nothing more", async () => {
        const school = await signedIn(schoolData, "school", { schoolName: "Govt. School, Kaup", district: "Udupi" });
        const event = await approvedEvent(school.c, { title: "Reading week at Kaup" });
        const ngo = await signedIn(ngoData, "ngo");
        const donor = await signedIn(donorData, "donor");
        for (const who of [ngo, donor]) {
            const seen = (await openEvents(who.c)).find((e) => e.id === event.id);
            assert.deepEqual(Object.keys(seen).sort(), ["date", "description", "expectedStudents", "helpDetails", "helpNeeded", "id", "myOffer", "openForOffers", "school", "status", "title", "type", "venue"]);
            assert.deepEqual(seen.school, { name: "Govt. School, Kaup", district: "Udupi", state: "Karnataka" });
            assert.equal(seen.myOffer, null);
            assert.equal(seen.openForOffers, true);
            const raw = JSON.stringify(seen);
            assert.ok(!raw.includes(school.data.email) && !raw.includes("9876543210") && !raw.includes(school.data.bankAccount));
        }
    });

    test("offer, the school sees who to contact, answers once; the supporter sees the answer", async () => {
        const school = await signedIn(schoolData, "school");
        const event = await approvedEvent(school.c);
        const ngo = await signedIn(ngoData, "ngo", { ngoName: "Karavali Seva Trust" });
        const donor = await signedIn(donorData, "donor", { name: "Meera Event Donor" });

        const fromNgo = await ngo.c.post(`/api/events/${event.id}/offers`, { json: { kinds: ["Volunteers"], message: "We can send eight volunteers for the day." } });
        assert.equal(fromNgo.status, 201, JSON.stringify(fromNgo.body));
        assert.equal(fromNgo.body.event.myOffer.status, "OFFERED");
        assert.equal((await ngo.c.post(`/api/events/${event.id}/offers`, { json: { kinds: ["Sponsorship"] } })).status, 409, "one offer per supporter");

        const noConsent = await donor.c.post(`/api/events/${event.id}/offers`, { json: { kinds: ["Prizes or gifts"] } });
        assert.equal(noConsent.status, 400);
        assert.ok(noConsent.body.errors.shareContact);
        assert.equal((await donor.c.post(`/api/events/${event.id}/offers`, { json: { kinds: ["Prizes or gifts"], shareContact: true } })).status, 201);

        // A supporter sees only their own offer.
        const donorView = (await openEvents(donor.c)).find((e) => e.id === event.id);
        assert.deepEqual(donorView.myOffer.kinds, ["Prizes or gifts"]);
        assert.ok(!JSON.stringify(donorView).includes("Karavali"), "never another supporter");

        // The school sees both, with how to reach them.
        const mine = (await school.c.get("/api/school/events")).body.events.find((e) => e.id === event.id);
        assert.equal(mine.offers.length, 2);
        const ngoOffer = mine.offers.find((o) => o.role === "ngo");
        const donorOffer = mine.offers.find((o) => o.role === "donor");
        assert.equal(ngoOffer.supporter.name, "Karavali Seva Trust");
        assert.equal(ngoOffer.supporter.email, ngo.data.email.toLowerCase());
        assert.ok(ngoOffer.supporter.phone);
        assert.equal(donorOffer.supporter.name, "Meera Event Donor");
        assert.equal(donorOffer.supporter.email, donor.data.email.toLowerCase());
        assert.equal(donorOffer.supporter.phone, undefined, "a donor shares name and email only");

        // Another school can't answer it.
        const stranger = await signedIn(schoolData, "school");
        assert.equal((await stranger.c.patch(`/api/school/events/${event.id}/offers/${ngoOffer.id}`, { json: { decision: "ACCEPTED" } })).status, 404);
        assert.equal((await ngo.c.patch(`/api/school/events/${event.id}/offers/${ngoOffer.id}`, { json: { decision: "ACCEPTED" } })).status, 403);

        const accepted = await school.c.patch(`/api/school/events/${event.id}/offers/${ngoOffer.id}`, { json: { decision: "ACCEPTED", note: "Thank you. Please come by 8 am." } });
        assert.equal(accepted.status, 200);
        assert.equal(accepted.body.event.offers.find((o) => o.id === ngoOffer.id).status, "ACCEPTED");
        assert.equal((await school.c.patch(`/api/school/events/${event.id}/offers/${ngoOffer.id}`, { json: { decision: "DECLINED" } })).status, 409, "an answer is final");
        assert.equal((await school.c.patch(`/api/school/events/${event.id}/offers/${ngoOffer.id}`, { json: { decision: "LATER" } })).status, 400);

        const ngoView = (await ngo.c.get("/api/events/mine")).body.events.find((e) => e.id === event.id);
        assert.equal(ngoView.myOffer.status, "ACCEPTED");
        assert.equal(ngoView.myOffer.note, "Thank you. Please come by 8 am.");
        const cannotWithdraw = await ngo.c.delete(`/api/events/${event.id}/offers`);
        assert.equal(cannotWithdraw.status, 409);
        assert.match(cannotWithdraw.body.message, /already answered/);

        // The donor's offer is still unanswered: it can be withdrawn, and then it is gone for the school.
        assert.equal((await donor.c.delete(`/api/events/${event.id}/offers`)).status, 200);
        assert.equal((await donor.c.delete(`/api/events/${event.id}/offers`)).status, 404);
        assert.equal((await school.c.get("/api/school/events")).body.events.find((e) => e.id === event.id).offers.length, 1);
        assert.deepEqual((await donor.c.get("/api/events/mine")).body.events, []);
    });

    test("no offers on events that are cancelled, completed, over, or from a school that is no longer active", async () => {
        const school = await signedIn(schoolData, "school");
        const ngo = await signedIn(ngoData, "ngo");
        const offer = (id) => ngo.c.post(`/api/events/${id}/offers`, { json: { kinds: ["Volunteers"] } });

        const cancelled = await approvedEvent(school.c);
        assert.equal((await school.c.patch(`/api/school/events/${cancelled.id}`, { json: { status: "Cancelled" } })).status, 200);
        const past = await approvedEvent(school.c);
        await models.SchoolEvent.updateOne({ _id: past.id }, { $set: { date: new Date(Date.now() - 3 * 86400000) } });
        const kept = await approvedEvent(school.c);
        assert.equal((await offer(kept.id)).status, 201);
        assert.equal((await school.c.patch(`/api/school/events/${kept.id}`, { json: { status: "Completed" } })).status, 200);

        const ids = (await openEvents(ngo.c)).map((e) => e.id);
        for (const event of [cancelled, past, kept]) {
            assert.ok(!ids.includes(event.id));
        }
        assert.equal((await offer(cancelled.id)).status, 404);
        assert.equal((await offer(past.id)).status, 404);
        // An event you offered to help with stays in "my offers" after it is completed.
        const mine = (await ngo.c.get("/api/events/mine")).body.events;
        assert.deepEqual(mine.map((e) => [e.id, e.status, e.openForOffers]), [[kept.id, "Completed", false]]);

        const live = await approvedEvent(school.c);
        assert.ok((await openEvents(ngo.c)).some((e) => e.id === live.id));
        await models.User.updateOne({ _id: school.id }, { $set: { accountStatus: "rejected" } });
        assert.ok(!(await openEvents(ngo.c)).some((e) => e.id === live.id));
        assert.equal((await offer(live.id)).status, 404);
    });

    test("an event takes a limited number of offers", async () => {
        const school = await signedIn(schoolData, "school");
        const event = await approvedEvent(school.c);
        const filler = Array.from({ length: OFFERS_PER_EVENT_MAX }, () => ({ supporter: new server.mongoose.Types.ObjectId(), role: "ngo", kinds: [EVENT_HELP_KINDS[0]], offeredAt: new Date() }));
        await models.SchoolEvent.updateOne({ _id: event.id }, { $set: { offers: filler } });
        const ngo = await signedIn(ngoData, "ngo");
        const res = await ngo.c.post(`/api/events/${event.id}/offers`, { json: { kinds: ["Volunteers"] } });
        assert.equal(res.status, 409);
        assert.match(res.body.message, /as many offers/);
    });

    test("events are recorded in the activity log, without contact details", async () => {
        const school = await signedIn(schoolData, "school");
        const event = await approvedEvent(school.c, { title: "Logged plantation drive", type: "Plantation Drive" });
        const donor = await signedIn(donorData, "donor");
        assert.equal((await donor.c.post(`/api/events/${event.id}/offers`, { json: { kinds: ["Materials or supplies"], message: "100 saplings.", shareContact: true } })).status, 201);
        const offerId = (await school.c.get("/api/school/events")).body.events.find((e) => e.id === event.id).offers[0].id;
        assert.equal((await school.c.patch(`/api/school/events/${event.id}/offers/${offerId}`, { json: { decision: "DECLINED", note: "We already have saplings, thank you." } })).status, 200);
        await activityWritesSettled();
        const logged = await models.ActivityEvent.find({ "target.id": event.id }).sort({ at: 1, _id: 1 }).lean();
        assert.deepEqual(logged.map((e) => e.action), ["event.submitted", "event.approved", "event.offer_made", "event.offer_declined"]);
        assert.ok(logged.every((e) => e.category === "event" && e.target.label === "Logged plantation drive"));
        assert.ok(!JSON.stringify(logged).includes(donor.data.email));
        // And the Control Tower counts them.
        const overview = (await admin.get("/api/admin/monitor/overview")).body;
        assert.ok(overview.events.approved >= 1);
        assert.ok(overview.events.offers.declined >= 1);
        assert.equal(typeof overview.queues.events.count, "number");
    });
});

describe("NGO and donor profile editing", () => {
    test("an NGO edits its contact details; its verified identity stays locked", async () => {
        const ngo = await signedIn(ngoData, "ngo", { ngoName: "Locked Name Trust" });
        const res = await ngo.c.patch("/api/profile/ngo", { json: { contactName: "Asha Rao", phone: "98450 12345", website: "https://lockedname.example.org", focus: ["Health"], altPhone: "" } });
        assert.equal(res.status, 200, JSON.stringify(res.body));
        assert.equal(res.body.profile.contactName, "Asha Rao");
        assert.equal(res.body.profile.phone, "+919845012345");
        assert.deepEqual(res.body.profile.focus, ["Health"]);
        assert.equal(res.body.profile.ngoName, "Locked Name Trust");
        // The contact person is the account name.
        assert.equal((await ngo.c.get("/api/auth/me")).body.user.name, "Asha Rao");

        for (const locked of [{ ngoName: "Another Trust" }, { pan: "ABCDE1234F" }, { regNumber: "X/1" }, { state: "Kerala" }, { email: "new@example.org" }, { userId: "000000000000000000000000" }]) {
            const refused = await ngo.c.patch("/api/profile/ngo", { json: locked });
            assert.equal(refused.status, 400, JSON.stringify(locked));
            assert.match(refused.body.message, /can't be changed here/);
        }
        assert.equal((await ngo.c.patch("/api/profile/ngo", { json: { phone: "12345" } })).status, 400);
        assert.equal((await ngo.c.patch("/api/profile/ngo", { json: { mission: "" } })).status, 400, "the mission is required");
        assert.equal((await ngo.c.patch("/api/profile/ngo", { json: {} })).status, 400);
    });

    test("a donor edits contact details and preferences; name, email and PAN stay locked", async () => {
        const donor = await signedIn(donorData, "donor");
        const res = await donor.c.patch("/api/profile/donor", { json: { phone: "9900112233", city: "Mangaluru", pin: "575001", causes: ["Classrooms"], frequency: "Quarterly", anonymous: true } });
        assert.equal(res.status, 200, JSON.stringify(res.body));
        assert.equal(res.body.profile.city, "Mangaluru");
        assert.equal(res.body.profile.anonymous, true);
        assert.deepEqual(res.body.profile.causes, ["Classrooms"]);
        for (const locked of [{ name: "Someone Else" }, { email: "x@example.com" }, { dob: "1980-01-01" }, { documents: {} }]) {
            assert.equal((await donor.c.patch("/api/profile/donor", { json: locked })).status, 400, JSON.stringify(locked));
        }
        assert.equal((await donor.c.patch("/api/profile/donor", { json: { pin: "12" } })).status, 400);
    });

    test("each account edits only its own kind of profile", async () => {
        const ngo = await signedIn(ngoData, "ngo");
        const donor = await signedIn(donorData, "donor");
        const school = await signedIn(schoolData, "school");
        assert.equal((await donor.c.patch("/api/profile/ngo", { json: { phone: "9900112233" } })).status, 403);
        assert.equal((await ngo.c.patch("/api/profile/donor", { json: { phone: "9900112233" } })).status, 403);
        assert.equal((await school.c.patch("/api/profile/ngo", { json: { phone: "9900112233" } })).status, 403);
        assert.equal((await newClient().patch("/api/profile/donor", { json: { phone: "9900112233" } })).status, 401);
    });
});

describe("a school's list of donor donations", () => {
    test("amounts and dates of its own confirmed donations, never the donors", async () => {
        const school = await signedIn(schoolData, "school");
        const other = await signedIn(schoolData, "school");
        const donor = await signedIn(donorData, "donor", { name: "Hidden Donor Name" });
        const project = (await school.c.post("/api/school/projects", {
            json: { title: "Library shelves for class 5", category: "Library", priority: "Medium", budget: "50000", studentsBenefited: "40", problem: "Class 5 keeps its books in boxes on the floor, so most are damaged.", expectedCompletion: inDays(60) },
        })).body.project;
        const base = { project: project.id, mode: "test" };
        await models.Donation.create([
            { ...base, donor: donor.id, school: school.id, amount: 900, status: "PAID", orderId: "order_sd1", paymentId: "pay_sd1", verifiedAt: new Date() },
            { ...base, donor: donor.id, school: school.id, amount: 400, status: "CREATED", orderId: "order_sd2" },
            { ...base, donor: donor.id, school: other.id, amount: 7777, status: "PAID", orderId: "order_sd3", paymentId: "pay_sd3", verifiedAt: new Date() },
        ]);
        const res = await school.c.get("/api/school/donations");
        assert.equal(res.status, 200);
        assert.equal(res.body.donations.length, 1);
        assert.deepEqual(Object.keys(res.body.donations[0]).sort(), ["amount", "id", "mode", "project", "verifiedAt"]);
        assert.equal(res.body.donations[0].amount, 900);
        assert.equal(res.body.donations[0].project.title, "Library shelves for class 5");
        const raw = JSON.stringify(res.body);
        assert.ok(!raw.includes("Hidden Donor Name") && !raw.includes(donor.data.email) && !raw.includes(donor.id) && !raw.includes("pay_sd1"));
        assert.equal((await donor.c.get("/api/school/donations")).status, 403);
        assert.equal((await newClient().get("/api/school/donations")).status, 401);
    });
});
