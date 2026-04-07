"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function DashboardPage() {
  const { firebaseUser, userProfile, loading, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace("/");
    }
  }, [loading, firebaseUser, router]);

  if (!loading && !firebaseUser) {
    return null;
  }

  if (loading) {
    return (
      <main style={styles.container}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Cargando tu perfil...</p>
        </div>
      </main>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        {/* Avatar */}
        <div style={styles.avatarSection}>
          {userProfile?.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt="Avatar"
              width={80}
              height={80}
              style={styles.avatar}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {(userProfile?.displayName || firebaseUser?.email || "?")
                .charAt(0)
                .toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info */}
        <div style={styles.infoSection}>
          <h1 style={styles.greeting}>
            ¡Hola, {userProfile?.displayName || "Usuario"}! 👋
          </h1>
          <p style={styles.email}>{userProfile?.email || firebaseUser?.email}</p>
        </div>

        {/* Profile Details */}
        <div style={styles.details}>
          <DetailRow label="UID" value={userProfile?.uid || "—"} />
          <DetailRow label="Rol" value={userProfile?.role || "—"} />
          <DetailRow
            label="Verificado"
            value={userProfile?.isVerified ? "✅ Sí" : "❌ No"}
          />
          <DetailRow
            label="Reputación"
            value={String(userProfile?.reputation ?? 0)}
          />
          <DetailRow
            label="Creado"
            value={
              userProfile?.createdAt?.toDate
                ? userProfile.createdAt.toDate().toLocaleDateString("es-MX")
                : "—"
            }
          />
        </div>

        {/* Navigation */}
        <div style={styles.navSection}>
          <Link href="/messages" style={styles.navBtn}>
            📬 Mis Mensajes
          </Link>
          <Link href="/products" style={styles.navBtn}>
            🛒 Ver Productos
          </Link>
          <Link href="/products/create" style={styles.navBtnPrimary}>
            ➕ Publicar Producto
          </Link>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} style={styles.logoutBtn}>
          Cerrar Sesión
        </button>

        <p style={styles.footnote}>
          ✅ Auth + Firestore funcionando correctamente
        </p>
      </div>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value}</span>
    </div>
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
    maxWidth: "460px",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "20px",
    padding: "2.5rem 2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    alignItems: "center",
  },
  avatarSection: { display: "flex", justifyContent: "center" },
  avatar: {
    borderRadius: "50%",
    border: "3px solid rgba(139,92,246,0.5)",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2rem",
    fontWeight: 700,
    color: "#fff",
  },
  infoSection: { textAlign: "center" },
  greeting: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#fff",
    margin: 0,
  },
  email: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.875rem",
    marginTop: "0.25rem",
  },
  details: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "14px",
    padding: "1rem",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "0.4rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  detailLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: "0.8rem",
    fontWeight: 500,
  },
  detailValue: {
    color: "rgba(255,255,255,0.85)",
    fontSize: "0.8rem",
    fontWeight: 500,
    maxWidth: "60%",
    textAlign: "right",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    width: "100%",
    padding: "0.8rem",
    borderRadius: "12px",
    border: "1px solid rgba(239,68,68,0.3)",
    background: "rgba(239,68,68,0.1)",
    color: "#fca5a5",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  footnote: {
    color: "rgba(255,255,255,0.3)",
    fontSize: "0.75rem",
    textAlign: "center",
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
  navSection: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  navBtn: {
    display: "block",
    width: "100%",
    padding: "0.8rem",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    transition: "all 0.2s",
  },
  navBtnPrimary: {
    display: "block",
    width: "100%",
    padding: "0.8rem",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "center",
    textDecoration: "none",
    transition: "all 0.2s",
  },
};
