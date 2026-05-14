"use client";
import React from "react";
import { useTranslations } from "next-intl";
import SearchableSelect from "@/components/Common/SearchableSelect";

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedExpansion: string;
  onExpansionChange: (val: string) => void;
  categories: { id: string, name: string }[];
  expansions: { name: string, products: number }[];
}

export default function ProductFilters({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedExpansion,
  onExpansionChange,
  categories,
  expansions
}: ProductFiltersProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");

  return (
    <div className="bg-white rounded-2xl shadow-1 p-5 mb-6">
      <p className="text-sm font-medium text-dark mb-3">{tc("filters")}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-dark-4">{tc("search")}</label>
          <input 
            type="text" 
            placeholder={t("filters.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-gray-3 bg-gray-1 py-2 px-4 text-sm outline-none focus:border-blue transition-all" 
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("filters.category")}</label>
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
        <div>
          <label className="mb-1.5 block text-xs font-medium text-dark-4">{t("filters.expansion")}</label>
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
      </div>
    </div>
  );
}
