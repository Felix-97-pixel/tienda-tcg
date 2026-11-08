"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import TcgFilterSidebar from "@/app/(site)/(pages)/shop/store/[subdomain]/_components/TcgFilterSidebar";
import TcgProductCard from "@/app/(site)/(pages)/shop/store/[subdomain]/_components/TcgProductCard";
import CustomSortDropdown from "./CustomSortDropdown";
import { formatPrice } from "@/utils/currency";
import { useAppSelector } from "@/redux/store";
import { useProductCart } from "@/hooks/useProductCart";
import { matchesCondition, matchesFinish, matchesLanguage } from "@/utils/tcgFilters";
import {
  IconSparkles,
  IconCard,
  IconZap,
  IconSearch,
  IconFilter,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconX,
  IconGrid,
  IconList,
} from "@/components/ui/Icons";

import { getBestAvailableVariant } from "@/utils/tcgPrices";
import { useTcgMetadata } from "@/hooks/useTcgMetadata";

const MarketplaceDeckbuilderRow = React.memo(function MarketplaceDeckbuilderRow({
  item,
  globalRates = [],
}: {
  item: any;
  globalRates?: any[];
}) {
  const t = useTranslations("shop");
  const currency = useAppSelector((state: any) => state.currencyReducer);

  // Find best available variant (cheapest in-stock card with exchange rates applied)
  const best = getBestAvailableVariant(item, globalRates);
  const cheapestVariant = best.variant;
  const price = best.finalPriceCLP;
  const stock = best.stock;
  const isOutOfStock = !best.inStock || stock <= 0;

  const targetItem = cheapestVariant
    ? {
        ...item,
        id: cheapestVariant.id,
        productId: item.id,
        inventoryItemId: cheapestVariant.id,
        price: price,
        discountedPrice: price,
        stock: stock,
        condition: best.conditionCode,
        condition_rel: cheapestVariant.condition_rel || cheapestVariant.condition || item.condition_rel,
        language: best.languageCode,
        finish: cheapestVariant.finish?.name || cheapestVariant.finish || (best.isFoil ? "Foil" : "Normal"),
        store: best.store,
        storeId: cheapestVariant.storeId || item.storeId,
        storeName: best.storeName,
      }
    : {
        ...item,
        price: price,
        discountedPrice: price,
        stock: stock,
        condition: best.conditionCode,
        language: best.languageCode,
        finish: best.isFoil ? "Foil" : "Normal",
        storeName: best.storeName,
      };

  const { handleAddToCart, isMaxStockReached } = useProductCart(targetItem);
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const conditionCode = best.conditionCode;
  const conditionClass = best.conditionClass;
  const isFoil = best.isFoil;
  const languageCode = best.languageCode;
  const imageUrl = item.imgs?.previews?.[0] || item.imageUrl || "/images/products/product-1-bg-1.png";

  const onAdd = () => {
    if (isOutOfStock || isMaxStockReached) return;
    setIsAdding(true);
    handleAddToCart(qty);
    setTimeout(() => setIsAdding(false), 900);
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-subtle)] hover:border-red-500/40 shadow-xs transition-[border-color,box-shadow] duration-200">
      {/* Artwork thumbnail */}
      <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] group">
        <Image
          src={imageUrl}
          alt={item.title || item.name}
          fill
          sizes="48px"
          className="object-cover group-hover:scale-110 transition-transform duration-200"
        />
        {isFoil && <div className="card-foil-overlay !opacity-40"></div>}
      </div>

      {/* Card Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/shop-details/${item.slug}`}
          className="font-bold text-sm text-[var(--tt-text-main)] hover:text-red-500 truncate block transition-colors"
        >
          {item.title || item.name}
        </Link>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${conditionClass}`}>
            {conditionCode}
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold font-mono uppercase bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300">
            {languageCode}
          </span>
          {isFoil && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold text-amber-800 dark:text-amber-200 bg-amber-500/10 dark:bg-amber-400/15 border border-amber-600/40 dark:border-amber-400/30">
              FOIL
            </span>
          )}
          {item.cardDetail?.expansion?.name && (
            <span className="text-[11px] text-[var(--tt-text-muted)] truncate max-w-[140px]">
              • {item.cardDetail.expansion.name}
            </span>
          )}
          {best.storeName && (
            <span className="text-[11px] text-blue-500 dark:text-blue-400 font-medium truncate max-w-[140px]">
              • {best.storeName}
            </span>
          )}
        </div>
      </div>

      {/* Price & Stock */}
      <div className="text-right shrink-0">
        <div className="font-extrabold text-[var(--tt-text-main)] text-sm sm:text-base font-mono">
          {formatPrice(price, currency)}
        </div>
        <span className={`text-[10px] font-mono block ${stock > 0 ? "text-[var(--tt-text-muted)]" : "text-red-500"}`}>
          {stock > 0 ? t("available_count", { count: stock }) : t("outOfStock")}
        </span>
      </div>

      {/* Stepper & Add */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="hidden sm:flex items-center rounded-lg bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] overflow-hidden">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-7 h-8 flex items-center justify-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-black/5 dark:hover:bg-white/10"
            disabled={qty <= 1}
          >
            -
          </button>
          <span className="w-6 text-center text-xs font-mono font-bold text-[var(--tt-text-main)]">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(Math.min(stock, qty + 1))}
            className="w-7 h-8 flex items-center justify-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-black/5 dark:hover:bg-white/10"
            disabled={qty >= stock}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={isOutOfStock}
          className={`h-9 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            isOutOfStock
              ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
              : isAdding
              ? "bg-[#059669] text-white shadow-lg shadow-[#059669]/30"
              : "bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-md shadow-[#E10E0E]/25 active:scale-95"
          }`}
        >
          {isAdding ? `✓ ${t("done")}` : t("buy")}
        </button>
      </div>
    </div>
  );
});

