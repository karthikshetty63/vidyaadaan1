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
