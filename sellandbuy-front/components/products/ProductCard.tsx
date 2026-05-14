"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "../../types/product";
import { useFavorites } from "@/hooks/useFavorites";
import { copyProductLink } from "@/lib/share";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toggleFavorite, isFavorite, isLoading: isFavLoading } = useFavorites();
  const [isCopied, setIsCopied] = useState(false);

  const isFav = isFavorite(product.id);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await copyProductLink(product.id);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(product.id);
  };

  const imageUrl =
    product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/400x400?text=Sin+imagen";

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: product.currency,
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="group relative flex flex-col bg-[--color-surface-container-lowest] rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-[--color-primary]/5">

      {/* Image */}
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-[4/5] overflow-hidden block"
      >
        <Image
          src={imageUrl}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Actions container (top-right) */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Wishlist button */}
          <button
            className="h-10 w-10 bg-[var(--color-surface)]/90 backdrop-blur-md rounded-full flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors disabled:opacity-50"
            onClick={handleFavorite}
            disabled={isFavLoading}
            aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
          >
            <span className={`material-symbols-outlined text-[20px] ${isFav ? 'text-[var(--color-error)] font-variation-fill' : ''}`}>
              favorite
            </span>
          </button>

          {/* Share button */}
          <button
            className="h-10 w-10 bg-[var(--color-surface)]/90 backdrop-blur-md rounded-full flex items-center justify-center text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors relative"
            onClick={handleShare}
            aria-label="Compartir"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isCopied ? "check" : "share"}
            </span>
            {isCopied && (
              <div className="absolute right-12 bg-[var(--color-inverse-surface)] text-[var(--color-inverse-on-surface)] text-xs px-2 py-1 rounded whitespace-nowrap">
                Enlace copiado
              </div>
            )}
          </button>
        </div>

        {/* Condition badge bottom-left */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <span
            className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase backdrop-blur-md ${
              product.condition === "new"
                ? "bg-[var(--color-surface)]/90 text-[var(--color-on-surface)]"
                : "bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            }`}
          >
            {product.condition === "new" ? "Nuevo" : "Usado"}
          </span>
          {product.status !== "active" && (
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-black/60 text-white backdrop-blur-md capitalize">
              {product.status === "sold"
                ? "Vendido"
                : product.status === "paused"
                ? "Pausado"
                : product.status}
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 space-y-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-bold text-[--color-on-surface] leading-tight group-hover:text-[--color-primary] transition-colors line-clamp-1">
            {product.title}
          </h3>
        </Link>
        <p className="text-sm text-[--color-on-surface-variant] line-clamp-1">
          {product.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 mt-auto">
          <p className="text-[--color-primary] font-extrabold text-lg">{formattedPrice}</p>
          <div className="flex items-center gap-1.5 text-[--color-on-surface-variant] text-xs">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span>{product.location?.city || "—"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
