"use client";
import React, { useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface MTGSet {
  code: string;
  name: string;
  releaseDate: string;
}

// Custom Searchable Dropdown Component
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
        onFocus={() => {
          setIsOpen(true);
          setSearch("");
        }}
        onChange={(e) => setSearch(e.target.value)}
        onBlur={() => {
          // Delay closing to allow click event to register
          setTimeout(() => setIsOpen(false), 200);
        }}
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
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
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
  const [setId, setSetId] = useState("");
  const [expansion, setExpansion] = useState("");
  const [expansionsList, setExpansionsList] = useState<{name: string, products: number}[]>([]);
  const [mtgJsonSets, setMtgJsonSets] = useState<MTGSet[]>([]);
  
  const [mtgJsonMessage, setMtgJsonMessage] = useState("");
  const [ckMessage, setCkMessage] = useState("");
  const [loadingMtg, setLoadingMtg] = useState(false);
  const [loadingCk, setLoadingCk] = useState(false);

  useEffect(() => {
    // Fetch available expansions ONLY for Magic The Gathering
    const category = encodeURIComponent("Singles Magic The Gathering");
    fetch(`${API_URL}/products/meta/expansions?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        setExpansionsList(data);
        if (data.length > 0) {
          setExpansion(data[0].name);
        }
      })
      .catch((err) => console.error("Error fetching expansions:", err));

    // Fetch MTGJSON SetList to help admin pick the Set ID
    fetch("https://mtgjson.com/api/v5/SetList.json")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          const sortedSets = json.data.sort((a: MTGSet, b: MTGSet) => {
            return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
          });
          setMtgJsonSets(sortedSets);
          if (sortedSets.length > 0) {
            setSetId(sortedSets[0].code.toLowerCase());
          }
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
        setMtgJsonMessage(`¡Éxito! Set importado.`);
        const category = encodeURIComponent("Singles Magic The Gathering");
        fetch(`${API_URL}/products/meta/expansions?category=${category}`)
          .then((r) => r.json())
          .then((d) => setExpansionsList(d));
      } else {
        setMtgJsonMessage(`Error: ${data.message || "Hubo un problema"}`);
      }
    } catch (error) {
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
        setCkMessage(data.message || `Precios actualizados para ${expansion}`);
      } else {
        setCkMessage(`Error: ${data.error || "Hubo un problema"}`);
      }
    } catch (error) {
      setCkMessage("Error de red al intentar actualizar precios.");
    } finally {
      setLoadingCk(false);
    }
  };

  // Convert states to options format
  const mtgJsonOptions = mtgJsonSets.map(set => ({
    label: `${set.name} (${set.code}) - ${set.releaseDate}`,
    value: set.code.toLowerCase()
  }));

  const localExpansionOptions = expansionsList.map(exp => ({
    label: `${exp.name} (${exp.products} cartas)`,
    value: exp.name
  }));

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black">
          Panel de Sincronización
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* MTGJSON Sync */}
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-6 shadow-default sm:px-7.5">
          <h4 className="mb-4 text-xl font-bold text-black">
            1. Importar Cartas (MTGJSON)
          </h4>
          <p className="mb-4 text-sm text-gray-500">
            Descarga y guarda todas las cartas de una expansión específica.
          </p>
          <form onSubmit={handleSyncMtgJson}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-black">
                Selecciona la Expansión a Descargar
              </label>
              <SearchableSelect 
                options={mtgJsonOptions}
                value={setId}
                onChange={setSetId}
                placeholder={mtgJsonSets.length === 0 ? "Cargando expansiones..." : "Busca por nombre o código (Ej. Duskmourn)"}
                disabled={mtgJsonSets.length === 0}
              />
            </div>
            <button
              type="submit"
              disabled={loadingMtg || mtgJsonSets.length === 0}
              className="flex w-full justify-center rounded bg-blue py-3 px-4 font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {loadingMtg ? "Sincronizando..." : "Descargar Cartas"}
            </button>
          </form>
          {mtgJsonMessage && (
            <div className="mt-4 p-3 rounded bg-gray-2 text-black text-sm">
              {mtgJsonMessage}
            </div>
          )}
        </div>

        {/* Card Kingdom Sync */}
        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-6 shadow-default sm:px-7.5">
          <h4 className="mb-4 text-xl font-bold text-black">
            2. Actualizar Precios (Card Kingdom)
          </h4>
          <p className="mb-4 text-sm text-gray-500">
            Actualiza los precios de todas las cartas de una expansión ya existente en tu inventario.
          </p>
          <form onSubmit={handleSyncCardKingdom}>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-black">
                Selecciona la Expansión
              </label>
              <SearchableSelect 
                options={localExpansionOptions}
                value={expansion}
                onChange={setExpansion}
                placeholder={expansionsList.length === 0 ? "No hay expansiones cargadas" : "Escribe para filtrar expansiones..."}
                disabled={expansionsList.length === 0}
              />
            </div>
            <button
              type="submit"
              disabled={loadingCk || expansionsList.length === 0}
              className="flex w-full justify-center rounded bg-green-600 py-3 px-4 font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {loadingCk ? "Actualizando precios..." : "Sincronizar Precios CK"}
            </button>
          </form>
          {ckMessage && (
            <div className="mt-4 p-3 rounded bg-gray-2 text-black text-sm">
              {ckMessage}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
