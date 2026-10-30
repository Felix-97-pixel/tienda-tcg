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

export interface Company {
  id: string;
  name: string;
  rut?: string;
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
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

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

  return {
    companies,
    loading,
    isModalOpen,
    isSubmitting,
    formData,
    handleInputChange,
    handleCreateStore,
    handleDelete,
    openCreateModal: () => setIsModalOpen(true),
    closeCreateModal: () => setIsModalOpen(false),
  };
}
