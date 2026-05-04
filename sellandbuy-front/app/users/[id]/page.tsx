"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { getUserProfile, updateUserProfile } from "@/lib/services/user.service";
import { getProducts } from "@/services/product.service";
import { UserProfile } from "@/types/user";
import { Product } from "@/types/product";
import { MainLayout } from "@/components/layout/MainLayout";
import { SellerInsightsCard } from "@/components/ui/SellerInsightsCard";
import { ReviewSnippet } from "@/components/ui/ReviewSnippet";

// ─── Types ────────────────────────────────────────────────────────
type ActiveTab = "listings" | "sold" | "reviews";

// ─── Skeleton ─────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 pt-8 pb-32 animate-pulse">
      {/* Hero skeleton */}
      <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
        <div className="w-36 h-36 rounded-3xl skeleton" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-8 skeleton w-64" />
          <div className="h-4 skeleton w-48" />
          <div className="flex gap-3 pt-2">
            <div className="h-10 skeleton w-36 rounded-2xl" />
            <div className="h-10 skeleton w-36 rounded-2xl" />
          </div>
        </div>
      </div>
      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-3xl overflow-hidden">
            <div className="h-64 skeleton" />
            <div className="p-5 space-y-2">
              <div className="h-5 skeleton w-3/4" />
              <div className="h-3 skeleton w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Inline profile product card ──────────────────────────────────
function ProfileProductCard({ product }: { product: Product }) {
  const price = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price);

  const imageUrl =
    product.images[0] ?? "https://via.placeholder.com/400x400?text=Sin+imagen";

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-[--color-surface-container-lowest] rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[--color-primary]/5 block"
    >
      <div className="relative h-64 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Price badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-[--color-primary] shadow-sm">
          {price}
        </div>
        {/* Condition badge */}
        <div className="absolute bottom-4 left-4">
          <span className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider text-slate-900 uppercase">
            {product.condition === "new" ? "Nuevo" : "Usado"}
          </span>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg mb-1 text-[--color-on-surface] group-hover:text-[--color-primary] transition-colors line-clamp-1">
          {product.title}
        </h3>
        <p className="text-[--color-on-surface-variant] text-sm mb-4 line-clamp-1">
          {product.description}
        </p>
        <div className="flex justify-between items-center">
          <span
            className={`text-xs px-2 py-1 rounded-md font-medium ${product.status === "active"
              ? "bg-emerald-100 text-emerald-700"
              : product.status === "sold"
                ? "bg-[--color-secondary-fixed] text-[--color-on-secondary-container]"
                : "bg-amber-100 text-amber-700"
              }`}
          >
            {product.status === "active"
              ? "Activo"
              : product.status === "sold"
                ? "Vendido"
                : "Pausado"}
          </span>
          <button className="text-[--color-primary] p-2 hover:bg-[--color-primary]/5 rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
          </button>
        </div>
      </div>
    </Link>
  );
}

