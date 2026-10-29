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
  const [cashPurchases, setCashPurchases] = useState<any[]>([]);
  const [loadingCashPurchases, setLoadingCashPurchases] = useState(false);
  const [viewMode, setViewMode] = useState<"catalog" | "cash_history">("catalog");

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
  const handleTabChange = (tab: "all" | "active" | "paused" | "cash_history") => {
    if (tab === "cash_history") {
      setViewMode("cash_history");
      setLoadingCashPurchases(true);
      fetch(`${API_URL}/pos/cash-purchases`, {
        credentials: "include",
        headers: { "x-auth-scope": "admin" },
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          if (Array.isArray(data)) setCashPurchases(data);
        })
        .catch(() => setCashPurchases([]))
        .finally(() => setLoadingCashPurchases(false));
      return;
    }

    setViewMode("catalog");
    if (tab === "all") {
      setIsBuylistOnly(false);
      setBuylistState("all");
    } else {
      setIsBuylistOnly(true);
      setBuylistState(tab);
    }
    setPage(1);
  };

  const currentTab = viewMode === "cash_history" ? "cash_history" : (isBuylistOnly === false ? "all" : buylistState);

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
          onPublishStateChange={(val) => handleTabChange(val as "all" | "active" | "paused" | "cash_history")}
          publishStateOptions={[
            { value: "all", label: "Catálogo Global", variant: "default" },
            { value: "active", label: "Mis Buscados (Publicados)", variant: "success" },
            { value: "paused", label: "Mis Buscados (Pausados)", variant: "warning" },
            { value: "cash_history", label: "Compras en Efectivo (Cash)", variant: "default" },
          ]}
        />
      </div>

      {viewMode === "cash_history" ? (
        <div className="bg-[#0E121B] rounded-2xl shadow-xl border border-white/10 overflow-hidden min-h-[500px]">
          <div className="p-4 border-b border-white/10 bg-[#090C14] flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                Historial de Compras Pagadas en Efectivo (Cash)
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                Registro de salidas de efectivo de caja por adquisición de cartas a clientes en mostrador.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
              Total Egresado: $
              {cashPurchases
                .reduce((acc, p) => acc + Number(p.totalAmount || 0), 0)
                .toLocaleString("es-CL")}{" "}
              CLP
            </span>
          </div>

          {loadingCashPurchases ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : cashPurchases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-white/60 font-bold text-sm">Aún no hay compras en efectivo registradas</p>
              <p className="text-white/30 text-xs mt-1 max-w-sm">
                Las compras de cartas pagadas con efectivo desde el Punto de Venta (POS) aparecerán aquí con su detalle completo.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#090C14] border-b border-white/10 text-[11px] uppercase tracking-wider text-white/50 font-black">
                    <th className="px-6 py-3.5">Código / Fecha</th>
                    <th className="px-6 py-3.5">Vendedor (Cliente)</th>
                    <th className="px-6 py-3.5">Cajero</th>
                    <th className="px-6 py-3.5">Cartas Adquiridas</th>
                    <th className="px-6 py-3.5 text-right">Efectivo Pagado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {cashPurchases.map((purchase) => {
                    const items = Array.isArray(purchase.itemsData) ? purchase.itemsData : [];
                    return (
                      <tr key={purchase.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-white">{purchase.code}</div>
                          <div className="text-[11px] text-white/40">
                            {new Date(purchase.createdAt).toLocaleString("es-CL")}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-white">
                            {purchase.customerName || "Cliente Mostrador"}
                          </div>
                          {(purchase.customerEmail || purchase.customerRut) && (
                            <div className="text-[11px] text-white/40">
                              {purchase.customerEmail || purchase.customerRut}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-white/70 whitespace-nowrap">
                          {purchase.cashierName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {items.map((it: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-white/80">
                                <span className="font-mono font-bold text-emerald-400">
                                  {it.quantity}x
                                </span>
                                <span className="font-semibold">{it.product?.name || "Carta"}</span>
                                {it.condition && (
                                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-white/60">
                                    {it.condition}
                                  </span>
                                )}
                                {it.language && (
                                  <span className="text-[10px] text-white/40 uppercase">
                                    [{it.language}]
                                  </span>
                                )}
                                <span className="text-[11px] font-mono text-white/50">
                                  (${Number(it.price || 0).toLocaleString("es-CL")} c/u)
                                </span>
                              </div>
                            ))}
                            {purchase.notes && (
                              <div className="text-[11px] text-amber-300/80 italic pt-0.5">
                                Nota: {purchase.notes}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap font-mono font-black text-sm text-red">
                          -${Number(purchase.totalAmount).toLocaleString("es-CL")} CLP
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Tabla de Productos Base */
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
      )}

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
