import React from 'react';
import Image from 'next/image';
import { IconCart, IconRepeat, IconCash, IconWallet } from '@/components/ui/Icons';

export interface PosBuyCartItem {
  id: string; // id temporal
  productId: string;
  name: string;
  imageUrl?: string | null;
  expansion?: string | null;
  collectorNum?: string | null;
  rarity?: string | null;
  conditionId: string;
  conditionName: string;
  languageId: string;
  languageCode: string;
  finishId?: string;
  finishName?: string;
  quantity: number;
  // Precios cotizados
  cashPrice: number;
  creditPrice: number;
  isFromBuylist: boolean;
}

interface PosBuyCartProps {
  items: PosBuyCartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onUpdatePrices: (id: string, cashPrice: number, creditPrice: number) => void;
  onUpdateCondition: (id: string, conditionId: string, conditionName: string) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onProceedPayout: () => void;
  conditions: Array<{ id: string; name: string; displayName?: string | null }>;
}

export default function PosBuyCart({
  items,
  onUpdateQuantity,
  onUpdatePrices,
  onUpdateCondition,
  onRemoveItem,
  onClearCart,
  onProceedPayout,
  conditions,
}: PosBuyCartProps) {
  const totalCash = items.reduce((acc, i) => acc + i.cashPrice * i.quantity, 0);
  const totalCredit = items.reduce((acc, i) => acc + i.creditPrice * i.quantity, 0);
  const totalItemsCount = items.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="flex flex-col h-full bg-[#0E121B] rounded-2xl border border-emerald-500/30 shadow-xl overflow-hidden">
      {/* Cabecera del Ticket de Compra */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-emerald-950/20">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <h2 className="text-sm font-black text-emerald-400 tracking-wide uppercase">
            Comprar Cartas (Trade-In)
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            {totalItemsCount} {totalItemsCount === 1 ? 'carta' : 'cartas'}
          </span>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearCart}
            type="button"
            className="text-xs text-white/40 hover:text-red transition-colors flex items-center gap-1"
          >
            <span>Vaciar</span>
          </button>
        )}
      </div>

      {/* Lista de cartas a recibir */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-white/30 space-y-2">
            <IconRepeat className="w-12 h-12 text-emerald-500/40" />
            <p className="text-sm font-medium text-white/60">Lista de compra vacía</p>
            <p className="text-xs text-white/30 max-w-xs">
              Busca cartas del catálogo para comprarlas al cliente. Si la tienes en Buylist, los precios se aplicarán solos.
            </p>
          </div>
        ) : (
          items.map((item) => {
            const lineCash = item.cashPrice * item.quantity;
            const lineCredit = item.creditPrice * item.quantity;

            return (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-black/40 border border-white/10 flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-contain p-0.5"
                          sizes="40px"
                          unoptimized={true}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px] font-mono">
                          TCG
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-white truncate">
                          {item.name}
                        </p>
                        {item.isFromBuylist ? (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black text-emerald-400">
                            En Buylist
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/30 text-[9px] font-bold text-amber-300">
                            Manual
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-white/50 flex-wrap">
                        {item.expansion && <span>{item.expansion}</span>}
                        {item.collectorNum && <span>#{item.collectorNum}</span>}
                        {item.rarity && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-[9px] font-bold text-amber-300 capitalize">
                            {item.rarity}
                          </span>
                        )}
                        <span>• Idioma: {item.languageCode}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    type="button"
                    className="text-white/30 hover:text-red p-1 transition-colors"
                    title="Eliminar de la lista"
                  >
                    ✕
                  </button>
                </div>

                {/* Ajustes de Estado y Precios */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5 text-xs">
                  {/* Selector de Estado / Condición */}
                  <div>
                    <label className="text-[10px] font-bold text-white/40 block mb-1 uppercase">
                      Estado
                    </label>
                    <select
                      value={item.conditionId}
                      onChange={(e) => {
                        const cond = conditions.find((c) => c.id === e.target.value);
                        onUpdateCondition(item.id, e.target.value, cond?.displayName || cond?.name || 'NM');
                      }}
                      className="w-full bg-[#07090E] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {conditions.map((cond) => (
                        <option key={cond.id} value={cond.id}>
                          {cond.displayName || cond.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Precio Efectivo (Cash) */}
                  <div>
                    <label className="text-[10px] font-bold text-emerald-400/80 block mb-1 uppercase">
                      Pagas Cash (CLP)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={item.cashPrice}
                      onChange={(e) => onUpdatePrices(item.id, Math.max(0, Number(e.target.value)), item.creditPrice)}
                      className="w-full bg-[#07090E] border border-white/10 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Precio Crédito de Tienda */}
                  <div>
                    <label className="text-[10px] font-bold text-blue-400/80 block mb-1 uppercase">
                      Pagas Crédito (CLP)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={item.creditPrice}
                      onChange={(e) => onUpdatePrices(item.id, item.cashPrice, Math.max(0, Number(e.target.value)))}
                      className="w-full bg-[#07090E] border border-white/10 rounded-lg px-2 py-1 text-xs font-mono font-bold text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Cantidad y subtotal de la línea */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-white/50">Cantidad:</span>
                    <div className="flex items-center gap-1 bg-[#07090E] rounded-lg border border-white/10 p-0.5">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        type="button"
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/70 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        type="button"
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/70 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right">
                    <div className="text-[11px] font-mono text-emerald-400">
                      Cash: <span className="font-bold">${lineCash.toLocaleString('es-CL')}</span>
                    </div>
                    <div className="text-[11px] font-mono text-cyan-300">
                      Crédito: <span className="font-bold">${lineCredit.toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resumen de Pago al Cliente */}
      <div className="p-4 bg-white/[0.02] border-t border-white/10 space-y-3">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-white/70">
            <span className="flex items-center gap-1.5">
              <IconWallet className="w-3.5 h-3.5 text-cyan-400" />
              Total en Crédito de Tienda (+bono buylist)
            </span>
            <span className="font-mono text-cyan-400 text-sm font-bold">
              ${totalCredit.toLocaleString('es-CL')} CLP
            </span>
          </div>

          <div className="flex justify-between items-center text-white/70">
            <span className="flex items-center gap-1.5">
              <IconCash className="w-3.5 h-3.5 text-emerald-400" />
              Total en Efectivo / Cash
            </span>
            <span className="font-mono text-emerald-400 text-sm font-bold">
              ${totalCash.toLocaleString('es-CL')} CLP
            </span>
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs text-white/40">
            <span>Diferencia si recibe efectivo vs. crédito:</span>
            <span className="font-mono text-amber-300">
              {totalCredit > totalCash
                ? `+$${(totalCredit - totalCash).toLocaleString('es-CL')} en crédito`
                : 'Mismo valor'}
            </span>
          </div>
        </div>

        <button
          onClick={onProceedPayout}
          disabled={items.length === 0}
          type="button"
          className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-sm font-black tracking-wider uppercase transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <span>Pagar / Abonar al Cliente</span>
          <span className="font-mono text-base">• ${totalCredit.toLocaleString('es-CL')} SC</span>
        </button>
      </div>
    </div>
  );
}

