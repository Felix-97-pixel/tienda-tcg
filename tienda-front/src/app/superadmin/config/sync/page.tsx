"use client";
import React from "react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { useSuperAdminSyncDestinations } from "@/app/superadmin/_components/Config/hooks/useSuperAdminSyncDestinations";

export default function AdminSettings() {
  const {
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
  } = useSuperAdminSyncDestinations();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-4 text-xs font-black uppercase tracking-widest animate-pulse">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{t("title")}</h1>
        <p className="text-gray-4 text-sm font-medium mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Settings Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a1d24] rounded-3xl shadow-1 p-8 border border-transparent hover:border-stroke transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-blue/10 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">{t("destinations.title")}</h2>
                <p className="text-gray-4 text-xs font-medium">{t("destinations.subtitle")}</p>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { id: "mtg", label: t("destinations.magic"), val: mtgDest, set: setMtgDest, gameVal: mtgGame, setGame: setMtgGame },
                { id: "pkm", label: t("destinations.pokemon"), val: pokemonDest, set: setPokemonDest, gameVal: pokemonGame, setGame: setPokemonGame },
                { id: "rfb", label: t("destinations.riftbound"), val: riftboundDest, set: setRiftboundDest, gameVal: riftboundGame, setGame: setRiftboundGame }
              ].map((item) => (
                <div key={item.id} className="group bg-dark/50 p-4 rounded-xl border border-white/5">
                  <h3 className="text-sm font-black text-white uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue rounded-full"></span>
                    {item.label}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-gray-4 uppercase tracking-widest">
                        Categoría Destino
                      </label>
                      <SearchableSelect
                        value={item.val}
                        onChange={item.set}
                        options={categories.map((cat) => ({ label: cat.name, value: cat.name }))}
                        placeholder="Selecciona Categoría"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold text-gray-4 uppercase tracking-widest">
                        Juego Principal
                      </label>
                      <SearchableSelect
                        value={item.gameVal}
                        onChange={item.setGame}
                        options={games.map((g) => ({ label: g.name, value: g.id }))}
                        placeholder="Selecciona Juego"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-stroke">
              <Button
                onClick={handleSave}
                isLoading={saving}
                fullWidth
              >
                {t("destinations.save")}
              </Button>
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-dark rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#1a1d24]/10 rounded-full blur-2xl group-hover:bg-[#1a1d24]/20 transition-all"></div>
            <h3 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue rounded-full animate-pulse"></span>
              Sincronización TCG
            </h3>
            <p className="text-xs text-gray-4 leading-relaxed font-medium mb-6">
              Estas configuraciones definen a qué categorías se moverán automáticamente los productos cuando utilices la herramienta de sincronización externa.
            </p>
            <div className="p-4 rounded-2xl bg-[#1a1d24]/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-3">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                Asignación inteligente
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-3">
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
