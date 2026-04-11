"use client"
import React, { useEffect, useState } from 'react';
import { getProducts } from '@/services/product.service';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/types/product';
import Link from 'next/link';
import { Loader2, Plus, Filter, AlertTriangle, MessageSquare } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const result = await getProducts(category ? { category } : {});
        setProducts(result.products);
      } catch (err: any) {
        console.error(err);
        // Check if it's a missing index error
        if (err?.message?.includes('index') || err?.code === 'failed-precondition') {
          setError('Firestore requiere un índice compuesto. Revisa la consola del navegador para obtener el link de creación.');
        } else {
          setError(err?.message || 'Error al cargar productos');
        }
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [category]);

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-neutral-900">Descubre Productos</h1>
            <p className="text-neutral-500 mt-1">Encuentra exactamente lo que estás buscando</p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Link href="/messages" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-6 py-3 rounded-full font-semibold hover:bg-neutral-100 transition-colors shadow-sm">
              <MessageSquare size={18} />
              Mensajes
            </Link>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 md:flex-none bg-white border border-neutral-200 text-neutral-700 px-4 py-3 rounded-full font-semibold hover:bg-neutral-50 transition-colors shadow-sm outline-none appearance-none"
            >
              <option value="">Todas las categorías</option>
              <option value="Electronics">Electrónica</option>
              <option value="Vehicles">Vehículos</option>
              <option value="Real Estate">Inmuebles</option>
              <option value="Home">Hogar</option>
              <option value="Fashion">Moda</option>
              <option value="Other">Otros</option>
            </select>
            <Link href="/products/create" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-full font-bold hover:bg-neutral-800 transition-colors shadow-lg shadow-neutral-900/20">
              <Plus size={20} />
              Publicar
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 size={40} className="animate-spin text-amber-500" />
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-red-50 rounded-3xl border border-red-100 shadow-sm">
            <AlertTriangle size={40} className="mx-auto text-red-400 mb-4" />
            <p className="text-red-600 font-semibold text-lg mb-2">Error al cargar productos</p>
            <p className="text-red-500 text-sm max-w-md mx-auto">{error}</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100 shadow-sm col-span-full">
            <p className="text-neutral-400 text-lg">No hay productos disponibles por el momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
