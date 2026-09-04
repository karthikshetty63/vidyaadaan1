import mongoose from "mongoose";
import process from "node:process";

const connectDB = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing from the project root .env file");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        throw error;
    }
};

export default connectDB;
