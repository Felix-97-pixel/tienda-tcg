"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useProductMetadata } from "@/hooks/useProductMetadata";
import { Product } from "@/types/product";

// Componentes Extraídos
import ProductFilters from "@/components/Admin/Products/ProductFilters";
import ProductTable from "@/components/Admin/Products/ProductTable";
import InventoryModal from "@/components/Admin/Products/InventoryModal";
import BulkUploadModal from "@/components/Admin/Products/BulkUploadModal";
import BulkPublishConfirmModal from "@/components/Admin/Products/BulkPublishConfirmModal";
import SyncDealerPricesBtn from "../SyncDealerPricesBtn";
import { Button } from "@/components/ui/Button";

export default function StoreAdminProducts() {
  const t = useTranslations("products");

  // Hook de Datos (Maneja productos, búsqueda, paginación)
  const {
    products, loading, refresh,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    publishState, setPublishState,
    page, setPage, totalPages
  } = useAdminProducts(true, false);

  // Hook de Metadatos (isTcg = false, sin necesidad de expansiones para sellado)
  const { categories, modalCategories } = useProductMetadata(false);

  // Estados de Modales
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isConfirmPublishOpen, setIsConfirmPublishOpen] = useState(false);

  // Ítem Seleccionado para Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Inventario Sellado y Accesorios
          </h1>
          <p className="text-gray-4 text-sm mt-1">
            Revisa y gestiona los productos sellados, accesorios y dados que tienes en tu inventario.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setIsConfirmPublishOpen(true)}>
            Publicar Todo lo Pausado
          </Button>
          <SyncDealerPricesBtn />
          <Button variant="success" onClick={() => setIsBulkOpen(true)}>
            {t("bulkUpload")}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <ProductFilters
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory}
        categories={categories}
        publishState={publishState}
        onPublishStateChange={setPublishState}
      />

      {/* Tabla Principal */}
      <ProductTable
        products={products}
        loading={loading}
        onInventory={(p) => { setSelectedProduct(p); setIsInventoryOpen(true); }}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Modales */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        product={selectedProduct}
        onSuccess={refresh}
        isGlobalCatalog={true}
      />

      <BulkUploadModal
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        categories={modalCategories}
        onSuccess={refresh}
      />

      <BulkPublishConfirmModal
        isOpen={isConfirmPublishOpen}
        onClose={() => setIsConfirmPublishOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
