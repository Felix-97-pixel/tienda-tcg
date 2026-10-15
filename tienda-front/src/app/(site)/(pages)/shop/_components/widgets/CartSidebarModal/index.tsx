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

const CartSidebarModal = () => {
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
          className={`w-screen max-w-md bg-[#0B0E17] border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out modal-content ${
            isCartModalOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 bg-[#0E121B] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <h2 className="font-extrabold text-white text-lg tracking-tight">
                Tu Carrito TCG
              </h2>
              {cartItems.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#E10E0E]/15 text-red-400 border border-[#E10E0E]/30">
                  {totalCount} {totalCount === 1 ? "carta" : "cartas"}
                </span>
              )}
            </div>

            <button
              onClick={() => closeCartModal()}
              aria-label="Cerrar carrito"
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Carrier Notice */}
          <div className="bg-[#111522] border-b border-white/5 px-6 py-2.5 flex items-center gap-2 text-[11px] text-gray-400 shrink-0">
            <span className="text-sm">🚚</span>
            <span>
              Envíos oficiales <strong className="text-gray-300">Chilexpress</strong> & <strong className="text-gray-300">Starken</strong> • <strong className="text-emerald-400">Retiro $0</strong>
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
            <div className="border-t border-white/10 bg-[#0E121B] p-6 space-y-4 shrink-0 shadow-lg">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wider block font-medium">
                    Subtotal Estimado
                  </span>
                  <span className="text-[10px] text-gray-500">
                    Envíos calculados al finalizar compra
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white font-mono">
                    ${Math.round(totalPrice).toLocaleString("es-CL")}{" "}
                    <span className="text-xs font-sans font-normal text-gray-400">CLP</span>
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
                  <span>Continuar al Checkout</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </Link>

                <Link
                  onClick={() => closeCartModal()}
                  href="/cart"
                  className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold text-xs flex items-center justify-center transition-all"
                >
                  Ver Carrito Detallado
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
