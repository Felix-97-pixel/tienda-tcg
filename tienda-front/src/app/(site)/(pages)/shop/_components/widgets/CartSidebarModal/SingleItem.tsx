import React from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import Image from "next/image";
import Link from "next/link";
import { updateCartItemQuantity } from "@/redux/features/cart-slice";
import { useToast } from "@/hooks/useToast";
import { IconTrash } from "@/components/ui/Icons";
import { useTranslations } from "next-intl";

interface CartItemProps {
  item: any;
  removeItemFromCart: (id: string | number) => any;
}

const SingleItem: React.FC<CartItemProps> = ({ item, removeItemFromCart }) => {
  const t = useTranslations("cart");
  const dispatch = useDispatch<AppDispatch>();
  const { showToast } = useToast();

  const handleRemoveFromCart = () => {
    dispatch(removeItemFromCart(item.id));
    showToast(t("item_removed_toast", { title: item.title }), "warning");
  };

  const handleIncreaseQuantity = () => {
    const maxStock = item.stock !== undefined && item.stock !== null ? item.stock : 999;
    if (item.quantity < maxStock) {
      dispatch(updateCartItemQuantity({ id: item.id, quantity: item.quantity + 1 }));
    } else {
      showToast(t("max_stock_toast", { max: maxStock }), "warning");
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
  const lineTotal = unitPrice * item.quantity;
  const maxStock = item.stock !== undefined && item.stock !== null ? item.stock : 999;

  return (
    <div className="group relative p-3 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-red-500/40 shadow-sm transition-all">
      <div className="flex items-start gap-3">
        {/* Card Artwork Thumbnail */}
        <div className="relative w-16 aspect-[2.5/3.5] rounded-lg overflow-hidden bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] shrink-0 p-0.5">
          <Image
            className="w-full h-full object-contain"
            src={item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0] || "/images/products/product-1-bg-1.png"}
            alt={item.title || "Carta TCG"}
            width={80}
            height={112}
            unoptimized={Boolean((item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0])?.includes("scryfall"))}
          />
        </div>

        {/* Card Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-xs font-bold text-[var(--tt-text-main)] group-hover:text-red transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h4>
            <button
              onClick={handleRemoveFromCart}
              aria-label={t("delete_item_aria")}
              className="text-[var(--tt-text-muted)] hover:text-red transition-colors p-1 rounded hover:bg-[var(--tt-bg-subtle)] shrink-0"
              title={t("delete_item_aria")}
            >
              <IconTrash className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Badges: Condition, Foil, Language */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${conditionBadgeClass}`}>
              {conditionCode}
            </span>
            {isFoil && (
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-700 dark:text-amber-300 border border-amber-400/30">
                FOIL
              </span>
            )}
            <span className="text-[10px] text-[var(--tt-text-muted)] font-mono">
              {item.language || "EN"}
            </span>
          </div>

          {/* Store Name */}
          <div className="flex items-center gap-1 text-[11px] text-[var(--tt-text-muted)] mb-2 truncate">
            <span>{t("store_label")}</span>
            <span className="text-[var(--tt-text-main)] font-medium truncate">
              {item.storeName || "TapTrade Store"}
            </span>
          </div>

          {/* Bottom Bar: Stepper & Price */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--tt-border-subtle)]">
            {/* Quantity Stepper */}
            <div className="flex items-center rounded-lg bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] overflow-hidden h-7">
              <button
                type="button"
                onClick={handleDecreaseQuantity}
                disabled={item.quantity <= 1}
                className="w-6 h-full flex items-center justify-center text-xs text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-canvas)] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                -
              </button>
              <span className="w-7 text-center text-xs font-mono font-bold text-[var(--tt-text-main)]">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={handleIncreaseQuantity}
                disabled={item.quantity >= maxStock}
                className="w-6 h-full flex items-center justify-center text-xs text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-canvas)] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>

            {/* Line Price */}
            <div className="text-right">
              <span className="text-xs font-black font-mono text-[var(--tt-text-main)]">
                ${Math.round(lineTotal).toLocaleString("es-CL")}
              </span>
              <span className="text-[10px] text-[var(--tt-text-muted)] ml-1">CLP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
