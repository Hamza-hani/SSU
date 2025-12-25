"use client";

import LandingPage from "../components/LandingPage";
import Dashboard from "../components/Dashboard";
import AdminPanel from "../components/AdminPanel";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { currentUser } = useAuth();

  if (!currentUser) return <LandingPage />;

  return currentUser.role === "admin" ? <AdminPanel /> : <Dashboard user={currentUser} />;
}
