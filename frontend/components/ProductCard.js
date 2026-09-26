'use client';

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop";

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const {
    _id,
    id,
    productId,
    slug,
    name,
    title,
    brand = "Rebel Watches",
    price = 0,
    comparePrice = 0,
    compareAtPrice = 0,
    images = [],
    stock = 1,
    isNew = false,
    isFeatured = false,
    featured = false,
  } = product || {};

  // Normalize backend field names
  const productTitle = name || title || "Luxury Timepiece";
  const productSlug = slug || _id || id || productId;
  const effectiveComparePrice = comparePrice || compareAtPrice;
  const inStock = typeof stock === "number" ? stock > 0 : true;
  const showFeatured = isFeatured || featured;

  // Extract Cloudinary URL string from array of objects [{ url, alt, _id }]
  const getImageUrl = (imgItem) => {
    if (!imgItem) return null;
    if (typeof imgItem === "string" && imgItem.trim() !== "") return imgItem;
    if (typeof imgItem === "object" && imgItem.url && typeof imgItem.url === "string" && imgItem.url.trim() !== "") {
      return imgItem.url;
    }
    return null;
  };

  const rawPrimary = getImageUrl(images[0]);
  const rawSecondary = getImageUrl(images[1]);

  // Safe image assignment: guaranteed non-empty string for Next.js Image src
  const primaryImage = rawPrimary || FALLBACK_IMAGE;
  const secondaryImage = rawSecondary || primaryImage;

  const currentImageSrc = imageError ? FALLBACK_IMAGE : (isHovered ? secondaryImage : primaryImage);

  // PKR Price Formatter
  const formatPKR = (amount) => {
    return `Rs. ${Number(amount).toLocaleString('en-PK')}`;
  };

  return (
    <div 
      className="group relative flex flex-col w-full bg-neutral-900/40 border border-neutral-800/80 rounded-2xl overflow-hidden transition-all duration-500 hover:border-neutral-700/80 hover:bg-neutral-900/70 hover:shadow-2xl hover:shadow-black/80"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
        {showFeatured && (
          <span className="bg-amber-500/90 text-black text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-md shadow-lg shadow-black/50 font-sans backdrop-blur-md">
            Featured
          </span>
        )}
        {isNew && (
          <span className="bg-neutral-100 text-black text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-md shadow-lg shadow-black/50 font-sans">
            New Arrival
          </span>
        )}
        {!inStock && (
          <span className="bg-neutral-950/90 text-neutral-400 border border-neutral-800 text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-md backdrop-blur-md font-sans">
            Sold Out
          </span>
        )}
        {effectiveComparePrice > price && inStock && (
          <span className="bg-neutral-950/90 text-neutral-200 border border-neutral-700 text-[9px] font-bold tracking-[0.2em] uppercase px-2.5 py-1 rounded-md backdrop-blur-md font-sans">
            Sale
          </span>
        )}
      </div>

      {/* Product Image Link */}
      <Link href={`/products/${productSlug}`} className="relative w-full aspect-square bg-neutral-950 overflow-hidden block">
        <Image
          src={currentImageSrc}
          alt={productTitle}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100 brightness-95 contrast-[1.03]"
          onError={() => setImageError(true)}
        />

        <div className="absolute inset-0 bg-linear-to-t from-neutral-950 via-transparent to-neutral-950/20 pointer-events-none" />

        {/* Hover Action Button (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-linear-to-t from-neutral-950 via-neutral-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 hidden sm:flex gap-2 transform translate-y-2 group-hover:translate-y-0">
          <button
            type="button"
            disabled={!inStock}
            className="shimmer-button flex-1 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 transition-all duration-300 text-[10px] font-bold uppercase tracking-[0.18em] py-3 flex items-center justify-center gap-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed font-sans shadow-lg shadow-black/50 active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
            {inStock ? "Add to Bag" : "Out of Stock"}
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col grow justify-between border-t border-neutral-800/60 bg-neutral-950/20">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 block font-sans">
            {brand}
          </span>
          <Link href={`/products/${productSlug}`} className="block">
            <h3 className="font-serif text-sm font-semibold text-neutral-100 uppercase tracking-wider truncate group-hover:text-white transition-colors">
              {productTitle}
            </h3>
          </Link>
        </div>

        {/* Price Row formatted in PKR */}
        <div className="mt-3 pt-3 border-t border-neutral-800/60 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wider font-sans">
              {formatPKR(price)}
            </span>
            {effectiveComparePrice > price && (
              <span className="text-[11px] text-neutral-500 line-through font-sans">
                {formatPKR(effectiveComparePrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={!inStock}
            aria-label="Add to cart"
            className="sm:hidden p-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-xl disabled:opacity-40 active:scale-95 transition-all shadow-md shadow-black/40"
          >
            <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}