// Builds the Express application. Kept separate from server.js (which loads .env,
// connects to MongoDB and listens) so the automated tests can create the exact same
// app against a throwaway database.
import cors from "cors";
import express from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { apiNotFound, errorHandler } from "./middleware/errorHandler.js";
import adminRoutes from "./routes/adminRoutes.js";
import createAuthRouter from "./routes/authRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";

const DEFAULT_RATE_LIMITS = {
    // Counts only failed attempts: 10 wrong passwords per 15 minutes per IP.
    login: { windowMs: 15 * 60 * 1000, limit: 10 },
    register: { windowMs: 60 * 60 * 1000, limit: 20 },
};

const makeLimiter = (config, message, options = {}) =>
    config
        ? rateLimit({
            windowMs: config.windowMs,
            limit: config.limit,
            standardHeaders: "draft-8",
            legacyHeaders: false,
            message: { message },
            ...options,
        })
        : (_req, _res, next) => next();

/**
 * @param {object} [options]
 * @param {string} [options.corsOrigin] the React app's origin (cookies are only accepted from it)
 * @param {false|{login?:object, register?:object}} [options.rateLimits] false disables limits (tests)
 * @param {string|number|boolean} [options.trustProxy] set when running behind a reverse proxy
 */
export const createApp = ({ corsOrigin = "http://localhost:5173", rateLimits = DEFAULT_RATE_LIMITS, trustProxy } = {}) => {
    const app = express();
    if (trustProxy !== undefined) app.set("trust proxy", trustProxy);

    const limits = rateLimits === false ? {} : { ...DEFAULT_RATE_LIMITS, ...rateLimits };

    // Security headers. Resource policy "same-site" lets the React dev server (another port) read API responses.
    app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
    app.use(cors({ origin: corsOrigin, credentials: true }));
    app.use(express.json({ limit: "100kb" }));

    app.get("/api/test", (_req, res) => {
        res.json({ message: "Vidyaadaan API is working" });
    });

    app.use("/api/auth", createAuthRouter({
        loginLimiter: makeLimiter(limits.login, "Too many failed login attempts. Please wait 15 minutes and try again.", { skipSuccessfulRequests: true }),
        registerLimiter: makeLimiter(limits.register, "Too many registration attempts. Please try again later."),
    }));
    app.use("/api/admin", adminRoutes);
    app.use("/api/profile", profileRoutes);
    app.use("/api/files", fileRoutes);

    app.use("/api", apiNotFound);
    app.use(errorHandler);

    return app;
};

export default createApp;
