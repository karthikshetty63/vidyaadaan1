import bcrypt from "bcryptjs";
import { parseCookie, stringifySetCookie } from "cookie";
import jwt from "jsonwebtoken";
import process from "node:process";
import DonorProfile from "../models/DonorProfile.js";
import NGOProfile from "../models/NGOProfile.js";
import SchoolProfile from "../models/SchoolProfile.js";
import User from "../models/User.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const publicRoles = ["donor", "school", "ngo"];
const authCookie = "vidyaadaan_auth";
const isProduction = process.env.NODE_ENV === "production";

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing from the environment");
    return process.env.JWT_SECRET;
};

const cookieOptions = (remember = false) => ({
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: remember ? 30 * 24 * 60 * 60 : undefined,
    path: "/",
});

const setAuthCookie = (res, user, remember) => {
    const token = jwt.sign({ userId: user._id.toString(), role: user.role }, getJwtSecret(), {
        expiresIn: remember ? "30d" : "1d",
    });
    res.setHeader("Set-Cookie", stringifySetCookie({ name: authCookie, value: token, ...cookieOptions(remember) }));
};

const clearAuthCookie = (res) => {
    res.setHeader("Set-Cookie", stringifySetCookie({ name: authCookie, value: "", ...cookieOptions(), maxAge: 0 }));
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
    const name = typeof body.name === "string"
        ? body.name.trim()
        : typeof body.principalName === "string"
            ? body.principalName.trim()
            : typeof body.contactName === "string"
                ? body.contactName.trim()
                : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = typeof body.role === "string" ? body.role.trim().toLowerCase() : "";

    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: "Name, email, password, and role are required." });
    }

    if (!publicRoles.includes(role)) {
        return res.status(400).json({ message: "Role must be donor, school, or ngo." });
    }

    if (!emailPattern.test(email)) {
        return res.status(400).json({ message: "Enter a valid email address." });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    let user;
    try {
        if (await User.exists({ email })) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        user = await User.create({
            name,
            email,
            password,
            role,
            accountStatus: role === "donor" ? "active" : "pending",
        });

        const profileData = { ...body, userId: user._id, email };
        delete profileData.name;
        delete profileData.password;
        delete profileData.confirm;
        delete profileData.role;
        delete profileData.agree;

        if (role === "school") {
            profileData.infrastructure = {
                hasToilets: body.hasToilets === true,
                hasLibrary: body.hasLibrary === true,
                hasComputers: body.hasComputers === true,
                hasDrinkingWater: body.hasDrinkingWater === true,
            };
            delete profileData.hasToilets;
            delete profileData.hasLibrary;
            delete profileData.hasComputers;
            delete profileData.hasDrinkingWater;
            await SchoolProfile.create(profileData);
        } else if (role === "ngo") {
            await NGOProfile.create(profileData);
        } else {
            await DonorProfile.create(profileData);
        }

        return res.status(201).json({
            message: "Registration successful",
            user: safeUser(user),
        });
    } catch (error) {
        if (user?._id) await User.deleteOne({ _id: user._id }).catch(() => { });
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists." });
        }

        console.error("Registration failed:", error.message);
        return res.status(500).json({ message: "Registration failed. Please try again." });
    }
};

export const login = async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!email || !password || !emailPattern.test(email)) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (user.accountStatus === "rejected") {
            return res.status(401).json({ message: "This account has been rejected." });
        }

        if (user.accountStatus === "pending") {
            return res.status(401).json({ message: "This account is pending approval." });
        }

        setAuthCookie(res, user, req.body?.remember === true);

        return res.status(200).json({
            message: "Login successful",
            user: safeUser(user),
        });
    } catch (error) {
        console.error("Login failed:", error.message);
        return res.status(500).json({ message: "Login failed. Please try again." });
    }
};

export const me = async (req, res) => {
    return res.status(200).json({ user: safeUser(req.user) });
};

export const logout = (_req, res) => {
    clearAuthCookie(res);
    return res.status(200).json({ message: "Logged out successfully." });
};

export const getTokenFromRequest = (req) => parseCookie(req.headers.cookie || "")[authCookie];
