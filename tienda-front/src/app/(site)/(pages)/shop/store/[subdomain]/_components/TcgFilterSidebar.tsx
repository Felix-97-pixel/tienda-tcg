"use client";
import React from "react";
import {
  IconSparkles,
  IconLanguageFlag,
  IconSearch,
  IconX,
} from "@/components/ui/Icons";

import { API_URL } from "@/utils/api";

interface TcgFilterSidebarProps {
  categories: any[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;

  expansions: any[];
  selectedExpansion: string | null;
  onSelectExpansion: (exp: string | null) => void;

  conditions?: any[];
  selectedCondition: string | null;
  onSelectCondition: (cond: string | null) => void;

  selectedFinish: string | null;
  onSelectFinish: (finish: string | null) => void;

  languages?: any[];
  selectedLanguage: string | null;
  onSelectLanguage: (lang: string | null) => void;

  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;

  onClearAll: () => void;
  activeFiltersCount: number;
  totalProductsCount: number;
}

const FINISHES = [
  { id: "normal", label: "Normal" },
  { id: "foil", label: "Foil / Holo" },
];

export default function TcgFilterSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  expansions,
  selectedExpansion,
  onSelectExpansion,
  conditions,
  selectedCondition,
  onSelectCondition,
  selectedFinish,
  onSelectFinish,
  languages,
  selectedLanguage,
  onSelectLanguage,
  onClearAll,
  activeFiltersCount,
  totalProductsCount,
}: TcgFilterSidebarProps) {
  const [categorySearch, setCategorySearch] = React.useState("");
  const [categoryTab, setCategoryTab] = React.useState<"all" | "games" | "accessories">("all");
  const [expansionSearch, setExpansionSearch] = React.useState("");
  const [dbConditions, setDbConditions] = React.useState<any[]>(conditions || []);
  const [dbLanguages, setDbLanguages] = React.useState<any[]>(languages || []);

  // Fetch conditions dynamically from DB if not provided
  React.useEffect(() => {
    if (conditions && conditions.length > 0) {
      setDbConditions(conditions);
      return;
    }
    fetch(`${API_URL}/products/meta/conditions`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbConditions(data);
        }
      })
      .catch((err) => console.error("Error fetching conditions:", err));
  }, [conditions]);

  // Fetch languages dynamically from DB if not provided
  React.useEffect(() => {
    if (languages && languages.length > 0) {
      setDbLanguages(languages);
      return;
    }
    fetch(`${API_URL}/products/meta/languages`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbLanguages(data);
        }
      })
      .catch((err) => console.error("Error fetching languages:", err));
  }, [languages]);

  // Format conditions dynamically with standard TCG codes, ranks, and badges
  const formattedConditions = React.useMemo(() => {
    if (!dbConditions || dbConditions.length === 0) {
      return [
        { code: "NM", name: "near_mint", label: "Near Mint", badgeClass: "badge-condition-nm", rank: 1 },
        { code: "LP", name: "light_played", label: "Lightly Played", badgeClass: "badge-condition-lp", rank: 2 },
        { code: "MP", name: "moderately_played", label: "Moderately Played", badgeClass: "badge-condition-mp", rank: 3 },
        { code: "HP", name: "heavily_played", label: "Heavily Played", badgeClass: "badge-condition-hp", rank: 4 },
      ];
    }

    const getRankAndStyle = (rawName: string) => {
      const n = (rawName || "").toLowerCase();
      if (n === "mint") return { rank: 1, code: "MT", badgeClass: "badge-condition-nm" };
      if (n.includes("near") || n === "nm") return { rank: 2, code: "NM", badgeClass: "badge-condition-nm" };
      if (n === "excellent") return { rank: 3, code: "EX", badgeClass: "badge-condition-lp" };
      if (n.includes("light") || n === "lp") return { rank: 4, code: "LP", badgeClass: "badge-condition-lp" };
      if (n === "good") return { rank: 5, code: "GD", badgeClass: "badge-condition-lp" };
      if (n.includes("moderat") || n === "mp") return { rank: 6, code: "MP", badgeClass: "badge-condition-mp" };
      if (n.includes("heav") || n === "hp") return { rank: 7, code: "HP", badgeClass: "badge-condition-hp" };
      if (n.includes("damag") || n === "dmg") return { rank: 8, code: "DMG", badgeClass: "bg-red-500/15 text-red-400 border-red-500/30" };
      if (n === "poor") return { rank: 9, code: "POOR", badgeClass: "bg-red-500/15 text-red-400 border-red-500/30" };
      return { rank: 10, code: n.slice(0, 3).toUpperCase(), badgeClass: "bg-white/10 text-gray-300 border-white/20" };
    };

    return [...dbConditions]
      .map((c) => {
        const name = c.name || "";
        const label = c.displayName || c.name || "Condición";
        const { rank, code, badgeClass } = getRankAndStyle(name);
        return { id: c.id, name, label, code, rank, badgeClass };
      })
      .sort((a, b) => a.rank - b.rank);
  }, [dbConditions]);

  // Categorize items
  const filteredCategories = React.useMemo(() => {
    return categories.filter((cat: any) => {
      const name = (cat.name || cat.title || "").toLowerCase();
      const matchesSearch = !categorySearch.trim() || name.includes(categorySearch.toLowerCase().trim());
      if (!matchesSearch) return false;

      const isGame = name.includes("singles") || name.includes("magic") || name.includes("pokemon") || name.includes("riftbound") || name.includes("yugioh") || name.includes("one piece") || name.includes("tcg");
      if (categoryTab === "games") return isGame;
      if (categoryTab === "accessories") return !isGame;
      return true;
    });
  }, [categories, categorySearch, categoryTab]);

  // Filter expansions
  const filteredExpansions = React.useMemo(() => {
    return expansions.filter((exp: any) => {
      const expName = typeof exp === "string" ? exp : exp.name;
      if (!expName) return false;
      return !expansionSearch.trim() || expName.toLowerCase().includes(expansionSearch.toLowerCase().trim());
    });
  }, [expansions, expansionSearch]);

  return (
    <aside className="w-full bg-[#11151F] border border-white/10 rounded-2xl p-5 shadow-xl">
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <svg className="w-4 h-4 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtros TCG
          </h2>
          <span className="text-xs text-gray-400 font-mono">
            {totalProductsCount} cartas encontradas
          </span>
        </div>

        {activeFiltersCount > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-semibold text-red hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-md bg-red/10 border border-red/20"
          >
            Limpiar ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* 1. Juegos Soportados / Categorías */}
        {categories.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Juego / Categoría
              </h3>
              <span className="text-[10px] font-mono text-gray-500">
                {categories.length} disp.
              </span>
            </div>

            {/* Segmented Filter: All vs Games vs Accessories */}
            <div className="flex rounded-lg bg-black/40 border border-white/10 p-0.5 mb-2.5">
              <button
                type="button"
                onClick={() => setCategoryTab("all")}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  categoryTab === "all" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setCategoryTab("games")}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  categoryTab === "games" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Juegos
              </button>
              <button
                type="button"
                onClick={() => setCategoryTab("accessories")}
                className={`flex-1 py-1 text-[11px] font-semibold rounded-md transition-all ${
                  categoryTab === "accessories" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                Accesorios
              </button>
            </div>

            {/* Search Input for Categories */}
            {categories.length > 5 && (
              <div className="relative mb-2">
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Buscar juego o categoría..."
                  className="w-full h-8 pl-8 pr-7 rounded-lg bg-[#0A0D14] border border-white/10 text-white placeholder-gray-500 text-[11px] focus:outline-none focus:border-red-500/60 transition-colors"
                />
                <IconSearch className="absolute left-2.5 top-2 text-gray-500 w-3.5 h-3.5 pointer-events-none" />
                {categorySearch && (
                  <button
                    type="button"
                    onClick={() => setCategorySearch("")}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white"
                  >
                    <IconX className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Category List */}
            <div className="max-h-48 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
              {filteredCategories.length === 0 ? (
                <div className="py-3 text-center text-xs text-gray-500">
                  No coincide ninguna categoría
                </div>
              ) : (
                filteredCategories.map((cat: any) => {
                  const isSelected = selectedCategory === cat.name || selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id || cat.name}
                      onClick={() => onSelectCategory(isSelected ? null : (cat.name || cat.id))}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-red text-white shadow-md shadow-red/20 border border-red-500 font-bold"
                          : "bg-white/[0.03] text-gray-300 hover:bg-white/10 hover:text-white border border-white/5"
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 stroke-current flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 2. Expansiones / Sets con Buscador Integrado */}
        {expansions.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Expansión / Edición
              </h3>
              <span className="text-[10px] font-mono text-gray-500">
                {filteredExpansions.length} de {expansions.length}
              </span>
            </div>

            {/* Instant Search Input for Expansions */}
            <div className="relative mb-2">
              <input
                type="text"
                value={expansionSearch}
                onChange={(e) => setExpansionSearch(e.target.value)}
                placeholder="Buscar expansión... (ej. Bloomburrow, 151)"
                className="w-full h-8 pl-8 pr-7 rounded-lg bg-[#0A0D14] border border-white/10 text-white placeholder-gray-500 text-[11px] focus:outline-none focus:border-red-500/60 transition-colors"
              />
              <IconSearch className="absolute left-2.5 top-2 text-gray-500 w-3.5 h-3.5 pointer-events-none" />
              {expansionSearch && (
                <button
                  type="button"
                  onClick={() => setExpansionSearch("")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                >
                  <IconX className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Scrollable Expansion List with Custom Dark Scrollbar */}
            <div className="max-h-48 overflow-y-auto pr-1 space-y-1 custom-scrollbar">
              {filteredExpansions.length === 0 ? (
                <div className="py-3 text-center text-xs text-gray-500">
                  No coincide ninguna expansión
                </div>
              ) : (
                filteredExpansions.map((exp: any) => {
                  const expName = typeof exp === "string" ? exp : exp.name;
                  const isSelected = selectedExpansion === expName;
                  return (
                    <button
                      key={expName}
                      onClick={() => onSelectExpansion(isSelected ? null : expName)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                        isSelected
                          ? "bg-white/15 text-white font-bold border border-white/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span className="truncate">{expName}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red shrink-0"></span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* 3. Condición de la Carta (100% Dinámica desde Base de Datos) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Estado / Condición
            </h3>
            <span className="text-[10px] font-mono text-gray-500">
              {formattedConditions.length} disp.
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-56 overflow-y-auto pr-0.5 custom-scrollbar">
            {formattedConditions.map((cond) => {
              const isSelected = selectedCondition === cond.name || selectedCondition === cond.code;
              return (
                <button
                  key={cond.id || cond.name}
                  onClick={() => onSelectCondition(isSelected ? null : cond.name)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-between border ${
                    isSelected
                      ? "ring-2 ring-white/50 bg-white/20 text-white font-black shadow-sm"
                      : `${cond.badgeClass} hover:opacity-80`
                  }`}
                  title={cond.label}
                >
                  <span>{cond.code}</span>
                  <span className="text-[10px] font-normal opacity-75 truncate ml-1">{cond.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Acabado (Foil / Normal) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
            Acabado
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {FINISHES.map((f) => {
              const isSelected = selectedFinish === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => onSelectFinish(isSelected ? null : f.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? "bg-white/20 border-white/30 text-white shadow-sm"
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {f.id === "foil" && <IconSparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />}
                  <span>{f.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Idioma (100% Dinámico desde Base de Datos) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Idioma
            </h3>
            <span className="text-[10px] font-mono text-gray-500">
              {dbLanguages.length} disp.
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-0.5 custom-scrollbar">
            {dbLanguages.map((l: any) => {
              const code = (l.code || "").toUpperCase();
              const name = l.name || code;
              const isSelected = selectedLanguage === l.code || selectedLanguage === l.name || selectedLanguage === l.id;
              return (
                <button
                  key={l.id || l.code}
                  onClick={() => onSelectLanguage(isSelected ? null : (l.code || l.name))}
                  className={`px-2.5 py-1.5 rounded-xl text-xs transition-all border flex items-center justify-between gap-1.5 ${
                    isSelected
                      ? "bg-red/20 border-red text-white font-bold shadow-sm ring-1 ring-red/50"
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <IconLanguageFlag code={l.code} name={l.name} className="w-4 h-3 shrink-0" />
                    <span className="truncate text-[11px]">{name}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-gray-400 shrink-0">{code}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
