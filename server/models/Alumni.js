import mongoose from "mongoose";
import { ALUMNI_STATUSES, GRADUATION_YEAR_MIN } from "../../shared/alumniRules.js";

// A former student on a school's alumni list. Validation lives in shared/alumniRules.js; these are
// the database's own guarantees.
const alumniSchema = new mongoose.Schema(
    {
        // The school's account (User) — the same id Project.school uses. Always set by the server from
        // the signed-in school, never from the browser.
        school: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true, trim: true, maxlength: 100 },
        // Upper-case with single spaces (normalizeRegisterNumber), so duplicates can't hide behind case.
        registerNumber: { type: String, required: true, trim: true, maxlength: 40 },
        email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
        graduationYear: { type: Number, min: GRADUATION_YEAR_MIN, default: null },
        // INACTIVE alumni stay on the list but are never emailed.
        status: { type: String, enum: ALUMNI_STATUSES, default: "ACTIVE" },
        // Room for an opt-out: false means "never email me". Nothing in the app sets it yet.
        emailNotificationsEnabled: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// No duplicates within one school: the same register number or the same email can't be added twice.
// (Another school may list the same person.)
alumniSchema.index({ school: 1, registerNumber: 1 }, { unique: true });
alumniSchema.index({ school: 1, email: 1 }, { unique: true });
// A school's own list, newest first, and the "who gets the email" lookup.
alumniSchema.index({ school: 1, createdAt: -1 });
alumniSchema.index({ school: 1, status: 1 });

// Named explicitly: Mongoose would otherwise call the collection "alumnis".
const Alumni = mongoose.models.Alumni || mongoose.model("Alumni", alumniSchema, "alumni");

export default Alumni;
