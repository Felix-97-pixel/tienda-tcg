"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProductCart } from "@/hooks/useProductCart";
import { formatPrice } from "@/utils/currency";
import { useAppSelector } from "@/redux/store";

interface TcgProductCardProps {
  item: any;
  onQuickView?: (item: any) => void;
}

export default function TcgProductCard({ item, onQuickView }: TcgProductCardProps) {
  const { handleAddToCart, isMaxStockReached, availableStock } = useProductCart(item);
  const currency = useAppSelector((state: any) => state.currencyReducer);
  const [isAdding, setIsAdding] = useState(false);

  // Extract TCG attributes
  const cardDetail = item.cardDetail || {};
  const isFoil = Boolean(
    item.finish?.name?.toLowerCase().includes("foil") ||
    item.finish?.name?.toLowerCase().includes("holo") ||
    item.items?.some((i: any) => i.finish?.name?.toLowerCase().includes("foil")) ||
    cardDetail.isFoil
  );

  const rawCondition = (
    item.condition_rel?.name ||
    item.items?.[0]?.condition?.name ||
    item.condition ||
    "NM"
  ).toUpperCase();

  // Normalize condition code
  let conditionCode = "NM";
  let conditionClass = "badge-condition-nm";
  if (rawCondition.includes("LIGHT") || rawCondition === "LP") {
    conditionCode = "LP";
    conditionClass = "badge-condition-lp";
  } else if (rawCondition.includes("MODERATE") || rawCondition === "MP") {
    conditionCode = "MP";
    conditionClass = "badge-condition-mp";
  } else if (rawCondition.includes("HEAVY") || rawCondition === "HP") {
    conditionCode = "HP";
    conditionClass = "badge-condition-hp";
  } else if (rawCondition.includes("DAMAGE") || rawCondition === "DMG") {
    conditionCode = "DMG";
    conditionClass = "badge-condition-dmg";
  }

  const rawLang = item.language?.name || item.items?.[0]?.language?.name || "EN";
  const languageCode = rawLang.substring(0, 2).toUpperCase();

  const price = item.price || item.items?.[0]?.price || 0;
  const stock = item.stock !== undefined ? item.stock : (item.items?.[0]?.stock ?? 0);
  const isOutOfStock = stock <= 0 || isMaxStockReached;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    handleAddToCart(1);
    setTimeout(() => setIsAdding(false), 900);
  };

  const imageUrl = item.imgs?.previews?.[0] || item.imageUrl || "/images/products/product-1-bg-1.png";

  return (
    <article className="glass-vault-card group rounded-2xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300">
      {/* Top Header: Condition Badge + Language + Foil Badge */}
      <div className="flex items-center justify-between gap-1.5 mb-2.5 z-20">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider font-mono ${conditionClass}`}>
            {conditionCode}
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/5 border border-white/10 text-gray-400 font-mono">
            {languageCode}
          </span>
        </div>

        {isFoil && (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-400/20 via-pink-400/20 to-cyan-400/20 border border-amber-300/40 text-amber-200 shadow-sm flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            Foil
          </span>
        )}
      </div>

      {/* Card Artwork Image Container with Foil Shimmer */}
      <Link
        href={`/shop-details/${item.slug || item.id}`}
        className="block relative aspect-[2.5/3.5] w-full max-w-[210px] mx-auto rounded-xl overflow-hidden card-foil-container bg-[#08090d] border border-white/5 my-1"
      >
        <Image
          src={imageUrl}
          alt={item.title || item.name || "TCG Card"}
          fill
          sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 220px"
          className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-[1.04]"
          unoptimized={Boolean(imageUrl.includes("scryfall"))}
          priority={false}
        />

        {/* Foil Holo Effect Shader */}
        {isFoil && <div className="card-foil-overlay" />}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center z-20 p-2">
            <span className="px-2.5 py-1 rounded-lg bg-red/90 text-white font-bold text-xs tracking-wider uppercase shadow-lg">
              Agotado
            </span>
          </div>
        )}
      </Link>

      {/* Info Section */}
      <div className="mt-3 flex flex-col flex-1 justify-between z-20">
        <div>
          {/* Expansion / Set Name */}
          <p className="text-[11px] font-medium text-gray-400 truncate mb-0.5">
            {item.cardDetail?.expansionName || item.category?.name || "Colección TCG"}
          </p>

          {/* Card Name */}
          <Link
            href={`/shop-details/${item.slug || item.id}`}
            className="block text-sm font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug"
            title={item.title || item.name}
          >
            {item.title || item.name}
          </Link>
        </div>

        {/* Bottom Bar: Price + Stock + Action Button */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
          <div>
            <div className="text-base font-bold font-mono text-white tracking-tight">
              {formatPrice(price, currency)}
            </div>
            {stock > 0 && stock <= 3 && (
              <span className="text-[10px] font-medium text-amber-400/90 flex items-center gap-1">
                ¡Solo {stock} disp.!
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock || isAdding}
            aria-label={`Añadir ${item.title || item.name} al carrito`}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
              isOutOfStock
                ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                : isAdding
                ? "bg-[#059669] text-white scale-95 shadow-md shadow-[#059669]/25"
                : "bg-[#E10E0E] text-white hover:bg-[#F23030] active:scale-95 shadow-md shadow-[#E10E0E]/25"
            }`}
          >
            {isAdding ? (
              <>
                <svg className="w-3.5 h-3.5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>¡Listo!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z" />
                </svg>
                <span>Añadir</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
