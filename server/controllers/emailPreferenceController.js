import User from "../models/User.js";
import { userIdFromStopToken } from "../services/emailPreferences.js";
import { NEW_NEED_EMAIL_ROLES } from "../services/newNeedEmails.js";

// Whether an NGO or donor gets an email when a new school need is approved (services/newNeedEmails.js).
// Turned off from the "Stop these emails" link in any of those emails (no sign-in), or in Settings.

const wantsNewNeedEmails = (user) => user.newNeedEmails !== false;

// POST /api/public/emails/stop  { token } — the link's page. Only ever switches emails off.
export const stopNewNeedEmails = async (req, res, next) => {
    const userId = userIdFromStopToken(req.body?.token);
    if (!userId) return res.status(400).json({ message: "This link isn't valid. Open it again from the email, or turn these emails off in Settings." });
    try {
        await User.updateOne({ _id: userId, role: { $in: NEW_NEED_EMAIL_ROLES } }, { $set: { newNeedEmails: false } });
        return res.json({ message: "Done. You won't get emails about new school needs any more." });
    } catch (error) {
        return next(error);
    }
};

// GET /api/notifications/preferences — the signed-in NGO's or donor's choice.
export const getEmailPreferences = (req, res) => {
    res.set("Cache-Control", "no-store");
    return res.json({ newNeedEmails: wantsNewNeedEmails(req.user) });
};

// PATCH /api/notifications/preferences  { newNeedEmails: true | false }
export const updateEmailPreferences = async (req, res, next) => {
    const body = req.body;
    const value = body?.newNeedEmails;
    const unexpected = body && typeof body === "object" ? Object.keys(body).filter((key) => key !== "newNeedEmails") : [];
    if (typeof value !== "boolean" || unexpected.length) {
        return res.status(400).json({ message: "Send newNeedEmails as true or false.", errors: { newNeedEmails: "Must be true or false." } });
    }
    try {
        await User.updateOne({ _id: req.user._id }, { $set: { newNeedEmails: value } });
        return res.json({
            message: value ? "You'll get an email when a new school need is approved." : "You won't get emails about new school needs.",
            newNeedEmails: value,
        });
    } catch (error) {
        return next(error);
    }
};
