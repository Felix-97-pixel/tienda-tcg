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

function SearchableSelect({
  options,
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

  const selectedOption = options.find((o) => o.value === value);
  const displayValue = isOpen ? search : selectedOption ? selectedOption.label : "";

  const filteredOptions = options.filter((o) =>
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
        className="w-full rounded border border-stroke bg-white py-3 px-5 font-medium text-black outline-none transition focus:border-primary active:border-primary disabled:bg-gray-2"
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
  const [expansion, setExpansion] = useState("");
  const [pokemonExpansion, setPokemonExpansion] = useState("");
  const [expansionsList, setExpansionsList] = useState<{name: string, products: number}[]>([]);
  const [pokemonExpansionsList, setPokemonExpansionsList] = useState<{name: string, products: number}[]>([]);
  const [mtgJsonSets, setMtgJsonSets] = useState<MTGSet[]>([]);
  const [pokemonSets, setPokemonSets] = useState<PokemonSet[]>([]);
  const [loadingMtg, setLoadingMtg] = useState(false);
  const [loadingPokemon, setLoadingPokemon] = useState(false);
  const [loadingCk, setLoadingCk] = useState(false);
  const [loadingPkPrice, setLoadingPkPrice] = useState(false);
  
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [mtgDefaultCategory, setMtgDefaultCategory] = useState("Singles Magic The Gathering");
  const [pokemonDefaultCategory, setPokemonDefaultCategory] = useState("Singles Pokemon");

  useEffect(() => {
    // Fetch categories and settings in parallel
    Promise.all([
      fetch(`${API_URL}/products/meta/categories`).then(res => res.json()),
      fetch(`${API_URL}/settings`).then(res => res.json())
    ])
      .then(([categoriesData, settingsData]) => {
        setCategories(categoriesData);
        
        // MTG Category
        if (settingsData.mtg_sync_destination) {
          setMtgDefaultCategory(settingsData.mtg_sync_destination);
        } else if (categoriesData.length > 0) {
          const mtgCat = categoriesData.find((c: any) => c.name.toLowerCase().includes("magic"));
          if (mtgCat) setMtgDefaultCategory(mtgCat.name);
          else setMtgDefaultCategory(categoriesData[0].name);
        }

        // Pokemon Category
        if (settingsData.pokemon_sync_destination) {
          setPokemonDefaultCategory(settingsData.pokemon_sync_destination);
        } else if (categoriesData.length > 0) {
          const pkmnCat = categoriesData.find((c: any) => c.name.toLowerCase().includes("pokemon"));
          if (pkmnCat) setPokemonDefaultCategory(pkmnCat.name);
          else setPokemonDefaultCategory(categoriesData[0].name);
        }
      })
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  useEffect(() => {
    if (!mtgDefaultCategory) return;

    const category = encodeURIComponent(mtgDefaultCategory);
    fetch(`${API_URL}/products/meta/expansions?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        setExpansionsList(data);
        if (data.length > 0) setExpansion(data[0].name);
      })
      .catch((err) => console.error("Error fetching expansions:", err));

    // Fetch MTG sets from BACKEND
    fetch(`${API_URL}/sync/mtg-sets`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setMtgJsonSets(data);
        if (data.length > 0) setSetId(data[0].code.toLowerCase());
      })
      .catch((err) => console.error("Error fetching MTG sets:", err));
  }, [mtgDefaultCategory]);

  useEffect(() => {
    if (!pokemonDefaultCategory) return;

    const category = encodeURIComponent(pokemonDefaultCategory);
    fetch(`${API_URL}/products/meta/expansions?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        setPokemonExpansionsList(data);
        if (data.length > 0) setPokemonExpansion(data[0].name);
      })
      .catch((err) => console.error("Error fetching Pokemon expansions:", err));

    // Fetch Pokemon sets from BACKEND
    fetch(`${API_URL}/sync/pokemon-sets`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setPokemonSets(data);
        if (data.length > 0) setPokemonSetId(data[0].id);
      })
      .catch((err) => console.error("Error fetching Pokemon sets:", err));
  }, [pokemonDefaultCategory]);

  const handleSyncMtgJson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setId) return;
    setLoadingMtg(true);
    try {
      const res = await fetch(`${API_URL}/sync/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: mtgDefaultCategory, setId: setId.toLowerCase() }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${t("mtgjson.successPrefix")} ${data.count ?? ""} ${t("mtgjson.successSuffix")}`, "success");
        const category = encodeURIComponent(mtgDefaultCategory);
        fetch(`${API_URL}/products/meta/expansions?category=${category}`)
          .then((r) => r.json())
          .then((d) => setExpansionsList(d));
      } else {
        showToast(t("mtgjson.errorApi", { message: data.message || "" }), "error");
      }
    } catch {
      showToast(t("mtgjson.errorNetwork"), "error");
    } finally {
      setLoadingMtg(false);
    }
  };

  const handleSyncPokemon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pokemonSetId) return;
    setLoadingPokemon(true);
    try {
      const res = await fetch(`${API_URL}/sync/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: pokemonDefaultCategory, setId: pokemonSetId }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${t("pokemon.successPrefix")} ${data.count ?? ""} ${t("pokemon.successSuffix")}`, "success");
        const category = encodeURIComponent(pokemonDefaultCategory);
        fetch(`${API_URL}/products/meta/expansions?category=${category}`)
          .then((r) => r.json())
          .then((d) => setPokemonExpansionsList(d));
      } else {
        showToast(t("mtgjson.errorApi", { message: data.message || "" }), "error");
      }
    } catch {
      showToast(t("mtgjson.errorNetwork"), "error");
    } finally {
      setLoadingPokemon(false);
    }
  };

  const handleSyncCardKingdom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expansion) return;
    setLoadingCk(true);
    try {
      const res = await fetch(`${API_URL}/price-updater/sync-set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expansion }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `${t("cardkingdom.successPrefix")} ${expansion}`, "success");
      } else {
        showToast(t("cardkingdom.errorApi", { message: data.error || "" }), "error");
      }
    } catch {
      showToast(t("cardkingdom.errorNetwork"), "error");
    } finally {
      setLoadingCk(false);
    }
  };

  const handleSyncPokemonPrices = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pokemonExpansion) return;
    setLoadingPkPrice(true);
    try {
      const res = await fetch(`${API_URL}/price-updater/sync-pokemon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expansion: pokemonExpansion }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || t("tcgplayer.success"), "success");
      } else {
        showToast(data.error || tCommon("error"), "error");
      }
    } catch {
      showToast(t("mtgjson.errorNetwork"), "error");
    } finally {
      setLoadingPkPrice(false);
    }
  };

  const mtgJsonOptions = mtgJsonSets.map(set => ({
    label: `${set.name} (${set.code}) - ${set.releaseDate}`,
    value: set.code.toLowerCase()
  }));

  const pokemonOptions = pokemonSets.map(set => ({
    label: `${set.name} (${set.id}) - ${set.releaseDate}`,
    value: set.id
  }));

  const localExpansionOptions = expansionsList.map(exp => ({
    label: `${exp.name} (${exp.products} cartas)`,
    value: exp.name
  }));

  const localPokemonExpansionOptions = pokemonExpansionsList.map(exp => ({
    label: `${exp.name} (${exp.products} cartas)`,
    value: exp.name
  }));

  return (
    <div className="p-6 space-y-6">
      {loadingMtg && <PreLoader message={t("mtgjson.importing")} />}
      {loadingPokemon && <PreLoader message={t("pokemon.importing")} />}
      {loadingCk && <PreLoader message={t("cardkingdom.updating")} />}
      {loadingPkPrice && <PreLoader message={t("tcgplayer.updating")} />}
      <div>
        <h1 className="text-2xl font-bold text-dark">{t("title")}</h1>
        <p className="text-dark-4 text-sm mt-1">{t("subtitle")}</p>
      </div>



      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* MTGJSON Sync */}
        <div className="bg-white rounded-2xl shadow-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-dark">{t("mtgjson.title")}</h2>
              <p className="text-dark-4 text-xs mt-0.5">{t("mtgjson.subtitle")}</p>
            </div>
          </div>
          <form onSubmit={handleSyncMtgJson}>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-dark-4">{t("configuredDestination")}</label>
              <div className="flex items-center gap-2 text-sm font-bold text-blue bg-blue/5 p-2 rounded-lg border border-blue/10">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {mtgDefaultCategory}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-dark">{t("mtgjson.label")}</label>
              <SearchableSelect
                options={mtgJsonOptions}
                value={setId}
                onChange={setSetId}
                placeholder={mtgJsonSets.length === 0 ? tCommon("loading") : t("mtgjson.placeholder")}
                disabled={mtgJsonSets.length === 0}
                noResultsText={tCommon("noResults")}
              />
            </div>
            <button
              type="submit"
              disabled={loadingMtg || mtgJsonSets.length === 0}
              className="flex w-full justify-center rounded-lg bg-blue py-2.5 px-4 font-medium text-white hover:bg-blue-dark transition disabled:opacity-50"
            >
              {loadingMtg ? t("mtgjson.importing") : t("mtgjson.button")}
            </button>
          </form>
        </div>

        {/* Card Kingdom Sync */}
        <div className="bg-white rounded-2xl shadow-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-dark">{t("cardkingdom.title")}</h2>
              <p className="text-dark-4 text-xs mt-0.5">{t("cardkingdom.subtitle")}</p>
            </div>
          </div>
          <form onSubmit={handleSyncCardKingdom}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-dark">{t("cardkingdom.title")}</label>
              <SearchableSelect
                options={localExpansionOptions}
                value={expansion}
                onChange={setExpansion}
                placeholder={expansionsList.length === 0 ? t("noExpansions") : t("tcgplayer.placeholder")}
                disabled={expansionsList.length === 0}
                noResultsText={tCommon("noResults")}
              />
            </div>
            <button
              type="submit"
              disabled={loadingCk || expansionsList.length === 0}
              className="flex w-full justify-center rounded-lg bg-blue py-2.5 px-4 font-medium text-white hover:bg-blue-dark transition disabled:opacity-50"
            >
              {loadingCk ? t("cardkingdom.updating") : t("cardkingdom.button")}
            </button>
          </form>
        </div>

        {/* Pokemon TCG API Sync */}
        <div className="bg-white rounded-2xl shadow-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-dark">{t("pokemon.title")}</h2>
              <p className="text-dark-4 text-xs mt-0.5">{t("pokemon.subtitle")}</p>
            </div>
          </div>
          <form onSubmit={handleSyncPokemon}>
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-dark-4">{t("configuredDestination")}</label>
              <div className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                {pokemonDefaultCategory}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-dark">{t("pokemon.label")}</label>
              <SearchableSelect
                options={pokemonOptions}
                value={pokemonSetId}
                onChange={setPokemonSetId}
                placeholder={pokemonSets.length === 0 ? tCommon("loading") : t("pokemon.placeholder")}
                disabled={pokemonSets.length === 0}
                noResultsText={tCommon("noResults")}
              />
            </div>
            <button
              type="submit"
              disabled={loadingPokemon || pokemonSets.length === 0}
              className="flex w-full justify-center rounded-lg bg-blue py-2.5 px-4 font-medium text-white hover:bg-blue-dark transition disabled:opacity-50"
            >
              {loadingPokemon ? t("pokemon.importing") : t("pokemon.button")}
            </button>
          </form>
        </div>

        {/* Pokemon Price Sync */}
        <div className="bg-white rounded-2xl shadow-1 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h2 className="font-semibold text-dark">{t("tcgplayer.title")}</h2>
              <p className="text-dark-4 text-xs mt-0.5">{t("tcgplayer.subtitle")}</p>
            </div>
          </div>
          <form onSubmit={handleSyncPokemonPrices}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-dark">{t("tcgplayer.label")}</label>
              <SearchableSelect
                options={localPokemonExpansionOptions}
                value={pokemonExpansion}
                onChange={setPokemonExpansion}
                placeholder={pokemonExpansionsList.length === 0 ? t("noExpansions") : t("tcgplayer.placeholder")}
                disabled={pokemonExpansionsList.length === 0}
                noResultsText={tCommon("noResults")}
              />
            </div>
            <button
              type="submit"
              disabled={loadingPkPrice || pokemonExpansionsList.length === 0}
              className="flex w-full justify-center rounded-lg bg-blue py-2.5 px-4 font-medium text-white hover:bg-blue-dark transition disabled:opacity-50"
            >
              {loadingPkPrice ? t("tcgplayer.updating") : t("tcgplayer.button")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
