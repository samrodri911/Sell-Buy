"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavTab = "home" | "search" | "sell" | "inbox" | "profile";

interface BottomNavProps {
  activeTab?: NavTab;
}

const tabs: { id: NavTab; label: string; icon: string; href: string }[] = [
  { id: "home",    label: "Inicio",   icon: "home",        href: "/products" },
  { id: "search",  label: "Buscar",   icon: "search",      href: "/products" },
  { id: "sell",    label: "Vender",   icon: "add_circle",  href: "/products/create" },
  { id: "inbox",   label: "Mensajes", icon: "chat_bubble", href: "/messages" },
  { id: "profile", label: "Perfil",   icon: "person",      href: "/dashboard" },
];

/**
 * Mobile-only bottom navigation bar.
 * Pure UI — no business logic.
 */
export function BottomNav({ activeTab }: BottomNavProps) {
  const pathname = usePathname();

  const resolve = (tab: (typeof tabs)[number]) => {
    if (activeTab) return tab.id === activeTab;
    return pathname === tab.href;
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-2 pb-6 rounded-t-3xl"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 -10px 40px rgba(0,0,0,0.05)",
      }}
    >
      {tabs.map((tab) => {
        const active = resolve(tab);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={[
              "flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all duration-200 active:scale-90",
              active
                ? "bg-blue-50 text-blue-700"
                : "text-slate-500 hover:text-blue-500",
            ].join(" ")}
            aria-label={tab.label}
          >
            <span
              className="material-symbols-outlined"
              style={
                active
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {tab.icon}
            </span>
            <span className="text-[11px] font-medium mt-0.5">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
