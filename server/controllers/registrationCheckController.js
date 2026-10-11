import User from "../models/User.js";
import { checkEmailCode, issueEmailCode } from "../services/emailVerification.js";
import { isEmailConfigured, sendEmailCode as sendEmailCodeEmail } from "../services/emailService.js";
import { lookupIfsc } from "../services/ifscLookup.js";
import {
    EMAIL_CODE_LENGTH,
    EMAIL_CODE_PATTERN,
    EMAIL_CODE_RESEND_SECONDS,
    EMAIL_CODE_TTL_MINUTES,
    EMAIL_PATTERN,
    IFSC_PATTERN,
    PUBLIC_ROLES,
    normalizeEmail,
} from "../../shared/registrationRules.js";

// The checks the registration forms make before the final submit (the registration repeats the ones that
// matter): confirming the email address with an emailed code, and looking up an IFSC code's bank branch.

const fieldError = (res, status, field, message, extra = {}) => res.status(status).json({ message, errors: { [field]: message }, ...extra });

// POST /api/auth/email-code  { email, role } — emails a 6-digit code to the address.
export const sendEmailCode = async (req, res, next) => {
    const email = normalizeEmail(req.body?.email);
    const role = typeof req.body?.role === "string" ? req.body.role : "";
    if (!PUBLIC_ROLES.includes(role)) return fieldError(res, 400, "role", "Role must be donor, school, or ngo.");
    if (!EMAIL_PATTERN.test(email) || email.length > 254) return fieldError(res, 400, "email", "Enter a valid email address.");
    try {
        // The same answer the registration itself would give, but before the form is filled in.
        if (await User.exists({ email })) return fieldError(res, 409, "email", "An account with this email already exists.");
        if (!isEmailConfigured()) {
            return res.status(503).json({ code: "EMAIL_UNAVAILABLE", message: "We can't send emails right now, so new accounts can't be confirmed. Please try again later." });
        }
        const issued = await issueEmailCode(email);
        if (issued.waitSeconds) {
            const minutes = Math.ceil(issued.waitSeconds / 60);
            const message = issued.waitSeconds <= EMAIL_CODE_RESEND_SECONDS
                ? `We've just sent a code. You can ask for another in ${issued.waitSeconds} seconds.`
                : `Too many codes for this address. Try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`;
            return res.status(429).json({ code: "WAIT", message, retryAfterSeconds: issued.waitSeconds });
        }
        try {
            await sendEmailCodeEmail({ to: email, code: issued.code, role, expiresInMinutes: EMAIL_CODE_TTL_MINUTES });
        } catch (sendError) {
            console.error("Email code could not be sent:", sendError.message);
            return res.status(502).json({ code: "EMAIL_FAILED", message: "We couldn't send the code. Check the address and try again in a minute." });
        }
        return res.json({
            message: `We've sent a ${EMAIL_CODE_LENGTH}-digit code to ${email}.`,
            expiresInMinutes: EMAIL_CODE_TTL_MINUTES,
            resendAfterSeconds: EMAIL_CODE_RESEND_SECONDS,
        });
    } catch (error) {
        return next(error);
    }
};

const CODE_ERRORS = {
    EXPIRED: "This code has expired or was already used. Ask for a new one.",
    TOO_MANY: "Too many wrong codes. Ask for a new one.",
};

// POST /api/auth/verify-email  { email, code } — the right code gives the proof the registration needs.
export const verifyEmailCode = async (req, res, next) => {
    const email = normalizeEmail(req.body?.email);
    const code = typeof req.body?.code === "string" ? req.body.code.replace(/\s/g, "") : "";
    if (!EMAIL_PATTERN.test(email)) return fieldError(res, 400, "email", "Enter a valid email address.");
    if (!EMAIL_CODE_PATTERN.test(code)) return fieldError(res, 400, "emailCode", "Enter the 6-digit code from the email.");
    try {
        const result = await checkEmailCode(email, code);
        if (result.proof) return res.json({ message: "Email address confirmed.", emailProof: result.proof });
        if (result.error === "WRONG") {
            return fieldError(res, 400, "emailCode", `That code isn't right. ${result.triesLeft} ${result.triesLeft === 1 ? "try" : "tries"} left.`, { code: "WRONG_CODE" });
        }
        return fieldError(res, 400, "emailCode", CODE_ERRORS[result.error], { code: result.error });
    } catch (error) {
        return next(error);
    }
};

// GET /api/public/ifsc/:code — the bank branch, so the school can see its IFSC is right.
export const lookupBranch = async (req, res, next) => {
    const code = String(req.params.code || "").trim().toUpperCase();
    if (!IFSC_PATTERN.test(code)) return res.status(400).json({ message: "An IFSC code looks like SBIN0001234." });
    try {
        const branch = await lookupIfsc(code);
        if (!branch) return res.status(503).json({ code: "LOOKUP_UNAVAILABLE", message: "We can't check IFSC codes right now." });
        if (!branch.found) return res.status(404).json({ message: "No bank branch has this IFSC code. Check it on your passbook or cheque book." });
        res.set("Cache-Control", "public, max-age=86400");
        return res.json({ ifsc: code, bank: branch.bank, branch: branch.branch, city: branch.city, district: branch.district, state: branch.state });
    } catch (error) {
        return next(error);
    }
};
