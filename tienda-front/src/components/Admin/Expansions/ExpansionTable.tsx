import React from "react";
import { Button } from "@/components/ui/Button";

interface ExpansionTableProps {
  expansions: any[];
  loading: boolean;
  onLink: (expansion: any) => void;
}

export default function ExpansionTable({ expansions, loading, onLink }: ExpansionTableProps) {
  if (loading) {
    return (
      <div className="bg-[#1a1d24] border border-white/5 rounded-2xl overflow-hidden shadow-lg p-8">
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (expansions.length === 0) {
    return (
      <div className="bg-[#1a1d24] border border-white/5 rounded-2xl p-16 text-center">
        <h3 className="text-xl font-bold text-white mb-2">No se encontraron expansiones</h3>
        <p className="text-gray-4">Intenta cambiar los filtros o los términos de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1d24] border border-white/5 rounded-2xl overflow-x-auto shadow-lg">
      <table className="w-full text-left whitespace-nowrap">
        <thead className="bg-[#0f1115]/50 border-b border-white/5 uppercase text-xs tracking-wider text-gray-4 font-semibold">
          <tr>
            <th className="px-6 py-4">Expansión</th>
            <th className="px-6 py-4">Juego</th>
            <th className="px-6 py-4">Cartas Asignadas</th>
            <th className="px-6 py-4">ID Oficial</th>
            <th className="px-6 py-4 text-center">Estado</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm text-gray-2">
          {expansions.map((exp) => (
            <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-white">{exp.name}</div>
              </td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full bg-blue/10 text-blue font-medium text-xs">
                  {exp.game}
                </span>
              </td>
              <td className="px-6 py-4 font-mono">
                {exp.productsCount}
              </td>
              <td className="px-6 py-4">
                {exp.externalId ? (
                  <span className="font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md text-xs">
                    {exp.externalId}
                  </span>
                ) : (
                  <span className="text-gray-5 font-mono text-xs">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                {exp.externalId ? (
                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Vinculado
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-xs font-semibold">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Sin Vincular
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <Button 
                  variant={exp.externalId ? "outline" : "primary"} 
                  className="px-3 py-1.5 text-xs h-auto"
                  onClick={() => onLink(exp)}
                >
                  {exp.externalId ? "Cambiar Vínculo" : "Vincular a API"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
