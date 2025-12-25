"use client";

import Image from "next/image";
import { useMemo } from "react";
import { LogOut, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function openAuth(mode: "login" | "signup") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("ssu:open-auth", { detail: { mode } }));
}

export default function Navbar() {
  const { currentUser, logout } = useAuth();

  // default selected (UI only)
  const defaultMode = useMemo<"login" | "signup">(() => "login", []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-black/10">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src="/assets/logo.svg"
              alt="SSU"
              width={42}
              height={42}
              className="rounded shrink-0"
              priority
            />
            <div className="leading-tight min-w-0">
              <div className="text-[11px] sm:text-xs text-gray-600 truncate">
                Special Security Unit
              </div>
              <div className="text-base sm:text-lg font-extrabold text-gray-900 truncate">
                SSU Academy
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center justify-end">
            {!currentUser ? (
              <div
                className="inline-flex rounded-2xl border border-gray-200 bg-white p-1 shadow-sm"
                aria-label="Auth toggle"
              >
                <button
                  type="button"
                  onClick={() => openAuth("login")}
                  className="inline-flex items-center gap-2 rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition whitespace-nowrap"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden xs:inline">Log In</span>
                  <span className="xs:hidden">Login</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAuth("signup")}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-3 sm:px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900 transition whitespace-nowrap"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden xs:inline">Sign Up</span>
                  <span className="xs:hidden">Signup</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition whitespace-nowrap"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-semibold">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* line under navbar */}
      <div className="h-[2px] w-full bg-[#8B2F2F]" />
    </header>
  );
}
