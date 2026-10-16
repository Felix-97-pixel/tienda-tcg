"use client";

import React from "react";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useProductCart } from "@/hooks/useProductCart";
import { useToast } from "@/hooks/useToast";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import Image from "next/image";
import Link from "next/link";
import { IconCart, IconTrash, IconLanguageFlag } from "@/components/ui/Icons";

interface SingleItemProps {
  item: any;
  onRemove?: () => void;
}

const SingleItem: React.FC<SingleItemProps> = ({ item, onRemove }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useAppSelector((state: any) => state.authReducer?.isAuthenticated);
  const { showToast } = useToast();
  const t = useTranslations("shop");
  const tw = useTranslations("wishlist");

  const title = item.title || item.name || "Carta TCG";
  const productId = item.productId || item.id;

  const handleRemoveFromWishlist = async () => {
    dispatch(removeItemFromWishlist(item.id));
    showToast(tw("removed", { title }), "warning");
    if (isAuthenticated) {
      try {
        await fetch(`${API_URL}/wishlist/${productId}`, { method: "DELETE", credentials: "include" });
        if (onRemove) onRemove();
      } catch (e) {}
    }
  };

  const { handleAddToCart, isMaxStockReached } = useProductCart(item);

  // Condition evaluation
  const rawCondition = (
    typeof item.condition === "object"
      ? item.condition?.displayName || item.condition?.name
      : item.condition || "NM"
  ).toUpperCase();

  const isLP = rawCondition.includes("LIGHT") || rawCondition === "LP";
  const isMP = rawCondition.includes("MODERATE") || rawCondition === "MP";
  const isHP = rawCondition.includes("HEAVY") || rawCondition === "HP";
  const conditionCode = isLP ? "LP" : isMP ? "MP" : isHP ? "HP" : "NM";
  const conditionBadgeClass = isLP
    ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
    : isMP
    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
    : isHP
    ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
    : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";

  const isFoil = Boolean(
    (item.finish && (item.finish.toLowerCase().includes("foil") || item.finish.toLowerCase().includes("holo"))) ||
    item.isFoil
  );

  const stockCount =
    item.stock !== undefined && item.stock !== null
      ? Number(item.stock)
      : item.status === "In Stock" || item.status === "available"
      ? 1
      : 0;
  const isInStock = stockCount > 0;

  const unitPrice = Number(item.discountedPrice ?? item.price ?? 0);
  const cardSet = item.cardSet || item.cardDetail?.cardSet;
  const categoryName = item.categoryName || item.category?.name;
  const imageUrl =
    item.imgs?.thumbnails?.[0] ||
    item.imgs?.previews?.[0] ||
    item.imageUrl ||
    "/images/products/product-1-bg-1.png";

  return (
    <div className="grid grid-cols-12 items-center gap-4 py-4 px-5 sm:px-6 border-b border-white/5 last:border-0 hover:bg-white/[0.015] transition-colors">
      {/* Product Artwork & Details (Col 5) */}
      <div className="col-span-12 sm:col-span-5 flex items-center gap-3.5">
        <Link
          href={`/shop-details/${item.slug}`}
          className="relative w-14 aspect-[2.5/3.5] rounded-lg overflow-hidden bg-[#07090E] border border-white/10 shrink-0 p-0.5 group/art transition-transform hover:scale-105"
        >
          <Image
            className="w-full h-full object-contain"
            width={70}
            height={98}
            src={imageUrl}
            alt={title}
            unoptimized={Boolean(imageUrl?.includes("scryfall") || imageUrl?.includes("tcgplayer"))}
          />
        </Link>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white hover:text-red-400 transition-colors line-clamp-1">
            <Link href={`/shop-details/${item.slug}`}>
              {title}
            </Link>
          </h4>

          {/* Badges: Condition, Foil, Language, Set */}
          <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${conditionBadgeClass}`}>
              {conditionCode}
            </span>
            {isFoil && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">
                FOIL
              </span>
            )}
            {item.language && (
              <span className="inline-flex items-center gap-1 text-[10px] text-gray-400 font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                <IconLanguageFlag code={item.language} name={item.language} className="w-3.5 h-2.5" />
                <span>{item.language}</span>
              </span>
            )}
            {cardSet && (
              <span className="text-[10px] text-gray-400 font-medium truncate max-w-[120px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                {cardSet}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Juego / Categoría (Col 2) */}
      <div className="col-span-6 sm:col-span-2 text-left sm:text-center">
        <span className="text-xs text-gray-400 block sm:hidden mb-0.5">Juego:</span>
        <span className="inline-block text-xs font-medium text-gray-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
          {categoryName || "TCG"}
        </span>
      </div>

      {/* Unit Price (Col 2) */}
      <div className="col-span-6 sm:col-span-2 text-right sm:text-center">
        <span className="text-xs text-gray-400 block sm:hidden mb-0.5">Precio:</span>
        <span className="text-sm font-mono font-bold text-white">
          ${Math.round(unitPrice).toLocaleString("es-CL")}{" "}
          <span className="text-xs text-gray-400 font-normal">CLP</span>
        </span>
      </div>

      {/* Stock Status (Col 2) */}
      <div className="col-span-6 sm:col-span-2 text-left sm:text-center">
        <span className="text-xs text-gray-400 block sm:hidden mb-0.5">Disponibilidad:</span>
        {isInStock ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t("inStock")} ({stockCount})</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            <span>{t("outOfStock")}</span>
          </span>
        )}
      </div>

      {/* Action Buttons (Col 1) */}
      <div className="col-span-6 sm:col-span-1 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => handleAddToCart()}
          disabled={!isInStock || isMaxStockReached}
          title={!isInStock ? t("outOfStock") : isMaxStockReached ? t("maxReached") : t("addToCart")}
          className={`p-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center ${
            !isInStock || isMaxStockReached
              ? "bg-white/5 cursor-not-allowed text-gray-500 border border-white/5"
              : "text-white bg-[#E10E0E] hover:bg-[#F23030] shadow-md shadow-[#E10E0E]/20 active:scale-95"
          }`}
        >
          <IconCart className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleRemoveFromWishlist}
          title="Eliminar de mi wishlist"
          className="p-2.5 rounded-xl text-gray-400 hover:text-red-400 bg-white/[0.02] hover:bg-red-500/10 border border-white/5 hover:border-red-500/20 transition-all active:scale-95 flex items-center justify-center"
        >
          <IconTrash className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SingleItem;
