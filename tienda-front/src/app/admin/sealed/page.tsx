"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useAdminProducts } from "@/app/admin/_components/hooks/useAdminProducts";
import { useProductMetadata } from "@/app/admin/_components/hooks/useProductMetadata";
import { Product } from "@/types/product";

// Componentes Extraídos
import ProductFilters from "@/app/admin/_components/Products/ProductFilters";
import ProductTable from "@/app/admin/_components/Products/ProductTable";
import InventoryModal from "@/app/admin/_components/Products/InventoryModal";
import BulkUploadModal from "@/app/admin/_components/Products/BulkUploadModal";
import BulkPublishConfirmModal from "@/app/admin/_components/Products/BulkPublishConfirmModal";
import GlobalCatalogSearchModal from "@/app/admin/_components/Products/GlobalCatalogSearchModal";
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
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // Ítem Seleccionado para Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="space-y-5 pb-24 w-full min-w-0">
      {/* Header Responsive */}
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Inventario Sellado y Accesorios
          </h1>
          <p className="text-gray-4 text-xs sm:text-sm mt-1">
            Revisa y gestiona los productos sellados, accesorios y dados que tienes en tu inventario.
          </p>
        </div>

        {/* Action Buttons: 
            - Móvil y tablet pequeña (< md): Lista apilada completa (100% de ancho cada botón, simétrico y táctil)
            - Tablet y desktop mediano (md a < 2xl): Cuadrícula simétrica 2x2 (cada botón toma exactamente el 50%)
            - Desktop XL (2xl+): Una sola fila horizontal alineada al contenido
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:flex 2xl:items-center gap-2.5 sm:gap-3 w-full 2xl:w-auto">
          <Button
            variant="success"
            className="w-full 2xl:w-auto text-xs font-bold text-center justify-center !py-2.5 whitespace-nowrap"
            onClick={() => setIsGlobalSearchOpen(true)}
          >
            Añadir Producto
          </Button>
          <Button
            variant="secondary"
            className="w-full 2xl:w-auto text-xs font-bold text-center justify-center !py-2.5 whitespace-nowrap"
            onClick={() => setIsConfirmPublishOpen(true)}
          >
            Publicar Todo lo Pausado
          </Button>
          <Button
            variant="secondary"
            className="w-full 2xl:w-auto text-xs font-bold text-center justify-center !py-2.5 whitespace-nowrap"
            onClick={() => setIsBulkOpen(true)}
          >
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

      <GlobalCatalogSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onSelectProduct={(product) => {
          setIsGlobalSearchOpen(false);
          setSelectedProduct(product);
          setIsInventoryOpen(true);
        }}
      />
    </div>
  );
}
