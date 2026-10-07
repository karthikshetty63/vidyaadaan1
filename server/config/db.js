import mongoose from "mongoose";
import process from "node:process";

const connectDB = async () => {
    // Spaces or a line break picked up when copying the value into a hosting dashboard are ignored.
    const uri = (process.env.MONGO_URI || "").trim();
    if (!uri) {
        throw new Error("MONGO_URI is missing from the project root .env file");
    }

    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

export default connectDB;
