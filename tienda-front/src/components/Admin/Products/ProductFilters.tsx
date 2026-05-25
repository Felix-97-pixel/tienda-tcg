"use client";
import React from "react";
import { useTranslations } from "next-intl";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Input } from "@/components/ui/Input";
import { ProductFiltersProps } from "@/types/adminProps";

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
          <Input 
            label={tc("search")}
            type="text" 
            placeholder={t("filters.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
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
