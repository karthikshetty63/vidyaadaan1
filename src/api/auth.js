const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// Password rule lives in one shared module used by the backend too.
export { PASSWORD_MIN_LENGTH, getPasswordError } from "../../shared/registrationRules.js";

/** Error thrown for any failed API call. Carries the server's structured details. */
export class ApiError extends Error {
    constructor(message, { status = 0, code, errors, step, reason, role } = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.code = code;
        this.errors = errors; // { fieldName: "message" }
        this.step = step; // registration step to jump back to
        this.reason = reason; // rejection reason
        this.role = role; // actual role on WRONG_PORTAL
    }
}

const fallbackMessage = (status) => {
    if (status === 429) return "Too many attempts. Please wait a while and try again.";
    if (status >= 500) return "The server had a problem. Please try again.";
    return "Request failed.";
};

/**
 * Call the Vidyaadaan API. Always sends the httpOnly auth cookie.
 * `body` may be a plain object (sent as JSON) or FormData (file uploads).
 */
export const apiRequest = async (path, { method = "GET", body, headers = {} } = {}) => {
    const isForm = typeof FormData !== "undefined" && body instanceof FormData;
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            method,
            credentials: "include",
            headers: isForm || body === undefined ? headers : { "Content-Type": "application/json", ...headers },
            body: isForm ? body : body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError("Unable to connect to the server. Check your connection and try again.", { code: "NETWORK_ERROR" });
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new ApiError(data.message || fallbackMessage(response.status), {
            status: response.status,
            code: data.code,
            errors: data.errors,
            step: data.step,
            reason: data.reason,
            role: data.role,
        });
    }
    return data;
};

/**
 * Register a donor/school/NGO. Form values go in `data` (JSON) and each file
 * under its own field name, exactly as the backend expects.
 */
export const registerAccount = (role, values, files = {}) => {
    const form = new FormData();
    form.append("data", JSON.stringify({ ...values, role }));
    for (const [field, file] of Object.entries(files)) {
        if (file) form.append(field, file);
    }
    return apiRequest("/api/auth/register", { method: "POST", body: form });
};

/** credentials: { email, password, remember, role } — role = the login portal being used. */
export const loginAccount = (credentials) => apiRequest("/api/auth/login", { method: "POST", body: credentials });

export const getCurrentUser = () => apiRequest("/api/auth/me");

export const logoutAccount = () => apiRequest("/api/auth/logout", { method: "POST" });

/** Download a private file (owner/admin only) and return a temporary object URL. Revoke it when done. */
export const fetchFileObjectUrl = async (fileId) => {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}/api/files/${encodeURIComponent(fileId)}`, { credentials: "include" });
    } catch {
        throw new ApiError("Unable to connect to the server.", { code: "NETWORK_ERROR" });
    }
    if (!response.ok) throw new ApiError(response.status === 404 ? "File not found." : "Could not load the file.", { status: response.status });
    return URL.createObjectURL(await response.blob());
};
