import React from "react";
import Link from "next/link";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";

const EmptyCart = () => {
  const { closeCartModal } = useCartModalContext();

  return (
    <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-4xl mb-5 shadow-inner">
        🃏
      </div>

      <h3 className="text-lg font-bold text-white mb-2">
        Tu carrito está vacío
      </h3>
      <p className="text-xs text-gray-400 mb-6 max-w-xs leading-relaxed">
        Explora las vitrinas de tiendas y coleccionistas verificados para encontrar tus cartas singles y boosters.
      </p>

      <Link
        onClick={() => closeCartModal()}
        href="/shop"
        className="px-6 py-3 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#E10E0E]/25 transition-all active:scale-95"
      >
        Explorar Catálogo TCG →
      </Link>
    </div>
  );
};

export default EmptyCart;
