import { apiRequest } from "./auth";

// Rules shared with the server (the server re-checks everything).
export { validateAlumni } from "../../shared/alumniRules.js";

/** The signed-in school's alumni, newest first. */
export const listAlumni = () => apiRequest("/api/school/alumni");

/** { active, inactive } counts for the signed-in school. */
export const getAlumniSummary = () => apiRequest("/api/school/alumni/summary");

export const addAlumni = (values) => apiRequest("/api/school/alumni", { method: "POST", body: values });

/** Only the fields in `changes` are updated. */
export const updateAlumni = (id, changes) => apiRequest(`/api/school/alumni/${encodeURIComponent(id)}`, { method: "PATCH", body: changes });

/** status: "ACTIVE" | "INACTIVE". Inactive alumni get no project emails. */
export const setAlumniStatus = (id, status) =>
  apiRequest(`/api/school/alumni/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } });
