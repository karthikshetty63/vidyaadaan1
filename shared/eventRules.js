// VIDYADAAN — rules for school events and the help NGOs and donors offer for them.
// Imported by BOTH the React forms (instant feedback) and the Express API (the authoritative check),
// the same way projectRules.js is. Keep it free of browser- and Node-only APIs.
//
// How events work: a school posts an event, the VIDYADAAN team reviews it, and only approved events
// are shown to NGOs and donors, who can offer help (volunteers, materials, sponsorship…). The school
// accepts or declines each offer and contacts the people it accepted. No money moves through
// VIDYADAAN for events.

export const EVENT_TYPES = ["Sports Day", "Annual Day", "Science Fair", "Cultural Programme", "Health Camp", "Reading Drive", "Plantation Drive", "Other"];
// The kinds of help a school can ask for, and a supporter can offer.
export const EVENT_HELP_KINDS = ["Volunteers", "Materials or supplies", "Prizes or gifts", "Food or refreshments", "Sponsorship", "Guest or resource person", "Other"];
// The event's own status, set by the school once the event is approved.
export const EVENT_STATUSES = ["Scheduled", "Completed", "Cancelled"];
// Admin review, as for projects: only OPEN events are ever shown to NGOs and donors.
export const EVENT_REVIEW_STATUSES = ["PENDING_REVIEW", "OPEN", "REJECTED"];
export const EVENT_REVIEW_LABELS = { PENDING_REVIEW: "Waiting for review", OPEN: "Approved", REJECTED: "Changes requested" };
export const EVENT_OFFER_STATUSES = ["OFFERED", "ACCEPTED", "DECLINED"];
export const EVENT_OFFER_DECISIONS = ["ACCEPTED", "DECLINED"];

export const EVENT_REJECTION_REASON_MIN = 5;
export const EVENT_REJECTION_REASON_MAX = 500;
export const EVENT_OFFER_MESSAGE_MAX = 500;
export const EVENT_OFFER_NOTE_MAX = 300;
export const EVENTS_PER_SCHOOL_MAX = 100;
export const OFFERS_PER_EVENT_MAX = 50;
const STUDENTS_MAX = 100000;
const YEARS_AHEAD_MAX = 2;

// Fields a school may send. `status` only exists once an event does.
const CREATE_FIELDS = ["title", "type", "date", "venue", "description", "expectedStudents", "helpNeeded", "helpDetails"];
const UPDATE_FIELDS = [...CREATE_FIELDS, "status"];
const REQUIRED = ["title", "type", "date", "description", "expectedStudents", "helpNeeded"];
/**
 * Once an event is approved, NGOs and donors must keep seeing what was reviewed: only its date (events
 * get postponed) and its status can still change. Everything else is locked.
 */
export const EVENT_FIELDS_AFTER_APPROVAL = ["date", "status"];

const LABELS = {
  title: "Event name",
  type: "Type of event",
  date: "Event date",
  venue: "Venue",
  description: "About the event",
  expectedStudents: "Students taking part",
  helpNeeded: "Help needed",
  helpDetails: "Details of the help needed",
  status: "Status",
};

const isBlank = (v) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");
export const todayUTC = () => new Date().toISOString().slice(0, 10);

const text = (min, max, { collapse = true } = {}) => (v, label) => {
  if (typeof v !== "string") return { error: `${label} must be text.` };
  const value = collapse ? v.trim().replace(/\s+/g, " ") : v.trim();
  if (value.length < min) return { error: `${label} must be at least ${min} characters.` };
  if (value.length > max) return { error: `${label} must be at most ${max} characters.` };
  return { value };
};

const oneOf = (options) => (v, label) =>
  typeof v === "string" && options.includes(v) ? { value: v } : { error: `Select a valid ${label.toLowerCase()}.` };

const wholeNumber = (min, max, message) => (v) => {
  const n = typeof v === "number" ? v : typeof v === "string" && /^\d+$/.test(v.trim()) ? Number(v.trim()) : NaN;
  return Number.isInteger(n) && n >= min && n <= max ? { value: n } : { error: message };
};

