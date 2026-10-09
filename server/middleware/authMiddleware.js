import mongoose from "mongoose";
import RevokedSession from "../models/RevokedSession.js";
import User from "../models/User.js";
import { getTokenFromRequest, renewAuthCookieIfDue, verifyToken } from "../utils/authToken.js";

/** The account a valid session token belongs to, or null if the session is no longer valid. */
const findSessionUser = async (payload) => {
    const [user, signedOut] = await Promise.all([
        User.findById(payload.userId),
        // This device signed out (only sessions issued with an id can be ended one at a time).
        payload.sid ? RevokedSession.exists({ sid: payload.sid }) : null,
    ]);
    const valid =
        user &&
        !signedOut &&
        user.accountStatus === "active" &&
        user.role === payload.role &&
        (user.tokenVersion ?? 0) === payload.tv;
    return valid ? user : null;
};

const readPayload = (req) => {
    const payload = verifyToken(getTokenFromRequest(req));
    return payload && mongoose.isValidObjectId(payload.userId) ? payload : null;
};

// Loads the logged-in user from the httpOnly cookie. The database — not the token or
// anything the browser sends — decides the user's current role and status.
const requireAuth = async (req, res, next) => {
    const payload = readPayload(req);

    if (!payload) {
        return res.status(401).json({ message: "Authentication is required." });
    }

    try {
        const user = await findSessionUser(payload);

        if (!user) {
            return res.status(401).json({ message: "Your session is invalid or has expired. Please log in again." });
        }

        req.user = user;
        // Sliding expiry: someone who keeps using the site stays signed in.
        renewAuthCookieIfDue(res, user, payload);
        return next();
    } catch (error) {
        return next(error);
    }
};

// For pages anyone may use (the help assistant): sets req.user exactly as requireAuth does when the
// session is valid, and otherwise carries on with no user — never a 401.
export const optionalAuth = async (req, res, next) => {
    const payload = readPayload(req);
    if (!payload) return next();

    try {
        const user = await findSessionUser(payload);
        if (user) {
            req.user = user;
            renewAuthCookieIfDue(res, user, payload);
        }
        return next();
    } catch (error) {
        return next(error);
    }
};

export default requireAuth;
