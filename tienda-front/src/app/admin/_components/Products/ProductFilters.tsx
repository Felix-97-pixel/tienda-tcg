"use client";
import React from "react";
import { useTranslations } from "next-intl";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Input } from "@/components/ui/Input";
import SegmentedControl, { SegmentedControlOption } from "@/components/ui/SegmentedControl";

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
  publishStateOptions?: SegmentedControlOption[];
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
  onPublishStateChange,
  publishStateOptions,
}: ProductFiltersProps) {
  const t = useTranslations("products");
  const tc = useTranslations("common");

  const defaultOptions: SegmentedControlOption[] = [
    { value: "all", label: "Todos", variant: "default" },
    { value: "published", label: "Publicados", variant: "success" },
    { value: "paused", label: "Pausados", variant: "warning" },
  ];

  return (
    <div className="bg-[#0E121B] rounded-2xl border border-white/10 shadow-2xl p-4 sm:p-5 mb-6 w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-white/5">
        <p className="text-xs font-black uppercase tracking-wider text-white/70">{tc("filters")}</p>
        {publishState !== undefined && onPublishStateChange && (
          <SegmentedControl
            fullWidth={false}
            size="sm"
            value={publishState}
            onChange={onPublishStateChange}
            options={publishStateOptions || defaultOptions}
          />
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3">
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
