import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { syncMasterData, uploadOfflineData } from "@/lib/sync";

export type Role = "admin" | "salesman" | "customer";

export interface User {
    id: string;
    username: string;
    name: string;
    role: Role;
    region?: string;
    phone?: string;
    email?: string;
    customerId?: string;
    pricingLevelId?: string;
    address?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (userData: User, token: string) => void;
    logout: () => void;
    authHeader: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem("auth_user");
        return saved ? JSON.parse(saved) : null;
    });

    const [token, setToken] = useState<string | null>(() => {
        return localStorage.getItem("auth_token");
    });

    useEffect(() => {
        if (user) {
            uploadOfflineData().then(() => syncMasterData());
        }

        const handleOnline = () => {
            if (user) {
                uploadOfflineData().then(() => syncMasterData());
            }
        };
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [user]);

    // Store only safe display data in localStorage (no role tampering possible — role is in JWT validated server-side)
    const login = (userData: User, jwtToken: string) => {
        setUser(userData);
        setToken(jwtToken);
        localStorage.setItem("auth_user", JSON.stringify(userData));
        localStorage.setItem("auth_token", jwtToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
    };

    // Helper used by all API calls to attach the JWT
    const authHeader = (): Record<string, string> => {
        return token ? { "Authorization": `Bearer ${token}` } : {};
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, authHeader }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
