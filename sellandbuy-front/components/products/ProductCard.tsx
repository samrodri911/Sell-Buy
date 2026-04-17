"use client"
import React from 'react';
import Link from 'next/link';
import { Product } from '../../types/product';
import { MapPin, Heart, Package } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // Use first image or a placeholder
  const imageUrl = product.images.length > 0 
    ? product.images[0] 
    : 'https://via.placeholder.com/400x400?text=No+Image';

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: product.currency,
    maximumFractionDigits: 0
  }).format(product.price);

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-100 overflow-hidden transform hover:-translate-y-1">
      {/* Image Container */}
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Badges/Overlays overlay */}
        <div className="absolute top-3 w-full px-3 flex justify-between items-start">
          <div className="flex flex-col gap-1.5">
             <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm backdrop-blur-md 
               ${product.condition === 'new' ? 'bg-blue-600/90 text-white' : 'bg-white/90 text-neutral-800'}`}>
               {product.condition === 'new' ? 'Nuevo' : 'Usado'}
             </span>
             {product.status !== 'active' && (
                <span className="px-2.5 py-1 text-xs font-semibold bg-neutral-900/90 text-white rounded-full shadow-sm backdrop-blur-md capitalize">
                  {product.status}
                </span>
             )}
             {(product.quantity ?? 1) > 0 && (
                <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full shadow-sm">
                  {product.quantity === 1 ? 'Última unidad' : `${product.quantity} disp.`}
                </span>
             )}
          </div>
          <button className="p-2 rounded-full bg-white/50 backdrop-blur-md hover:bg-white text-neutral-600 hover:text-red-500 transition-colors shadow-sm">
            <Heart size={18} />
          </button>
        </div>
      </Link>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category & Location */}
        <div className="flex justify-between items-center text-neutral-500 text-xs font-medium mb-2">
           <span className="flex items-center gap-1">
             <Package size={14} />
             {product.category}
           </span>
           <span className="flex items-center gap-1">
             <MapPin size={14} />
             {product.location?.city || 'Desconocido'}
           </span>
        </div>

        {/* Title */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-bold text-neutral-900 leading-tight mb-1 group-hover:text-amber-600 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </Link>
        <p className="text-sm text-neutral-500 line-clamp-1 mb-4 flex-1">
          {product.description}
        </p>

        {/* Footer/Price */}
        <div className="flex justify-between items-end mt-auto pt-4 border-t border-neutral-100">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 font-medium tracking-wide">PRECIO</span>
            <span className="text-xl font-black text-neutral-900">{formattedPrice}</span>
          </div>
          
          {/* Seller short info */}
          <div className="flex items-center gap-2">
             {product.sellerPhoto ? (
               <img src={product.sellerPhoto} alt={product.sellerName} className="w-6 h-6 rounded-full object-cover" />
             ) : (
               <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
                 {product.sellerName?.charAt(0) || '?'}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
