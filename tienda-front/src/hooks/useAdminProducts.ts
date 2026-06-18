"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { Product } from "@/types/product";

export function useAdminProducts(initialInventoryOnly: boolean = false, isTcg?: boolean, initialBuylistOnly: boolean = false) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpansion, setSelectedExpansion] = useState("");
  const [publishState, setPublishState] = useState("all");
  const [buylistState, setBuylistState] = useState("all");
  const [isInventoryOnly, setIsInventoryOnly] = useState(initialInventoryOnly);
  const [isBuylistOnly, setIsBuylistOnly] = useState(initialBuylistOnly);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    // No cargar nada si no hay filtros aplicados, excepto si queremos ver el inventario o buylist
    if (!searchTerm && !selectedCategory && !selectedExpansion && !isInventoryOnly && !isBuylistOnly) {
      setProducts([]);
      setTotalPages(1);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const url = new URL(`${API_URL}/products`);
      url.searchParams.append("page", page.toString());
      url.searchParams.append("limit", "20");
      if (searchTerm) url.searchParams.append("search", searchTerm);
      if (selectedCategory) url.searchParams.append("category", selectedCategory);
      if (selectedExpansion) url.searchParams.append("expansion", selectedExpansion);
      if (publishState !== "all" && !isBuylistOnly) url.searchParams.append("publishState", publishState);
      if (isInventoryOnly) url.searchParams.append("inventoryOnly", "true");
      if (isBuylistOnly) url.searchParams.append("buylistOnly", "true");
      if (!isInventoryOnly && !isBuylistOnly) url.searchParams.append("adminCatalog", "true");
      if (buylistState !== "all" && isBuylistOnly) url.searchParams.append("buylistState", buylistState);
      if (isTcg !== undefined) url.searchParams.append("isTcg", isTcg.toString());

      const res = await fetch(url.toString(), { credentials: "include" });
      const data = await res.json();
      setProducts(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedCategory, selectedExpansion, publishState, isInventoryOnly, isBuylistOnly, buylistState, isTcg]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  // Reset to page 1 when filters change to avoid "stuck on empty page" bug
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, selectedExpansion, publishState, buylistState, isInventoryOnly, isBuylistOnly]);

  return {
    products,
    setProducts,
    loading,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedExpansion,
    setSelectedExpansion,
    publishState,
    setPublishState,
    buylistState,
    setBuylistState,
    isInventoryOnly,
    setIsInventoryOnly,
    isBuylistOnly,
    setIsBuylistOnly,
    page,
    setPage,
    totalPages,
    refresh: fetchProducts
  };
}
