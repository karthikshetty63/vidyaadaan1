import User from "../models/User.js";
import { EMAIL_PATTERN, getPasswordError, normalizeEmail } from "../../shared/registrationRules.js";

/**
 * Create an admin account, or reset an existing admin's password.
 * Never promotes an existing donor/school/NGO account to admin.
 * @returns {Promise<{ created: boolean, user: import("mongoose").Document }>}
 */
export const createOrResetAdmin = async ({ name, email, password, resetPassword = false }) => {
    const cleanEmail = normalizeEmail(email);
    const cleanName = typeof name === "string" ? name.trim() : "";
    if (!EMAIL_PATTERN.test(cleanEmail)) throw new Error("A valid --email is required.");
    const passwordError = getPasswordError(password);
    if (passwordError) throw new Error(passwordError);

    const existing = await User.findOne({ email: cleanEmail }).select("+password");
    if (existing) {
        if (existing.role !== "admin") throw new Error("That email belongs to a non-admin account. Use a different email.");
        if (!resetPassword) throw new Error("An admin with that email already exists. Pass --reset-password to change its password.");
        existing.password = password;
        existing.accountStatus = "active";
        existing.tokenVersion = (existing.tokenVersion ?? 0) + 1; // sign out old sessions
        await existing.save();
        return { created: false, user: existing };
    }

    if (cleanName.length < 2) throw new Error("A --name of at least 2 characters is required.");
    const user = await User.create({ name: cleanName, email: cleanEmail, password, role: "admin", accountStatus: "active" });
    return { created: true, user };
};
