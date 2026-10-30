"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import toast from "react-hot-toast";

export interface Branch {
  id: string;
  name: string;
  subdomain: string;
  isMainBranch: boolean;
  address?: string;
  balance: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number | string;
  skuLimit: number;
}

export interface Company {
  id: string;
  name: string;
  rut?: string;
  planId?: string | null;
  plan?: SubscriptionPlan | null;
  balance: number;
  extraBranchesCount: number;
  owner: {
    id: string;
    email: string;
    name: string;
  };
  stores: Branch[];
  createdAt: string;
}

export function useSuperAdminStores() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para crear nueva Empresa (Holding + Casa Matriz)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    storeName: "",
    subdomain: "",
    logoUrl: "",
    ownerEmail: "",
    ownerName: "",
    ownerPassword: "",
  });

  // Modal para agregar una Sucursal a una Empresa existente
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [selectedCompanyForBranch, setSelectedCompanyForBranch] = useState<Company | null>(null);
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/stores/companies`, {
        credentials: "include",
        headers: { "x-auth-scope": "admin" },
      });
      if (!res.ok) throw new Error("Error al obtener las empresas");
      const data = await res.json();
      setCompanies(data);
    } catch {
      toast.error("Hubo un error cargando las empresas.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/features/plans`, {
        credentials: "include",
        headers: { "x-auth-scope": "admin" },
      });
      if (res.ok) {
        const data = await res.json();
        setAvailablePlans(data);
      }
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
    fetchPlans();
  }, [fetchCompanies, fetchPlans]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/stores`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-scope": "admin" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.storeName,
          subdomain: formData.subdomain,
          logoUrl: formData.logoUrl,
          ownerEmail: formData.ownerEmail,
          ownerName: formData.ownerName,
          ownerPassword: formData.ownerPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear la empresa");
      }

      toast.success("Empresa y casa matriz creadas exitosamente");
      setIsModalOpen(false);
      setFormData({
        storeName: "",
        subdomain: "",
        logoUrl: "",
        ownerEmail: "",
        ownerName: "",
        ownerPassword: "",
      });
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBranch = async (
    companyId: string,
    data: { name: string; subdomain: string; address?: string; pickupSchedule?: string }
  ) => {
    try {
      setIsSubmittingBranch(true);
      const res = await fetch(`${API_URL}/stores/companies/${companyId}/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-auth-scope": "admin" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al agregar la sucursal");
      }

      toast.success("Sucursal agregada exitosamente");
      setIsBranchModalOpen(false);
      setSelectedCompanyForBranch(null);
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingBranch(false);
    }
  };

  const handleAssignPlan = async (companyId: string, planId: string | null) => {
    try {
      const res = await fetch(`${API_URL}/stores/companies/${companyId}/plan`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-auth-scope": "admin" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });
      if (!res.ok) throw new Error("Error al asignar el plan");
      toast.success("Plan de suscripción actualizado");
      fetchCompanies();
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar plan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta sucursal?")) return;
    try {
      const res = await fetch(`${API_URL}/stores/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "x-auth-scope": "admin" },
      });
      if (!res.ok) throw new Error("No se pudo eliminar la tienda");
      toast.success("Sucursal eliminada.");
      fetchCompanies();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openCreateBranchModal = (company: Company) => {
    setSelectedCompanyForBranch(company);
    setIsBranchModalOpen(true);
  };

  const closeCreateBranchModal = () => {
    setSelectedCompanyForBranch(null);
    setIsBranchModalOpen(false);
  };

  return {
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
    openCreateModal: () => setIsModalOpen(true),
    closeCreateModal: () => setIsModalOpen(false),
    // Manejo de Sucursales
    isBranchModalOpen,
    selectedCompanyForBranch,
    isSubmittingBranch,
    openCreateBranchModal,
    closeCreateBranchModal,
    handleCreateBranch,
  };
}
