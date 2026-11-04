"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { adminLogout } from "@/redux/features/admin-auth-slice";
import { API_URL } from "@/utils/api";
import { TargetUserToEdit } from "../EditUserCredentialsModal";
import toast from "react-hot-toast";

export interface BranchMember {
  id: string;
  role: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Branch {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string | null;
  isMainBranch: boolean;
  address?: string;
  balance: number;
  members?: BranchMember[];
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
  rut?: string | null;
  logoUrl?: string | null;
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
  const router = useRouter();
  const dispatch = useDispatch();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal para crear nueva Empresa (Holding + Casa Matriz)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyRut: "",
    companyLogoUrl: "",
    storeName: "",
    subdomain: "",
    logoUrl: "",
    address: "",
    ownerEmail: "",
    ownerName: "",
    ownerPassword: "",
  });

  // Modal para agregar una Sucursal a una Empresa existente
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [selectedCompanyForBranch, setSelectedCompanyForBranch] = useState<Company | null>(null);
  const [isSubmittingBranch, setIsSubmittingBranch] = useState(false);

  // Modal para gestionar usuarios corporativos de Empresa
  const [isCompanyUsersModalOpen, setIsCompanyUsersModalOpen] = useState(false);
  const [selectedCompanyForUsers, setSelectedCompanyForUsers] = useState<Company | null>(null);

  // Modal para editar credenciales de usuario
  const [isEditCredentialsModalOpen, setIsEditCredentialsModalOpen] = useState(false);
  const [targetUserForCredentials, setTargetUserForCredentials] = useState<TargetUserToEdit | null>(null);

  // Modal para gestionar personal de Sucursal
  const [isStoreUsersModalOpen, setIsStoreUsersModalOpen] = useState(false);
  const [selectedBranchForUsers, setSelectedBranchForUsers] = useState<Branch | null>(null);

  const getAuthHeaders = (extraHeaders?: Record<string, string>): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    const headers: Record<string, string> = { "x-auth-scope": "admin", ...(extraHeaders || {}) };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const handleUnauthorized = useCallback(() => {
    dispatch(adminLogout());
    toast.error("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
    router.push("/admin/login");
  }, [dispatch, router]);

  const fetchCompanies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/stores/companies`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (!res.ok) throw new Error("Error al obtener las empresas");
      const data = await res.json();
      setCompanies(data);
    } catch (err: any) {
      if (err.message !== "Error al obtener las empresas") {
        toast.error("Hubo un error cargando las empresas.");
      }
    } finally {
      setLoading(false);
    }
  }, [handleUnauthorized]);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/features/plans`, {
        credentials: "include",
        headers: getAuthHeaders(),
      });
      if (res.status === 401) {
        handleUnauthorized();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setAvailablePlans(data);
      }
    } catch {
      // silent
    }
  }, [handleUnauthorized]);

  useEffect(() => {
    fetchCompanies();
    fetchPlans();
  }, [fetchCompanies, fetchPlans]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "subdomain") {
      setFormData((prev) => ({ ...prev, subdomain: value.toLowerCase().replace(/[^a-z0-9_-]/g, "") }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCompanyName = formData.companyName || formData.storeName;
    const finalStoreName = formData.storeName || formData.companyName;

    if (!finalCompanyName) {
      toast.error("Ingresa el nombre de la empresa");
      return;
    }
    if (!formData.subdomain || !formData.ownerEmail || !formData.ownerPassword) {
      toast.error("Completa todos los campos requeridos");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/stores`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({
          companyName: finalCompanyName,
          companyRut: formData.companyRut || null,
          companyLogoUrl: formData.companyLogoUrl || null,
          storeName: finalStoreName,
          name: finalStoreName,
          subdomain: formData.subdomain,
          logoUrl: formData.logoUrl || formData.companyLogoUrl || null,
          address: formData.address || null,
          ownerEmail: formData.ownerEmail,
          ownerName: formData.ownerName,
          ownerPassword: formData.ownerPassword,
        }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al crear la empresa");
      }

      toast.success("Empresa y casa matriz creadas exitosamente");
      setIsModalOpen(false);
      setFormData({
        companyName: "",
        companyRut: "",
        companyLogoUrl: "",
        storeName: "",
        subdomain: "",
        logoUrl: "",
        address: "",
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
    data: { name: string; subdomain: string; logoUrl?: string; address?: string; pickupSchedule?: string }
  ) => {
    try {
      setIsSubmittingBranch(true);
      const res = await fetch(`${API_URL}/stores/companies/${companyId}/branches`, {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

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
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        credentials: "include",
        body: JSON.stringify({ planId }),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

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
        headers: getAuthHeaders(),
      });

      if (res.status === 401) {
        handleUnauthorized();
        return;
      }

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

  const openCompanyUsersModal = (company: Company) => {
    setSelectedCompanyForUsers(company);
    setIsCompanyUsersModalOpen(true);
  };

  const closeCompanyUsersModal = () => {
    setSelectedCompanyForUsers(null);
    setIsCompanyUsersModalOpen(false);
  };

  const openStoreUsersModal = (branch: Branch) => {
    setSelectedBranchForUsers(branch);
    setIsStoreUsersModalOpen(true);
  };

  const openEditCredentialsModal = (targetUser: TargetUserToEdit) => {
    setTargetUserForCredentials(targetUser);
    setIsEditCredentialsModalOpen(true);
  };

  const closeEditCredentialsModal = () => {
    setTargetUserForCredentials(null);
    setIsEditCredentialsModalOpen(false);
  };

  const closeStoreUsersModal = () => {
    setSelectedBranchForUsers(null);
    setIsStoreUsersModalOpen(false);
  };

  return {
    companies,
    availablePlans,
    loading,
    refreshCompanies: fetchCompanies,
    isModalOpen,
    isSubmitting,
    formData,
    setFormData,
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
    // Gestión de Usuarios
    isCompanyUsersModalOpen,
    selectedCompanyForUsers,
    openCompanyUsersModal,
    closeCompanyUsersModal,
    isStoreUsersModalOpen,
    selectedBranchForUsers,
    openStoreUsersModal,
    closeStoreUsersModal,
    isEditCredentialsModalOpen,
    targetUserForCredentials,
    openEditCredentialsModal,
    closeEditCredentialsModal,
  };
}
