"use client";
import React from "react";
import { useTranslations } from "next-intl";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Input } from "@/components/ui/Input";

export interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedExpansion?: string;
  onExpansionChange?: (val: string) => void;
  categories: { id: string, name: string }[];
  expansions?: { name: string, products: number }[];
  publishState?: string;
  onPublishStateChange?: (val: string) => void;
}

export default function ProductFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedExpansion,
  onExpansionChange,
  categories,
  expansions,
  publishState,
  onPublishStateChange
}: ProductFiltersProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");

  return (
    <div className="bg-[#0E121B] rounded-2xl border border-white/10 shadow-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
        <p className="text-xs font-black uppercase tracking-wider text-white/70">{tc("filters")}</p>
        <div className="flex items-center gap-6">
          {publishState !== undefined && onPublishStateChange && (
            <div className="flex bg-[#080B12] p-1 rounded-xl border border-white/10">
              <button
                onClick={() => onPublishStateChange('all')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${publishState === 'all' ? 'bg-gradient-to-r from-red-dark to-red text-white shadow-md shadow-red/25 ring-1 ring-white/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                Todos
              </button>
              <button
                onClick={() => onPublishStateChange('published')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${publishState === 'published' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/40' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                Publicados
              </button>
              <button
                onClick={() => onPublishStateChange('paused')}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${publishState === 'paused' ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-1 ring-amber-300/40' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                Pausados
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <Input
            label={tc("search")}
            type="text"
            placeholder={t("filters.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-white/70">{t("filters.category")}</label>
          <SearchableSelect
            options={[
              { label: t("filters.allCategories"), value: "" },
              ...categories.map(c => ({ label: c.name, value: c.name }))
            ]}
            value={selectedCategory}
            onChange={onCategoryChange}
            placeholder={t("filters.allCategories")}
          />
        </div>
        {expansions && selectedExpansion !== undefined && onExpansionChange && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/70">{t("filters.expansion")}</label>
            <SearchableSelect
              options={[
                { label: t("filters.allExpansions"), value: "" },
                ...expansions.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))
              ]}
              value={selectedExpansion}
              onChange={onExpansionChange}
              placeholder={t("filters.allExpansions")}
              disabled={expansions.length === 0}
            />
          </div>
        )}
      </div>
    </div>
  );
}
