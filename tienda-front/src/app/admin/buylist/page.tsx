"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";
import { useAdminProducts } from "@/app/admin/_components/hooks/useAdminProducts";
import { Product } from "@/types/product";
import { Category } from "@/types/productCategory";

// Componentes Extraídos
import ProductFilters from "@/app/admin/_components/Products/ProductFilters";
import BuylistTable from "@/app/admin/_components/Buylist/BuylistTable";
import BuylistModal from "@/app/admin/_components/Buylist/BuylistModal";
import { Button } from "@/components/ui/Button";

import UpsellBanner from "@/app/admin/_components/UpsellBanner";
import SegmentedControl from "@/components/ui/SegmentedControl";
import { useAppSelector } from "@/redux/store";

export default function AdminBuylistPage() {
  const t = useTranslations("common");
  const { showToast } = useToast();

  // Hook de Datos (Maneja productos, búsqueda, paginación)
  // isInventoryOnly = false, isTcg = true, isBuylistOnly = false
  const {
    products, setProducts, loading, refresh,
    searchTerm, setSearchTerm,
    selectedCategory, setSelectedCategory,
    selectedExpansion, setSelectedExpansion,
    buylistState, setBuylistState,
    isBuylistOnly, setIsBuylistOnly,
    page, setPage, totalPages
  } = useAdminProducts(false, true, false);

  // Estados de Metadatos
  const [categories, setCategories] = useState<Category[]>([]);
  const [expansions, setExpansions] = useState<{ name: string; products: number }[]>([]);

  // Estados de Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const { features } = useAppSelector((state) => state.adminAuthReducer);

  // Cargar Metadatos al Montar
  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories/admin?isTcg=true`)
      .then(r => r.json())
      .then(data => {
        setCategories(data);
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

    // Manejar el cambio de pestaña
  const handleTabChange = (tab: "all" | "active" | "paused") => {
    if (tab === "all") {
      setIsBuylistOnly(false);
      setBuylistState("all");
    } else {
      setIsBuylistOnly(true);
      setBuylistState(tab);
    }
    setPage(1);
  };

  const currentTab = isBuylistOnly === false ? "all" : buylistState;

  if (!features?.includes("addon:buylist")) {
    return (
      <div className="p-6 pb-24">
        <UpsellBanner featureName="Radar de Demanda" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Mi Buylist
          </h1>
          <p className="text-gray-4 text-sm mt-1">
            Busca cartas en el catálogo global y añade solicitudes de compra a tu Buylist.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <ProductFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedExpansion={selectedExpansion}
          onExpansionChange={setSelectedExpansion}
          categories={categories}
          expansions={expansions}
          publishState={currentTab}
          onPublishStateChange={(val) => handleTabChange(val as "all" | "active" | "paused")}
          publishStateOptions={[
            { value: "all", label: "Catálogo Global", variant: "default" },
            { value: "active", label: "Mis Buscados (Publicados)", variant: "success" },
            { value: "paused", label: "Mis Buscados (Pausados)", variant: "warning" },
          ]}
        />
      </div>

      {/* Tabla de Productos Base */}
      <div className="bg-[#0E121B] rounded-2xl shadow-xl border border-white/10 overflow-hidden min-h-[500px]">
        <BuylistTable
          products={products}
          loading={loading}
          onManage={(product) => {
            setSelectedProduct(product);
            setIsModalOpen(true);
          }}
        />

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-white/10 flex items-center justify-between bg-[#090C14]">
            <p className="text-sm text-white/50">
              Página {page} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Gestión de Buylist para el Producto Seleccionado */}
      {isModalOpen && selectedProduct && (
        <BuylistModal
          product={selectedProduct}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onUpdate={refresh}
        />
      )}
    </div>
  );
}
