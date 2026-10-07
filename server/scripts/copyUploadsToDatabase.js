// One-time copy of uploaded files that were saved on this computer's disk (server/uploads, from before
// uploads moved into MongoDB) into the database, so the hosted site has them too.
//
//   node server/scripts/copyUploadsToDatabase.js
//
// Uses MONGO_URI from .env. Only adds: a file already in the database is skipped and nothing is ever
// deleted, so it is safe to run again. Each file is checked against its record (size and real type)
// before it is copied. Prints counts only.
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import UploadedFile from "../models/UploadedFile.js";
import { detectFileType, storedFileExists, writeStoredFile } from "../utils/fileStorage.js";

const serverDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const DEFAULT_UPLOAD_DIR = path.join(serverDir, "uploads");

/**
 * Copy every recorded upload found in `dir` into the database.
 * @returns {Promise<{ copied: number, alreadyThere: number, missing: number, mismatched: number }>}
 */
export const copyUploadsToDatabase = async (dir = DEFAULT_UPLOAD_DIR) => {
    const result = { copied: 0, alreadyThere: 0, missing: 0, mismatched: 0 };
    for await (const record of UploadedFile.find().select("storageKey mimeType size").lean().cursor()) {
        if (await storedFileExists(record.storageKey)) {
            result.alreadyThere += 1;
            continue;
        }
        const file = path.join(dir, path.basename(record.storageKey));
        if (!fs.existsSync(file)) {
            result.missing += 1;
            continue;
        }
        const bytes = await fs.promises.readFile(file);
        // The bytes must be the file the record describes.
        if (bytes.length !== record.size || detectFileType(bytes) !== record.mimeType) {
            result.mismatched += 1;
            continue;
        }
        await writeStoredFile(record.storageKey, bytes, record.mimeType);
        result.copied += 1;
    }
    return result;
};

const runningDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (runningDirectly) {
    dotenv.config();
    try {
        await connectDB();
        const dir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : DEFAULT_UPLOAD_DIR;
        const { copied, alreadyThere, missing, mismatched } = await copyUploadsToDatabase(dir);
        console.log(`Copied ${copied} file(s) into the database. Already there: ${alreadyThere}.`);
        if (missing) console.log(`${missing} recorded file(s) were not found in ${dir} (they can't be copied).`);
        if (mismatched) console.log(`${mismatched} file(s) didn't match their record and were skipped.`);
    } catch (error) {
        console.error("Copy failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}
