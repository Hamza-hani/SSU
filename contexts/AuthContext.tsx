"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "../types";

type AuthContextValue = {
  currentUser: User | null;
  ready: boolean;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const LS_CURRENT_USER = "ssu:currentUser";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const refreshMe = async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setCurrentUser(data?.user ?? null);
    } catch {
      setCurrentUser(null);
    } finally {
      setReady(true);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      setCurrentUser(null);
      setReady(true);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (currentUser) localStorage.setItem(LS_CURRENT_USER, JSON.stringify(currentUser));
      else localStorage.removeItem(LS_CURRENT_USER);
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    refreshMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ currentUser, ready, setCurrentUser, refreshMe, logout }),
    [currentUser, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
