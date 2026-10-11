// The bank branch an IFSC code belongs to, from Razorpay's free IFSC service (ifsc.razorpay.com). The
// school registration form shows it so the school can see the code is right, and the server refuses an
// IFSC that belongs to no branch. Answers are kept for a day; nothing about the school is sent.
const API = "https://ifsc.razorpay.com/";
const TIMEOUT_MS = 4000;
const CACHE_LIMIT = 500;
const CACHE_MS = 24 * 60 * 60 * 1000;

const cache = new Map(); // code → { at, result }
const realFetch = (...args) => fetch(...args);
let ifscFetch = realFetch;

/** Tests replace the HTTPS call: fn(url, init) must resolve to a Response. */
export const setIfscFetch = (fn) => {
    ifscFetch = fn || realFetch;
    cache.clear();
};

const text = (value) => (typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 120) : "");

/**
 * @param {string} code an IFSC in the right shape (shared/registrationRules.js IFSC_PATTERN)
 * @returns {Promise<{found: true, bank: string, branch: string, city: string, district: string, state: string} | {found: false} | null>}
 *   null when the service couldn't be reached: the code is then accepted on its shape alone.
 */
export const lookupIfsc = async (code) => {
    const cached = cache.get(code);
    if (cached && Date.now() - cached.at < CACHE_MS) return cached.result;
    let result;
    try {
        const res = await ifscFetch(`${API}${encodeURIComponent(code)}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(TIMEOUT_MS) });
        if (res.status === 404) {
            result = { found: false };
        } else if (res.ok) {
            const data = await res.json();
            result = { found: true, bank: text(data.BANK), branch: text(data.BRANCH), city: text(data.CITY), district: text(data.DISTRICT), state: text(data.STATE) };
        } else {
            return null;
        }
    } catch {
        return null;
    }
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
    cache.set(code, { at: Date.now(), result });
    return result;
};

/** "State Bank of India, Honnali branch" for the school's profile and the admin review. */
export const branchLabel = (found) => [found.branch, found.district || found.city, found.state].filter(Boolean).join(", ");
