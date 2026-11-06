"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import SearchableSelect from "@/components/ui/SearchableSelect";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { Product } from "@/types/product";
import { useGlobalCatalogSearch } from "@/app/admin/_components/Products/hooks/useGlobalCatalogSearch";
import { API_URL, adminFetch } from "@/utils/api";
import { IconGlobe, IconCard, IconBox, IconSearch } from "@/components/ui/Icons";

export interface GlobalCatalogSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  mode?: "all" | "singles" | "sealed";
}

export default function GlobalCatalogSearchModal({
  isOpen,
  onClose,
  onSelectProduct,
  mode = "all",
}: GlobalCatalogSearchModalProps) {
  const t = useTranslations("buylist_page");
  const tFilter = useTranslations("products.filters");
  const {
    searchTerm,
    setSearchTerm,
    selectedGame,
    setSelectedGame,
    selectedCategory,
    setSelectedCategory,
    isTcgFilter,
    setIsTcgFilter,
    results,
    loading,
  } = useGlobalCatalogSearch();

  const [activeTab, setActiveTab] = useState<"all" | "singles" | "sealed">(mode);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [sealedCategories, setSealedCategories] = useState<{ id: string; name: string }[]>([]);
  const [allCategories, setAllCategories] = useState<{ id: string; name: string }[]>([]);

  // Inicializar estado según el modo recibido al abrir
  useEffect(() => {
    if (isOpen) {
      setActiveTab(mode);
      if (mode === "sealed") {
        setIsTcgFilter(false);
      } else if (mode === "singles") {
        setIsTcgFilter(true);
      } else {
        setIsTcgFilter(undefined);
      }
    }
  }, [isOpen, mode, setIsTcgFilter]);

  // Cargar metadatos: Juegos y Categorías
  useEffect(() => {
    if (!isOpen) return;

    // Juegos TCG
    fetch(`${API_URL}/games`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setGames(data))
      .catch((err) => console.error("Error loading games:", err));

    // Categorías de Sellado / Accesorios (SOLO las que no son un TCG: isTcg=false)
    adminFetch(`/products/meta/categories/admin?isTcg=false`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setSealedCategories(data);
        }
      })
      .catch((err) => console.error("Error loading sealed categories:", err));

    // Todas las categorías (para el tab 'all')
    adminFetch(`/products/meta/categories/admin`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          setAllCategories(data);
        }
      })
      .catch((err) => console.error("Error loading all categories:", err));
  }, [isOpen]);

  // Manejar cambio de pestaña en modo 'all'
  const handleTabChange = (newTab: "all" | "singles" | "sealed") => {
    setActiveTab(newTab);
    setSelectedGame("");
    setSelectedCategory("");
    if (newTab === "sealed") {
      setIsTcgFilter(false);
    } else if (newTab === "singles") {
      setIsTcgFilter(true);
    } else {
      setIsTcgFilter(undefined);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    if (mode === "sealed") return t("global_title_sealed");
    if (mode === "singles") return t("global_title_singles");
    return t("global_title_all");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getModalTitle()}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Selector de Pestaña solo si el modal es de modo general ('all') */}
        {mode === "all" && (
          <div className="flex items-center justify-between pb-1">
            <SegmentedControl
              fullWidth={true}
              size="sm"
              value={activeTab}
              onChange={(val) => handleTabChange(val as "all" | "singles" | "sealed")}
              options={[
                { value: "all", label: t("tab_all_products"), icon: <IconGlobe className="w-3.5 h-3.5" />, variant: "default" },
                { value: "singles", label: t("tab_singles_tcg"), icon: <IconCard className="w-3.5 h-3.5" />, variant: "blue" },
                { value: "sealed", label: t("tab_sealed_acc"), icon: <IconBox className="w-3.5 h-3.5" />, variant: "success" },
              ]}
            />
          </div>
        )}

        {/* Filtros dinámicos según pestaña activa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Si estamos en Singles TCG: Dropdown de Juegos TCG */}
          {activeTab === "singles" && (
            <div className="md:col-span-1">
              <label className="mb-1.5 block text-xs font-medium text-white/70">{t("filter_by_game")}</label>
              <SearchableSelect
                options={[
                  { label: t("tab_all"), value: "" },
                  ...games.map((g) => ({ label: g.name, value: g.id })),
                ]}
                value={selectedGame}
                onChange={setSelectedGame}
                placeholder={t("filter_by_game")}
              />
            </div>
          )}

          {/* Si estamos en Sellado & Accesorios: Dropdown exclusivo de categorías NO-TCG */}
          {activeTab === "sealed" && (
            <div className="md:col-span-1">
              <label className="mb-1.5 block text-xs font-medium text-white/70">{t("sealed_category")}</label>
              <SearchableSelect
                options={[
                  { label: tFilter("allCategories"), value: "" },
                  ...sealedCategories.map((c) => ({ label: c.name, value: c.name })),
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder={tFilter("allCategories")}
              />
            </div>
          )}

          {/* Si estamos en Todos: Dropdown de todas las categorías */}
          {activeTab === "all" && (
            <div className="md:col-span-1">
              <label className="mb-1.5 block text-xs font-medium text-white/70">{tFilter("category")}</label>
              <SearchableSelect
                options={[
                  { label: tFilter("allCategories"), value: "" },
                  ...allCategories.map((c) => ({ label: c.name, value: c.name })),
                ]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder={tFilter("allCategories")}
              />
            </div>
          )}

          {/* Input de Búsqueda por Nombre */}
          <div className="md:col-span-2">
            <Input
              label={t("search_by_name")}
              placeholder={tFilter("searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <p className="text-xs text-gray-4 font-medium">
          {t("start_typing_search")}
        </p>

        {/* Lista de Resultados */}
        <div
          className="min-h-[300px] border border-white/10 rounded-xl p-2 bg-[#080B12] overflow-y-auto max-h-[400px]"
          onMouseMove={handleMouseMove}
        >
          {loading ? (
            <div className="flex justify-center items-center h-full py-12">
              <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((product) => {
                const isTcgProduct = Boolean(product.cardDetail);
                const categoryName = product.category?.name || (isTcgProduct ? t("tab_singles_tcg") : t("tab_sealed_acc"));

                return (
                  <button
                    key={product.id}
                    onClick={() => onSelectProduct(product)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-[#1a1d24] transition-colors rounded-lg text-left group border border-transparent hover:border-stroke"
                  >
                    <div
                      className="w-12 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-800 border border-stroke cursor-zoom-in transition-transform group-hover:scale-105"
                      onMouseEnter={() => product.imageUrl && setHoveredImage(product.imageUrl)}
                      onMouseLeave={() => setHoveredImage(null)}
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src && target.src.includes("?")) {
                              target.src = target.src.split("?")[0];
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-5">
                          {t("no_image")}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm group-hover:text-blue transition-colors truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-4 mt-0.5 truncate">
                        {isTcgProduct ? (
                          <>
                            {product.cardDetail?.gameRel?.name ? `${product.cardDetail.gameRel.name} • ` : ""}
                            {categoryName} • {product.cardDetail?.expansion || "-"}
                          </>
                        ) : (
                          <>
                            {product.brand?.name ? `${product.brand.name} • ` : ""}
                            {categoryName}
                          </>
                        )}
                      </p>

                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {product.marketPrices && product.marketPrices.length > 0 ? (
                          Array.from(
                            new Map(
                              product.marketPrices
                                .filter((mp) => mp.finish)
                                .map((mp) => [mp.finish!.id, mp.finish!.name])
                            ).values()
                          ).map((finishName) => (
                            <span
                              key={finishName}
                              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1C2434] text-gray-4 border border-white/10"
                            >
                              {finishName}
                            </span>
                          ))
                        ) : null}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-red group-hover:underline">{t("select_btn")}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : searchTerm || selectedCategory || selectedGame ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-4">
              <IconSearch className="w-12 h-12 stroke-current mb-3 opacity-20" />
              <p className="text-sm">{t("no_products_match")}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center text-gray-5">
              <IconSearch className="w-12 h-12 stroke-current mb-2 opacity-20" />
              <p className="text-sm">{t("start_typing_search")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Image Preview */}
      {hoveredImage && (
        <div
          className="fixed z-999999 pointer-events-none shadow-2xl rounded-2xl border-2 border-white/20 bg-[#0E121B] shadow-black overflow-hidden transition-all duration-200 animate-in fade-in zoom-in"
          style={{
            top:
              mousePos.y > (typeof window !== "undefined" ? window.innerHeight * 0.6 : 500)
                ? mousePos.y - 440
                : mousePos.y + 20,
            left: mousePos.x + 20,
            maxWidth: "280px",
          }}
        >
          <img
            src={hoveredImage}
            alt="Preview"
            className="w-full h-auto object-contain"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src && target.src.includes("?")) {
                target.src = target.src.split("?")[0];
              }
            }}
          />
        </div>
      )}
    </Modal>
  );
}
