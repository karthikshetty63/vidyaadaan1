import { apiRequest } from "./auth";

// What anyone may read without signing in (the home page).

const query = (params = {}) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : "";
};

/** Approved school needs still open for support: { items, total, page, pages, hasMore, filters: { categories, states } }. */
export const listPublicNeeds = (params) => apiRequest(`/api/public/projects${query(params)}`);

/** Recent public activity (anonymous): { items: [{ id, at, kind, parts?, project: { id, title }, place }] }. */
export const getPublicActivity = () => apiRequest("/api/public/activity");
