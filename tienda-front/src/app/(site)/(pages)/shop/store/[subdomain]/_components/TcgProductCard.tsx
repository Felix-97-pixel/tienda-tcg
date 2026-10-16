"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProductCart } from "@/hooks/useProductCart";
import { formatPrice } from "@/utils/currency";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useToast } from "@/hooks/useToast";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import { IconHeart } from "@/components/ui/Icons";

interface TcgProductCardProps {
  item: any;
  onQuickView?: (item: any) => void;
}

export default function TcgProductCard({ item, onQuickView }: TcgProductCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const currency = useAppSelector((state: any) => state.currencyReducer);
  const reduxWishlistItems = useAppSelector((state: any) => state.wishlistReducer?.items || []);
  const isAuthenticated = useAppSelector((state: any) => state.authReducer?.isAuthenticated);
  const { showToast } = useToast();
  const tw = useTranslations("wishlist");

  const [isAdding, setIsAdding] = useState(false);

  // 1. Find the cheapest variant (prioritize in-stock ones if available)
  const variants: any[] = Array.isArray(item.items) ? item.items : [];
  const inStockVariants = variants.filter((inv: any) => (inv.stock ?? 0) > 0);
  const candidateVariants = inStockVariants.length > 0 ? inStockVariants : variants;

  const cheapestVariant =
    candidateVariants.length > 0
      ? [...candidateVariants].sort((a: any, b: any) => {
          const priceA = Number(a.discountedPrice ?? a.price ?? Infinity);
          const priceB = Number(b.discountedPrice ?? b.price ?? Infinity);
          return priceA - priceB;
        })[0]
      : null;

  // Construct target item representing the cheapest variant so adding to cart/wishlist selects the lowest price
  const targetItem = cheapestVariant
    ? {
        ...item,
        id: cheapestVariant.id,
        productId: item.id,
        inventoryItemId: cheapestVariant.id,
        price: Number(cheapestVariant.price ?? item.price ?? 0),
        discountedPrice: Number(
          cheapestVariant.discountedPrice ?? cheapestVariant.price ?? item.discountedPrice ?? item.price ?? 0
        ),
        stock: Number(cheapestVariant.stock ?? item.stock ?? 0),
        condition:
          cheapestVariant.condition_rel?.displayName ||
          cheapestVariant.condition_rel?.name ||
          (typeof cheapestVariant.condition === "object"
            ? (cheapestVariant.condition as any)?.displayName || (cheapestVariant.condition as any)?.name
            : cheapestVariant.condition) ||
          item.condition,
        condition_rel: cheapestVariant.condition_rel || item.condition_rel,
        language: cheapestVariant.language?.name || cheapestVariant.language || item.language,
        finish: cheapestVariant.finish?.name || cheapestVariant.finish || item.finish,
        store: cheapestVariant.store || item.store,
        storeId: cheapestVariant.storeId || item.storeId,
        storeName: cheapestVariant.store?.name || item.storeName,
      }
    : item;

  const { handleAddToCart, isMaxStockReached } = useProductCart(targetItem);

  // Extract TCG attributes from the cheapest variant
  const cardDetail = item.cardDetail || {};
  const isFoil = Boolean(
    targetItem.finish?.name?.toLowerCase().includes("foil") ||
    targetItem.finish?.name?.toLowerCase().includes("holo") ||
    (typeof targetItem.finish === "string" &&
      (targetItem.finish.toLowerCase().includes("foil") || targetItem.finish.toLowerCase().includes("holo"))) ||
    targetItem.isFoil ||
    cardDetail.isFoil
  );

  const rawCondition = (
    targetItem.condition_rel?.name ||
    (typeof targetItem.condition === "object" ? targetItem.condition?.name : targetItem.condition) ||
    item.condition_rel?.name ||
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

  const rawLang =
    typeof targetItem.language === "object"
      ? targetItem.language?.name || "EN"
      : targetItem.language || "EN";
  const languageCode = (typeof rawLang === "string" ? rawLang : "EN").substring(0, 2).toUpperCase();

  const price = Number(targetItem.discountedPrice ?? targetItem.price ?? 0);
  const stock = targetItem.stock !== undefined ? targetItem.stock : 0;
  const isOutOfStock = stock <= 0 || isMaxStockReached;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setIsAdding(true);
    handleAddToCart(1);
    setTimeout(() => setIsAdding(false), 900);
  };

  // Wishlist state & toggle handler
  const isWishlisted = reduxWishlistItems.some(
    (wi: any) => wi.id === targetItem.id || wi.productId === item.id || wi.id === item.id
  );

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWishlisted) {
      dispatch(removeItemFromWishlist(targetItem.id));
      dispatch(removeItemFromWishlist(item.id));
      showToast(tw("removed", { title: item.title || item.name }), "warning");
      if (isAuthenticated) {
        try {
          await fetch(`${API_URL}/wishlist/${item.id}`, { method: "DELETE", credentials: "include" });
        } catch (err) {}
      }
    } else {
      const wishItem = {
        id: targetItem.id || item.id,
        productId: item.id,
        slug: item.slug,
        title: item.title || item.name,
        price: targetItem.price || 0,
        discountedPrice: targetItem.discountedPrice || targetItem.price || 0,
        quantity: 1,
        status: targetItem.stock > 0 ? "In Stock" : "Out of Stock",
        stock: targetItem.stock,
        condition: targetItem.condition || "NM",
        finish: targetItem.finish?.name || targetItem.finish,
        language: targetItem.language?.name || targetItem.language || "EN",
        inventoryItemId: targetItem.inventoryItemId || targetItem.id,
        imgs: item.imgs || {
          thumbnails: [item.imageUrl || "/images/products/product-1-bg-1.png"],
          previews: [item.imageUrl || "/images/products/product-1-bg-1.png"],
        },
      };

      dispatch(addItemToWishlist(wishItem));
      showToast(tw("added", { title: wishItem.title }), "info");
      if (isAuthenticated) {
        try {
          await fetch(`${API_URL}/wishlist/${item.id}`, { method: "POST", credentials: "include" });
        } catch (err) {}
      }
    }
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
        href={`/shop-details/${item.slug}`}
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
            href={`/shop-details/${item.slug}`}
            className="block text-sm font-semibold text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug"
            title={item.title || item.name}
          >
            {item.title || item.name}
          </Link>
        </div>

        {/* Bottom Bar: Price + Stock + Action Buttons */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-base font-bold font-mono text-white tracking-tight">
              {formatPrice(price, currency)}
            </div>
            {stock > 0 && stock <= 3 && (
              <span className="text-[10px] font-medium text-amber-400/90 flex items-center gap-1">
                ¡Solo {stock} disp.!
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Wishlist Heart Button */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              aria-label={isWishlisted ? "Quitar de la lista de deseos" : "Agregar a la lista de deseos"}
              title={isWishlisted ? "En tu lista de deseos" : "Guardar en lista de deseos"}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 border ${
                isWishlisted
                  ? "bg-red-500/15 border-red-500/40 text-red-500 shadow-sm shadow-red-500/20 active:scale-95"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 active:scale-95"
              }`}
            >
              <IconHeart
                className={`w-4 h-4 transition-transform duration-200 ${
                  isWishlisted ? "fill-current text-red-500 scale-110" : ""
                }`}
              />
            </button>

            {/* Cart Button (Icon only - text 'Añadir' removed) */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock || isAdding}
              aria-label={`Añadir ${item.title || item.name} al carrito`}
              title={isOutOfStock ? "Sin stock disponible" : isAdding ? "¡Agregado al carrito!" : "Añadir al carrito"}
              className={`w-8 h-8 rounded-lg font-bold transition-all duration-200 flex items-center justify-center ${
                isOutOfStock
                  ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                  : isAdding
                  ? "bg-[#059669] text-white scale-95 shadow-md shadow-[#059669]/25"
                  : "bg-[#E10E0E] text-white hover:bg-[#F23030] active:scale-95 shadow-md shadow-[#E10E0E]/25"
              }`}
            >
              {isAdding ? (
                <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3zm-4 9c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2zm-9.83-3.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
