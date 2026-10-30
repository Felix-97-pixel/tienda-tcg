"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { useSuperAdminStores } from "@/app/superadmin/_components/Stores/hooks/useSuperAdminStores";
import StoreTable from "@/app/superadmin/_components/Stores/StoreTable";
import CreateStoreModal from "@/app/superadmin/_components/Stores/CreateStoreModal";

export default function StoresPage() {
  const {
    companies,
    loading,
    isModalOpen,
    isSubmitting,
    formData,
    handleInputChange,
    handleCreateStore,
    handleDelete,
    openCreateModal,
    closeCreateModal,
  } = useSuperAdminStores();

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Empresas & Sucursales
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Administra las cuentas de empresa (Holdings), planes SaaS contratados y sus sucursales físicas asociadas.
          </p>
        </div>
        <Button onClick={openCreateModal}>
          + Registrar Empresa
        </Button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0E121B] shadow-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base font-bold text-white">Directorio de Empresas</h3>
        </div>

        {/* Tabla Jerárquica de Empresas y Sucursales */}
        <StoreTable
          companies={companies}
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
