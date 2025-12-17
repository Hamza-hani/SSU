"use client";

import React from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";

interface NavbarProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
  onShowLogin?: () => void;
  onShowSignup?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  isLoggedIn,
  userName,
  onLogout,
  onShowLogin,
  onShowSignup,
}) => {
  return (
    <header className="sticky top-0 z-50">
      {/* glass background */}
      <div className="backdrop-blur-xl bg-white/80 border-b border-gray-200/70 shadow-[0_10px_30px_rgba(0,0,0,0.07)]">
        {/* top accent line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-black via-gray-400 to-black" />

        <nav className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Navbar height increased */}
          <div className="min-h-[76px] py-3 flex items-center justify-between gap-3">
            {/* Left: Brand */}
            <Link href="/" className="flex items-center gap-3 min-w-0">
              {/* Old logo bigger + visible */}
              <div className="relative shrink-0">
                <div className="absolute -inset-1 rounded-2xl bg-black/10 blur-sm" />
                <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-white shadow-sm border border-black/10 flex items-center justify-center overflow-hidden">
                  <img
                    src="/assets/logo.svg"
                    alt="SSU Academy Logo"
                    className="h-10 w-10 sm:h-12 sm:w-12 object-contain"
                  />
                </div>
              </div>

              <div className="leading-tight min-w-0">
                <div className="text-[12px] sm:text-[13px] text-gray-500">
                  Special Security Unit
                </div>
                <div className="text-base sm:text-lg font-bold tracking-tight text-gray-900 truncate">
                  SSU Academy
                </div>
              </div>
            </Link>

            {/* Right: Auth / User */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              {isLoggedIn ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-black/5 border border-black/10 max-w-[260px]">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {userName || "User"}
                    </span>
                  </div>

                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl border border-black/10 bg-white hover:bg-black hover:text-white transition shadow-sm"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-semibold">Logout</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={onShowLogin}
                    className="px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-black/5 transition"
                  >
                    Log In
                  </button>

                  <button
                    onClick={onShowSignup}
                    className="px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-black hover:bg-gray-900 transition shadow-sm"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
