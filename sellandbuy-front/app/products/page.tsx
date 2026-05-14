"use client"
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProducts, searchProducts } from '@/services/product.service';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/types/product';
import { MainLayout } from '@/components/layout/MainLayout';
import { SkeletonList } from '@/components/ui/Skeleton';

const CATEGORIES = [
  { id: '', label: 'Todo' },
  { id: 'Electronics', label: 'Electrónica' },
  { id: 'Vehicles', label: 'Vehículos' },
  { id: 'Real Estate', label: 'Inmuebles' },
  { id: 'Home', label: 'Hogar' },
  { id: 'Fashion', label: 'Moda' },
  { id: 'Other', label: 'Otros' }
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Persist state via URL
  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'recent';
  const searchQuery = searchParams.get('q') || '';
  const isSearchMode = searchQuery.trim().length > 0;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update URL params without full page reload
  const updateQuery = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/products?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        let sortedProducts: Product[];

        if (isSearchMode) {
          // 🔍 Search mode: use title_lowercase prefix search
          sortedProducts = await searchProducts(searchQuery);
        } else {
          const queryOpts = currentCategory ? { category: currentCategory } : {};
          const result = await getProducts(queryOpts);

          // Helper robusto para obtener milisegundos de cualquier formato de fecha
          const getMillis = (date: any) => {
            if (!date) return 0;
            if (typeof date.toMillis === 'function') return date.toMillis();
            if (date.seconds) return date.seconds * 1000;
            if (date instanceof Date) return date.getTime();
            if (typeof date === 'string') return new Date(date).getTime();
            if (typeof date === 'number') return date;
            return 0;
          };

          sortedProducts = [...result.products];
          if (currentSort === 'price_asc') {
            sortedProducts.sort((a, b) => a.price - b.price);
          } else if (currentSort === 'price_desc') {
            sortedProducts.sort((a, b) => b.price - a.price);
          } else {
            sortedProducts.sort((a, b) => getMillis(b.createdAt) - getMillis(a.createdAt));
          }
        }

        setProducts(sortedProducts);
      } catch (err: any) {
        console.error(err);
        if (err?.message?.includes('index') || err?.code === 'failed-precondition') {
          setError('Configurando base de datos. Por favor intenta más tarde.');
        } else {
          setError('Ocurrió un error al cargar los productos. Por favor recarga la página.');
        }
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [currentCategory, currentSort, searchQuery, isSearchMode]);

  return (
    <MainLayout>
      <div className="flex flex-col gap-8">
        
        {/* Header & Filters */}
        <div className="flex flex-col gap-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              {isSearchMode ? (
                <>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--color-on-surface)]">
                    Resultados
                  </h1>
                  <p className="text-[var(--color-on-surface-variant)] mt-1 text-sm md:text-base">
                    Buscando: <span className="font-semibold text-[var(--color-on-surface)]">&ldquo;{searchQuery}&rdquo;</span>
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--color-on-surface)]">
                    Descubre
                  </h1>
                  <p className="text-[var(--color-on-surface-variant)] mt-1 text-sm md:text-base">
                    Encuentra exactamente lo que estás buscando
                  </p>
                </>
              )}
            </div>

            {/* Sort Dropdown: Only show when not in search mode */}
            {!isSearchMode && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--color-on-surface-variant)] hidden sm:inline ">Ordenar por:</span>
                <select 
                  value={currentSort}
                  onChange={(e) => updateQuery('sort', e.target.value)}
                  className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] px-4 py-2.5 rounded-xl text-sm font-semibold hover:border-[var(--color-outline)] transition-colors shadow-sm outline-none appearance-none cursor-pointer"
                > 
                  <option value="recent">Más recientes</option>
                  <option value="price_asc">Menor precio</option>
                  <option value="price_desc">Mayor precio</option>
                </select>
              </div>
            )}
          </div>

          {/* Category Chips: hidden in search mode */}
          {!isSearchMode && (
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 hide-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id || 'all'}
                  onClick={() => updateQuery('category', cat.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                    currentCategory === cat.id 
                      ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-md' 
                      : 'bg-[var(--color-surface)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Grid */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--color-error-container)] rounded-3xl border border-[var(--color-error)]/20">
            <span className="material-symbols-outlined text-[var(--color-error)] text-5xl mb-3">error</span>
            <p className="text-[var(--color-on-error-container)] font-semibold text-lg">Error al cargar</p>
            <p className="text-[var(--color-on-error-container)]/80 text-sm max-w-md text-center mt-1">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-6 text-[var(--color-error)] font-medium hover:underline text-sm">
              Intentar nuevamente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {loading ? (
              <SkeletonList count={10} />
            ) : products.length > 0 ? (
              products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-24 bg-[var(--color-surface-container)] rounded-3xl border border-dashed border-[var(--color-outline-variant)]">
                <span className="material-symbols-outlined text-[var(--color-outline-variant)] text-6xl mb-4">
                  {isSearchMode ? 'manage_search' : 'search_off'}
                </span>
                {isSearchMode ? (
                  <>
                    <p className="text-[var(--color-on-surface-variant)] font-medium text-lg">Sin resultados para &ldquo;{searchQuery}&rdquo;</p>
                    <p className="text-[var(--color-outline)] text-sm mt-1">Intenta con otro término de búsqueda</p>
                    <button
                      onClick={() => router.push('/products')}
                      className="mt-4 text-[--color-primary] font-medium hover:underline text-sm"
                    >
                      Ver todos los productos
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-[var(--color-on-surface-variant)] font-medium text-lg">No encontramos productos</p>
                    <p className="text-[var(--color-outline)] text-sm mt-1">Prueba quitando algunos filtros</p>
                    {currentCategory && (
                      <button onClick={() => updateQuery('category', '')} className="mt-4 text-[--color-primary] font-medium hover:underline text-sm">
                        Ver todos los productos
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function ProductsPage() {
  return (
    <React.Suspense fallback={
      <MainLayout>
        <div className="flex flex-col gap-8 pt-4">
          <SkeletonList count={10} />
        </div>
      </MainLayout>
    }>
      <ProductsContent />
    </React.Suspense>
  );
}
