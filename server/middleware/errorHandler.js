import multer from "multer";

const MULTER_MESSAGES = {
    LIMIT_FILE_SIZE: [413, "Each file must be 5 MB or smaller."],
    LIMIT_FILE_COUNT: [400, "Too many files were uploaded."],
    LIMIT_UNEXPECTED_FILE: [400, "Unexpected file field."],
    LIMIT_PART_COUNT: [400, "Too many form parts."],
    LIMIT_FIELD_COUNT: [400, "Too many form fields."],
    LIMIT_FIELD_VALUE: [400, "A form field is too large."],
};

export const apiNotFound = (_req, res) => res.status(404).json({ message: "API route not found." });

// Last middleware: every error becomes a small JSON message.
// Internal details (stack traces, database messages, request bodies) are never sent or logged.
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by their 4 arguments.
export const errorHandler = (error, req, res, next) => {
    if (res.headersSent) return res.end();

    if (error instanceof multer.MulterError) {
        const [status, message] = MULTER_MESSAGES[error.code] || [400, "The upload could not be processed."];
        return res.status(status).json({ message });
    }
    if (error.type === "entity.parse.failed") return res.status(400).json({ message: "Request body is not valid JSON." });
    if (error.type === "entity.too.large") return res.status(413).json({ message: "Request body is too large." });

    console.error(`Unhandled error on ${req.method} ${req.path}:`, error.message);
    return res.status(500).json({ message: "Something went wrong. Please try again." });
};
