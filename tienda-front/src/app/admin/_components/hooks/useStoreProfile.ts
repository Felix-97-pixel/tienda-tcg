"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { StoreFeature, StorePlan, StoreProfileFormData } from "../types/storeProfile.types";

export function useStoreProfile(storeId: string) {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableFeatures, setAvailableFeatures] = useState<StoreFeature[]>([]);
  const [availablePlans, setAvailablePlans] = useState<StorePlan[]>([]);
  
  const [formData, setFormData] = useState<StoreProfileFormData>({
    name: "",
    logoUrl: "",
    subscriptionPlanIds: [],
    customFeatureIds: [],
    description: "",
    facebook: "",
    instagram: "",
    twitter: "",
    twitch: "",
    whatsapp: "",
    website: "",
    email: "",
    address: "",
    latitude: null,
    longitude: null,
  });

  const getEndpoint = useCallback(() => {
    return storeId === "me" ? `${API_URL}/stores/me` : `${API_URL}/stores/${storeId}/full`;
  }, [storeId]);

  const fetchStore = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch available features and plans in parallel if superadmin
      if (storeId !== "me") {
        const [featuresRes, plansRes] = await Promise.all([
          fetch(`${API_URL}/features`, { credentials: "include" }),
          fetch(`${API_URL}/features/plans`, { credentials: "include" })
        ]);
        
        if (featuresRes.ok) setAvailableFeatures(await featuresRes.json());
        if (plansRes.ok) setAvailablePlans(await plansRes.json());
      }

      const res = await fetch(getEndpoint(), { credentials: "include" });
      if (res.ok) {
        const store = await res.json();
        const s = (store.settings || []).reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});

        setFormData({
          name: store.name || "",
          logoUrl: store.logoUrl || "",
          subscriptionPlanIds: store.subscriptionPlans ? store.subscriptionPlans.map((p: any) => p.id) : [],
          customFeatureIds: store.customFeatures ? store.customFeatures.map((f: any) => f.id) : [],
          description: s.description || "",
          facebook: s.facebook || "",
          instagram: s.instagram || "",
          twitter: s.twitter || "",
          twitch: s.twitch || "",
          whatsapp: s.whatsapp || "",
          website: s.website || "",
          email: s.email || "",
          address: store.address || s.address || "",
          latitude: store.latitude || null,
          longitude: store.longitude || null,
        });
      }
    } catch (err) {
      console.error("Error fetching store:", err);
      showToast("Error al cargar perfil", "error");
    } finally {
      setLoading(false);
    }
  }, [storeId, getEndpoint, showToast]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(getEndpoint(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (res.ok) {
        showToast("Perfil de tienda guardado con éxito", "success");
      } else {
        showToast("Error al guardar el perfil", "error");
      }
    } catch (error) {
      showToast("Error de conexión", "error");
    } finally {
      setSaving(false);
    }
  };

  return {
    loading,
    saving,
    formData,
    setFormData,
    availableFeatures,
    availablePlans,
    saveProfile,
  };
}
