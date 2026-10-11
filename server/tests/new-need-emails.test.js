import assert from "node:assert/strict";
import process from "node:process";
import { after, before, beforeEach, describe, test } from "node:test";
import { FRONTEND_ORIGIN, PASSWORD, createAdmin, createClient, donorData, login, ngoData, register, registerActive, schoolData, startTestServer } from "./helpers.js";

// "A new school need is open" emails to every NGO and donor when a project is approved, the "Stop these
// emails" link, and the setting in NGO and donor Settings. The email service is faked: nothing is sent.
const { setEmailTransport } = await import("../services/emailService.js");
const { MAX_FAILURES_IN_A_ROW } = await import("../services/emailQueue.js");
const { queueNewNeedEmails, resumeNewNeedEmails, waitForNewNeedEmails } = await import("../services/newNeedEmails.js");
const { stopEmailsToken } = await import("../services/emailPreferences.js");

const SUBJECT = "New school need:";
const EMAIL_FROM = "VIDYADAAN <no-reply@vidyadaan.test>";
// Only the new-need emails land here; the school's own and alumni emails are other features.
const outbox = [];
let attempts = 0;
let failSending = false;

let server;
let admin;
let User;
let NewNeedEmail;
const newClient = () => createClient(server.baseUrl);
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
let n = 0;

