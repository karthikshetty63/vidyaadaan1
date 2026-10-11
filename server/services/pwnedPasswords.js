// Has a password appeared in a data breach? Checked with Have I Been Pwned's free "range" service, which
// never sees the password: only the first 5 characters of its SHA-1 hash leave the server, the service
// answers with every leaked hash that starts with them (plus random padding), and the match is made here.
import { createHash } from "node:crypto";

const RANGE_URL = "https://api.pwnedpasswords.com/range/";
const TIMEOUT_MS = 3000;

const realFetch = (...args) => fetch(...args);
let rangeFetch = realFetch;

/** Tests replace the HTTPS call: fn(url, init) must resolve to a Response. */
export const setPwnedPasswordsFetch = (fn) => {
    rangeFetch = fn || realFetch;
};

export const LEAKED_PASSWORD_MESSAGE = "This password has appeared in a data leak, so others may already know it. Choose another: three random words work well.";

/**
 * How many times the password appears in known data breaches: 0 if never. Null when the check couldn't be
 * made (the service is down or slow): the password is then judged by the other rules only.
 */
export const pwnedPasswordCount = async (password) => {
    const hash = createHash("sha1").update(String(password), "utf8").digest("hex").toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    try {
        const res = await rangeFetch(`${RANGE_URL}${prefix}`, {
            headers: { "Add-Padding": "true", "User-Agent": "VIDYADAAN" },
            signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        if (!res.ok) return null;
        for (const line of (await res.text()).split("\n")) {
            const [lineSuffix, count] = line.trim().split(":");
            // Padding lines have a count of 0.
            if (lineSuffix === suffix) return Number(count) || 0;
        }
        return 0;
    } catch {
        return null;
    }
};
