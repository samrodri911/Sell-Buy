"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getProductById } from '@/services/product.service';
import { Product } from '@/types/product';
import { ProductForm } from '@/components/products/ProductForm';
import { Loader2 } from 'lucide-react';

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { firebaseUser, loading: authLoading } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function load() {
      if (authLoading) return;
      if (!firebaseUser) {
        router.replace('/');
        return;
      }
      
      const productId = params.id as string;
      if (!productId) return;
      
      try {
        const prod = await getProductById(productId);
        if (!prod) {
          setError('Producto no encontrado');
        } else if (prod.sellerId !== firebaseUser.uid) {
          setError('No tienes permiso para editar este producto');
        } else {
          setProduct(prod);
        }
      } catch (err: any) {
         setError(err.message || 'Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, firebaseUser, authLoading, router]);
  
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <Loader2 size={40} className="animate-spin text-amber-500" />
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center border border-red-100">
           <p className="font-bold text-lg mb-2">Oops!</p>
           <p>{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4">
      <ProductForm product={product} />
    </div>
  );
}
