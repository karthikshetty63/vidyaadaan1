// "Sign in with Google": checks the ID token that Google hands the browser.
// No extra package: Google publishes its signing keys, and jsonwebtoken checks the
// signature, audience (our Client ID), issuer and expiry.
import { createPublicKey } from "node:crypto";
import jwt from "jsonwebtoken";
import process from "node:process";

const GOOGLE_KEYS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"];
const CLIENT_ID_PATTERN = /^[\w.-]+\.apps\.googleusercontent\.com$/;
// If a token names a key we don't know, Google may have rotated its keys: refetch, but at most once a minute.
const MIN_REFETCH_MS = 60 * 1000;

/** A token that is forged, expired, for another app, or otherwise unusable (the user should just retry). */
export class GoogleTokenError extends Error {}

// One Client ID serves both halves of the app: the website reads VITE_GOOGLE_CLIENT_ID, so the server does too.
export const getGoogleClientId = () => (process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || "").trim();
export const isGoogleSignInConfigured = () => CLIENT_ID_PATTERN.test(getGoogleClientId());

const fetchGoogleKeys = async () => {
    const response = await fetch(GOOGLE_KEYS_URL, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error(`Google signing keys request failed (${response.status})`);
    const maxAge = Number(/max-age=(\d+)/.exec(response.headers.get("cache-control") || "")?.[1]) || 3600;
    const { keys } = await response.json();
    return { keys, maxAge };
};

let keySource = fetchGoogleKeys;
let cache = { keys: new Map(), expiresAt: 0, fetchedAt: 0 };

/** Tests supply their own keys: source() must resolve to { keys: [JWK, ...], maxAge: seconds }. */
export const setGoogleKeySource = (source) => {
    keySource = source || fetchGoogleKeys;
    cache = { keys: new Map(), expiresAt: 0, fetchedAt: 0 };
};

const refreshKeys = async () => {
    const { keys = [], maxAge } = await keySource();
    const usable = keys.filter((k) => k && k.kty === "RSA" && typeof k.kid === "string");
    cache = {
        keys: new Map(usable.map((k) => [k.kid, createPublicKey({ key: k, format: "jwk" })])),
        expiresAt: Date.now() + maxAge * 1000,
        fetchedAt: Date.now(),
    };
};

const getSigningKey = async (kid) => {
    if (Date.now() >= cache.expiresAt) await refreshKeys();
    else if (!cache.keys.has(kid) && Date.now() - cache.fetchedAt >= MIN_REFETCH_MS) await refreshKeys();
    return cache.keys.get(kid);
};

/**
 * Returns { googleId, email, name } for a genuine token issued to this app.
 * Throws GoogleTokenError for a bad token; any other error means Google's keys could not be loaded.
 */
export const verifyGoogleIdToken = async (credential) => {
    const decoded = jwt.decode(credential, { complete: true });
    if (!decoded || decoded.header?.alg !== "RS256" || typeof decoded.header.kid !== "string") {
        throw new GoogleTokenError("Malformed token");
    }

    const key = await getSigningKey(decoded.header.kid);
    if (!key) throw new GoogleTokenError("Unknown signing key");

    let claims;
    try {
        claims = jwt.verify(credential, key, {
            algorithms: ["RS256"],
            audience: getGoogleClientId(),
            issuer: GOOGLE_ISSUERS,
            clockTolerance: 30,
        });
    } catch {
        throw new GoogleTokenError("Invalid token");
    }

    if (claims.email_verified !== true && claims.email_verified !== "true") throw new GoogleTokenError("Email not verified");
    if (typeof claims.sub !== "string" || !claims.sub || typeof claims.email !== "string") throw new GoogleTokenError("Missing claims");

    return {
        googleId: claims.sub,
        email: claims.email.trim().toLowerCase(),
        name: typeof claims.name === "string" ? claims.name.trim().slice(0, 120) : "",
    };
};
