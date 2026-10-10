import mongoose from "mongoose";
import { ACTIVITY_CATEGORIES, ACTIVITY_RESULTS, ACTIVITY_ROLES, ACTIVITY_SOURCES } from "../../shared/activityRules.js";

// One thing that happened on VIDYADAAN, for the admin Control Tower (see shared/activityRules.js).
// Append-only: the server writes events and never edits them. No passwords, tokens, signatures, bank
// details, emails or phone numbers are ever stored here (services/activityLog.js filters the details).
const activityEventSchema = new mongoose.Schema(
    {
        at: { type: Date, required: true },
        action: { type: String, required: true, maxlength: 60 },
        category: { type: String, required: true, enum: Object.keys(ACTIVITY_CATEGORIES) },
        result: { type: String, enum: ACTIVITY_RESULTS, default: "success" },
        // Who did it. `name` is a snapshot at the time (the page shows current names when it can).
        actor: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
            role: { type: String, enum: ACTIVITY_ROLES, required: true },
            name: { type: String, maxlength: 150, default: "" },
        },
        // What it was done to.
        target: {
            type: { type: String, maxlength: 30, default: "" },
            id: { type: mongoose.Schema.Types.ObjectId, default: null },
            label: { type: String, maxlength: 200, default: "" },
        },
        // A few allow-listed facts (amounts, parts, statuses, reasons). Small by design.
        details: { type: mongoose.Schema.Types.Mixed, default: {} },
        source: { type: String, enum: ACTIVITY_SOURCES, required: true },
        // Reconstructed and system events only: makes importing history safe to repeat.
        key: { type: String },
    },
    { versionKey: false }
);

activityEventSchema.index({ at: -1, _id: -1 });
activityEventSchema.index({ "actor.id": 1, at: -1 });
activityEventSchema.index({ "target.id": 1, at: -1 });
activityEventSchema.index({ category: 1, at: -1 });
activityEventSchema.index({ action: 1, at: -1 });
activityEventSchema.index({ key: 1 }, { unique: true, partialFilterExpression: { key: { $type: "string" } } });

const ActivityEvent = mongoose.models.ActivityEvent || mongoose.model("ActivityEvent", activityEventSchema);

export default ActivityEvent;
