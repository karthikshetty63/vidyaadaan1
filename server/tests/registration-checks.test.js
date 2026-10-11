import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import process from "node:process";
import { after, before, beforeEach, describe, test } from "node:test";
import {
    ANY_BRANCH, NOT_LEAKED, PASSWORD, createAdmin, createClient, donorData, login, ngoData, register, registrationForm, requiredFiles, schoolData, startTestServer,
} from "./helpers.js";
import { getPasswordError, validateRegistration } from "../../shared/registrationRules.js";

// The registration's safety checks: confirming the email with an emailed code, refusing easy and leaked
// passwords, typing the bank account twice and checking the IFSC, and PAN checks for NGOs. The email
// service, Have I Been Pwned and the IFSC service are all faked: nothing leaves this computer.
const { setEmailTransport } = await import("../services/emailService.js");
const { setPwnedPasswordsFetch } = await import("../services/pwnedPasswords.js");
const { setIfscFetch } = await import("../services/ifscLookup.js");

const EMAIL_FROM = "VIDYADAAN <no-reply@vidyadaan.test>";
const outbox = [];
let failSending = false;

let server;
let User;
let EmailVerification;
let SchoolProfile;
const newClient = () => createClient(server.baseUrl);
const sha1 = (text) => createHash("sha1").update(text).digest("hex").toUpperCase();

const askCode = (email, role = "school") => newClient().post("/api/auth/email-code", { json: { email, role } });
const typeCode = (email, code) => newClient().post("/api/auth/verify-email", { json: { email, code } });
const codeSentTo = (email) => {
    const message = [...outbox].reverse().find((m) => m.to === email);
    return message && /^(\d{6}) is your VIDYADAAN code$/.exec(message.subject)?.[1];
};
/** The whole flow, as the form does it: ask for a code, type it, get the proof. */
const confirmEmail = async (email, role) => {
    assert.equal((await askCode(email, role)).status, 200);
    const res = await typeCode(email, codeSentTo(email));
    assert.equal(res.status, 200, JSON.stringify(res.body));
    return res.body.emailProof;
};
/** A Have I Been Pwned answer in which `password` has leaked `count` times (with some other lines). */
const leaked = (password, count = 3) => async (url) => {
    const hash = sha1(password);
    assert.ok(url.endsWith(`/range/${hash.slice(0, 5)}`));
    return new Response(`0018A45C4D1DEF81644B54AB7F969B88D65:1\r\n${hash.slice(5)}:${count}\r\n00D4F6E8FA6EECAD2A3AA415EEC418D38EC:0`, { status: 200 });
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
    server = await startTestServer();
    User = (await import("../models/User.js")).default;
    EmailVerification = (await import("../models/EmailVerification.js")).default;
    SchoolProfile = (await import("../models/SchoolProfile.js")).default;
    await EmailVerification.init();
});
after(() => server.stop());
beforeEach(() => {
    outbox.length = 0;
    failSending = false;
    process.env.EMAIL_FROM = EMAIL_FROM;
    setPwnedPasswordsFetch(NOT_LEAKED);
    setIfscFetch(ANY_BRANCH);
});

