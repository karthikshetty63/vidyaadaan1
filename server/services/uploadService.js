import path from "node:path";
import UploadedFile from "../models/UploadedFile.js";
import { getUploadError } from "../../shared/registrationRules.js";
import { detectFileType, removeStoredFile, saveBuffer } from "../utils/fileStorage.js";

const cleanOriginalName = (name = "") =>
    path.basename(String(name)).replace(/[^\w.\- ()]/g, "_").slice(0, 200) || "file";

/**
 * Validate multer files against the upload rules for a role.
 * Checks: allowed field, one file per field, size, and the REAL type from the file signature.
 * @returns {{ errors: Record<string,string>, accepted: Array<{field,buffer,mimeType,size,originalName}> }}
 */
export const validateUploads = (files = [], rules = {}) => {
    const errors = {};
    const accepted = [];
    const seen = new Set();

    for (const file of files) {
        const rule = rules[file.fieldname];
        if (!rule) {
            errors[file.fieldname] = "This file is not expected here.";
            continue;
        }
        if (seen.has(file.fieldname)) {
            errors[file.fieldname] = `Upload only one ${rule.label}.`;
            continue;
        }
        seen.add(file.fieldname);

        // Trust the bytes, not the browser-supplied MIME type or file name.
        const realType = detectFileType(file.buffer);
        const error = getUploadError(rule, { type: realType, size: file.size });
        if (error) {
            errors[file.fieldname] = realType ? error : `${rule.label} must be one of the allowed file types (the file content does not match).`;
            continue;
        }
        accepted.push({ field: file.fieldname, buffer: file.buffer, mimeType: realType, size: file.size, originalName: cleanOriginalName(file.originalname) });
    }

    return { errors, accepted };
};

/** Delete UploadedFile records and their bytes. Best effort: never throws. */
export const deleteUploadedFiles = async (docs = []) => {
    for (const doc of docs.filter(Boolean)) {
        try {
            await removeStoredFile(doc.storageKey);
            await UploadedFile.deleteOne({ _id: doc._id });
        } catch (error) {
            console.error("Failed to delete uploaded file:", error.message);
        }
    }
};

export const deleteUploadedFilesByIds = async (ids = []) => {
    const validIds = ids.filter(Boolean);
    if (!validIds.length) return;
    const docs = await UploadedFile.find({ _id: { $in: validIds } });
    await deleteUploadedFiles(docs);
};

/**
 * Write accepted files to storage and record them. All-or-nothing:
 * if anything fails, files already written by this call are removed.
 * @returns {Promise<Record<string, import("mongoose").Document>>} field → UploadedFile
 */
export const storeUploads = async (ownerId, accepted = []) => {
    const stored = {};
    const writtenKeys = [];
    try {
        for (const file of accepted) {
            const storageKey = await saveBuffer(file.buffer, file.mimeType);
            writtenKeys.push(storageKey);
            stored[file.field] = await UploadedFile.create({
                owner: ownerId,
                purpose: file.field,
                storageKey,
                mimeType: file.mimeType,
                size: file.size,
                originalName: file.originalName,
            });
        }
        return stored;
    } catch (error) {
        await deleteUploadedFiles(Object.values(stored));
        for (const key of writtenKeys) await removeStoredFile(key).catch(() => {});
        throw error;
    }
};

/** Public metadata for a stored file (never the storage key). */
export const fileSummary = (doc) =>
    doc
        ? { id: doc._id.toString(), purpose: doc.purpose, mimeType: doc.mimeType, size: doc.size, originalName: doc.originalName, uploadedAt: doc.createdAt }
        : null;
