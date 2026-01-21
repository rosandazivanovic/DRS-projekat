// src/auth/AuthContext.tsx
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

type AuthState = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (payload: any) => Promise<void>;
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
    const res = await http.post(endpoints.auth.login, { email, password });
    const data = res.data;
    const sid = data.sessionId;
    const u = data.user as User;
    localStorage.setItem(SID_KEY, sid);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const logout = async () => {
    const sid = localStorage.getItem(SID_KEY);
    try {
      if (sid) {
        await http.post(endpoints.auth.logout, undefined, {
          headers: { "X-Session-ID": sid },
        });
      }
    } catch {
      // ignore
    }
    localStorage.removeItem(SID_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const register = async (payload: any) => {
    // Expect backend returns { user, sessionId }
    const res = await http.post(endpoints.auth.register, payload);
    const data = res.data;
    const sid = data.sessionId;
    const u = data.user as User;
    localStorage.setItem(SID_KEY, sid);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  };

  const hasRole = (roles: Role[]) => !!user && roles.includes(user.role);

  const value = useMemo(() => ({ user, login, logout, register, hasRole }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
