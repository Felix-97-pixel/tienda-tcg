"use client";
import React from "react";
import Loader from "@/components/ui/Loader";
import { Button } from "@/components/ui/Button";
import { useStoreProfile } from "@/app/admin/_components/hooks/useStoreProfile";
import { PenaltySlider } from "@/components/ui/PenaltySlider";

export default function DevaluationsForm() {
  const { loading, saving, formData, setFormData, saveProfile } = useStoreProfile("me");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        <Loader text="Cargando reglas..." className="min-h-[40vh] bg-transparent py-10" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-[#1a1d24] rounded-3xl shadow-1 p-8 border border-transparent hover:border-stroke transition-all duration-300 space-y-6">
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Reglas de Estado</h2>
                <p className="text-xs text-gray-4 font-medium mt-1">
                  Define el porcentaje de devaluación según su estado físico (ej: 5 para 5% de penalización). 
                  <strong className="text-white ml-1">Near Mint será siempre 0% de devaluación.</strong>
                </p>
              </div>
            </div>

            <div className="bg-[#111318] border border-stroke p-6 rounded-2xl space-y-4">
              {formData.devaluations && formData.devaluations.map((dev, index) => {
                const isNM = dev.conditionName.toLowerCase() === "near mint" || dev.conditionName.toLowerCase() === "near_mint" || dev.conditionName.toLowerCase() === "nm";
                return (
                  <div key={dev.conditionId}>
                    <PenaltySlider
                      label={dev.conditionName}
                      penalty={isNM ? 0 : Math.round((1 - dev.multiplier) * 100)}
                      disabled={isNM}
                      onChange={(val) => {
                        const newMult = (100 - val) / 100;
                        const newDevals = [...(formData.devaluations || [])];
                        newDevals[index] = { ...dev, multiplier: newMult };
                        setFormData(prev => ({ ...prev, devaluations: newDevals }));
                      }}
                    />
                  </div>
                );
              })}

              {!formData.devaluations?.length && (
                <div className="text-gray-4 text-sm text-center py-4">No se encontraron condiciones configurables.</div>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6 mt-8">
              <div className="w-12 h-12 rounded-2xl bg-blue/10 flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight">Reglas de Idioma</h2>
                <p className="text-xs text-gray-4 font-medium mt-1">
                  Define el porcentaje de devaluación según el idioma (ej: 5 para 5% de penalización).
                  <strong className="text-white ml-1">Inglés será siempre 0% de devaluación.</strong>
                </p>
              </div>
            </div>

            <div className="bg-[#111318] border border-stroke p-6 rounded-2xl space-y-4">
              {formData.languageDevaluations && formData.languageDevaluations.map((dev, index) => {
                const isEnglish = dev.languageName.toLowerCase() === "english" || dev.languageName.toLowerCase() === "inglés" || dev.languageName.toLowerCase() === "ingles";
                return (
                  <div key={dev.languageId}>
                    <PenaltySlider
                      label={dev.languageName}
                      penalty={isEnglish ? 0 : Math.round((1 - dev.multiplier) * 100)}
                      disabled={isEnglish}
                      onChange={(val) => {
                        const newMult = (100 - val) / 100;
                        const newDevals = [...(formData.languageDevaluations || [])];
                        newDevals[index] = { ...dev, multiplier: newMult };
                        setFormData(prev => ({ ...prev, languageDevaluations: newDevals }));
                      }}
                    />
                  </div>
                );
              })}

              {!formData.languageDevaluations?.length && (
                <div className="text-gray-4 text-sm text-center py-4">No se encontraron idiomas configurables.</div>
              )}
            </div>


            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving} className="min-w-[150px]">
                {saving ? "Guardando..." : "Guardar Reglas"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
