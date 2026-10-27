"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { API_URL } from "@/utils/api";
import TcgFilterSidebar from "@/app/(site)/(pages)/shop/store/[subdomain]/_components/TcgFilterSidebar";
import TcgProductCard from "@/app/(site)/(pages)/shop/store/[subdomain]/_components/TcgProductCard";
import { formatPrice } from "@/utils/currency";
import { useAppSelector } from "@/redux/store";
import { useProductCart } from "@/hooks/useProductCart";
import { matchesCondition, matchesFinish, matchesLanguage } from "@/utils/tcgFilters";
import { IconSparkles, IconCard, IconZap } from "@/components/ui/Icons";

import { getBestAvailableVariant } from "@/utils/tcgPrices";

function MarketplaceDeckbuilderRow({ item, globalRates = [] }: { item: any; globalRates?: any[] }) {
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
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#111522] border border-white/[0.06] hover:border-white/20 transition-all">
      {/* Artwork thumbnail */}
      <div className="relative w-12 h-16 shrink-0 rounded-lg overflow-hidden bg-[#0A0D14] border border-white/10 group">
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
          className="font-bold text-sm text-white hover:text-red-400 truncate block transition-colors"
        >
          {item.title || item.name}
        </Link>
        <div className="flex flex-wrap items-center gap-1.5 mt-1">
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold font-mono ${conditionClass}`}>
            {conditionCode}
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-gray-400">
            {languageCode}
          </span>
          {isFoil && (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30">
              FOIL
            </span>
          )}
          {item.cardDetail?.expansion?.name && (
            <span className="text-[11px] text-gray-400 truncate max-w-[140px]">
              • {item.cardDetail.expansion.name}
            </span>
          )}
          {best.storeName && (
            <span className="text-[11px] text-blue-400 font-medium truncate max-w-[140px]">
              • {best.storeName}
            </span>
          )}
        </div>
      </div>

      {/* Price & Stock */}
      <div className="text-right shrink-0">
        <div className="font-extrabold text-white text-sm sm:text-base font-mono">
          {formatPrice(price, currency)}
        </div>
        <span className={`text-[10px] font-mono block ${stock > 0 ? "text-gray-400" : "text-red-400"}`}>
          {stock > 0 ? `${stock} disp.` : "Agotado"}
        </span>
      </div>

      {/* Stepper & Add */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="hidden sm:flex items-center rounded-lg bg-black/40 border border-white/10 overflow-hidden">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-7 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
            disabled={qty <= 1}
          >
            -
          </button>
          <span className="w-6 text-center text-xs font-mono font-bold text-white">{qty}</span>
          <button
            type="button"
            onClick={() => setQty(Math.min(stock, qty + 1))}
            className="w-7 h-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10"
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
          {isAdding ? "✓ Listo" : "Comprar"}
        </button>
      </div>
    </div>
  );
}

export default function TcgMarketplaceCatalog() {
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
  const [globalRates, setGlobalRates] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [expansionsData, setExpansionsData] = useState<any[]>([]);
  const [conditionsData, setConditionsData] = useState<any[]>([]);
  const [languagesData, setLanguagesData] = useState<any[]>([]);
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

  // Fetch all conditions dynamically from database
  useEffect(() => {
    fetch(`${API_URL}/products/meta/conditions`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setConditionsData(data);
      })
      .catch((err) => console.error("Error fetching conditions:", err));
  }, []);

  // Fetch all languages dynamically from database
  useEffect(() => {
    fetch(`${API_URL}/products/meta/languages`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setLanguagesData(data);
      })
      .catch((err) => console.error("Error fetching languages:", err));
  }, []);

  // Fetch all global currencies and exchange rates dynamically
  useEffect(() => {
    fetch(`${API_URL}/currencies`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setGlobalRates(data);
      })
      .catch((err) => console.error("Error fetching currencies:", err));
  }, []);

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
    <div className="min-h-screen bg-[#0A0D14] text-white pt-28 md:pt-36 pb-16">
      {/* Catalog Header Banner */}
      <div className="border-b border-white/[0.08] bg-[#0E121B] pb-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500"></div>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/15 text-red-400 border border-red-500/30 mb-2">
                <IconZap className="w-3.5 h-3.5 text-red-400 shrink-0" /> Catálogo Unificado Marketplace
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Explorar Cartas TCG
              </h1>
              <p className="text-gray-400 text-sm mt-1 max-w-xl">
                Encuentra singles, cajas y boosters en vivo de todas las tiendas de Chile con envío consolidado o retiro presencial.
              </p>
            </div>

            {totalCount > 0 && (
              <div className="glass-vault px-4 py-2.5 rounded-xl border border-white/10 text-right flex items-center gap-4">
                {inStockOnly ? (
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold">Stock Inmediato</span>
                    <span className="text-xl font-black text-emerald-400 font-mono">{totalCount.toLocaleString('es-CL')} cartas</span>
                  </div>
                ) : (
                  <>
                    {totalInStockCount !== undefined && totalInStockCount > 0 && (
                      <div className="text-right border-r border-white/10 pr-4">
                        <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold">Stock Inmediato</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">{totalInStockCount.toLocaleString('es-CL')} cartas</span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Catálogo Maestro</span>
                      <span className="text-lg font-black text-white font-mono">{totalCount.toLocaleString('es-CL')} cartas</span>
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
              placeholder="Buscar por carta, set, juego o vendedor..."
              className="w-full h-11 pl-10 pr-10 rounded-xl bg-[#111522] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 transition-all"
            />
            <svg
              className="absolute left-3.5 top-3.5 text-gray-500"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
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
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
                title="Borrar búsqueda"
              >
                ✕
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between md:justify-end gap-2.5">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 h-11 rounded-xl bg-[#111522] border border-white/10 text-white text-xs font-bold hover:bg-white/5 transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filtros
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-[#111522] border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-red-500 cursor-pointer appearance-none pr-8"
              >
                <option value="latest">Más recientes</option>
                <option value="price-asc">Menor precio</option>
                <option value="price-desc">Mayor precio</option>
                <option value="name-asc">Nombre (A-Z)</option>
              </select>
              <svg
                className="absolute right-3 top-4 pointer-events-none text-gray-400"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>

            {/* Dual View Toggle */}
            <div className="flex items-center rounded-xl bg-[#111522] border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Vista de Cuadrícula (Vault Cards)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === "table"
                    ? "bg-red-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Vista Deckbuilder (Lista rápida para armar mazos)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="6"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs text-gray-400 font-medium mr-1">Filtros activos:</span>

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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red/15 text-red-light border border-red/30 hover:bg-red/25 transition-all"
              >
                {selectedCategory}
                <span>✕</span>
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 hover:bg-blue-500/25 transition-all"
              >
                {selectedExpansion}
                <span>✕</span>
              </button>
            )}

            {selectedCondition && (
              <button
                type="button"
                onClick={() => setSelectedCondition(null)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all"
              >
                Condición: {conditionsData.find(c => c.name === selectedCondition || c.id === selectedCondition)?.displayName || selectedCondition}
                <span>✕</span>
              </button>
            )}

            {selectedFinish && (
              <button
                type="button"
                onClick={() => setSelectedFinish(null)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
              >
                {selectedFinish === "foil" ? (
                  <span className="inline-flex items-center gap-1">
                    <IconSparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    Foil / Holo
                  </span>
                ) : (
                  "Normal"
                )}
                <span>✕</span>
              </button>
            )}

            {selectedLanguage && (
              <button
                type="button"
                onClick={() => setSelectedLanguage(null)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 hover:bg-purple-500/25 transition-all"
              >
                Idioma: {languagesData.find(l => l.code === selectedLanguage || l.id === selectedLanguage || l.name === selectedLanguage)?.name || selectedLanguage}
                <span>✕</span>
              </button>
            )}

            {!inStockOnly && (
              <button
                type="button"
                onClick={() => handleToggleInStockOnly(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
              >
                Vista: Catálogo Completo (Singles + Wishlist)
                <span>✕</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs text-gray-400 hover:text-white underline underline-offset-2 ml-auto"
            >
              Limpiar todos
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
              <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#0E121B] border-l border-white/10 p-6 overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
                  <span className="font-bold text-white text-base">Filtros TCG</span>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white"
                  >
                    ✕
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
                    className="rounded-2xl p-4 bg-[#111522] border border-white/5 animate-pulse flex flex-col justify-between aspect-[2.5/4]"
                  >
                    <div className="w-16 h-4 bg-white/10 rounded mb-2"></div>
                    <div className="w-full aspect-[2.5/3.5] bg-white/5 rounded-xl my-2"></div>
                    <div className="w-full h-4 bg-white/10 rounded mt-2"></div>
                    <div className="w-1/2 h-4 bg-white/10 rounded mt-1"></div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-2xl bg-[#111522]/50 border border-white/5">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 mx-auto mb-4">
                  <IconCard className="w-8 h-8 opacity-80" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  No encontramos cartas con estos filtros
                </h3>
                <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                  Intenta buscar con otros términos, seleccionar otra expansión o limpiar los filtros activos para ver todo el inventario de TapTrade.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg shadow-red-600/20"
                >
                  Restablecer todos los filtros
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
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#111522] border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
                >
                  ← Anterior
                </button>
                <span className="text-xs font-mono font-medium text-gray-400 px-3">
                  Página <strong className="text-white">{currentPage}</strong> de {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#111522] border border-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-all"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