describe("1. confirming the email address", () => {
    test("a 6-digit code is emailed; only its keyed hash is stored", async () => {
        const email = "principal.code@example.gov.in";
        const res = await askCode(" Principal.Code@Example.gov.in ", "school");
        assert.equal(res.status, 200);
        assert.equal(res.body.message, `We've sent a 6-digit code to ${email}.`);
        assert.deepEqual([res.body.expiresInMinutes, res.body.resendAfterSeconds], [10, 60]);
        const code = codeSentTo(email);
        assert.match(code, /^\d{6}$/);
        const [message] = outbox;
        assert.equal(message.from, EMAIL_FROM);
        assert.match(message.text, /confirm this email address for your new VIDYADAAN school account/);
        assert.match(message.text, /It works for 10 minutes/);
        assert.match(message.text, /no account is created without this code/);
        const record = await EmailVerification.findOne({ email }).lean();
        assert.ok(record.codeHash && !JSON.stringify(record).includes(code), "the code itself is never stored");
    });

    test("another code for the same address only after a minute, and a few an hour", async () => {
        const email = "wait.a.minute@example.org";
        assert.equal((await askCode(email, "ngo")).status, 200);
        const again = await askCode(email, "ngo");
        assert.equal(again.status, 429);
        assert.ok(again.body.retryAfterSeconds > 0 && again.body.retryAfterSeconds <= 60);
        assert.match(again.body.message, /ask for another in \d+ seconds/);
        assert.equal(outbox.length, 1);
        // A minute later it's fine; after 5 in the hour it isn't.
        await EmailVerification.updateOne({ email }, { $set: { sentAt: new Date(Date.now() - 61_000) } });
        assert.equal((await askCode(email, "ngo")).status, 200);
        await EmailVerification.updateOne({ email }, { $set: { sentAt: new Date(Date.now() - 61_000), sends: 5 } });
        const tooMany = await askCode(email, "ngo");
        assert.equal(tooMany.status, 429);
        assert.match(tooMany.body.message, /Too many codes for this address/);
    });

    test("no code for an address that already has an account, a bad address, an admin, or without email", async () => {
        const existing = donorData();
        assert.equal((await register(newClient(), existing)).status, 201);
        const taken = await askCode(existing.email, "donor");
        assert.equal(taken.status, 409);
        assert.equal(taken.body.errors.email, "An account with this email already exists.");
        assert.equal((await askCode("not-an-email", "donor")).status, 400);
        assert.equal((await askCode("someone@example.com", "admin")).status, 400);
        delete process.env.EMAIL_FROM;
        const off = await askCode("someone@example.com", "donor");
        assert.equal(off.status, 503);
        assert.equal(off.body.code, "EMAIL_UNAVAILABLE");
        process.env.EMAIL_FROM = EMAIL_FROM;
        failSending = true;
        const failed = await askCode("bounce@example.com", "donor");
        assert.equal(failed.status, 502);
        assert.match(failed.body.message, /couldn't send the code/);
        assert.equal(outbox.length, 0);
    });

    test("a wrong code says how many tries are left; after 5 even the right code is refused", async () => {
        const email = "guesser@example.com";
        await askCode(email, "donor");
        const right = codeSentTo(email);
        const wrong = right === "000000" ? "111111" : "000000";
        for (let left = 4; left >= 1; left -= 1) {
            const res = await typeCode(email, wrong);
            assert.equal(res.status, 400);
            assert.equal(res.body.errors.emailCode, `That code isn't right. ${left} ${left === 1 ? "try" : "tries"} left.`);
        }
        assert.equal((await typeCode(email, wrong)).body.code, "TOO_MANY");
        const late = await typeCode(email, right);
        assert.equal(late.status, 400);
        assert.equal(late.body.code, "TOO_MANY");
        assert.equal(late.body.emailProof, undefined);
        for (const code of ["", "12345", "1234567", "abcdef"]) assert.equal((await typeCode(email, code)).body.errors.emailCode, "Enter the 6-digit code from the email.");
    });

    test("the right code works once, and not after 10 minutes", async () => {
        const email = "once@example.com";
        await askCode(email, "donor");
        const code = codeSentTo(email);
        const ok = await typeCode(email, code);
        assert.equal(ok.status, 200);
        assert.match(ok.body.emailProof, /^[a-f0-9]{64}$/);
        assert.equal((await typeCode(email, code)).body.code, "EXPIRED", "a code can't be used twice");

        const late = "late@example.com";
        await askCode(late, "donor");
        await EmailVerification.updateOne({ email: late }, { $set: { codeExpiresAt: new Date(Date.now() - 1000) } });
        assert.equal((await typeCode(late, codeSentTo(late))).body.code, "EXPIRED");
    });

    test("registering needs the proof for that same address; it is used up by the registration", async () => {
        const data = schoolData();
        const client = newClient();
        const without = await client.post("/api/auth/register", { form: registrationForm(data, requiredFiles("school")) });
        assert.equal(without.status, 400);
        assert.equal(without.body.code, "EMAIL_NOT_VERIFIED");
        assert.equal(without.body.step, 1, "the step with the email");
        assert.equal(without.body.errors.email, "Confirm your email address with the code we email you.");

        const otherProof = await confirmEmail("someone.else@example.gov.in", "school");
        for (const emailProof of [otherProof, "f".repeat(64), "not-a-proof", 42]) {
            const res = await client.post("/api/auth/register", { form: registrationForm({ ...data, emailProof }, requiredFiles("school")) });
            assert.equal(res.status, 400, `accepted ${emailProof}`);
            assert.equal(res.body.code, "EMAIL_NOT_VERIFIED");
        }
        assert.equal(await User.countDocuments({ email: data.email }), 0);

        const proof = await confirmEmail(data.email, "school");
        const ok = await client.post("/api/auth/register", { form: registrationForm({ ...data, emailProof: proof }, requiredFiles("school")) });
        assert.equal(ok.status, 201, JSON.stringify(ok.body));
        assert.equal(await EmailVerification.countDocuments({ email: data.email }), 0, "the proof is used up");
        // emailProof is checked, never stored.
        const user = await User.findOne({ email: data.email }).lean();
        assert.ok(!JSON.stringify(user).includes(proof));
        assert.ok(!JSON.stringify(await SchoolProfile.findOne({ userId: user._id }).lean()).includes(proof));
    });
});

describe("2. passwords that are easy to guess or have leaked", () => {
    test("the shared rule: common ones, too few different characters, and the person's own details", () => {
        for (const easy of ["password", "Password123", "12345678", "qwerty123", "iloveyou", "India@123", "aaaaaaaa", "abababab", "11112222"]) {
            assert.match(getPasswordError(easy), /too easy to guess/, easy);
        }
        assert.match(getPasswordError("anitadesai7", undefined, ["Anita Desai"]), /Don't use your name/);
        assert.match(getPasswordError("principal.k!99", undefined, ["principal.k"]), /Don't use your name/);
        assert.match(getPasswordError("Honnali#2026", undefined, ["Govt. Primary School, Honnali"]), /Don't use your name/);
        // Short words (3 letters or fewer) don't count, and good passwords pass.
        assert.equal(getPasswordError("rajkite-99", undefined, ["Raj K"]), "");
        assert.equal(getPasswordError("mango river lamp 42", undefined, ["Anita Desai", "anita"]), "");
        // On the form, the name and email come from the same form.
        const { errors } = validateRegistration("donor", donorData({ name: "Meera Iyer", password: "meeraiyer2026", confirm: "meeraiyer2026" }), { steps: [2] });
        assert.match(errors.password, /Don't use your name/);
    });

    test("a password from a data breach is refused at registration, on the password's step", async () => {
        const data = ngoData({ password: "Sunflower-Garden-21", confirm: "Sunflower-Garden-21" });
        setPwnedPasswordsFetch(leaked("Sunflower-Garden-21", 1234));
        const res = await register(newClient(), data);
        assert.equal(res.status, 400);
        assert.equal(res.body.code, "LEAKED_PASSWORD");
        assert.equal(res.body.step, 4, "the NGO form's account step");
        assert.match(res.body.errors.password, /appeared in a data leak/);
        assert.equal(await User.countDocuments({ email: data.email.toLowerCase() }), 0);
    });

    test("the breach check sends only the first 5 characters of the password's hash", async () => {
        const seen = [];
        setPwnedPasswordsFetch(async (url, init) => {
            seen.push({ url, init });
            return new Response("", { status: 200 });
        });
        const data = donorData({ password: "Quiet-Harbour-88", confirm: "Quiet-Harbour-88" });
        assert.equal((await register(newClient(), data)).status, 201);
        assert.equal(seen.length, 1);
        assert.equal(seen[0].url, `https://api.pwnedpasswords.com/range/${sha1("Quiet-Harbour-88").slice(0, 5)}`);
        assert.equal(seen[0].init.headers["Add-Padding"], "true");
        const sent = JSON.stringify(seen);
        assert.ok(!sent.includes("Quiet-Harbour-88") && !sent.includes(sha1("Quiet-Harbour-88").slice(5)), "neither the password nor the rest of its hash leaves the server");
    });

    test("if the breach check can't be reached, registration still works (the other rules still apply)", async () => {
        setPwnedPasswordsFetch(async () => {
            throw new TypeError("fetch failed");
        });
        assert.equal((await register(newClient(), donorData())).status, 201);
        const common = await register(newClient(), donorData({ password: "password123", confirm: "password123" }));
        assert.equal(common.status, 400);
        assert.match(common.body.errors.password, /too easy to guess/);
    });

    test("a new password after “Forgot password” gets the same checks, and the link isn't used up by a refused one", async () => {
        const data = donorData({ name: "Kiran Shetty" });
        assert.equal((await register(newClient(), data)).status, 201);
        await User.updateOne({ email: data.email.toLowerCase() }, { $set: { accountStatus: "active" } });
        assert.equal((await newClient().post("/api/auth/forgot-password", { json: { email: data.email } })).status, 200);
        const link = outbox.find((m) => m.to === data.email.toLowerCase() && /reset/i.test(m.subject));
        const token = /reset-password\/([a-f0-9]{64})/.exec(link.text)[1];
        const reset = (password) => newClient().post(`/api/auth/reset-password/${token}`, { json: { password, confirmPassword: password } });

        assert.match((await reset("kiranshetty99")).body.errors.password, /Don't use your name/);
        setPwnedPasswordsFetch(leaked("Blue-Monsoon-Kite-4"));
        const leakedRes = await reset("Blue-Monsoon-Kite-4");
        assert.equal(leakedRes.status, 400);
        assert.equal(leakedRes.body.code, "LEAKED_PASSWORD");
        setPwnedPasswordsFetch(NOT_LEAKED);
        assert.equal((await reset("Green-Valley-Lamp-7")).status, 200, "the link still works after refused passwords");
        assert.equal((await login(newClient(), data.email, "Green-Valley-Lamp-7", "donor")).status, 200);
    });
});

describe("3. bank details", () => {
    test("the account number is typed twice, and both must match", async () => {
        const mismatch = await register(newClient(), schoolData({ bankAccount: "123456789012", confirmBankAccount: "123456789021" }));
        assert.equal(mismatch.status, 400);
        assert.equal(mismatch.body.step, 4);
        assert.equal(mismatch.body.errors.confirmBankAccount, "The two account numbers don't match. Check both against your passbook.");
        const missing = await register(newClient(), schoolData({ confirmBankAccount: "" }));
        assert.equal(missing.body.errors.confirmBankAccount, "Confirm bank account number is required.");
        // Spaces don't matter; the confirmation is never stored.
        const data = schoolData({ bankAccount: "1234 5678 9012", confirmBankAccount: "123456789012" });
        assert.equal((await register(newClient(), data)).status, 201);
        const user = await User.findOne({ email: data.email.toLowerCase() }).lean();
        const profile = await SchoolProfile.findOne({ userId: user._id }).lean();
        assert.equal(profile.bankAccount, "123456789012");
        assert.ok(!("confirmBankAccount" in profile));
    });

    test("an IFSC that belongs to no branch is refused; a real one stores its bank and branch for the admin", async () => {
        setIfscFetch(async () => new Response("Not Found", { status: 404 }));
        const unknown = await register(newClient(), schoolData({ ifsc: "SBIN0999999" }));
        assert.equal(unknown.status, 400);
        assert.equal(unknown.body.step, 4);
        assert.match(unknown.body.errors.ifsc, /No bank branch has this IFSC code/);

        setIfscFetch(async () => Response.json({ BANK: "Canara Bank", BRANCH: "Kadiyali", CITY: "Udupi", DISTRICT: "Udupi", STATE: "Karnataka" }));
        const data = schoolData({ ifsc: "cnrb0001234" });
        assert.equal((await register(newClient(), data)).status, 201);
        const user = await User.findOne({ email: data.email.toLowerCase() }).lean();
        const profile = await SchoolProfile.findOne({ userId: user._id }).lean();
        assert.deepEqual([profile.ifsc, profile.bankName, profile.bankBranch], ["CNRB0001234", "Canara Bank", "Kadiyali, Udupi, Karnataka"]);

        const credentials = await createAdmin();
        const admin = newClient();
        assert.equal((await login(admin, credentials.email, PASSWORD, "admin")).status, 200);
        const review = await admin.get(`/api/admin/accounts/${user._id}`);
        assert.deepEqual([review.body.profile.bankName, review.body.profile.bankBranch], ["Canara Bank", "Kadiyali, Udupi, Karnataka"]);
    });

    test("if the IFSC service can't be reached, the IFSC's shape is enough", async () => {
        setIfscFetch(async () => {
            throw new TypeError("fetch failed");
        });
        const data = schoolData({ ifsc: "HDFC0001234" });
        assert.equal((await register(newClient(), data)).status, 201);
        const user = await User.findOne({ email: data.email.toLowerCase() }).lean();
        assert.equal((await SchoolProfile.findOne({ userId: user._id }).lean()).bankName, undefined);
    });

    test("the form's look-up: the branch for a real IFSC, a clear answer otherwise", async () => {
        const visitor = newClient();
        const found = await visitor.get("/api/public/ifsc/sbin0001234");
        assert.equal(found.status, 200);
        assert.deepEqual(found.body, { ifsc: "SBIN0001234", bank: "State Bank of India", branch: "Honnali", city: "Honnali", district: "Davangere", state: "Karnataka" });
        assert.equal((await visitor.get("/api/public/ifsc/SBIN12345")).status, 400);
        setIfscFetch(async () => new Response("Not Found", { status: 404 }));
        assert.equal((await visitor.get("/api/public/ifsc/ABCD0123456")).status, 404);
        setIfscFetch(async () => new Response("down", { status: 502 }));
        const down = await visitor.get("/api/public/ifsc/WXYZ0123456");
        assert.equal(down.status, 503);
        assert.equal(down.body.code, "LOOKUP_UNAVAILABLE");
    });
});

describe("4. an NGO's PAN", () => {
    test("a personal PAN is refused, and a trust's or company's PAN must match its type", async () => {
        const personal = await register(newClient(), ngoData({ pan: "ABCPE1234F" }));
        assert.equal(personal.status, 400);
        assert.equal(personal.body.step, 2);
        assert.match(personal.body.errors.pan, /This is a personal PAN/);
        assert.match((await register(newClient(), ngoData({ pan: "ABCHE1234F" }))).body.errors.pan, /personal PAN/);

        const trustWithC = await register(newClient(), ngoData({ type: "Trust", pan: "AAACS1234K" }));
        assert.equal(trustWithC.status, 400);
        assert.equal(trustWithC.body.errors.pan, "A trust's PAN has T as its 4th letter. Check the PAN, or the organisation type on the first step.");
        const companyWithT = await register(newClient(), ngoData({ type: "Section 8 Company", pan: "AAATS1234K" }));
        assert.match(companyWithT.body.errors.pan, /A company's PAN has C as its 4th letter/);

        for (const [type, pan] of [["Section 8 Company", "AAACV1234K"], ["Society", "AAAAS1234K"], ["Others", "AAATS1235K"], ["Trust", "aaats1236k"]]) {
            const res = await register(newClient(), ngoData({ type, pan }));
            assert.equal(res.status, 201, `${type} ${pan}: ${JSON.stringify(res.body)}`);
        }
    });
});