// ─── Edit form (unchanged logic, new visual) ──────────────────────
interface EditFormProps {
  editName: string;
  editBio: string;
  saving: boolean;
  onNameChange: (v: string) => void;
  onBioChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function EditForm({
  editName,
  editBio,
  saving,
  onNameChange,
  onBioChange,
  onSave,
  onCancel,
}: EditFormProps) {
  return (
    <div className="space-y-4 max-w-lg">
      <input
        type="text"
        value={editName}
        onChange={(e) => onNameChange(e.target.value)}
        className="w-full text-2xl font-bold px-4 py-3 bg-[--color-surface-container-highest] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[--color-primary]/20 transition-all text-[--color-on-surface]"
        placeholder="Nombre visible"
      />
      <textarea
        value={editBio}
        onChange={(e) => onBioChange(e.target.value)}
        className="w-full px-4 py-3 bg-[--color-surface-container-highest] border-none rounded-2xl outline-none focus:ring-2 focus:ring-[--color-primary]/20 transition-all resize-none text-[--color-on-surface]"
        rows={3}
        placeholder="Escribe algo sobre ti..."
      />
      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 bg-gradient-to-r from-[--color-primary] to-[--color-primary-container] text-[--color-on-primary] px-6 py-2.5 rounded-2xl font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          {saving ? (
            <span className="material-symbols-outlined text-[18px] animate-spin">
              progress_activity
            </span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">check</span>
          )}
          Guardar
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-2 bg-[--color-surface-container-high] text-[--color-on-secondary-container] px-6 py-2.5 rounded-2xl font-semibold hover:bg-[--color-surface-container-highest] active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────
function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="group relative py-2 cursor-pointer">
      <span
        className={`text-lg font-bold transition-colors ${active
          ? "text-[--color-primary]"
          : "text-[--color-on-surface-variant] hover:text-[--color-on-surface]"
          }`}
      >
        {label}
      </span>
      <span
        className={`absolute bottom-0 left-0 h-1 bg-[--color-primary] rounded-full transition-all duration-300 ${active ? "w-full" : "w-0 group-hover:w-full"
          }`}
      />
    </button>
  );
}

// ─── Empty state ──────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-2 flex flex-col items-center justify-center py-20 text-center bg-[--color-surface-container-lowest] rounded-3xl shadow-sm">
      <div className="w-20 h-20 bg-[--color-surface-container] rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-[--color-outline]">
          inventory_2
        </span>
      </div>
      <p className="text-[--color-on-surface-variant] text-lg font-medium">{message}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function UserProfilePage() {
  // ── All original logic preserved ──────────────────────────────
  const params = useParams();
  const userId = params.id as string;
  const { firebaseUser, refreshProfile } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>("listings");

  const isOwner = firebaseUser?.uid === userId;

  useEffect(() => {
    if (!userId) return;
    async function load() {
      try {
        const [userProf, prodResult] = await Promise.all([
          getUserProfile(userId),
          getProducts({ sellerId: userId }),
        ]);
        setProfile(userProf);
        setEditName(userProf.displayName);
        setEditBio(userProf.bio || "");
        setProducts(prodResult.products);
      } catch {
        setError("Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const handleSave = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      const updated = await updateUserProfile(userId, {
        displayName: editName,
        bio: editBio,
      });
      setProfile(updated);
      setIsEditing(false);
      if (isOwner) await refreshProfile();
    } catch {
      alert("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };
  // ── End original logic ────────────────────────────────────────

  // Derived data
  const activeListings = products.filter((p) => p.status === "active");
  const soldItems = products.filter((p) => p.status === "sold");
  const memberSince = profile?.createdAt?.toDate?.()?.getFullYear?.() ?? new Date().getFullYear();

  // ── Loading state ─────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout>
        <ProfileSkeleton />
      </MainLayout>
    );
  }

  // ── Error / not found ─────────────────────────────────────────
  if (error || !profile) {
    return (
      <MainLayout>
        <div className="max-w-screen-xl mx-auto px-6 pt-24 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-[--color-error-container] rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-[--color-error]">
              person_off
            </span>
          </div>
          <h2 className="text-2xl font-bold text-[--color-on-surface] mb-2">
            Usuario no encontrado
          </h2>
          <p className="text-[--color-on-surface-variant] mb-8">
            Este perfil no existe o fue eliminado.
          </p>
          <Link
            href="/products"
            className="bg-gradient-to-r from-[--color-primary] to-[--color-primary-container] text-[--color-on-primary] px-6 py-3 rounded-2xl font-bold shadow-lg hover:opacity-90 transition-all"
          >
            Explorar productos
          </Link>
        </div>
      </MainLayout>
    );
  }

  // ── Main render ───────────────────────────────────────────────
  return (
    <MainLayout>
      <div className="space-y-10 pt-4">

        {/* ── Hero Section ── */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8 relative">

            {/* Avatar with glow ring */}
            <div className="relative group flex-shrink-0">
              <div
                className="absolute -inset-1 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-700"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, var(--color-primary), var(--color-primary-container))`,
                }}
              />
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-[--color-surface-container-lowest] shadow-xl">
                <Image
                  src={
                    profile.photoURL ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName)}&background=004ac6&color=fff&size=160`
                  }
                  alt={profile.displayName}
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <EditForm
                  editName={editName}
                  editBio={editBio}
                  saving={saving}
                  onNameChange={setEditName}
                  onBioChange={setEditBio}
                  onSave={handleSave}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <>
                  {/* Name + badge */}
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[--color-on-surface]">
                        {profile.displayName}
                      </h1>
                      {profile.isVerified && (
                        <span className="flex items-center gap-1 bg-[--color-primary-fixed] text-[--color-on-primary-fixed] px-3 py-1 rounded-full text-sm font-semibold">
                          <span
                            className="material-symbols-outlined text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            verified
                          </span>
                          Verificado
                        </span>
                      )}
                    </div>

                    {/* Rating + membership */}
                    <div className="flex flex-wrap items-center gap-4 text-[--color-on-surface-variant]">
                      <div className="flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-[--color-tertiary]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="font-bold text-[--color-on-surface]">
                          {profile.sellerRating
                            ? profile.sellerRating.toFixed(1)
                            : "Nuevo"}
                        </span>
                        <span className="text-sm">
                          ({profile.sellerRatingCount || 0} reseñas)
                        </span>
                      </div>
                      <span className="text-[--color-outline-variant]">•</span>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        <span className="text-sm">Miembro desde {memberSince}</span>
                      </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-[--color-on-surface-variant] mt-3 max-w-xl leading-relaxed whitespace-pre-wrap">
                        {profile.bio}
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-3">
                    {isOwner && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-[--color-primary] to-[--color-primary-container] text-[--color-on-primary] px-6 py-2.5 rounded-2xl font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Editar Perfil
                      </button>
                    )}
                    <button
                      className="flex items-center gap-2 bg-[--color-surface-container-high] text-[--color-on-secondary-container] px-6 py-2.5 rounded-2xl font-semibold hover:bg-[--color-surface-container-highest] active:scale-95 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Compartir perfil
                    </button>
                  </div>
                </>
              )}
            </div>
            {/* Stats bento — desktop only */}
            <div className="hidden lg:grid grid-cols-2 gap-4 w-64 flex-shrink-0">
              <div className="bg-[--color-surface-container-low] p-4 rounded-2xl text-center">
                <p className="text-2xl font-bold text-[--color-primary]">{soldItems.length}</p>
                <p className="text-xs font-medium text-[--color-on-surface-variant] uppercase tracking-wider mt-1">
                  Vendidos
                </p>
              </div>
              <div className="bg-[--color-surface-container-low] p-4 rounded-2xl text-center">
                <p className="text-2xl font-bold text-[--color-primary]">{activeListings.length}</p>
                <p className="text-xs font-medium text-[--color-on-surface-variant] uppercase tracking-wider mt-1">
                  Activos
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Tabs ── */}
        <nav className="flex gap-8 mb-8 border-b border-[--color-outline-variant]/30">
          <TabButton
            label="Publicaciones activas"
            active={activeTab === "listings"}
            onClick={() => setActiveTab("listings")}
          />
          <TabButton
            label="Vendidos"
            active={activeTab === "sold"}
            onClick={() => setActiveTab("sold")}
          />
          <TabButton
            label="Reseñas"
            active={activeTab === "reviews"}
            onClick={() => setActiveTab("reviews")}
          />
        </nav>

        {/* ── Asymmetric content grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Main content (8 cols) */}
          <div className="md:col-span-8 space-y-8">

            {/* Tab: Active Listings */}
            {activeTab === "listings" && (
              <>
                {activeListings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {activeListings.map((product) => (
                      <ProfileProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <EmptyState message="Este vendedor aún no tiene publicaciones activas." />
                  </div>
                )}
              </>
            )}

            {/* Tab: Sold Items */}
            {activeTab === "sold" && (
              <>
                {soldItems.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {soldItems.map((product) => (
                      <ProfileProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6">
                    <EmptyState message="Aún no hay artículos vendidos." />
                  </div>
                )}
              </>
            )}

            {/* Tab: Reviews */}
            {activeTab === "reviews" && (
              <div className="grid grid-cols-2 gap-6">
                <EmptyState message="Aún no hay reseñas para este vendedor." />
              </div>
            )}

            {/* About the Curator section */}
            {!isEditing && profile.bio && (
              <div className="pt-12 pb-4">
                <h3 className="text-2xl font-extrabold tracking-tight mb-3 pl-4 border-l-4 border-[--color-primary] text-[--color-on-surface]">
                  Acerca del vendedor
                </h3>
                <p className="text-[--color-on-surface-variant] leading-relaxed max-w-2xl whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar (4 cols) */}
          <div className="md:col-span-4 space-y-6">
            <SellerInsightsCard
              responseRate={profile.reputation ?? 80}
              memberSince={memberSince}
            />

            {profile.sellerRatingCount > 0 && (
              <ReviewSnippet
                rating={profile.sellerRating}
                text="Gran vendedor, muy atento y rápido con el envío. Totalmente recomendado."
                reviewerName="Cliente verificado"
              />
            )}

            {/* Dashboard shortcut for owner */}
            {isOwner && (
              <Link
                href="/dashboard"
                className="flex items-center gap-3 p-4 bg-[--color-surface-container-low] rounded-2xl hover:bg-[--color-surface-container] transition-colors"
              >
                <span className="material-symbols-outlined text-[--color-primary]">
                  dashboard
                </span>
                <div>
                  <p className="text-sm font-bold text-[--color-on-surface]">Mi Dashboard</p>
                  <p className="text-xs text-[--color-on-surface-variant]">Gestionar mis anuncios</p>
                </div>
                <span className="material-symbols-outlined text-[--color-outline] ml-auto">
                  chevron_right
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