export default function TcgMarketplaceCatalog() {
  const t = useTranslations("shop");
  const router = useRouter();
  const searchParams = useSearchParams();

  // UI Controls
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string>("latest");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category") || null);
  const [selectedExpansion, setSelectedExpansion] = useState<string | null>(searchParams.get("expansion") || null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });
  const [inStockOnly, setInStockOnly] = useState<boolean>(searchParams.get("inStockOnly") !== "false");
  const [totalInStockCount, setTotalInStockCount] = useState<number | undefined>(undefined);

  // Data State
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const { conditions: conditionsData, languages: languagesData, currencies: globalRates } = useTcgMetadata();
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [expansionsData, setExpansionsData] = useState<any[]>([]);


  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync URL search parameters (e.g. when searching from Header or navigating)
  useEffect(() => {
    const q = searchParams.get("search") || "";
    const cat = searchParams.get("category") || null;
    const exp = searchParams.get("expansion") || null;
    const iso = searchParams.get("inStockOnly") !== "false";

    setSearchTerm(q);
    setDebouncedSearch(q);
    setSelectedCategory(cat);
    setSelectedExpansion(exp);
    setInStockOnly(iso);
    setCurrentPage(1);
  }, [searchParams]);

  // Debounce search when user types in the catalog search input directly
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch all categories for global marketplace
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCategoriesData(data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);
  // Metadatos cacheados provistos por useTcgMetadata

  // Fetch expansions when category changes
  useEffect(() => {
    let url = `${API_URL}/products/meta/expansions`;
    if (selectedCategory) url += `?category=${encodeURIComponent(selectedCategory)}`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setExpansionsData(data);
      })
      .catch((err) => console.error("Error fetching expansions:", err));
  }, [selectedCategory]);

  // Fetch products IMMEDIATELY from initial render
  useEffect(() => {
    setIsLoading(true);

    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", "24");

    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedExpansion) params.set("expansion", selectedExpansion);
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("inStockOnly", inStockOnly ? "true" : "false");

    fetch(`${API_URL}/products?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { data: [], meta: {} }))
      .then((response) => {
        const rawList = response.data || response;
        if (Array.isArray(rawList)) {
          setRawProducts(rawList);
          if (response.meta?.totalPages) {
            setTotalPages(response.meta.totalPages);
          }
          if (response.meta?.total !== undefined) {
            setTotalCount(response.meta.total);
          } else {
            setTotalCount(rawList.length);
          }
          if (response.meta?.totalInStock !== undefined) {
            setTotalInStockCount(response.meta.totalInStock);
          }
        }
      })
      .catch((err) => console.error("Error fetching marketplace products:", err))
      .finally(() => setIsLoading(false));
  }, [selectedCategory, selectedExpansion, debouncedSearch, currentPage, inStockOnly]);

  // Resolve best available variant (cheapest price in CLP) for each product preview
  const products = useMemo(() => {
    return rawProducts.map((item: any) => {
      const best = getBestAvailableVariant(item, globalRates);
      return {
        ...item,
        id: item.id,
        slug: item.slug,
        title: item.name || item.title,
        name: item.name || item.title,
        price: best.finalPriceCLP,
        stock: best.stock,
        imageUrl: item.imageUrl,
        description: item.description,
        cardDetail: item.cardDetail,
        items: item.items || [],
        imgs: {
          previews: [item.imageUrl || "/images/products/product-1-bg-1.png"],
          thumbnails: [item.imageUrl || "/images/products/product-1-bg-1.png"],
        },
        category: item.category,
        store: best.store,
        storeName: best.storeName,
        condition: best.conditionName,
        condition_rel: best.variant?.condition_rel || best.variant?.condition || item.condition_rel,
        conditionCode: best.conditionCode,
        conditionClass: best.conditionClass,
        language: best.languageCode,
        finish: best.isFoil ? "Foil" : "Normal",
        isFoil: best.isFoil,
        cheapestVariant: best.variant,
      };
    });
  }, [rawProducts, globalRates]);

  // Client-side filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Condition filter
      if (!matchesCondition(p, selectedCondition)) return false;

      // Finish filter
      if (!matchesFinish(p, selectedFinish)) return false;

      // Language filter
      if (!matchesLanguage(p, selectedLanguage)) return false;

      // Price range filter
      if (priceRange.max > 0) {
        if (p.price < priceRange.min || p.price > priceRange.max) return false;
      }

      return true;
    });
  }, [products, selectedCondition, selectedFinish, selectedLanguage, priceRange]);

  // Client-side sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortOption === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === "name-asc") {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [filteredProducts, sortOption]);

  const activeFiltersCount = [
    selectedCategory,
    selectedExpansion,
    selectedCondition,
    selectedFinish,
    selectedLanguage,
    priceRange.max > 0,
    !inStockOnly,
  ].filter(Boolean).length;

  const handleToggleInStockOnly = (val: boolean) => {
    setInStockOnly(val);
    setCurrentPage(1);
    const p = new URLSearchParams(searchParams.toString());
    if (!val) {
      p.set("inStockOnly", "false");
    } else {
      p.delete("inStockOnly");
    }
    const qs = p.toString();
    router.replace(`/shop${qs ? `?${qs}` : ""}`);
  };

  const handleSelectCategory = (cat: string | null) => {
    setSelectedCategory(cat);
    const p = new URLSearchParams(searchParams.toString());
    if (cat) {
      p.set("category", cat);
    } else {
      p.delete("category");
    }
    const qs = p.toString();
    router.replace(`/shop${qs ? `?${qs}` : ""}`);
  };

  const handleClearAll = () => {
    setSelectedCategory(null);
    setSelectedExpansion(null);
    setSelectedCondition(null);
    setSelectedFinish(null);
    setSelectedLanguage(null);
    setPriceRange({ min: 0, max: 0 });
    setSearchTerm("");
    setDebouncedSearch("");
    setInStockOnly(true);
    router.replace("/shop");
  };

  return (
    <div className="min-h-screen bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] pt-28 md:pt-36 pb-16">
      {/* Catalog Header Banner */}
      <div className="border-b border-[var(--tt-border-subtle)] bg-[var(--tt-bg-subtle)] pb-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500"></div>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/15 text-red-500 border border-red-500/30 mb-2">
                <IconZap className="w-3.5 h-3.5 text-red-500 shrink-0" /> {t("marketplace_badge")}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--tt-text-main)]">
                {t("catalog_title")}
              </h1>
              <p className="text-[var(--tt-text-muted)] text-sm mt-1 max-w-xl">
                {t("catalog_subtitle")}
              </p>
            </div>

            {totalCount > 0 && (
              <div className="glass-vault px-4 py-2.5 rounded-xl border border-[var(--tt-border-medium)] text-right flex items-center gap-4 shadow-sm">
                {inStockOnly ? (
                  <div>
                    <span className="text-[10px] text-emerald-500 uppercase tracking-wider block font-semibold">{t("immediate_stock")}</span>
                    <span className="text-xl font-black text-emerald-500 font-mono">{t("cards_count", { count: totalCount.toLocaleString("es-CL") })}</span>
                  </div>
                ) : (
                  <>
                    {totalInStockCount !== undefined && totalInStockCount > 0 && (
                      <div className="text-right border-r border-[var(--tt-border-subtle)] pr-4">
                        <span className="text-[10px] text-emerald-500 uppercase tracking-wider block font-semibold">{t("immediate_stock")}</span>
                        <span className="text-lg font-black text-emerald-500 font-mono">{t("cards_count", { count: totalInStockCount.toLocaleString("es-CL") })}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-[var(--tt-text-muted)] uppercase tracking-wider block">{t("master_catalog")}</span>
                      <span className="text-lg font-black text-[var(--tt-text-main)] font-mono">{t("cards_count", { count: totalCount.toLocaleString("es-CL") })}</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search & Toolbar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
          {/* Instant Search Input */}
          <div className="relative flex-1 max-w-lg">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("search_placeholder")}
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] placeholder-[var(--tt-text-muted)] text-sm focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 shadow-xs transition-all"
            />
            <IconSearch className="absolute left-3.5 top-3.5 text-[var(--tt-text-muted)] w-4 h-4 pointer-events-none" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setDebouncedSearch("");
                  const p = new URLSearchParams(searchParams.toString());
                  p.delete("search");
                  const qs = p.toString();
                  router.replace(`/shop${qs ? `?${qs}` : ""}`);
                }}
                className="absolute right-3.5 top-3.5 text-[var(--tt-text-muted)] hover:text-red-500"
                title={t("clear_search")}
              >
                <IconX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between md:justify-end gap-2.5">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 h-11 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] text-xs font-bold hover:border-red-500/40 transition-all shadow-xs"
            >
              <IconFilter className="w-3.5 h-3.5" />
              {t("filters")}
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Unified Custom Sort Dropdown */}
            <CustomSortDropdown
              value={sortOption}
              onChange={setSortOption}
              options={[
                { value: "latest", label: t("sort.latest") },
                { value: "price-asc", label: t("sort.price_asc") },
                { value: "price-desc", label: t("sort.price_desc") },
                { value: "name-asc", label: t("sort.name_asc") },
              ]}
            />

            {/* Dual View Toggle */}
            <div className="flex items-center rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] p-0.5 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                }`}
                title={t("view_grid_title")}
              >
                <IconGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                }`}
                title={t("view_deckbuilder_title")}
              >
                <IconList className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)]">
            <span className="text-xs text-[var(--tt-text-muted)] font-medium mr-1">{t("active_filters")}</span>

            {selectedCategory && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  const p = new URLSearchParams(searchParams.toString());
                  p.delete("category");
                  const qs = p.toString();
                  router.replace(`/shop${qs ? `?${qs}` : ""}`);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red/15 text-red-600 dark:text-red-300 border border-red/30 hover:bg-red/25 transition-all"
              >
                {selectedCategory}
                <IconX className="w-3 h-3" />
              </button>
            )}

            {selectedExpansion && (
              <button
                type="button"
                onClick={() => {
                  setSelectedExpansion(null);
                  const p = new URLSearchParams(searchParams.toString());
                  p.delete("expansion");
                  const qs = p.toString();
                  router.replace(`/shop${qs ? `?${qs}` : ""}`);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-600 dark:text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-all"
              >
                {selectedExpansion}
                <IconX className="w-3 h-3" />
              </button>
            )}

            {selectedCondition && (
              <button
                type="button"
                onClick={() => setSelectedCondition(null)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all"
              >
                {t("condition_prefix", { value: conditionsData.find(c => c.name === selectedCondition || c.id === selectedCondition)?.displayName || selectedCondition })}
                <IconX className="w-3 h-3" />
              </button>
            )}

            {selectedFinish && (
              <button
                type="button"
                onClick={() => setSelectedFinish(null)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
              >
                {selectedFinish === "foil" ? (
                  <span className="inline-flex items-center gap-1">
                    <IconSparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-300 shrink-0" />
                    {t("finish_foil")}
                  </span>
                ) : (
                  t("finish_normal")
                )}
                <IconX className="w-3 h-3" />
              </button>
            )}

            {selectedLanguage && (
              <button
                type="button"
                onClick={() => setSelectedLanguage(null)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-all"
              >
                {t("language_prefix", { value: languagesData.find(l => l.code === selectedLanguage || l.id === selectedLanguage || l.name === selectedLanguage)?.name || selectedLanguage })}
                <IconX className="w-3 h-3" />
              </button>
            )}

            {!inStockOnly && (
              <button
                type="button"
                onClick={() => handleToggleInStockOnly(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
              >
                {t("all_catalog_view")}
                <IconX className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] underline underline-offset-2 ml-auto"
            >
              {t("clear_all_filters")}
            </button>
          </div>
        )}

        {/* Catalog Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block sticky top-28">
            <TcgFilterSidebar
              categories={categoriesData}
              selectedCategory={selectedCategory}
              onSelectCategory={handleSelectCategory}
              expansions={expansionsData}
              selectedExpansion={selectedExpansion}
              onSelectExpansion={setSelectedExpansion}
              conditions={conditionsData}
              selectedCondition={selectedCondition}
              onSelectCondition={setSelectedCondition}
              selectedFinish={selectedFinish}
              onSelectFinish={setSelectedFinish}
              languages={languagesData}
              selectedLanguage={selectedLanguage}
              onSelectLanguage={setSelectedLanguage}
              minPrice={priceRange.min}
              maxPrice={priceRange.max}
              onPriceChange={(min, max) => setPriceRange({ min, max })}
              onClearAll={handleClearAll}
              activeFiltersCount={activeFiltersCount}
              totalProductsCount={sortedProducts.length}
              inStockOnly={inStockOnly}
              onToggleInStockOnly={handleToggleInStockOnly}
              totalInStockCount={totalInStockCount}
            />
          </aside>

          {/* Mobile Drawer */}
          {mobileDrawerOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={() => setMobileDrawerOpen(false)}
              ></div>
              <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[var(--tt-bg-surface)] border-l border-[var(--tt-border-medium)] p-6 overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--tt-border-subtle)]">
                  <span className="font-bold text-[var(--tt-text-main)] text-base">{t("filters")}</span>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-lg text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
                  >
                    <IconX className="w-5 h-5" />
                  </button>
                </div>
                <TcgFilterSidebar
                  categories={categoriesData}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => {
                    handleSelectCategory(cat);
                    setMobileDrawerOpen(false);
                  }}
                  expansions={expansionsData}
                  selectedExpansion={selectedExpansion}
                  onSelectExpansion={(exp) => {
                    setSelectedExpansion(exp);
                    setMobileDrawerOpen(false);
                  }}
                  conditions={conditionsData}
                  selectedCondition={selectedCondition}
                  onSelectCondition={setSelectedCondition}
                  selectedFinish={selectedFinish}
                  onSelectFinish={setSelectedFinish}
                  languages={languagesData}
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={setSelectedLanguage}
                  minPrice={priceRange.min}
                  maxPrice={priceRange.max}
                  onPriceChange={(min, max) => setPriceRange({ min, max })}
                  onClearAll={handleClearAll}
                  activeFiltersCount={activeFiltersCount}
                  totalProductsCount={sortedProducts.length}
                  inStockOnly={inStockOnly}
                  onToggleInStockOnly={handleToggleInStockOnly}
                  totalInStockCount={totalInStockCount}
                />
              </div>
            </div>
          )}

          {/* Results Area */}
          <div className="min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {[...Array(8)].map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl p-4 bg-[var(--tt-bg-surface)] border border-[var(--tt-border-subtle)] animate-pulse flex flex-col justify-between aspect-[2.5/4]"
                  >
                    <div className="w-16 h-4 bg-[var(--tt-bg-subtle)] rounded mb-2"></div>
                    <div className="w-full aspect-[2.5/3.5] bg-[var(--tt-bg-subtle)] rounded-xl my-2"></div>
                    <div className="w-full h-4 bg-[var(--tt-bg-subtle)] rounded mt-2"></div>
                    <div className="w-1/2 h-4 bg-[var(--tt-bg-subtle)] rounded mt-1"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-subtle)]">
                <div className="w-16 h-16 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] flex items-center justify-center text-red mx-auto mb-4">
                  <IconCard className="w-8 h-8 opacity-80" />
                </div>
                <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">
                  {t("no_cards_found")}
                </h3>
                <p className="text-sm text-[var(--tt-text-muted)] max-w-md mx-auto mb-6">
                  {t("no_cards_found_desc")}
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red hover:bg-red-light text-white transition-all shadow-lg shadow-red/20"
                >
                  {t("reset_filters")}
                </button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {sortedProducts.map((product) => (
                  <TcgProductCard key={product.id} item={product} globalRates={globalRates} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {sortedProducts.map((product) => (
                  <MarketplaceDeckbuilderRow key={product.id} item={product} globalRates={globalRates} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-10">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  aria-label={t("prev_page")}
                  title={t("prev_page")}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] hover:text-red hover:border-red-500/40 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-[var(--tt-border-medium)] disabled:hover:text-[var(--tt-text-main)] transition-all shadow-xs"
                >
                  <IconChevronLeft className="w-4 h-4" />
                </button>

                <div className="px-4 h-10 flex items-center justify-center rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-xs font-mono font-bold text-[var(--tt-text-main)] shadow-xs select-none">
                  {t("page_info", { current: currentPage, total: totalPages })}
                </div>

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  aria-label={t("next_page")}
                  title={t("next_page")}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] hover:text-red hover:border-red-500/40 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-[var(--tt-border-medium)] disabled:hover:text-[var(--tt-text-main)] transition-all shadow-xs"
                >
                  <IconChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
