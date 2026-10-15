"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_URL } from "@/utils/api";
import TcgFilterSidebar from "./TcgFilterSidebar";
import TcgProductCard from "./TcgProductCard";
import { formatPrice } from "@/utils/currency";
import { useAppSelector } from "@/redux/store";
import { useProductCart } from "@/hooks/useProductCart";
import { matchesCondition, matchesFinish, matchesLanguage } from "@/utils/tcgFilters";
import { IconSparkles, IconCard } from "@/components/ui/Icons";

interface TcgStorefrontViewProps {
  storeId: string;
  storeName: string;
}

// Compact Table Row for Deckbuilder View
function TcgDeckbuilderRow({ item }: { item: any }) {
  const currency = useAppSelector((state: any) => state.currencyReducer);
  const { handleAddToCart, isMaxStockReached, availableStock } = useProductCart(item);
  const [qty, setQty] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const price = item.price || item.items?.[0]?.price || 0;
  const stock = item.stock !== undefined ? item.stock : (item.items?.[0]?.stock ?? 0);
  const isOutOfStock = stock <= 0 || isMaxStockReached;

  const rawCondition = (
    item.condition_rel?.name ||
    item.items?.[0]?.condition?.name ||
    item.condition ||
    "NM"
  ).toUpperCase();

  let conditionCode = "NM";
  let conditionClass = "badge-condition-nm";
  if (rawCondition.includes("LIGHT") || rawCondition === "LP") {
    conditionCode = "LP";
    conditionClass = "badge-condition-lp";
  } else if (rawCondition.includes("MODERATE") || rawCondition === "MP") {
    conditionCode = "MP";
    conditionClass = "badge-condition-mp";
  } else if (rawCondition.includes("HEAVY") || rawCondition === "HP") {
    conditionCode = "HP";
    conditionClass = "badge-condition-hp";
  } else if (rawCondition.includes("DAMAGE") || rawCondition === "DMG") {
    conditionCode = "DMG";
    conditionClass = "badge-condition-dmg";
  }

  const isFoil = Boolean(
    item.finish?.name?.toLowerCase().includes("foil") ||
    item.finish?.name?.toLowerCase().includes("holo") ||
    item.items?.some((i: any) => i.finish?.name?.toLowerCase().includes("foil")) ||
    item.cardDetail?.isFoil
  );

  const rawLang = item.language?.name || item.items?.[0]?.language?.name || "EN";
  const languageCode = rawLang.substring(0, 2).toUpperCase();
  const imageUrl = item.imgs?.previews?.[0] || item.imageUrl || "/images/products/product-1-bg-1.png";

  const onAdd = () => {
    if (isOutOfStock) return;
    setIsAdding(true);
    handleAddToCart(qty);
    setTimeout(() => setIsAdding(false), 900);
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#111522] border border-white/[0.06] hover:border-white/20 transition-all">
      {/* Artwork thumbnail with hover expansion */}
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
          href={`/shop-details/${item.slug || item.id}`}
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
            <span className="text-[11px] text-gray-400 truncate max-w-[160px]">
              • {item.cardDetail.expansion.name}
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

      {/* Rapid Add Stepper & Button */}
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
          title={isOutOfStock ? "Sin stock disponible" : "Añadir al carrito"}
        >
          {isAdding ? (
            <>
              <span>✓</span>
              <span className="hidden sm:inline">Listo</span>
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="hidden sm:inline">Comprar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function TcgStorefrontView({ storeId, storeName }: TcgStorefrontViewProps) {
  // UI Controls
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [sortOption, setSortOption] = useState<string>("latest");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExpansion, setSelectedExpansion] = useState<string | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [selectedFinish, setSelectedFinish] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 });

  // Data State
  const [products, setProducts] = useState<any[]>([]);
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [expansionsData, setExpansionsData] = useState<any[]>([]);
  const [conditionsData, setConditionsData] = useState<any[]>([]);
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

  // Fetch conditions metadata from DB
  useEffect(() => {
    fetch(`${API_URL}/products/meta/conditions`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setConditionsData(data);
      })
      .catch((err) => console.error("Error fetching conditions:", err));
  }, []);

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
          const mapped = rawList.map((item: any) => {
            const defaultPrice = item.items?.[0]?.price || item.price || 0;
            const defaultStock = item.items?.[0]?.stock !== undefined ? item.items[0].stock : (item.stock || 0);

            return {
              id: item.id,
              slug: item.slug,
              title: item.name || item.title,
              name: item.name || item.title,
              price: parseFloat(defaultPrice),
              stock: parseInt(defaultStock, 10),
              imageUrl: item.imageUrl,
              description: item.description,
              cardDetail: item.cardDetail,
              items: item.items || [],
              imgs: {
                previews: [item.imageUrl || "/images/products/product-1-bg-1.png"],
                thumbnails: [item.imageUrl || "/images/products/product-1-bg-1.png"],
              },
              category: item.category,
              condition: item.items?.[0]?.condition?.name || item.condition || "NM",
              language: item.items?.[0]?.language || item.language,
              finish: item.items?.[0]?.finish || item.finish,
            };
          });

          setProducts(mapped);
          if (response.meta?.totalPages) {
            setTotalPages(response.meta.totalPages);
          }
        }
      })
      .catch((err) => console.error("Error fetching products:", err))
      .finally(() => setIsLoading(false));
  }, [storeId, selectedCategory, selectedExpansion, debouncedSearch, currentPage]);

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
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Search Input with Instant Clear (Nielsen Heuristics: Flexibility & Efficiency) */}
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre de carta, set o número..."
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
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-white"
              title="Borrar búsqueda"
            >
              ✕
            </button>
          )}
        </div>

        {/* Toolbar: View Switcher, Sort & Mobile Filters Button */}
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

          {/* Sort Selector */}
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

          {/* Dual View Toggle: Grid vs Deckbuilder / Table */}
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
              title="Vista Deckbuilder (Lista rápida para mazos)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips Pills (Refactoring UI / Usability Heuristics) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <span className="text-xs text-gray-400 font-medium mr-1">Filtros aplicados:</span>

          {selectedCategory && (
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-all"
            >
              {selectedCategory}
              <span>✕</span>
            </button>
          )}

          {selectedExpansion && (
            <button
              type="button"
              onClick={() => setSelectedExpansion(null)}
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
              Idioma: {selectedLanguage}
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
            /* Nielsen UX Heuristic: Meaningful Empty State & Recovery Path */
            <div className="text-center py-16 px-4 rounded-2xl bg-[#111522]/50 border border-white/5">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-red-500 mx-auto mb-4">
                <IconCard className="w-8 h-8 opacity-80" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                No encontramos cartas con estos filtros
              </h3>
              <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
                Intenta buscar con otros términos, seleccionar otra expansión o limpiar los filtros activos para ver todo el inventario de {storeName}.
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
            /* Vault Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {sortedProducts.map((product) => (
                <TcgProductCard key={product.id} item={product} />
              ))}
            </div>
          ) : (
            /* Deckbuilder / Table List View */
            <div className="flex flex-col gap-2.5">
              {sortedProducts.map((product) => (
                <TcgDeckbuilderRow key={product.id} item={product} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
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
  );
}
