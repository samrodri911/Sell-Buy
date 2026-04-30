"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";

export type NavTab = "home" | "search" | "sell" | "inbox" | "profile";

interface NavbarProps {
  showSearch?: boolean;
}

export function Navbar({ showSearch = true }: NavbarProps) {
  const { firebaseUser, userProfile } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
    // If not on products page, we might want to redirect
    if (pathname !== '/products') {
      router.push('/products');
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "py-2 shadow-sm" : "py-4"
      }`}
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: scrolled ? "0 4px 20px rgba(0,0,0,0.05)" : "none",
        borderBottom: "1px solid rgba(0,0,0,0.04)"
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 w-full max-w-7xl mx-auto gap-4">
        
        {/* Left: Logo */}
        <div className={`flex items-center gap-2 transition-all duration-300 ${searchExpanded ? 'hidden md:flex' : 'flex'}`}>
          <Link
            href="/products"
            className="flex-shrink-0 text-2xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, var(--color-primary), #8b5cf6)",
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
            <div 
              className="relative w-full group"
              onClick={handleSearchClick}
            >
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-hover:text-[--color-primary] transition-colors">
                search
              </span>
              <input
                className="w-full bg-neutral-100/80 border border-neutral-200/50 rounded-full py-2.5 pl-12 pr-4 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[--color-primary]/30 focus:border-[--color-primary]/30 transition-all shadow-inner"
                placeholder="Buscar en el marketplace..."
                type="text"
                onBlur={() => setSearchExpanded(false)}
              />
            </div>
          </div>
        )}

        {/* Right: Actions */}
        <div className={`flex items-center gap-2 sm:gap-4 transition-all ${searchExpanded ? 'hidden md:flex' : 'flex'}`}>
          
          {/* CTA Publicar (Efecto Von Restorff - Siempre Destacado) */}
          <Link
            href="/products/create"
            className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:-translate-y-0.5"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Publicar
          </Link>

          {isGuest ? (
            <Link
              href="/"
              className="text-sm font-semibold text-neutral-700 hover:text-[--color-primary] px-3 py-2 rounded-full hover:bg-neutral-100 transition-colors"
            >
              Iniciar Sesión
            </Link>
          ) : (
            <>
              {/* Notificaciones */}
              <Link
                href="/messages"
                className="p-2.5 rounded-full hover:bg-neutral-100 transition-colors relative text-neutral-600 hover:text-[--color-primary]"
                aria-label="Mensajes"
              >
                <span className="material-symbols-outlined">chat_bubble</span>
                {/* Simulated Badge */}
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
              </Link>

              {/* Avatar */}
              <Link
                href="/dashboard"
                className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 border border-indigo-200 flex items-center justify-center text-indigo-700 text-xs font-bold overflow-hidden hover:ring-2 hover:ring-[--color-primary]/50 transition-all shadow-sm"
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
