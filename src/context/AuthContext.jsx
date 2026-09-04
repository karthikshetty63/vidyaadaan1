import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginAccount, logoutAccount } from "../api/auth";

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

    const logout = async () => {
        await logoutAccount();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: Boolean(user), login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
