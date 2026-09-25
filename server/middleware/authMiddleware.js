import mongoose from "mongoose";
import RevokedSession from "../models/RevokedSession.js";
import User from "../models/User.js";
import { getTokenFromRequest, renewAuthCookieIfDue, verifyToken } from "../utils/authToken.js";

// Loads the logged-in user from the httpOnly cookie. The database — not the token or
// anything the browser sends — decides the user's current role and status.
const requireAuth = async (req, res, next) => {
    const payload = verifyToken(getTokenFromRequest(req));

    if (!payload || !mongoose.isValidObjectId(payload.userId)) {
        return res.status(401).json({ message: "Authentication is required." });
    }

    try {
        const [user, signedOut] = await Promise.all([
            User.findById(payload.userId),
            // This device signed out (only sessions issued with an id can be ended one at a time).
            payload.sid ? RevokedSession.exists({ sid: payload.sid }) : null,
        ]);

        if (
            !user ||
            signedOut ||
            user.accountStatus !== "active" ||
            user.role !== payload.role ||
            (user.tokenVersion ?? 0) !== payload.tv
        ) {
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

export default requireAuth;
