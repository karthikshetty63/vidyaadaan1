// JWT + httpOnly cookie helpers shared by the auth controller and requireAuth.
import { parseCookie, stringifySetCookie } from "cookie";
import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import process from "node:process";

export const AUTH_COOKIE = "vidyaadaan_auth";
const JWT_ALGORITHM = "HS256";

// "Remember me": 30 days on this device. Otherwise the cookie ends with the browser (1 day at most).
const REMEMBER_SECONDS = 30 * 24 * 60 * 60;
const SESSION_SECONDS = 24 * 60 * 60;
// Sliding expiry: while someone keeps using the site, their session is re-issued (once a day / once an hour).
const RENEW_AFTER_SECONDS = { remember: 24 * 60 * 60, session: 60 * 60 };

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
    maxAge: remember ? REMEMBER_SECONDS : undefined,
    path: "/",
});

/**
 * Signs the user in on this device.
 * sid identifies this device's session: it survives renewals, and "Sign out" revokes exactly it.
 * rm remembers the "Remember me" choice so renewals keep the same cookie type.
 */
export const setAuthCookie = (res, user, remember = false, sid = randomUUID()) => {
    const token = jwt.sign(
        { userId: user._id.toString(), role: user.role, tv: user.tokenVersion ?? 0, sid, rm: remember },
        getJwtSecret(),
        { algorithm: JWT_ALGORITHM, expiresIn: remember ? REMEMBER_SECONDS : SESSION_SECONDS }
    );
    res.setHeader("Set-Cookie", stringifySetCookie({ name: AUTH_COOKIE, value: token, ...cookieOptions(remember) }));
};

/** Re-issues the session cookie when it is old enough, keeping its session id and "Remember me" choice. */
export const renewAuthCookieIfDue = (res, user, payload) => {
    // Sessions from before "rm" existed: a lifetime longer than a day means "Remember me" was ticked.
    const remember = payload.rm ?? payload.exp - payload.iat > SESSION_SECONDS;
    const age = Math.floor(Date.now() / 1000) - payload.iat;
    if (age < (remember ? RENEW_AFTER_SECONDS.remember : RENEW_AFTER_SECONDS.session)) return;
    setAuthCookie(res, user, remember, payload.sid);
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
