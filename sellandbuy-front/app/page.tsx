"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

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
      router.replace("/products");
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
      router.replace("/products");
    } catch {
      // Error is handled by context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    await loginWithGoogle();
  };

  const switchMode = () => {
    clearError();
    setMode((m) => (m === "login" ? "signup" : "login"));
  };

  const isLoading = loading || submitting;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-surface]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[--color-primary] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[--color-surface]">
      
      {/* Left Side - Image/Branding (Hidden on small screens) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-neutral-900 relative flex-col justify-between p-12 overflow-hidden">
        {/* Subtle patterned background or gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-neutral-900 to-black opacity-90 z-0"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <span className="material-symbols-outlined text-[--color-primary] text-4xl">grid_view</span>
          <span className="text-3xl font-black text-white tracking-tight">Sell&Buy</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            El marketplace premium para vender más rápido.
          </h1>
          <p className="text-xl text-neutral-300">
            Únete a miles de personas que compran y venden tecnología y más con total seguridad.
          </p>
        </div>

        <div className="relative z-10 text-neutral-500 text-sm">
          © {new Date().getFullYear()} Sell&Buy Marketplace.
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-white relative">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-2 mb-10 justify-center">
          <span className="material-symbols-outlined text-[--color-primary] text-3xl">grid_view</span>
          <span className="text-2xl font-black tracking-tight text-neutral-900">Sell&Buy</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-neutral-900">
              {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
            </h2>
            <p className="text-neutral-500 mt-2">
              {mode === "login" 
                ? "Ingresa tus datos para acceder a tu cuenta." 
                : "Comienza a comprar y vender en minutos."}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex justify-between items-start">
              <span>{error}</span>
              <button onClick={clearError} className="text-red-400 hover:text-red-600">
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-neutral-200 text-neutral-700 px-4 py-3 rounded-xl font-medium hover:bg-neutral-50 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continuar con Google
          </button>

          <div className="relative flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-neutral-200"></div>
            <span className="text-neutral-400 text-sm font-medium">o con email</span>
            <div className="flex-1 h-px bg-neutral-200"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Nombre completo</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  minLength={2}
                  disabled={isLoading}
                  className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[--color-primary]/30 focus:border-[--color-primary] transition-all"
                />
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[--color-primary]/30 focus:border-[--color-primary] transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[--color-primary]/30 focus:border-[--color-primary] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-[--color-primary] text-white font-bold py-3.5 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-[--color-primary]/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
              {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </button>
          </form>

          <div className="mt-8 text-center text-neutral-500 text-sm">
            {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button 
              onClick={switchMode} 
              type="button"
              className="text-[--color-primary] font-bold hover:underline"
            >
              {mode === "login" ? "Regístrate gratis" : "Inicia Sesión"}
            </button>
          </div>
          
          <div className="mt-8 text-center">
             <Link href="/products" className="text-sm text-neutral-400 hover:text-neutral-600 font-medium transition-colors">
               Explorar como invitado &rarr;
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}