"use client";
import React from 'react';

interface PosNetworkBadgeProps {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  syncFeedback: string | null;
  onToggleSimulation: () => void;
  onManualSync: () => void;
}

export default function PosNetworkBadge({
  isOnline,
  isSimulatedOffline,
  isSyncing,
  pendingCount,
  syncFeedback,
  onToggleSimulation,
  onManualSync,
}: PosNetworkBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Indicador de estado */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
          isSyncing
            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
            : isOnline
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isSyncing
              ? 'bg-blue-400 animate-ping'
              : isOnline
              ? 'bg-emerald-400'
              : 'bg-amber-400'
          }`}
        />
        <span>
          {isSyncing
            ? 'Sincronizando...'
            : isOnline
            ? 'En Línea'
            : 'Modo Sin Conexión'}
        </span>

        {pendingCount > 0 && (
          <button
            onClick={onManualSync}
            title="Ventas guardadas localmente. Haz clic para forzar sincronización"
            className="ml-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] hover:bg-amber-500/30 transition-colors"
          >
            {pendingCount} pendiente{pendingCount > 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* Botón de prueba de corte de red */}
      <button
        onClick={onToggleSimulation}
        type="button"
        title="Simulador de desarrollo para probar ventas sin internet"
        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
          isSimulatedOffline
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
            : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
        }`}
      >
        {isSimulatedOffline ? 'Reanudar Red' : 'Simular Corte'}
      </button>

      {/* Feedback flotante breve */}
      {syncFeedback && (
        <span className="text-[11px] text-white/50 max-w-xs truncate hidden xl:inline-block">
          {syncFeedback}
        </span>
      )}
    </div>
  );
}
