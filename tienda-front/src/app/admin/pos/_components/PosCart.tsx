"use client";
import React, { useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { IconTrash, IconCart } from '@/components/ui/Icons';

export interface PosCartItem {
  inventoryItemId: string;
  productId: string;
  name: string;
  imageUrl?: string | null;
  expansion?: string | null;
  collectorNum?: string | null;
  rarity?: string | null;
  conditionLabel?: string;
  languageCode?: string;
  finishLabel?: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

interface PosCartProps {
  items: PosCartItem[];
  onUpdateQuantity: (inventoryItemId: string, newQty: number) => void;
  onRemoveItem: (inventoryItemId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  discountAmount: number;
  onSetDiscountAmount: (val: number) => void;
}

export default function PosCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  discountAmount,
  onSetDiscountAmount,
}: PosCartProps) {
  const t = useTranslations("admin.pos_page");
  const subtotal = items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
  const total = Math.max(0, subtotal - discountAmount);
  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0);

  // Atajo de teclado F10 para abrir el cobro
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F10') {
        e.preventDefault();
        if (items.length > 0) {
          onCheckout();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, onCheckout]);

  return (
    <div className="flex flex-col h-full bg-[#0E121B] rounded-2xl border border-white/10 shadow-xl overflow-hidden">
      {/* Cabecera del Ticket */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white tracking-wide">
            {t("sale_ticket_title")}
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-red/10 border border-red/30 text-red text-xs font-mono font-bold">
            {totalItemsCount} {totalItemsCount === 1 ? t('item_singular') : t('item_plural')}
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearCart}
            type="button"
            className="text-xs text-white/40 hover:text-red transition-colors flex items-center gap-1"
          >
            <IconTrash className="w-3.5 h-3.5" />
            <span>{t("clear_btn")}</span>
          </button>
        )}
      </div>

      {/* Lista de Productos en el Carrito */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-white/30 space-y-2">
            <IconCart className="w-12 h-12" />
            <p className="text-sm font-medium">{t("empty_cart")}</p>
            <p className="text-xs text-white/20">{t("empty_cart_desc")}</p>
          </div>
        ) : (
          items.map((item) => {
            const lineTotal = item.unitPrice * item.quantity;
            return (
              <div
                key={item.inventoryItemId}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all gap-3"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {item.imageUrl ? (
                    <div className="relative w-11 h-15 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-contain p-0.5"
                        sizes="44px"
                        unoptimized={true}
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-15 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-white/30 text-[10px] font-mono flex-shrink-0">
                      TCG
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-white/50 flex-wrap">
                      {item.conditionLabel && (
                        <span className="text-red font-semibold">{item.conditionLabel}</span>
                      )}
                      {item.expansion && (
                        <span className="text-white/60">{item.expansion}</span>
                      )}
                      {item.collectorNum && (
                        <span className="font-mono text-white/40">#{item.collectorNum}</span>
                      )}
                      {item.rarity && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-300 capitalize">
                          {item.rarity}
                        </span>
                      )}
                      {item.languageCode && <span>• {item.languageCode}</span>}
                      {item.finishLabel && <span className="text-purple-400">({item.finishLabel})</span>}
                    </div>
                    <p className="text-xs font-mono font-medium text-white/70 mt-1">
                      ${item.unitPrice.toLocaleString('es-CL')} {t("each_short")}
                    </p>
                  </div>
                </div>

                {/* Controles de Cantidad y Total de Línea */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1 bg-[#07090E] rounded-lg border border-white/10 p-0.5">
                    <button
                      onClick={() => onUpdateQuantity(item.inventoryItemId, item.quantity - 1)}
                      type="button"
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="w-7 text-center font-mono font-bold text-xs text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.inventoryItemId, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      type="button"
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-white/70 hover:text-white disabled:opacity-30 transition-colors text-xs font-bold"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-xs font-mono font-bold text-white">
                    ${lineTotal.toLocaleString('es-CL')} CLP
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resumen Financiero y Botón de Cobro */}
      <div className="p-4 bg-white/[0.02] border-t border-white/10 space-y-3">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-white/60">
            <span>{t("subtotal_label")}</span>
            <span className="font-mono font-semibold">${subtotal.toLocaleString('es-CL')} CLP</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>{t("discount_applied")}</span>
              <span className="font-mono font-semibold">-${discountAmount.toLocaleString('es-CL')} CLP</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
            <span>{t("total_to_charge")}</span>
            <span className="font-mono text-xl text-red-light">
              ${total.toLocaleString('es-CL')} CLP
            </span>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          type="button"
          className="w-full py-4 rounded-xl bg-red hover:bg-red-light disabled:opacity-40 disabled:hover:bg-red text-white text-sm font-black tracking-wider uppercase transition-all shadow-lg shadow-red/20 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>{t("charge_f10_btn")}</span>
          <span className="font-mono text-base">• ${total.toLocaleString('es-CL')} CLP</span>
        </button>
      </div>
    </div>
  );
}
