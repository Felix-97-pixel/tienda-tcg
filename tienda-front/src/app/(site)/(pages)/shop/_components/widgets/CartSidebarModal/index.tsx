"use client";
import React, { useEffect } from "react";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import {
  removeItemFromCart,
  selectTotalPrice,
  selectCartItems,
} from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import SingleItem from "./SingleItem";
import Link from "next/link";
import EmptyCart from "./EmptyCart";
import { IconTruck, IconX, IconArrowRight } from "@/components/ui/Icons";
import { useTranslations } from "next-intl";

const CartSidebarModal = () => {
  const t = useTranslations("cart");
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const cartItems = useAppSelector(selectCartItems);
  const totalPrice = useSelector(selectTotalPrice);

  const totalCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (!event.target.closest(".modal-content")) {
        closeCartModal();
      }
    }

    if (isCartModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartModalOpen, closeCartModal]);

  return (
    <div
      className={`fixed inset-0 z-[99999] overflow-hidden bg-black/80 backdrop-blur-md transition-opacity duration-300 ${
        isCartModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md bg-[var(--tt-bg-canvas)] border-l border-[var(--tt-border-medium)] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out modal-content ${
            isCartModalOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <h2 className="font-extrabold text-[var(--tt-text-main)] text-lg tracking-tight">
                {t("title")}
              </h2>
              {cartItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#E10E0E]/15 text-red dark:text-red-400 border border-[#E10E0E]/30">
                  {totalCount} {totalCount === 1 ? t("card_singular") : t("card_plural")}
                </span>
              )}
            </div>

            <button
              onClick={() => closeCartModal()}
              aria-label={t("close_cart_aria")}
              className="w-8 h-8 rounded-full bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-canvas)] border border-[var(--tt-border-medium)] flex items-center justify-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] transition-all active:scale-95"
            >
              <IconX className="w-4 h-4" />
            </button>
          </div>

          {/* Carrier Notice */}
          <div className="bg-[var(--tt-bg-subtle)] border-b border-[var(--tt-border-subtle)] px-6 py-2.5 flex items-center gap-2 text-[11px] text-[var(--tt-text-muted)] shrink-0">
            <IconTruck className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
            <span>
              {t("official_shipping_prefix")} <strong className="text-[var(--tt-text-main)]">Chilexpress</strong> & <strong className="text-[var(--tt-text-main)]">Starken</strong> • <strong className="text-emerald-600 dark:text-emerald-400">{t("pickup_free_badge")}</strong>
            </span>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <SingleItem
                  key={item.id}
                  item={item}
                  removeItemFromCart={removeItemFromCart}
                />
              ))
            ) : (
              <EmptyCart />
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] p-6 space-y-4 shrink-0 shadow-lg">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[var(--tt-text-muted)] uppercase tracking-wider block font-medium">
                    {t("subtotal")}
                  </span>
                  <span className="text-[10px] text-[var(--tt-text-muted)]">
                    {t("quoted_at_checkout")}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-[var(--tt-text-main)] font-mono">
                    ${Math.round(totalPrice).toLocaleString("es-CL")}{" "}
                    <span className="text-xs font-sans font-normal text-[var(--tt-text-muted)]">CLP</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  onClick={() => closeCartModal()}
                  href="/checkout"
                  className="w-full h-12 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#E10E0E]/30 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <span>{t("checkout")}</span>
                  <IconArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  onClick={() => closeCartModal()}
                  href="/cart"
                  className="w-full h-10 rounded-xl bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-canvas)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] font-semibold text-xs flex items-center justify-center transition-all"
                >
                  {t("breadcrumb_cart")}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartSidebarModal;
