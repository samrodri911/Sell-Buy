"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useMemo } from "react";
import { getProducts } from "@/services/product.service";
import { Product, ProductStatus } from "@/types/product";
import { Loader2, PauseCircle, PlayCircle } from "lucide-react";
import { useProductActions } from "@/hooks/useProducts";
import { MainLayout } from "@/components/layout/MainLayout";

// ─── All original business logic is unchanged ────────────────────
export default function DashboardPage() {
  const { firebaseUser, userProfile, loading: authLoading, logout } = useAuth();
  const { editProduct } = useProductActions();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "all">("all");

  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.replace("/");
    }
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    if (firebaseUser) {
      loadMyProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser]);

  const loadMyProducts = async () => {
    setLoading(true);
    try {
      const { products: fetched } = await getProducts({
        sellerId: firebaseUser!.uid,
        limitNumber: 100,
      });
      setProducts(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeProducts = products.filter((p) => p.status === "active").length;
  const soldProducts = products.filter((p) => p.status === "sold").length;

  // 💰 Real revenue = sum of actually SOLD products
  const realRevenue = products
    .filter((p) => p.status === "sold")
    .reduce((acc, p) => acc + p.price, 0);

  // 📊 Potential revenue = sum of ACTIVE (listed but not yet sold) products
  const potentialRevenue = products
    .filter((p) => p.status === "active")
    .reduce((acc, p) => acc + p.price, 0);

  // Filtered list for the table (driven by tab)
  const filteredProducts = useMemo(() => {
    if (statusFilter === "all") return products;
    return products.filter((p) => p.status === statusFilter);
  }, [products, statusFilter]);

  const toggleStatus = async (product: Product) => {
    const newStatus = product.status === "active" ? "paused" : "active";
    const success = await editProduct(product.id, { status: newStatus });
    if (success) {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };
  // ── End original logic ────────────────────────────────────────

  if (authLoading || (!firebaseUser && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--color-surface]">
        <Loader2 size={40} className="animate-spin text-[--color-primary]" />
      </div>
    );
  }

  const formatCOP = (amount: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(amount);

  const revenueFormatted = formatCOP(realRevenue);
  const potentialFormatted = formatCOP(potentialRevenue);

  return (
    <MainLayout>
      <div className="space-y-10 pt-4">

        {/* ── Dashboard Header ── */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[--color-primary] font-semibold tracking-wider text-xs uppercase">
              Mi Tienda
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-[--color-on-surface] mt-1">
              Hola, {userProfile?.displayName?.split(" ")[0]}
            </h1>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/users/${userProfile?.uid}`}
              className="px-5 py-2.5 bg-[--color-surface-container-high] text-[--color-on-secondary-container] rounded-xl font-medium transition-all hover:bg-[--color-surface-container-highest] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">person</span>
              Ver perfil
            </Link>
            <Link
              href="/products/create"
              className="px-5 py-2.5 bg-[--color-primary] text-[--color-on-primary] rounded-xl font-medium transition-all hover:opacity-90 flex items-center gap-2 shadow-lg shadow-[--color-primary]/20"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Nuevo anuncio
            </Link>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-[--color-error-container] text-[--color-on-error-container] rounded-xl font-medium transition-all hover:opacity-90 hover:cursor-pointer hover:scale-[1.01] flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Salir
            </button>
          </div>
        </section>

        {/* ── Metrics Bento Grid ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Active Products */}
          <div className="bg-[--color-surface-container-lowest] p-8 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[--color-primary-fixed]/30 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110" />
            <p className="text-[--color-on-surface-variant] font-medium text-sm">Publicaciones activas</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[--color-on-surface]">{activeProducts}</span>
              <span className="text-emerald-600 text-sm font-bold">productos</span>
            </div>
            <div className="mt-6 w-full h-1 bg-[--color-surface-container] rounded-full overflow-hidden">
              <div
                className="h-full bg-[--color-primary] rounded-full transition-all duration-700"
                style={{ width: products.length ? `${(activeProducts / products.length) * 100}%` : "0%" }}
              />
            </div>
          </div>

          {/* Sold */}
          <div className="bg-[--color-surface-container-lowest] p-8 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[--color-secondary-container]/20 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110" />
            <p className="text-[--color-on-surface-variant] font-medium text-sm">Total vendidos</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[--color-on-surface]">{soldProducts}</span>
              <span className="text-emerald-600 text-sm font-bold">✓ completados</span>
            </div>
            <div className="mt-6 flex gap-1 items-end h-8">
              {[40, 60, 50, 80, 30].map((h, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-sm ${i === 3 ? "bg-[--color-secondary-container]" : "bg-[--color-secondary-container]/40"}`}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Revenue: Real + Potential */}
          <div className="bg-[--color-surface-container-lowest] p-8 rounded-2xl shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[--color-tertiary-fixed]/30 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110" />
            <p className="text-[--color-on-surface-variant] font-medium text-sm">Ingresos</p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">💰 Reales (vendidos)</p>
                <span className="text-2xl font-bold text-[--color-on-surface]">{revenueFormatted}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[--color-on-surface-variant] uppercase tracking-wider">📊 Potenciales (activos)</p>
                <span className="text-lg font-semibold text-[--color-on-surface-variant]">{potentialFormatted}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Product List ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-[--color-on-surface]">Mis anuncios</h2>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {([
              { key: "all", label: "Todos", count: products.length },
              { key: "active", label: "Activos", count: activeProducts },
              { key: "sold", label: "Vendidos", count: soldProducts },
              { key: "paused", label: "Pausados", count: products.filter(p => p.status === "paused").length },
            ] as const).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${statusFilter === key
                    ? "bg-[--color-primary] text-[--color-on-primary] shadow-sm"
                    : "bg-[--color-surface-container] text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high]"
                  }`}
              >
                {label} <span className="opacity-70">({count})</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-[--color-surface-container-lowest] p-4 rounded-2xl flex items-center gap-6 animate-pulse">
                  <div className="w-20 h-20 rounded-xl skeleton flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 skeleton w-1/2" />
                    <div className="h-3 skeleton w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[--color-surface-container-lowest] rounded-2xl text-center">
              <span className="material-symbols-outlined text-5xl text-[--color-outline] mb-4">filter_list_off</span>
              <p className="text-[--color-on-surface-variant] font-medium text-lg">
                {statusFilter === "all" ? "Aún no tienes productos publicados" : `No tienes productos ${statusFilter === 'active' ? 'activos' : statusFilter === 'sold' ? 'vendidos' : 'pausados'}`}
              </p>
              {statusFilter === "all" && (
                <Link
                  href="/products/create"
                  className="mt-6 px-6 py-2.5 bg-[--color-primary] text-[--color-on-primary] rounded-2xl font-bold shadow-lg shadow-[--color-primary]/20 hover:opacity-90 transition-all"
                >
                  Publicar primer anuncio
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const price = new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: product.currency,
                  maximumFractionDigits: 0,
                }).format(product.price);

                const statusColor =
                  product.status === "active"
                    ? "bg-emerald-100 text-emerald-700"
                    : product.status === "sold"
                      ? "bg-[--color-secondary-fixed] text-[--color-on-secondary-container]"
                      : product.status === "paused"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-[--color-error-container] text-[--color-error]";

                const statusLabel =
                  product.status === "active" ? "Activo" :
                    product.status === "sold" ? "Vendido" :
                      product.status === "paused" ? "Pausado" : "Eliminado";

                return (
                  <div
                    key={product.id}
                    className="bg-[--color-surface-container-lowest] p-4 rounded-2xl shadow-sm flex items-center group transition-all hover:bg-[--color-surface-bright]"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-[--color-surface-container] mr-6 flex-shrink-0">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[--color-outline]">image</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[--color-on-surface] text-lg truncate">
                        {product.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-sm text-[--color-on-surface-variant]">
                          {product.category}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Price / stock */}
                    <div className="text-right mr-8 hidden md:block flex-shrink-0">
                      <p className="text-sm font-bold text-[--color-on-surface]">{price}</p>
                      <p className="text-xs text-[--color-on-surface-variant]">
                        {product.quantity ?? 1} en stock
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        href={`/products/${product.id}`}
                        className="p-2 rounded-xl text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] transition-colors"
                        title="Ver publicación"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </Link>
                      <Link
                        href={`/products/edit/${product.id}`}
                        className="p-2 rounded-xl text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] transition-colors"
                        title="Editar"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </Link>
                      {product.status !== "sold" && product.status !== "deleted" && (
                        <button
                          onClick={() => toggleStatus(product)}
                          className="p-2 rounded-xl text-[--color-on-surface-variant] hover:bg-[--color-surface-container-high] transition-colors"
                          title={product.status === "active" ? "Pausar" : "Activar"}
                        >
                          {product.status === "active" ? (
                            <PauseCircle size={22} />
                          ) : (
                            <PlayCircle size={22} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
