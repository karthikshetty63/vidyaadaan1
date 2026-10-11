// Has a new password appeared in a data breach? Asked of Have I Been Pwned straight from the browser, so
// the person hears it on the password's own step. The password never leaves the browser: only the first
// 5 characters of its SHA-1 hash are sent, and the match is made here. The server checks again when the
// form is submitted (server/services/pwnedPasswords.js).
const RANGE_URL = "https://api.pwnedpasswords.com/range/";
const TIMEOUT_MS = 3000;

export const LEAKED_PASSWORD_MESSAGE = "This password has appeared in a data leak, so others may already know it. Choose another: three random words work well.";

/** How many times it has leaked (0: never), or null when the check couldn't be made. */
export const pwnedPasswordCount = async (password) => {
  try {
    const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(password));
    const hash = [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
    const res = await fetch(`${RANGE_URL}${hash.slice(0, 5)}`, { headers: { "Add-Padding": "true" }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null;
    const suffix = hash.slice(5);
    for (const line of (await res.text()).split("\n")) {
      const [lineSuffix, count] = line.trim().split(":");
      if (lineSuffix === suffix) return Number(count) || 0;
    }
    return 0;
  } catch {
    return null;
  }
};
