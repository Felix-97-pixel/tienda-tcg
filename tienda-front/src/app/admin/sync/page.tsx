"use client";
import { API_URL } from "@/utils/api";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface MTGSet {
  code: string;
  name: string;
  releaseDate: string;
}

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
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
            <li className="px-5 py-3 text-sm text-gray-500">No hay resultados</li>
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

  const [setId, setSetId] = useState("");
  const [expansion, setExpansion] = useState("");
  const [expansionsList, setExpansionsList] = useState<{name: string, products: number}[]>([]);
  const [mtgJsonSets, setMtgJsonSets] = useState<MTGSet[]>([]);
  const [mtgJsonMessage, setMtgJsonMessage] = useState("");
  const [ckMessage, setCkMessage] = useState("");
  const [loadingMtg, setLoadingMtg] = useState(false);
  const [loadingCk, setLoadingCk] = useState(false);

  useEffect(() => {
    const category = encodeURIComponent("Singles Magic The Gathering");
    fetch(`${API_URL}/products/meta/expansions?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        setExpansionsList(data);
        if (data.length > 0) setExpansion(data[0].name);
      })
      .catch((err) => console.error("Error fetching expansions:", err));

    fetch("https://mtgjson.com/api/v5/SetList.json")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          const sortedSets = json.data.sort((a: MTGSet, b: MTGSet) =>
            new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
          );
          setMtgJsonSets(sortedSets);
          if (sortedSets.length > 0) setSetId(sortedSets[0].code.toLowerCase());
        }
      })
      .catch((err) => console.error("Error fetching MTGJSON sets:", err));
  }, []);

  const handleSyncMtgJson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setId) return;
    setLoadingMtg(true);
    setMtgJsonMessage("");
    try {
      const res = await fetch(`${API_URL}/sync/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: "Singles Magic The Gathering", setId: setId.toLowerCase() }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setMtgJsonMessage(`${t("mtgjson.successPrefix")} ${data.count ?? ""} ${t("mtgjson.successSuffix")}`);
        const category = encodeURIComponent("Singles Magic The Gathering");
        fetch(`${API_URL}/products/meta/expansions?category=${category}`)
          .then((r) => r.json())
          .then((d) => setExpansionsList(d));
      } else {
        setMtgJsonMessage(`Error: ${data.message || "Hubo un problema"}`);
      }
    } catch {
      setMtgJsonMessage("Error de red al intentar sincronizar.");
    } finally {
      setLoadingMtg(false);
    }
  };

  const handleSyncCardKingdom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expansion) return;
    setLoadingCk(true);
    setCkMessage("");
    try {
      const res = await fetch(`${API_URL}/price-updater/sync-set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expansion }),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setCkMessage(data.message || `${t("cardkingdom.successPrefix")} ${expansion}`);
      } else {
        setCkMessage(`Error: ${data.error || "Hubo un problema"}`);
      }
    } catch {
      setCkMessage("Error de red al intentar actualizar precios.");
    } finally {
      setLoadingCk(false);
    }
  };

  const mtgJsonOptions = mtgJsonSets.map(set => ({
    label: `${set.name} (${set.code}) - ${set.releaseDate}`,
    value: set.code.toLowerCase()
  }));

  const localExpansionOptions = expansionsList.map(exp => ({
    label: `${exp.name} (${exp.products} cartas)`,
    value: exp.name
  }));

  return (
    <div className="p-6 space-y-6">
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
              <label className="mb-2 block text-sm font-medium text-dark">{t("mtgjson.label")}</label>
              <SearchableSelect
                options={mtgJsonOptions}
                value={setId}
                onChange={setSetId}
                placeholder={mtgJsonSets.length === 0 ? t("mtgjson.placeholder") : t("mtgjson.placeholder")}
                disabled={mtgJsonSets.length === 0}
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
          {mtgJsonMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${mtgJsonMessage.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {mtgJsonMessage}
            </div>
          )}
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
                placeholder={expansionsList.length === 0 ? "No hay expansiones cargadas" : "Escribe para filtrar..."}
                disabled={expansionsList.length === 0}
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
          {ckMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${ckMessage.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {ckMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
