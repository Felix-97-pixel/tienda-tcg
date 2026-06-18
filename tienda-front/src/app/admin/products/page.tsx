"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { Product } from "@/types/product";
import { Category } from "@/types/productCategory";
import { useAppSelector } from "@/redux/store";

// Componentes Extraídos
import ProductFilters from "@/components/Admin/Products/ProductFilters";
import ProductTable from "@/components/Admin/Products/ProductTable";
import InventoryModal from "@/components/Admin/Products/InventoryModal";
import BulkUploadModal from "@/components/Admin/Products/BulkUploadModal";
import SyncDealerPricesBtn from "../SyncDealerPricesBtn";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function StoreAdminProducts() {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();

  // Hook de Datos (Maneja productos, búsqueda, paginación)
  const {
    products, setProducts, loading, refresh,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedExpansion, setSelectedExpansion,
    publishState, setPublishState,
    page, setPage, totalPages
  } = useAdminProducts(true);

  // Estados de Metadatos
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalCategories, setModalCategories] = useState<Category[]>([]);
  const [expansions, setExpansions] = useState<{ name: string; products: number }[]>([]);

  // Estados de Modales
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isConfirmPublishOpen, setIsConfirmPublishOpen] = useState(false);

  // Ítems Seleccionados para Modales
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { features } = useAppSelector((state) => state.authReducer);

  // Cargar Metadatos al Montar
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin?isTcg=true`)
      .then(r => r.json())
      .then(data => {
        setCategories(data);
        setModalCategories(data);
      });
  }, []);

  // Cargar Expansiones cuando cambia la categoría
  useEffect(() => {
    if (!selectedCategory) {
      setExpansions([]);
      setSelectedExpansion(""); // Resetear la expansión seleccionada si se limpia la categoría
      return;
    }
    const url = `${API_URL}/products/meta/expansions?category=${encodeURIComponent(selectedCategory)}`;
    fetch(url).then(r => r.json()).then(setExpansions);
  }, [selectedCategory, setSelectedExpansion]);

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Mi Inventario
          </h1>
          <p className="text-gray-4 text-sm mt-1">
            Revisa y gestiona las cartas que actualmente tienes en tu inventario.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsConfirmPublishOpen(true)}
          >
            Publicar Todo lo Pausado
          </Button>
          <SyncDealerPricesBtn />
          <Button
            variant="success"
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
        selectedExpansion={selectedExpansion} onExpansionChange={setSelectedExpansion}
        categories={categories}
        expansions={expansions}
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

      <Modal isOpen={isConfirmPublishOpen} onClose={() => setIsConfirmPublishOpen(false)} title="Confirmar Publicación Masiva">
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue/10 rounded-full flex items-center justify-center text-blue">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white">¿Estás seguro?</h3>
            <p className="text-gray-4">
              Estás a punto de publicar **todo** tu inventario pausado de manera simultánea. Estas cartas estarán disponibles para que tus clientes las compren de inmediato.
            </p>
          </div>
          <div className="flex gap-3 mt-8">
            <Button variant="secondary" className="flex-1" onClick={() => setIsConfirmPublishOpen(false)}>
              Cancelar
            </Button>
            <Button variant="success" className="flex-1" onClick={async () => {
              try {
                const res = await fetch(`${API_URL}/products/inventory/bulk-publish`, { method: "PATCH", credentials: "include" });
                if (res.ok) {
                  showToast("Inventario publicado correctamente", "success");
                  setIsConfirmPublishOpen(false);
                  refresh();
                } else {
                  showToast("Error al publicar el inventario", "error");
                }
              } catch (e) {
                showToast("Error de conexión", "error");
              }
            }}>
              Sí, publicar todo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
