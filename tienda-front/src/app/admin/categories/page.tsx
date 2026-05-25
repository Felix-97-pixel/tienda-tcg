"use client";
import React, { useEffect, useState } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useImageUpload } from "@/hooks/useImageUpload";

// Componentes Extraídos
import CategoryTable from "@/components/Admin/Categories/CategoryTable";
import CategoryModal from "@/components/Admin/Categories/CategoryModal";
import { Button } from "@/components/ui/Button";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  isTcg?: boolean;
}

export default function AdminCategories() {
  const t = useTranslations("categories");
  const tc = useTranslations("common");
  const { showToast } = useToast();
  const { handleRemove } = useImageUpload();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const fetchCategories = () => {
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
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark">{t("title")}</h1>
          <p className="text-dark-4 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button
          onClick={() => { setSelectedCategory(null); setIsModalOpen(true); }}
        >
          {t("addCategory")}
        </Button>
      </div>

      {/* Tabla */}
      <CategoryTable 
        categories={categories} 
        loading={loading} 
        onEdit={(cat) => { setSelectedCategory(cat); setIsModalOpen(true); }} 
        onDelete={handleDelete} 
      />

      {/* Modal */}
      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        category={selectedCategory} 
        onSuccess={fetchCategories} 
      />
    </div>
  );
}
