"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import type { WishlistProduct, WishlistFilterType } from "../types/wishlist.types";

/**
 * Custom hook that handles data fetching, state, and complex calculations
 * for the Wishlist page. It extracts business logic from the UI.
 */
export function useWishlist() {
  const { showToast } = useToast();
  
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<WishlistFilterType>('ALL');

  const fetchWishlistData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/wishlist/count`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        showToast("No se pudo cargar la lista de deseos", "error");
      }
    } catch (error) {
      console.error("Error fetching wishlist counts:", error);
      showToast("Error de conexión al cargar la lista", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]);

  // KPIs Calculations using useMemo so they don't recalculate on every render
  // unless the `products` array actually changes.
  const kpis = useMemo(() => {
    const totalSalesPotential = products.reduce(
      (acc, p) => acc + (p.inStock ? (p.storePrice || 0) : (p.marketPrice || 0)) * p.wishlistCount,
      0
    );

    const missedOpportunities = products
      .filter((p) => !p.inStock)
      .reduce((acc, p) => acc + (p.marketPrice || 0) * p.wishlistCount, 0);

    const trendingProduct = products.length > 0 ? products[0] : null;

    return { totalSalesPotential, missedOpportunities, trendingProduct };
  }, [products]);

  // Filtering
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filter === 'INSTOCK') return p.inStock;
      if (filter === 'OUTOFSTOCK') return !p.inStock;
      return true;
    });
  }, [products, filter]);

  return {
    loading,
    filter,
    setFilter,
    kpis,
    filteredProducts,
    refresh: fetchWishlistData,
  };
}
