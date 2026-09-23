import dotenv from "dotenv";
import process from "node:process";
import createApp from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

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
        });
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server failed to start:", error.message);
        process.exit(1);
    }
};

startServer();
