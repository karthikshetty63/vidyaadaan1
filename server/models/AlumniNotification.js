import mongoose from "mongoose";

// PENDING: waiting to be sent. SENDING: claimed by the sender (so no two senders email the same
// person). SENT: the SMTP server accepted it. FAILED: not delivered; `error` says why.
export const ALUMNI_NOTIFICATION_STATUSES = ["PENDING", "SENDING", "SENT", "FAILED"];

// One "project approved" email to one alum: the record of what was sent, to whom, and what happened.
const alumniNotificationSchema = new mongoose.Schema(
    {
        project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        school: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        alumni: { type: mongoose.Schema.Types.ObjectId, ref: "Alumni", required: true },
        // The name and address it was sent to, as they were when the project was approved.
        name: { type: String, required: true },
        email: { type: String, required: true },
        status: { type: String, enum: ALUMNI_NOTIFICATION_STATUSES, required: true },
        error: { type: String, maxlength: 500 },
        sentAt: { type: Date },
    },
    { timestamps: true }
);

// At most one email per alum per project: even if approval code ran twice, the second insert is a no-op.
alumniNotificationSchema.index({ project: 1, alumni: 1 }, { unique: true });
// The sender's work list.
alumniNotificationSchema.index({ status: 1, project: 1 });

const AlumniNotification = mongoose.models.AlumniNotification || mongoose.model("AlumniNotification", alumniNotificationSchema);

export default AlumniNotification;
