import User from "../models/User.js";
import { buildNotifications } from "../services/notifications.js";

// The signed-in school's, NGO's or donor's notifications (/api/notifications). They are worked out
// from the account's own records each time, so there is nothing here another account could ask for.

// GET /api/notifications — what needs this account's action, the news, and how many are new.
export const listNotifications = async (req, res, next) => {
    try {
        res.set("Cache-Control", "no-store");
        return res.json(await buildNotifications(req.user));
    } catch (error) {
        return next(error);
    }
};

// GET /api/notifications/count — only the numbers, for the bell on every page.
export const countNotifications = async (req, res, next) => {
    try {
        const { unread, actions } = await buildNotifications(req.user);
        res.set("Cache-Control", "no-store");
        return res.json({ unread, waiting: actions.length });
    } catch (error) {
        return next(error);
    }
};

// POST /api/notifications/seen  { asOf? } — the account has looked at its notifications.
// `asOf` is the time the list it looked at was read (from GET /api/notifications), so anything that
// arrived after that list was loaded still counts as new. It can't be in the future or move backwards.
export const markNotificationsSeen = async (req, res, next) => {
    const now = new Date();
    const sent = req.body?.asOf;
    let seenAt = now;
    if (sent !== undefined) {
        const asOf = typeof sent === "string" ? new Date(sent) : null;
        if (!asOf || Number.isNaN(asOf.getTime())) return res.status(400).json({ message: "asOf must be a date and time.", errors: { asOf: "asOf must be a date and time." } });
        if (asOf < now) seenAt = asOf;
    }
    try {
        // $max: looking at an older list never brings back what a newer one already cleared.
        const updated = await User.findOneAndUpdate({ _id: req.user._id }, { $max: { notificationsSeenAt: seenAt } }, { returnDocument: "after" }).select("notificationsSeenAt").lean();
        res.set("Cache-Control", "no-store");
        return res.json({ seenAt: updated.notificationsSeenAt });
    } catch (error) {
        return next(error);
    }
};
