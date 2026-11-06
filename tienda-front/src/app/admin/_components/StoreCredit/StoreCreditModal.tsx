import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { IconBox, IconCart } from "@/components/ui/Icons";
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
  const t = useTranslations("store_credit_page");
  const form = useStoreCreditForm({ preselectedUser, defaultType, onSuccess });

  return (
    <div className="p-6 max-h-[90vh] overflow-y-auto no-scrollbar">
      <h2 className="text-xl font-bold text-white mb-6">
        {t("adjust_balance_title")}
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
              {t("total_amount_sc")}
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
              placeholder="5000"
            />
          </div>
        </div>

        {/* ── Products Section ── */}
        <div className="space-y-4 border-t border-white/10 pt-4">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            {form.type === "MANUAL_ADD" ? (
              <IconBox className="w-4 h-4 text-emerald-400" />
            ) : (
              <IconCart className="w-4 h-4 text-red" />
            )}
            {form.type === "MANUAL_ADD"
              ? t("products_received_tradein")
              : t("products_purchased_client")}
            <span className="text-white/40 text-xs font-normal normal-case">{t("optional_tag")}</span>
          </h3>

          {/* Product Search Filters */}
          <div className="p-4 bg-[#080B12] rounded-xl border border-white/10 space-y-3 relative">
            <div className="relative z-[60] grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder={
                  form.type === "MANUAL_ADD"
                    ? t("search_global_catalog")
                    : t("search_your_inventory")
                }
                value={form.cardSearchTerm}
                onChange={(e) => form.setCardSearchTerm(e.target.value)}
                className="w-full bg-[#07090E] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:border-red focus:ring-1 focus:ring-red/30 outline-none"
              />
              <SearchableSelect
                options={[
                  { label: t("all_categories"), value: "" },
                  ...form.categories.map((c) => ({ label: c.name, value: c.name })),
                ]}
                value={form.selectedCategory}
                onChange={form.setSelectedCategory}
                placeholder={t("all_categories")}
              />
              <SearchableSelect
                options={[
                  {
                    label: !form.selectedCategory
                      ? t("choose_category")
                      : t("all_expansions"),
                    value: "",
                  },
                  ...form.expansions.map((e) => ({ label: e.name, value: e.name })),
                ]}
                value={form.selectedExpansion}
                onChange={form.setSelectedExpansion}
                placeholder={
                  !form.selectedCategory ? t("choose_category") : t("all_expansions")
                }
                disabled={!form.selectedCategory}
              />
            </div>

            {form.searchingCards && <p className="text-xs text-blue">{t("searching")}</p>}

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
            {t("notes_reference")}
          </label>
          <input
            type="text"
            value={form.reference}
            onChange={(e) => form.setReference(e.target.value)}
            className="w-full bg-[#0f1115] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue outline-none"
            placeholder={t("notes_reference")}
            required={form.tradeInCards.length === 0}
          />
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="secondary" onClick={onClose} type="button">
            {t("btn_cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={form.loading || !form.selectedUser || (!form.amount && form.amount !== 0)}
          >
            {form.loading ? t("btn_processing") : t("btn_confirm_tx")}
          </Button>
        </div>
      </form>
    </div>
  );
}
