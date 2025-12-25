"use client";

import { useEffect, useState } from "react";
import AuthModal from "./AuthModal";
import type { User } from "../types";
import { useAuth } from "../contexts/AuthContext";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { setCurrentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ mode: "login" | "signup" }>;
      setMode(ev.detail?.mode ?? "login");
      setOpen(true);
    };

    window.addEventListener("ssu:open-auth", handler as EventListener);
    return () => window.removeEventListener("ssu:open-auth", handler as EventListener);
  }, []);

  const onSuccess = (user: User) => {
    setCurrentUser(user);
    setOpen(false);
  };

  return (
    <>
      {children}
      {open && (
        <AuthModal
          mode={mode}
          onClose={() => setOpen(false)}
          onSuccess={onSuccess}
          onSwitchMode={() => setMode((m) => (m === "login" ? "signup" : "login"))}
        />
      )}
    </>
  );
}
