"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import TcgFilterSidebar from "./TcgFilterSidebar";
import TcgProductCard from "./TcgProductCard";
import TcgStoreVariantModal from "./TcgStoreVariantModal";
import { formatPrice } from "@/utils/currency";
import { useAppSelector } from "@/redux/store";
import { useProductCart } from "@/hooks/useProductCart";
import { matchesCondition, matchesFinish, matchesLanguage } from "@/utils/tcgFilters";
import {
  IconSparkles,
  IconCard,
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

interface TcgStorefrontViewProps {
  storeId: string;
  storeName: string;
}

// Compact Table Row for Deckbuilder View
function TcgDeckbuilderRow({
  item,
  globalRates = [],
  storeId,
  onCardClick,
}: {
  item: any;
  globalRates?: any[];
  storeId?: string;
  onCardClick?: (item: any) => void;
}) {
  const t = useTranslations("shop");
  const currency = useAppSelector((state: any) => state.currencyReducer);
  const effectiveStoreId = storeId || item.storeId || item.store?.id;
  const best = getBestAvailableVariant(item, globalRates, effectiveStoreId);
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

  const handleRowClick = (e: React.MouseEvent) => {
    if (onCardClick) {
      e.preventDefault();
      onCardClick(item);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-red-500/40 shadow-sm transition-all">
      {/* Artwork thumbnail with hover expansion */}
      <div
        onClick={handleRowClick}
        className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] group cursor-pointer"
      >
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
        <button
          type="button"
          onClick={handleRowClick}
          className="font-bold text-sm text-[var(--tt-text-main)] hover:text-red dark:hover:text-red-400 truncate block transition-colors text-left w-full cursor-pointer"
        >
          {item.title || item.name}
        </button>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${conditionClass}`}>
            {conditionCode}
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)]">
            {languageCode}
          </span>
          {isFoil && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-400/15 border border-amber-400/30">
              FOIL
            </span>
          )}
          {item.cardDetail?.expansion?.name && (
            <span className="text-[11px] text-[var(--tt-text-muted)] truncate max-w-[160px]">
              • {item.cardDetail.expansion.name}
            </span>
          )}
        </div>
      </div>

      {/* Price & Stock */}
      <div className="text-right shrink-0">
        <div className="font-extrabold text-[var(--tt-text-main)] text-sm sm:text-base font-mono">
          {formatPrice(price, currency)}
        </div>
        <span className={`text-[10px] font-mono block ${stock > 0 ? "text-[var(--tt-text-muted)]" : "text-red dark:text-red-400"}`}>
          {stock > 0 ? t("available_count", { count: stock }) : t("outOfStock")}
        </span>
      </div>

      {/* Rapid Add Stepper & Button */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="hidden sm:flex items-center rounded-lg bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] overflow-hidden">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-7 h-8 flex items-center justify-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-canvas)]"
            disabled={qty <= 1}
          >
            -
          </button>
          <span className="w-6 text-center text-xs font-mono font-bold text-[var(--tt-text-main)]">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(Math.min(stock, qty + 1))}
            className="w-7 h-8 flex items-center justify-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-canvas)]"
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
              ? "bg-[var(--tt-bg-subtle)] text-[var(--tt-text-muted)] cursor-not-allowed border border-[var(--tt-border-medium)]"
              : isAdding
              ? "bg-[#059669] text-white shadow-lg shadow-[#059669]/30"
              : "bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-md shadow-[#E10E0E]/25 active:scale-95"
          }`}
          title={isOutOfStock ? t("outOfStock") : t("addToCart")}
        >
          {isAdding ? (
            <>
              <span>✓</span>
              <span className="hidden sm:inline">{t("done")}</span>
            </>
          ) : (
            <>
              <IconSparkles className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">{t("buy")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function TcgStorefrontView({ storeId, storeName }: TcgStorefrontViewProps) {
  const t = useTranslations("shop");
  // UI Controls
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string>("latest");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProductForModal, setSelectedProductForModal] = useState<any | null>(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExpansion, setSelectedExpansion] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });

  // Data State
  const [rawProducts, setRawProducts] = useState<any[]>([]);
  const { conditions: conditionsData, languages: languagesData, currencies: globalRates } = useTcgMetadata();
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [expansionsData, setExpansionsData] = useState<any[]>([]);


  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);
  // Metadatos cacheados provistos por useTcgMetadata

  // Fetch categories metadata for this store
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories?storeId=${storeId}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCategoriesData(data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, [storeId]);

  // Fetch expansions when category changes
  useEffect(() => {
    let url = `${API_URL}/products/meta/expansions?storeId=${storeId}`;
    if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setExpansionsData(data);
      })
      .catch((err) => console.error("Error fetching expansions:", err));
  }, [selectedCategory, storeId]);

  // Fetch products
  useEffect(() => {
    setIsLoading(true);

    const params = new URLSearchParams();
    params.set("page", currentPage.toString());
    params.set("limit", "24");
    params.set("storeId", storeId);

    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedExpansion) params.set("expansion", selectedExpansion);
    if (debouncedSearch) params.set("search", debouncedSearch);

    fetch(`${API_URL}/products?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : { data: [], meta: {} }))
      .then((response) => {
        const rawList = response.data || response;
        if (Array.isArray(rawList)) {
          setRawProducts(rawList);
          if (response.meta?.totalPages) {
            setTotalPages(response.meta.totalPages);
          }
        }
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setIsLoading(false));
  }, [storeId, selectedCategory, selectedExpansion, debouncedSearch, currentPage]);

  // Resolve best available variant (cheapest price in CLP strictly for THIS store)
  const products = useMemo(() => {
    return rawProducts.map((item: any) => {
      const best = getBestAvailableVariant(item, globalRates, storeId);
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
  }, [rawProducts, globalRates, storeId]);

  // Client-side filtering for condition, finish, language, and price
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

  // Calculate active filters count
  const activeFiltersCount = [
    selectedCategory,
    selectedExpansion,
    selectedCondition,
    selectedFinish,
    selectedLanguage,
    priceRange.max > 0,
  ].filter(Boolean).length;

  const handleClearAll = () => {
    setSelectedCategory(null);
    setSelectedExpansion(null);
    setSelectedCondition(null);
    setSelectedFinish(null);
    setSelectedLanguage(null);
    setPriceRange({ min: 0, max: 0 });
    setSearchTerm("");
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Search Input with Instant Clear (Nielsen Heuristics: Flexibility & Efficiency) */}
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("store_search_placeholder")}
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] placeholder-[var(--tt-text-muted)] text-sm focus:outline-none focus:border-red focus:ring-1 focus:ring-red/40 transition-all"
          />
          <IconSearch className="absolute left-3.5 top-3.5 text-[var(--tt-text-muted)] w-4 h-4 pointer-events-none" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-3.5 text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
              title={t("clear_search")}
            >
              <IconX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toolbar: View Switcher, Sort & Mobile Filters Button */}
        <div className="flex items-center justify-between md:justify-end gap-2.5">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 h-11 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] text-xs font-bold hover:bg-[var(--tt-bg-subtle)] transition-all"
          >
            <IconFilter className="w-3.5 h-3.5" />
            {t("filters")}
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-red text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="h-11 px-3.5 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] text-xs font-semibold focus:outline-none focus:border-red cursor-pointer appearance-none pr-8"
            >
              <option value="latest" className="bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)]">{t("sort.latest")}</option>
              <option value="price-asc" className="bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)]">{t("sort.price_asc")}</option>
              <option value="price-desc" className="bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)]">{t("sort.price_desc")}</option>
              <option value="name-asc" className="bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)]">{t("sort.name_asc")}</option>
            </select>
            <IconChevronDown className="absolute right-3 top-4 pointer-events-none text-[var(--tt-text-muted)] w-3 h-3" />
          </div>

          {/* Dual View Toggle: Grid vs Deckbuilder / Table */}
          <div className="flex items-center rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-red text-white shadow-sm"
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
                  ? "bg-red text-white shadow-sm"
                  : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)]"
              }`}
              title={t("view_deckbuilder_title")}
            >
              <IconList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Pills (Refactoring UI / Usability Heuristics) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-subtle)]">
          <span className="text-xs text-[var(--tt-text-muted)] font-medium mr-1">{t("active_filters")}</span>

          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/15 text-red-600 dark:text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-all"
            >
              {selectedCategory}
              <IconX className="w-3 h-3" />
            </button>
          )}

          {selectedExpansion && (
            <button
              type="button"
              onClick={() => setSelectedExpansion(null)}
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
                  <IconSparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-300 shrink-0" />
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

          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] underline underline-offset-2 ml-auto"
          >
            {t("clear_all_filters")}
          </button>
        </div>
      )}

      {/* Main Grid: Sidebar + Product Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block sticky top-28">
          <TcgFilterSidebar
            categories={categoriesData}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
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
          />
        </aside>

        {/* Mobile Filter Drawer Modal */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            ></div>
            <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[var(--tt-bg-surface)] border-l border-[var(--tt-border-medium)] p-6 overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--tt-border-medium)]">
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
                  setSelectedCategory(cat);
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
              />
            </div>
          </div>
        )}

        {/* Catalog Results View */}
        <div className="min-w-0">
          {isLoading ? (
            /* Skeleton Loading Grid with Shimmer */
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
            /* Nielsen UX Heuristic: Meaningful Empty State & Recovery Path */
            <div className="text-center py-16 px-4 rounded-2xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-subtle)]">
              <div className="w-16 h-16 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] flex items-center justify-center text-red mx-auto mb-4">
                <IconCard className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-lg font-bold text-[var(--tt-text-main)] mb-2">
                {t("no_cards_found")}
              </h3>
              <p className="text-sm text-[var(--tt-text-muted)] max-w-md mx-auto mb-6">
                {t("store_no_cards_found_desc", { store: storeName })}
              </p>
              <button
                type="button"
                onClick={handleClearAll}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red hover:bg-red-dark text-white transition-all shadow-lg shadow-red/20"
              >
                {t("reset_filters")}
              </button>
            </div>
          ) : viewMode === "grid" ? (
            /* Vault Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {sortedProducts.map((product) => (
                <TcgProductCard
                  key={product.id}
                  item={product}
                  globalRates={globalRates}
                  storeId={storeId}
                  onCardClick={(p) => setSelectedProductForModal(p)}
                />
              ))}
            </div>
          ) : (
            /* Deckbuilder / Table List View */
            <div className="flex flex-col gap-2.5">
              {sortedProducts.map((product) => (
                <TcgDeckbuilderRow
                  key={product.id}
                  item={product}
                  globalRates={globalRates}
                  storeId={storeId}
                  onCardClick={(p) => setSelectedProductForModal(p)}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-10">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label={t("prev_page")}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--tt-bg-subtle)] transition-all shadow-sm"
              >
                <IconChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-[var(--tt-text-main)] px-4 py-2 rounded-xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] shadow-sm">
                {t("page_info", { current: currentPage, total: totalPages })}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label={t("next_page")}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-main)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--tt-bg-subtle)] transition-all shadow-sm"
              >
                <IconChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vitrina Variants Popup Modal (Vitrina por Tienda) */}
      {selectedProductForModal && (
        <TcgStoreVariantModal
          product={selectedProductForModal}
          storeId={storeId}
          storeName={storeName}
          globalRates={globalRates}
          onClose={() => setSelectedProductForModal(null)}
        />
      )}
    </div>
  );
}
