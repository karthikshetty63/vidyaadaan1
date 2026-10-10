import assert from "node:assert/strict";
import process from "node:process";
import { after, before, beforeEach, describe, test } from "node:test";
import { FRONTEND_ORIGIN, PASSWORD, createAdmin, createClient, donorData, login, ngoData, registerActive, schoolData, startTestServer } from "./helpers.js";

const { setEmailTransport } = await import("../services/emailService.js");
const { MAX_FAILURES_IN_A_ROW, queueProjectApprovalEmails, resumeAlumniNotifications, waitForAlumniEmails } = await import(
    "../services/alumniNotifications.js"
);

// In-memory stand-in for the SMTP server: every alumni email "sent" lands in the outbox.
const outbox = [];
let attempts = 0;
let failSending = false;
const ALUMNI_SUBJECT = "A new school project needs your support";
const testTransport = {
    sendMail: async (message) => {
        // The school's own "project approved / changes requested" email is another feature
        // (notifications.test.js): it is accepted here and not counted.
        if (!message.subject.startsWith(ALUMNI_SUBJECT)) return { messageId: "school-update" };
        attempts += 1;
        if (failSending) throw new Error("SMTP unavailable (simulated)");
        outbox.push(message);
        return { messageId: `test-${outbox.length}` };
    },
};
const EMAIL_FROM = "VIDYADAAN <no-reply@vidyadaan.test>";

let server;
let admin;
let User;
let Project;
let Alumni;
let AlumniNotification;
const newClient = () => createClient(server.baseUrl);
const inDays = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

let n = 0;
const next = () => String((n += 1)).padStart(4, "0");
// Fixed-width numbers, so no alum's name or address is ever part of another's.
const alumData = (overrides = {}) => {
    const id = next();
    return { name: `Alum ${id}`, registerNumber: `REG-${id}`, email: `alum${id}@example.com`, graduationYear: "2015", ...overrides };
};
const projectData = (overrides = {}) => ({
    title: `Library shelves and books ${next()}`,
    category: "Library",
    problem: "The school has no library; 300 students have no books beyond their textbooks.",
    priority: "High",
    budget: "80000",
    studentsBenefited: "300",
    expectedCompletion: inDays(90),
    ...overrides,
});

const signedIn = async (factory, role, overrides) => {
    const data = factory(overrides);
    await registerActive(newClient(), data);
    const c = newClient();
    assert.equal((await login(c, data.email, PASSWORD, role)).status, 200);
    const id = (await User.findOne({ email: data.email.toLowerCase() }))._id.toString();
    return { c, data, id };
};
const signedInSchool = (overrides) => signedIn(schoolData, "school", overrides);

const addAlum = async (c, overrides) => {
    const res = await c.post("/api/school/alumni", { json: alumData(overrides) });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.alum;
};
const createProject = async (c, overrides) => {
    const res = await c.post("/api/school/projects", { json: projectData(overrides) });
    assert.equal(res.status, 201, JSON.stringify(res.body));
    return res.body.project;
};
const approve = (id) => admin.patch(`/api/admin/projects/${id}/approve`);
const recordsFor = (projectId) => AlumniNotification.find({ project: projectId }).sort({ _id: 1 }).lean();
const recipients = () => outbox.map((m) => m.to).sort();

before(async () => {
    process.env.EMAIL_FROM = EMAIL_FROM;
    setEmailTransport(testTransport);
    server = await startTestServer();
    User = (await import("../models/User.js")).default;
    Project = (await import("../models/Project.js")).default;
    Alumni = (await import("../models/Alumni.js")).default;
    AlumniNotification = (await import("../models/AlumniNotification.js")).default;
    await Promise.all([Alumni.init(), AlumniNotification.init()]);
    const credentials = await createAdmin();
    admin = newClient();
    assert.equal((await login(admin, credentials.email, PASSWORD, "admin")).status, 200);
});
after(() => server.stop());
beforeEach(async () => {
    await waitForAlumniEmails();
    outbox.length = 0;
    attempts = 0;
    failSending = false;
    process.env.EMAIL_FROM = EMAIL_FROM;
});

