"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import toast from "react-hot-toast";

export interface Owner {
  id: string;
  email: string;
  name: string;
}

export interface Store {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
  owner: Owner;
  balance: number;
  createdAt: string;
}

export function useSuperAdminStores() {
  const [stores, setStores] = useState<Store[]>([]);
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

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/stores`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al obtener las tiendas");
      const data = await res.json();
      setStores(data);
    } catch (error) {
      toast.error("Hubo un error cargando los dealers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

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
        headers: { "Content-Type": "application/json" },
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
        throw new Error(errorData.message || "Error al crear la tienda");
      }

      toast.success("Dealer creado exitosamente");
      setIsModalOpen(false);
      setFormData({
        storeName: "",
        subdomain: "",
        logoUrl: "",
        ownerEmail: "",
        ownerName: "",
        ownerPassword: "",
      });
      fetchStores();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta tienda? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`${API_URL}/stores/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al eliminar la tienda");
      toast.success("Tienda eliminada");
      fetchStores();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openCreateModal = () => setIsModalOpen(true);
  const closeCreateModal = () => setIsModalOpen(false);

  return {
    stores,
    loading,
    isModalOpen,
    isSubmitting,
    formData,
    fetchStores,
    handleInputChange,
    handleCreateStore,
    handleDelete,
    openCreateModal,
    closeCreateModal
  };
}
