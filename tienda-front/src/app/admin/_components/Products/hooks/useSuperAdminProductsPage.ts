"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useAdminProducts } from "@/app/admin/_components/hooks/useAdminProducts";
import { Product } from "@/types/product";
import { Category } from "@/types/productCategory";
import { Brand } from "@/types/brand";

export function useSuperAdminProductsPage() {
  const t = useTranslations("products");
  const tc = useTranslations("common");
  const { showToast } = useToast();

  // Hook base de datos
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
    if (!selectedCategory) {
      setExpansions([]);
      setSelectedExpansion("");
      return;
    }
    const url = `${API_URL}/products/meta/expansions?category=${encodeURIComponent(selectedCategory)}`;
    fetch(url).then(r => r.json()).then(setExpansions);
  }, [selectedCategory, setSelectedExpansion]);

  // Handlers de Eliminación
  const confirmDelete = useCallback((product: Product) => {
    setProductToDelete(product);
  }, []);

  const cancelDelete = useCallback(() => {
    setProductToDelete(null);
  }, []);

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

  // Handler de Edición
  const openEdit = useCallback((product: Product, item: any) => {
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
  }, []);

  return {
    // Data & Filters
    products, loading, refresh,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedExpansion, setSelectedExpansion,
    page, setPage, totalPages,
    // Metadata
    categories, modalCategories, brands, expansions,
    // Modals
    isCreateOpen, setIsCreateOpen,
    isBulkOpen, setIsBulkOpen,
    isInventoryOpen, setIsInventoryOpen,
    isEditOpen, setIsEditOpen,
    // Selected Items & Handlers
    selectedProduct, setSelectedProduct,
    productToDelete, confirmDelete, cancelDelete, handleDelete,
    editingItem, openEdit
  };
}
