import mongoose from "mongoose";

// Confirming an email address before registration (services/emailVerification.js). One record per
// address: the code's keyed hash (never the code), when it expires and how many wrong tries it has had,
// how many codes were sent in the last hour, and — once the right code was typed — the hash of the proof
// the registration form sends back. Records delete themselves a day after they were last used.
const emailVerificationSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        codeHash: { type: String },
        codeExpiresAt: { type: Date },
        attempts: { type: Number, default: 0 },
        sentAt: { type: Date },
        // Codes sent since `windowStart` (at most a few an hour).
        windowStart: { type: Date },
        sends: { type: Number, default: 0 },
        proofHash: { type: String },
        proofExpiresAt: { type: Date },
        expireAt: { type: Date, required: true },
    },
    { timestamps: true }
);

emailVerificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification = mongoose.models.EmailVerification || mongoose.model("EmailVerification", emailVerificationSchema);

export default EmailVerification;
