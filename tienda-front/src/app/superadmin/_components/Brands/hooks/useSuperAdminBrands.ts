"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Brand } from "@/types/brand";

export function useSuperAdminBrands() {
  const t = useTranslations("brands");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const { handleRemove } = useImageUpload();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const fetchBrands = useCallback(() => {
    setLoading(true);
    fetch(`${API_URL}/products/meta/brands`)
      .then((res) => res.json())
      .then((data) => {
        setBrands(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching brands:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleDelete = async (brand: Brand) => {
    if (!confirm(t("deleteConfirm") || "¿Seguro que deseas eliminar esta marca?")) return;
    try {
      if (brand.imageUrl) {
        await handleRemove(brand.imageUrl);
      }
      const res = await fetch(`${API_URL}/products/meta/brands/${brand.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        showToast(tc("success"), "success");
        fetchBrands();
      } else {
        const errData = await res.json();
        showToast(errData.message || tc("error"), "error");
      }
    } catch (e) {
      showToast(tc("networkError"), "error");
    }
  };

  const openCreateModal = () => {
    setSelectedBrand(null);
    setIsModalOpen(true);
  };

  const openEditModal = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    brands,
    loading,
    isModalOpen,
    selectedBrand,
    fetchBrands,
    handleDelete,
    openCreateModal,
    openEditModal,
    closeModal
  };
}
