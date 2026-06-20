import React from "react";
import type { TradeInCard, MetaOption } from "../types/store-credit.types";

interface TradeInCardListProps {
  cards: TradeInCard[];
  conditions: MetaOption[];
  languages: MetaOption[];
  finishes: MetaOption[];
  onUpdateCard: <K extends keyof TradeInCard>(index: number, field: K, value: TradeInCard[K]) => void;
  onRemoveCard: (index: number) => void;
}

/**
 * Renders the list of cards/products added to a trade-in or purchase.
 * Each card shows its image, name, attribute selectors, and quantity/price inputs.
 */
export default function TradeInCardList({
  cards,
  conditions,
  languages,
  finishes,
  onUpdateCard,
  onRemoveCard,
}: TradeInCardListProps) {
  if (cards.length === 0) return null;

  return (
    <div className="space-y-2">
      {cards.map((card, index) => (
        <div
          key={index}
          className="flex items-center gap-3 bg-[#1a1d24] p-3 rounded-xl border border-white/5"
        >
          {/* Card Image */}
          <div className="w-10 h-14 bg-black rounded overflow-hidden flex-shrink-0">
            {card.product.imageUrl && (
              <img
                src={card.product.imageUrl}
                alt={card.product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Card Details */}
          <div className="flex-1">
            <p className="text-sm font-bold text-white leading-tight line-clamp-1">
              {card.product.name}
            </p>

            {/* Attribute Selectors */}
            <div className="flex flex-wrap gap-2 mt-2">
              <AttributeSelect
                label="Condición"
                options={conditions}
                value={card.condition}
                onChange={(v) => onUpdateCard(index, "condition", v)}
              />
              <AttributeSelect
                label="Idioma"
                options={languages}
                value={card.language}
                onChange={(v) => onUpdateCard(index, "language", v)}
              />
              <AttributeSelect
                label="Acabado"
                options={finishes}
                value={card.finish}
                onChange={(v) => onUpdateCard(index, "finish", v)}
              />
            </div>

            {/* Quantity & Price */}
            <div className="flex gap-2 mt-2">
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-4">Cant:</span>
                <input
                  type="number"
                  min="1"
                  className="w-16 bg-[#0f1115] border border-white/10 rounded px-2 py-1 text-xs text-white"
                  value={card.quantity}
                  onChange={(e) => onUpdateCard(index, "quantity", Number(e.target.value))}
                />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-4">Precio SC:</span>
                <input
                  type="number"
                  min="0"
                  className="w-24 bg-[#0f1115] border border-white/10 rounded px-2 py-1 text-xs text-blue font-bold"
                  value={card.price}
                  onChange={(e) => onUpdateCard(index, "price", Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => onRemoveCard(index)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Internal Helper Component ──────────────────────────────────────────────

interface AttributeSelectProps {
  label: string;
  options: MetaOption[];
  value: string;
  onChange: (value: string) => void;
}

function AttributeSelect({ label, options, value, onChange }: AttributeSelectProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-gray-4 uppercase">{label}:</span>
      <select
        className="bg-[#0f1115] border border-white/10 rounded px-1.5 py-1 text-[10px] text-white outline-none focus:border-blue"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.id} value={opt.name}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}
