import mongoose from "mongoose";

const donorProfileSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        phone: { type: String, required: true, trim: true },
        dob: { type: Date },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pin: { type: String, required: true, trim: true },
        causes: [{ type: String, trim: true }],
        frequency: { type: String, trim: true },
        anonymous: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const DonorProfile = mongoose.models.DonorProfile || mongoose.model("DonorProfile", donorProfileSchema);

export default DonorProfile;
