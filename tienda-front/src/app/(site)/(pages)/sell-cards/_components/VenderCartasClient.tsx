"use client";
import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/currency";
import { useAppSelector } from "@/redux/store";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { IconZap, IconSearch, IconCash, IconGem, IconFilter, IconArrowRight, IconStore, IconCoins, IconChevronRight, IconRefresh, IconWhatsApp } from "@/components/ui/Icons";
import { fetchCachedConditions, fetchCachedLanguages } from "@/utils/metadataCache";
import { useTranslations } from "next-intl";

interface BuylistItem {
  id: string;
  storeId: string;
  productId: string;
  conditionId?: string;
  languageId?: string;
  quantityWanted: number;
  cashPrice: string | number;
  creditPrice: string | number;
  product: {
    id: string;
    name: string;
    imageUrl?: string;
    cardDetail?: {
      expansion?: string;
      rarity?: string;
      collectorNum?: string;
    };
    category?: {
      id?: string;
      name?: string;
    };
  };
  condition?: {
    id?: string;
    name: string;
    displayName?: string;
  };
  language?: {
    id?: string;
    name: string;
    code: string;
  };
  store: {
    id: string;
    name: string;
    subdomain: string;
    logoUrl?: string;
    settings?: Array<{ key: string; value: string }>;
  };
}

interface StoreData {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
}

interface VenderCartasClientProps {
  initialItems: BuylistItem[];
  initialStores: StoreData[];
}

