import { selectTotalPrice, selectTotalDiscount, selectCartItemsWithDiscounts } from "@/redux/features/cart-slice";
import React from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { IconTag } from "@/components/ui/Icons";

const OrderSummary = () => {
  const cartItems = useSelector(selectCartItemsWithDiscounts);
  const totalPrice = useSelector(selectTotalPrice);
  const totalDiscount = useSelector(selectTotalDiscount);

  const totalItemCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="lg:max-w-[420px] w-full">
      <div className="bg-[#0E121B] border border-white/10 rounded-2xl shadow-xl overflow-hidden sticky top-32">
        {/* Header */}
        <div className="border-b border-white/10 py-5 px-6 bg-white/[0.02]">
          <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center justify-between">
            <span>Resumen del Pedido</span>
            <span className="text-xs font-mono font-medium text-gray-400">
              {totalItemCount} {totalItemCount === 1 ? "carta" : "cartas"}
            </span>
          </h3>
        </div>

        <div className="p-6 space-y-4">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Subtotal Productos</span>
            <span className="font-mono font-bold text-white">
              ${Math.round(totalPrice + totalDiscount).toLocaleString("es-CL")} CLP
            </span>
          </div>

          {/* Savings */}
          {totalDiscount > 0 && (
            <div className="flex items-center justify-between text-sm py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <IconTag className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Descuento Cupones
              </span>
              <span className="font-mono font-bold text-emerald-400">
                -${Math.round(totalDiscount).toLocaleString("es-CL")} CLP
              </span>
            </div>
          )}

          {/* Delivery Note */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
            <span>Cálculo de Envío</span>
            <span className="text-gray-300 font-medium">Cotizado en Checkout</span>
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-white/10 flex items-baseline justify-between">
            <div>
              <span className="text-base font-bold text-white block">Total a Pagar</span>
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                Precios directos de tienda • 0% comisión
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-white">
                ${Math.round(totalPrice).toLocaleString("es-CL")}
              </span>
              <span className="text-xs text-gray-400 font-sans ml-1">CLP</span>
            </div>
          </div>

          {/* Checkout CTA Button */}
          <Link
            href="/checkout"
            className="w-full h-12 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#E10E0E]/30 flex items-center justify-center gap-2 transition-all active:scale-98 mt-2"
          >
            <span>Proceder al Checkout</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>

          {/* Security Features */}
          <div className="pt-3 border-t border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-emerald-400 text-sm">✓</span>
              <span>Transacciones seguras con Mercado Pago & Webpay</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-emerald-400 text-sm">✓</span>
              <span>Retiro en Tienda $0 o envíos Chilexpress & Starken</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
