"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL, adminFetch } from "@/utils/api";
import { Product } from "@/types/product";

export function useGlobalCatalogSearch() {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGame, setSelectedGame] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isTcgFilter, setIsTcgFilter] = useState<boolean | undefined>(undefined);

  const searchGlobalCatalog = useCallback(async () => {
    // Si no hay término de búsqueda (mínimo 2 letras) y tampoco hay categoría ni juego seleccionado, limpiar
    const hasSearchTerm = searchTerm && searchTerm.trim().length >= 2;
    const hasCategory = Boolean(selectedCategory);
    const hasGame = Boolean(selectedGame);

    if (!hasSearchTerm && !hasCategory && !hasGame) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = new URL(`${API_URL}/products`);
      if (hasSearchTerm) {
        url.searchParams.append("search", searchTerm.trim());
      }
      url.searchParams.append("limit", "20");
      url.searchParams.append("adminCatalog", "true");

      if (selectedGame) {
        url.searchParams.append("game", selectedGame);
      }
      if (selectedCategory) {
        url.searchParams.append("category", selectedCategory);
      }
      if (isTcgFilter !== undefined) {
        url.searchParams.append("isTcg", isTcgFilter.toString());
      }

      const res = await adminFetch(url.toString());
      const data = await res.json();
      setResults(data.data || []);
    } catch (err) {
      console.error("Error searching global catalog:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedGame, selectedCategory, isTcgFilter]);

  useEffect(() => {
    const timeoutId = setTimeout(searchGlobalCatalog, 350); // 350ms debounce
    return () => clearTimeout(timeoutId);
  }, [searchGlobalCatalog]);

  return {
    searchTerm,
    setSearchTerm,
    selectedGame,
    setSelectedGame,
    selectedCategory,
    setSelectedCategory,
    isTcgFilter,
    setIsTcgFilter,
    results,
    loading
  };
}
