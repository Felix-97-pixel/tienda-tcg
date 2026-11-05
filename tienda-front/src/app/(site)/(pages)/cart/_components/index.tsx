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
import { IconCart, IconCard } from "@/components/ui/Icons";

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
    <div className="bg-[#07090E] min-h-screen text-white pt-28 md:pt-36 pb-24 relative overflow-hidden">
      {/* Ambient background light */}
      <div className="absolute top-20 left-1/3 w-[600px] h-[350px] bg-red-600/10 blur-[150px] pointer-events-none rounded-full"></div>

      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6 font-medium">
          <Link href="/shop" className="hover:text-white transition-colors">
            {t("breadcrumb_catalog")}
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">{t("breadcrumb_cart")}</span>
        </div>

        {cartItems.length > 0 ? (
          <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/15 text-red-400 border border-red-500/30 mb-2">
                  <IconCart className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>{t("cards_selected", { count: totalCount })}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {t("title")}
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                  {t("cards_consolidated_desc")}
                </p>
              </div>

              <button
                type="button"
                onClick={handleClearCart}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1.5 self-start sm:self-auto py-2 px-3 rounded-lg border border-white/5 hover:border-red-500/20 bg-white/[0.02]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
                <span>{t("clear_cart")}</span>
              </button>
            </div>

            {/* Cart Table Container */}
            <div className="bg-[#0E121B] border border-white/10 rounded-2xl shadow-xl overflow-hidden mb-8">
              {/* Table Column Headers (Desktop) */}
              <div className="hidden sm:grid grid-cols-12 gap-4 py-4 px-6 border-b border-white/10 bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-gray-400">
                <div className="col-span-5">{t("table_header_product")}</div>
                <div className="col-span-2 text-center">{t("table_header_unit_price")}</div>
                <div className="col-span-2 text-center">{t("table_header_quantity")}</div>
                <div className="col-span-2 text-right">{t("table_header_subtotal")}</div>
                <div className="col-span-1 text-right">{t("table_header_action")}</div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-white/5">
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
          <div className="py-24 text-center flex flex-col items-center justify-center rounded-3xl bg-[#0E121B] border border-white/10 p-8 shadow-2xl">
            <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-gray-500 mb-6 shadow-inner">
              <IconCard className="w-12 h-12 opacity-60" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
              {t("empty")}
            </h2>
            <p className="text-sm text-gray-400 max-w-md mb-8 leading-relaxed">
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
