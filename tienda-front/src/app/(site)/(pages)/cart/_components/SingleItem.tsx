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
import { useTranslations } from "next-intl";
import { IconTrash } from "@/components/ui/Icons";

const SingleItem = ({ item }: { item: any }) => {
  const t = useTranslations("cart");
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const handleRemoveFromCart = () => {
    dispatch(removeItemFromCart(item.id));
    showToast(t("item_removed_toast", { title: item.title || "Carta" }), "warning");
  };

  const maxStock = item.stock !== undefined && item.stock !== null ? item.stock : 999;

  const handleIncreaseQuantity = () => {
    if (item.quantity < maxStock) {
      dispatch(updateCartItemQuantity({ id: item.id, quantity: item.quantity + 1 }));
    } else {
      showToast(t("stock_limit_toast", { max: maxStock }), "warning");
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
    ? "badge-condition-lp"
    : isMP
    ? "badge-condition-mp"
    : isHP
    ? "badge-condition-hp"
    : "badge-condition-nm";

  const isFoil = Boolean(
    item.finish &&
    (item.finish.toLowerCase().includes("foil") || item.finish.toLowerCase().includes("holo"))
  );

  const unitPrice = Number(item.discountedPrice ?? item.price ?? 0);
  const lineTotal = (item.finalPrice || unitPrice) * item.quantity;

  return (
    <div className="grid grid-cols-12 items-center gap-4 py-4 px-6 border-b border-[var(--tt-border-subtle)] last:border-0 hover:bg-[var(--tt-bg-subtle)]/40 transition-colors">
      {/* Product Artwork & Info (Col 5) */}
      <div className="col-span-12 sm:col-span-5 flex items-center gap-3.5">
        <div className="relative w-14 aspect-[2.5/3.5] rounded-lg overflow-hidden bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] shrink-0 p-0.5 shadow-sm">
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
          <h4 className="text-sm font-bold text-[var(--tt-text-main)] hover:text-red-500 transition-colors line-clamp-1">
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
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-500 border border-amber-400/40 font-black">
                FOIL
              </span>
            )}
            <span className="text-[10px] text-[var(--tt-text-muted)] font-mono">
              {item.language || "EN"}
            </span>
          </div>

          {/* Store */}
          <div className="text-[11px] text-[var(--tt-text-muted)] mt-1 truncate">
            <span>{t("store_label")} </span>
            <span className="text-[var(--tt-text-main)] font-semibold">{item.storeName || "TapTrade Store"}</span>
          </div>
        </div>
      </div>

      {/* Unit Price (Col 2) */}
      <div className="col-span-4 sm:col-span-2 text-left sm:text-center">
        <span className="text-xs text-[var(--tt-text-muted)] block sm:hidden">{t("table_header_unit_price")}:</span>
        {item.discountAmount > 0 ? (
          <div>
            <span className="text-[var(--tt-text-muted)] line-through text-[11px] block font-mono">
              ${Math.round(item.originalPrice).toLocaleString("es-CL")}
            </span>
            <span className="text-[var(--tt-text-main)] font-mono font-bold text-sm">
              ${Math.round(item.finalPrice).toLocaleString("es-CL")} CLP
            </span>
            <span className="inline-block mt-0.5 text-[9px] font-mono font-bold uppercase text-emerald-500 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
              Cupón: {item.appliedCouponCode}
            </span>
          </div>
        ) : (
          <span className="text-sm font-mono font-bold text-[var(--tt-text-main)]">
            ${Math.round(unitPrice).toLocaleString("es-CL")} <span className="text-[11px] text-[var(--tt-text-muted)] font-normal">CLP</span>
          </span>
        )}
      </div>

      {/* Quantity Stepper (Col 2) */}
      <div className="col-span-4 sm:col-span-2 flex items-center justify-start sm:justify-center">
        <div className="flex items-center rounded-xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] overflow-hidden h-9 shadow-inner">
          <button
            type="button"
            onClick={handleDecreaseQuantity}
            disabled={item.quantity <= 1}
            className="w-8 h-full flex items-center justify-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-canvas)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            -
          </button>
          <span className="w-8 text-center text-xs font-mono font-bold text-[var(--tt-text-main)]">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={handleIncreaseQuantity}
            disabled={item.quantity >= maxStock}
            className="w-8 h-full flex items-center justify-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-canvas)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            +
          </button>
        </div>
      </div>

      {/* Subtotal (Col 2) */}
      <div className="col-span-3 sm:col-span-2 text-right">
        <span className="text-xs text-[var(--tt-text-muted)] block sm:hidden">{t("table_header_subtotal")}:</span>
        <span className="text-sm font-black font-mono text-[var(--tt-text-main)]">
          ${Math.round(lineTotal).toLocaleString("es-CL")}
        </span>
        <span className="text-[10px] text-[var(--tt-text-muted)] ml-1">CLP</span>
      </div>

      {/* Action (Col 1) */}
      <div className="col-span-1 sm:col-span-1 flex justify-end">
        <button
          onClick={handleRemoveFromCart}
          aria-label={t("delete_item_aria")}
          className="w-8 h-8 rounded-lg bg-[var(--tt-bg-subtle)] hover:bg-red-500/15 border border-[var(--tt-border-medium)] hover:border-red-500/30 text-[var(--tt-text-muted)] hover:text-red-500 flex items-center justify-center transition-all cursor-pointer shadow-sm"
          title={t("remove")}
        >
          <IconTrash className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default SingleItem;
