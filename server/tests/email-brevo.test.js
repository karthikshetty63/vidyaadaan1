import assert from "node:assert/strict";
import process from "node:process";
import { after, beforeEach, describe, test } from "node:test";

// Brevo's HTTPS email API, with a stand-in for Brevo: nothing leaves the machine and the key is made up.
const KEY = "xkeysib-test-not-a-real-key";
const { emailProvider, isEmailConfigured, sendEmail, sendPasswordResetEmail, setBrevoFetch, verifyEmailTransport } = await import("../services/emailService.js");

const calls = [];
let answer = () => Response.json({ messageId: "<test@brevo>" }, { status: 201 });
setBrevoFetch(async (url, init) => {
    calls.push({ url, init, body: init.body ? JSON.parse(init.body) : null });
    return answer(url);
});
after(() => setBrevoFetch(null));
beforeEach(() => {
    calls.length = 0;
    answer = () => Response.json({ messageId: "<test@brevo>" }, { status: 201 });
    process.env.EMAIL_FROM = "VIDYADAAN <vidyadaan.team@example.org>";
    process.env.BREVO_API_KEY = KEY;
    delete process.env.SMTP_HOST;
});

describe("email through Brevo's HTTPS API", () => {
    test("Brevo is used when its key is set; SMTP otherwise; nothing without a sender", () => {
        assert.equal(emailProvider(), "brevo");
        assert.equal(isEmailConfigured(), true, "no SMTP host needed");
        delete process.env.BREVO_API_KEY;
        assert.equal(isEmailConfigured(), false);
        process.env.SMTP_HOST = "smtp.example.org";
        assert.equal(emailProvider(), "smtp");
        process.env.BREVO_API_KEY = KEY;
        assert.equal(emailProvider(), "brevo", "Brevo wins when both are set");
        delete process.env.EMAIL_FROM;
        assert.equal(isEmailConfigured(), false);
    });

    test("one email to one address, with the sender, subject, text and HTML", async () => {
        await sendPasswordResetEmail({ to: "priya@example.com", name: "Priya", resetUrl: "https://vidyadaan.example/reset-password/abc", expiresInMinutes: 15 });
        assert.equal(calls.length, 1);
        const [{ url, init, body }] = calls;
        assert.equal(url, "https://api.brevo.com/v3/smtp/email");
        assert.equal(init.method, "POST");
        assert.equal(init.headers["api-key"], KEY);
        assert.equal(init.headers["Content-Type"], "application/json");
        assert.deepEqual(body.sender, { name: "VIDYADAAN", email: "vidyadaan.team@example.org" });
        assert.deepEqual(body.to, [{ email: "priya@example.com" }]);
        assert.equal(body.subject, "Reset your VIDYADAAN password");
        assert.match(body.textContent, /reset-password\/abc/);
        assert.match(body.htmlContent, /href="https:\/\/vidyadaan\.example\/reset-password\/abc"/);
        assert.deepEqual(Object.keys(body).sort(), ["htmlContent", "sender", "subject", "textContent", "to"]);
    });

    test("a plain sender address works too", async () => {
        process.env.EMAIL_FROM = "vidyadaan.team@example.org";
        await sendEmail({ to: "a@example.com", subject: "s", text: "t", html: "<p>t</p>" });
        assert.deepEqual(calls[0].body.sender, { email: "vidyadaan.team@example.org" });
    });

    test("a refused or failed request is an error that never contains the key", async () => {
        answer = () => Response.json({ code: "unauthorized", message: "Key not found" }, { status: 401 });
        await assert.rejects(sendEmail({ to: "a@example.com", subject: "s", text: "t", html: "t" }), (error) => {
            assert.match(error.message, /HTTP 401, unauthorized/);
            assert.ok(!error.message.includes(KEY));
            return true;
        });
        answer = () => {
            throw new TypeError("fetch failed");
        };
        await assert.rejects(sendEmail({ to: "a@example.com", subject: "s", text: "t", html: "t" }), /Brevo could not be reached/);
    });

    test("the startup check asks Brevo for the account (no email is sent)", async () => {
        answer = () => Response.json({ email: "owner@example.org" });
        await verifyEmailTransport();
        assert.equal(calls.length, 1);
        assert.equal(calls[0].url, "https://api.brevo.com/v3/account");
        assert.equal(calls[0].init.method, "GET");
        answer = () => Response.json({ code: "unauthorized" }, { status: 401 });
        await assert.rejects(verifyEmailTransport(), /HTTP 401/);
    });
});
