// Builds the Express application. Kept separate from server.js (which loads .env,
// connects to MongoDB and listens) so the automated tests can create the exact same
// app against a throwaway database.
import cors from "cors";
import express from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";
import helmet from "helmet";
import path from "node:path";
import { apiNotFound, errorHandler } from "./middleware/errorHandler.js";
import adminMonitorRoutes from "./routes/adminMonitorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import createApprovedProjectRouter from "./routes/approvedProjectRoutes.js";
import createAuthRouter from "./routes/authRoutes.js";
import createChatbotRouter from "./routes/chatbotRoutes.js";
import createDonationRouter from "./routes/donationRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import ngoRoutes from "./routes/ngoRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import createPublicProjectRouter from "./routes/publicProjectRoutes.js";
import schoolAlumniRoutes from "./routes/schoolAlumniRoutes.js";
import schoolCommitmentRoutes from "./routes/schoolCommitmentRoutes.js";
import schoolDonationRoutes from "./routes/schoolDonationRoutes.js";
import schoolEventRoutes from "./routes/schoolEventRoutes.js";
import schoolPaymentRoutes from "./routes/schoolPaymentRoutes.js";
import schoolPhotoRoutes from "./routes/schoolPhotoRoutes.js";
import schoolProjectRoutes from "./routes/schoolProjectRoutes.js";

const DEFAULT_RATE_LIMITS = {
    // Counts only failed attempts: 10 wrong passwords per 15 minutes per IP.
    login: { windowMs: 15 * 60 * 1000, limit: 10 },
    register: { windowMs: 60 * 60 * 1000, limit: 20 },
    // Each request can send an email, so this is kept tight: 5 per 15 minutes per IP.
    forgotPassword: { windowMs: 15 * 60 * 1000, limit: 5 },
    resetPassword: { windowMs: 15 * 60 * 1000, limit: 10 },
    // Each new donation is a request to Razorpay: 20 per 15 minutes per donor.
    donationOrders: { windowMs: 15 * 60 * 1000, limit: 20 },
    // The same for an NGO paying its parts online: 20 per 15 minutes per NGO.
    ngoOnlineOrders: { windowMs: 15 * 60 * 1000, limit: 20 },
    // Public project pages need no sign-in: 120 per minute per IP is plenty for people, not for scrapers.
    publicProjects: { windowMs: 60 * 1000, limit: 120 },
    // Each help-assistant question can be a paid AI request: 20 per 10 minutes per account (per IP when
    // not signed in).
    chatbot: { windowMs: 10 * 60 * 1000, limit: 20 },
};

// What the website may load. Everything is VIDYADAAN's own except Google Fonts, Unsplash photos (sign-in
// pages), Razorpay Checkout, Sign in with Google and the Google Maps preview of a school's location.
const CONTENT_SECURITY_POLICY = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "https://*.razorpay.com", "https://accounts.google.com/gsi/client"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com/gsi/style"],
    fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://*.razorpay.com", "https://*.gstatic.com", "https://*.googleusercontent.com", "https://*.google.com"],
    connectSrc: ["'self'", "https://*.razorpay.com", "https://accounts.google.com/gsi/"],
    frameSrc: ["https://*.razorpay.com", "https://accounts.google.com/gsi/", "https://maps.google.com", "https://www.google.com"],
    // The host serves HTTPS and redirects plain HTTP itself; on a computer the site is plain http://localhost.
    upgradeInsecureRequests: null,
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
 * The website's address (FRONTEND_ORIGIN), cleaned up: surrounding spaces or a line break picked up when
 * copying it are removed, and so is a final "/". Anything that isn't a plain http(s) address stops the
 * server with a clear message, instead of every response failing on an invalid header.
 * " https://Vidyadaan.onrender.com/\n" → "https://vidyadaan.onrender.com"
 */
export const normalizeOrigin = (value) => {
    const text = String(value ?? "").trim();
    let url = null;
    try {
        url = new URL(text);
    } catch {
        // reported below
    }
    const plain = url && ["http:", "https:"].includes(url.protocol) && url.pathname === "/" && !url.search && !url.hash && !url.username && !url.password;
    if (!plain || !/^[\x21-\x7e]+$/.test(text)) {
        throw new Error(`FRONTEND_ORIGIN must be only the website's address, like https://vidyadaan.onrender.com. It is ${JSON.stringify(text)}.`);
    }
    return url.origin;
};

/**
 * @param {object} [options]
 * @param {string} [options.corsOrigin] the React app's origin (cookies are only accepted from it)
 * @param {false|{login?:object, register?:object, forgotPassword?:object, resetPassword?:object, donationOrders?:object, ngoOnlineOrders?:object, publicProjects?:object, chatbot?:object}} [options.rateLimits] false disables limits (tests)
 * @param {string|number|boolean} [options.trustProxy] set when running behind a reverse proxy
 * @param {string} [options.clientDir] the built website (dist/), to serve it from this same address (production)
 */
