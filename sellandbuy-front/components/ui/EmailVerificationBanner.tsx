"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MailWarning, RefreshCw, X } from "lucide-react";

/**
 * Sticky banner shown to authenticated but unverified users.
 * Only renders when firebaseUser exists and emailVerified is false.
 */
export function EmailVerificationBanner() {
  const { firebaseUser, sendVerificationEmail } = useAuth();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Only show for logged-in, unverified email/password users
  // Google-linked accounts are auto-verified — skip the banner for them
  if (!firebaseUser || firebaseUser.emailVerified || dismissed) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await sendVerificationEmail();
      setSent(true);
    } catch {
      // Ignore (e.g., too-many-requests)
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      role="alert"
      className="w-full bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-4 text-amber-900 text-sm"
    >
      <MailWarning size={18} className="flex-shrink-0 text-amber-600" />

      <div className="flex-1 min-w-0">
        <span className="font-semibold">Verifica tu correo</span>
        <span className="hidden sm:inline text-amber-700">
          {" "}— Hemos enviado un enlace a{" "}
          <strong className="font-semibold">{firebaseUser.email}</strong>.
          Verifícalo para poder publicar, comentar y enviar mensajes.
        </span>
      </div>

      {sent ? (
        <span className="text-emerald-700 font-semibold text-xs flex-shrink-0">
          ✓ Correo reenviado
        </span>
      ) : (
        <button
          onClick={handleResend}
          disabled={sending}
          className="flex items-center gap-1.5 text-amber-700 font-semibold hover:text-amber-900 transition-colors flex-shrink-0 disabled:opacity-50"
        >
          <RefreshCw size={14} className={sending ? "animate-spin" : ""} />
          <span className="hidden xs:inline">Reenviar correo</span>
        </button>
      )}

      <button
        onClick={() => setDismissed(true)}
        className="text-amber-500 hover:text-amber-700 transition-colors flex-shrink-0 ml-1"
        aria-label="Cerrar"
      >
        <X size={16} />
      </button>
    </div>
  );
}
