import mongoose from "mongoose";

// PENDING: waiting to be sent. SENDING: claimed by the sender (so no two senders email the same
// person). SENT: the email service accepted it. FAILED: not delivered; `error` says why.
export const NEW_NEED_EMAIL_STATUSES = ["PENDING", "SENDING", "SENT", "FAILED"];

// One "a new school need is open" email to one NGO or donor: the record of what was sent, to whom, and
// what happened (see services/newNeedEmails.js).
const newNeedEmailSchema = new mongoose.Schema(
    {
        project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        school: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ["ngo", "donor"], required: true },
        // The name and address it was sent to, as they were when the project was approved.
        name: { type: String, required: true },
        email: { type: String, required: true },
        status: { type: String, enum: NEW_NEED_EMAIL_STATUSES, required: true },
        error: { type: String, maxlength: 500 },
        sentAt: { type: Date },
    },
    { timestamps: true }
);

// At most one email per account per project: even if approval code ran twice, the second insert is a no-op.
newNeedEmailSchema.index({ project: 1, user: 1 }, { unique: true });
// The sender's work list.
newNeedEmailSchema.index({ status: 1, project: 1 });

const NewNeedEmail = mongoose.models.NewNeedEmail || mongoose.model("NewNeedEmail", newNeedEmailSchema);

export default NewNeedEmail;
