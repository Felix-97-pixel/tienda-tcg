"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { Product } from "@/types/product";
import { Category } from "@/types/productCategory";

// Componentes Extraídos
import ProductFilters from "@/components/Admin/Products/ProductFilters";
import ProductTable from "@/components/Admin/Products/ProductTable";
import InventoryModal from "@/components/Admin/Products/InventoryModal";
import BulkUploadModal from "@/components/Admin/Products/BulkUploadModal";
import SyncDealerPricesBtn from "../SyncDealerPricesBtn";
import { Button } from "@/components/ui/Button";

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
    isInventoryOnly, setIsInventoryOnly,
    page, setPage, totalPages
  } = useAdminProducts(true);

  // Estados de Metadatos
  const [categories, setCategories] = useState<Category[]>([]);
  const [expansions, setExpansions] = useState<{ name: string; products: number }[]>([]);

  // Estados de Modales
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  // Ítems Seleccionados para Modales
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Cargar Metadatos al Montar
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories`).then(r => r.json()).then(setCategories);
  }, []);

  // Cargar Expansiones cuando cambia la categoría
  useEffect(() => {
    let url = `${API_URL}/products/meta/expansions`;
    if (selectedCategory) url += `?category=${encodeURIComponent(selectedCategory)}`;
    fetch(url).then(r => r.json()).then(setExpansions);
  }, [selectedCategory]);

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isInventoryOnly ? "Mi Inventario" : "Catálogo Global"}
          </h1>
          <p className="text-gray-4 text-sm mt-1">
            {isInventoryOnly 
              ? "Revisa y gestiona las cartas que actualmente tienes en tu inventario."
              : "Busca productos en el catálogo oficial y añade tu inventario para publicarlos en tu tienda."
            }
          </p>
        </div>
        <div className="flex gap-3">
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
        isInventoryOnly={isInventoryOnly}
        onInventoryOnlyChange={setIsInventoryOnly}
      />

      {/* Tabla Principal */}
      {!searchTerm && !selectedCategory && !selectedExpansion && !isInventoryOnly ? (
        <div className="flex flex-col items-center justify-center p-16 bg-[#1a1d24] border border-white/5 rounded-3xl text-center shadow-lg">
          <div className="w-20 h-20 bg-blue/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Usa los filtros para buscar productos</h3>
          <p className="text-sm text-gray-4 max-w-md mx-auto font-medium">
            Por favor, ingresa el nombre de una carta o selecciona una categoría / expansión para comenzar a cargar el catálogo y agregar tu stock.
          </p>
        </div>
      ) : (
        <ProductTable
          products={products}
          loading={loading}
          onInventory={(p) => { setSelectedProduct(p); setIsInventoryOpen(true); }}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

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
        categories={categories}
        onSuccess={refresh}
      />
    </div>
  );
}
