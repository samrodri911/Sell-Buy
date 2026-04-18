"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export type NavTab = "home" | "search" | "sell" | "inbox" | "profile";

interface NavbarProps {
  activeTab?: NavTab;
  showSearch?: boolean;
}

/**
 * TopAppBar — glassmorphism sticky header.
 * Visual only: no business logic, no auth side-effects.
 */
export function Navbar({ activeTab, showSearch = false }: NavbarProps) {
  const { userProfile } = useAuth();

  const initials = userProfile?.displayName
    ? userProfile.displayName.slice(0, 2).toUpperCase()
    : "??";

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 1px 0 0 rgba(0,0,0,0.06)",
      }}
    >
      <div className="flex items-center justify-between px-6 h-16 w-full max-w-screen-xl mx-auto">
        {/* Left: logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-xl hover:bg-[--color-surface-container-low] transition-colors"
            aria-label="Explorar"
          >
            <span className="material-symbols-outlined text-[--color-primary]">
              grid_view
            </span>
          </Link>
          <Link
            href="/products"
            className="text-xl font-bold text-[--color-on-surface] tracking-tight"
          >
            Sell&amp;Buy
          </Link>
        </div>

        {/* Center: search (desktop) */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[--color-outline] text-[20px]">
                search
              </span>
              <input
                className="w-full bg-[--color-surface-container-high] border-none rounded-2xl py-2 pl-10 pr-4 text-sm placeholder:text-[--color-outline] outline-none focus:ring-2 focus:ring-[--color-primary]/20 transition-all"
                placeholder="Buscar productos..."
                type="text"
                readOnly
              />
            </div>
          </div>
        )}

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full hover:bg-[--color-surface-container-low] transition-colors relative"
            aria-label="Notificaciones"
          >
            <span className="material-symbols-outlined text-[--color-on-surface-variant]">
              notifications
            </span>
          </button>

          {/* Avatar / initials */}
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-full bg-[--color-primary-container] flex items-center justify-center text-[--color-on-primary-container] text-xs font-bold overflow-hidden"
            aria-label="Mi perfil"
          >
            {userProfile?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userProfile.photoURL}
                alt={userProfile.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
