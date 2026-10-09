"use client";
import React from "react";
import Loader from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { useStoreProfile } from "@/app/admin/_components/hooks/useStoreProfile";
import { PenaltySlider } from "@/components/ui/PenaltySlider";

export default function DevaluationsForm() {
  const { loading, saving, formData, setFormData, saveProfile } = useStoreProfile("me");
  const [selectedGameId, setSelectedGameId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!loading && formData.supportedGames && formData.supportedGames.length > 0 && !selectedGameId) {
      setSelectedGameId(formData.supportedGames[0].id);
    }
  }, [loading, formData.supportedGames, selectedGameId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGameId) {
      await saveProfile(selectedGameId);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <Loader text="Cargando reglas..." className="min-h-[40vh] bg-transparent py-10" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      {/* Selector de Juego */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {formData.supportedGames?.length === 0 ? (
          <div className="text-red-400 text-sm py-2 px-4 bg-red-400/10 rounded-full border border-red-500/20">
            Debes configurar al menos un juego en el perfil de tu tienda.
          </div>
        ) : (
          formData.supportedGames?.map(game => (
            <button
              key={game.id}
              onClick={() => setSelectedGameId(game.id)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                selectedGameId === game.id 
                  ? "bg-blue text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue" 
                  : "bg-[#1a1d24] text-gray-4 border border-stroke hover:border-gray-5 hover:text-white"
              }`}
            >
              {game.name}
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1a1d24] rounded-3xl shadow-1 p-8 border border-transparent hover:border-stroke transition-all duration-300 space-y-6">
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Reglas de Estado</h2>
                <p className="text-xs text-gray-4 font-medium mt-1">
                  Define el porcentaje del valor base de una carta según su estado físico. 
                  <strong className="text-white ml-1">Near Mint será siempre el 100% (Base).</strong>
                </p>
              </div>
            </div>

            <div className="bg-[#111318] border border-stroke p-6 rounded-2xl space-y-4">
              {formData.devaluations && formData.devaluations.filter(d => d.gameId === selectedGameId).map((dev) => {
                const isNM = dev.conditionName.toLowerCase() === "near mint" || dev.conditionName.toLowerCase() === "near_mint" || dev.conditionName.toLowerCase() === "nm";
                const index = formData.devaluations!.findIndex(d => d.conditionId === dev.conditionId && d.gameId === selectedGameId);
                return (
                  <div key={`${dev.conditionId}-${dev.gameId}`}>
                    <PenaltySlider
                      label={dev.conditionName}
                      value={isNM ? 100 : Math.round(dev.multiplier * 100)}
                      disabled={isNM}
                      onChange={(val) => {
                        const newMult = val / 100;
                        const newDevals = [...(formData.devaluations || [])];
                        newDevals[index] = { ...dev, multiplier: newMult };
                        setFormData(prev => ({ ...prev, devaluations: newDevals }));
                      }}
                    />
                  </div>
                );
              })}

              {(!formData.devaluations?.length || !selectedGameId) && (
                <div className="text-gray-4 text-sm text-center py-4">No se encontraron condiciones configurables para este juego.</div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="w-12 h-12 rounded-2xl bg-blue/10 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Reglas de Idioma</h2>
                <p className="text-xs text-gray-4 font-medium mt-1">
                  Define el porcentaje del valor base según el idioma. Si un idioma es más caro, puedes poner más de 100% (ej: 110%).
                  <strong className="text-white ml-1">Inglés será siempre el 100% (Base).</strong>
                </p>
              </div>
            </div>

            <div className="bg-[#111318] border border-stroke p-6 rounded-2xl space-y-4">
              {formData.languageDevaluations && formData.languageDevaluations.filter(d => d.gameId === selectedGameId).map((dev) => {
                const isEnglish = dev.languageName.toLowerCase() === "english" || dev.languageName.toLowerCase() === "inglés" || dev.languageName.toLowerCase() === "ingles";
                const index = formData.languageDevaluations!.findIndex(d => d.languageId === dev.languageId && d.gameId === selectedGameId);
                return (
                  <div key={`${dev.languageId}-${dev.gameId}`}>
                    <PenaltySlider
                      label={dev.languageName}
                      value={isEnglish ? 100 : Math.round(dev.multiplier * 100)}
                      disabled={isEnglish}
                      onChange={(val) => {
                        const newMult = val / 100;
                        const newDevals = [...(formData.languageDevaluations || [])];
                        newDevals[index] = { ...dev, multiplier: newMult };
                        setFormData(prev => ({ ...prev, languageDevaluations: newDevals }));
                      }}
                    />
                  </div>
                );
              })}

              {(!formData.languageDevaluations?.length || !selectedGameId) && (
                <div className="text-gray-4 text-sm text-center py-4">No se encontraron idiomas configurables para este juego.</div>
              )}
            </div>


            <div className="flex justify-end pt-4">
              <Button type="button" onClick={handleSave} disabled={saving} className="min-w-[150px]">
                {saving ? "Guardando..." : "Guardar Reglas"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
