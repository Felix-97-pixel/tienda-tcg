"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

export interface Game {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  isActive: boolean;
  _count?: {
    expansions: number;
    cardDetails: number;
    stores: number;
  };
}

export function useSuperAdminGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const { showToast } = useToast();

  const fetchGames = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/games`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setGames(data);
      } else {
        showToast("Error al cargar juegos", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const handleSaveGame = async (data: Partial<Game>) => {
    try {
      const url = selectedGame ? `${API_URL}/games/${selectedGame.id}` : `${API_URL}/games`;
      const method = selectedGame ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (res.ok) {
        showToast(`Juego ${selectedGame ? "actualizado" : "creado"} correctamente`, "success");
        fetchGames();
        setIsModalOpen(false);
      } else {
        const err = await res.json();
        showToast(err.message || "Error al guardar el juego", "error");
        throw new Error(err.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleToggleStatus = async (game: Game) => {
    try {
      const res = await fetch(`${API_URL}/games/${game.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !game.isActive }),
        credentials: "include",
      });
      if (res.ok) {
        showToast(`Estado de ${game.name} actualizado`, "success");
        setGames(prev => prev.map(g => g.id === game.id ? { ...g, isActive: !g.isActive } : g));
      } else {
        showToast("Error al actualizar estado", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    }
  };

  const openModalForNew = () => {
    setSelectedGame(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (game: Game) => {
    setSelectedGame(game);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return {
    games,
    loading,
    isModalOpen,
    selectedGame,
    handleSaveGame,
    handleToggleStatus,
    openModalForNew,
    openModalForEdit,
    closeModal
  };
}
