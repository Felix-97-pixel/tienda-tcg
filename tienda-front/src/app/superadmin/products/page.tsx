"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { Product } from "@/types/product";
import { Category } from "@/types/productCategory";
import { Brand } from "@/types/brand";

// Componentes Extraídos
import ProductFilters from "@/components/Admin/Products/ProductFilters";
import ProductTable from "@/components/Admin/Products/ProductTable";
import CreateProductModal from "@/components/Admin/Products/CreateProductModal";
import EditProductModal from "@/components/Admin/Products/EditProductModal";
import InventoryModal from "@/components/Admin/Products/InventoryModal";
import BulkUploadModal from "@/components/Admin/Products/BulkUploadModal";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export default function AdminProducts() {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();

  // Hook de Datos (Maneja productos, búsqueda, paginación)
  const {
    products, setProducts, loading, refresh,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedExpansion, setSelectedExpansion,
    page, setPage, totalPages
  } = useAdminProducts();

  // Estados de Metadatos
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalCategories, setModalCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [expansions, setExpansions] = useState<{ name: string; products: number }[]>([]);

  // Estados de Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Ítems Seleccionados para Modales
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Cargar Metadatos al Montar
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin`).then(r => r.json()).then(setCategories);
    fetch(`${API_URL}/products/meta/categories/admin?isTcg=true`).then(r => r.json()).then(setModalCategories);
    fetch(`${API_URL}/products/meta/brands`).then(r => r.json()).then(setBrands);
  }, []);

  // Cargar Expansiones cuando cambia la categoría
  useEffect(() => {
    let url = `${API_URL}/products/meta/expansions`;
    if (selectedCategory) url += `?category=${encodeURIComponent(selectedCategory)}`;
    fetch(url).then(r => r.json()).then(setExpansions);
  }, [selectedCategory]);

  // Handlers
  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`${API_URL}/products/${productToDelete.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        showToast(tc("success"), "success");
        setProductToDelete(null);
        refresh();
      } else {
        showToast(tc("error"), "error");
      }
    } catch (err) {
      showToast(tc("networkError"), "error");
    }
  };

  const openEdit = (product: Product, item: any) => {
    setEditingItem({
      productId: product.id,
      categoryId: product.categoryId,
      brandId: product.brandId || "",
      imageUrl: product.imageUrl || "",
      productName: product.name,
      description: product.description || "",
      itemId: item?.id || "",
      price: item?.price || 0,
      stock: item?.stock || 0,
    });
    setIsEditOpen(true);
  };

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
        <div className="flex flex-col items-center justify-center p-16 bg-[#1a1d24] border border-white/5 rounded-3xl text-center shadow-lg">
          <div className="w-20 h-20 bg-blue/10 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Usa los filtros para buscar productos</h3>
          <p className="text-sm text-gray-4 max-w-md mx-auto font-medium">
            Por favor, ingresa el nombre de una carta o selecciona una categoría / expansión para comenzar a cargar el catálogo.
          </p>
        </div>
      ) : (
        <ProductTable
          products={products}
          loading={loading}
          onEdit={openEdit}
          onInventory={(p) => { setSelectedProduct(p); setIsInventoryOpen(true); }}
          onDelete={confirmDelete}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Modales */}
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

      <Modal isOpen={!!productToDelete} onClose={() => setProductToDelete(null)} title="Confirmar Eliminación">
        <div className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-red/10 rounded-full flex items-center justify-center text-red">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-white">¿Eliminar permanentemente?</h3>
            <p className="text-gray-4">
              ¿Estás seguro que deseas eliminar el producto <span className="text-white font-bold">{productToDelete?.name}</span>?
              Esta acción lo ocultará de los inventarios activos.
            </p>
          </div>
          <div className="flex gap-3 mt-8">
            <Button variant="secondary" className="flex-1" onClick={() => setProductToDelete(null)}>
              Cancelar
            </Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>
              Sí, eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
