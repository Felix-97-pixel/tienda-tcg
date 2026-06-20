"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

export interface Feature {
  id: string;
  key: string;
  name: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  skuLimit: number;
  commissionRate: string | number;
  features: Feature[];
}

export function useSuperAdminPlans() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: "", description: "", price: "0", skuLimit: "-1", commissionRate: "0", featureIds: [] as string[] });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, featuresRes] = await Promise.all([
        fetch(`${API_URL}/features/plans`, { credentials: "include" }),
        fetch(`${API_URL}/features`, { credentials: "include" })
      ]);
      
      if (plansRes.ok) setPlans(await plansRes.json());
      if (featuresRes.ok) setAllFeatures(await featuresRes.json());
    } catch (e) {
      console.error(e);
      showToast("Error al cargar datos", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || "",
        price: plan.price ? String(plan.price) : "0",
        skuLimit: plan.skuLimit !== undefined ? String(plan.skuLimit) : "-1",
        commissionRate: plan.commissionRate ? String(Number(plan.commissionRate) * 100) : "0",
        featureIds: plan.features.map(f => f.id)
      });
    } else {
      setEditingPlan(null);
      setFormData({ name: "", description: "", price: "0", skuLimit: "-1", commissionRate: "0", featureIds: [] });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleToggleFeature = (id: string) => {
    setFormData(prev => ({
      ...prev,
      featureIds: prev.featureIds.includes(id) 
        ? prev.featureIds.filter(fId => fId !== id)
        : [...prev.featureIds, id]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPlan 
        ? `${API_URL}/features/plans/${editingPlan.id}`
        : `${API_URL}/features/plans`;
      
      const method = editingPlan ? "PATCH" : "POST";
      
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        skuLimit: parseInt(formData.skuLimit, 10),
        commissionRate: (parseFloat(formData.commissionRate) || 0) / 100
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include"
      });

      if (!res.ok) throw new Error("Error al guardar");
      
      showToast(editingPlan ? "Plan actualizado" : "Plan creado", "success");
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      showToast("Hubo un error al guardar", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este Plan?")) return;
    try {
      const res = await fetch(`${API_URL}/features/plans/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error();
      showToast("Plan eliminado", "success");
      fetchData();
    } catch {
      showToast("Error al eliminar", "error");
    }
  };

  return {
    plans,
    allFeatures,
    loading,
    isModalOpen,
    editingPlan,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
    handleToggleFeature,
    handleSave,
    handleDelete
  };
}
