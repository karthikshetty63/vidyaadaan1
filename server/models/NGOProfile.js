import mongoose from "mongoose";

const ngoProfileSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        ngoName: String,
        type: String,
        established: Number,
        website: String,
        mission: String,
        focus: [String],
        regNumber: String,
        regDate: Date,
        pan: String,
        address: String,
        district: String,
        state: String,
        contactName: String,
        email: String,
        phone: String,
        altPhone: String,
    },
    { timestamps: true }
);

const NGOProfile = mongoose.models.NGOProfile || mongoose.model("NGOProfile", ngoProfileSchema);

export default NGOProfile;
