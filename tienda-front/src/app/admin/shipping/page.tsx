"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { List, Column } from "@/components/ui/List";
import { ShippingProvider } from "@/types/shippingProvider";
import { ShippingBadge } from "@/components/ui/ShippingBadge";

// Custom Hook y Subcomponentes
import { useShippingProviders } from "@/app/admin/_components/Shipping/hooks/useShippingProviders";
import ShippingProviderModal from "@/app/admin/_components/Shipping/ShippingProviderModal";

export default function AdminShipping() {
  const { providers, loading, refresh } = useShippingProviders();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ShippingProvider | null>(null);

  const openModal = (provider: ShippingProvider) => {
    setSelectedProvider(provider);
    setIsModalOpen(true);
  };

  const columns: Column<ShippingProvider>[] = [
    {
      key: "name",
      header: "Proveedor",
      render: (provider) => (
        <div className="flex items-center gap-3.5">
          <ShippingBadge name={provider.name} size="sm" />
          <span className="font-bold text-white text-sm tracking-wide">
            {provider.name.toUpperCase()}
          </span>
        </div>
      ),
    },
    {
      key: "price",
      header: "Tarifa Plana",
      render: (provider) => (
        <span className="font-bold text-green-600 text-sm">
          ${Number(provider.price).toLocaleString("es-CL")}
        </span>
      ),
    },
    {
      key: "isActive",
      header: "Estado",
      render: (provider) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${provider.isActive
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          : 'bg-rose-100 text-rose-700 border border-rose-200'
          }`}>
          {provider.isActive ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (provider) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="px-3.5 py-1.5 bg-blue/10 text-blue hover:bg-blue hover:text-white transition-all duration-200 flex items-center gap-1.5 font-bold"
            onClick={() => openModal(provider)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Métodos de Envío</h1>
          <p className="text-gray-4 text-sm mt-1.5 font-medium">
            Configura las tarifas y disponibilidad de los proveedores de despacho a domicilio
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-[#1a1d24] rounded-[10px] shadow-1 overflow-hidden">
        <List
          columns={columns}
          data={providers}
          loading={loading}
          keyExtractor={(provider) => provider.id}
        />
      </div>

      {/* Modal de edición */}
      <ShippingProviderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        provider={selectedProvider}
        onSuccess={refresh}
      />
    </div>
  );
}
