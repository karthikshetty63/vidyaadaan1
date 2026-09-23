import mongoose from "mongoose";

// Metadata for a file stored by server/utils/fileStorage.js.
// The bytes live in storage (local disk today); only this reference lives in MongoDB.
const uploadedFileSchema = new mongoose.Schema(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        // Multipart field it was uploaded as, e.g. "schoolPhoto" or "panCard".
        purpose: { type: String, required: true },
        // Random server-generated name inside the storage folder. Never derived from user input.
        storageKey: { type: String, required: true, unique: true },
        // Detected from the file's real signature, not the browser's claim.
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        originalName: { type: String, trim: true, maxlength: 200 },
    },
    { timestamps: true }
);

const UploadedFile = mongoose.models.UploadedFile || mongoose.model("UploadedFile", uploadedFileSchema);

export default UploadedFile;
