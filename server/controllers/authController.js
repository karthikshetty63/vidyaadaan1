import bcrypt from "bcryptjs";
import User from "../models/User.js";
import DonorProfile from "../models/DonorProfile.js";
import NGOProfile from "../models/NGOProfile.js";
import SchoolProfile from "../models/SchoolProfile.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registrationFields = {
    donor: ["name", "email", "phone", "address", "city", "state", "pin", "password", "confirm"],
    school: ["schoolName", "udise", "address", "district", "state", "principalName", "email", "phone", "password", "confirm", "bankAccount", "ifsc"],
    ngo: ["ngoName", "mission", "regNumber", "regDate", "pan", "address", "district", "state", "contactName", "email", "phone", "password", "confirm"],
};

const validateRegistration = (body, role) => {
    const missing = registrationFields[role].find((field) => {
        const value = body[field];
        return typeof value === "string" ? !value.trim() : value === undefined || value === null;
    });
    if (missing) return `${missing} is required.`;
    if (typeof body.email !== "string" || !emailPattern.test(body.email.trim().toLowerCase())) return "Enter a valid email address.";
    if (typeof body.password !== "string" || body.password.length < 6) return "Password must be at least 6 characters.";
    if (typeof body.confirm !== "string" || body.password !== body.confirm) return "Passwords do not match.";
    if (body.agree !== true) return "You must agree to the terms and privacy policy.";
    return null;
};

const safeUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
});

export const register = async (req, res) => {
    const body = req.body || {};
    const role = typeof body.role === "string" ? body.role.toLowerCase() : "";

    if (!registrationFields[role]) {
        return res.status(400).json({ message: "Registration role must be donor, school, or ngo." });
    }

    const validationError = validateRegistration(body, role);
    if (validationError) return res.status(400).json({ message: validationError });

    const email = body.email.trim().toLowerCase();
    let user;

    try {
        if (await User.exists({ email })) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        user = await User.create({
            name: role === "school" ? body.principalName.trim() : role === "ngo" ? body.contactName.trim() : body.name.trim(),
            email,
            password: body.password,
            role,
            accountStatus: role === "donor" ? "active" : "pending",
        });

        const profileData = { ...body, userId: user._id, email };
        delete profileData.password;
        delete profileData.confirm;
        delete profileData.agree;
        delete profileData.role;

        if (role === "donor") await DonorProfile.create(profileData);
        if (role === "school") {
            profileData.infrastructure = {
                hasToilets: body.hasToilets === true,
                hasLibrary: body.hasLibrary === true,
                hasComputers: body.hasComputers === true,
                hasDrinkingWater: body.hasDrinkingWater === true,
            };
            profileData.bankDetails = { bankAccount: body.bankAccount, ifsc: body.ifsc, upi: body.upi };
            delete profileData.hasToilets;
            delete profileData.hasLibrary;
            delete profileData.hasComputers;
            delete profileData.hasDrinkingWater;
            delete profileData.bankAccount;
            delete profileData.ifsc;
            delete profileData.upi;
            await SchoolProfile.create(profileData);
        }
        if (role === "ngo") await NGOProfile.create(profileData);

        return res.status(201).json({ success: true, message: "Registration successful", user: safeUser(user) });
    } catch (error) {
        if (user?._id) await User.deleteOne({ _id: user._id }).catch(() => { });
        if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
        console.error("Registration failed:", error.message);
        return res.status(500).json({ message: "Registration failed. Please try again." });
    }
};

export const login = async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!emailPattern.test(email) || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        return res.status(200).json({
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login failed:", error.message);
        return res.status(500).json({ message: "Unable to sign in right now." });
    }
};
