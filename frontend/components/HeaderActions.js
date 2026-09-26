"use client";

import Link from "next/link";
import { UserCircle, LogIn } from "lucide-react";
import { useSelector } from "react-redux";

export default function HeaderActions() {
  const { user, isInitialized } = useSelector((state) => state.auth);

  if (!isInitialized) {
    return (
      <div className="w-9 sm:w-16 h-9 bg-neutral-900/60 border border-neutral-800/80 rounded-xl animate-pulse" />
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-3 text-neutral-300 shrink-0">
      {user ? (
        <Link
          href="/profile"
          className="group flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-xl border border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-neutral-700 transition-all duration-300 active:scale-95"
          title={user.name || "User Profile"}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || "Account Avatar"}
              className="w-5 h-5 rounded-full border border-neutral-700 object-cover group-hover:border-neutral-500 transition-colors"
            />
          ) : (
            <UserCircle className="w-4 h-4 stroke-2 text-neutral-300 group-hover:text-white transition-colors" />
          )}

          <span className="hidden sm:inline lg:inline text-[11px] font-bold uppercase tracking-[0.2em] font-sans text-neutral-200 group-hover:text-white transition-colors">
            Account
          </span>
        </Link>
      ) : (
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Login */}
          <Link
            href="/login"
            aria-label="Login"
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-900/80 text-neutral-300 hover:text-white transition-all duration-300 flex items-center gap-1.5 active:scale-95 font-sans text-[11px] font-bold uppercase tracking-[0.2em]"
          >
            <LogIn className="w-4 h-4 stroke-2" />

            <span className="hidden sm:inline">
              Login
            </span>
          </Link>

          {/* Signup - hidden on very small phones */}
          <Link
            href="/signup"
            className="hidden sm:flex shimmer-button bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 text-[11px] font-bold uppercase tracking-[0.2em] px-3 py-2 sm:px-5 sm:py-2 rounded-xl active:scale-95 transition-all duration-300 font-sans shadow-lg shadow-black/40 whitespace-nowrap items-center"
          >
            Signup
          </Link>
        </div>
      )}
    </div>
  );
}
