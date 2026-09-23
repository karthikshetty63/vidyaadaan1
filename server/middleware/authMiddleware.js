import mongoose from "mongoose";
import User from "../models/User.js";
import { getTokenFromRequest, verifyToken } from "../utils/authToken.js";

// Loads the logged-in user from the httpOnly cookie. The database — not the token or
// anything the browser sends — decides the user's current role and status.
const requireAuth = async (req, res, next) => {
    const payload = verifyToken(getTokenFromRequest(req));

    if (!payload || !mongoose.isValidObjectId(payload.userId)) {
        return res.status(401).json({ message: "Authentication is required." });
    }

    try {
        const user = await User.findById(payload.userId);

        if (
            !user ||
            user.accountStatus !== "active" ||
            user.role !== payload.role ||
            (user.tokenVersion ?? 0) !== payload.tv
        ) {
            return res.status(401).json({ message: "Your session is invalid or has expired. Please log in again." });
        }

        req.user = user;
        return next();
    } catch (error) {
        return next(error);
    }
};

export default requireAuth;
