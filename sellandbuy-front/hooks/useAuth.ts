"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import type { AuthContextValue } from "@/types/user";

/**
 * Hook to access auth state and actions.
 * Must be used inside <AuthProvider>.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth() must be used within an <AuthProvider>. " +
        "Wrap your app in <AuthProvider> in layout.tsx."
    );
  }

  return context;
}
