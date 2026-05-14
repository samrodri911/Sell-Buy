"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same dimensions to avoid layout shift
    return <div className="w-10 h-10 rounded-full" aria-hidden="true" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-surface-container)] text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] overflow-hidden group"
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      title={isDark ? "Modo Claro" : "Modo Oscuro"}
    >
      <div className="relative w-5 h-5">
        <span
          className={`material-symbols-outlined absolute inset-0 text-[20px] transition-all duration-300 transform ${isDark ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100"
            }`}
        >
          light_mode
        </span>
        <span
          className={`material-symbols-outlined absolute inset-0 text-[20px] transition-all duration-300 transform ${isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
            }`}
        >
          dark_mode
        </span>
      </div>
    </button>
  );
}
