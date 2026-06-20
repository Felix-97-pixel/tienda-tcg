"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { useSuperAdminCategories } from "@/app/admin/_components/Categories/hooks/useSuperAdminCategories";

// Componentes Extraídos
import CategoryTable from "@/app/admin/_components/Categories/CategoryTable";
import CategoryModal from "@/app/admin/_components/Categories/CategoryModal";
import { Button } from "@/components/ui/Button";

export default function AdminCategories() {
  const t = useTranslations("categories");

  const {
    categories,
    loading,
    isModalOpen,
    selectedCategory,
    fetchCategories,
    handleDelete,
    openCreateModal,
    openEditModal,
    closeModal
  } = useSuperAdminCategories();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="text-gray-4 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button onClick={openCreateModal}>
          {t("addCategory")}
        </Button>
      </div>

      {/* Tabla */}
      <CategoryTable 
        categories={categories} 
        loading={loading} 
        onEdit={openEditModal} 
        onDelete={handleDelete} 
      />

      {/* Modal */}
      <CategoryModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        category={selectedCategory} 
        onSuccess={fetchCategories} 
      />
    </div>
  );
}
