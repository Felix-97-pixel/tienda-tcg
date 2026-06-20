"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { useSuperAdminBrands } from "@/components/Admin/Brands/hooks/useSuperAdminBrands";

// Componentes Extraídos
import BrandTable from "@/components/Admin/Brands/BrandTable";
import BrandModal from "@/components/Admin/Brands/BrandModal";
import { Button } from "@/components/ui/Button";

export default function AdminBrands() {
  const t = useTranslations("brands");

  const {
    brands,
    loading,
    isModalOpen,
    selectedBrand,
    fetchBrands,
    handleDelete,
    openCreateModal,
    openEditModal,
    closeModal
  } = useSuperAdminBrands();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="text-gray-4 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <Button onClick={openCreateModal}>
          {t("addBrand")}
        </Button>
      </div>

      {/* Tabla */}
      <BrandTable 
        brands={brands} 
        loading={loading} 
        onEdit={openEditModal} 
        onDelete={handleDelete} 
      />

      {/* Modal */}
      <BrandModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        brand={selectedBrand} 
        onSuccess={fetchBrands} 
      />
    </div>
  );
}
