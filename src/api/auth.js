const API_BASE_URL = "http://localhost:5000";

export const registerAccount = async (registration) => {
    let response;

    try {
        response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(registration),
        });
    } catch {
        throw new Error("Unable to connect to the server. Please make sure the backend server is running.");
    }

    let data;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (response.ok) return data;
    if (response.status === 409) throw new Error("An account with this email already exists.");
    if (response.status >= 500) throw new Error("Registration failed. Please try again.");
    throw new Error(data?.message || "Please check the registration details and try again.");
};
