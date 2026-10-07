// Outgoing email. Every setting comes from environment variables: no provider, address or credential
// is hardcoded. Which service sends depends on what is configured:
//   BREVO_API_KEY set   Brevo's HTTPS email API (port 443), for hosts that block SMTP (e.g. Render's free plan)
//   otherwise           SMTP through nodemailer: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
// EMAIL_FROM ("Name <address>") is the sender either way. Auth and alumni logic only call the helpers below.
import nodemailer from "nodemailer";
import process from "node:process";

const BREVO_SEND_URL = "https://api.brevo.com/v3/smtp/email";
const BREVO_ACCOUNT_URL = "https://api.brevo.com/v3/account";

let customTransport;
let smtpTransport;
const realFetch = (url, init) => fetch(url, init);
let brevoFetch = realFetch;

/** Tests replace the email service with an in-memory transport: { sendMail(message) }. */
export const setEmailTransport = (transport) => {
    customTransport = transport;
};

/** Tests replace the HTTPS call to Brevo: fn(url, init) must resolve to a Response. */
export const setBrevoFetch = (fn) => {
    brevoFetch = fn || realFetch;
};

const brevoKey = () => (process.env.BREVO_API_KEY || "").trim();

/** Who sends email: "test", "brevo" or "smtp"; null when email isn't set up. */
export const emailProvider = () => {
    if (!process.env.EMAIL_FROM) return null;
    if (customTransport) return "test";
    if (brevoKey()) return "brevo";
    return process.env.SMTP_HOST ? "smtp" : null;
};

/** True when there is enough configuration to attempt sending email. */
export const isEmailConfigured = () => emailProvider() !== null;

const getSmtpTransport = () => {
    if (!smtpTransport) {
        const port = Number(process.env.SMTP_PORT) || 587;
        smtpTransport = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            // Port 465 uses TLS from the start; 587 upgrades the connection with STARTTLS.
            secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
            auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
            connectionTimeout: 10_000,
            greetingTimeout: 10_000,
            socketTimeout: 20_000,
        });
    }
    return smtpTransport;
};

/** "VIDYADAAN <no-reply@example.org>" → { name: "VIDYADAAN", email: "no-reply@example.org" } */
const parseAddress = (value = "") => {
    const match = /^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/.exec(value);
    return match ? { ...(match[1] ? { name: match[1] } : {}), email: match[2].trim() } : { email: value.trim() };
};

const brevoRequest = async (url, init) => {
    let response;
    try {
        response = await brevoFetch(url, {
            ...init,
            headers: { "api-key": brevoKey(), Accept: "application/json", ...(init.body ? { "Content-Type": "application/json" } : {}) },
            signal: AbortSignal.timeout(15_000),
        });
    } catch (error) {
        throw new Error(`Brevo could not be reached (${error.name})`, { cause: error });
    }
    const body = await response.json().catch(() => ({}));
    // Only the status and Brevo's error code: never the key.
    if (!response.ok) throw new Error(`Brevo refused the request (HTTP ${response.status}${body.code ? `, ${body.code}` : ""})`);
    return body;
};

/** Check the email settings once at startup, so a wrong key, host or password shows up in the log. */
export const verifyEmailTransport = async () => {
    const provider = emailProvider();
    if (provider === "brevo") await brevoRequest(BREVO_ACCOUNT_URL, { method: "GET" });
    else if (provider === "smtp") await getSmtpTransport().verify();
};

/** One email to one address. */
export const sendEmail = ({ to, subject, text, html }) => {
    const provider = emailProvider();
    if (provider === "test") return customTransport.sendMail({ from: process.env.EMAIL_FROM, to, subject, text, html });
    if (provider === "brevo") {
        return brevoRequest(BREVO_SEND_URL, {
            method: "POST",
            body: JSON.stringify({ sender: parseAddress(process.env.EMAIL_FROM), to: [{ email: to }], subject, textContent: text, htmlContent: html }),
        });
    }
    return getSmtpTransport().sendMail({ from: process.env.EMAIL_FROM, to, subject, text, html });
};

const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

export const sendPasswordResetEmail = ({ to, name, resetUrl, expiresInMinutes }) => {
    const greeting = name ? `Hi ${name},` : "Hi,";
    const expiry = `This link expires in ${expiresInMinutes} minutes and can only be used once.`;
    const ignore = "If you didn't request a password reset, you can ignore this email. Your password won't change.";

    const text = [
        greeting,
        "",
        "We received a request to reset your VIDYADAAN password.",
        "",
        `Reset your password: ${resetUrl}`,
        "",
        expiry,
        ignore,
        "",
        "The VIDYADAAN team",
    ].join("\n");

    const url = escapeHtml(resetUrl);
    const muted = "margin:0;font-size:13px;line-height:20px;color:#64748b;";
    const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px 12px;background:#f8fafc;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
      <tr><td style="padding:32px;">
        <p style="margin:0 0 24px;font-size:15px;font-weight:700;letter-spacing:0.04em;color:#0b192c;">VIDYADAAN</p>
        <h1 style="margin:0 0 16px;font-size:20px;line-height:28px;font-weight:600;">Password reset</h1>
        <p style="margin:0 0 8px;font-size:14px;line-height:22px;color:#334155;">${escapeHtml(greeting)}</p>
        <p style="margin:0 0 24px;font-size:14px;line-height:22px;color:#334155;">We received a request to reset your VIDYADAAN password.</p>
        <a href="${url}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">Reset password</a>
        <p style="${muted}margin-top:24px;">${escapeHtml(expiry)}</p>
        <p style="${muted}margin-top:8px;">${escapeHtml(ignore)}</p>
        <p style="${muted}margin-top:24px;font-size:12px;">If the button doesn't work, paste this link into your browser:<br><a href="${url}" style="color:#1d4ed8;word-break:break-all;">${url}</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;

    return sendEmail({ to, subject: "Reset your VIDYADAAN password", text, html });
};

const formatRupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const formatDay = (date) => new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Tells one alum that their school's project was approved. Every detail comes from the stored
 * project and school, word for word. Sent to a single address: no alum ever sees another's.
 * @param {object} p
 * @param {string} p.to the alum's email address
 * @param {string} p.name the alum's name
 * @param {{ name: string, district?: string, state?: string }} p.school
 * @param {{ title: string, problem: string, budget: number, category: string, priority: string, studentsBenefited: number, expectedCompletion: Date, location?: string }} p.project
 * @param {string} p.projectUrl where "View project" leads
 */
export const sendProjectApprovedEmail = ({ to, name, school, project, projectUrl }) => {
    const location = [school.district, school.state].filter(Boolean).join(", ") || project.location || "";
    const subject = `A new school project needs your support — ${project.title}`;
    const intro = `A new project from ${school.name} has been approved on VIDYADAAN and is now open for support.`;
    const why = [
        `${Number(project.studentsBenefited).toLocaleString("en-IN")} students will benefit`,
        `Category: ${project.category}`,
        `Priority: ${project.priority}`,
        `The school hopes to complete it by ${formatDay(project.expectedCompletion)}`,
    ];
    const facts = [["Target", formatRupees(project.budget)], ["School", school.name], ...(location ? [["Location", location]] : [])];
    const signIn = "No account is needed to view it. To donate, sign in with a VIDYADAAN donor account.";
    const thanks = "Thank you for supporting education in your community.";
    const receivingReason = `You're receiving this because ${school.name} added you to its alumni list on VIDYADAAN. To stop these emails, ask the school to remove you from the list.`;

    const text = [
        `Hello ${name},`,
        "",
        intro,
        "",
        "PROJECT",
        project.title,
        "",
        "PROBLEM STATEMENT",
        project.problem,
        "",
        "WHY SUPPORT IS NEEDED",
        ...why.map((line) => `- ${line}`),
        "",
        ...facts.map(([label, value]) => `${label.toUpperCase()}: ${value}`),
        "",
        `View project: ${projectUrl}`,
        signIn,
        "",
        thanks,
        "",
        "VIDYADAAN",
        "Transparent Education Development Platform",
        "",
        receivingReason,
    ].join("\n");

    const url = escapeHtml(projectUrl);
    const label = "margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;";
    const body = "margin:0;font-size:14px;line-height:22px;color:#334155;";
    const muted = "margin:0;font-size:12px;line-height:18px;color:#64748b;";
    const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px 12px;background:#f8fafc;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;">
      <tr><td style="padding:32px;">
        <p style="margin:0 0 24px;font-size:15px;font-weight:700;letter-spacing:0.04em;color:#0b192c;">VIDYADAAN</p>
        <p style="${body}margin-bottom:8px;">Hello ${escapeHtml(name)},</p>
        <p style="${body}margin-bottom:24px;">${escapeHtml(intro)}</p>

        <p style="${label}">Project</p>
        <h1 style="margin:0 0 20px;font-size:20px;line-height:28px;font-weight:600;color:#0f172a;">${escapeHtml(project.title)}</h1>

        <p style="${label}">Problem statement</p>
        <p style="${body}margin-bottom:20px;white-space:pre-line;">${escapeHtml(project.problem)}</p>

        <p style="${label}">Why support is needed</p>
        <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;line-height:22px;color:#334155;">
          ${why.map((line) => `<li>${escapeHtml(line)}</li>`).join("\n          ")}
        </ul>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e2e8f0;border-radius:8px;">
          ${facts
              .map(
                  ([factLabel, value], i) =>
                      `<tr><td style="padding:10px 14px;font-size:13px;color:#64748b;width:110px;${i ? "border-top:1px solid #e2e8f0;" : ""}">${escapeHtml(factLabel)}</td><td style="padding:10px 14px;font-size:14px;font-weight:600;color:#0f172a;${i ? "border-top:1px solid #e2e8f0;" : ""}">${escapeHtml(value)}</td></tr>`
              )
              .join("\n          ")}
        </table>

        <a href="${url}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">View project</a>
        <p style="${muted}margin-top:10px;">${escapeHtml(signIn)}</p>

        <p style="${body}margin-top:24px;">${escapeHtml(thanks)}</p>
        <p style="${body}margin-top:16px;font-weight:600;color:#0f172a;">VIDYADAAN</p>
        <p style="${muted}">Transparent Education Development Platform</p>

        <p style="${muted}margin-top:24px;padding-top:16px;border-top:1px solid #e2e8f0;">${escapeHtml(receivingReason)}</p>
        <p style="${muted}margin-top:8px;">If the button doesn't work, paste this link into your browser:<br><a href="${url}" style="color:#1d4ed8;word-break:break-all;">${url}</a></p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;

    return sendEmail({ to, subject, text, html });
};
