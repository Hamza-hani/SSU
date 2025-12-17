'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../types";

type AuthContextValue = {
  currentUser: User | null;
  setCurrentUser: (u: User | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "ssu_academy_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCurrentUserState(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const setCurrentUser = (u: User | null) => {
    setCurrentUserState(u);
    try {
      if (!u) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    } catch {
      // ignore
    }
  };

  const logout = () => setCurrentUser(null);

  const value = useMemo(() => ({ currentUser, setCurrentUser, logout }), [currentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
