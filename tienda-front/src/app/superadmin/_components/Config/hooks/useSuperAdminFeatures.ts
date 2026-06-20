"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

export interface Feature {
  id: string;
  key: string;
  name: string;
  description: string;
  price: string;
}

export function useSuperAdminFeatures() {
  const { showToast } = useToast();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ key: "", name: "", description: "", price: "0" });

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/features`, { credentials: "include" });
      if (res.ok) {
        setFeatures(await res.json());
      }
    } catch (e) {
      console.error(e);
      showToast("Error al cargar features", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const handleOpenModal = (feature?: Feature) => {
    if (feature) {
      setEditingFeature(feature);
      setFormData({
        key: feature.key,
        name: feature.name,
        description: feature.description || "",
        price: feature.price ? String(feature.price) : "0",
      });
    } else {
      setEditingFeature(null);
      setFormData({ key: "", name: "", description: "", price: "0" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingFeature 
        ? `${API_URL}/features/${editingFeature.id}`
        : `${API_URL}/features`;
      
      const method = editingFeature ? "PATCH" : "POST";
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Error al guardar");
      
      showToast(editingFeature ? "Función actualizada" : "Función creada", "success");
      setIsModalOpen(false);
      fetchFeatures();
    } catch (err) {
      showToast("Hubo un error al guardar", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar esta Función?")) return;
    try {
      const res = await fetch(`${API_URL}/features/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error();
      showToast("Función eliminada", "success");
      fetchFeatures();
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  return {
    features,
    loading,
    isModalOpen,
    editingFeature,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleDelete
  };
}
