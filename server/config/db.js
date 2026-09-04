import mongoose from "mongoose";

const redactSecrets = (value) => {
    if (typeof value === "string") {
        return value
            .replace(/(mongodb(?:\+srv)?:\/\/)([^:]+):([^@]+)@/gi, "$1$2:<redacted>@")
            .replace(/(password|passwd|pwd)(\s*[:=]\s*)[^,\s}]+/gi, "$1$2<redacted>");
    }
    if (value instanceof Map) {
        return Object.fromEntries([...value.entries()].map(([key, item]) => [key, redactSecrets(item)]));
    }
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactSecrets(item)]));
    }
    return value;
};

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing from the project root .env file");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        const diagnostics = {
            name: error.name,
            message: redactSecrets(error.message),
            code: error.code,
            reason: redactSecrets(error.reason),
            topology: redactSecrets(error.reason?.topologyDescription || error.topologyDescription),
        };
        console.error("MongoDB connection failed:", JSON.stringify(diagnostics, null, 2));
        process.exit(1);
    }
};

export default connectDB;