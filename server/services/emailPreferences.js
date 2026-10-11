// The "Stop these emails" link in every new-need email: it carries the account's id and a signature made
// with the server's secret, so it works without signing in, can only switch off that one account's
// emails, and can't be made up for anyone else's account. It doesn't expire: an old email's link still works.
import { Buffer } from "node:buffer";
import { createHmac, timingSafeEqual } from "node:crypto";
import process from "node:process";

const PURPOSE = "vidyadaan:stop-new-need-emails";

const signature = (userId) => createHmac("sha256", `${process.env.JWT_SECRET}:${PURPOSE}`).update(String(userId)).digest("base64url");

/** The token in the link for this account. */
export const stopEmailsToken = (userId) => `${String(userId)}.${signature(userId)}`;

/** The account id in a token, or null if the token wasn't made by this server. */
export const userIdFromStopToken = (token) => {
    if (typeof token !== "string" || token.length > 200) return null;
    const [userId, given, extra] = token.split(".");
    if (!userId || !given || extra !== undefined || !/^[0-9a-f]{24}$/.test(userId)) return null;
    const expected = Buffer.from(signature(userId));
    const received = Buffer.from(given);
    return received.length === expected.length && timingSafeEqual(received, expected) ? userId : null;
};
