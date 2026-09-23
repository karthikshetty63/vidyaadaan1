import mongoose from "mongoose";

const fileRef = { type: mongoose.Schema.Types.ObjectId, ref: "UploadedFile" };

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
        // School Photograph (shown on the school's dashboard/profile).
        photo: fileRef,
        // Private verification documents (owner + admin only).
        documents: {
            registrationCertificate: fileRef,
            principalIdProof: fileRef,
        },
    },
    { timestamps: true }
);

// One account per UDISE code. Partial so older records without a UDISE don't collide.
schoolProfileSchema.index(
    { udise: 1 },
    { unique: true, partialFilterExpression: { udise: { $type: "string", $gt: "" } } }
);

const SchoolProfile = mongoose.models.SchoolProfile || mongoose.model("SchoolProfile", schoolProfileSchema);

export default SchoolProfile;
