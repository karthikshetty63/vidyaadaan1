import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginAccount, loginWithGoogleAccount, logoutAccount } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const data = await getCurrentUser();
            setUser(data.user);
            return data.user;
        } catch {
            setUser(null);
            return null;
        }
    };

    useEffect(() => {
        refreshUser().finally(() => setLoading(false));
    }, []);

    const login = async (credentials) => {
        const data = await loginAccount(credentials);
        setUser(data.user);
        return data.user;
    };

    // Resolves with the whole response: { user, linked, created }.
    const loginWithGoogle = async (payload) => {
        const data = await loginWithGoogleAccount(payload);
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await logoutAccount();
        } finally {
            // Clear local state even if the request fails, so the UI never shows a stale user.
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: Boolean(user), login, loginWithGoogle, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
