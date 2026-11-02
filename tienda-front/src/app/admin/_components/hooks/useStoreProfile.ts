"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { StoreFeature, StorePlan, StoreProfileFormData } from "../types/storeProfile.types";

export interface BranchOption {
  id: string;
  name: string;
  subdomain: string;
  isMainBranch: boolean;
  address?: string;
  logoUrl?: string | null;
}

export function useStoreProfile(storeId: string) {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableFeatures, setAvailableFeatures] = useState<StoreFeature[]>([]);
  const [availablePlans, setAvailablePlans] = useState<StorePlan[]>([]);
  const [availableGames, setAvailableGames] = useState<any[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>("");
  
  const [formData, setFormData] = useState<StoreProfileFormData>({
    name: "",
    subdomain: "",
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

  const getAuthHeaders = useCallback((extraHeaders?: Record<string, string>): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    const headers: Record<string, string> = { "x-auth-scope": "admin", ...(extraHeaders || {}) };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }, []);

  const getEndpoint = useCallback(() => {
    return storeId === "me" ? `${API_URL}/stores/me` : `${API_URL}/stores/${storeId}/full`;
  }, [storeId]);

  // Si el usuario es admin y tiene múltiples sucursales, cargar la lista de sucursales
  useEffect(() => {
    if (storeId === "me") {
      fetch(`${API_URL}/stores/me/branches`, {
        credentials: "include",
        headers: getAuthHeaders(),
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data: BranchOption[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setBranches(data);
            // Si aún no hay sucursal activa seleccionada, seleccionar la casa matriz o la primera
            if (!activeBranchId) {
              const main = data.find((b) => b.isMainBranch) || data[0];
              setActiveBranchId(main.id);
            }
          }
        })
        .catch((err) => console.error("Error al cargar sucursales:", err));
    }
  }, [storeId, getAuthHeaders]);

  const fetchStore = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch available features and plans in parallel if superadmin
      if (storeId !== "me") {
        const [featuresRes, plansRes] = await Promise.all([
          fetch(`${API_URL}/features`, { credentials: "include", headers: getAuthHeaders() }),
          fetch(`${API_URL}/features/plans`, { credentials: "include", headers: getAuthHeaders() })
        ]);
        
        if (featuresRes.ok) setAvailableFeatures(await featuresRes.json());
        if (plansRes.ok) setAvailablePlans(await plansRes.json());
      }

      const storeHeaders = getAuthHeaders(activeBranchId ? { "x-store-id": activeBranchId } : {});

      const [res, conditionsRes, languagesRes, gamesRes] = await Promise.all([
        fetch(getEndpoint(), { credentials: "include", headers: storeHeaders }),
        fetch(`${API_URL}/products/meta/conditions`),
        fetch(`${API_URL}/products/meta/languages`),
        fetch(`${API_URL}/games`)
      ]);

      let conditionsData: any[] = [];
      if (conditionsRes.ok) {
        conditionsData = await conditionsRes.json();
      }

      let languagesData: any[] = [];
      if (languagesRes.ok) {
        languagesData = await languagesRes.json();
      }

      if (gamesRes.ok) {
        const gamesList = await gamesRes.json();
        setAvailableGames(gamesList);
      }

      if (res.ok) {
        const store = await res.json();
        const s = (store.settings || []).reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {});

        const storeDevals = store.devaluations || [];
        const supportedGames = store.supportedGames || [];
        
        const mappedDevaluations: any[] = [];
        for (const game of supportedGames) {
          for (const cond of conditionsData) {
            const existing = storeDevals.find((d: any) => d.conditionId === cond.id && d.gameId === game.id);
            mappedDevaluations.push({
              conditionId: cond.id,
              conditionName: cond.displayName || cond.name,
              gameId: game.id,
              multiplier: existing ? parseFloat(existing.multiplier) : 1,
            });
          }
        }

        // Map language devaluations
        const storeLangDevals = store.languageDevaluations || [];
        const mappedLanguageDevaluations: any[] = [];
        for (const game of supportedGames) {
          for (const lang of languagesData) {
            const existing = storeLangDevals.find((d: any) => d.languageId === lang.id && d.gameId === game.id);
            mappedLanguageDevaluations.push({
              languageId: lang.id,
              languageName: lang.name,
              gameId: game.id,
              multiplier: existing ? parseFloat(existing.multiplier) : 1,
            });
          }
        }

        setFormData({
          name: store.name || "",
          subdomain: store.subdomain || "",
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
          latitude: store.latitude !== null && store.latitude !== undefined ? Number(store.latitude) : null,
          longitude: store.longitude !== null && store.longitude !== undefined ? Number(store.longitude) : null,
          supportedGames: supportedGames,
          devaluations: mappedDevaluations,
          languageDevaluations: mappedLanguageDevaluations,
        });
      }
    } catch (err) {
      console.error("Error fetching store:", err);
      showToast("Error al cargar perfil", "error");
    } finally {
      setLoading(false);
    }
  }, [storeId, activeBranchId, getEndpoint, getAuthHeaders, showToast]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const saveProfile = async (gameId?: string) => {
    setSaving(true);
    try {
      // Excluir devaluations y languageDevaluations del payload principal
      const { devaluations, languageDevaluations, ...cleanData } = formData;
      const payload: any = { ...cleanData };

      // Limpiar subdominio
      if (payload.subdomain) {
        payload.subdomain = payload.subdomain.toLowerCase().replace(/[^a-z0-9_-]/g, "");
      }

      // Si la petición es del dueño (storeId === "me"), eliminar campos que son exclusivos de SuperAdmin
      if (storeId === "me") {
        delete payload.subdomain;
        delete payload.subscriptionPlanIds;
        delete payload.customFeatureIds;
        delete payload.subscriptionDiscountType;
        delete payload.subscriptionDiscountValue;
        delete payload.subscriptionNotes;
      }

      if (payload.supportedGames && Array.isArray(payload.supportedGames)) {
        payload.supportedGames = payload.supportedGames.map((g: any) => (typeof g === "string" ? g : g.id));
      }

      // Convertir latitude / longitude si vienen vacíos o nulos
      if (payload.latitude === "" || payload.latitude === null || isNaN(Number(payload.latitude))) {
        delete payload.latitude;
      } else {
        payload.latitude = Number(payload.latitude);
      }

      if (payload.longitude === "" || payload.longitude === null || isNaN(Number(payload.longitude))) {
        delete payload.longitude;
      } else {
        payload.longitude = Number(payload.longitude);
      }
      
      const reqHeaders = getAuthHeaders({
        "Content-Type": "application/json",
        ...(activeBranchId ? { "x-store-id": activeBranchId } : {}),
      });

      const res = await fetch(getEndpoint(), {
        method: "PATCH",
        headers: reqHeaders,
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.error("Error al actualizar tienda:", errorData);
        const errMsg = Array.isArray(errorData?.message) ? errorData.message.join(", ") : errorData?.message || "Error al guardar el perfil";
        showToast(errMsg, "error");
        setSaving(false);
        return;
      }

      let devalResOk = true;
      if (formData.devaluations && storeId === "me" && gameId) {
        const payloadDeval = formData.devaluations.filter((d: any) => d.gameId === gameId);
        const devalRes = await fetch(`${API_URL}/stores/me/devaluations`, {
          method: "PATCH",
          headers: reqHeaders,
          body: JSON.stringify({ gameId, devaluations: payloadDeval }),
          credentials: "include",
        });
        devalResOk = devalRes.ok;
      }

      let langDevalResOk = true;
      if (formData.languageDevaluations && storeId === "me" && gameId) {
        const payloadLang = formData.languageDevaluations.filter((d: any) => d.gameId === gameId);
        const langDevalRes = await fetch(`${API_URL}/stores/me/language-devaluations`, {
          method: "PATCH",
          headers: reqHeaders,
          body: JSON.stringify({ gameId, languageDevaluations: payloadLang }),
          credentials: "include",
        });
        langDevalResOk = langDevalRes.ok;
      }

      if (res.ok && devalResOk && langDevalResOk) {
        showToast("Perfil de sucursal guardado con éxito", "success");
        // Refrescar lista de sucursales si el nombre o subdominio cambió
        if (storeId === "me") {
          fetch(`${API_URL}/stores/me/branches`, {
            credentials: "include",
            headers: getAuthHeaders(),
          })
            .then((r) => (r.ok ? r.json() : []))
            .then((data: BranchOption[]) => {
              if (Array.isArray(data)) setBranches(data);
            })
            .catch(() => {});
        }
      } else {
        showToast("Error al guardar devaluaciones", "error");
      }
    } catch (error) {
      console.error(error);
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
    availableGames,
    branches,
    activeBranchId,
    setActiveBranchId,
    saveProfile,
  };
}
