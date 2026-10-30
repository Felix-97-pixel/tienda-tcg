"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { useSuperAdminStores } from "@/app/superadmin/_components/Stores/hooks/useSuperAdminStores";
import StoreTable from "@/app/superadmin/_components/Stores/StoreTable";
import CreateStoreModal from "@/app/superadmin/_components/Stores/CreateStoreModal";
import CreateBranchModal from "@/app/superadmin/_components/Stores/CreateBranchModal";

export default function StoresPage() {
  const {
    companies,
    availablePlans,
    loading,
    isModalOpen,
    isSubmitting,
    formData,
    handleInputChange,
    handleCreateStore,
    handleAssignPlan,
    handleDelete,
    openCreateModal,
    closeCreateModal,
    // Branch creation
    isBranchModalOpen,
    selectedCompanyForBranch,
    isSubmittingBranch,
    openCreateBranchModal,
    closeCreateBranchModal,
    handleCreateBranch,
  } = useSuperAdminStores();

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Empresas & Sucursales
          </h2>
          <p className="text-xs text-white/50 mt-1">
            Administra las cuentas de empresa (Holdings), asigna planes SaaS corporativos y supervisa sus sucursales físicas.
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

        {/* Tabla Jerárquica de Empresas y Sucursales con Plan SaaS */}
        <StoreTable
          companies={companies}
          availablePlans={availablePlans}
          loading={loading}
          onDelete={handleDelete}
          onAssignPlan={handleAssignPlan}
          onAddBranch={openCreateBranchModal}
        />

        {/* Modal de Creación de Empresa (Holding + Primera Tienda) */}
        <CreateStoreModal
          isOpen={isModalOpen}
          onClose={closeCreateModal}
          onSubmit={handleCreateStore}
          formData={formData}
          handleInputChange={handleInputChange}
          isSubmitting={isSubmitting}
        />

        {/* Modal de Creación de Sucursal para Empresa existente */}
        <CreateBranchModal
          isOpen={isBranchModalOpen}
          onClose={closeCreateBranchModal}
          company={selectedCompanyForBranch}
          onSubmit={handleCreateBranch}
          isSubmitting={isSubmittingBranch}
        />
      </div>
    </>
  );
}
