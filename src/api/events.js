import { apiRequest } from "./auth";

// Rules shared with the server (the server re-checks everything).
export {
  EVENT_HELP_KINDS,
  EVENT_OFFER_MESSAGE_MAX,
  EVENT_OFFER_NOTE_MAX,
  EVENT_REJECTION_REASON_MAX,
  EVENT_REJECTION_REASON_MIN,
  EVENT_REVIEW_LABELS,
  EVENT_STATUSES,
  EVENT_TYPES,
  validateEvent,
  validateEventOffer,
} from "../../shared/eventRules.js";

const at = (id) => encodeURIComponent(id);

// ─── School: its own events and the offers of help on them ───────────────────
/** The signed-in school's events, newest first, each with its offers and who made them. */
export const listSchoolEvents = () => apiRequest("/api/school/events");

export const createSchoolEvent = (values) => apiRequest("/api/school/events", { method: "POST", body: values });

/** Only the fields in `changes` are updated. Once approved, only the date and status can change. */
export const updateSchoolEvent = (id, changes) => apiRequest(`/api/school/events/${at(id)}`, { method: "PATCH", body: changes });

/** decision: "ACCEPTED" | "DECLINED". The answer is final. */
export const answerEventOffer = (eventId, offerId, decision, note) =>
  apiRequest(`/api/school/events/${at(eventId)}/offers/${at(offerId)}`, { method: "PATCH", body: { decision, note } });

// ─── NGOs and donors: approved events and their own offers ───────────────────
/** Approved events that are still to come, soonest first (no school contact details). */
export const listOpenEvents = () => apiRequest("/api/events");

/** Every event the signed-in NGO or donor has offered to help with, past ones too. */
export const listMyEventOffers = () => apiRequest("/api/events/mine");

/** offer: { kinds, message, shareContact? } — donors must agree to share their name and email. */
export const offerEventHelp = (id, offer) => apiRequest(`/api/events/${at(id)}/offers`, { method: "POST", body: offer });

/** Withdraw your own offer, while the school hasn't answered it. */
export const withdrawEventOffer = (id) => apiRequest(`/api/events/${at(id)}/offers`, { method: "DELETE" });

// ─── Admin review ────────────────────────────────────────────────────────────
/** status: PENDING_REVIEW | OPEN | REJECTED → { events, counts } */
export const listEventsForReview = (status = "PENDING_REVIEW") => apiRequest(`/api/admin/events?status=${at(status)}`);

export const getEventForReview = (id) => apiRequest(`/api/admin/events/${at(id)}`);

export const approveEvent = (id) => apiRequest(`/api/admin/events/${at(id)}/approve`, { method: "PATCH" });

export const rejectEvent = (id, reason) => apiRequest(`/api/admin/events/${at(id)}/reject`, { method: "PATCH", body: { reason } });
