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
    <div className="bg-[#1a1d24] rounded-2xl shadow-1 p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-white">{tc("filters")}</p>
        <div className="flex items-center gap-6">
          {publishState !== undefined && onPublishStateChange && (
            <div className="flex bg-black/20 p-1 rounded-lg border border-white/5">
              <button
                onClick={() => onPublishStateChange('all')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${publishState === 'all' ? 'bg-blue text-white shadow-sm' : 'text-gray-4 hover:text-white hover:bg-white/10'}`}
              >
                Todos
              </button>
              <button
                onClick={() => onPublishStateChange('published')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${publishState === 'published' ? 'bg-green text-white shadow-sm' : 'text-gray-4 hover:text-white hover:bg-white/10'}`}
              >
                Publicados
              </button>
              <button
                onClick={() => onPublishStateChange('paused')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${publishState === 'paused' ? 'bg-yellow text-white shadow-sm' : 'text-gray-4 hover:text-white hover:bg-white/10'}`}
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
          <label className="mb-1.5 block text-xs font-medium text-gray-4">{t("filters.category")}</label>
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
            <label className="mb-1.5 block text-xs font-medium text-gray-4">{t("filters.expansion")}</label>
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
