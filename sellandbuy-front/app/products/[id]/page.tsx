"use client"
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getProductById } from '../../../services/product.service';
import { Product } from '../../../types/product';
import { Loader2, MapPin, Package, Heart, Share2, ShieldCheck, MessageCircle, Edit, Trash2, Star } from 'lucide-react';
import { ContactSellerButton } from '../../../components/chat/ContactSellerButton';
import { ProductComments } from '../../../components/products/ProductComments';
import { useAuth } from '../../../hooks/useAuth';
import { useProductActions } from '../../../hooks/useProducts';
import { useRouter } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string>('');

  const { firebaseUser } = useAuth();
  const { editProduct } = useProductActions();
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 size={48} className="animate-spin text-amber-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 flex-col">
        <h2 className="text-2xl font-bold text-neutral-800">Producto no encontrado</h2>
        <p className="text-neutral-500 mt-2">Puede que haya sido eliminado o el link es incorrecto.</p>
      </div>
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

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Gallery Section */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Image */}
          <div className="bg-white rounded-3xl overflow-hidden aspect-square border border-neutral-100 flex items-center justify-center p-4">
            {activeImage ? (
              <img src={activeImage} alt={product.title} className="w-full h-full object-contain rounded-2xl" />
            ) : (
              <div className="text-neutral-400">Sin imagen</div>
            )}
          </div>
          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-amber-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-3 py-1.5 text-xs font-semibold rounded-full capitalize ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {product.status === 'active' ? 'Disponible' : 'No disponible'}
              </span>
              <div className="flex gap-2 text-neutral-400">
                <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><Share2 size={20} /></button>
                <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors hover:text-red-500"><Heart size={20} /></button>
              </div>
            </div>

            <h1 className="text-3xl font-black text-neutral-900 leading-tight mb-2">
              {product.title}
            </h1>

            <div className="text-4xl font-black text-neutral-900 mb-4 tracking-tight">
              {formattedPrice}
            </div>

            {product.ratingCount > 0 && (
              <div className="flex items-center gap-2 mb-6 text-neutral-600">
                <div className="flex gap-1 text-amber-500">
                  <Star fill="currentColor" size={20} />
                </div>
                <span className="font-bold text-neutral-900 text-lg">{product.rating.toFixed(1)}</span>
                <span className="text-sm">({product.ratingCount} reseñas)</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 p-3 rounded-2xl">
                <MapPin size={18} className="text-amber-500" />
                <span>{product.location?.city}, {product.location?.country}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 p-3 rounded-2xl">
                <Package size={18} className="text-amber-500" />
                <span className="capitalize">{product.condition === 'new' ? 'Nuevo' : 'Usado'}</span>
              </div>
              {(product.quantity ?? 1) >= 0 && (
                <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 p-3 rounded-2xl col-span-2">
                  <Package size={18} className="text-amber-500" />
                  <span className="font-bold">{product.quantity} disponibles</span>
                </div>
              )}
            </div>

            {isOwner ? (
              <div className="flex gap-4">
                <button
                  onClick={() => router.push(`/products/edit/${product.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-amber-500/20"
                >
                  <Edit size={20} /> Editar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-6 rounded-xl transition-colors border border-red-200"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ) : (
              <ContactSellerButton productId={product.id} sellerId={product.sellerId} />
            )}
          </div>

          <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4 border-b pb-4">Descripción</h3>
            <div className="text-neutral-600 whitespace-pre-wrap leading-relaxed mix-blend-multiply">
              {product.description}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Información del vendedor</h3>
            <div className="flex items-center gap-4">
              {product.sellerPhoto ? (
                <img src={product.sellerPhoto} alt={product.sellerName} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-bold">
                  {product.sellerName?.charAt(0) || '?'}
                </div>
              )}
              <div>
                <div className="font-bold text-neutral-900 text-lg flex items-center gap-1">
                  {product.sellerName}
                  <ShieldCheck size={16} className="text-blue-500 mt-0.5" />
                </div>
                <div className="text-sm text-neutral-500">Miembro verificado</div>
              </div>
            </div>
          </div>

          {/* Comentarios embebidos */}
          <ProductComments productId={product.id} sellerId={product.sellerId} />

        </div>
      </div>
    </div>
  );
}
