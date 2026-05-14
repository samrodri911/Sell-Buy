"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { isAdult } from "@/lib/ageValidation";

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
  const [birthDate, setBirthDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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
    setLocalError(null);
    clearError();

    if (mode === "signup") {
      if (!birthDate) {
        setLocalError("Debes ingresar tu fecha de nacimiento.");
        return;
      }
      if (!isAdult(birthDate)) {
        setLocalError("Debes ser mayor de 18 años para registrarte.");
        return;
      }
    }

    setSubmitting(true);

    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, displayName);
      } else {
        await loginWithEmail(email, password);
      }
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
    setLocalError(null);
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

      {/* ─── Left Panel — 3D Phone Showcase ────────────────────────── */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative flex-col justify-between p-10 overflow-hidden select-none">

        {/* ── Layered background ── */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1433 40%, #10184a 70%, #0a0e1a 100%)' }} />

        {/* Ambient blobs */}
        <div className="absolute top-[-8%] left-[-4%]  w-[440px] h-[440px] rounded-full blur-[130px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-4%] w-[380px] h-[380px] rounded-full blur-[110px] animate-pulse-glow"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.30) 0%, transparent 70%)', animationDelay: '1.8s' }} />

        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '26px 26px' }} />

        {/* ── Logo ── */}
        <div className="relative z-20 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-[18px]">storefront</span>
          </div>
          <span className="text-xl font-black text-white tracking-tight">
            Sell<span className="text-indigo-400">&</span>Buy
          </span>
        </div>

        {/* ── Central 3D phone + orbit scene ── */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          <div className="relative flex items-center justify-center" style={{ width: 320, height: 360 }}>

            {/* ── Glowing platform ring ── */}
            <div className="absolute bottom-[-28px] left-1/2 -translate-x-1/2" style={{ perspective: 500 }}>
              {/* Outer ring */}
              <div className="animate-ring-pulse" style={{
                width: 260, height: 44,
                borderRadius: '50%',
                transform: 'rotateX(70deg)',
                background: 'radial-gradient(ellipse, rgba(99,102,241,0.0) 30%, rgba(99,102,241,0.55) 70%, rgba(139,92,246,0.25) 100%)',
                boxShadow: '0 0 40px 10px rgba(99,102,241,0.40), inset 0 0 20px rgba(139,92,246,0.20)',
              }} />
              {/* Inner glow ring */}
              <div className="absolute inset-0 m-auto animate-ring-pulse" style={{
                width: 180, height: 30,
                borderRadius: '50%',
                transform: 'rotateX(70deg)',
                background: 'radial-gradient(ellipse, rgba(165,180,252,0.0) 20%, rgba(165,180,252,0.4) 100%)',
                boxShadow: '0 0 24px 6px rgba(165,180,252,0.35)',
                animationDelay: '0.5s',
              }} />
            </div>

            {/* ── Orbiting icons ── */}
            {/* Shield — orbit normal speed */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ top: 20 }}>
              <div className="animate-orbit" style={{ animationDelay: '0s' }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))', boxShadow: '0 0 16px rgba(99,102,241,0.6)' }}>
                  <span className="material-symbols-outlined text-white text-[20px]">auto_awesome</span>
                </div>
              </div>
            </div>

            {/* Shopping bag — orbit reverse */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ top: 20 }}>
              <div className="animate-orbit-rev" style={{ animationDelay: '0s' }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.9), rgba(236,72,153,0.9))', boxShadow: '0 0 16px rgba(168,85,247,0.6)' }}>
                  <span className="material-symbols-outlined text-white text-[20px]">shopping_bag</span>
                </div>
              </div>
            </div>

            {/* Bolt — orbit small radius, slow */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ top: 20 }}>
              <div className="animate-orbit-small" style={{ animationDelay: '3s' }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(251,146,60,0.9), rgba(245,158,11,0.9))', boxShadow: '0 0 14px rgba(251,146,60,0.6)' }}>
                  <span className="material-symbols-outlined text-white text-[18px]">bolt</span>
                </div>
              </div>
            </div>

            {/* Star — orbit small, opposite phase */}
            <div className="absolute inset-0 flex items-center justify-center" style={{ top: 20 }}>
              <div className="animate-orbit-small" style={{ animationDelay: '-7s' }}>
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.9), rgba(6,182,212,0.9))', boxShadow: '0 0 12px rgba(16,185,129,0.5)' }}>
                  <span className="material-symbols-outlined text-white text-[16px]">star</span>
                </div>
              </div>
            </div>

            {/* ── Phone mockup ── */}
            <div className="animate-phone-rock relative z-10" style={{ filter: 'drop-shadow(0 30px 60px rgba(99,102,241,0.4)) drop-shadow(0 10px 30px rgba(0,0,0,0.7))' }}>
              {/* Phone shell */}
              <div className="relative overflow-hidden" style={{
                width: 190, height: 370,
                borderRadius: 32,
                background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
                border: '2px solid rgba(255,255,255,0.12)',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.04), inset 0 0 20px rgba(99,102,241,0.08)',
              }}>
                {/* Notch */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full z-10"
                  style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }} />

                {/* Screen content */}
                <div className="absolute inset-0 pt-8 px-2 pb-2 flex flex-col gap-1.5" style={{ background: 'linear-gradient(180deg, #111827 0%, #0d1433 100%)' }}>

                  {/* Status & search bar */}
                  <div className="flex items-center gap-1 bg-white/8 rounded-lg px-2 py-1 mt-2">
                    <span className="material-symbols-outlined text-white/40 text-[10px]">search</span>
                    <span className="text-white/30 text-[8px]">¿Qué estás buscando?</span>
                  </div>

                  {/* Category pills */}
                  <div className="flex gap-1 overflow-hidden">
                    {[
                      { icon: 'devices_other', color: '#6366f1', label: 'Electró...' },
                      { icon: 'home', color: '#8b5cf6', label: 'Hogar' },
                      { icon: 'directions_car', color: '#a855f7', label: 'Vehículos' },
                      { icon: 'checkroom', color: '#ec4899', label: 'Moda' },
                    ].map((cat) => (
                      <div key={cat.label} className="flex flex-col items-center gap-0.5 flex-1">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}33` }}>
                          <span className="material-symbols-outlined text-white/70 text-[11px]">{cat.icon}</span>
                        </div>
                        <span className="text-white/40 text-[6px] truncate w-full text-center">{cat.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Section label */}
                  <div className="flex justify-between items-center px-0.5 mt-0.5">
                    <span className="text-white/60 text-[7px] font-semibold">Destacados</span>
                    <span className="text-indigo-400 text-[6px]">Ver todos</span>
                  </div>

                  {/* Product cards */}
                  <div className="flex gap-1.5">
                    {/* Card 1 */}
                    <div className="flex-1 rounded-xl overflow-hidden" style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}>
                      <div className="h-14 flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.2)' }}>
                        <span className="material-symbols-outlined text-indigo-300 text-2xl">smartphone</span>
                      </div>
                      <div className="p-1">
                        <p className="text-white text-[7px] font-semibold leading-tight">iPhone 15 Pro Max</p>
                        <p className="text-white/40 text-[6px]">Electrónica · Nuevo</p>
                        <p className="text-indigo-400 text-[8px] font-bold mt-0.5">$4.800.000</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[5px] text-green-400 font-medium">✓ Disponible</span>
                          <span className="material-symbols-outlined text-white/30 text-[9px]">favorite</span>
                        </div>
                      </div>
                    </div>
                    {/* Card 2 */}
                    <div className="flex-1 rounded-xl overflow-hidden" style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}>
                      <div className="h-14 flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.2)' }}>
                        <span className="material-symbols-outlined text-violet-300 text-2xl">laptop_mac</span>
                      </div>
                      <div className="p-1">
                        <p className="text-white text-[7px] font-semibold leading-tight">MacBook Air M3</p>
                        <p className="text-white/40 text-[6px]">Usado · Bogotá</p>
                        <p className="text-violet-400 text-[8px] font-bold mt-0.5">$5.200.000</p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="text-[5px] text-green-400 font-medium">✓ Disponible</span>
                          <span className="material-symbols-outlined text-white/30 text-[9px]">favorite</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Popular categories label */}
                  <div className="flex justify-between items-center px-0.5">
                    <span className="text-white/60 text-[7px] font-semibold">Categorías populares</span>
                    <span className="text-indigo-400 text-[6px]">Ver Todos</span>
                  </div>

                  {/* Category chips */}
                  <div className="flex flex-wrap gap-1">
                    {['Electrónica', 'Hogar', 'Vehículos', 'Moda'].map((c) => (
                      <span key={c} className="px-1.5 py-0.5 rounded-full text-[6px] font-medium text-white/60"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        {c}
                      </span>
                    ))}
                  </div>

                  {/* Bottom nav */}
                  <div className="mt-auto flex justify-around items-center py-1.5 mx-[-4px]"
                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {[
                      { icon: 'home', active: true },
                      { icon: 'favorite', active: false },
                      { icon: 'add_circle', accent: true },
                      { icon: 'chat_bubble', active: false },
                      { icon: 'person', active: false },
                    ].map((item, idx) => (
                      <span key={idx}
                        className="material-symbols-outlined text-[13px]"
                        style={{ color: item.accent ? '#6366f1' : item.active ? 'white' : 'rgba(255,255,255,0.3)' }}>
                        {item.icon}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Hero text + features ── */}
        <div className="relative z-10">
          {/* Stat pill */}
          <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/12 rounded-full px-3 py-1.5 mb-4 animate-float" style={{ animationDelay: '1s' }}>
            <span className="material-symbols-outlined text-emerald-400 text-sm">trending_up</span>
            <span className="text-white text-xs font-semibold">+2.400 ventas hoy</span>
          </div>

          <h1 className="text-3xl font-bold text-white leading-tight mb-3">
            El marketplace para comprar y vender{' '}
            <span className="text-indigo-400">más rápido.</span>
          </h1>
          <p className="text-sm text-white/55 mb-5">
            Miles de compradores y vendedores confían en Sell&Buy cada día para hacer negocios de forma segura, rápida y fácil.
          </p>

          {/* Feature list */}
          <div className="space-y-2.5 mb-5">
            {[
              { icon: 'auto_awesome', color: '#6366f1', title: 'IA Inteligente', desc: 'Vende más fácil con descripciones generadas por IA' },
              { icon: 'bolt', color: '#f59e0b', title: 'Más rápido', desc: 'Publica, encuentra y concreta en minutos' },
              { icon: 'group', color: '#10b981', title: 'Comunidad activa', desc: 'Miles de usuarios activos todos los días' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ background: `${f.color}22`, border: `1px solid ${f.color}44` }}>
                  <span className="material-symbols-outlined text-[16px]" style={{ color: f.color }}>{f.icon}</span>
                </div>
                <div>
                  <p className="text-white text-xs font-semibold leading-tight">{f.title}</p>
                  <p className="text-white/40 text-[11px]">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['bg-indigo-400', 'bg-violet-400', 'bg-pink-400', 'bg-emerald-400'].map((c, i) => (
                <div key={i} className={`w-7 h-7 rounded-full ${c} border-2 flex items-center justify-center text-white text-[10px] font-bold`}
                  style={{ borderColor: '#0a0e1a' }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-white/70 text-[9px] font-bold"
                style={{ borderColor: '#0a0e1a', background: 'rgba(99,102,241,0.4)' }}>12k+</div>
            </div>
            <p className="text-white/45 text-xs"><span className="text-white font-semibold">12.000+</span> usuarios activos</p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-4 text-white/20 text-[11px]">
          © {new Date().getFullYear()} Sell&Buy Marketplace. Todos los derechos reservados.
        </div>
      </div>


      {/* ─── Right Panel — Auth Form ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 bg-[var(--color-surface)] relative">

        {/* Mobile Header */}
        <div className="md:hidden flex items-center gap-2 mb-10 justify-center">
          <span className="material-symbols-outlined text-[var(--color-primary)] text-3xl">storefront</span>
          <span className="text-2xl font-black tracking-tight text-[var(--color-on-surface)]">Sell<span className="text-[var(--color-primary)]">&</span>Buy</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--color-on-surface)]">
              {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
            </h2>
            <p className="text-[var(--color-on-surface-variant)] mt-2 text-sm">
              {mode === "login"
                ? "Ingresa tus datos para acceder a tu cuenta."
                : "Comienza a comprar y vender en minutos."}
            </p>
          </div>

          {(error || localError) && (
            <div className="mb-5 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm flex justify-between items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0">error</span>
                <span>{localError || error}</span>
              </div>
              <button
                onClick={() => { clearError(); setLocalError(null); }}
                className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 cursor-pointer"
                aria-label="Cerrar error"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] px-4 py-3 rounded-xl font-medium text-sm hover:bg-[var(--color-surface-container)] hover:border-[var(--color-outline)] hover:shadow-md active:scale-[0.99] cursor-pointer transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-5 group"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" className="flex-shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="group-hover:text-[var(--color-on-surface)] transition-colors">Continuar con Google</span>
          </button>

          <div className="relative flex items-center gap-4 mb-5">
            <div className="flex-1 h-px bg-[var(--color-outline-variant)]"></div>
            <span className="text-[var(--color-on-surface-variant)] text-xs font-medium uppercase tracking-wider">o con email</span>
            <div className="flex-1 h-px bg-[var(--color-outline-variant)]"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="flex flex-col gap-4">
            {mode === "signup" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-on-surface)]">Nombre completo</label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    minLength={2}
                    disabled={isLoading}
                    className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] hover:border-[var(--color-outline)] transition-all duration-200 placeholder:text-[var(--color-outline)] text-[var(--color-on-surface)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-on-surface)]">Fecha de nacimiento <span className="text-[var(--color-outline)] font-normal">(debes ser mayor de 18 años)</span></label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] hover:border-[var(--color-outline)] transition-all duration-200 text-[var(--color-on-surface)]"
                  />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-on-surface)]">Correo electrónico</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] hover:border-[var(--color-outline)] transition-all duration-200 placeholder:text-[var(--color-outline)] text-[var(--color-on-surface)]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-on-surface)]">Contraseña</label>
              <input
                type="password"
                placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "Tu contraseña"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] hover:border-[var(--color-outline)] transition-all duration-200 placeholder:text-[var(--color-outline)] text-[var(--color-on-surface)]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 w-full bg-[var(--color-primary)] text-white font-bold py-3.5 rounded-xl text-sm hover:bg-[var(--color-primary-container)] active:scale-[0.99] cursor-pointer transition-all duration-200 shadow-lg shadow-[var(--color-primary)]/25 hover:shadow-[var(--color-primary)]/40 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading
                ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                : <span className="material-symbols-outlined text-[18px]">{mode === "login" ? "login" : "person_add"}</span>
              }
              {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </button>
          </form>

          <div className="mt-7 text-center text-[var(--color-on-surface-variant)] text-sm">
            {mode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
            <button
              onClick={switchMode}
              type="button"
              className="text-[var(--color-primary)] font-bold hover:text-[var(--color-primary-container)] hover:underline cursor-pointer transition-colors"
            >
              {mode === "login" ? "Regístrate gratis" : "Inicia Sesión"}
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link href="/products" className="text-sm text-[var(--color-outline)] hover:text-[var(--color-on-surface)] font-medium transition-colors">
              Explorar como invitado &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}