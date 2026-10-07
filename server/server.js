import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import createApp from "./app.js";
import connectDB from "./config/db.js";
import { resumeAlumniNotifications } from "./services/alumniNotifications.js";
import { emailProvider, isEmailConfigured, verifyEmailTransport } from "./services/emailService.js";
import { isGoogleSignInConfigured } from "./services/googleAuth.js";
import { isLiveKeyConfigured, isRazorpayConfigured } from "./services/razorpay.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
// The built website (npm run build). In production the server serves it too, from the same address.
const CLIENT_DIR = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), "dist");
const serveWebsite = process.env.NODE_ENV === "production" && fs.existsSync(path.join(CLIENT_DIR, "index.html"));

const startServer = async () => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from the project root .env file");
        }
        if (process.env.JWT_SECRET.length < 32) {
            console.warn("Warning: JWT_SECRET is shorter than 32 characters. Use a long random value.");
        }
        await connectDB();

        const app = createApp({
            corsOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
            trustProxy: process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY : undefined,
            clientDir: serveWebsite ? CLIENT_DIR : undefined,
        });
        // Express 5 passes a start-up error (e.g. the port is already in use) to this callback.
        app.listen(PORT, (error) => {
            if (error) {
                console.error("Server failed to start:", error.code === "EADDRINUSE" ? `port ${PORT} is already in use` : error.message);
                process.exit(1);
            }
            console.log(`Server running on http://localhost:${PORT}${serveWebsite ? " (website and API)" : ""}`);
        });

        // Email is optional for starting the server; without it, forgot-password answers 503 and
        // alumni emails are recorded as FAILED.
        if (!isEmailConfigured()) {
            console.warn("Email is not configured (EMAIL_FROM, plus BREVO_API_KEY or SMTP_HOST). Password reset and alumni emails are disabled.");
        } else {
            const via = emailProvider() === "brevo" ? "Brevo API" : "SMTP";
            verifyEmailTransport()
                .then(() => console.log(`Email (${via}) connection verified`))
                .catch((error) => console.warn(`Email (${via}) connection failed:`, error.message));
        }
        // Alumni emails that a restart left unsent.
        resumeAlumniNotifications({ frontendOrigin: app.locals.frontendOrigin })
            .then(({ projects, interrupted }) => {
                if (projects) console.log(`Resuming alumni emails for ${projects} approved project(s).`);
                if (interrupted) console.warn(`${interrupted} alumni email(s) were cut off by the last restart and marked FAILED.`);
            })
            .catch((error) => console.warn("Could not resume alumni emails:", error.message));
        console.log(
            isGoogleSignInConfigured()
                ? "Google sign-in: enabled"
                : "Google sign-in is not configured (VITE_GOOGLE_CLIENT_ID). The Google button stays hidden."
        );
        if (isRazorpayConfigured()) console.log("Donations: Razorpay test mode enabled");
        else if (isLiveKeyConfigured()) console.warn("Donations are off: RAZORPAY_KEY_ID is a live key. Only test keys (rzp_test_…) are accepted for now.");
        else console.warn("Donations are off: set RAZORPAY_KEY_ID (a rzp_test_ key) and RAZORPAY_KEY_SECRET in .env.");
    } catch (error) {
        console.error("Server failed to start:", error.message);
        process.exit(1);
    }
};

startServer();
