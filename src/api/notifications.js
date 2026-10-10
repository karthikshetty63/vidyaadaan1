import { apiRequest } from "./auth";

// A school's, NGO's or donor's own notifications. The server works them out from the account's records.

/** → { actions, news, unread, seenAt, asOf, summary }. Each item: { id, kind, tone, title, text, detail?, at, to, button?, isNew }. */
export const listNotifications = () => apiRequest("/api/notifications");

/** Only the numbers, for the bell: { unread, waiting }. */
export const countNotifications = () => apiRequest("/api/notifications/count");

/** The list read at `asOf` has been looked at: nothing up to then counts as new any more. */
export const markNotificationsSeen = (asOf) => apiRequest("/api/notifications/seen", { method: "POST", body: asOf ? { asOf } : {} });
