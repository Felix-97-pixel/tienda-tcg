import React from "react";
import DevaluationsForm from "./_components/DevaluationsForm";

export const metadata = {
  title: "Reglas de Degradación | TapTrade",
  description: "Configura el porcentaje de devaluación según el estado físico de la carta.",
};

export default function DevaluationsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">Reglas de Estado</h1>
        <p className="text-gray-4 text-sm mt-1">
          Configura los porcentajes de precio automático según la condición (estado físico) de tus cartas.
        </p>
      </div>

      <DevaluationsForm />
    </div>
  );
}
