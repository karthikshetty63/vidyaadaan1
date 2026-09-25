import mongoose from "mongoose";

// Sessions ended with "Sign out" on one device. Each record disappears on its own once the
// session would have expired anyway (MongoDB TTL index), so the collection stays tiny.
const revokedSessionSchema = new mongoose.Schema({
    sid: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
});

revokedSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RevokedSession = mongoose.models.RevokedSession || mongoose.model("RevokedSession", revokedSessionSchema);

export default RevokedSession;
