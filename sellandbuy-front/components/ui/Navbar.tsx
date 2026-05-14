"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ThemeToggle } from "./ThemeToggle";

export type NavTab = "home" | "search" | "sell" | "inbox" | "profile";

interface NavbarProps {
  showSearch?: boolean;
}

export function Navbar({ showSearch = true }: NavbarProps) {
  const { firebaseUser, userProfile } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Prevent dynamic shrink on messages route to avoid layout jitter
  const isMessageRoute = pathname?.startsWith("/messages");
  const isNavbarCompact = isMessageRoute ? false : scrolled;

  // Sync input with URL on mount/navigation
  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    setSearchValue(q);
  }, [searchParams]);

  // Detect scroll for "smart sticky" behavior
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const initials = userProfile?.displayName
    ? userProfile.displayName.slice(0, 2).toUpperCase()
    : "??";

  // Determine user state
  const isGuest = !firebaseUser;
  // Assume a user is a seller if they have products or explicitly marked. For UX, we show "Publicar" prominently to logged-in users to encourage selling.

  const handleSearchClick = () => {
    setSearchExpanded(true);
    if (pathname !== "/products") {
      router.push("/products");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    // Debounce: wait 300ms after user stops typing before navigating
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (value.trim()) params.set("q", value.trim());
      router.push(`/products${value.trim() ? `?${params.toString()}` : ""}`, { scroll: false });
    }, 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("q", searchValue.trim());
    router.push(`/products${searchValue.trim() ? `?${params.toString()}` : ""}`);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isNavbarCompact ? "py-2 shadow-sm" : "py-4"
      }`}
      style={{
        background: "var(--color-surface)", // Using variable directly for dark mode compatibility
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: isNavbarCompact ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
        borderBottom: "1px solid var(--color-outline-variant)"
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 w-full max-w-7xl mx-auto gap-4">
        
        {/* Left: Logo */}
        <div className={`flex items-center gap-2 transition-all duration-300 ${searchExpanded ? 'hidden md:flex' : 'flex'}`}>
          <Link
            href="/products"
            className="flex-shrink-0 text-2xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, var(--color-primary), var(--color-surface-tint))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            S&amp;B
          </Link>
        </div>

        {/* Center: Search (Expandable) */}
        {showSearch && (
          <div className={`flex-1 flex justify-center transition-all duration-300 ${searchExpanded ? 'max-w-2xl' : 'max-w-md'}`}>
            <form
              className="relative w-full group"
              onSubmit={handleSearchSubmit}
              role="search"
            >
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline)] group-hover:text-[var(--color-primary)] transition-colors pointer-events-none">
                search
              </span>
              <input
                className="w-full bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] rounded-full py-2.5 pl-12 pr-4 text-sm text-[var(--color-on-surface)] outline-none focus:bg-[var(--color-surface-bright)] focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:border-[var(--color-primary)]/30 transition-all shadow-inner placeholder-[var(--color-outline)]"
                placeholder="Buscar en el marketplace..."
                type="search"
                value={searchValue}
                onClick={handleSearchClick}
                onChange={handleSearchChange}
                onFocus={() => setSearchExpanded(true)}
                onBlur={() => setSearchExpanded(false)}
                aria-label="Buscar productos"
              />
            </form>
          </div>
        )}

        {/* Right: Actions */}
        <div className={`flex items-center gap-2 sm:gap-4 transition-all ${searchExpanded ? 'hidden md:flex' : 'flex'}`}>
          
          <ThemeToggle />

          {/* CTA Publicar (Efecto Von Restorff - Siempre Destacado) */}
          <Link
            href="/products/create"
            className="hidden sm:flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-lg hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Publicar
          </Link>

          {isGuest ? (
            <Link
              href="/"
              className="hidden sm:flex items-center gap-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-container)] text-white px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-lg hover:-translate-y-0.5"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Iniciar Sesión
            </Link>
          ) : (
            <>
              {/* Notificaciones */}
              <Link
                href="/messages"
                className="p-2.5 rounded-full hover:bg-[var(--color-surface-container)] transition-colors relative text-[var(--color-outline)] hover:text-[var(--color-primary)]"
                aria-label="Mensajes"
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                {/* Simulated Badge */}
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[var(--color-error)] rounded-full border-2 border-[var(--color-surface)]"></span>
              </Link>

              {/* Avatar */}
              <Link
                href="/dashboard"
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--color-surface-container)] to-[var(--color-surface-container-high)] border border-[var(--color-outline-variant)] flex items-center justify-center text-[var(--color-primary)] text-xs font-bold overflow-hidden hover:ring-2 hover:ring-[var(--color-primary)]/50 transition-all shadow-sm"
                aria-label="Mi perfil"
              >
                {userProfile?.photoURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
