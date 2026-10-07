// Storage for uploaded files: MongoDB's built-in file storage (GridFS), in the same database as
// everything else. Files survive server restarts and redeploys (free hosts wipe their disk), and
// nothing else needs setting up.
//
// Every read/write/delete of uploaded bytes goes through this module, so controllers never see
// how files are stored. Files are never served directly: only through the authenticated
// GET /api/files/:id route, which checks who may open each one.
import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";

// GridFS keeps each file in two collections: uploads.files (name, size) and uploads.chunks (the bytes).
const BUCKET_NAME = "uploads";
const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: BUCKET_NAME });

const EXTENSIONS = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "application/pdf": ".pdf" };

/**
 * Identify a file from its first bytes ("magic numbers").
 * Returns the real MIME type, or null if it is not one of the allowed kinds.
 */
export const detectFileType = (buffer) => {
    if (!buffer || buffer.length < 12) return null;
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "image/jpeg";
    if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
    if (buffer.subarray(0, 4).toString("latin1") === "RIFF" && buffer.subarray(8, 12).toString("latin1") === "WEBP") return "image/webp";
    if (buffer.subarray(0, 5).toString("latin1") === "%PDF-") return "application/pdf";
    return null;
};

// storageKey is always generated here: 32 hex chars + a known extension. It is the file's name in GridFS.
const KEY_PATTERN = /^[a-f0-9]{32}\.(jpg|png|webp|pdf)$/;

const checkKey = (storageKey) => {
    if (!KEY_PATTERN.test(storageKey)) throw new Error("Invalid storage key");
    return storageKey;
};

/** Store the bytes under a new random name; returns that name (the storageKey). */
export const saveBuffer = async (buffer, mimeType) => {
    const extension = EXTENSIONS[mimeType];
    if (!extension) throw new Error("Unsupported file type");
    const storageKey = `${randomBytes(16).toString("hex")}${extension}`;
    await writeStoredFile(storageKey, buffer, mimeType);
    return storageKey;
};

/** Write bytes under an existing storageKey (used by saveBuffer, and to copy files stored on disk before). */
export const writeStoredFile = (storageKey, buffer, mimeType) =>
    new Promise((resolve, reject) => {
        const upload = bucket().openUploadStream(checkKey(storageKey), { metadata: { mimeType } });
        upload.once("finish", resolve);
        upload.once("error", reject);
        upload.end(buffer);
    });

/** A readable stream of the file's bytes. Check storedFileExists first: a missing file errors the stream. */
export const createReadStream = (storageKey) => bucket().openDownloadStreamByName(checkKey(storageKey));

export const storedFileExists = async (storageKey) => {
    if (!KEY_PATTERN.test(storageKey)) return false;
    return Boolean(await bucket().find({ filename: storageKey }, { limit: 1 }).next());
};

export const removeStoredFile = async (storageKey) => {
    const files = await bucket().find({ filename: checkKey(storageKey) }).toArray();
    for (const file of files) await bucket().delete(file._id);
};

/** Every stored file's storageKey (tests and maintenance scripts). */
export const listStoredFileKeys = async () => (await bucket().find({}, { projection: { filename: 1 } }).toArray()).map((f) => f.filename).sort();
