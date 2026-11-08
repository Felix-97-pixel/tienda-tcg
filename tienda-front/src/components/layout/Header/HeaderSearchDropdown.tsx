"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import { formatPrice } from "@/utils/currency";
import { useAppSelector } from "@/redux/store";
import { getBestAvailableVariant } from "@/utils/tcgPrices";
import {
  IconSearch,
  IconX,
  IconChevronRight,
  IconLoader,
  IconCard,
  IconSparkles,
} from "@/components/ui/Icons";

export default function HeaderSearchDropdown() {
  const router = useRouter();
  const tHeader = useTranslations("header");
  const currency = useAppSelector((state: any) => state.currencyReducer);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with URL query on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get("search");
      if (q) setQuery(q);
    }
  }, []);

  // Fetch search suggestions with 250ms debounce across all store products & singles
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsLoading(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.set("search", trimmed);
        params.set("limit", "8");
        // Always search across all items (both in-stock and out-of-stock)
        params.set("inStockOnly", "false");

        const res = await fetch(`${API_URL}/products?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          const items = Array.isArray(json)
            ? json
            : json?.data || json?.products || json?.items || [];
          setResults(items.slice(0, 8));
          setIsOpen(true);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Dropdown search error:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        e.preventDefault();
        navigateToProduct(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const navigateToProduct = (product: any) => {
    setIsOpen(false);
    router.push(`/shop-details/${product.slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    const qs = params.toString();
    router.push(`/shop${qs ? `?${qs}` : ""}`);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center bg-[var(--tt-bg-surface)] rounded-xl border border-[var(--tt-border-medium)] hover:border-red-500/40 focus-within:border-red/60 focus-within:ring-1 focus-within:ring-red/30 transition-all shadow-sm">
          {/* Leading Search Icon */}
          <div className="pl-3.5 pr-1 text-[var(--tt-text-muted)] pointer-events-none shrink-0 flex items-center">
            <IconSearch className="w-4 h-4" />
          </div>

          {/* Clean, Full-Width Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => {
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            onClick={() => {
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={tHeader("search_placeholder")}
            className="w-full bg-transparent text-[var(--tt-text-main)] text-xs py-2.5 pl-1.5 pr-2 outline-none placeholder:text-[var(--tt-text-muted)] rounded-xl"
            autoComplete="off"
          />

          {/* Action Area: Loading indicator or Clear button */}
          <div className="flex items-center gap-1 pr-2 shrink-0">
            {isLoading && (
              <IconLoader className="w-3.5 h-3.5 text-red animate-spin mr-1" />
            )}

            {query && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-md text-[var(--tt-text-muted)] hover:text-red transition-colors"
                title="Limpiar búsqueda"
              >
                <IconX className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Floating Dropdown Search Panel */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[100] bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-3.5 py-2 bg-[var(--tt-bg-subtle)] border-b border-[var(--tt-border-subtle)] flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--tt-text-muted)] flex items-center gap-1.5">
              <IconSparkles className="w-3.5 h-3.5 text-red shrink-0" />
              {tHeader("search_dropdown_title")}
            </span>
            <span className="text-[10px] font-mono text-[var(--tt-text-muted)]">
              {results.length} {results.length === 1 ? "resultado" : "resultados"}
            </span>
          </div>

          {/* Results List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[var(--tt-border-subtle)] custom-scrollbar">
            {isLoading && results.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--tt-text-muted)] flex items-center justify-center gap-2">
                <IconLoader className="w-4 h-4 text-red animate-spin" />
                <span>{tHeader("search_loading")}</span>
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--tt-border-subtle)] flex items-center justify-center mx-auto mb-2 text-[var(--tt-text-muted)]">
                  <IconCard className="w-5 h-5 opacity-60" />
                </div>
                <p className="text-xs font-semibold text-[var(--tt-text-main)] mb-1">
                  {tHeader("search_no_results", { query })}
                </p>
                <p className="text-[11px] text-[var(--tt-text-muted)]">
                  {tHeader("search_no_results_hint")}
                </p>
              </div>
            ) : (
              results.map((product, idx) => {
                const best = getBestAvailableVariant(product);
                const isSelected = selectedIndex === idx;
                const imageUrl =
                  product.imgs?.previews?.[0] ||
                  product.imgs?.thumbnails?.[0] ||
                  product.imageUrl ||
                  "/images/products/product-1-bg-1.png";

                const isCard = Boolean(product.cardDetail);
                const priceToShow = best.finalPriceCLP > 0 ? best.finalPriceCLP : Number(product.price || 0);
                const hasStock = best.inStock || Number(product.stock || 0) > 0;
                const subTitle = product.cardDetail?.expansion?.name || product.category?.name || "";

                return (
                  <div
                    key={product.id || idx}
                    onClick={() => navigateToProduct(product)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between gap-3 p-2.5 sm:p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-red/10 border-l-2 border-red"
                        : "hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-10 h-14 rounded-md overflow-hidden bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] shrink-0">
                      <Image
                        src={imageUrl}
                        alt={product.title || product.name || "TCG"}
                        fill
                        sizes="40px"
                        className="object-contain p-0.5"
                        unoptimized={Boolean(imageUrl.includes("scryfall"))}
                        referrerPolicy="no-referrer"
                      />
                      {best.isFoil && <div className="card-foil-overlay !opacity-50"></div>}
                    </div>

                    {/* Product / Card Information */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-[var(--tt-text-main)] hover:text-red transition-colors truncate">
                        {product.title || product.name}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        {/* Condition Badge (if card) */}
                        {isCard && best.conditionCode && (
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${best.conditionClass}`}>
                            {best.conditionCode}
                          </span>
                        )}

                        {/* Language Badge with border (if card) */}
                        {isCard && best.languageCode && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono uppercase bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/15 text-slate-700 dark:text-slate-300">
                            {best.languageCode}
                          </span>
                        )}

                        {/* Foil Badge */}
                        {best.isFoil && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase text-amber-800 dark:text-amber-200 bg-amber-500/10 dark:bg-amber-400/15 border border-amber-600/40 dark:border-amber-400/30">
                            FOIL
                          </span>
                        )}

                        {/* General Product Category Badge (if not card) */}
                        {!isCard && product.category?.name && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-black/5 dark:bg-white/5 border border-[var(--tt-border-subtle)] text-[var(--tt-text-muted)]">
                            {product.category.name}
                          </span>
                        )}

                        {/* Expansion / Set Name */}
                        {subTitle && isCard && (
                          <span className="text-[10px] text-[var(--tt-text-muted)] truncate max-w-[150px]">
                            • {subTitle}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Stock */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-[var(--tt-text-main)] font-mono">
                        {priceToShow > 0 && (
                          <span className="text-[10px] text-[var(--tt-text-muted)] font-normal mr-1">
                            {tHeader("from_price")}
                          </span>
                        )}
                        {priceToShow > 0 ? formatPrice(priceToShow, currency) : "Consultar"}
                      </div>
                      <span
                        className={`text-[10px] font-mono block ${
                          hasStock ? "text-emerald-500 font-semibold" : "text-gray-400"
                        }`}
                      >
                        {hasStock ? "En stock" : "Sin stock"}
                      </span>
                    </div>

                    <IconChevronRight className="w-3.5 h-3.5 text-[var(--tt-text-muted)] shrink-0 hidden sm:block" />
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Action Footer */}
          {results.length > 0 && (
            <div className="p-2 bg-[var(--tt-bg-subtle)] border-t border-[var(--tt-border-subtle)] text-center">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-red hover:text-white hover:bg-red transition-all flex items-center justify-center gap-1.5"
              >
                <span>{tHeader("search_view_all")}</span>
                <IconChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
