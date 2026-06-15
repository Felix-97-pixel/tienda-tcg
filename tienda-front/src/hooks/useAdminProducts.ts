"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { Product } from "@/types/product";

export function useAdminProducts(initialInventoryOnly: boolean = false) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExpansion, setSelectedExpansion] = useState("");
  const [isInventoryOnly, setIsInventoryOnly] = useState(initialInventoryOnly);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    // No cargar nada si no hay filtros aplicados (mejora de rendimiento)
    if (!searchTerm && !selectedCategory && !selectedExpansion) {
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
      if (isInventoryOnly) url.searchParams.append("inventoryOnly", "true");

      const res = await fetch(url.toString(), { credentials: "include" });
      const data = await res.json();
      setProducts(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, selectedCategory, selectedExpansion, isInventoryOnly]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchProducts, 400);
    return () => clearTimeout(timeoutId);
  }, [fetchProducts]);

  // Reset to page 1 when filters change to avoid "stuck on empty page" bug
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedCategory, selectedExpansion, isInventoryOnly]);

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
    isInventoryOnly,
    setIsInventoryOnly,
    page,
    setPage,
    totalPages,
    refresh: fetchProducts
  };
}
