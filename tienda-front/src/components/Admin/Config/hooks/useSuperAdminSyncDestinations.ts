"use client";
import { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/useToast";

export function useSuperAdminSyncDestinations() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const { showToast } = useToast();

  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [games, setGames] = useState<{ id: string; name: string }[]>([]);
  const [mtgDest, setMtgDest] = useState("");
  const [mtgGame, setMtgGame] = useState("");
  const [pokemonDest, setPokemonDest] = useState("");
  const [pokemonGame, setPokemonGame] = useState("");
  const [riftboundDest, setRiftboundDest] = useState("");
  const [riftboundGame, setRiftboundGame] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_URL}/products/meta/categories`, { credentials: "include" }).then(res => res.json()),
      fetch(`${API_URL}/games`, { credentials: "include" }).then(res => res.json()),
      fetch(`${API_URL}/settings`, { credentials: "include" }).then(res => res.json())
    ])
      .then(([categoriesData, gamesData, settingsData]) => {
        setCategories(categoriesData);
        setGames(gamesData);

        const savedMtg = settingsData.mtg_sync_destination;
        const savedMtgGame = settingsData.mtg_sync_game_id;
        const savedPokemon = settingsData.pokemon_sync_destination;
        const savedPokemonGame = settingsData.pokemon_sync_game_id;
        const savedRiftbound = settingsData.riftbound_sync_destination;
        const savedRiftboundGame = settingsData.riftbound_sync_game_id;

        setMtgDest(savedMtg || categoriesData.find((c: any) => c.name.toLowerCase().includes("magic"))?.name || "");
        setMtgGame(savedMtgGame || gamesData.find((g: any) => g.name.toLowerCase().includes("magic"))?.id || "");
        
        setPokemonDest(savedPokemon || categoriesData.find((c: any) => c.name.toLowerCase().includes("pokemon"))?.name || "");
        setPokemonGame(savedPokemonGame || gamesData.find((g: any) => g.name.toLowerCase().includes("pokemon"))?.id || "");
        
        setRiftboundDest(savedRiftbound || categoriesData.find((c: any) => c.name.toLowerCase().includes("riftbound"))?.name || "");
        setRiftboundGame(savedRiftboundGame || gamesData.find((g: any) => g.name.toLowerCase().includes("riftbound"))?.id || "");
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
          mtg_sync_game_id: mtgGame,
          pokemon_sync_destination: pokemonDest,
          pokemon_sync_game_id: pokemonGame,
          riftbound_sync_destination: riftboundDest,
          riftbound_sync_game_id: riftboundGame,
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

  return {
    t,
    categories,
    games,
    mtgDest,
    setMtgDest,
    mtgGame,
    setMtgGame,
    pokemonDest,
    setPokemonDest,
    pokemonGame,
    setPokemonGame,
    riftboundDest,
    setRiftboundDest,
    riftboundGame,
    setRiftboundGame,
    loading,
    saving,
    handleSave
  };
}
