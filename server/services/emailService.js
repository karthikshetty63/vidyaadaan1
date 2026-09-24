// Outgoing email over SMTP (nodemailer). Every setting comes from environment variables —
// no provider, address or credential is hardcoded. Auth logic only calls the helpers below.
import nodemailer from "nodemailer";
import process from "node:process";

let transport;

/** Tests replace the SMTP connection with an in-memory transport: { sendMail(message) }. */
export const setEmailTransport = (customTransport) => {
    transport = customTransport;
};

/** True when there is enough configuration to attempt sending email. */
export const isEmailConfigured = () => Boolean(process.env.EMAIL_FROM && (transport || process.env.SMTP_HOST));

const getTransport = () => {
    if (!transport) {
        const port = Number(process.env.SMTP_PORT) || 587;
        transport = nodemailer.createTransport({
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
    return transport;
};

/** Log in to the SMTP server once, so a wrong host or password shows up at startup. */
export const verifyEmailTransport = () => getTransport().verify();

export const sendEmail = ({ to, subject, text, html }) => getTransport().sendMail({ from: process.env.EMAIL_FROM, to, subject, text, html });

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
