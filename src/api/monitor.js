import { apiRequest } from "./auth";

// The admin Control Tower's read-only monitoring API (/api/admin/monitor/...). Admins only: the server
// refuses everyone else.

const query = (params = {}) => {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
    }
    const text = search.toString();
    return text ? `?${text}` : "";
};

/** path: overview | checks | schools | ngos | donors | projects | ngo-payments | donations | activity | activity/:id */
export const getMonitor = (path, params) => apiRequest(`/api/admin/monitor/${path}${query(params)}`);
