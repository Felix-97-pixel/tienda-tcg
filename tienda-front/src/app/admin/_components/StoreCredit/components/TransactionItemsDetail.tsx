import React from "react";
import type { TransactionItemData } from "../types/store-credit.types";

interface TransactionItemsDetailProps {
  items: TransactionItemData[];
  onClose: () => void;
}

/**
 * Overlay modal that displays the visual detail of products
 * associated with a store credit transaction.
 *
 * Shows card images, names, attributes (condition/language/finish),
 * quantities, and prices. Extracted from StoreCreditHistoryModal.
 */
export default function TransactionItemsDetail({
  items,
  onClose,
}: TransactionItemsDetailProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#111318] border border-white/10 rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a1d24] rounded-t-2xl">
          <h3 className="font-bold text-white">Detalle de Productos</h3>
          <button
            onClick={onClose}
            className="text-gray-4 hover:text-white text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Items List */}
        <div className="p-4 overflow-y-auto space-y-3">
          {items.map((item, i) => {
            const rawItem = item as any;
            const productName = item.product?.name || rawItem.name || "Producto";
            const imageUrl = item.product?.imageUrl || rawItem.imageUrl;
            const rawPrice = item.price ?? rawItem.creditPrice ?? rawItem.cashPrice ?? 0;
            const parsedPrice = Number(rawPrice);
            const displayPrice = isNaN(parsedPrice)
              ? "0"
              : parsedPrice.toLocaleString("es-CL");

            return (
              <div
                key={i}
                className="flex gap-4 p-3 bg-white/[0.02] rounded-xl border border-white/5"
              >
                <div className="w-12 h-16 bg-black rounded shrink-0 overflow-hidden flex items-center justify-center border border-white/5">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-[10px] text-white/30 text-center font-bold px-1">
                      Sin foto
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">
                    {productName}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-3">
                      {item.condition || "NM"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-3">
                      {item.language || "EN"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-3">
                      {item.finish || "Normal"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-4">
                      Cant: <b className="text-white">{item.quantity}</b>
                    </span>
                    <span className="text-xs font-bold text-blue">
                      ${displayPrice}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
