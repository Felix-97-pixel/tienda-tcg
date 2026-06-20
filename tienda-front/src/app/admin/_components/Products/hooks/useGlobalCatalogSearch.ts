"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { Product } from "@/types/product";

export function useGlobalCatalogSearch() {
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const searchGlobalCatalog = useCallback(async () => {
    if (!searchTerm || searchTerm.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = new URL(`${API_URL}/products`);
      url.searchParams.append("search", searchTerm);
      url.searchParams.append("limit", "10"); // We only need a few results for the dropdown/modal
      url.searchParams.append("adminCatalog", "true"); 

      const res = await fetch(url.toString(), { credentials: "include" });
      const data = await res.json();
      setResults(data.data || []);
    } catch (err) {
      console.error("Error searching global catalog:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(searchGlobalCatalog, 400); // 400ms debounce
    return () => clearTimeout(timeoutId);
  }, [searchGlobalCatalog]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading
  };
}