const eventDate = ({ allowPast }) => (v, label) => {
  if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return { error: `${label} must be a valid date.` };
  const date = new Date(`${v}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== v) return { error: `${label} must be a valid date.` };
  const latest = new Date();
  latest.setUTCFullYear(latest.getUTCFullYear() + YEARS_AHEAD_MAX);
  if (v > latest.toISOString().slice(0, 10)) return { error: `${label} must be within the next ${YEARS_AHEAD_MAX} years.` };
  if (!allowPast && v < todayUTC()) return { error: `${label} can't be in the past.` };
  return { value: v };
};

/** One or more different kinds of help, from the list. */
const helpKinds = (v, label) => {
  if (!Array.isArray(v) || v.length === 0 || v.some((k) => !EVENT_HELP_KINDS.includes(k))) return { error: `Choose at least one kind of help for “${label}”.` };
  return { value: EVENT_HELP_KINDS.filter((k) => v.includes(k)) };
};

const checks = ({ isUpdate }) => ({
  title: text(5, 120),
  type: oneOf(EVENT_TYPES),
  // An event already held may still be edited (to mark it completed), so only new events need a future date.
  date: eventDate({ allowPast: isUpdate }),
  venue: text(0, 150),
  description: text(20, 1500, { collapse: false }),
  expectedStudents: wholeNumber(1, STUDENTS_MAX, `Students taking part must be a whole number between 1 and ${STUDENTS_MAX.toLocaleString("en-IN")}.`),
  helpNeeded: helpKinds,
  helpDetails: text(0, 500, { collapse: false }),
  status: oneOf(EVENT_STATUSES),
});

/** Keys in `data` a school may not send (mass-assignment protection). */
export const getUnexpectedEventFields = (data, { isUpdate = false } = {}) => {
  if (!data || typeof data !== "object" || Array.isArray(data)) return [];
  const allowed = isUpdate ? UPDATE_FIELDS : CREATE_FIELDS;
  return Object.keys(data).filter((key) => !allowed.includes(key));
};

/**
 * Validate a new event (all required fields) or an edit (only the fields sent).
 * @returns {{ errors: Record<string,string>, values: Record<string, unknown> }}
 */
export const validateEvent = (data, { isUpdate = false } = {}) => {
  const input = data && typeof data === "object" && !Array.isArray(data) ? data : {};
  const rules = checks({ isUpdate });
  const fields = isUpdate ? UPDATE_FIELDS.filter((f) => f in input) : CREATE_FIELDS;
  const errors = {};
  const values = {};

  for (const field of fields) {
    const raw = input[field];
    if (isBlank(raw) || (Array.isArray(raw) && raw.length === 0)) {
      if (REQUIRED.includes(field)) errors[field] = field === "helpNeeded" ? "Choose at least one kind of help." : `${LABELS[field]} is required.`;
      else values[field] = "";
      continue;
    }
    const result = rules[field](raw, LABELS[field]);
    if (result.error) errors[field] = result.error;
    else values[field] = result.value;
  }
  return { errors, values };
};

// ─── Offers of help ──────────────────────────────────────────────────────────
// `shareContact` is the donor's consent: schools never see who donors are, except a donor who offers
// help for an event and agrees that the school may see their name and email address to contact them.
const OFFER_FIELDS = { ngo: ["kinds", "message"], donor: ["kinds", "message", "shareContact"] };

/**
 * Validate an offer of help from an NGO or a donor.
 * @returns {{ errors: Record<string,string>, values: { kinds?: string[], message?: string } }}
 */
export const validateEventOffer = (data, { role }) => {
  const input = data && typeof data === "object" && !Array.isArray(data) ? data : {};
  const errors = {};
  const values = {};
  for (const key of Object.keys(input)) {
    if (!(OFFER_FIELDS[role] || []).includes(key)) errors[key] = "This field is not allowed.";
  }
  const kinds = helpKinds(input.kinds, "How you can help");
  if (kinds.error) errors.kinds = "Choose at least one way you can help.";
  else values.kinds = kinds.value;

  if (isBlank(input.message)) values.message = "";
  else {
    const message = text(0, EVENT_OFFER_MESSAGE_MAX, { collapse: false })(input.message, "Your message");
    if (message.error) errors.message = message.error;
    else values.message = message.value;
  }
  if (values.kinds?.includes("Other") && !values.message && !errors.message) errors.message = "Say how you'd like to help.";
  if (role === "donor" && input.shareContact !== true) errors.shareContact = "Please agree to share your name and email address with the school, so it can contact you.";
  return { errors, values };
};

/**
 * Validate a school's answer to an offer: { decision: "ACCEPTED" | "DECLINED", note? }.
 * @returns {{ errors: Record<string,string>, values: { decision?: string, note?: string } }}
 */
export const validateOfferDecision = (data) => {
  const input = data && typeof data === "object" && !Array.isArray(data) ? data : {};
  const errors = {};
  const values = {};
  for (const key of Object.keys(input)) {
    if (!["decision", "note"].includes(key)) errors[key] = "This field is not allowed.";
  }
  if (!EVENT_OFFER_DECISIONS.includes(input.decision)) errors.decision = "Choose Accept or Decline.";
  else values.decision = input.decision;
  if (isBlank(input.note)) values.note = "";
  else {
    const note = text(0, EVENT_OFFER_NOTE_MAX, { collapse: false })(input.note, "Your note");
    if (note.error) errors.note = note.error;
    else values.note = note.value;
  }
  return { errors, values };
};

/** A rejection reason from the review team. @returns {{ error?: string, value?: string }} */
export const validateEventRejectionReason = (value) => {
  const reason = typeof value === "string" ? value.trim() : "";
  if (reason.length < EVENT_REJECTION_REASON_MIN || reason.length > EVENT_REJECTION_REASON_MAX) {
    return { error: `Give a reason between ${EVENT_REJECTION_REASON_MIN} and ${EVENT_REJECTION_REASON_MAX} characters.` };
  }
  return { value: reason };
};

/** Can NGOs and donors still offer help? Approved, scheduled, and not yet over. */
export const isOpenForOffers = (event, today = todayUTC()) =>
  event.reviewStatus === "OPEN" && event.status === "Scheduled" && String(event.date).slice(0, 10) >= today;
