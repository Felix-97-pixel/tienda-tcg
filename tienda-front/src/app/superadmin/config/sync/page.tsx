"use client";
import Loader from "@/components/ui/Loader";
import React from "react";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { Button } from "@/components/ui/Button";
import { useSuperAdminSyncDestinations } from "@/app/superadmin/_components/Config/hooks/useSuperAdminSyncDestinations";
import { IconSettings, IconCheck } from "@/components/ui/Icons";

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
    onepieceDest,
    setOnepieceDest,
    onepieceGame,
    setOnepieceGame,
    loading,
    saving,
    handleSave,
  } = useSuperAdminSyncDestinations();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader text={t("title")} className="min-h-[40vh] bg-transparent py-10" />
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
              <div className="w-12 h-12 rounded-2xl bg-blue/10 flex items-center justify-center shadow-inner text-blue">
                <IconSettings className="w-6 h-6" />
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
                { id: "rfb", label: t("destinations.riftbound"), val: riftboundDest, set: setRiftboundDest, gameVal: riftboundGame, setGame: setRiftboundGame },
                { id: "opc", label: t("destinations.onepiece"), val: onepieceDest, set: setOnepieceDest, gameVal: onepieceGame, setGame: setOnepieceGame }
              ].map((item) => (
                <div key={item.id} className="group bg-dark/50 p-4 rounded-xl border border-white/5">
                  <h3 className="text-sm font-black text-white uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue rounded-full"></span>
                    {item.label}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-xs font-bold text-gray-4 uppercase tracking-widest">
                        {t("destinations.category_label")}
                      </label>
                      <SearchableSelect
                        value={item.val}
                        onChange={item.set}
                        options={categories.map((cat) => ({ label: cat.name, value: cat.name }))}
                        placeholder={t("destinations.select_category")}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold text-gray-4 uppercase tracking-widest">
                        {t("destinations.game_label")}
                      </label>
                      <SearchableSelect
                        value={item.gameVal}
                        onChange={item.setGame}
                        options={games.map((g) => ({ label: g.name, value: g.id }))}
                        placeholder={t("destinations.select_game")}
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
              {t("destinations.tcg_sync_title")}
            </h3>
            <p className="text-xs text-gray-4 leading-relaxed font-medium mb-6">
              {t("destinations.tcg_sync_desc")}
            </p>
            <div className="p-4 rounded-2xl bg-[#1a1d24]/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-3">
                <IconCheck className="w-4 h-4 text-green-400" />
                <span>{t("destinations.smart_assignment")}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-3">
                <IconCheck className="w-4 h-4 text-green-400" />
                <span>{t("destinations.realtime_update")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}