"use client";

import LandingPage from "../components/LandingPage";
import Dashboard from "../components/Dashboard";
import AdminPanel from "../components/AdminPanel";
import { useAuth } from "../contexts/AuthContext";
import type { User } from "../types";

export default function HomePage() {
  const { currentUser, setCurrentUser } = useAuth();

  const handleShowAdmin = () => {
    setCurrentUser({
      id: "admin-demo",
      name: "Admin",
      email: "admin@ssu.academy",
      role: "admin",
    } as User);
  };

  // ✅ Navbar + Footer + AuthModal are handled globally in AppShell (layout.tsx)
  // So this page only decides what to show in main content.
  return (
    <>
      {!currentUser ? (
        <LandingPage
          onShowSignup={() => {
            // Signup modal opens from Navbar now (global).
            // You can optionally replace this with a global "openSignup" later.
          }}
          onShowAdmin={handleShowAdmin}
        />
      ) : currentUser.role === "admin" ? (
        <AdminPanel />
      ) : (
        <Dashboard user={currentUser} onLogout={() => {}} />
      )}
    </>
  );
}
