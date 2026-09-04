import mongoose from "mongoose";

const ngoProfileSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        ngoName: { type: String, required: true, trim: true },
        type: { type: String, trim: true },
        established: { type: Number },
        website: { type: String, trim: true },
        mission: { type: String, required: true, trim: true },
        focus: [{ type: String, trim: true }],
        regNumber: { type: String, required: true, trim: true },
        regDate: { type: Date, required: true },
        pan: { type: String, required: true, trim: true, select: false },
        address: { type: String, required: true, trim: true },
        district: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        contactName: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true },
        phone: { type: String, required: true, trim: true },
        altPhone: { type: String, trim: true },
    },
    { timestamps: true }
);

const NGOProfile = mongoose.models.NGOProfile || mongoose.model("NGOProfile", ngoProfileSchema);

export default NGOProfile;
