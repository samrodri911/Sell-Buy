"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendEmailVerification,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase/auth";
import {
  syncUserToFirestore,
  getUserProfile,
  clearProfileCache,
} from "@/lib/services/user.service";
import type { AuthContextValue, UserProfile } from "@/types/user";

// ─── Context ───────────────────────────────────────────────────
export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Auth state listener ── (runs once on mount, cleaned up on unmount)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          // 🔑 Force reload so emailVerified reflects latest state
          // (e.g., user verified their email in another tab / session)
          await user.reload();
          // After reload, auth.currentUser has the freshest token data.
          // We use the reloaded user from auth.currentUser for accuracy.
          const freshUser = auth.currentUser ?? user;
          setFirebaseUser(freshUser);
          // Sync to Firestore (including isEmailVerified)
          const profile = await syncUserToFirestore(freshUser);
          setUserProfile(profile);
        } else {
          setFirebaseUser(null);
          setUserProfile(null);
          clearProfileCache();
        }
      } catch (err) {
        console.error("[Auth] State change error:", err);
        setError(
          err instanceof Error ? err.message : "Error al verificar sesión"
        );
      } finally {
        setLoading(false);
      }
    });

    // Cleanup listener on unmount — prevents memory leaks
    return () => unsubscribe();
  }, []);

  // ── Login with Google ──
  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle the rest
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        setLoading(false);
        return;
      }
      console.error("[Auth] Google login error:", err);
      const message = getAuthErrorMessage(err);
      setError(message);
      setLoading(false);
    }
  }, []);

  // ── Login with Email/Password ──
  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        setLoading(true);
        await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle the rest
      } catch (err: any) {
        console.error("[Auth] Email login error:", err);
        const message = getAuthErrorMessage(err);
        if (message) setError(message);
        setLoading(false);
      }
    },
    []
  );

  // ── Sign up with Email/Password ──
  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      try {
        setError(null);
        setLoading(true);
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        // Set the display name on the Firebase Auth profile
        await updateProfile(result.user, { displayName });
        // Send email verification immediately after registration
        await sendEmailVerification(result.user);
        // Force a re-sync so Firestore gets the displayName
        await syncUserToFirestore(result.user);
        const profile = await getUserProfile(result.user.uid, true);
        setUserProfile(profile);
        setLoading(false);
      } catch (err: any) {
        console.error("[Auth] Signup error:", err);
        const message = getAuthErrorMessage(err);
        if (message) setError(message);
        setLoading(false);
      }
    },
    []
  );

  // ── Logout ──
  const logout = useCallback(async () => {
    try {
      setError(null);
      await signOut(auth);
      // onAuthStateChanged will clear the state
    } catch (err) {
      console.error("[Auth] Logout error:", err);
      setError(
        err instanceof Error ? err.message : "Error al cerrar sesión"
      );
    }
  }, []);

  // ── Send email verification ──
  const sendVerificationEmail = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      await sendEmailVerification(firebaseUser);
    } catch (err) {
      console.error("[Auth] Send verification email error:", err);
      throw err;
    }
  }, [firebaseUser]);

  // ── Refresh profile from Firestore ──
  const refreshProfile = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      const profile = await getUserProfile(firebaseUser.uid, true);
      setUserProfile(profile);
    } catch (err) {
      console.error("[Auth] Refresh profile error:", err);
    }
  }, [firebaseUser]);

  // ── Clear Error ──
  const clearError = useCallback(() => setError(null), []);

  // ── Optimistic Update for Profile ──
  const updateLocalProfile = useCallback((partialProfile: Partial<UserProfile>) => {
    setUserProfile((prev) => (prev ? { ...prev, ...partialProfile } : null));
  }, []);

  // ── Memoize context value to prevent unnecessary re-renders ──
  const value = useMemo<AuthContextValue>(
    () => ({
      firebaseUser,
      userProfile,
      loading,
      error,
      loginWithGoogle,
      loginWithEmail,
      signUpWithEmail,
      logout,
      sendVerificationEmail,
      refreshProfile,
      clearError,
      updateLocalProfile,
    }),
    [
      firebaseUser,
      userProfile,
      loading,
      error,
      loginWithGoogle,
      loginWithEmail,
      signUpWithEmail,
      logout,
      sendVerificationEmail,
      refreshProfile,
      clearError,
      updateLocalProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Error message translator ──────────────────────────────────
// Maps Firebase error codes to user-friendly Spanish messages.
function getAuthErrorMessage(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: string }).code;
    switch (code) {
      case "auth/email-already-in-use":
        return "Este correo ya está registrado. Intenta iniciar sesión.";
      case "auth/invalid-email":
        return "El correo electrónico no es válido.";
      case "auth/weak-password":
        return "La contraseña debe tener al menos 6 caracteres.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Correo o contraseña incorrectos.";
      case "auth/too-many-requests":
        return "Demasiados intentos. Espera un momento e intenta de nuevo.";
      case "auth/popup-closed-by-user":
        return "";
      default:
        return `Error de autenticación (${code}).`;
    }
  }
  return err instanceof Error ? err.message : "Error desconocido.";
}
