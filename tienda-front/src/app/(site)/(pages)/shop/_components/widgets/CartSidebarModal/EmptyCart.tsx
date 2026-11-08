import React from "react";
import Link from "next/link";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { IconCard } from "@/components/ui/Icons";
import { useTranslations } from "next-intl";

const EmptyCart = () => {
  const { closeCartModal } = useCartModalContext();
  const t = useTranslations("cart");

  return (
    <div className="py-16 px-4 text-center flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] flex items-center justify-center mb-5 shadow-inner">
        <IconCard className="w-10 h-10 text-[var(--tt-text-muted)] opacity-60" />
      </div>

      <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">
        {t("empty")}
      </h3>
      <p className="text-xs text-[var(--tt-text-muted)] mb-6 max-w-xs leading-relaxed">
        {t("emptyDescription")}
      </p>

      <Link
        onClick={() => closeCartModal()}
        href="/shop"
        className="px-6 py-3 rounded-xl bg-[#E10E0E] hover:bg-[#F23030] text-white font-bold text-xs tracking-wide shadow-lg shadow-[#E10E0E]/25 transition-all active:scale-95"
      >
        {t("continueShopping")} →
      </Link>
    </div>
  );
};

export default EmptyCart;
