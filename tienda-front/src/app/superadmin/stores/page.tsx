"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { useSuperAdminStores } from "@/app/admin/_components/Stores/hooks/useSuperAdminStores";

// Componentes Extraídos
import StoreTable from "@/app/admin/_components/Stores/StoreTable";
import CreateStoreModal from "@/app/admin/_components/Stores/CreateStoreModal";

export default function StoresPage() {
  const {
    stores,
    loading,
    isModalOpen,
    isSubmitting,
    formData,
    handleInputChange,
    handleCreateStore,
    handleDelete,
    openCreateModal,
    closeCreateModal
  } = useSuperAdminStores();

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-white">
          Gestión de Tiendas (Dealers)
        </h2>
      </div>

      <div className="rounded-xl border border-white/5 bg-[#1a1d24] shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-white">Lista de Tiendas</h3>
          <Button onClick={openCreateModal}>
            + Agregar Dealer
          </Button>
        </div>

        {/* Tabla Principal */}
        <StoreTable
          stores={stores}
          loading={loading}
          onDelete={handleDelete}
        />

        {/* Modal de Creación */}
        <CreateStoreModal
          isOpen={isModalOpen}
          onClose={closeCreateModal}
          onSubmit={handleCreateStore}
          formData={formData}
          handleInputChange={handleInputChange}
          isSubmitting={isSubmitting}
        />
      </div>
    </>
  );
}
