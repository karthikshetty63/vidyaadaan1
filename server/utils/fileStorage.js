// Local-disk file storage for development.
//
// Every read/write/delete of uploaded bytes goes through this module, so moving to
// object storage (S3, Cloudinary, GCS...) later means re-implementing only
// saveBuffer / createReadStream / removeStoredFile here — controllers stay unchanged.
//
// Files are stored OUTSIDE any publicly served folder under random names and are only
// reachable through the authenticated GET /api/files/:id route.
import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const serverDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEFAULT_UPLOAD_DIR = path.join(serverDir, "uploads");

let uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : DEFAULT_UPLOAD_DIR;

/** Used by the test suite to point storage at a temporary folder. */
export const setUploadDir = (dir) => {
    uploadDir = path.resolve(dir);
};

export const getUploadDir = () => uploadDir;

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

// storageKey is always generated here: 32 hex chars + a known extension.
const KEY_PATTERN = /^[a-f0-9]{32}\.(jpg|png|webp|pdf)$/;

const resolveKey = (storageKey) => {
    if (!KEY_PATTERN.test(storageKey)) throw new Error("Invalid storage key");
    return path.join(uploadDir, storageKey);
};

export const saveBuffer = async (buffer, mimeType) => {
    const extension = EXTENSIONS[mimeType];
    if (!extension) throw new Error("Unsupported file type");
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const storageKey = `${randomBytes(16).toString("hex")}${extension}`;
    // "wx" fails instead of overwriting if the random name somehow already exists.
    await fs.promises.writeFile(resolveKey(storageKey), buffer, { flag: "wx", mode: 0o600 });
    return storageKey;
};

export const createReadStream = (storageKey) => fs.createReadStream(resolveKey(storageKey));

export const storedFileExists = async (storageKey) => {
    try {
        await fs.promises.access(resolveKey(storageKey));
        return true;
    } catch {
        return false;
    }
};

export const removeStoredFile = async (storageKey) => {
    try {
        await fs.promises.unlink(resolveKey(storageKey));
    } catch (error) {
        if (error.code !== "ENOENT") throw error;
    }
};
