"use client";
import React from "react";
import { useStoreProfile } from "../../_components/hooks/useStoreProfile";
import { Button } from "@/components/ui/Button";

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
        <div className="w-8 h-8 border-4 border-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="bg-[#0E121B] p-8 rounded-2xl border border-white/10 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">Selecciona los Juegos Habilitados</h3>
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
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                    isSelected 
                      ? "bg-gradient-to-r from-red-dark to-red text-white border-red/40 shadow-md shadow-red/25 ring-1 ring-white/20" 
                      : "bg-[#080B12] text-white/60 border-white/10 hover:border-white/25 hover:text-white"
                  }`}
                >
                  {game.name}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-white/40">No hay juegos disponibles en la plataforma.</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={() => saveProfile(storeId)}
          isLoading={saving}
        >
          Guardar Cambios
        </Button>
      </div>
    </div>
  );
}