describe("alumni management", () => {
    test("(1) a school adds an alum: stored in MongoDB for that school, email and register number normalised", async () => {
        const { c, id } = await signedInSchool();
        const res = await c.post("/api/school/alumni", {
            json: { name: "  Priya   Sharma ", registerNumber: " cs  042 ", email: "  Priya.Sharma@Example.COM ", graduationYear: "2015" },
        });
        assert.equal(res.status, 201, JSON.stringify(res.body));
        assert.equal(res.body.message, "Priya Sharma added to your alumni.");
        const { alum } = res.body;
        assert.deepEqual(
            { name: alum.name, registerNumber: alum.registerNumber, email: alum.email, graduationYear: alum.graduationYear, status: alum.status },
            { name: "Priya Sharma", registerNumber: "CS 042", email: "priya.sharma@example.com", graduationYear: 2015, status: "ACTIVE" }
        );
        const stored = await Alumni.findById(alum.id).lean();
        assert.equal(stored.school.toString(), id, "linked to the signed-in school");
        assert.equal(stored.emailNotificationsEnabled, true);

        // Graduation year is optional.
        const noYear = await addAlum(c, { graduationYear: "" });
        assert.equal(noYear.graduationYear, null);
    });

    test("the browser can't choose the school, the status or any other field", async () => {
        const { c } = await signedInSchool();
        const other = await signedInSchool();
        for (const extra of [{ school: other.id }, { schoolId: other.id }, { status: "INACTIVE" }, { emailNotificationsEnabled: false }, { _id: other.id }]) {
            const res = await c.post("/api/school/alumni", { json: alumData(extra) });
            assert.equal(res.status, 400, JSON.stringify(extra));
            assert.match(res.body.message, /Unexpected field/);
        }
        const alum = await addAlum(c);
        const edit = await c.patch(`/api/school/alumni/${alum.id}`, { json: { school: other.id } });
        assert.equal(edit.status, 400);
        assert.equal(await Alumni.countDocuments({ school: other.id }), 0);
    });

    test("(2) a school lists its own alumni, newest first, with counts for the dashboard", async () => {
        const a = await signedInSchool();
        const b = await signedInSchool();
        const first = await addAlum(a.c);
        const second = await addAlum(a.c);
        const inactive = await addAlum(a.c);
        assert.equal((await a.c.patch(`/api/school/alumni/${inactive.id}/status`, { json: { status: "INACTIVE" } })).status, 200);
        await addAlum(b.c);

        const res = await a.c.get("/api/school/alumni");
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.alumni.map((x) => x.id), [inactive.id, second.id, first.id]);
        assert.deepEqual(Object.keys(res.body.alumni[0]).sort(), ["createdAt", "email", "graduationYear", "id", "name", "registerNumber", "status", "updatedAt"]);

        const summary = await a.c.get("/api/school/alumni/summary");
        assert.deepEqual(summary.body, { active: 2, inactive: 1 });
        assert.equal((await b.c.get("/api/school/alumni")).body.alumni.length, 1);
    });

    test("edit, deactivate and reactivate", async () => {
        const { c } = await signedInSchool();
        const alum = await addAlum(c);
        const edit = await c.patch(`/api/school/alumni/${alum.id}`, { json: { name: "Ravi Kumar", email: "RAVI@Example.com", graduationYear: "" } });
        assert.equal(edit.status, 200, JSON.stringify(edit.body));
        assert.equal(edit.body.alum.name, "Ravi Kumar");
        assert.equal(edit.body.alum.email, "ravi@example.com");
        assert.equal(edit.body.alum.graduationYear, null);
        assert.equal(edit.body.alum.registerNumber, alum.registerNumber, "fields not sent are unchanged");

        const off = await c.patch(`/api/school/alumni/${alum.id}/status`, { json: { status: "INACTIVE" } });
        assert.equal(off.status, 200);
        assert.equal(off.body.alum.status, "INACTIVE");
        const on = await c.patch(`/api/school/alumni/${alum.id}/status`, { json: { status: "ACTIVE" } });
        assert.equal(on.body.alum.status, "ACTIVE");

        for (const body of [{ status: "DELETED" }, {}, { status: "ACTIVE", name: "x" }]) {
            assert.equal((await c.patch(`/api/school/alumni/${alum.id}/status`, { json: body })).status, 400, JSON.stringify(body));
        }
        assert.equal((await c.patch(`/api/school/alumni/${alum.id}`, { json: {} })).status, 400, "nothing to update");
        assert.equal((await c.patch("/api/school/alumni/not-an-id", { json: { name: "Ravi" } })).status, 404);
    });

    test("(3) a school can't see or change another school's alumni", async () => {
        const a = await signedInSchool();
        const b = await signedInSchool();
        const alum = await addAlum(a.c);

        assert.ok(!(await b.c.get("/api/school/alumni")).body.alumni.some((x) => x.id === alum.id));
        const edit = await b.c.patch(`/api/school/alumni/${alum.id}`, { json: { name: "Taken over" } });
        assert.equal(edit.status, 404);
        const status = await b.c.patch(`/api/school/alumni/${alum.id}/status`, { json: { status: "INACTIVE" } });
        assert.equal(status.status, 404);

        const stored = await Alumni.findById(alum.id).lean();
        assert.equal(stored.name, alum.name);
        assert.equal(stored.status, "ACTIVE");
    });

    test("(4, 5) NGOs, donors and admins can't manage alumni; signed-out visitors can't either", async () => {
        const school = await signedInSchool();
        const alum = await addAlum(school.c);
        const ngo = (await signedIn(ngoData, "ngo")).c;
        const donor = (await signedIn(donorData, "donor")).c;

        for (const [who, c, expected] of [["ngo", ngo, 403], ["donor", donor, 403], ["admin", admin, 403], ["signed out", newClient(), 401]]) {
            assert.equal((await c.get("/api/school/alumni")).status, expected, `${who} list`);
            assert.equal((await c.get("/api/school/alumni/summary")).status, expected, `${who} summary`);
            assert.equal((await c.post("/api/school/alumni", { json: alumData() })).status, expected, `${who} add`);
            assert.equal((await c.patch(`/api/school/alumni/${alum.id}`, { json: { name: "Changed" } })).status, expected, `${who} edit`);
            assert.equal((await c.patch(`/api/school/alumni/${alum.id}/status`, { json: { status: "INACTIVE" } })).status, expected, `${who} deactivate`);
        }
        const stored = await Alumni.findById(alum.id).lean();
        assert.equal(stored.name, alum.name);
        assert.equal(stored.status, "ACTIVE");
        assert.equal(await Alumni.countDocuments({ school: school.id }), 1);
    });

    test("(6) a register number or email can't be added twice to the same school (another school may list them)", async () => {
        const a = await signedInSchool();
        const b = await signedInSchool();
        const alum = await addAlum(a.c, { registerNumber: "2015/CS/042" });

        const sameNumber = await a.c.post("/api/school/alumni", { json: alumData({ registerNumber: " 2015/cs/042 " }) });
        assert.equal(sameNumber.status, 409);
        assert.equal(sameNumber.body.errors.registerNumber, "Register number 2015/CS/042 is already on your alumni list.");

        const sameEmail = await a.c.post("/api/school/alumni", { json: alumData({ email: alum.email.toUpperCase() }) });
        assert.equal(sameEmail.status, 409);
        assert.ok(sameEmail.body.errors.email);

        const second = await addAlum(a.c);
        const editToTaken = await a.c.patch(`/api/school/alumni/${second.id}`, { json: { registerNumber: "2015/CS/042" } });
        assert.equal(editToTaken.status, 409);
        assert.equal((await a.c.patch(`/api/school/alumni/${alum.id}`, { json: { registerNumber: "2015/CS/042" } })).status, 200, "its own number is fine");

        assert.equal((await b.c.post("/api/school/alumni", { json: alumData({ registerNumber: "2015/CS/042", email: alum.email }) })).status, 201);
        assert.equal(await Alumni.countDocuments({ school: a.id, registerNumber: "2015/CS/042" }), 1);

        // Two identical requests at the same moment: the unique index lets only one through.
        const racing = alumData();
        const results = await Promise.all([a.c.post("/api/school/alumni", { json: racing }), a.c.post("/api/school/alumni", { json: racing })]);
        assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
    });

    test("(7) invalid email and other bad input are rejected", async () => {
        const { c, id } = await signedInSchool();
        for (const email of ["not-an-email", "a@b", "two@@example.com", "", "   "]) {
            const res = await c.post("/api/school/alumni", { json: alumData({ email }) });
            assert.equal(res.status, 400, email);
            assert.ok(res.body.errors.email, email);
        }
        for (const [field, value] of [["name", ""], ["name", "A"], ["registerNumber", ""], ["registerNumber", "#42!"], ["graduationYear", "1800"], ["graduationYear", String(new Date().getFullYear() + 1)], ["graduationYear", "twenty"]]) {
            const res = await c.post("/api/school/alumni", { json: alumData({ [field]: value }) });
            assert.equal(res.status, 400, `${field}=${value}`);
            assert.ok(res.body.errors[field], `${field}=${value}`);
        }
        assert.equal((await c.post("/api/school/alumni", { json: [] })).status, 400);
        assert.equal(await Alumni.countDocuments({ school: id }), 0);
    });
});

