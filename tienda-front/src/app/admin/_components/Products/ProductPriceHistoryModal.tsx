"use client";
import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Product } from "@/types/product";
import { IconTrendingUp } from "@/components/ui/Icons";
import dynamic from "next/dynamic";

const PriceHistoryChart = dynamic(
  () => import("@/app/(site)/(pages)/shop-details/_components/PriceHistoryChart"),
  { ssr: false }
);

export interface ProductPriceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductPriceHistoryModal({
  isOpen,
  onClose,
  product,
}: ProductPriceHistoryModalProps) {
  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="5xl"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <IconTrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {product.name}
              {product.cardDetail?.expansion && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                  {product.cardDetail.expansion}
                </span>
              )}
            </h3>
            <p className="text-xs text-white/50">
              Historial de Cotizaciones Oficiales de Mercado (TCGPlayer / Scryfall)
            </p>
          </div>
        </div>
      }
    >
      <div className="p-1">
        <PriceHistoryChart productId={product.id} productSlug={product.slug || undefined} />
      </div>
    </Modal>
  );
}

