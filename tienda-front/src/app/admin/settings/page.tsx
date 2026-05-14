"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";

export default function AdminSettings() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { showToast } = useToast();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [mtgDest, setMtgDest] = useState("");
  const [pokemonDest, setPokemonDest] = useState("");
  const [riftboundDest, setRiftboundDest] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/products/meta/categories`).then(res => res.json()),
      fetch(`${API_URL}/settings`).then(res => res.json())
    ])
      .then(([categoriesData, settingsData]) => {
        setCategories(categoriesData);

        const savedMtg = settingsData.mtg_sync_destination;
        const savedPokemon = settingsData.pokemon_sync_destination;
        const savedRiftbound = settingsData.riftbound_sync_destination;

        setMtgDest(savedMtg || categoriesData.find((c: any) => c.name.toLowerCase().includes("magic"))?.name || "");
        setPokemonDest(savedPokemon || categoriesData.find((c: any) => c.name.toLowerCase().includes("pokemon"))?.name || "");
        setRiftboundDest(savedRiftbound || categoriesData.find((c: any) => c.name.toLowerCase().includes("riftbound"))?.name || "");
      })
      .catch((err) => console.error("Error fetching settings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mtg_sync_destination: mtgDest,
          pokemon_sync_destination: pokemonDest,
          riftbound_sync_destination: riftboundDest,
        }),
        credentials: "include",
      });

      if (res.ok) {
        showToast(t("destinations.success") || "Configuración guardada", "success");
      } else {
        showToast(tc("error") || "Error al guardar", "error");
      }
    } catch (error) {
      showToast(tc("networkError"), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-dark-4 text-xs font-black uppercase tracking-widest animate-pulse">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-dark tracking-tight">{t("title")}</h1>
        <p className="text-dark-4 text-sm font-medium mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-1 p-8 border border-transparent hover:border-stroke transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue/10 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-dark uppercase tracking-tight">{t("destinations.title")}</h2>
                <p className="text-dark-4 text-xs font-medium">{t("destinations.subtitle")}</p>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { id: "mtg", label: t("destinations.magic"), val: mtgDest, set: setMtgDest },
                { id: "pkm", label: t("destinations.pokemon"), val: pokemonDest, set: setPokemonDest },
                { id: "rfb", label: t("destinations.riftbound"), val: riftboundDest, set: setRiftboundDest }
              ].map((item) => (
                <div key={item.id} className="group">
                  <label className="mb-2 block text-xs font-black text-dark-4 uppercase tracking-widest transition-colors group-focus-within:text-blue">
                    {item.label}
                  </label>
                  <select
                    value={item.val}
                    onChange={(e) => item.set(e.target.value)}
                    className="w-full rounded-2xl border border-stroke bg-gray-50 py-3 px-5 text-sm font-bold text-dark outline-none transition-all focus:border-blue focus:bg-white focus:ring-4 focus:ring-blue/5 appearance-none cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-stroke">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-blue text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-blue/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? "Guardando..." : t("destinations.save")}
              </button>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-dark rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue rounded-full animate-pulse"></span>
              Sincronización TCG
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-medium mb-6">
              Estas configuraciones definen a qué categorías se moverán automáticamente los productos cuando utilices la herramienta de sincronización externa.
            </p>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                Asignación inteligente
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-300">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                Actualización en tiempo real
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
