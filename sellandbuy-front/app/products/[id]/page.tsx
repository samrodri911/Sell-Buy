"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProductById } from '@/services/product.service';
import { Product } from '@/types/product';
import { MainLayout } from '@/components/layout/MainLayout';
import { ContactSellerButton } from '@/components/chat/ContactSellerButton';
import { ProductComments } from '@/components/products/ProductComments';
import { useAuth } from '@/hooks/useAuth';
import { useProductActions } from '@/hooks/useProducts';
import { useFavorites } from '@/hooks/useFavorites';
import { copyProductLink } from '@/lib/share';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const { firebaseUser } = useAuth();
  const { editProduct } = useProductActions();
  const { toggleFavorite, isFavorite, isLoading: isFavLoading } = useFavorites();

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(id);
        if (data) {
          setProduct(data);
          setActiveImage(data.images[0] || '');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  const handleShare = async () => {
    const success = await copyProductLink(id);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleFavorite = async () => {
    await toggleFavorite(id);
  };

  const isFav = isFavorite(id);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col gap-8 animate-pulse pt-4">
          <div className="h-4 bg-[var(--color-surface-container-high)] rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 aspect-square bg-[var(--color-surface-container-high)] rounded-3xl"></div>
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="h-10 bg-[var(--color-surface-container-high)] rounded w-3/4"></div>
              <div className="h-8 bg-[var(--color-surface-container-high)] rounded w-1/2"></div>
              <div className="h-32 bg-[var(--color-surface-container-high)] rounded w-full mt-4"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[var(--color-outline)] text-6xl mb-4">search_off</span>
          <h2 className="text-2xl font-bold text-[var(--color-on-surface)]">Producto no encontrado</h2>
          <p className="text-[var(--color-on-surface-variant)] mt-2">Puede que haya sido eliminado o el enlace sea incorrecto.</p>
          <Link href="/products" className="mt-6 text-[--color-primary] font-semibold hover:underline">
            Volver al inicio
          </Link>
        </div>
      </MainLayout>
    );
  }

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: product.currency,
    maximumFractionDigits: 0
  }).format(product.price);

  const isOwner = firebaseUser?.uid === product.sellerId;

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto permanentemente de la vista pública?')) return;
    const success = await editProduct(product.id, { status: 'deleted' });
    if (success) {
      router.push('/products');
    } else {
      alert("Error al eliminar el producto");
    }
  };

  // Simulated trust elements (could be fetched from real user profile later)
  const sellerResponseTime = "Usualmente responde en 1 hora";

  return (
    <MainLayout hideBottomNav={true}> {/* Hide bottom nav to make room for fixed CTA */}
      <div className="flex flex-col gap-6 pt-2 pb-24 lg:pb-8 relative">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm font-medium text-[var(--color-on-surface-variant)] overflow-x-auto whitespace-nowrap hide-scrollbar">
          <Link href="/products" className="hover:text-[--color-primary] transition-colors">Inicio</Link>
          <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-[--color-primary] transition-colors capitalize">
            {product.category || 'Categoría'}
          </Link>
          <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
          <span className="text-[var(--color-on-surface)] truncate max-w-[200px]">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Gallery Section */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-[var(--color-surface)] rounded-[32px] overflow-hidden aspect-square border border-[var(--color-outline-variant)] flex items-center justify-center p-2 shadow-sm">
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeImage} alt={product.title} className="w-full h-full object-contain rounded-[24px]" />
              ) : (
                <div className="flex flex-col items-center text-[var(--color-outline)] gap-2">
                  <span className="material-symbols-outlined text-4xl">image_not_supported</span>
                  <span>Sin imagen</span>
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === img ? 'border-[--color-primary] shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} className="w-full h-full object-cover" alt={`Miniatura ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Main Info Block */}
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
                  {product.condition === 'new' ? 'Nuevo' : 'Usado'} {product.quantity ? `· ${product.quantity} disponibles` : ''}
                </span>
                <div className="flex gap-1 text-[var(--color-on-surface-variant)] relative">
                  <button 
                    onClick={handleShare}
                    className={`p-2 hover:bg-[var(--color-surface-container)] rounded-full transition-colors ${isCopied ? 'text-[--color-primary]' : ''}`} 
                    aria-label="Compartir"
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {isCopied ? "check" : "share"}
                    </span>
                  </button>
                  {isCopied && (
                    <div className="absolute top-10 right-10 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg z-10">
                      Enlace copiado
                    </div>
                  )}
                  <button 
                    onClick={handleFavorite}
                    disabled={isFavLoading}
                    className={`p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors disabled:opacity-50 ${isFav ? 'text-red-500' : ''}`} 
                    aria-label={isFav ? "Quitar de favorito" : "Guardar favorito"}
                  >
                    <span className={`material-symbols-outlined text-[22px] ${isFav ? 'font-variation-fill' : ''}`}>
                      favorite
                    </span>
                  </button>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)] leading-snug mb-2">
                {product.title}
              </h1>

              <div className="text-4xl font-black text-[var(--color-on-surface)] mb-6 tracking-tight">
                {formattedPrice}
              </div>

              {/* Badges/Info Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="flex items-center gap-1.5 text-sm font-medium text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Compra segura
                </div>
                {product.location?.city && (
                  <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-on-surface)] bg-[var(--color-surface-container)] px-3 py-1.5 rounded-lg">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {product.location.city}, {product.location.country}
                  </div>
                )}
              </div>
            </div>

            <hr className="border-[var(--color-outline-variant)]" />

            {/* Seller Trust Elements */}
            <div className="flex flex-col gap-4">
              <h3 className="text-lg font-bold text-[var(--color-on-surface)]">Información del vendedor</h3>
              <Link href={`/users/${product.sellerId}`} className="group flex items-center justify-between p-4 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl hover:border-[--color-primary]/30 hover:shadow-md transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 flex items-center justify-center overflow-hidden">
                    {product.sellerPhoto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.sellerPhoto} alt={product.sellerName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-indigo-700 text-xl font-bold">{product.sellerName?.charAt(0) || '?'}</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="font-bold text-[var(--color-on-surface)] text-lg flex items-center gap-1.5">
                      {product.sellerName}
                      <span className="material-symbols-outlined text-blue-500 text-[18px]" title="Vendedor verificado">new_releases</span>
                    </div>
                    <div className="text-sm text-[var(--color-on-surface-variant)] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {sellerResponseTime}
                    </div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[var(--color-outline)] group-hover:text-[--color-primary] transition-colors">chevron_right</span>
              </Link>
            </div>

            <hr className="border-[var(--color-outline-variant)]" />

            {/* Description Block */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-bold text-[var(--color-on-surface)]">Descripción</h3>
              <p className="text-[var(--color-on-surface-variant)] whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {product.description}
              </p>
            </div>

            {/* Desktop CTA (Hidden on Mobile) */}
            <div className="hidden lg:flex flex-col gap-4 mt-4">
              {isOwner ? (
                <div className="flex gap-4">
                  <Link href={`/products/edit/${product.id}`} className="flex-1 text-center bg-[var(--color-inverse-surface)] hover:opacity-90 text-[var(--color-inverse-on-surface)] font-bold py-4 rounded-2xl transition-colors">
                    Editar producto
                  </Link>
                  <button onClick={handleDelete} className="px-6 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-colors border border-red-200">
                    Eliminar
                  </button>
                </div>
              ) : (
                <ContactSellerButton productId={product.id} sellerId={product.sellerId} />
              )}
            </div>
            
            <hr className="border-[var(--color-outline-variant)] my-4" />

            {/* Q&A / Comments */}
            <ProductComments productId={product.id} sellerId={product.sellerId} />

          </div>
        </div>
      </div>

      {/* Mobile Fixed CTA (Fitts's Law - Anchored at Bottom) */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full p-4 bg-[var(--color-surface)]/90 backdrop-blur-md border-t border-[var(--color-outline-variant)] z-40 pb-safe">
        {isOwner ? (
          <Link href={`/products/edit/${product.id}`} className="flex w-full items-center justify-center bg-[var(--color-inverse-surface)] text-[var(--color-inverse-on-surface)] font-bold py-3.5 rounded-xl shadow-lg hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined mr-2">edit</span>
            Editar producto
          </Link>
        ) : (
          <ContactSellerButton productId={product.id} sellerId={product.sellerId} />
        )}
      </div>
    </MainLayout>
  );
}
