import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import process from "node:process";
import { ACCOUNT_STATUSES, ROLES } from "../../shared/registrationRules.js";

// Fewer hashing rounds only inside the automated test suite, to keep it fast.
const BCRYPT_ROUNDS = process.env.NODE_ENV === "test" ? 4 : 12;

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 150 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
        // Optional only for accounts that sign in with Google (they can add one later via Forgot password).
        password: { type: String, select: false, required: [function passwordRequired() { return !this.googleId; }, "Password is required."] },
        // The Google account ("sub" claim) linked through Sign in with Google.
        googleId: { type: String, unique: true, sparse: true },
        role: { type: String, required: true, enum: ROLES },
        accountStatus: { type: String, enum: ACCOUNT_STATUSES, default: "active" },
        // Incremented on password reset, linking Google, or rejection: every session on every device ends.
        tokenVersion: { type: Number, default: 0 },
        // Approval audit trail (set by an admin).
        statusChangedAt: { type: Date },
        statusChangedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rejectionReason: { type: String, trim: true, maxlength: 500 },
        // Forgot-password: only the SHA-256 hash of the emailed token is stored, never the token itself.
        passwordResetToken: { type: String, select: false },
        passwordResetExpires: { type: Date, select: false },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc, ret) => {
                delete ret.password;
                delete ret.googleId;
                delete ret.passwordResetToken;
                delete ret.passwordResetExpires;
                return ret;
            },
        },
    }
);

// Admin approval queue lookups: { role: "school", accountStatus: "pending" }.
userSchema.index({ role: 1, accountStatus: 1, createdAt: -1 });
// Reset-link lookups; most users never have a token, so the index stays small.
userSchema.index({ passwordResetToken: 1 }, { sparse: true });

userSchema.pre("save", async function hashPassword() {
    // Nothing to hash when the password was removed (e.g. when an account is linked to Google).
    if (!this.isModified("password") || !this.password) return;
    this.password = await bcrypt.hash(this.password, BCRYPT_ROUNDS);
});

userSchema.methods.verifyPassword = function verifyPassword(candidate) {
    return this.password ? bcrypt.compare(candidate, this.password) : Promise.resolve(false);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
