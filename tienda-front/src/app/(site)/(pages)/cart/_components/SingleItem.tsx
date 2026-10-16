import React from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  removeItemFromCart,
  updateCartItemQuantity,
} from "@/redux/features/cart-slice";
import { useToast } from "@/hooks/useToast";
import Image from "next/image";
import Link from "next/link";

const SingleItem = ({ item }: { item: any }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const handleRemoveFromCart = () => {
    dispatch(removeItemFromCart(item.id));
    showToast(`"${item.title}" eliminada del carrito`, "warning");
  };

  const maxStock = item.stock !== undefined && item.stock !== null ? item.stock : 999;

  const handleIncreaseQuantity = () => {
    if (item.quantity < maxStock) {
      dispatch(updateCartItemQuantity({ id: item.id, quantity: item.quantity + 1 }));
    } else {
      showToast(`Solo hay ${maxStock} unidades disponibles en stock`, "warning");
    }
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      dispatch(updateCartItemQuantity({ id: item.id, quantity: item.quantity - 1 }));
    }
  };

  // Condition code and badge styling
  const rawCondition = (item.condition || "NM").toUpperCase();
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
    item.finish &&
    (item.finish.toLowerCase().includes("foil") || item.finish.toLowerCase().includes("holo"))
  );

  const unitPrice = Number(item.discountedPrice ?? item.price ?? 0);
  const lineTotal = (item.finalPrice || unitPrice) * item.quantity;

  return (
    <div className="grid grid-cols-12 items-center gap-4 py-4 px-6 border-b border-white/5 last:border-0 hover:bg-white/[0.015] transition-colors">
      {/* Product Artwork & Info (Col 5) */}
      <div className="col-span-12 sm:col-span-5 flex items-center gap-3.5">
        <div className="relative w-14 aspect-[2.5/3.5] rounded-lg overflow-hidden bg-[#07090E] border border-white/10 shrink-0 p-0.5">
          <Image
            className="w-full h-full object-contain"
            width={70}
            height={98}
            src={item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0] || "/images/products/product-1-bg-1.png"}
            alt={item.title || "Carta TCG"}
            unoptimized={Boolean((item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0])?.includes("scryfall"))}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white hover:text-red-400 transition-colors line-clamp-1">
            <Link href={`/shop-details/${item.slug}`}>
              {item.title}
            </Link>
          </h4>

          {/* Badges */}
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${conditionBadgeClass}`}>
              {conditionCode}
            </span>
            {isFoil && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">
                FOIL
              </span>
            )}
            <span className="text-[10px] text-gray-400 font-mono">
              {item.language || "EN"}
            </span>
          </div>

          {/* Store */}
          <div className="text-[11px] text-gray-400 mt-1 truncate">
            <span className="text-gray-500">Tienda: </span>
            <span className="text-gray-300 font-medium">{item.storeName || "TapTrade Store"}</span>
          </div>
        </div>
      </div>

      {/* Unit Price (Col 2) */}
      <div className="col-span-4 sm:col-span-2 text-left sm:text-center">
        <span className="text-xs text-gray-400 block sm:hidden">Precio Unitario:</span>
        {item.discountAmount > 0 ? (
          <div>
            <span className="text-gray-500 line-through text-[11px] block font-mono">
              ${Math.round(item.originalPrice).toLocaleString("es-CL")}
            </span>
            <span className="text-white font-mono font-bold text-sm">
              ${Math.round(item.finalPrice).toLocaleString("es-CL")} CLP
            </span>
            <span className="inline-block mt-0.5 text-[9px] font-mono font-bold uppercase text-emerald-400 bg-emerald-400/10 px-1.5 py-0.2 rounded border border-emerald-400/20">
              Cupón: {item.appliedCouponCode}
            </span>
          </div>
        ) : (
          <span className="text-sm font-mono font-bold text-white">
            ${Math.round(unitPrice).toLocaleString("es-CL")} <span className="text-[11px] text-gray-400 font-normal">CLP</span>
          </span>
        )}
      </div>

      {/* Quantity Stepper (Col 2) */}
      <div className="col-span-4 sm:col-span-2 flex items-center justify-start sm:justify-center">
        <div className="flex items-center rounded-xl bg-black/40 border border-white/10 overflow-hidden h-9">
          <button
            type="button"
            onClick={handleDecreaseQuantity}
            disabled={item.quantity <= 1}
            className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            -
          </button>
          <span className="w-8 text-center text-xs font-mono font-bold text-white">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={handleIncreaseQuantity}
            disabled={item.quantity >= maxStock}
            className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
      </div>

      {/* Subtotal (Col 2) */}
      <div className="col-span-3 sm:col-span-2 text-right">
        <span className="text-xs text-gray-400 block sm:hidden">Subtotal:</span>
        <span className="text-sm font-black font-mono text-white">
          ${Math.round(lineTotal).toLocaleString("es-CL")}
        </span>
        <span className="text-[10px] text-gray-500 ml-1">CLP</span>
      </div>

      {/* Action (Col 1) */}
      <div className="col-span-1 sm:col-span-1 flex justify-end">
        <button
          onClick={handleRemoveFromCart}
          aria-label="Eliminar del carrito"
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/15 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 flex items-center justify-center transition-all"
          title="Eliminar de la lista"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SingleItem;
