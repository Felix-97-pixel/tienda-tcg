"use client";
import React from "react";
import { useTranslations } from "next-intl";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";

export interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedCategory: string;
  onCategoryChange: (val: string) => void;
  selectedExpansion: string;
  onExpansionChange: (val: string) => void;
  categories: { id: string, name: string }[];
  expansions: { name: string, products: number }[];
  isInventoryOnly?: boolean;
  onInventoryOnlyChange?: (val: boolean) => void;
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
  isInventoryOnly,
  onInventoryOnlyChange
}: ProductFiltersProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");

  return (
    <div className="bg-[#1a1d24] rounded-2xl shadow-1 p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-white">{tc("filters")}</p>
        {isInventoryOnly !== undefined && onInventoryOnlyChange && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-4 cursor-pointer select-none" onClick={() => onInventoryOnlyChange(!isInventoryOnly)}>
              Mostrar solo mi inventario
            </label>
            <Switch 
              checked={isInventoryOnly} 
              onChange={(e) => onInventoryOnlyChange(e.target.checked)} 
            />
          </div>
        )}
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
      </div>
    </div>
  );
}
