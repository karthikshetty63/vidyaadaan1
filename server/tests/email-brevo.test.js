import assert from "node:assert/strict";
import process from "node:process";
import { after, beforeEach, describe, test } from "node:test";

// Brevo's HTTPS email API, with a stand-in for Brevo: nothing leaves the machine and the key is made up.
const KEY = "xkeysib-test-not-a-real-key";
const { emailProvider, isEmailConfigured, parseSender, sendEmail, sendPasswordResetEmail, setBrevoFetch, verifyEmailTransport } = await import("../services/emailService.js");

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

    test("EMAIL_FROM as typed into a dashboard: quotation marks around it are ignored (the 'valid sender email required' failure)", async () => {
        const expected = { name: "VIDYADAAN", email: "vidyadaan001@gmail.com" };
        for (const typed of [
            "VIDYADAAN <vidyadaan001@gmail.com>",
            '"VIDYADAAN <vidyadaan001@gmail.com>"',
            "'VIDYADAAN <vidyadaan001@gmail.com>'",
            "“VIDYADAAN <vidyadaan001@gmail.com>”",
            '"VIDYADAAN" <vidyadaan001@gmail.com>',
            "  VIDYADAAN<vidyadaan001@gmail.com>\n",
        ]) {
            assert.deepEqual(parseSender(typed), expected, JSON.stringify(typed));
        }
        assert.deepEqual(parseSender('"vidyadaan001@gmail.com"'), { email: "vidyadaan001@gmail.com" });

        process.env.EMAIL_FROM = '"VIDYADAAN <vidyadaan001@gmail.com>"';
        await sendEmail({ to: "a@example.com", subject: "s", text: "t", html: "<p>t</p>" });
        assert.deepEqual(calls[0].body.sender, expected);
    });

    test("a sender with no valid address is refused with a message saying what to type, and Brevo is not asked", async () => {
        for (const typed of ["VIDYADAAN", "VIDYADAAN <vidyadaan001>", "VIDYADAAN (vidyadaan001@gmail.com)", "<>", "VIDYADAAN <a@b.c> <d@e.f>"]) {
            assert.equal(parseSender(typed), null, typed);
        }
        process.env.EMAIL_FROM = "VIDYADAAN";
        await assert.rejects(sendEmail({ to: "a@example.com", subject: "s", text: "t", html: "t" }), /EMAIL_FROM is not a valid sender\. Use the form VIDYADAAN <you@gmail\.com>, without quotation marks\. It is "VIDYADAAN"\./);
        await assert.rejects(verifyEmailTransport(), /EMAIL_FROM is not a valid sender/);
        assert.equal(calls.length, 0, "nothing was sent to Brevo");
    });

    test("a plain sender address works too", async () => {
        process.env.EMAIL_FROM = "vidyadaan.team@example.org";
        await sendEmail({ to: "a@example.com", subject: "s", text: "t", html: "<p>t</p>" });
        assert.deepEqual(calls[0].body.sender, { email: "vidyadaan.team@example.org" });
    });

    test("a refused or failed request is an error that never contains the key", async () => {
        answer = () => Response.json({ code: "unauthorized", message: "Key not found" }, { status: 401 });
        await assert.rejects(sendEmail({ to: "a@example.com", subject: "s", text: "t", html: "t" }), (error) => {
            assert.equal(error.message, "Brevo refused the request (HTTP 401, unauthorized): Key not found");
            assert.ok(!error.message.includes(KEY));
            return true;
        });
        // Brevo's explanation is shown (here, the IP check), but never the key, even if Brevo echoed it.
        answer = () => Response.json({ code: "unauthorized", message: `We have detected you are using an unrecognised IP address 1.2.3.4. Key ${KEY} is blocked.` }, { status: 401 });
        await assert.rejects(sendEmail({ to: "a@example.com", subject: "s", text: "t", html: "t" }), (error) => {
            assert.match(error.message, /unrecognised IP address/);
            assert.ok(!error.message.includes(KEY));
            assert.match(error.message, /Key \[key\] is blocked/);
            return true;
        });
        answer = () => {
            throw new TypeError("fetch failed");
        };
        await assert.rejects(sendEmail({ to: "a@example.com", subject: "s", text: "t", html: "t" }), /Brevo could not be reached/);
    });

    // Brevo's answers for the startup check: the account, its senders and its domains.
    const brevoSetup = ({ senders = [], domains = [], account = { email: "owner@example.org" } } = {}) => (url) => {
        if (url.endsWith("/v3/account")) return Response.json(account);
        if (url.endsWith("/v3/senders")) return Response.json({ senders });
        if (url.endsWith("/v3/senders/domains")) return Response.json({ domains });
        return Response.json({ code: "not_found" }, { status: 404 });
    };

    test("the startup check: key works and the sender is verified in Brevo → says who it sends as (no email is sent)", async () => {
        answer = brevoSetup({ senders: [{ id: 1, name: "VIDYADAAN", email: "Vidyadaan.Team@example.org", active: true }] });
        assert.equal(await verifyEmailTransport(), "VIDYADAAN <vidyadaan.team@example.org>");
        assert.deepEqual(calls.map((c) => [c.init.method, c.url]), [["GET", "https://api.brevo.com/v3/account"], ["GET", "https://api.brevo.com/v3/senders"]]);
        assert.ok(calls.every((c) => c.init.headers["api-key"] === KEY));
    });

    test("the startup check names the exact problem: bad key, sender not verified, sender missing", async () => {
        answer = () => Response.json({ code: "unauthorized", message: "Key not found" }, { status: 401 });
        await assert.rejects(verifyEmailTransport(), /HTTP 401, unauthorized\): Key not found/);

        answer = brevoSetup({ senders: [{ email: "vidyadaan.team@example.org", active: false }] });
        await assert.rejects(verifyEmailTransport(), /added in Brevo but not verified yet/);

        answer = brevoSetup({ senders: [{ email: "someone.else@example.org", active: true }] });
        await assert.rejects(verifyEmailTransport(), /Brevo has no verified sender vidyadaan\.team@example\.org/);

        // Any address on a domain verified in Brevo is fine (e.g. after connecting your own domain).
        answer = brevoSetup({ domains: [{ domain_name: "example.org", authenticated: true, verified: true }] });
        assert.equal(await verifyEmailTransport(), "VIDYADAAN <vidyadaan.team@example.org>");
    });
});
