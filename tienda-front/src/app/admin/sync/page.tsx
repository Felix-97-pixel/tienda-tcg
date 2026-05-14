"use client";
import { API_URL } from "@/utils/api";
import React, { useState, useEffect } from "react";
import { useTranslations, useMessages } from "next-intl";
import { useToast } from "@/hooks/useToast";
import PreLoader from "@/components/Common/PreLoader";

interface MTGSet {
  code: string;
  name: string;
  releaseDate: string;
}

interface PokemonSet {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
}

interface RiftboundSet {
  id: string;
  name: string;
  release_date: string;
}

function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  noResultsText = "No results"
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  noResultsText?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find((o) => o.value === value);
  const displayValue = isOpen ? search : selectedOption ? selectedOption.label : "";

  const filteredOptions = safeOptions.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()) || o.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full">
      <input
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onFocus={() => { setIsOpen(true); setSearch(""); }}
        onChange={(e) => setSearch(e.target.value)}
        onBlur={() => { setTimeout(() => setIsOpen(false), 200); }}
        className="w-full rounded border border-stroke bg-white py-3 px-5 font-medium text-black outline-none transition focus:border-primary active:border-primary disabled:bg-gray-2 text-sm"
      />
      {isOpen && !disabled && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded border border-stroke bg-white shadow-default">
          {filteredOptions.length === 0 ? (
            <li className="px-5 py-3 text-sm text-gray-500">{noResultsText}</li>
          ) : (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`cursor-pointer px-5 py-3 hover:bg-gray-2 text-sm text-black ${value === opt.value ? 'bg-gray-2 font-bold' : ''}`}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

export default function AdminSync() {
  const t = useTranslations("sync");
  const tCommon = useTranslations("common");
  const { showToast } = useToast();

  const [setId, setSetId] = useState("");
  const [pokemonSetId, setPokemonSetId] = useState("");
  const [riftSetId, setRiftSetId] = useState("");

  const [expansion, setExpansion] = useState("");
  const [pokemonExpansion, setPokemonExpansion] = useState("");
  const [riftExpansion, setRiftExpansion] = useState("");

  const [expansionsList, setExpansionsList] = useState<{ name: string, products: number }[]>([]);
  const [pokemonExpansionsList, setPokemonExpansionsList] = useState<{ name: string, products: number }[]>([]);
  const [riftExpansionsList, setRiftExpansionsList] = useState<{ name: string, products: number }[]>([]);

  const [mtgJsonSets, setMtgJsonSets] = useState<MTGSet[]>([]);
  const [pokemonSets, setPokemonSets] = useState<PokemonSet[]>([]);
  const [riftSets, setRiftSets] = useState<RiftboundSet[]>([]);

  const [loadingMtg, setLoadingMtg] = useState(false);
  const [loadingPokemon, setLoadingPokemon] = useState(false);
  const [loadingRift, setLoadingRift] = useState(false);
  const [loadingCk, setLoadingCk] = useState(false);
  const [loadingPkPrice, setLoadingPkPrice] = useState(false);
  const [loadingRiftPrice, setLoadingRiftPrice] = useState(false);
  
  const [magicProgress, setMagicProgress] = useState({ current: 0, total: 0, active: false });
  const [pokemonProgress, setPokemonProgress] = useState({ current: 0, total: 0, active: false });
  const [riftboundProgress, setRiftboundProgress] = useState({ current: 0, total: 0, active: false });

  const [mtgDefaultCategory, setMtgDefaultCategory] = useState("Singles Magic The Gathering");
  const [pokemonDefaultCategory, setPokemonDefaultCategory] = useState("Singles Pokemon");
  const [riftDefaultCategory, setRiftDefaultCategory] = useState("Singles Riftbound");

  useEffect(() => {
    fetch(`${API_URL}/settings`).then(res => res.json()).then(data => {
      if (data.mtg_sync_destination) setMtgDefaultCategory(data.mtg_sync_destination);
      if (data.pokemon_sync_destination) setPokemonDefaultCategory(data.pokemon_sync_destination);
      if (data.riftbound_sync_destination) setRiftDefaultCategory(data.riftbound_sync_destination);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    if (!mtgDefaultCategory) return;
    const cat = encodeURIComponent(mtgDefaultCategory);
    fetch(`${API_URL}/products/meta/expansions?category=${cat}`).then(r => r.json()).then(d => setExpansionsList(Array.isArray(d) ? d : []));
    fetch(`${API_URL}/sync/mtg-sets`, { credentials: "include" }).then(r => r.json()).then(data => {
      const sets = Array.isArray(data) ? data : [];
      setMtgJsonSets(sets);
      if (sets.length > 0) setSetId(sets[0].code.toLowerCase());
    });
  }, [mtgDefaultCategory]);

  useEffect(() => {
    if (!pokemonDefaultCategory) return;
    const cat = encodeURIComponent(pokemonDefaultCategory);
    fetch(`${API_URL}/products/meta/expansions?category=${cat}`).then(r => r.json()).then(d => setPokemonExpansionsList(Array.isArray(d) ? d : []));
    fetch(`${API_URL}/sync/pokemon-sets`, { credentials: "include" }).then(r => r.json()).then(data => {
      const sets = Array.isArray(data) ? data : [];
      setPokemonSets(sets);
      if (sets.length > 0) setPokemonSetId(sets[0].id);
    });
  }, [pokemonDefaultCategory]);

  useEffect(() => {
    if (!riftDefaultCategory) return;
    const cat = encodeURIComponent(riftDefaultCategory);
    fetch(`${API_URL}/products/meta/expansions?category=${cat}`).then(r => r.json()).then(d => setRiftExpansionsList(Array.isArray(d) ? d : []));
    fetch(`${API_URL}/sync/riftbound-sets`, { credentials: "include" }).then(r => r.json()).then(data => {
      const sets = Array.isArray(data) ? data : [];
      setRiftSets(sets);
      if (sets.length > 0) setRiftSetId(sets[0].id);
    });
  }, [riftDefaultCategory]);

  // Nuevo: Verificar si hay procesos activos al cargar la página
  useEffect(() => {
    const checkInitialStatus = async () => {
      const games = [
        { id: 'magic', setter: setMagicProgress },
        { id: 'pokemon', setter: setPokemonProgress },
        { id: 'riftbound', setter: setRiftboundProgress }
      ];

      for (const game of games) {
        try {
          const res = await fetch(`${API_URL}/price-updater/status/${game.id}`, { credentials: "include" });
          const data = await res.json();
          if (data.active) {
            game.setter(data);
            startPolling(game.id, game.setter);
          }
        } catch (e) {
          console.error(`Error checking status for ${game.id}`, e);
        }
      }
    };
    checkInitialStatus();
  }, []);

  const handleSyncSet = async (game: string, setId: string, setLoader: (l: boolean) => void, refresh: () => void) => {
    if (!setId) return;
    setLoader(true);
    try {
      const res = await fetch(`${API_URL}/sync/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game, setId }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${tCommon("success")}: ${data.count ?? ""} cartas`, "success");
        refresh();
      } else {
        showToast(data.message || tCommon("error"), "error");
      }
    } catch {
      showToast(tCommon("networkError"), "error");
    } finally {
      setLoader(false);
    }
  };

  const startPolling = (game: string, setProgress: any) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/price-updater/status/${game}`, { credentials: "include" });
        const data = await res.json();
        setProgress(data);
        if (!data.active) clearInterval(interval);
      } catch {
        clearInterval(interval);
      }
    }, 2000);
  };

  const handleSyncPrices = async (game: string, endpoint: string, expName: string, setLoader: (l: boolean) => void, setProgress: any) => {
    if (!expName) return;
    setLoader(true);
    try {
      const res = await fetch(`${API_URL}/price-updater/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expansion: expName }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || tCommon("success"), "success");
        startPolling(game, setProgress);
      } else {
        showToast(data.error || tCommon("error"), "error");
      }
    } catch {
      showToast(tCommon("networkError"), "error");
    } finally {
      setLoader(false);
    }
  };

  const isAnyActive = magicProgress.active || pokemonProgress.active || riftboundProgress.active;

  const ProgressDisplay = ({ p }: { p: { current: number, total: number, active: boolean } }) => {
    if (!p.active && p.current === 0) return null;
    const pct = p.total > 0 ? Math.round((p.current / p.total) * 100) : 0;
    return (
      <div className="mt-4 p-3 bg-blue/5 rounded-xl border border-blue/10">
        <div className="flex justify-between text-xs font-bold text-blue mb-1">
          <span>{p.active ? "Actualizando..." : "Completado"}</span>
          <span>{p.current} / {p.total} ({pct}%)</span>
        </div>
        <div className="w-full bg-gray-2 rounded-full h-2 overflow-hidden">
          <div className="bg-blue h-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
        </div>
      </div>
    );
  };

  // Botón estándar azul para todos
  const buttonClass = "w-full mt-4 bg-blue text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md transition-all active:scale-[0.98]";

  return (
    <div className="p-6 space-y-6 pb-24">
      {(loadingMtg || loadingPokemon || loadingRift || loadingCk || loadingPkPrice || loadingRiftPrice) && <PreLoader message={tCommon("loading")} />}

      <div>
        <h1 className="text-2xl font-bold text-dark">{t("title")}</h1>
        <p className="text-dark-4 text-sm mt-1">{t("subtitle")}</p>
      </div>

      {/* GUIA RAPIDA DINAMICA */}
      <div className="bg-white rounded-2xl shadow-1 p-6 border-l-4 border-blue">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-dark text-xl">{t("quickGuide.title")}</h2>
            <p className="text-dark-4 text-sm mt-0.5">{t("quickGuide.subtitle")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.keys((useMessages() as any).sync.quickGuide)
            .filter((key: string) => key.startsWith("step") && key.endsWith("Title"))
            .map((key: string, index: number) => {
              const stepId = key.replace("Title", "");
              return (
                <div key={stepId} className="p-4 rounded-xl bg-gray-1 border border-gray-3">
                  <h3 className="font-semibold text-blue mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue text-white text-xs flex items-center justify-center font-bold">
                      {index + 1}
                    </span>
                    {t(`quickGuide.${stepId}Title`)}
                  </h3>
                  <p className="text-xs text-dark-4 leading-relaxed">
                    {t(`quickGuide.${stepId}Desc`)}
                  </p>
                </div>
              );
            })}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-blue/5 border border-blue/20">
          <p className="text-xs text-blue font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {t("quickGuide.proTip")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* MAGIC */}
        <div className="bg-white rounded-2xl shadow-1 p-6 border-l-4 border-blue">
          <h2 className="font-bold text-dark mb-1">{t("mtgjson.title")}</h2>
          <p className="text-xs text-dark-4 mb-4">{t("mtgjson.subtitle")}</p>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-dark-4">{t("configuredDestination")}</label>
            <div className="text-sm font-bold text-blue bg-blue/5 p-2 rounded border border-blue/10">{mtgDefaultCategory}</div>
          </div>
          <SearchableSelect options={mtgJsonSets.map(s => ({ label: `${s.name} (${s.code})`, value: s.code.toLowerCase() }))} value={setId} onChange={setSetId} placeholder={t("mtgjson.placeholder")} />
          <button onClick={() => handleSyncSet(mtgDefaultCategory, setId, setLoadingMtg, () => {
            const cat = encodeURIComponent(mtgDefaultCategory);
            fetch(`${API_URL}/products/meta/expansions?category=${cat}`).then(r => r.json()).then(d => setExpansionsList(Array.isArray(d) ? d : []));
          })} className={buttonClass}>{t("mtgjson.button")}</button>
        </div>

        <div className="bg-white rounded-2xl shadow-1 p-6 border-l-4 border-blue">
          <h2 className="font-bold text-dark mb-1">{t("cardkingdom.title")}</h2>
          <p className="text-xs text-dark-4 mb-4">{t("cardkingdom.subtitle")}</p>
          <SearchableSelect options={expansionsList.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))} value={expansion} onChange={setExpansion} placeholder={t("mtgjson.placeholder")} />
          <button 
            disabled={isAnyActive}
            onClick={() => handleSyncPrices("magic", "sync-set", expansion, setLoadingCk, setMagicProgress)} 
            className={`${buttonClass} ${isAnyActive ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            {magicProgress.active ? "En progreso..." : t("cardkingdom.button")}
          </button>
          <ProgressDisplay p={magicProgress} />
        </div>

        {/* POKEMON */}
        <div className="bg-white rounded-2xl shadow-1 p-6 border-l-4 border-blue">
          <h2 className="font-bold text-dark mb-1">{t("pokemon.title")}</h2>
          <p className="text-xs text-dark-4 mb-4">{t("pokemon.subtitle")}</p>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-dark-4">{t("configuredDestination")}</label>
            <div className="text-sm font-bold text-red-500 bg-red-50 p-2 rounded border border-red-100">{pokemonDefaultCategory}</div>
          </div>
          <SearchableSelect options={pokemonSets.map(s => ({ label: s.name, value: s.id }))} value={pokemonSetId} onChange={setPokemonSetId} placeholder={t("pokemon.placeholder")} />
          <button onClick={() => handleSyncSet(pokemonDefaultCategory, pokemonSetId, setLoadingPokemon, () => {
            const cat = encodeURIComponent(pokemonDefaultCategory);
            fetch(`${API_URL}/products/meta/expansions?category=${cat}`).then(r => r.json()).then(d => setPokemonExpansionsList(Array.isArray(d) ? d : []));
          })} className={buttonClass}>{t("pokemon.button")}</button>
        </div>

        <div className="bg-white rounded-2xl shadow-1 p-6 border-l-4 border-blue">
          <h2 className="font-bold text-dark mb-1">{t("tcgplayer.title")}</h2>
          <p className="text-xs text-dark-4 mb-4">{t("tcgplayer.subtitle")}</p>
          <SearchableSelect options={pokemonExpansionsList.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))} value={pokemonExpansion} onChange={setPokemonExpansion} placeholder={t("tcgplayer.placeholder")} />
          <button 
            disabled={isAnyActive}
            onClick={() => handleSyncPrices("pokemon", "sync-pokemon", pokemonExpansion, setLoadingPkPrice, setPokemonProgress)} 
            className={`${buttonClass} ${isAnyActive ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            {pokemonProgress.active ? "En progreso..." : t("tcgplayer.button")}
          </button>

          <ProgressDisplay p={pokemonProgress} />
        </div>

        {/* RIFTBOUND */}
        <div className="bg-white rounded-2xl shadow-1 p-6 border-l-4 border-blue">
          <h2 className="font-bold text-dark mb-1">{t("riftbound.title")}</h2>
          <p className="text-xs text-dark-4 mb-4">{t("riftbound.subtitle")}</p>
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-dark-4">{t("configuredDestination")}</label>
            <div className="text-sm font-bold text-purple-500 bg-purple-50 p-2 rounded border border-purple-100">{riftDefaultCategory}</div>
          </div>
          <SearchableSelect options={riftSets.map(s => ({ label: s.name, value: s.id }))} value={riftSetId} onChange={setRiftSetId} placeholder={t("riftbound.placeholder")} />
          <button onClick={() => handleSyncSet(riftDefaultCategory, riftSetId, setLoadingRift, () => {
            const cat = encodeURIComponent(riftDefaultCategory);
            fetch(`${API_URL}/products/meta/expansions?category=${cat}`).then(r => r.json()).then(d => setRiftExpansionsList(Array.isArray(d) ? d : []));
          })} className={buttonClass}>{t("riftbound.button")}</button>
        </div>

        <div className="bg-white rounded-2xl shadow-1 p-6 border-l-4 border-blue">
          <h2 className="font-bold text-dark mb-1">{t("riftboundPrice.title")}</h2>
          <p className="text-xs text-dark-4 mb-4">{t("riftboundPrice.subtitle")}</p>
          <SearchableSelect options={riftExpansionsList.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))} value={riftExpansion} onChange={setRiftExpansion} placeholder={t("riftboundPrice.placeholder")} />
          <button 
            disabled={isAnyActive}
            onClick={() => handleSyncPrices("riftbound", "sync-riftbound", riftExpansion, setLoadingRiftPrice, setRiftboundProgress)} 
            className={`${buttonClass} ${isAnyActive ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            {riftboundProgress.active ? "En progreso..." : t("riftboundPrice.button")}
          </button>
 blackout_line
          <ProgressDisplay p={riftboundProgress} />
        </div>
      </div>
    </div>
  );
}
