import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { randomBytes } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";
import { FILES, startTestServer } from "./helpers.js";

let server;
let UploadedFile;
let copyUploadsToDatabase;
let createReadStream;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "vidyaadaan-old-uploads-"));
const owner = "0123456789abcdef01234567";
const key = (ext) => `${randomBytes(16).toString("hex")}.${ext}`;
const bytesOf = async (file) => Buffer.from(await file.arrayBuffer());
const readStored = (storageKey) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        createReadStream(storageKey).on("data", (c) => chunks.push(c)).on("end", () => resolve(Buffer.concat(chunks))).on("error", reject);
    });

/** A file saved on disk the old way, with its UploadedFile record. */
const oldUpload = async (file, mimeType, { onDisk = true, size } = {}) => {
    const bytes = await bytesOf(file);
    const storageKey = key({ "image/png": "png", "image/jpeg": "jpg", "application/pdf": "pdf" }[mimeType]);
    if (onDisk) fs.writeFileSync(path.join(dir, storageKey), bytes);
    await UploadedFile.create({ owner, purpose: "schoolPhoto", storageKey, mimeType, size: size ?? bytes.length });
    return { storageKey, bytes };
};

before(async () => {
    server = await startTestServer();
    UploadedFile = (await import("../models/UploadedFile.js")).default;
    ({ copyUploadsToDatabase } = await import("../scripts/copyUploadsToDatabase.js"));
    ({ createReadStream } = await import("../utils/fileStorage.js"));
});
after(async () => {
    await server.stop();
    fs.rmSync(dir, { recursive: true, force: true });
});

test("files saved on disk before are copied into the database byte for byte; running again copies nothing", async () => {
    const png = await oldUpload(FILES.png(), "image/png");
    const pdf = await oldUpload(FILES.pdf(), "application/pdf");
    await oldUpload(FILES.jpeg(), "image/jpeg", { onDisk: false });
    const wrongSize = await oldUpload(FILES.png(), "image/png", { size: 999999 });

    assert.deepEqual(await copyUploadsToDatabase(dir), { copied: 2, alreadyThere: 0, missing: 1, mismatched: 1 });
    assert.deepEqual(await server.storedFiles(), [png.storageKey, pdf.storageKey].sort());
    assert.ok((await readStored(png.storageKey)).equals(png.bytes));
    assert.ok((await readStored(pdf.storageKey)).equals(pdf.bytes));
    assert.equal(await server.fileStored(wrongSize.storageKey), false, "a file that doesn't match its record is not copied");

    assert.deepEqual(await copyUploadsToDatabase(dir), { copied: 0, alreadyThere: 2, missing: 1, mismatched: 1 });
    assert.equal((await server.storedFiles()).length, 2);
    assert.equal(fs.readdirSync(dir).length, 3, "nothing on disk is deleted");
});
