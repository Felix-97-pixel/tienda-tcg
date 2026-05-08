"use client";
import { API_URL } from "@/utils/api";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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

  const handleSyncPrices = async (endpoint: string, expName: string, setLoader: (l: boolean) => void) => {
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
      if (res.ok) showToast(data.message || tCommon("success"), "success");
      else showToast(data.error || tCommon("error"), "error");
    } catch {
      showToast(tCommon("networkError"), "error");
    } finally {
      setLoader(false);
    }
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* MAGIC */}
        <div className="bg-white rounded-2xl shadow-1 p-6">
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

        <div className="bg-white rounded-2xl shadow-1 p-6">
          <h2 className="font-bold text-dark mb-1">{t("cardkingdom.title")}</h2>
          <p className="text-xs text-dark-4 mb-4">{t("cardkingdom.subtitle")}</p>
          <SearchableSelect options={expansionsList.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))} value={expansion} onChange={setExpansion} placeholder={t("mtgjson.placeholder")} />
          <button onClick={() => handleSyncPrices("sync-set", expansion, setLoadingCk)} className={buttonClass}>{t("cardkingdom.button")}</button>
        </div>

        {/* POKEMON */}
        <div className="bg-white rounded-2xl shadow-1 p-6">
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

        <div className="bg-white rounded-2xl shadow-1 p-6">
          <h2 className="font-bold text-dark mb-1">{t("tcgplayer.title")}</h2>
          <p className="text-xs text-dark-4 mb-4">{t("tcgplayer.subtitle")}</p>
          <SearchableSelect options={pokemonExpansionsList.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))} value={pokemonExpansion} onChange={setPokemonExpansion} placeholder={t("tcgplayer.placeholder")} />
          <button onClick={() => handleSyncPrices("sync-pokemon", pokemonExpansion, setLoadingPkPrice)} className={buttonClass}>{t("tcgplayer.button")}</button>
        </div>

        {/* RIFTBOUND */}
        <div className="bg-white rounded-2xl shadow-1 p-6">
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

        <div className="bg-white rounded-2xl shadow-1 p-6">
          <h2 className="font-bold text-dark mb-1">{t("riftboundPrice.title")}</h2>
          <p className="text-xs text-dark-4 mb-4">{t("riftboundPrice.subtitle")}</p>
          <SearchableSelect options={riftExpansionsList.map(e => ({ label: `${e.name} (${e.products})`, value: e.name }))} value={riftExpansion} onChange={setRiftExpansion} placeholder={t("riftboundPrice.placeholder")} />
          <button onClick={() => handleSyncPrices("sync-riftbound", riftExpansion, setLoadingRiftPrice)} className={buttonClass}>{t("riftboundPrice.button")}</button>
        </div>
      </div>
    </div>
  );
}
