const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const request = async (path, options = {}) => {
    let response;
    try {
        response = await fetch(`${API_BASE_URL}${path}`, {
            ...options,
            credentials: "include",
            headers: { "Content-Type": "application/json", ...options.headers },
        });
    } catch {
        throw new Error("Unable to connect to the server.");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Authentication request failed.");
    return data;
};

export const registerAccount = (registration) => request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(registration),
});

export const loginAccount = (credentials) => request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
});

export const getCurrentUser = () => request("/api/auth/me");

export const logoutAccount = () => request("/api/auth/logout", { method: "POST" });

// Mirrors the backend rule in server/controllers/authController.js.
// The backend is still the source of truth; this only gives earlier feedback.
export const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_BYTES = 72;

export const getPasswordError = (password = "", confirm) => {
    if (password.length < PASSWORD_MIN_LENGTH) return `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
    if (new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES) return "Password is too long.";
    if (confirm !== undefined && password !== confirm) return "Passwords do not match.";
    return "";
};
