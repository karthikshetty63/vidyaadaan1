import mongoose from "mongoose";

const schoolProfileSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        schoolName: { type: String, required: true, trim: true },
        udise: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        district: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        principalName: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
        students: { type: Number },
        teachers: { type: Number },
        infrastructure: {
            hasToilets: { type: Boolean, default: false },
            hasLibrary: { type: Boolean, default: false },
            hasComputers: { type: Boolean, default: false },
            hasDrinkingWater: { type: Boolean, default: false },
        },
        bankDetails: {
            bankAccount: { type: String, select: false },
            ifsc: { type: String, select: false },
            upi: { type: String, select: false },
        },
    },
    { timestamps: true }
);

const SchoolProfile = mongoose.models.SchoolProfile || mongoose.model("SchoolProfile", schoolProfileSchema);

export default SchoolProfile;
