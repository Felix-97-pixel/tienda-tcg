"use client";
import React, { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import Image from "next/image";
import GameFormModal from "@/components/Admin/Games/GameFormModal";

interface Game {
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

export default function GamesConfigPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const { showToast } = useToast();

  const fetchGames = async () => {
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
  };

  useEffect(() => {
    fetchGames();
  }, []);

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
        setGames(games.map(g => g.id === game.id ? { ...g, isActive: !g.isActive } : g));
      } else {
        showToast("Error al actualizar estado", "error");
      }
    } catch (err) {
      showToast("Error de conexión", "error");
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">
            Juegos Soportados
          </h1>
          <p className="text-sm text-gray-4 mt-2">
            Administra el catálogo de juegos disponibles para las tiendas.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedGame(null);
            setIsModalOpen(true);
          }}
          className="bg-blue hover:bg-blue-dark text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue/20"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Nuevo Juego
        </button>
      </div>

      <div className="bg-[#111318] border border-stroke rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-4 text-xs font-black uppercase tracking-widest animate-pulse">Cargando juegos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stroke bg-[#0f1115]">
                  <th className="py-4 px-6 text-xs font-black text-gray-5 uppercase tracking-wider">Juego</th>
                  <th className="py-4 px-6 text-xs font-black text-gray-5 uppercase tracking-wider text-center">Tiendas</th>
                  <th className="py-4 px-6 text-xs font-black text-gray-5 uppercase tracking-wider text-center">Cartas</th>
                  <th className="py-4 px-6 text-xs font-black text-gray-5 uppercase tracking-wider text-center">Estado</th>
                  <th className="py-4 px-6 text-xs font-black text-gray-5 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {games.map((game) => (
                  <tr key={game.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0f1115] border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                          {game.logoUrl ? (
                            <Image src={game.logoUrl} alt={game.name} width={48} height={48} className="object-contain" />
                          ) : (
                            <span className="text-gray-5 font-bold uppercase">{game.name.substring(0, 2)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-base">{game.name}</p>
                          <p className="text-xs text-gray-5 font-mono mt-0.5">{game.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-xs font-bold border border-purple-500/20">
                        {game._count?.stores || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-gray-3">{game._count?.cardDetails || 0}</span>
                        <span className="text-[10px] text-gray-5 uppercase tracking-wider">en {game._count?.expansions || 0} exp</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleStatus(game)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                          game.isActive 
                            ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20" 
                            : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${game.isActive ? "bg-green-400" : "bg-red-400"}`}></span>
                        {game.isActive ? "ACTIVO" : "INACTIVO"}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedGame(game);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-blue/10 text-blue font-bold text-xs hover:bg-blue hover:text-white transition-colors"
                        title="Editar Juego"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        EDITAR
                      </button>
                    </td>
                  </tr>
                ))}
                {games.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-4">
                      No hay juegos registrados. Crea uno nuevo para comenzar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <GameFormModal
          game={selectedGame}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveGame}
        />
      )}
    </div>
  );
}
