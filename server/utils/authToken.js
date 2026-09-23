// JWT + httpOnly cookie helpers shared by the auth controller and requireAuth.
import { parseCookie, stringifySetCookie } from "cookie";
import jwt from "jsonwebtoken";
import process from "node:process";

export const AUTH_COOKIE = "vidyaadaan_auth";
const JWT_ALGORITHM = "HS256";

const isProduction = () => process.env.NODE_ENV === "production";

const getJwtSecret = () => {
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing from the environment");
    return process.env.JWT_SECRET;
};

const cookieOptions = (remember = false) => ({
    httpOnly: true,
    secure: isProduction(),
    sameSite: isProduction() ? "none" : "lax",
    // Seconds. Without "remember me" it is a browser-session cookie (token still expires in 1 day).
    maxAge: remember ? 30 * 24 * 60 * 60 : undefined,
    path: "/",
});

export const setAuthCookie = (res, user, remember = false) => {
    const token = jwt.sign(
        { userId: user._id.toString(), role: user.role, tv: user.tokenVersion ?? 0 },
        getJwtSecret(),
        { algorithm: JWT_ALGORITHM, expiresIn: remember ? "30d" : "1d" }
    );
    res.setHeader("Set-Cookie", stringifySetCookie({ name: AUTH_COOKIE, value: token, ...cookieOptions(remember) }));
};

export const clearAuthCookie = (res) => {
    res.setHeader("Set-Cookie", stringifySetCookie({ name: AUTH_COOKIE, value: "", ...cookieOptions(), maxAge: 0 }));
};

export const getTokenFromRequest = (req) => parseCookie(req.headers.cookie || "")[AUTH_COOKIE];

/** Returns the decoded payload, or null if the token is missing, forged or expired. */
export const verifyToken = (token) => {
    if (!token) return null;
    try {
        return jwt.verify(token, getJwtSecret(), { algorithms: [JWT_ALGORITHM] });
    } catch {
        return null;
    }
};

/** The only user fields ever sent to the browser. */
export const safeUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
});
