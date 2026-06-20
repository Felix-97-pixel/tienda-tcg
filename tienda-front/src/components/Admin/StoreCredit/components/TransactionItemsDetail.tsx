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
          {items.map((item, i) => (
            <div
              key={i}
              className="flex gap-4 p-3 bg-white/[0.02] rounded-xl border border-white/5"
            >
              <div className="w-12 h-16 bg-black rounded shrink-0 overflow-hidden">
                {item.product?.imageUrl && (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-white text-sm">
                  {item.product?.name || "Producto"}
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
                    ${Number(item.price).toLocaleString("es-CL")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
