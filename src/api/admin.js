import { apiRequest } from "./auth";

/** status: pending | active | rejected ; role: all | school | ngo */
export const listAccounts = ({ status = "pending", role = "all" } = {}) =>
    apiRequest(`/api/admin/accounts?status=${encodeURIComponent(status)}&role=${encodeURIComponent(role)}`);

export const getAccountDetails = (id) => apiRequest(`/api/admin/accounts/${encodeURIComponent(id)}`);

export const approveAccount = (id) => apiRequest(`/api/admin/accounts/${encodeURIComponent(id)}/approve`, { method: "PATCH" });

export const rejectAccount = (id, reason) =>
    apiRequest(`/api/admin/accounts/${encodeURIComponent(id)}/reject`, { method: "PATCH", body: { reason } });
