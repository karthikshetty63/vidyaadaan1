// Confirming the email address of a new account: the registration form asks for a 6-digit code that is
// emailed to the address, and only someone who received it can register with that address.
//
//   issueEmailCode    a new random code (stored only as a keyed hash), at most one a minute and a few an
//                     hour for the same address
//   checkEmailCode    the code typed back: at most 5 wrong tries per code; the right one gives a proof (a
//                     random token, stored only as a hash) that the form sends with the registration
//   hasEmailProof     the registration checks the proof; consumeEmailProof removes it once the account exists
import { Buffer } from "node:buffer";
import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import process from "node:process";
import EmailVerification from "../models/EmailVerification.js";
import { EMAIL_CODE_RESEND_SECONDS, EMAIL_CODE_TTL_MINUTES } from "../../shared/registrationRules.js";

export const MAX_WRONG_CODES = 5;
const MAX_CODES_PER_HOUR = 5;
// Long enough to finish a registration form with its documents.
const PROOF_TTL_MINUTES = 120;
const KEEP_RECORD_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const codeHash = (email, code) => createHmac("sha256", `${process.env.JWT_SECRET}:email-code`).update(`${email}:${code}`).digest("hex");
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const minutes = (n) => n * 60 * 1000;
const sameHex = (a, b) => typeof a === "string" && typeof b === "string" && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));

/**
 * A new code for `email`, replacing any earlier one.
 * @returns {Promise<{code: string} | {waitSeconds: number}>} waitSeconds when another code can't be sent yet
 */
export const issueEmailCode = async (email) => {
    const now = new Date();
    const record = await EmailVerification.findOne({ email }).lean();
    if (record?.sentAt) {
        const wait = Math.ceil((record.sentAt.getTime() + EMAIL_CODE_RESEND_SECONDS * 1000 - now.getTime()) / 1000);
        if (wait > 0) return { waitSeconds: wait };
    }
    const sameWindow = record?.windowStart && now - record.windowStart < HOUR_MS;
    if (sameWindow && record.sends >= MAX_CODES_PER_HOUR) {
        return { waitSeconds: Math.ceil((record.windowStart.getTime() + HOUR_MS - now.getTime()) / 1000) };
    }
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    await EmailVerification.updateOne(
        { email },
        {
            $set: {
                codeHash: codeHash(email, code),
                codeExpiresAt: new Date(now.getTime() + minutes(EMAIL_CODE_TTL_MINUTES)),
                attempts: 0,
                sentAt: now,
                windowStart: sameWindow ? record.windowStart : now,
                sends: sameWindow ? record.sends + 1 : 1,
                expireAt: new Date(now.getTime() + KEEP_RECORD_MS),
            },
            // A new code also cancels a proof from an earlier one.
            $unset: { proofHash: "", proofExpiresAt: "" },
        },
        { upsert: true }
    );
    return { code };
};

/**
 * The code someone typed.
 * @returns {Promise<{proof: string} | {error: "EXPIRED"|"TOO_MANY"|"WRONG", triesLeft?: number}>}
 */
export const checkEmailCode = async (email, code) => {
    const now = new Date();
    const record = await EmailVerification.findOne({ email }).lean();
    if (!record?.codeHash || !record.codeExpiresAt || record.codeExpiresAt <= now) return { error: "EXPIRED" };
    if (record.attempts >= MAX_WRONG_CODES) return { error: "TOO_MANY" };

    if (!sameHex(codeHash(email, code), record.codeHash)) {
        // Counted atomically, so many guesses at once can't get past the limit.
        const updated = await EmailVerification.findOneAndUpdate(
            { _id: record._id, codeHash: record.codeHash, attempts: { $lt: MAX_WRONG_CODES } },
            { $inc: { attempts: 1 } },
            { returnDocument: "after" }
        ).lean();
        const left = updated ? MAX_WRONG_CODES - updated.attempts : 0;
        return left > 0 ? { error: "WRONG", triesLeft: left } : { error: "TOO_MANY" };
    }

    // The right code: it can't be used again, and the form gets a proof for the registration.
    const proof = randomBytes(32).toString("hex");
    const claimed = await EmailVerification.findOneAndUpdate(
        { _id: record._id, codeHash: record.codeHash, attempts: { $lt: MAX_WRONG_CODES } },
        {
            $set: { proofHash: sha256(proof), proofExpiresAt: new Date(now.getTime() + minutes(PROOF_TTL_MINUTES)), expireAt: new Date(now.getTime() + KEEP_RECORD_MS) },
            $unset: { codeHash: "", codeExpiresAt: "" },
        }
    );
    return claimed ? { proof } : { error: "EXPIRED" };
};

/** True when `proof` is the one given for this address, and still valid. */
export const hasEmailProof = async (email, proof) => {
    if (typeof proof !== "string" || !/^[a-f0-9]{64}$/.test(proof)) return false;
    const record = await EmailVerification.findOne({ email, proofExpiresAt: { $gt: new Date() } }).select("proofHash").lean();
    return Boolean(record) && sameHex(sha256(proof), record.proofHash);
};

/** Once the account exists, the proof has done its job. */
export const consumeEmailProof = (email) => EmailVerification.deleteOne({ email });
