"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  skuLimit: number;
  commissionRate: string | number;
  isStandard: boolean;
  features?: any[];
}

export function useSuperAdminPlans() {
  const { showToast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    price: "0", 
    skuLimit: "-1", 
    commissionRate: "0", 
    isStandard: true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const plansRes = await fetch(`${API_URL}/features/plans`, { credentials: "include" });
      if (plansRes.ok) setPlans(await plansRes.json());
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
        isStandard: plan.isStandard !== undefined ? plan.isStandard : true,
      });
    } else {
      setEditingPlan(null);
      setFormData({ 
        name: "", 
        description: "", 
        price: "0", 
        skuLimit: "-1", 
        commissionRate: "0", 
        isStandard: true, 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPlan 
        ? `${API_URL}/features/plans/${editingPlan.id}`
        : `${API_URL}/features/plans`;
      
      const method = editingPlan ? "PATCH" : "POST";
      
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        skuLimit: parseInt(formData.skuLimit, 10),
        commissionRate: 0, // SaaS Model: Siempre 0% comisión
        isStandard: Boolean(formData.isStandard),
        featureIds: [], // Sin restricción de funciones
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
    loading,
    isModalOpen,
    editingPlan,
    formData,
    setFormData,
    handleOpenModal,
    handleCloseModal,
    handleSave,
    handleDelete
  };
}