export default function VenderCartasClient({ initialItems, initialStores }: VenderCartasClientProps) {
  const t = useTranslations("buylist");
  const currency = useAppSelector((state: any) => state.currencyReducer);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("ALL");
  const [selectedGame, setSelectedGame] = useState<string>("ALL");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ALL");
  const [selectedCondition, setSelectedCondition] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"credit-desc" | "cash-desc" | "name-asc">("credit-desc");

  // Trade Modal State
  const [activeTradeItem, setActiveTradeItem] = useState<BuylistItem | null>(null);
  const [tradeQuantity, setTradeQuantity] = useState(1);
  const [payoutMethod, setPayoutMethod] = useState<"credit" | "cash">("credit");
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Metadatos dinámicos desde Base de Datos (metadataCache)
  const [dbConditions, setDbConditions] = useState<Array<{ id: string; name: string; displayName?: string }>>([]);
  const [dbLanguages, setDbLanguages] = useState<Array<{ id: string; name: string; code?: string }>>([]);

  useEffect(() => {
    fetchCachedConditions()
      .then((data) => {
        if (Array.isArray(data)) setDbConditions(data);
      })
      .catch((err) => console.error("Error al obtener condiciones de metadataCache:", err));

    fetchCachedLanguages()
      .then((data) => {
        if (Array.isArray(data)) setDbLanguages(data);
      })
      .catch((err) => console.error("Error al obtener idiomas de metadataCache:", err));
  }, []);

  // Extract unique games
  const uniqueGames = useMemo(() => {
    const set = new Set<string>();
    initialItems.forEach((item) => {
      const catName = item.product?.category?.name;
      if (catName) set.add(catName);
    });
    return Array.from(set);
  }, [initialItems]);

  const storeOptions = useMemo(() => [
    { label: t("filters.all_stores"), value: "ALL" },
    ...initialStores.map((st) => ({ label: st.name, value: st.id })),
  ], [initialStores, t]);

  const gameOptions = useMemo(() => [
    { label: t("filters.all_games"), value: "ALL" },
    ...uniqueGames.map((g) => ({ label: g, value: g })),
  ], [uniqueGames, t]);

  // Idiomas dinámicos consultados a la base de datos (con fallback inmediato de initialItems)
  const languageOptions = useMemo(() => {
    if (dbLanguages.length > 0) {
      const sorted = [...dbLanguages].sort((a, b) => {
        const codeA = (a.code || "").toLowerCase();
        const codeB = (b.code || "").toLowerCase();
        if (codeA === "es") return -1;
        if (codeB === "es") return 1;
        if (codeA === "en") return -1;
        if (codeB === "en") return 1;
        return (a.name || "").localeCompare(b.name || "");
      });
      return [
        { label: t("filters.all_languages"), value: "ALL" },
        ...sorted.map((l) => ({
          label: `${l.name} (${(l.code || l.name).substring(0, 2).toUpperCase()})`,
          value: l.id,
        })),
      ];
    }

    const map = new Map<string, { id: string; code: string; name: string }>();
    initialItems.forEach((item) => {
      if (item.language) {
        const id = item.languageId || item.language.id || item.language.code;
        const code = (item.language.code || item.language.name || "").substring(0, 2).toUpperCase();
        const name = item.language.name || code;
        if (!map.has(id)) map.set(id, { id, code, name });
      }
    });

    return [
      { label: t("filters.all_languages"), value: "ALL" },
      ...Array.from(map.values())
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((l) => ({ label: `${l.name} (${l.code})`, value: l.id })),
    ];
  }, [dbLanguages, initialItems, t]);

  // Estados físicos dinámicos consultados a la base de datos (con fallback inmediato de initialItems)
  const conditionOptions = useMemo(() => {
    const rankCondition = (rawName: string) => {
      const n = (rawName || "").toLowerCase();
      if (n.includes("near") || n === "nm" || n === "mint") return 1;
      if (n.includes("light") || n === "lp" || n.includes("excel")) return 2;
      if (n.includes("moderat") || n === "mp" || n.includes("good")) return 3;
      if (n.includes("heav") || n === "hp") return 4;
      if (n.includes("damag") || n === "dmg" || n.includes("poor")) return 5;
      return 6;
    };

    if (dbConditions.length > 0) {
      const sorted = [...dbConditions].sort((a, b) => rankCondition(a.name) - rankCondition(b.name));
      return [
        { label: t("filters.all_conditions"), value: "ALL" },
        ...sorted.map((c) => ({
          label: c.displayName || c.name,
          value: c.id,
        })),
      ];
    }

    // Fallback dinámico con las cartas recibidas por SSR
    const map = new Map<string, { id: string; name: string; displayName?: string }>();
    initialItems.forEach((item) => {
      if (item.condition) {
        const id = item.conditionId || item.condition.id || item.condition.name;
        if (!map.has(id)) {
          map.set(id, {
            id,
            name: item.condition.name,
            displayName: item.condition.displayName || item.condition.name,
          });
        }
      }
    });

    const extracted = Array.from(map.values()).sort((a, b) => rankCondition(a.name) - rankCondition(b.name));
    return [
      { label: t("filters.all_conditions"), value: "ALL" },
      ...extracted.map((c) => ({
        label: c.displayName || c.name,
        value: c.id,
      })),
    ];
  }, [dbConditions, initialItems, t]);

  const sortOptions = useMemo(() => [
    { label: t("filters.sort_credit"), value: "credit-desc" },
    { label: t("filters.sort_cash"), value: "cash-desc" },
    { label: t("filters.sort_name"), value: "name-asc" },
  ], [t]);

  const filteredItems = useMemo(() => {
    return initialItems
      .filter((item) => {
        // Search text
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const name = item.product?.name?.toLowerCase() || "";
          const expansion = item.product?.cardDetail?.expansion?.toLowerCase() || "";
          const storeName = item.store?.name?.toLowerCase() || "";
          if (!name.includes(q) && !expansion.includes(q) && !storeName.includes(q)) return false;
        }

        // Store filter
        if (selectedStoreId !== "ALL" && item.storeId !== selectedStoreId) return false;

        // Game filter
        if (selectedGame !== "ALL" && item.product?.category?.name !== selectedGame) return false;

        // Language filter (dinámico: coincide por UUID en BD, código ISO o nombre)
        if (selectedLanguage !== "ALL") {
          const matchId = item.languageId === selectedLanguage || item.language?.id === selectedLanguage;
          const itemLangCode = (item.language?.code || item.language?.name || "").substring(0, 2).toUpperCase();
          const matchCode = itemLangCode === selectedLanguage.toUpperCase();
          const matchName = (item.language?.name || "").toLowerCase() === selectedLanguage.toLowerCase();
          if (!matchId && !matchCode && !matchName) return false;
        }

        // Condition filter (dinámico: coincide por UUID en BD o nombre exacto)
        if (selectedCondition !== "ALL") {
          const matchId = item.conditionId === selectedCondition || item.condition?.id === selectedCondition;
          const condName = (item.condition?.name || "").toLowerCase();
          const matchName = condName === selectedCondition.toLowerCase();
          // Fallback para códigos abreviados si se usan
          const matchAbbr =
            (selectedCondition === "NM" && (condName.includes("near_mint") || condName.includes("mint") || condName === "nm")) ||
            (selectedCondition === "LP" && (condName.includes("light") || condName.includes("excel") || condName === "lp" || condName === "ex")) ||
            (selectedCondition === "MP" && (condName.includes("moderate") || condName.includes("good") || condName === "mp" || condName === "gd")) ||
            (selectedCondition === "HP" && (condName.includes("heavy") || condName === "hp")) ||
            (selectedCondition === "DMG" && (condName.includes("damag") || condName.includes("poor") || condName === "dmg"));

          if (!matchId && !matchName && !matchAbbr) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "credit-desc") {
          return Number(b.creditPrice || 0) - Number(a.creditPrice || 0);
        }
        if (sortBy === "cash-desc") {
          return Number(b.cashPrice || 0) - Number(a.cashPrice || 0);
        }
        return (a.product?.name || "").localeCompare(b.product?.name || "");
      });
  }, [initialItems, searchTerm, selectedStoreId, selectedGame, selectedLanguage, selectedCondition, sortBy]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchTerm.trim() !== "" ||
      selectedStoreId !== "ALL" ||
      selectedGame !== "ALL" ||
      selectedLanguage !== "ALL" ||
      selectedCondition !== "ALL" ||
      sortBy !== "credit-desc"
    );
  }, [searchTerm, selectedStoreId, selectedGame, selectedLanguage, selectedCondition, sortBy]);

  const handleResetAllFilters = () => {
    setSearchTerm("");
    setSelectedStoreId("ALL");
    setSelectedGame("ALL");
    setSelectedLanguage("ALL");
    setSelectedCondition("ALL");
    setSortBy("credit-desc");
  };

  const getConditionBadge = (condName?: string) => {
    const raw = (condName || "NM").toUpperCase();
    if (raw.includes("NEAR") || raw === "NM" || raw.includes("MINT")) {
      return { label: "NM", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" };
    }
    if (raw.includes("LIGHT") || raw === "LP" || raw.includes("EXCEL")) {
      return { label: "LP", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" };
    }
    if (raw.includes("MODERATE") || raw === "MP" || raw.includes("GOOD")) {
      return { label: "MP", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" };
    }
    if (raw.includes("HEAVY") || raw === "HP" || raw.includes("PLAYED")) {
      return { label: "HP", className: "bg-orange-500/15 text-orange-400 border-orange-500/30" };
    }
    return { label: "DMG", className: "bg-rose-500/15 text-rose-400 border-rose-500/30" };
  };

  const handleOpenTrade = (item: BuylistItem) => {
    setActiveTradeItem(item);
    setTradeQuantity(1);
    setPayoutMethod("credit");
    setCopiedNotification(false);
  };

  const handleWhatsAppContact = () => {
    if (!activeTradeItem) return;
    const item = activeTradeItem;
    const settings = (item.store?.settings || []).reduce((acc: Record<string, string>, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const phone = (settings.whatsapp || settings.phone || "").replace(/[^0-9]/g, "");
    const cond = item.condition?.displayName || item.condition?.name || "Near Mint";
    const lang = item.language?.name || "English";
    const chosenPrice = payoutMethod === "credit" ? Number(item.creditPrice || 0) : Number(item.cashPrice || 0);
    const total = chosenPrice * tradeQuantity;
    const methodStr = payoutMethod === "credit" ? t("trade_modal.store_credit") : t("trade_modal.cash_transfer");

    const message = t("trade_modal.whatsapp_message", {
      storeName: item.store.name,
      cardName: item.product.name,
      cond,
      lang,
      qty: tradeQuantity,
      total: total.toLocaleString("es-CL"),
      method: methodStr,
    });

    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  const handleCopyOfferDetails = () => {
    if (!activeTradeItem) return;
    const item = activeTradeItem;
    const cond = item.condition?.displayName || item.condition?.name || "Near Mint";
    const lang = item.language?.name || "English";
    const chosenPrice = payoutMethod === "credit" ? Number(item.creditPrice || 0) : Number(item.cashPrice || 0);
    const total = chosenPrice * tradeQuantity;
    const methodStr = payoutMethod === "credit" ? t("trade_modal.store_credit") : t("trade_modal.cash");

    const text = t("trade_modal.copy_offer_text", {
      storeName: item.store.name,
      cardName: item.product.name,
      cond,
      lang,
      qty: tradeQuantity,
      method: methodStr,
      total: total.toLocaleString("es-CL"),
    });
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header & Hero Atmosphere */}
      <div className="text-center max-w-3xl mx-auto mb-12 relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-4">
          <IconZap className="w-3.5 h-3.5" /> {t("badge_live")}
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
          {t("hero_title")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">{t("hero_highlight")}</span>
        </h1>

        <p className="mt-4 text-gray-300 text-base sm:text-lg leading-relaxed">
          {t("hero_description")}
        </p>
      </div>

      {/* 2. Visual 3-Step Process (Refactoring UI / Dark Vault Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="rounded-2xl bg-[#111522] border border-white/[0.08] p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-base flex items-center justify-center mb-3">
            1
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {t("steps.step1_title")}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {t("steps.step1_desc")}
          </p>
        </div>

        <div className="rounded-2xl bg-[#111522] border border-white/[0.08] p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-base flex items-center justify-center mb-3">
            2
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {t("steps.step2_title")}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {t("steps.step2_desc")}
          </p>
        </div>

        <div className="rounded-2xl bg-[#111522] border border-white/[0.08] p-5 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-base flex items-center justify-center mb-3">
            3
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            {t("steps.step3_title")}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {t("steps.step3_desc")}
          </p>
        </div>
      </div>

      {/* 3. Global Buylist Toolbar & Live Search */}
      <div className="bg-[#111522] border border-white/[0.08] rounded-2xl p-4 sm:p-5 mb-8 shadow-xl space-y-3.5">
        {/* Row 1: Full-Width Prominent Search Bar */}
        <div className="relative w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("search_placeholder")}
            className="w-full h-12 pl-11 pr-10 rounded-xl bg-[#0A0D14] border border-white/10 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
          />
          <IconSearch className="w-4 h-4 text-gray-500 absolute left-4 top-4 pointer-events-none" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3.5 top-3.5 w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-all"
            >
              ✕
            </button>
          )}
        </div>

        {/* Row 2: Unified 5-Column Filter Toolbar (Equal widths, laser-aligned, no wrapping bugs) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-5 gap-2.5 pt-3 border-t border-white/5">
          {/* 1. Store filter */}
          <div className="w-full col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-1">
            <SearchableSelect
              options={storeOptions}
              value={selectedStoreId}
              onChange={(val) => setSelectedStoreId(val || "ALL")}
              placeholder={t("filters.filter_by_store")}
              inputClassName={`h-10 !text-xs !bg-[#0A0D14] font-semibold truncate transition-all ${
                selectedStoreId !== "ALL"
                  ? "!border-amber-500/60 !text-amber-300 ring-1 ring-amber-500/20"
                  : "!border-white/10 !text-gray-300 hover:!border-white/20"
              } focus:!border-amber-500/60 focus:!ring-amber-500/20`}
              noResultsText={t("filters.no_store_found")}
            />
          </div>

          {/* 2. Game filter */}
          <div className="w-full col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-1">
            <SearchableSelect
              options={gameOptions}
              value={selectedGame}
              onChange={(val) => setSelectedGame(val || "ALL")}
              placeholder={t("filters.filter_by_game")}
              inputClassName={`h-10 !text-xs !bg-[#0A0D14] font-semibold truncate transition-all ${
                selectedGame !== "ALL"
                  ? "!border-amber-500/60 !text-amber-300 ring-1 ring-amber-500/20"
                  : "!border-white/10 !text-gray-300 hover:!border-white/20"
              } focus:!border-amber-500/60 focus:!ring-amber-500/20`}
              noResultsText={t("filters.no_game_found")}
            />
          </div>

          {/* 3. Language filter */}
          <div className="w-full col-span-1 sm:col-span-1 md:col-span-2 lg:col-span-1">
            <SearchableSelect
              options={languageOptions}
              value={selectedLanguage}
              onChange={(val) => setSelectedLanguage(val || "ALL")}
              placeholder={t("filters.filter_by_language")}
              inputClassName={`h-10 !text-xs !bg-[#0A0D14] font-semibold truncate transition-all ${
                selectedLanguage !== "ALL"
                  ? "!border-amber-500/60 !text-amber-300 ring-1 ring-amber-500/20"
                  : "!border-white/10 !text-gray-300 hover:!border-white/20"
              } focus:!border-amber-500/60 focus:!ring-amber-500/20`}
              noResultsText={t("filters.no_language_found")}
            />
          </div>

          {/* 4. Condition filter */}
          <div className="w-full col-span-1 sm:col-span-1 md:col-span-3 lg:col-span-1">
            <SearchableSelect
              options={conditionOptions}
              value={selectedCondition}
              onChange={(val) => setSelectedCondition(val || "ALL")}
              placeholder={t("filters.filter_by_condition")}
              inputClassName={`h-10 !text-xs !bg-[#0A0D14] font-semibold truncate transition-all ${
                selectedCondition !== "ALL"
                  ? "!border-amber-500/60 !text-amber-300 ring-1 ring-amber-500/20"
                  : "!border-white/10 !text-gray-300 hover:!border-white/20"
              } focus:!border-amber-500/60 focus:!ring-amber-500/20`}
              noResultsText={t("filters.no_condition_found")}
            />
          </div>

          {/* 5. Sort order */}
          <div className="w-full col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-1">
            <SearchableSelect
              options={sortOptions}
              value={sortBy}
              onChange={(val) => setSortBy((val as any) || "credit-desc")}
              placeholder={t("filters.order_by")}
              inputClassName={`h-10 !text-xs !bg-[#0A0D14] font-semibold truncate transition-all ${
                sortBy !== "credit-desc"
                  ? "!border-amber-500/60 !text-amber-300 ring-1 ring-amber-500/20"
                  : "!border-white/10 !text-gray-300 hover:!border-white/20"
              } focus:!border-amber-500/60 focus:!ring-amber-500/20`}
              noResultsText={t("filters.no_option_found")}
            />
          </div>
        </div>

        {/* Row 3: Active Filters Summary & Instant Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/5 text-xs text-gray-400">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mr-1 flex items-center gap-1">
                <IconFilter className="w-3 h-3 text-amber-400" />
                <span>{t("filters.active_filters")}</span>
              </span>

              {searchTerm.trim() && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-white text-[11px]">
                  <span>"{searchTerm}"</span>
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </span>
              )}

              {selectedStoreId !== "ALL" && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                  <span>{storeOptions.find((o) => o.value === selectedStoreId)?.label || selectedStoreId}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedStoreId("ALL")}
                    className="text-amber-400 hover:text-amber-200"
                  >
                    ✕
                  </button>
                </span>
              )}

              {selectedGame !== "ALL" && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                  <span>{gameOptions.find((o) => o.value === selectedGame)?.label || selectedGame}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedGame("ALL")}
                    className="text-amber-400 hover:text-amber-200"
                  >
                    ✕
                  </button>
                </span>
              )}

              {selectedLanguage !== "ALL" && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                  <span>{languageOptions.find((o) => o.value === selectedLanguage)?.label || selectedLanguage}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedLanguage("ALL")}
                    className="text-amber-400 hover:text-amber-200"
                  >
                    ✕
                  </button>
                </span>
              )}

              {selectedCondition !== "ALL" && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px]">
                  <span>{conditionOptions.find((o) => o.value === selectedCondition)?.label || selectedCondition}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCondition("ALL")}
                    className="text-amber-400 hover:text-amber-200"
                  >
                    ✕
                  </button>
                </span>
              )}

              {sortBy !== "credit-desc" && (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-[11px]">
                  <span>{sortOptions.find((o) => o.value === sortBy)?.label || sortBy}</span>
                  <button
                    type="button"
                    onClick={() => setSortBy("credit-desc")}
                    className="text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetAllFilters}
              className="text-[11px] font-bold text-gray-400 hover:text-amber-400 underline underline-offset-2 transition-colors ml-auto cursor-pointer"
            >
              {t("clear_filters")}
            </button>
          </div>
        )}
      </div>

      {/* 4. Buylist Cards Grid */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <span>{t("cards_wanted_title")}</span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
            {t("publications_count", { count: filteredItems.length })}
          </span>
        </h2>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl bg-[#111522]/40 border border-dashed border-white/10">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <IconSearch className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {t("no_results_title")}
          </h3>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-6">
            {t("no_results_desc")}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setSelectedStoreId("ALL");
              setSelectedGame("ALL");
              setSelectedLanguage("ALL");
              setSelectedCondition("ALL");
            }}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
          >
            {t("clear_filters")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const cond = getConditionBadge(item.condition?.name);
            const langCode = (item.language?.code || item.language?.name || "EN").substring(0, 2).toUpperCase();
            const cash = Number(item.cashPrice || 0);
            const credit = Number(item.creditPrice || 0);
            const bonusPercent = cash > 0 && credit > cash ? Math.round(((credit - cash) / cash) * 100) : 0;
            const imgUrl = item.product?.imageUrl || "/images/products/product-1-bg-1.png";

            return (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-[#111522] border border-white/[0.08] hover:border-amber-500/40 p-4 transition-all duration-300 hover:shadow-[0_4px_30px_rgba(245,158,11,0.12)] flex flex-col justify-between"
              >
                <div>
                  {/* Store Identity Badge */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/[0.06]">
                    <Link
                      href={`/shop/store/${item.store.subdomain}?tab=buylist`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {item.store.logoUrl ? (
                          <img src={item.store.logoUrl} alt={item.store.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400">
                            {item.store.name.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-gray-300 hover:text-white truncate">
                        {item.store.name}
                      </span>
                    </Link>

                    <Link
                      href={`/shop/store/${item.store.subdomain}?tab=buylist`}
                      className="text-[11px] text-amber-400 hover:underline shrink-0"
                    >
                      {t("item_card.view_store_buylist")}
                    </Link>
                  </div>

                  {/* Card Content Row */}
                  <div className="flex gap-3.5">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-28 shrink-0 rounded-xl overflow-hidden bg-[#0A0D14] border border-white/10 group-hover:border-amber-500/30 transition-all">
                      <Image
                        src={imgUrl}
                        alt={item.product?.name || "TCG Card"}
                        fill
                        unoptimized
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Card Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${cond.className}`}>
                          {cond.label}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-gray-300">
                          {langCode}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {t("item_card.looking_for", { count: item.quantityWanted })}
                        </span>
                      </div>

                      <h4 className="font-bold text-white text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-amber-300 transition-colors">
                        {item.product?.name}
                      </h4>

                      <p className="text-xs text-gray-400 truncate mt-1">
                        {item.product?.cardDetail?.expansion || item.product?.category?.name || "Single TCG"}
                      </p>
                    </div>
                  </div>

                  {/* Dual Price Matrix */}
                  <div className="mt-4 grid grid-cols-2 gap-2 bg-[#0A0D14]/70 rounded-xl p-2.5 border border-white/5">
                    <div>
                      <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        <IconCash className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{t("item_card.cash")}</span>
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {formatPrice(cash, currency)}
                      </span>
                    </div>

                    <div className="border-l border-white/10 pl-2.5">
                      <div className="flex items-center gap-1">
                        <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                          <IconGem className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t("item_card.credit")}</span>
                        </span>
                        {bonusPercent > 0 && (
                          <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/15 px-1 rounded">
                            +{bonusPercent}%
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-extrabold text-amber-300">
                        {formatPrice(credit, currency)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sell Action */}
                <button
                  type="button"
                  onClick={() => handleOpenTrade(item)}
                  className="mt-4 w-full h-11 rounded-xl font-black text-xs uppercase tracking-wider bg-[#F59E0B] hover:bg-[#FBBF24] text-[#0A0D14] flex items-center justify-center gap-2 shadow-lg shadow-[#F59E0B]/25 active:scale-[0.98] transition-all border border-amber-300/40 cursor-pointer"
                >
                  <span>{t("item_card.offer_to", { storeName: item.store.name })}</span>
                  <IconChevronRight className="w-3.5 h-3.5 text-current" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Direct Store Buylist Directory Banner - High-Converting B2B Section */}
      <div className="mt-16 relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#141A2D] via-[#0E121B] to-[#0A0D14] border border-white/10 p-8 sm:p-12 shadow-2xl text-center">
        {/* Glow accents */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-red-600/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 right-10 w-80 h-48 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 mb-5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400">
              {t("b2b_banner.badge")}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-4 leading-tight">
            {t("b2b_banner.title_prefix")}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">
              {t("b2b_banner.title_highlight")}
            </span>
          </h3>

          {/* Persuasive Hook Description */}
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed mb-8 max-w-2xl mx-auto font-normal">
            {t("b2b_banner.description")}
          </p>

          {/* Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0 mt-0.5">
                <IconCoins className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{t("b2b_banner.feature_commission_title")}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{t("b2b_banner.feature_commission_desc")}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <IconZap className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{t("b2b_banner.feature_buylist_title")}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{t("b2b_banner.feature_buylist_desc")}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                <IconStore className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">{t("b2b_banner.feature_storefront_title")}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{t("b2b_banner.feature_storefront_desc")}</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/landing#for-stores"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-sm shadow-xl shadow-red-600/30 hover:shadow-red-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>{t("b2b_banner.cta_plans")}</span>
              <IconArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin/buylist"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-gray-300 hover:text-white font-semibold text-xs border border-white/10 hover:border-white/20 transition-all"
            >
              <span>{t("b2b_banner.cta_already_seller")}</span>
            </Link>
          </div>

          {/* Reassurance Micro-copy */}
          <p className="text-xs text-gray-400 mt-5 font-mono">
            {t("b2b_banner.reassurance")}
          </p>
        </div>
      </div>

      {/* 6. Trade Modal */}
      {activeTradeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#111522] border border-white/10 p-6 shadow-2xl text-white">
            <button
              type="button"
              onClick={() => setActiveTradeItem(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
            >
              ✕
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-8 h-8 rounded-xl bg-red-600/15 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                <IconRefresh className="w-4 h-4" />
              </span>
              <h3 className="text-lg font-black text-white">
                {t("trade_modal.title", { storeName: activeTradeItem.store.name })}
              </h3>
            </div>

            {/* Selected Card Summary */}
            <div className="flex gap-4 p-3 rounded-xl bg-[#0A0D14] border border-white/5 mb-5">
              <div className="relative w-16 h-22 shrink-0 rounded-lg overflow-hidden bg-black/40 border border-white/10">
                <Image
                  src={activeTradeItem.product?.imageUrl || "/images/products/product-1-bg-1.png"}
                  alt={activeTradeItem.product?.name || "TCG Card"}
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-base truncate">
                  {activeTradeItem.product?.name}
                </h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {activeTradeItem.product?.cardDetail?.expansion || t("trade_modal.official_edition")}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                    {activeTradeItem.condition?.displayName || "Near Mint"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {t("trade_modal.max_copies", { count: activeTradeItem.quantityWanted })}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                {t("trade_modal.quantity_to_sell")}
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={tradeQuantity <= 1}
                  onClick={() => setTradeQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 font-bold text-lg"
                >
                  -
                </button>
                <span className="text-lg font-black font-mono w-10 text-center">
                  {tradeQuantity}
                </span>
                <button
                  type="button"
                  disabled={tradeQuantity >= activeTradeItem.quantityWanted}
                  onClick={() => setTradeQuantity((q) => Math.min(activeTradeItem.quantityWanted, q + 1))}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-40 font-bold text-lg"
                >
                  +
                </button>
                <span className="text-xs text-gray-400">
                  {t("trade_modal.max_requested", { max: activeTradeItem.quantityWanted })}
                </span>
              </div>
            </div>

            {/* Payout Options */}
            <div className="mb-6">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                {t("trade_modal.choose_payout")}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPayoutMethod("credit")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    payoutMethod === "credit"
                      ? "bg-amber-500/15 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                      : "bg-[#0A0D14] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                      {t("trade_modal.store_credit")}
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                      {t("trade_modal.bonus_badge")}
                    </span>
                  </div>
                  <span className="text-base font-black text-white block mt-1">
                    {formatPrice(Number(activeTradeItem.creditPrice || 0) * tradeQuantity, currency)}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    {t("trade_modal.credit_desc", { storeName: activeTradeItem.store.name })}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPayoutMethod("cash")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    payoutMethod === "cash"
                      ? "bg-emerald-500/15 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                      : "bg-[#0A0D14] border-white/10 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider block">
                    {t("trade_modal.cash")}
                  </span>
                  <span className="text-base font-black text-white block mt-1">
                    {formatPrice(Number(activeTradeItem.cashPrice || 0) * tradeQuantity, currency)}
                  </span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">
                    {t("trade_modal.cash_desc")}
                  </span>
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleWhatsAppContact}
                className="w-full h-11 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98]"
              >
                <IconWhatsApp className="w-4 h-4" />
                {t("trade_modal.whatsapp_contact", { storeName: activeTradeItem.store.name })}
              </button>

              <button
                type="button"
                onClick={handleCopyOfferDetails}
                className="w-full h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {copiedNotification ? t("trade_modal.copied_success") : t("trade_modal.copy_offer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
