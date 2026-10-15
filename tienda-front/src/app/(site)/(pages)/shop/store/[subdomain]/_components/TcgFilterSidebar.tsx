"use client";
import React from "react";

interface TcgFilterSidebarProps {
  categories: any[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;

  expansions: any[];
  selectedExpansion: string | null;
  onSelectExpansion: (exp: string | null) => void;

  selectedCondition: string | null;
  onSelectCondition: (cond: string | null) => void;

  selectedFinish: string | null;
  onSelectFinish: (finish: string | null) => void;

  selectedLanguage: string | null;
  onSelectLanguage: (lang: string | null) => void;

  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;

  onClearAll: () => void;
  activeFiltersCount: number;
  totalProductsCount: number;
}

const CONDITIONS = [
  { code: "NM", label: "Near Mint", badgeClass: "badge-condition-nm" },
  { code: "LP", label: "Lightly Played", badgeClass: "badge-condition-lp" },
  { code: "MP", label: "Moderately Played", badgeClass: "badge-condition-mp" },
  { code: "HP", label: "Heavily Played", badgeClass: "badge-condition-hp" },
];

const FINISHES = [
  { id: "normal", label: "Normal" },
  { id: "foil", label: "Foil / Holo" },
];

const LANGUAGES = [
  { id: "ES", label: "Español", flag: "🇪🇸" },
  { id: "EN", label: "Inglés", flag: "🇺🇸" },
  { id: "JP", label: "Japonés", flag: "🇯🇵" },
];

export default function TcgFilterSidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  expansions,
  selectedExpansion,
  onSelectExpansion,
  selectedCondition,
  onSelectCondition,
  selectedFinish,
  onSelectFinish,
  selectedLanguage,
  onSelectLanguage,
  onClearAll,
  activeFiltersCount,
  totalProductsCount,
}: TcgFilterSidebarProps) {
  const [categorySearch, setCategorySearch] = React.useState("");
  const [categoryTab, setCategoryTab] = React.useState<"all" | "games" | "accessories">("all");
  const [expansionSearch, setExpansionSearch] = React.useState("");

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
                  className="w-full h-8 pl-7 pr-7 rounded-lg bg-[#0A0D14] border border-white/10 text-white placeholder-gray-500 text-[11px] focus:outline-none focus:border-red-500/60 transition-colors"
                />
                <span className="absolute left-2 top-2 text-gray-500 text-[11px]">🔍</span>
                {categorySearch && (
                  <button
                    type="button"
                    onClick={() => setCategorySearch("")}
                    className="absolute right-2 top-2 text-gray-400 hover:text-white text-[11px]"
                  >
                    ✕
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
                className="w-full h-8 pl-7 pr-7 rounded-lg bg-[#0A0D14] border border-white/10 text-white placeholder-gray-500 text-[11px] focus:outline-none focus:border-red-500/60 transition-colors"
              />
              <span className="absolute left-2 top-2 text-gray-500 text-[11px]">🔍</span>
              {expansionSearch && (
                <button
                  type="button"
                  onClick={() => setExpansionSearch("")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-white text-[11px]"
                >
                  ✕
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

        {/* 3. Condición de la Carta */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
            Estado / Condición
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {CONDITIONS.map((cond) => {
              const isSelected = selectedCondition === cond.code;
              return (
                <button
                  key={cond.code}
                  onClick={() => onSelectCondition(isSelected ? null : cond.code)}
                  className={`px-2.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-between border ${
                    isSelected
                      ? "ring-2 ring-white/50 bg-white/20 text-white"
                      : `${cond.badgeClass} hover:opacity-80`
                  }`}
                >
                  <span>{cond.code}</span>
                  <span className="text-[10px] font-normal opacity-75">{cond.label.split(" ")[0]}</span>
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
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? "bg-white/20 border-white/30 text-white shadow-sm"
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {f.id === "foil" ? "✨ " : ""}{f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Idioma */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
            Idioma
          </h3>
          <div className="flex gap-2">
            {LANGUAGES.map((l) => {
              const isSelected = selectedLanguage === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => onSelectLanguage(isSelected ? null : l.id)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center justify-center gap-1.5 ${
                    isSelected
                      ? "bg-red/20 border-red text-white font-bold"
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.id}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
