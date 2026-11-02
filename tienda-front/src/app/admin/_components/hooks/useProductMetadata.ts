"use client";
import { useState, useEffect } from "react";
import { adminFetch } from "@/utils/api";
import { Category } from "@/types/productCategory";
import { useActiveBranch } from "@/hooks/useActiveBranch";

export function useProductMetadata(isTcg: boolean, selectedCategory?: string) {
  const { activeBranchId } = useActiveBranch();
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalCategories, setModalCategories] = useState<Category[]>([]);
  const [expansions, setExpansions] = useState<{ name: string; products: number }[]>([]);

  // Fetch Categories
  useEffect(() => {
    adminFetch(`/products/meta/categories/admin?isTcg=${isTcg}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
          setModalCategories(data);
        }
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, [isTcg, activeBranchId]);

  // Fetch Expansions
  useEffect(() => {
    if (selectedCategory === undefined) return;
    
    if (!selectedCategory) {
      setExpansions([]);
      return;
    }
    const url = `/products/meta/expansions?category=${encodeURIComponent(selectedCategory)}`;
    adminFetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setExpansions(data);
        }
      })
      .catch((err) => console.error("Error fetching expansions:", err));
  }, [selectedCategory, activeBranchId]);

  return { categories, modalCategories, expansions };
}
