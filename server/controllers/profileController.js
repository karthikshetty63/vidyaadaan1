import UploadedFile from "../models/UploadedFile.js";
import { UPLOAD_RULES } from "../../shared/registrationRules.js";
import { PROFILE_MODELS } from "../services/profileModels.js";
import { deleteUploadedFiles, fileSummary, storeUploads, validateUploads } from "../services/uploadService.js";

const PHOTO_FIELD = "schoolPhoto";

const maskAccountNumber = (value) => (value ? `•••• ${String(value).slice(-4)}` : null);

// GET /api/profile/me — the logged-in user's own registration profile.
export const getMyProfile = async (req, res, next) => {
    try {
        const Model = PROFILE_MODELS[req.user.role];
        if (!Model) return res.json({ role: req.user.role, profile: null });

        const profile = await Model.findOne({ userId: req.user._id }).lean();
        if (!profile) return res.json({ role: req.user.role, profile: null });

        const fileIds = [profile.photo, ...Object.values(profile.documents || {})].filter(Boolean);
        const files = await UploadedFile.find({ _id: { $in: fileIds }, owner: req.user._id });
        const byId = new Map(files.map((f) => [f._id.toString(), fileSummary(f)]));

        const result = { ...profile };
        for (const internal of ["_id", "__v", "userId"]) delete result[internal];
        if ("bankAccount" in result) result.bankAccount = maskAccountNumber(result.bankAccount);
        // Always present for schools (null when there is no photo) so the UI gets one consistent shape.
        if (req.user.role === "school") result.photo = result.photo ? byId.get(result.photo.toString()) || null : null;
        if (result.documents) {
            result.documents = Object.fromEntries(
                Object.entries(result.documents).map(([key, id]) => [key, id ? byId.get(id.toString()) || null : null])
            );
        }

        return res.json({ role: req.user.role, profile: result });
    } catch (error) {
        return next(error);
    }
};

// PUT /api/profile/photo  (multipart, field "schoolPhoto") — school only.
export const replacePhoto = async (req, res, next) => {
    const rules = { [PHOTO_FIELD]: UPLOAD_RULES.school[PHOTO_FIELD] };
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ message: "Choose a photo to upload.", errors: { [PHOTO_FIELD]: "Choose a photo to upload." } });

    const { errors, accepted } = validateUploads(files, rules);
    if (Object.keys(errors).length) return res.status(400).json({ message: Object.values(errors)[0], errors });

    let stored = {};
    try {
        stored = await storeUploads(req.user._id, accepted);
        const newFile = stored[PHOTO_FIELD];

        // Swap the reference first; the old file is removed only after the profile points at the new one.
        const previous = await PROFILE_MODELS.school.findOneAndUpdate(
            { userId: req.user._id },
            { $set: { photo: newFile._id } },
            { returnDocument: "before" }
        );
        if (!previous) {
            await deleteUploadedFiles([newFile]);
            return res.status(404).json({ message: "School profile not found." });
        }
        if (previous.photo) {
            const old = await UploadedFile.findOne({ _id: previous.photo, owner: req.user._id });
            await deleteUploadedFiles([old]);
        }

        return res.json({ message: "School photograph updated.", photo: fileSummary(newFile) });
    } catch (error) {
        await deleteUploadedFiles(Object.values(stored));
        return next(error);
    }
};

// DELETE /api/profile/photo — school only.
export const removePhoto = async (req, res, next) => {
    try {
        const previous = await PROFILE_MODELS.school.findOneAndUpdate(
            { userId: req.user._id },
            { $unset: { photo: "" } },
            { returnDocument: "before" }
        );
        if (!previous) return res.status(404).json({ message: "School profile not found." });
        if (previous.photo) {
            const old = await UploadedFile.findOne({ _id: previous.photo, owner: req.user._id });
            await deleteUploadedFiles([old]);
        }
        return res.json({ message: "School photograph removed.", photo: null });
    } catch (error) {
        return next(error);
    }
};
