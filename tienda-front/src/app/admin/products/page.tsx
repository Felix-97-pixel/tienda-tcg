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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [expansions, setExpansions] = useState<{ name: string; products: number }[]>([]);

  // Estados de Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Ítems Seleccionados para Modales
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Cargar Metadatos al Montar
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin`).then(r => r.json()).then(setCategories);
    fetch(`${API_URL}/products/meta/brands`).then(r => r.json()).then(setBrands);
  }, []);

  // Cargar Expansiones cuando cambia la categoría
  useEffect(() => {
    let url = `${API_URL}/products/meta/expansions`;
    if (selectedCategory) url += `?category=${encodeURIComponent(selectedCategory)}`;
    fetch(url).then(r => r.json()).then(setExpansions);
  }, [selectedCategory]);

  // Handlers
  const handleDelete = async (product: Product) => {
    if (!confirm(t("deleteConfirm") || "¿Seguro que deseas eliminar este producto?")) return;
    try {
      const res = await fetch(`${API_URL}/products/${product.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        showToast(tc("success"), "success");
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
      itemId: item.id,
      price: item.price,
      stock: item.stock,
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
      <ProductTable 
        products={products}
        loading={loading}
        onEdit={openEdit}
        onInventory={(p) => { setSelectedProduct(p); setIsInventoryOpen(true); }}
        onDelete={handleDelete}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Modales */}
      <CreateProductModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        categories={categories} 
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
