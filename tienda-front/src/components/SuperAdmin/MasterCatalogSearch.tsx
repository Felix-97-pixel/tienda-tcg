import React, { useState, useEffect, useRef } from "react";
import { API_URL } from "@/utils/api";
import toast from "react-hot-toast";

interface MasterCatalogSearchProps {
  onProductAdded: () => void;
}

export default function MasterCatalogSearch({ onProductAdded }: MasterCatalogSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch categories to get the MTG Singles category ID
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/products/meta/categories`);
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchScryfall = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    try {
      // Scryfall API para buscar por nombre
      const res = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.data?.slice(0, 8) || []); // Limit to 8 results for the dropdown
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Error fetching from Scryfall", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchScryfall(query);
    }, 500); // Debounce de 500ms
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleAddCard = async (card: any) => {
    setIsAdding(true);
    setShowDropdown(false);
    setQuery("");

    try {
      // Encontrar la categoría de MTG
      const mtgCategory = categories.find(c => c.name.toLowerCase().includes("magic") && c.isTcg);
      
      if (!mtgCategory) {
        toast.error("No se encontró la categoría de Magic The Gathering.");
        setIsAdding(false);
        return;
      }

      const res = await fetch(`${API_URL}/products/global`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          scryfallCard: card,
          categoryId: mtgCategory.id
        }),
      });

      if (!res.ok) {
        throw new Error("No se pudo agregar la carta global.");
      }

      toast.success(`"${card.name}" añadida al Catálogo Global exitosamente.`);
      onProductAdded();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="relative max-w-2xl" ref={dropdownRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className={`w-5 h-5 transition-colors ${isSearching ? "text-purple-500 animate-pulse" : "text-gray-4 group-focus-within:text-purple-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowDropdown(true);
          }}
          placeholder="Busca el nombre de una carta oficial en Scryfall (Inglés)..."
          className="w-full bg-[#0f1115] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-5 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-lg"
          disabled={isAdding}
        />
        {isAdding && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <svg className="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>

      {showDropdown && (query.length >= 3) && (
        <div className="absolute z-50 w-full mt-2 bg-[#0f1115] border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {isSearching && results.length === 0 ? (
             <div className="p-4 text-sm text-gray-4 text-center flex items-center justify-center gap-2">
               <svg className="animate-spin h-4 w-4 text-gray-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               Buscando en la base de datos mundial...
             </div>
          ) : results.length > 0 ? (
            <ul className="max-h-96 overflow-y-auto divide-y divide-white/5 custom-scrollbar">
              {results.map((card) => (
                <li 
                  key={card.id} 
                  className="p-3 hover:bg-[#1a1d24]/5 transition-colors cursor-pointer flex items-center justify-between group"
                  onClick={() => handleAddCard(card)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-gray-800 rounded border border-white/10 overflow-hidden flex-shrink-0">
                      {card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small ? (
                        <img src={card.image_uris?.small || card.card_faces?.[0]?.image_uris?.small} alt={card.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-5">No Img</div>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-white group-hover:text-purple-400 transition-colors">{card.name}</div>
                      <div className="text-xs text-gray-4 mt-1 flex items-center gap-2">
                        <span className="bg-[#1a1d24]/10 px-2 py-0.5 rounded text-gray-3">{card.set_name}</span>
                        <span>{card.rarity}</span>
                      </div>
                    </div>
                  </div>
                  <button className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1 shadow-lg shadow-purple-600/20">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                    Añadir
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-sm text-gray-5 text-center">
              No se encontraron resultados para "{query}" en Scryfall.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
