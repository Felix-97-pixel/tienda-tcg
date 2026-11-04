"use client";
import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/utils/api";
import { fetchCachedConditions, fetchCachedLanguages, fetchCachedGames } from "@/utils/metadataCache";
import { useToast } from "@/hooks/useToast";
import { StorePlan, StoreProfileFormData } from "../types/storeProfile.types";

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
  const [availablePlans, setAvailablePlans] = useState<StorePlan[]>([]);
  const [availableGames, setAvailableGames] = useState<any[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>("");
  
  const [formData, setFormData] = useState<StoreProfileFormData>({
    name: "",
    subdomain: "",
    logoUrl: "",
    subscriptionPlanIds: [],
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
    rut: "",
    legalName: "",
    taxActivity: "",
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
    return storeId === "me" ? "/stores/me" : `/stores/${storeId}/full`;
  }, [storeId]);

  // Si el usuario es admin y tiene múltiples sucursales, cargar la lista de sucursales
  useEffect(() => {
    if (storeId === "me") {
      adminFetch("/stores/me/branches")
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
  }, [storeId]);

  const fetchStore = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch available features and plans in parallel if superadmin
      if (storeId !== "me") {
        const plansRes = await adminFetch("/plans");
        if (plansRes.ok) setAvailablePlans(await plansRes.json());
      }

      const [res, conditionsData, languagesData, gamesList] = await Promise.all([
        adminFetch(getEndpoint(), {}, activeBranchId),
        fetchCachedConditions(),
        fetchCachedLanguages(),
        fetchCachedGames()
      ]);

      if (gamesList && Array.isArray(gamesList)) {
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
          rut: store.company?.rut || "",
          legalName: store.company?.legalName || store.company?.name || "",
          taxActivity: store.company?.taxActivity || "",
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
      
      const res = await adminFetch(getEndpoint(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }, activeBranchId);

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
        const devalRes = await adminFetch("/stores/me/devaluations", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gameId, devaluations: payloadDeval }),
        }, activeBranchId);
        devalResOk = devalRes.ok;
      }

      let langDevalResOk = true;
      if (formData.languageDevaluations && storeId === "me" && gameId) {
        const payloadLang = formData.languageDevaluations.filter((d: any) => d.gameId === gameId);
        const langDevalRes = await adminFetch("/stores/me/language-devaluations", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ gameId, languageDevaluations: payloadLang }),
        }, activeBranchId);
        langDevalResOk = langDevalRes.ok;
      }

      if (res.ok && devalResOk && langDevalResOk) {
        showToast("Perfil de sucursal guardado con éxito", "success");
        // Refrescar lista de sucursales si el nombre o subdominio cambió
        if (storeId === "me") {
          adminFetch("/stores/me/branches")
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
    availablePlans,
    availableGames,
    branches,
    activeBranchId,
    setActiveBranchId,
    saveProfile,
  };
}
