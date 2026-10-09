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
  const [availableGames, setAvailableGames] = useState<any[]>([]);
  
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

      const [res, conditionsRes, languagesRes, gamesRes] = await Promise.all([
        fetch(getEndpoint(), { credentials: "include" }),
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
  }, [storeId, getEndpoint, showToast]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const saveProfile = async (gameId?: string) => {
    setSaving(true);
    try {
      const payload = { ...formData };
      if (payload.supportedGames) {
        payload.supportedGames = payload.supportedGames.map((g: any) => g.id) as any;
      }
      
      const res = await fetch(getEndpoint(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      let devalResOk = true;
      if (formData.devaluations && storeId === "me" && gameId) {
        const payload = formData.devaluations.filter((d: any) => d.gameId === gameId);
        const devalRes = await fetch(`${API_URL}/stores/me/devaluations`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId, devaluations: payload }),
          credentials: "include",
        });
        devalResOk = devalRes.ok;
      }

      let langDevalResOk = true;
      if (formData.languageDevaluations && storeId === "me" && gameId) {
        const payload = formData.languageDevaluations.filter((d: any) => d.gameId === gameId);
        const langDevalRes = await fetch(`${API_URL}/stores/me/language-devaluations`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId, languageDevaluations: payload }),
          credentials: "include",
        });
        langDevalResOk = langDevalRes.ok;
      }

      if (res.ok && devalResOk && langDevalResOk) {
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
    availableGames,
    saveProfile,
  };
}