const signedIn = async (factory, role, overrides) => {
    const data = factory(overrides);
    await registerActive(newClient(), data);
    const c = newClient();
    assert.equal((await login(c, data.email, PASSWORD, role)).status, 200);
    const user = await User.findOne({ email: data.email.toLowerCase() });
    return { c, data, id: String(user._id), email: user.email };
};
const createProject = async (c, overrides = {}) => {
    const res = await c.post("/api/school/projects", {
        json: {
            title: `Science lab equipment ${(n += 1)}`, category: "Science Laboratory", priority: "High", budget: "100000", studentsBenefited: "200",
            problem: "The school has no lab equipment; 200 students learn science only from the textbook.", expectedCompletion: inDays(90), ...overrides,
        },
    });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.project;
};
const approve = (id) => admin.patch(`/api/admin/projects/${id}/approve`);
/** Emails sent so far, once every delivery still running has finished. */
const sent = async () => {
    await waitForNewNeedEmails();
    return outbox;
};
const emailTo = (email) => outbox.find((m) => m.to === email);
const stopTokenIn = (message) => decodeURIComponent(/\/emails\/stop\?token=([^\s"<]+)/.exec(message.text)[1]);
/** Everyone who should get these emails right now. */
const expectedRecipients = async () =>
    (await User.find({ role: { $in: ["ngo", "donor"] }, accountStatus: "active", newNeedEmails: { $ne: false } }).select("email").lean()).map((u) => u.email).sort();

before(async () => {
    process.env.EMAIL_FROM = EMAIL_FROM;
    setEmailTransport({
        sendMail: async (message) => {
            if (!message.subject.startsWith(SUBJECT)) return { messageId: "other" };
            attempts += 1;
            if (failSending) throw new Error("Email service unavailable (simulated)");
            outbox.push(message);
            return { messageId: `test-${outbox.length}` };
        },
    });
    server = await startTestServer();
    User = (await import("../models/User.js")).default;
    NewNeedEmail = (await import("../models/NewNeedEmail.js")).default;
    await NewNeedEmail.init();
    const credentials = await createAdmin();
    admin = newClient();
    assert.equal((await login(admin, credentials.email, PASSWORD, "admin")).status, 200);
});
after(() => server.stop());
beforeEach(async () => {
    await waitForNewNeedEmails();
    outbox.length = 0;
    attempts = 0;
    failSending = false;
    process.env.EMAIL_FROM = EMAIL_FROM;
});

describe("when a project is approved", () => {
    test("every active NGO and donor gets one email; schools, admins and accounts not yet approved don't", async () => {
        const school = await signedIn(schoolData, "school", { schoolName: "Govt. High School, Karkala" });
        const otherSchool = await signedIn(schoolData, "school");
        const ngos = [await signedIn(ngoData, "ngo", { contactName: "Kavya Rao" }), await signedIn(ngoData, "ngo")];
        const donor = await signedIn(donorData, "donor", { name: "Anita Desai" });
        const pending = donorData();
        assert.equal((await register(newClient(), pending)).status, 201);
        const rejected = ngoData();
        assert.equal((await register(newClient(), rejected)).status, 201);
        const rejectedId = (await User.findOne({ email: rejected.email.toLowerCase() }))._id;
        assert.equal((await admin.patch(`/api/admin/accounts/${rejectedId}/reject`, { json: { reason: "Registration number does not match." } })).status, 200);

        const project = await createProject(school.c, { title: "Library shelves and books" });
        assert.equal(outbox.length, 0, "creating a project sends nothing");
        const expected = await expectedRecipients();
        const res = await approve(project.id);
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.supporterEmails, { status: "QUEUED", queued: expected.length });
        assert.match(res.body.message, new RegExp(`Emails about it to ${expected.length} NGOs and donors have been queued\\.$`));

        const emails = await sent();
        assert.deepEqual(emails.map((m) => m.to).sort(), expected, "exactly the active NGOs and donors, once each");
        for (const who of [...ngos, donor]) assert.ok(emailTo(who.email), `${who.email} was not emailed`);
        for (const nobody of [school.email, otherSchool.email, pending.email.toLowerCase(), rejected.email.toLowerCase()]) {
            assert.ok(!emailTo(nobody), `${nobody} should not be emailed`);
        }
        for (const m of emails) {
            assert.equal(typeof m.to, "string", "one address per email");
            assert.equal(m.cc, undefined);
            assert.equal(m.bcc, undefined);
            assert.equal(m.from, EMAIL_FROM);
            assert.equal(m.subject, "New school need: Library shelves and books");
        }
        const records = await NewNeedEmail.find({ project: project.id }).lean();
        assert.equal(records.length, expected.length);
        assert.ok(records.every((r) => r.status === "SENT" && r.sentAt && String(r.school) === school.id));
    });

    test("the email shows the need word for word, a button for what that account can do, and a stop link", async () => {
        const school = await signedIn(schoolData, "school", { schoolName: "Govt. Primary School, Nyamathi", district: "Davangere", state: "Karnataka" });
        const ngo = await signedIn(ngoData, "ngo", { contactName: "Meera Nair" });
        const donor = await signedIn(donorData, "donor", { name: "Ravi Shankar" });
        const problem = "Rain leaks into 3 classrooms <every> monsoon.\nStudents & teachers move to the corridor.";
        const project = await createProject(school.c, { title: "Roof repair for Block A", problem, budget: "125000", studentsBenefited: "240", priority: "Critical", category: "Classroom Development" });
        assert.equal((await approve(project.id)).status, 200);
        await sent();

        const toNgo = emailTo(ngo.email);
        const toDonor = emailTo(donor.email);
        for (const line of [
            "Hello Meera Nair,",
            "Govt. Primary School, Nyamathi (Davangere, Karnataka) has a new need.",
            "PROJECT\nRoof repair for Block A",
            `PROBLEM STATEMENT\n${problem}`,
            "- 240 students will benefit",
            "- Priority: Critical",
            "TARGET: ₹1,25,000",
            "NGOs fund a need in 5 parts",
            `Fund this need: ${FRONTEND_ORIGIN}/projects/${project.id}?for=ngo`,
            `${FRONTEND_ORIGIN}/emails/stop?token=`,
        ]) {
            assert.ok(toNgo.text.includes(line), `NGO email is missing: ${line}`);
        }
        assert.ok(toDonor.text.includes("Hello Ravi Shankar,"));
        assert.ok(toDonor.text.includes(`Donate to this need: ${FRONTEND_ORIGIN}/projects/${project.id}?for=donor`));
        assert.ok(toDonor.text.includes("You can donate any amount you choose"));
        assert.notEqual(stopTokenIn(toNgo), stopTokenIn(toDonor), "each account has its own stop link");
        // Safely escaped in the HTML version.
        assert.ok(toNgo.html.includes("Rain leaks into 3 classrooms &lt;every&gt; monsoon.\nStudents &amp; teachers move to the corridor."));
        assert.ok(!toNgo.html.includes("<every>"));
        assert.ok(toNgo.html.includes(`href="${FRONTEND_ORIGIN}/projects/${project.id}?for=ngo"`));
        // Nothing private about the school, and nobody else's address.
        for (const m of [toNgo, toDonor]) {
            for (const hidden of [school.data.email, school.data.phone, school.data.bankAccount, school.data.ifsc, school.data.udise, school.data.upi]) {
                assert.ok(!m.text.includes(hidden) && !m.html.includes(hidden), `${hidden} leaked`);
            }
            for (const other of outbox.filter((o) => o !== m)) assert.ok(!m.text.includes(other.to) && !m.html.includes(other.to), "another recipient's address leaked");
        }
    });

    test("approving twice, or queueing again, never sends a second email", async () => {
        const school = await signedIn(schoolData, "school");
        await signedIn(ngoData, "ngo");
        const project = await createProject(school.c);
        const results = await Promise.all([approve(project.id), approve(project.id)]);
        assert.deepEqual(results.map((r) => r.status).sort(), [200, 409], "only one approval wins");
        const first = (await sent()).length;
        assert.equal(first, (await expectedRecipients()).length);

        const stored = await (await import("../models/Project.js")).default.findById(project.id).lean();
        assert.deepEqual(await queueNewNeedEmails(stored, { frontendOrigin: FRONTEND_ORIGIN }), { status: "ALREADY_QUEUED", queued: 0 });
        assert.equal((await sent()).length, first, "no duplicates");
    });

    test("rejecting a project, or asking for changes, emails no NGO or donor", async () => {
        const school = await signedIn(schoolData, "school");
        await signedIn(donorData, "donor");
        const project = await createProject(school.c);
        assert.equal((await admin.patch(`/api/admin/projects/${project.id}/reject`, { json: { reason: "Please add an itemised budget." } })).status, 200);
        assert.equal((await sent()).length, 0);
        assert.equal(await NewNeedEmail.countDocuments({ project: project.id }), 0);
    });
});

describe("stopping these emails", () => {
    test("the link in an email stops them for that account only, without signing in", async () => {
        const school = await signedIn(schoolData, "school");
        const quiet = await signedIn(donorData, "donor");
        const keen = await signedIn(ngoData, "ngo");
        assert.equal((await approve((await createProject(school.c)).id)).status, 200);
        await sent();
        const token = stopTokenIn(emailTo(quiet.email));

        const res = await newClient().post("/api/public/emails/stop", { json: { token } });
        assert.equal(res.status, 200);
        assert.match(res.body.message, /won't get emails about new school needs/);
        assert.equal((await User.findById(quiet.id).lean()).newNeedEmails, false);
        assert.equal((await User.findById(keen.id).lean()).newNeedEmails, undefined, "nobody else's choice changes");
        assert.equal((await newClient().post("/api/public/emails/stop", { json: { token } })).status, 200, "using it twice is fine");

        outbox.length = 0;
        assert.equal((await approve((await createProject(school.c)).id)).status, 200);
        await sent();
        assert.ok(!emailTo(quiet.email), "a stopped account gets no more");
        assert.ok(emailTo(keen.email));
    });

    test("a made-up, altered or borrowed link is refused; a school's account can't be changed with one", async () => {
        const a = await signedIn(ngoData, "ngo");
        const b = await signedIn(donorData, "donor");
        const school = await signedIn(schoolData, "school");
        const good = stopEmailsToken(a.id);
        const [, signature] = good.split(".");
        for (const token of [undefined, "", "abc", `${a.id}`, `${a.id}.`, `${a.id}.${signature}x`, `${b.id}.${signature}`, `${good}.extra`, "x".repeat(300), 42]) {
            const res = await newClient().post("/api/public/emails/stop", { json: { token } });
            assert.equal(res.status, 400, `accepted ${JSON.stringify(token)}`);
        }
        assert.equal((await User.findById(a.id).lean()).newNeedEmails, undefined);
        assert.equal((await User.findById(b.id).lean()).newNeedEmails, undefined);
        // Only NGOs and donors have this setting.
        assert.equal((await newClient().post("/api/public/emails/stop", { json: { token: stopEmailsToken(school.id) } })).status, 200);
        assert.equal((await User.findById(school.id).lean()).newNeedEmails, undefined);
    });

    test("in Settings, an NGO or donor sees the choice and changes it; nobody else can", async () => {
        const ngo = await signedIn(ngoData, "ngo");
        const donor = await signedIn(donorData, "donor");
        const school = await signedIn(schoolData, "school");
        for (const who of [ngo, donor]) {
            assert.deepEqual((await who.c.get("/api/notifications/preferences")).body, { newNeedEmails: true });
            const off = await who.c.patch("/api/notifications/preferences", { json: { newNeedEmails: false } });
            assert.equal(off.status, 200);
            assert.equal(off.body.newNeedEmails, false);
            assert.deepEqual((await who.c.get("/api/notifications/preferences")).body, { newNeedEmails: false });
            assert.equal((await who.c.patch("/api/notifications/preferences", { json: { newNeedEmails: true } })).body.newNeedEmails, true);
        }
        for (const body of [{}, { newNeedEmails: "no" }, { newNeedEmails: 0 }, { newNeedEmails: true, role: "admin" }]) {
            assert.equal((await ngo.c.patch("/api/notifications/preferences", { json: body })).status, 400, JSON.stringify(body));
        }
        assert.equal((await school.c.get("/api/notifications/preferences")).status, 403);
        assert.equal((await school.c.patch("/api/notifications/preferences", { json: { newNeedEmails: false } })).status, 403);
        assert.equal((await admin.get("/api/notifications/preferences")).status, 403);
        assert.equal((await newClient().patch("/api/notifications/preferences", { json: { newNeedEmails: false } })).status, 401);
        assert.equal((await User.findById(school.id).lean()).newNeedEmails, undefined);
    });
});

describe("when email can't be sent", () => {
    test("without an email service: the project is still approved, and each email is recorded as not sent", async () => {
        const school = await signedIn(schoolData, "school");
        await signedIn(ngoData, "ngo");
        const project = await createProject(school.c);
        delete process.env.EMAIL_FROM;
        const res = await approve(project.id);
        assert.equal(res.status, 200);
        assert.equal(res.body.project.reviewStatus, "OPEN");
        assert.deepEqual(res.body.supporterEmails, { status: "EMAIL_UNAVAILABLE", queued: 0 });
        assert.match(res.body.message, /Emails to NGOs and donors were not sent: email is not set up on the server\.$/);
        await sent();
        assert.equal(attempts, 0);
        const records = await NewNeedEmail.find({ project: project.id }).lean();
        assert.ok(records.length > 0 && records.every((r) => r.status === "FAILED" && /not configured/.test(r.error)));
    });

    test("when sending keeps failing, it stops after a few tries and records why", async () => {
        const school = await signedIn(schoolData, "school");
        for (let i = 0; i < MAX_FAILURES_IN_A_ROW + 2; i += 1) await signedIn(donorData, "donor");
        const project = await createProject(school.c);
        failSending = true;
        assert.equal((await approve(project.id)).status, 200);
        await sent();
        assert.equal(attempts, MAX_FAILURES_IN_A_ROW);
        const records = await NewNeedEmail.find({ project: project.id }).lean();
        assert.ok(records.every((r) => r.status === "FAILED"));
        assert.equal(records.filter((r) => r.error === "Email service unavailable (simulated)").length, MAX_FAILURES_IN_A_ROW);
        assert.ok(records.filter((r) => /stopped after 5 failed emails in a row/.test(r.error)).length >= 2);
    });

    test("after a restart: waiting emails are sent; one cut off mid-send is not sent twice", async () => {
        const school = await signedIn(schoolData, "school");
        const a = await signedIn(ngoData, "ngo");
        const b = await signedIn(donorData, "donor");
        const project = await createProject(school.c);
        // Approved with the email service off, then the records set as a restart would leave them.
        delete process.env.EMAIL_FROM;
        assert.equal((await approve(project.id)).status, 200);
        process.env.EMAIL_FROM = EMAIL_FROM;
        await NewNeedEmail.updateMany({ project: project.id }, { $set: { status: "PENDING" }, $unset: { error: "" } });
        await NewNeedEmail.updateOne({ project: project.id, user: a.id }, { $set: { status: "SENDING" } });

        const resumed = await resumeNewNeedEmails({ frontendOrigin: FRONTEND_ORIGIN });
        assert.ok(resumed.projects >= 1 && resumed.interrupted >= 1);
        await sent();
        assert.match((await NewNeedEmail.findOne({ project: project.id, user: a.id }).lean()).error, /Interrupted by a server restart/);
        assert.ok(!emailTo(a.email));
        assert.equal((await NewNeedEmail.findOne({ project: project.id, user: b.id }).lean()).status, "SENT");
        assert.ok(emailTo(b.email));
    });
});
