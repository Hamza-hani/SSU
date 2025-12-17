"use client";

import React, { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AuthModal from "./AuthModal";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../types";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, logout, setCurrentUser } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const handleShowLogin = () => {
    setAuthMode("login");
    setShowAuth(true);
  };

  const handleShowSignup = () => {
    setAuthMode("signup");
    setShowAuth(true);
  };

  const handleSwitchMode = () => {
    setAuthMode((prev) => (prev === "login" ? "signup" : "login"));
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setShowAuth(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar
        isLoggedIn={!!currentUser}
        userName={currentUser?.name || currentUser?.email}
        onLogout={logout}
        onShowLogin={handleShowLogin}
        onShowSignup={handleShowSignup}
      />

      {/* Page content */}
      <main className="flex-1">{children}</main>

      <Footer />

      {showAuth && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
          onSwitchMode={handleSwitchMode}
        />
      )}
    </div>
  );
}
