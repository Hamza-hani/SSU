"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { User } from "../types";

interface AuthModalProps {
  mode: "login" | "signup";
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchMode: () => void;
}

export default function AuthModal({ mode, onClose, onSuccess, onSwitchMode }: AuthModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string>("");

  const isSignup = mode === "signup";

  const canSubmit = useMemo(() => {
    if (!formData.email || !formData.password) return false;
    if (isSignup && (!formData.name || !formData.confirmPassword)) return false;
    if (isSignup && formData.password !== formData.confirmPassword) return false;
    return true;
  }, [formData, isSignup]);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    try {
      if (isSignup) {
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        const res = await fetch("/api/auth/signup", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            email,
            password,
            confirmPassword: formData.confirmPassword,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          setError(data?.message || data?.error || "Signup failed.");
          return;
        }

        const role = String(data?.user?.role || "").toLowerCase() === "admin" ? "admin" : "user";

        onSuccess({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role,
        });

        return;
      }

      // login
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || data?.message || "Login failed.");
        return;
      }

      const role = String(data?.user?.role || "").toLowerCase() === "admin" ? "admin" : "user";

      onSuccess({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role,
      });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 relative border border-black/10 shadow-xl">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>

          <div className="flex items-center justify-center mb-6">
            <img src="/assets/logo.svg" alt="SSU Academy Logo" className="h-14 w-14" />
          </div>

          <h2 className="text-2xl font-extrabold text-center text-gray-900 mb-2">
            {mode === "login" ? "Welcome Back" : "Create Your Account"}
          </h2>

          <p className="text-center text-gray-600 mb-6">
            {mode === "login"
              ? "Continue your security training journey"
              : "Create an account to access SSU internal training."}
          </p>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Your Name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="w-full bg-black text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button onClick={onSwitchMode} className="text-black font-semibold hover:underline">
              {mode === "login" ? "Sign Up" : "Log In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modal, document.body);
}
