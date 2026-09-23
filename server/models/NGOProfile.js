import mongoose from "mongoose";

const fileRef = { type: mongoose.Schema.Types.ObjectId, ref: "UploadedFile" };

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
        // Private verification documents (owner + admin only).
        documents: {
            registrationCertificate: fileRef,
            certificate12A80G: fileRef,
            annualReport: fileRef,
            panCard: fileRef,
        },
    },
    { timestamps: true }
);

// One NGO account per PAN. Partial so older records without a PAN don't collide.
ngoProfileSchema.index(
    { pan: 1 },
    { unique: true, partialFilterExpression: { pan: { $type: "string", $gt: "" } } }
);

const NGOProfile = mongoose.models.NGOProfile || mongoose.model("NGOProfile", ngoProfileSchema);

export default NGOProfile;
