import React from "react";
import DevaluationsForm from "./_components/DevaluationsForm";

export const metadata = {
  title: "Reglas de Degradación | TapTrade",
  description: "Configura el porcentaje de devaluación según el estado físico de la carta.",
};

export default function DevaluationsPage() {
  return (
    <div className="space-y-6 pb-24 text-white">
      <div className="pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red">Condiciones & Precios</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Reglas de Estado</h1>
        <p className="text-white/40 text-xs mt-0.5">
          Configura los porcentajes de precio automático según la condición (estado físico) de tus cartas.
        </p>
      </div>

      <DevaluationsForm />
    </div>
  );
}
