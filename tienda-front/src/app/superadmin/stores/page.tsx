"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import { useSuperAdminStores } from "@/app/superadmin/_components/Stores/hooks/useSuperAdminStores";
import StoreTable from "@/app/superadmin/_components/Stores/StoreTable";
import CreateStoreModal from "@/app/superadmin/_components/Stores/CreateStoreModal";
import CreateBranchModal from "@/app/superadmin/_components/Stores/CreateBranchModal";
import CompanyUsersModal from "@/app/superadmin/_components/Stores/CompanyUsersModal";
import StoreUsersModal from "@/app/superadmin/_components/Stores/StoreUsersModal";

export default function StoresPage() {
  const {
    companies,
    availablePlans,
    loading,
    refreshCompanies,
    isModalOpen,
    isSubmitting,
    formData,
    setFormData,
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
    // Gestión de Usuarios
    isCompanyUsersModalOpen,
    selectedCompanyForUsers,
    openCompanyUsersModal,
    closeCompanyUsersModal,
    isStoreUsersModalOpen,
    selectedBranchForUsers,
    openStoreUsersModal,
    closeStoreUsersModal,
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
          onManageCompanyUsers={openCompanyUsersModal}
          onManageStoreUsers={openStoreUsersModal}
        />

        {/* Modal de Creación de Empresa (Holding + Primera Tienda) */}
        <CreateStoreModal
          isOpen={isModalOpen}
          onClose={closeCreateModal}
          onSubmit={handleCreateStore}
          formData={formData}
          setFormData={setFormData}
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

        {/* Modal de Usuarios Corporativos de Empresa */}
        <CompanyUsersModal
          isOpen={isCompanyUsersModalOpen}
          onClose={closeCompanyUsersModal}
          company={selectedCompanyForUsers}
          onRefresh={refreshCompanies}
        />

        {/* Modal de Personal y Cajeros de Sucursal */}
        <StoreUsersModal
          isOpen={isStoreUsersModalOpen}
          onClose={closeStoreUsersModal}
          branch={selectedBranchForUsers}
          onRefresh={refreshCompanies}
        />
      </div>
    </>
  );
}
