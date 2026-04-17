"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getProducts } from "@/services/product.service";
import { Product } from "@/types/product";
import { Loader2, Package, CheckCircle, TrendingUp, Star, Edit, Plus, PauseCircle, PlayCircle, Eye } from "lucide-react";
import { useProductActions } from "@/hooks/useProducts";

export default function DashboardPage() {
  const { firebaseUser, userProfile, loading: authLoading, logout } = useAuth();
  const { editProduct } = useProductActions();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !firebaseUser) {
      router.replace("/");
    }
  }, [authLoading, firebaseUser, router]);

  useEffect(() => {
    if (firebaseUser) {
      loadMyProducts();
    }
  }, [firebaseUser]);

  const loadMyProducts = async () => {
    setLoading(true);
    try {
      const { products: fetched } = await getProducts({ sellerId: firebaseUser!.uid, limitNumber: 100 });
      setProducts(fetched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeProducts = products.filter(p => p.status === 'active').length;
  const soldProducts = products.filter(p => p.status === 'sold').length;
  const estimatedRevenue = products.filter(p => p.status === 'sold').reduce((acc, p) => acc + p.price, 0);

  const toggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'paused' : 'active';
    const success = await editProduct(product.id, { status: newStatus });
    if (success) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    }
  };

  if (authLoading || (!firebaseUser && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 size={48} className="animate-spin text-amber-500" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header Profile */}
        <div className="bg-white rounded-3xl p-8 border border-neutral-100 flex flex-col md:flex-row items-center justify-between shadow-sm gap-6">
          <div className="flex items-center gap-6">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-amber-100" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-3xl font-black">
                {userProfile?.displayName?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-neutral-900 leading-tight">
                Hola, {userProfile?.displayName}
              </h1>
              <p className="text-neutral-500">{userProfile?.email}</p>

              <div className="mt-2 flex gap-4 text-sm font-semibold text-neutral-600">
                <span className="flex items-center gap-1 text-amber-500">
                  <Star fill="currentColor" size={16} />
                  {userProfile?.sellerRating ? userProfile.sellerRating.toFixed(1) : 'Nuevo'}
                </span>
                <span>{userProfile?.sellerRatingCount || 0} reseñas</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <Link href={`/users/${userProfile?.uid}`} className="flex-1 md:flex-none text-center bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold py-3 px-6 rounded-xl transition-colors">
              Ver perfil público
            </Link>
            <button onClick={handleLogout} className="flex-1 md:flex-none text-center bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-6 rounded-xl transition-colors border border-red-100">
              Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-indigo-200 font-semibold mb-1 block tracking-wide">ACTIVOS</span>
              <div className="text-4xl font-black">{activeProducts}</div>
            </div>
            <Package size={80} className="absolute -bottom-4 -right-4 text-white opacity-10" />
          </div>

          <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-emerald-100 font-semibold mb-1 block tracking-wide">VENDIDOS</span>
              <div className="text-4xl font-black">{soldProducts}</div>
            </div>
            <CheckCircle size={80} className="absolute -bottom-4 -right-4 text-white opacity-10" />
          </div>

          <div className="bg-neutral-900 rounded-3xl p-6 text-white shadow-lg shadow-neutral-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <span className="text-neutral-400 font-semibold mb-1 block tracking-wide">INGRESOS ES.</span>
              <div className="text-3xl font-black">
                ${new Intl.NumberFormat('es-CO').format(estimatedRevenue)}
              </div>
            </div>
            <TrendingUp size={80} className="absolute -bottom-4 -right-4 text-white opacity-5" />
          </div>
        </div>

        {/* My Products Table */}
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
            <h2 className="text-xl font-bold text-neutral-900">Mis Anuncios</h2>
            <Link href="/products/create" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
              <Plus size={18} /> Nuevo Anuncio
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-neutral-100 text-sm text-neutral-400">
                  <th className="p-4 font-semibold w-16">Foto</th>
                  <th className="p-4 font-semibold">Producto</th>
                  <th className="p-4 font-semibold">Precio / Stock</th>
                  <th className="p-4 font-semibold text-center">Estado</th>
                  <th className="p-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-neutral-400"><Loader2 className="animate-spin mx-auto" /></td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-neutral-400 font-medium">Aún no tienes productos publicados</td></tr>
                ) : (
                  products.map(product => (
                    <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden border border-neutral-200">
                          {product.images[0] ? (
                            <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 m-3 text-neutral-300" />
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-neutral-900 line-clamp-1">{product.title}</div>
                        <div className="text-xs text-neutral-500 flex items-center gap-2 mt-1">
                          {product.ratingCount > 0 && <span className="flex items-center text-amber-500"><Star size={12} fill="currentColor" className="mr-0.5" /> {product.rating.toFixed(1)}</span>}
                          {product.views} vistas
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-neutral-800">${new Intl.NumberFormat('es-CO').format(product.price)}</div>
                        <div className="text-xs text-neutral-400 font-medium">Stock: {product.quantity ?? 1}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize 
                            ${product.status === 'active' ? 'bg-green-100 text-green-700' :
                            product.status === 'sold' ? 'bg-indigo-100 text-indigo-700' :
                              product.status === 'paused' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Link href={`/products/${product.id}`} className="p-2 text-neutral-400 hover:text-indigo-600 hover:bg-neutral-100 rounded-lg transition-colors" title="Ver publicación">
                            <Eye size={18} />
                          </Link>
                          <Link href={`/products/edit/${product.id}`} className="p-2 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Editar">
                            <Edit size={18} />
                          </Link>
                          {product.status !== 'sold' && product.status !== 'deleted' && (
                            <button onClick={() => toggleStatus(product)} className="p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200 rounded-lg transition-colors" title={product.status === 'active' ? 'Pausar' : 'Activar'}>
                              {product.status === 'active' ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
