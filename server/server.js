import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import process from "node:process";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/api/test", (_req, res) => {
    res.json({ message: "Vidyaadaan API is working" });
});

const startServer = async () => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing from the project root .env file");
        }
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch {
        process.exit(1);
    }
};

startServer();
