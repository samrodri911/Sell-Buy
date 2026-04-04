"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "login" | "signup";

export default function HomePage() {
  const {
    firebaseUser,
    loading,
    error,
    loginWithGoogle,
    loginWithEmail,
    signUpWithEmail,
    clearError,
  } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && firebaseUser) {
      router.replace("/dashboard");
    }
  }, [loading, firebaseUser, router]);

  if (!loading && firebaseUser) {
    return null;
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    clearError();

    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
      router.replace("/dashboard");
    } catch {
      // Error is handled by context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    await loginWithGoogle();
    // Redirect handled by the auth state change + re-render
  };

  const switchMode = () => {
    clearError();
    setMode((m) => (m === "login" ? "signup" : "login"));
  };

  const isLoading = loading || submitting;

  // ── Loading screen ──
  if (loading) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Cargando...</p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.logo}>Sell&Buy</h1>
          <p style={styles.subtitle}>Marketplace de iPhones</p>
        </div>

        {/* Error */}
        {error && (
          <div style={styles.errorBox}>
            <span>{error}</span>
            <button onClick={clearError} style={styles.errorClose}>
              ✕
            </button>
          </div>
        )}

        {/* Google Button (Primary) */}
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          style={{
            ...styles.googleBtn,
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" style={{ flexShrink: 0 }}>
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continuar con Google</span>
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>o</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailAuth} style={styles.form}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Nombre completo"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              minLength={2}
              disabled={isLoading}
              style={styles.input}
            />
          )}
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Contraseña (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isLoading}
            style={styles.input}
          />
          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.submitBtn,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading
              ? "Procesando..."
              : mode === "login"
                ? "Iniciar Sesión"
                : "Crear Cuenta"}
          </button>
        </form>

        {/* Toggle login/signup */}
        <p style={styles.toggleText}>
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button onClick={switchMode} style={styles.toggleBtn} type="button">
            {mode === "login" ? "Regístrate" : "Inicia Sesión"}
          </button>
        </p>
      </div>
    </main>
  );
}

// ─── Inline styles ─────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)",
    padding: "1rem",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "2.5rem 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  header: { textAlign: "center" },
  logo: {
    fontSize: "2rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
  },
  subtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.875rem",
    marginTop: "0.25rem",
  },
  errorBox: {
    background: "rgba(239,68,68,0.15)",
    border: "1px solid rgba(239,68,68,0.3)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "#fca5a5",
    fontSize: "0.85rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorClose: {
    background: "none",
    border: "none",
    color: "#fca5a5",
    cursor: "pointer",
    fontSize: "1rem",
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem",
    width: "100%",
    padding: "0.8rem",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.1)",
  },
  dividerText: {
    color: "rgba(255,255,255,0.35)",
    fontSize: "0.8rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  input: {
    width: "100%",
    padding: "0.8rem 1rem",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    color: "#fff",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
  },
  submitBtn: {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  toggleText: {
    textAlign: "center",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.85rem",
  },
  toggleBtn: {
    background: "none",
    border: "none",
    color: "#a78bfa",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid rgba(255,255,255,0.1)",
    borderTopColor: "#8b5cf6",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    margin: "0 auto",
  },
  loadingText: {
    textAlign: "center",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.9rem",
  },
};