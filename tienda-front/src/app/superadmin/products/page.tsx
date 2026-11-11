"use client";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { useSuperAdminProductsPage } from "@/app/admin/_components/Products/hooks/useSuperAdminProductsPage";
import { Product } from "@/types/product";

// Componentes Extraídos
import ProductFilters from "@/app/admin/_components/Products/ProductFilters";
import ProductTable from "@/app/admin/_components/Products/ProductTable";
import CreateProductModal from "@/app/admin/_components/Products/CreateProductModal";
import EditProductModal from "@/app/admin/_components/Products/EditProductModal";
import SuperAdminInventoryModal from "@/app/admin/_components/Products/SuperAdminInventoryModal";
import BulkUploadModal from "@/app/admin/_components/Products/BulkUploadModal";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { IconSearch, IconAlertTriangle } from "@/components/ui/Icons";

const ProductPriceHistoryModal = dynamic(
  () => import("@/app/admin/_components/Products/ProductPriceHistoryModal"),
  { ssr: false }
);

export default function AdminProducts() {
  const t = useTranslations("products");

  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);

  const {
    products, loading, refresh,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedExpansion, setSelectedExpansion,
    page, setPage, totalPages,
    categories, modalCategories, brands, expansions,
    isCreateOpen, setIsCreateOpen,
    isBulkOpen, setIsBulkOpen,
    isInventoryOpen, setIsInventoryOpen,
    isEditOpen, setIsEditOpen,
    selectedProduct, setSelectedProduct,
    productToDelete, confirmDelete, cancelDelete, handleDelete,
    editingItem, openEdit
  } = useSuperAdminProductsPage();

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="text-gray-4 text-sm mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="success"
            onClick={() => setIsBulkOpen(true)}
          >
            {t("bulkUpload")}
          </Button>
          <Button
            onClick={() => setIsCreateOpen(true)}
          >
            {t("addProduct")}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <ProductFilters
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory}
        selectedExpansion={selectedExpansion} onExpansionChange={setSelectedExpansion}
        categories={categories}
        expansions={expansions}
      />

      {/* Tabla Principal */}
      {!searchTerm && !selectedCategory && !selectedExpansion ? (
        <div className="flex flex-col items-center justify-center p-16 bg-[#0E121B] border border-white/10 rounded-3xl text-center shadow-2xl">
          <div className="w-20 h-20 bg-red/10 border border-red/20 rounded-full flex items-center justify-center mb-6">
            <IconSearch className="w-10 h-10 text-red" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">{t("use_filters_title")}</h3>
          <p className="text-sm text-gray-4 max-w-md mx-auto font-medium">
            {t("use_filters_desc")}
          </p>
        </div>
      ) : (
        <ProductTable
          products={products}
          loading={loading}
          onEdit={openEdit}
          onDelete={confirmDelete}
          onViewHistory={(p) => setHistoryProduct(p)}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          isSuperAdminCatalog={true}
        />
      )}

      {/* Modales */}
      <ProductPriceHistoryModal
        isOpen={!!historyProduct}
        onClose={() => setHistoryProduct(null)}
        product={historyProduct}
      />
      <CreateProductModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        categories={modalCategories}
        brands={brands}
        onSuccess={refresh}
      />

      <EditProductModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        item={editingItem}
        categories={categories}
        brands={brands}
        onSuccess={refresh}
      />

      <SuperAdminInventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        product={selectedProduct}
        onSuccess={refresh}
      />

      <BulkUploadModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        categories={modalCategories}
        onSuccess={refresh}
        isGlobal={true}
      />

      <Modal isOpen={!!productToDelete} onClose={cancelDelete} title={t("confirm_delete_title")}>
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center text-red">
              <IconAlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">{t("delete_permanently_q")}</h3>
            <p className="text-gray-4">
              {t("delete_confirm_desc", { name: productToDelete?.name || "" })}
            </p>
          </div>
          <div className="flex gap-3 mt-8">
            <Button variant="secondary" className="flex-1" onClick={cancelDelete}>
              {t("cancel_btn")}
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>
              {t("yes_delete_btn")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
