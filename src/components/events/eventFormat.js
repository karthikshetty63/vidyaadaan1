// How events are shown: dates, "in 3 days", and the label for where an event or an offer stands.

const todayUTC = () => new Date().toISOString().slice(0, 10);
const dayMs = 86400000;

export const formatEventDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export const formatWhen = (value) => (value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");

/** Whole days from today to the event (negative once it has passed). */
export const daysUntil = (iso) => Math.round((Date.parse(`${iso}T00:00:00Z`) - Date.parse(`${todayUTC()}T00:00:00Z`)) / dayMs);

export const whenLabel = (iso) => {
  const days = daysUntil(iso);
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return days > 1 ? `In ${days} days` : `${-days} ${days === -1 ? "day" : "days"} ago`;
};

/** Where a school's own event stands: [badge tone, label]. */
export const eventState = (event) => {
  if (event.reviewStatus === "PENDING_REVIEW") return ["warning", "Waiting for review"];
  if (event.reviewStatus === "REJECTED") return ["danger", "Changes requested"];
  if (event.status === "Cancelled") return ["neutral", "Cancelled"];
  if (event.status === "Completed") return ["success", "Completed"];
  return daysUntil(event.date) < 0 ? ["neutral", "Date passed"] : ["success", "Approved"];
};

/** Where an offer of help stands: [badge tone, label for the supporter, label for the school]. */
export const OFFER_STATES = {
  OFFERED: ["warning", "Waiting for the school", "Waiting for your answer"],
  ACCEPTED: ["success", "Accepted by the school", "Accepted"],
  DECLINED: ["neutral", "Declined by the school", "Declined"],
};
