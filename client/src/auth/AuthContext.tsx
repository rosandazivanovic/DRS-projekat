import React, { createContext, useContext, useMemo, useState } from "react";
import { endpoints } from "../api/endpoints";
import { http } from "../api/https";

export type Role = "STUDENT" | "PROFESOR" | "ADMIN";

export type User = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

type RegisterData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate?: string;
  gender?: string;
  country?: string;
  street?: string;
  number?: string;
};

type AuthState = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  hasRole: (roles: Role[]) => boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

const USER_KEY = "lp_user";
const SID_KEY = "session_id";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  });

  const login = async (email: string, password: string) => {
    console.log("🔐 Attempting login...");
    const res = await http.post(endpoints.auth.login, { email, password });
    const data = res.data;
    const sid = data.sessionId;
    const u = data.user as User;
    
    console.log("✅ Login successful, session:", sid);
    
    localStorage.setItem(SID_KEY, sid);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const register = async (data: RegisterData) => {
    console.log("📝 Attempting registration...");
    const res = await http.post(endpoints.auth.register, data);
    const result = res.data;
    const sid = result.sessionId;
    const u = result.user as User;
    
    console.log("✅ Registration successful, session:", sid);
    
    localStorage.setItem(SID_KEY, sid);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = async () => {
    const sid = localStorage.getItem(SID_KEY);
    try {
      if (sid) {
        await http.post(endpoints.auth.logout);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem(SID_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const hasRole = (roles: Role[]) => !!user && roles.includes(user.role);

  const value = useMemo(
    () => ({ user, login, logout, register, hasRole }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}