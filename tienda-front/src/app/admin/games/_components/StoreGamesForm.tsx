"use client";
import React from "react";
import { useStoreProfile } from "../../_components/hooks/useStoreProfile";

interface StoreGamesFormProps {
  storeId: string;
}

export default function StoreGamesForm({ storeId }: StoreGamesFormProps) {
  const {
    loading,
    saving,
    formData,
    setFormData,
    availableGames,
    saveProfile,
  } = useStoreProfile(storeId);

  if (loading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-[#111318] p-6 rounded-2xl border border-stroke">
        <div className="flex flex-wrap gap-3">
          {availableGames?.length > 0 ? (
            availableGames.map(game => {
              const isSelected = formData.supportedGames?.some(g => g.id === game.id);
              return (
                <button
                  key={game.id}
                  type="button"
                  onClick={() => {
                    const newGames = isSelected
                      ? (formData.supportedGames || []).filter(g => g.id !== game.id)
                      : [...(formData.supportedGames || []), { id: game.id, name: game.name }];
                    setFormData({ ...formData, supportedGames: newGames });
                  }}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                    isSelected 
                      ? "bg-blue text-white border-blue shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                      : "bg-[#1a1d24] text-gray-4 border-stroke hover:border-gray-5 hover:text-white"
                  }`}
                >
                  {game.name}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-gray-5">No hay juegos disponibles en la plataforma.</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={() => saveProfile(storeId)}
          disabled={saving}
          className="px-6 py-2 rounded-xl bg-blue hover:bg-blue-dark text-white font-bold transition-all disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </div>
  );
}