describe("approved project → alumni emails", () => {
    test("(9) creating or editing a project sends no email", async () => {
        const { c } = await signedInSchool();
        await addAlum(c);
        const project = await createProject(c);
        assert.equal((await c.patch(`/api/school/projects/${project.id}`, { json: { title: "Library shelves, edited" } })).status, 200);
        await waitForAlumniEmails();
        assert.equal(outbox.length, 0);
        assert.equal(attempts, 0);
        assert.equal((await recordsFor(project.id)).length, 0);
    });

    test("(10) rejecting a project sends no alumni email; approving it after the school resubmits does", async () => {
        const { c } = await signedInSchool();
        const alum = await addAlum(c);
        const project = await createProject(c);
        const reject = await admin.patch(`/api/admin/projects/${project.id}/reject`, { json: { reason: "Please add an itemised budget." } });
        assert.equal(reject.status, 200);
        await waitForAlumniEmails();
        assert.equal(outbox.length, 0);
        assert.equal((await recordsFor(project.id)).length, 0);

        assert.equal((await c.patch(`/api/school/projects/${project.id}`, { json: { budget: "75000" } })).status, 200);
        assert.equal(outbox.length, 0, "resubmitting sends nothing either");
        assert.equal((await approve(project.id)).status, 200);
        await waitForAlumniEmails();
        assert.deepEqual(recipients(), [alum.email]);
    });

    test("(11) approval queues one email per active alum, then sends them; each is recorded as SENT", async () => {
        const { c, id: schoolId } = await signedInSchool();
        const alumni = [await addAlum(c), await addAlum(c)];
        const project = await createProject(c);

        const res = await approve(project.id);
        assert.equal(res.status, 200);
        assert.equal(res.body.project.reviewStatus, "OPEN");
        assert.equal(res.body.message, "Project approved. It is now open. Emails to 2 alumni of the school have been queued.");
        assert.deepEqual(res.body.alumniEmails, { status: "QUEUED", queued: 2 });

        await waitForAlumniEmails();
        assert.deepEqual(recipients(), alumni.map((a) => a.email).sort());
        const records = await recordsFor(project.id);
        assert.equal(records.length, 2);
        for (const r of records) {
            assert.equal(r.status, "SENT");
            assert.ok(r.sentAt instanceof Date);
            assert.equal(r.school.toString(), schoolId);
            assert.equal(r.error, undefined);
            const alum = alumni.find((a) => a.id === r.alumni.toString());
            assert.equal(r.email, alum.email);
            assert.equal(r.name, alum.name);
        }
    });

    test("(8) inactive alumni, and alumni who opted out, are not emailed", async () => {
        const { c } = await signedInSchool();
        const active = await addAlum(c);
        const inactive = await addAlum(c);
        const optedOut = await addAlum(c);
        assert.equal((await c.patch(`/api/school/alumni/${inactive.id}/status`, { json: { status: "INACTIVE" } })).status, 200);
        await Alumni.updateOne({ _id: optedOut.id }, { $set: { emailNotificationsEnabled: false } });
        const project = await createProject(c);

        const res = await approve(project.id);
        assert.deepEqual(res.body.alumniEmails, { status: "QUEUED", queued: 1 });
        await waitForAlumniEmails();
        assert.deepEqual(recipients(), [active.email]);
        assert.deepEqual((await recordsFor(project.id)).map((r) => r.alumni.toString()), [active.id]);
    });

    test("(12, 13) only the approved project's school's alumni are emailed, never another school's", async () => {
        const a = await signedInSchool({ schoolName: "Govt. High School, Channagiri" });
        const b = await signedInSchool({ schoolName: "Govt. Model School, Harihar" });
        const aAlumni = [await addAlum(a.c), await addAlum(a.c), await addAlum(a.c)];
        const bAlumni = [await addAlum(b.c), await addAlum(b.c)];
        const project = await createProject(a.c);
        await createProject(b.c);

        assert.equal((await approve(project.id)).status, 200);
        await waitForAlumniEmails();
        assert.deepEqual(recipients(), aAlumni.map((x) => x.email).sort());
        for (const x of bAlumni) assert.ok(!recipients().includes(x.email), "another school's alum was emailed");
        assert.equal(await AlumniNotification.countDocuments({ school: b.id }), 0);
        for (const m of outbox) assert.match(m.text, /A new project from Govt\. High School, Channagiri has been approved/);
    });

    test("(16) the email shows the stored project's title, problem and budget word for word", async () => {
        const { c, data } = await signedInSchool({ schoolName: "Govt. Primary School, Nyamathi", district: "Davangere", state: "Karnataka" });
        const alum = await addAlum(c, { name: "Meena Rao" });
        const problem = "Rain leaks into 3 classrooms <every> monsoon.\nStudents & teachers move to the corridor.";
        const project = await createProject(c, { title: "Roof repair for Block A", problem, budget: "125000", studentsBenefited: "240", priority: "Critical", category: "Classroom Development" });

        assert.equal((await approve(project.id)).status, 200);
        await waitForAlumniEmails();
        assert.equal(outbox.length, 1);
        const [email] = outbox;
        assert.equal(email.from, EMAIL_FROM);
        assert.equal(email.to, alum.email);
        assert.equal(email.subject, "A new school project needs your support — Roof repair for Block A");

        const link = `${FRONTEND_ORIGIN}/projects/${project.id}`;
        for (const line of [
            "Hello Meena Rao,",
            `A new project from ${data.schoolName} has been approved on VIDYADAAN and is now open for support.`,
            `PROJECT\nRoof repair for Block A`,
            `PROBLEM STATEMENT\n${problem}`,
            "- 240 students will benefit",
            "- Priority: Critical",
            "TARGET: ₹1,25,000",
            `SCHOOL: ${data.schoolName}`,
            "LOCATION: Davangere, Karnataka",
            `View project: ${link}`,
            "VIDYADAAN\nTransparent Education Development Platform",
        ]) {
            assert.ok(email.text.includes(line), `text is missing: ${line}`);
        }
        // The HTML version shows the same words, safely escaped.
        assert.ok(email.html.includes("Rain leaks into 3 classrooms &lt;every&gt; monsoon.\nStudents &amp; teachers move to the corridor."));
        assert.ok(!email.html.includes("<every>"));
        assert.ok(email.html.includes(`href="${link}"`));
        assert.ok(email.html.includes("₹1,25,000"));
    });

    test("(17) each email goes to one alum only: no other alum's name or address appears", async () => {
        const { c } = await signedInSchool();
        const alumni = [await addAlum(c), await addAlum(c), await addAlum(c), await addAlum(c)];
        const project = await createProject(c);
        assert.equal((await approve(project.id)).status, 200);
        await waitForAlumniEmails();

        assert.equal(outbox.length, alumni.length);
        for (const m of outbox) {
            assert.equal(typeof m.to, "string", "one address, not a list");
            assert.equal(m.cc, undefined);
            assert.equal(m.bcc, undefined);
            const self = alumni.find((a) => a.email === m.to);
            assert.ok(self);
            for (const other of alumni.filter((a) => a !== self)) {
                for (const part of [m.text, m.html, m.subject]) {
                    assert.ok(!part.includes(other.email), "another alum's email leaked");
                    assert.ok(!part.includes(other.name), "another alum's name leaked");
                }
            }
        }
    });

    test("(15) approving an already OPEN project sends nothing again; repeating the queue step adds nothing", async () => {
        const { c } = await signedInSchool();
        await addAlum(c);
        await addAlum(c);
        const project = await createProject(c);

        const results = await Promise.all([approve(project.id), approve(project.id)]);
        assert.deepEqual(results.map((r) => r.status).sort(), [200, 409], "only one approval wins");
        await waitForAlumniEmails();
        assert.equal(outbox.length, 2);

        const again = await approve(project.id);
        assert.equal(again.status, 409);
        assert.match(again.body.message, /already approved/);
        const stored = await Project.findById(project.id).lean();
        assert.deepEqual(await queueProjectApprovalEmails(stored, { frontendOrigin: FRONTEND_ORIGIN }), { status: "ALREADY_QUEUED", queued: 0 });
        await waitForAlumniEmails();
        assert.equal(outbox.length, 2, "no duplicates");
        assert.equal((await recordsFor(project.id)).length, 2);
    });

    test("(14) approval still succeeds when sending fails; each failure is recorded with its error", async () => {
        const { c } = await signedInSchool();
        await addAlum(c);
        await addAlum(c);
        const project = await createProject(c);
        failSending = true;

        const res = await approve(project.id);
        assert.equal(res.status, 200);
        assert.equal((await Project.findById(project.id).lean()).reviewStatus, "OPEN");
        await waitForAlumniEmails();
        assert.equal(outbox.length, 0);
        const records = await recordsFor(project.id);
        assert.deepEqual(records.map((r) => [r.status, r.error]), [["FAILED", "SMTP unavailable (simulated)"], ["FAILED", "SMTP unavailable (simulated)"]]);
        assert.equal((await Project.findById(project.id).lean()).reviewStatus, "OPEN", "still approved");
    });

    test("(14) with email not set up, the project is approved and the emails are recorded as not sent", async () => {
        const { c } = await signedInSchool();
        await addAlum(c);
        const project = await createProject(c);
        delete process.env.EMAIL_FROM;

        const res = await approve(project.id);
        assert.equal(res.status, 200);
        assert.equal(res.body.message, "Project approved. It is now open. Alumni emails were not sent: email is not set up on the server.");
        assert.deepEqual(res.body.alumniEmails, { status: "EMAIL_UNAVAILABLE", queued: 0 });
        await waitForAlumniEmails();
        assert.equal(attempts, 0);
        const [record] = await recordsFor(project.id);
        assert.equal(record.status, "FAILED");
        assert.match(record.error, /not configured/);
        assert.equal((await Project.findById(project.id).lean()).reviewStatus, "OPEN");
    });

    test("when the SMTP server keeps failing, sending stops after a few tries instead of trying everyone", async () => {
        const { c } = await signedInSchool();
        for (let i = 0; i < MAX_FAILURES_IN_A_ROW + 3; i += 1) await addAlum(c);
        const project = await createProject(c);
        failSending = true;

        assert.equal((await approve(project.id)).status, 200);
        await waitForAlumniEmails();
        assert.equal(attempts, MAX_FAILURES_IN_A_ROW);
        const records = await recordsFor(project.id);
        assert.equal(records.length, MAX_FAILURES_IN_A_ROW + 3);
        assert.ok(records.every((r) => r.status === "FAILED"));
        assert.equal(records.filter((r) => /stopped after/.test(r.error)).length, 3);
    });

    test("a school with no active alumni: approved, nothing queued", async () => {
        const { c } = await signedInSchool();
        const project = await createProject(c);
        const res = await approve(project.id);
        assert.equal(res.status, 200);
        assert.equal(res.body.message, "Project approved. It is now open. The school has no active alumni to email.");
        assert.deepEqual(res.body.alumniEmails, { status: "NO_ALUMNI", queued: 0 });
    });

    test("after a restart, PENDING emails are sent and an interrupted one is not sent twice", async () => {
        const { c, id: schoolId } = await signedInSchool();
        const waiting = await addAlum(c);
        const interrupted = await addAlum(c);
        const project = await createProject(c);
        // Approve directly in the database, as if the server stopped right after queueing.
        await Project.updateOne({ _id: project.id }, { $set: { reviewStatus: "OPEN", reviewedAt: new Date() } });
        await AlumniNotification.create([
            { project: project.id, school: schoolId, alumni: waiting.id, name: waiting.name, email: waiting.email, status: "PENDING" },
            { project: project.id, school: schoolId, alumni: interrupted.id, name: interrupted.name, email: interrupted.email, status: "SENDING" },
        ]);

        const result = await resumeAlumniNotifications({ frontendOrigin: FRONTEND_ORIGIN });
        assert.equal(result.interrupted, 1);
        await waitForAlumniEmails();
        assert.deepEqual(recipients(), [waiting.email]);
        const byAlum = Object.fromEntries((await recordsFor(project.id)).map((r) => [r.alumni.toString(), r]));
        assert.equal(byAlum[waiting.id].status, "SENT");
        assert.equal(byAlum[interrupted.id].status, "FAILED");
        assert.match(byAlum[interrupted.id].error, /Interrupted by a server restart/);
    });
});
