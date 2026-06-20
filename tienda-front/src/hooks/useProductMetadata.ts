"use client";
import { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { Category } from "@/types/productCategory";

export function useProductMetadata(isTcg: boolean, selectedCategory?: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalCategories, setModalCategories] = useState<Category[]>([]);
  const [expansions, setExpansions] = useState<{ name: string; products: number }[]>([]);

  // Fetch Categories
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin?isTcg=${isTcg}`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        setModalCategories(data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, [isTcg]);

  // Fetch Expansions
  useEffect(() => {
    if (selectedCategory === undefined) return; // Si no lo pasamos (ej: sellado), no hacemos fetch
    
    if (!selectedCategory) {
      setExpansions([]);
      return;
    }
    const url = `${API_URL}/products/meta/expansions?category=${encodeURIComponent(selectedCategory)}`;
    fetch(url)
      .then((r) => r.json())
      .then(setExpansions)
      .catch((err) => console.error("Error fetching expansions:", err));
  }, [selectedCategory]);

  return { categories, modalCategories, expansions };
}
