"use client";
import { API_URL } from "@/utils/api";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";

export default function AdminSettings() {
  const t = useTranslations("settings");
  const { showToast } = useToast();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [mtgDest, setMtgDest] = useState("");
  const [pokemonDest, setPokemonDest] = useState("");
  const [riftboundDest, setRiftboundDest] = useState("");

  useEffect(() => {
    // Fetch categories and settings in parallel
    Promise.all([
      fetch(`${API_URL}/products/meta/categories`).then(res => res.json()),
      fetch(`${API_URL}/settings`).then(res => res.json())
    ])
      .then(([categoriesData, settingsData]) => {
        setCategories(categoriesData);
        
        // Load from DB settings or set defaults
        const savedMtg = settingsData.mtg_sync_destination;
        const savedPokemon = settingsData.pokemon_sync_destination;
        const savedRiftbound = settingsData.riftbound_sync_destination;

        if (savedMtg) setMtgDest(savedMtg);
        else {
          const cat = categoriesData.find((c: any) => c.name.toLowerCase().includes("magic"));
          setMtgDest(cat ? cat.name : categoriesData[0]?.name || "");
        }

        if (savedPokemon) setPokemonDest(savedPokemon);
        else {
          const cat = categoriesData.find((c: any) => c.name.toLowerCase().includes("pokemon"));
          setPokemonDest(cat ? cat.name : categoriesData[0]?.name || "");
        }

        if (savedRiftbound) setRiftboundDest(savedRiftbound);
        else {
          const cat = categoriesData.find((c: any) => c.name.toLowerCase().includes("riftbound"));
          setRiftboundDest(cat ? cat.name : categoriesData[0]?.name || "");
        }
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  const handleSave = async () => {
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
        showToast(t("destinations.success"), "success");
      } else {
        showToast("Error al guardar la configuración", "error");
      }
    } catch (error) {
      showToast("Error de red", "error");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-dark">{t("title")}</h1>
        <p className="text-dark-4 text-sm mt-1">{t("subtitle")}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-1 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-dark">{t("destinations.title")}</h2>
            <p className="text-dark-4 text-xs mt-0.5">{t("destinations.subtitle")}</p>
          </div>
        </div>

        <div className="space-y-4 max-w-2xl">
          <div>
            <label className="mb-2 block text-sm font-medium text-dark">{t("destinations.magic")}</label>
            <select
              value={mtgDest}
              onChange={(e) => setMtgDest(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-white py-2.5 px-4 text-sm font-medium text-black outline-none transition focus:border-primary"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">{t("destinations.pokemon")}</label>
            <select
              value={pokemonDest}
              onChange={(e) => setPokemonDest(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-white py-2.5 px-4 text-sm font-medium text-black outline-none transition focus:border-primary"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-dark">{t("destinations.riftbound")}</label>
            <select
              value={riftboundDest}
              onChange={(e) => setRiftboundDest(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-white py-2.5 px-4 text-sm font-medium text-black outline-none transition focus:border-primary"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSave}
              className="rounded bg-blue py-2.5 px-6 font-medium text-white hover:bg-blue-dark transition shadow-md"
            >
              {t("destinations.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
