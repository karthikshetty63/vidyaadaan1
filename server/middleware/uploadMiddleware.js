import multer from "multer";
import { MAX_UPLOAD_BYTES } from "../../shared/registrationRules.js";

// Files are held in memory (never written) until every validation has passed.
// Limits keep a single request from exhausting server memory: at most 6 files of 5 MB.
const parseMultipart = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_UPLOAD_BYTES,
        files: 6,
        fields: 5,
        fieldSize: 64 * 1024,
        parts: 12,
    },
}).any();

// Runs multer only for multipart requests; JSON requests pass straight through.
const acceptUploads = (req, res, next) => {
    if (!req.is("multipart/form-data")) return next();
    return parseMultipart(req, res, next);
};

export default acceptUploads;
