import { selectTotalPrice, selectTotalDiscount, selectCartItemsWithDiscounts } from "@/redux/features/cart-slice";
import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconTag, IconCheck, IconArrowRight } from "@/components/ui/Icons";

const OrderSummary = () => {
  const t = useTranslations("cart");
  const cartItems = useSelector(selectCartItemsWithDiscounts);
  const totalPrice = useSelector(selectTotalPrice);
  const totalDiscount = useSelector(selectTotalDiscount);

  const totalItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="lg:max-w-[420px] w-full">
      <div className="bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl shadow-xl overflow-hidden sticky top-32">
        {/* Header */}
        <div className="border-b border-[var(--tt-border-subtle)] py-5 px-6 bg-[var(--tt-bg-subtle)]">
          <h3 className="font-extrabold text-lg text-[var(--tt-text-main)] tracking-tight flex items-center justify-between">
            <span>{t("order_summary_title")}</span>
            <span className="text-xs font-mono font-medium text-[var(--tt-text-muted)]">
              {t("order_summary_cards_count", { count: totalItemCount })}
            </span>
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--tt-text-muted)]">{t("subtotal_products")}</span>
            <span className="font-mono font-bold text-[var(--tt-text-main)]">
              ${Math.round(totalPrice + totalDiscount).toLocaleString("es-CL")} CLP
            </span>
          </div>

          {/* Savings */}
          {totalDiscount > 0 && (
            <div className="flex items-center justify-between text-sm py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                <IconTag className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {t("coupon_discount")}
              </span>
              <span className="font-mono font-bold text-emerald-500">
                -${Math.round(totalDiscount).toLocaleString("es-CL")} CLP
              </span>
            </div>
          )}

          {/* Delivery Note */}
          <div className="flex items-center justify-between text-xs text-[var(--tt-text-muted)] pt-2 border-t border-[var(--tt-border-subtle)]">
            <span>{t("shipping_calculation")}</span>
            <span className="text-[var(--tt-text-main)] font-medium">{t("quoted_at_checkout")}</span>
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-[var(--tt-border-subtle)] flex items-baseline justify-between">
            <div>
              <span className="text-base font-bold text-[var(--tt-text-main)] block">{t("total")}</span>
              <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                <IconCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                {t("direct_store_prices")}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-[var(--tt-text-main)]">
                ${Math.round(totalPrice).toLocaleString("es-CL")}
              </span>
              <span className="text-xs text-[var(--tt-text-muted)] font-sans ml-1">CLP</span>
            </div>
          </div>

          {/* Checkout CTA Button */}
          <Link
            href="/checkout"
            className="w-full h-12 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#E10E0E]/30 flex items-center justify-center gap-2 transition-all active:scale-98 mt-2 cursor-pointer"
          >
            <span>{t("checkout")}</span>
            <IconArrowRight className="w-4 h-4 text-white shrink-0" />
          </Link>

          {/* Security Features */}
          <div className="pt-3 border-t border-[var(--tt-border-subtle)] space-y-2">
            <div className="flex items-center gap-2 text-xs text-[var(--tt-text-muted)]">
              <span className="text-emerald-500 text-sm font-bold">✓</span>
              <span>{t("security_mercado_pago")}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--tt-text-muted)]">
              <span className="text-emerald-500 text-sm font-bold">✓</span>
              <span>{t("security_shipping")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
