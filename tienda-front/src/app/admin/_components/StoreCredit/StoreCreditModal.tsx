import React from "react";
import { Button } from "@/components/ui/Button";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { useStoreCreditForm } from "./hooks/useStoreCreditForm";
import UserSearch from "./components/UserSearch";
import TradeInCardList from "./components/TradeInCardList";
import type { AdjustmentType, StoreCreditUser } from "./types/store-credit.types";

interface StoreCreditModalProps {
  preselectedUser: StoreCreditUser | null;
  defaultType?: AdjustmentType;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Modal for adjusting a user's store credit balance.
 *
 * After refactoring, this component is purely presentational.
 * All state and logic live in `useStoreCreditForm`.
 * Sub-sections are composed from focused child components.
 */
export default function StoreCreditModal({
  preselectedUser,
  defaultType = "MANUAL_ADD",
  onClose,
  onSuccess,
}: StoreCreditModalProps) {
  const form = useStoreCreditForm({ preselectedUser, defaultType, onSuccess });

  return (
    <div className="p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
      <h2 className="text-xl font-bold text-white mb-6">
        Ajustar Saldo (Store Credit)
      </h2>

      <form onSubmit={form.handleSubmit} className="space-y-6">
        {/* ── User Selection ── */}
        <UserSearch
          searchTerm={form.userSearchTerm}
          onSearchChange={form.setUserSearchTerm}
          searchResults={form.userSearchResults}
          searching={form.searchingUsers}
          selectedUser={form.selectedUser}
          preselectedUser={form.preselectedUser}
          onSelectUser={form.selectUser}
          onClearUser={form.clearUser}
        />

        {/* ── Amount ── */}
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-4 uppercase">
              Monto Total ($ SC)
            </label>
            <input
              type="number"
              min="1"
              required
              value={form.amount}
              readOnly={form.tradeInCards.length > 0}
              onChange={(e) => form.setAmount(Number(e.target.value))}
              className={`w-full bg-[#0f1115] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold outline-none ${
                form.tradeInCards.length > 0
                  ? "text-gray-4 cursor-not-allowed"
                  : form.type === "MANUAL_ADD"
                    ? "text-green-400 focus:border-blue"
                    : "text-red-400 focus:border-blue"
              }`}
              placeholder="Ej: 5000"
            />
          </div>
        </div>

        {/* ── Products Section ── */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="text-lg">{form.type === "MANUAL_ADD" ? "🃏" : "🛒"}</span>
            {form.type === "MANUAL_ADD"
              ? "Productos Recibidos (Trade-in)"
              : "Productos Comprados por el Cliente"}
            <span className="text-gray-4 text-xs font-normal normal-case">(Opcional)</span>
          </h3>

          {/* Product Search Filters */}
          <div className="p-4 bg-[#111318] rounded-xl border border-white/10 space-y-3 relative">
            <div className="relative z-[60] grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder={
                  form.type === "MANUAL_ADD"
                    ? "Buscar en catálogo global..."
                    : "Buscar en tu inventario..."
                }
                value={form.cardSearchTerm}
                onChange={(e) => form.setCardSearchTerm(e.target.value)}
                className="w-full bg-[#0f1115] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-blue outline-none"
              />
              <SearchableSelect
                options={[
                  { label: "Todas las Categorías", value: "" },
                  ...form.categories.map((c) => ({ label: c.name, value: c.name })),
                ]}
                value={form.selectedCategory}
                onChange={form.setSelectedCategory}
                placeholder="Categorías"
              />
              <SearchableSelect
                options={[
                  {
                    label: !form.selectedCategory
                      ? "Elige Categoría..."
                      : "Todas las Expansiones",
                    value: "",
                  },
                  ...form.expansions.map((e) => ({ label: e.name, value: e.name })),
                ]}
                value={form.selectedExpansion}
                onChange={form.setSelectedExpansion}
                placeholder={
                  !form.selectedCategory ? "Elige Categoría..." : "Buscar expansión..."
                }
                disabled={!form.selectedCategory}
              />
            </div>

            {form.searchingCards && <p className="text-xs text-blue">Buscando...</p>}

            {/* Search Results Dropdown */}
            {form.cardSearchResults.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-[#0f1115] border border-white/10 rounded-xl max-h-60 overflow-y-auto p-2 space-y-1 shadow-2xl">
                {form.cardSearchResults.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => form.addCard(product)}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded cursor-pointer"
                  >
                    <div className="w-8 h-10 bg-black rounded overflow-hidden flex-shrink-0">
                      {product.imageUrl && (
                        <img src={product.imageUrl} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-4">{product.setName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected Cards */}
          <TradeInCardList
            cards={form.tradeInCards}
            conditions={form.conditions}
            languages={form.languages}
            finishes={form.finishes}
            onUpdateCard={form.updateCard}
            onRemoveCard={form.removeCard}
          />
        </div>

        {/* ── Reference ── */}
        <div className="space-y-2 border-t border-white/10 pt-4">
          <label className="text-xs font-bold text-gray-4 uppercase">
            Notas / Referencia Adicional
          </label>
          <input
            type="text"
            value={form.reference}
            onChange={(e) => form.setReference(e.target.value)}
            className="w-full bg-[#0f1115] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue outline-none"
            placeholder={
              form.tradeInCards.length > 0
                ? form.type === "MANUAL_ADD"
                  ? "Ej: Cartas recibidas en evento"
                  : "Ej: Compra presencial en tienda"
                : "Ej: Ajuste manual por error"
            }
            required={form.tradeInCards.length === 0}
          />
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancelar
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={form.loading || !form.selectedUser || (!form.amount && form.amount !== 0)}
          >
            {form.loading ? "Procesando..." : "Confirmar Transacción"}
          </Button>
        </div>
      </form>
    </div>
  );
}
