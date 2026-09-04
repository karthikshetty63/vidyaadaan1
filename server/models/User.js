import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, select: false },
        role: { type: String, required: true, enum: ["donor", "school", "ngo", "admin"] },
        accountStatus: { type: String, enum: ["active", "pending", "rejected"], default: "active" },
    },
    { timestamps: true }
);

userSchema.pre("save", async function hashPassword() {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
