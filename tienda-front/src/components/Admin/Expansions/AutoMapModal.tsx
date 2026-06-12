import React, { useState } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";

interface AutoMapModalProps {
  onClose: () => void;
  onSuccess: (mappedCount: number, remaining: number) => void;
}

export default function AutoMapModal({ onClose, onSuccess }: AutoMapModalProps) {
  const { showToast } = useToast();
  const [selectedGame, setSelectedGame] = useState("Magic");
  const [loading, setLoading] = useState(false);

  const handleAutoMap = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/expansions/auto-map`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: selectedGame }),
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        onSuccess(data.mapped, data.remaining);
      } else {
        showToast("Error al auto-mapear las expansiones", "error");
      }
    } catch (err) {
      showToast("Error de red", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#111318] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0f1115]">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            Auto-Mapear Juego
          </h3>
          <button onClick={onClose} className="text-gray-4 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-3 mb-6">
            Esta herramienta buscará automáticamente todas las expansiones locales que estén <strong className="text-white">Sin Vincular</strong> y usará un algoritmo inteligente para cruzarlas con la base de datos oficial.
          </p>

          <label className="block text-sm font-medium text-gray-3 mb-2">
            Selecciona el Juego a Procesar
          </label>
          <select 
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
            className="w-full bg-[#1a1d24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
          >
            <option value="Magic">Magic: The Gathering</option>
            <option value="Pokemon">Pokémon TCG</option>
            <option value="Riftbound">Riftbound</option>
          </select>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-[#0f1115]">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAutoMap} 
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 border-purple-500"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Procesando Catálogo...
              </span>
            ) : "Comenzar Auto-Mapeo"}
          </Button>
        </div>
      </div>
    </div>
  );
}
