"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";

export function useSuperAdminExpansions() {
  const { showToast } = useToast();
  const [expansions, setExpansions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros y paginación
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [gameFilter, setGameFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [games, setGames] = useState<{id: string, name: string}[]>([]);

  // Modals
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedExpansion, setSelectedExpansion] = useState<any>(null);
  const [isAutoMapModalOpen, setIsAutoMapModalOpen] = useState(false);

  const fetchExpansions = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_URL}/expansions?page=${page}&limit=50`;
      if (gameFilter !== "all") url += `&gameId=${gameFilter}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setExpansions(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, gameFilter, search]);

  const fetchGames = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/games`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setGames(data || []);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  useEffect(() => {
    fetchExpansions();
  }, [fetchExpansions]);

  const handleLinkClick = (expansion: any) => {
    setSelectedExpansion(expansion);
    setIsLinkModalOpen(true);
  };

  const handleLinkSuccess = () => {
    setIsLinkModalOpen(false);
    setSelectedExpansion(null);
    showToast("Expansión vinculada exitosamente", "success");
    fetchExpansions();
  };

  const handleAutoMapSuccess = (mappedCount: number, remaining: number) => {
    setIsAutoMapModalOpen(false);
    if (mappedCount > 0) {
      showToast(`¡Auto-Mapeo exitoso! Se vincularon ${mappedCount} expansiones. Quedan ${remaining} pendientes.`, "success");
    } else {
      showToast(`No se encontraron coincidencias automáticas nuevas. ${remaining} expansiones siguen pendientes.`, "info");
    }
    fetchExpansions();
  };

  return {
    expansions,
    loading,
    page,
    setPage,
    totalPages,
    gameFilter,
    setGameFilter,
    search,
    setSearch,
    games,
    isLinkModalOpen,
    setIsLinkModalOpen,
    selectedExpansion,
    isAutoMapModalOpen,
    setIsAutoMapModalOpen,
    handleLinkClick,
    handleLinkSuccess,
    handleAutoMapSuccess
  };
}
