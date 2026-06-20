"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { AdminCategory as Category } from "@/types/adminCategory";

export function useSuperAdminCategories() {
  const t = useTranslations("categories");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const { handleRemove } = useImageUpload();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    fetch(`${API_URL}/products/meta/categories/admin`)
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async (category: Category) => {
    if (!confirm(t("deleteConfirm") || "¿Seguro que deseas eliminar esta categoría?")) return;
    try {
      if (category.imageUrl) {
        await handleRemove(category.imageUrl);
      }
      const res = await fetch(`${API_URL}/products/meta/categories/${category.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showToast(tc("success"), "success");
        fetchCategories();
      } else {
        const errData = await res.json();
        showToast(errData.message || tc("error"), "error");
      }
    } catch (e) {
      showToast(tc("networkError"), "error");
    }
  };

  const openCreateModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    categories,
    loading,
    isModalOpen,
    selectedCategory,
    fetchCategories,
    handleDelete,
    openCreateModal,
    openEditModal,
    closeModal
  };
}
