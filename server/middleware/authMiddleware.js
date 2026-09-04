import jwt from "jsonwebtoken";
import process from "node:process";
import User from "../models/User.js";
import { getTokenFromRequest } from "../controllers/authController.js";

const requireAuth = async (req, res, next) => {
    const token = getTokenFromRequest(req);

    if (!token || !process.env.JWT_SECRET) {
        return res.status(401).json({ message: "Authentication is required." });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.userId);

        if (!user || user.accountStatus !== "active" || user.role !== payload.role) {
            return res.status(401).json({ message: "Authentication is invalid or expired." });
        }

        req.user = user;
        return next();
    } catch {
        return res.status(401).json({ message: "Authentication is invalid or expired." });
    }
};

export default requireAuth;
