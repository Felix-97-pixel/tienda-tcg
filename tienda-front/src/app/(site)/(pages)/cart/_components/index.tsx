"use client";
import React from "react";
import Discount from "./Discount";
import OrderSummary from "./OrderSummary";
import { useAppSelector } from "@/redux/store";
import { selectCartItemsWithDiscounts, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import SingleItem from "./SingleItem";
import Link from "next/link";
import { useToast } from "@/hooks/useToast";
import { useTranslations } from "next-intl";
import { IconCart, IconCard, IconTrash } from "@/components/ui/Icons";

const Cart = () => {
  const t = useTranslations("cart");
  const cartItems = useAppSelector(selectCartItemsWithDiscounts);
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const handleClearCart = () => {
    if (window.confirm(t("clear_cart_confirm"))) {
      dispatch(removeAllItemsFromCart());
      showToast(t("cart_cleared_toast"), "warning");
    }
  };

  const totalCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="bg-[var(--tt-bg-canvas)] min-h-screen text-[var(--tt-text-main)] pt-28 md:pt-36 pb-24 relative overflow-hidden transition-colors duration-200">
      {/* Ambient background light */}
      <div className="absolute top-20 left-1/3 w-[600px] h-[350px] bg-red-600/10 blur-[150px] pointer-events-none rounded-full"></div>

      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--tt-text-muted)] mb-6 font-medium">
          <Link href="/shop" className="hover:text-red-500 transition-colors">
            {t("breadcrumb_catalog")}
          </Link>
          <span>/</span>
          <span className="text-[var(--tt-text-main)] font-semibold">{t("breadcrumb_cart")}</span>
        </div>

        {cartItems.length > 0 ? (
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/15 text-red-500 border border-red-500/30 mb-2">
                  <IconCart className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span>{t("cards_selected", { count: totalCount })}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--tt-text-main)] tracking-tight">
                  {t("title")}
                </h1>
                <p className="text-sm text-[var(--tt-text-muted)] mt-1">
                  {t("cards_consolidated_desc")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs text-[var(--tt-text-muted)] hover:text-red-500 transition-colors flex items-center gap-1.5 self-start sm:self-auto py-2 px-3 rounded-xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-canvas)] cursor-pointer shadow-sm"
              >
                <IconTrash className="w-3.5 h-3.5" />
                <span>{t("clear_cart")}</span>
              </button>
            </div>

            {/* Cart Table Container */}
            <div className="bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl shadow-xl overflow-hidden mb-8">
              {/* Table Column Headers (Desktop) */}
              <div className="hidden sm:grid grid-cols-12 gap-4 py-4 px-6 border-b border-[var(--tt-border-subtle)] bg-[var(--tt-bg-subtle)] text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)]">
                <div className="col-span-5">{t("table_header_product")}</div>
                <div className="col-span-2 text-center">{t("table_header_unit_price")}</div>
                <div className="col-span-2 text-center">{t("table_header_quantity")}</div>
                <div className="col-span-2 text-right">{t("table_header_subtotal")}</div>
                <div className="col-span-1 text-right">{t("table_header_action")}</div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[var(--tt-border-subtle)]">
                {cartItems.map((item, key) => (
                  <SingleItem item={item} key={key} />
                ))}
              </div>
            </div>

            {/* Bottom Row: Coupons & Summary */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <Discount />
              <OrderSummary />
            </div>
          </div>
        ) : (
          <div className="py-24 text-center flex flex-col items-center justify-center rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] p-8 shadow-2xl">
            <div className="w-24 h-24 rounded-3xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] flex items-center justify-center text-[var(--tt-text-muted)] mb-6 shadow-inner">
              <IconCard className="w-12 h-12 opacity-60" />
            </div>
            <h2 className="text-2xl font-black text-[var(--tt-text-main)] mb-2 tracking-tight">
              {t("empty")}
            </h2>
            <p className="text-sm text-[var(--tt-text-muted)] max-w-md mb-8 leading-relaxed">
              {t("emptyDescription")}
            </p>
            <Link
              href="/shop"
              className="px-8 py-3.5 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#E10E0E]/30 transition-all active:scale-95 flex items-center gap-2"
            >
              <span>{t("continueShopping")}</span>
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
