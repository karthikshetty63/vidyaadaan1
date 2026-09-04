import mongoose from "mongoose";

const schoolProfileSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        schoolName: String,
        udise: String,
        address: String,
        district: String,
        state: String,
        principalName: String,
        email: String,
        phone: String,
        students: Number,
        teachers: Number,
        infrastructure: {
            hasToilets: Boolean,
            hasLibrary: Boolean,
            hasComputers: Boolean,
            hasDrinkingWater: Boolean,
        },
        bankAccount: String,
        ifsc: String,
        upi: String,
    },
    { timestamps: true }
);

const SchoolProfile = mongoose.models.SchoolProfile || mongoose.model("SchoolProfile", schoolProfileSchema);

export default SchoolProfile;
