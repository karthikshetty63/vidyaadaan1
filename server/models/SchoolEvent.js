import mongoose from "mongoose";
import { EVENT_HELP_KINDS, EVENT_OFFER_STATUSES, EVENT_REVIEW_STATUSES, EVENT_STATUSES, EVENT_TYPES } from "../../shared/eventRules.js";

// An NGO's or donor's offer of help for an event. No money: the school accepts or declines the offer
// and then contacts the supporter itself.
const offerSchema = new mongoose.Schema({
    supporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["ngo", "donor"], required: true },
    kinds: { type: [{ type: String, enum: EVENT_HELP_KINDS }], required: true },
    message: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: EVENT_OFFER_STATUSES, default: "OFFERED" },
    // The school's reply, shown to the supporter.
    note: { type: String, trim: true, maxlength: 300, default: "" },
    offeredAt: { type: Date, required: true },
    respondedAt: { type: Date },
});

// A school's event (Sports Day, Annual Day…) that it would like help with. Validation lives in
// shared/eventRules.js; these are the database's own guarantees.
const schoolEventSchema = new mongoose.Schema(
    {
        school: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true, trim: true, maxlength: 120 },
        type: { type: String, required: true, enum: EVENT_TYPES },
        date: { type: Date, required: true },
        venue: { type: String, trim: true, maxlength: 150, default: "" },
        description: { type: String, required: true, trim: true, maxlength: 1500 },
        expectedStudents: { type: Number, required: true, min: 1 },
        helpNeeded: { type: [{ type: String, enum: EVENT_HELP_KINDS }], required: true },
        helpDetails: { type: String, trim: true, maxlength: 500, default: "" },
        status: { type: String, enum: EVENT_STATUSES, default: "Scheduled" },

        // Admin review — set by the server only, as for projects.
        reviewStatus: { type: String, enum: EVENT_REVIEW_STATUSES, default: "PENDING_REVIEW" },
        rejectionReason: { type: String, trim: true, maxlength: 500 },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reviewedAt: { type: Date },
        // When the school last sent it for review (creation, or an edit).
        submittedAt: { type: Date, required: true },

        // At most one offer per supporter. Set by the server only, and only on approved events.
        offers: { type: [offerSchema], default: [] },
    },
    { timestamps: true }
);

// A school's own list, newest first.
schoolEventSchema.index({ school: 1, createdAt: -1 });
// The admin review queue.
schoolEventSchema.index({ reviewStatus: 1, submittedAt: 1 });
// Approved, upcoming events for NGOs and donors.
schoolEventSchema.index({ reviewStatus: 1, status: 1, date: 1 });
// The events a supporter has offered to help with.
schoolEventSchema.index({ "offers.supporter": 1 });

/**
 * The only way NGO and donor features may read events: approved (OPEN) ones only. The review
 * condition is applied last, so a caller's filter can never widen it.
 */
schoolEventSchema.statics.findVisibleToSupporters = function findVisibleToSupporters(filter = {}) {
    return this.find({ ...filter, reviewStatus: "OPEN" });
};

const SchoolEvent = mongoose.models.SchoolEvent || mongoose.model("SchoolEvent", schoolEventSchema);

export default SchoolEvent;