export const createApp = ({ corsOrigin: configuredOrigin = "http://localhost:5173", rateLimits = DEFAULT_RATE_LIMITS, trustProxy, clientDir } = {}) => {
    const corsOrigin = normalizeOrigin(configuredOrigin);
    const app = express();
    if (trustProxy !== undefined) app.set("trust proxy", trustProxy);
    // Links in emails point at the configured React app — never at the request's Host header.
    app.locals.frontendOrigin = corsOrigin;

    const limits = rateLimits === false ? {} : { ...DEFAULT_RATE_LIMITS, ...rateLimits };

    // Security headers. Resource policy "same-site" lets the React dev server (another port) read API responses.
    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: "same-site" },
            contentSecurityPolicy: { directives: CONTENT_SECURITY_POLICY },
            // Sign in with Google opens a popup that has to report back to the page.
            crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
            // Google sign-in checks which site it is on, which "no-referrer" would hide.
            referrerPolicy: { policy: "strict-origin-when-cross-origin" },
        })
    );
    app.use(cors({ origin: corsOrigin, credentials: true }));
    app.use(express.json({ limit: "100kb" }));

    app.get("/api/test", (_req, res) => {
        res.json({ message: "Vidyaadaan API is working" });
    });

    app.use("/api/auth", createAuthRouter({
        loginLimiter: makeLimiter(limits.login, "Too many failed login attempts. Please wait 15 minutes and try again.", { skipSuccessfulRequests: true }),
        registerLimiter: makeLimiter(limits.register, "Too many registration attempts. Please try again later."),
        forgotPasswordLimiter: makeLimiter(limits.forgotPassword, "Too many password reset requests. Please wait 15 minutes and try again."),
        resetPasswordLimiter: makeLimiter(limits.resetPassword, "Too many password reset attempts. Please wait 15 minutes and try again."),
    }));
    // The admin Control Tower (read-only, admin-only; its router checks the session and role itself).
    app.use("/api/admin/monitor", adminMonitorRoutes);
    app.use("/api/admin", adminRoutes);
    app.use("/api/profile", profileRoutes);
    app.use("/api/files", fileRoutes);
    app.use("/api/school/projects", schoolProjectRoutes);
    app.use("/api/school/photos", schoolPhotoRoutes);
    app.use("/api/school/commitments", schoolCommitmentRoutes);
    app.use("/api/school/payments", schoolPaymentRoutes);
    app.use("/api/school/alumni", schoolAlumniRoutes);
    app.use("/api/school/events", schoolEventRoutes);
    app.use("/api/school/donations", schoolDonationRoutes);
    app.use("/api/events", eventRoutes);
    app.use("/api/projects", createApprovedProjectRouter({
        // Counted per signed-in NGO (the router checks who it is before this runs).
        onlineOrderLimiter: makeLimiter(limits.ngoOnlineOrders, "Too many payment attempts. Please wait a few minutes and try again.", {
            keyGenerator: (req) => req.user._id.toString(),
        }),
    }));
    // No sign-in: the public page of an approved project (the link in alumni emails).
    app.use("/api/public/projects", createPublicProjectRouter({
        limiter: makeLimiter(limits.publicProjects, "Too many requests. Please wait a minute and try again."),
    }));
    // Signed in or not: the help assistant (its persona comes from the session, never from the browser).
    app.use("/api/chatbot", createChatbotRouter({
        limiter: makeLimiter(limits.chatbot, "You've asked a lot of questions in a short time. Please wait a few minutes and try again.", {
            keyGenerator: (req) => (req.user ? `user:${req.user._id}` : `ip:${ipKeyGenerator(req.ip)}`),
        }),
    }));
    app.use("/api/ngo", ngoRoutes);
    app.use("/api/donations", createDonationRouter({
        // Counted per signed-in donor (the router checks who it is before this runs).
        orderLimiter: makeLimiter(limits.donationOrders, "Too many donation attempts. Please wait a few minutes and try again.", {
            keyGenerator: (req) => req.user._id.toString(),
        }),
    }));

    if (clientDir) {
        // The built website, from the same address as the API, so the sign-in cookie is first-party in
        // every browser. Files in /assets get a new name with every build, so browsers may keep them;
        // index.html is always checked again, so a new deploy reaches people on their next visit.
        app.use("/assets", express.static(path.join(clientDir, "assets"), { immutable: true, maxAge: "1y" }), (_req, res) => res.status(404).end());
        app.use(express.static(clientDir, { index: false, maxAge: "1h" }));
        // Every other page (/, /projects/<id>, /dashboard/…) is the React app, which picks the page itself.
        app.get(/^(?!\/api(?:\/|$))/, (_req, res) => {
            res.set("Cache-Control", "no-cache");
            res.sendFile(path.join(clientDir, "index.html"));
        });
    }

    app.use("/api", apiNotFound);
    app.use(errorHandler);

    return app;
};

export default createApp;
