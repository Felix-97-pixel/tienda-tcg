"use client";
import React, { useState, useEffect } from 'react';
import PosNetworkBadge from './PosNetworkBadge';
import { IconCart, IconRepeat } from '@/components/ui/Icons';

interface PosHeaderProps {
  storeName: string;
  cashierName: string;
  isShiftOpen: boolean;
  initialCash: number;
  networkStatus: {
    isOnline: boolean;
    isSimulatedOffline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    syncFeedback: string | null;
    toggleSimulatedOffline: () => void;
    triggerSync: () => void;
  };
  onOpenShiftClick: () => void;
  onCloseShiftClick: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  posMode: 'SELL' | 'BUY';
  onTogglePosMode: (mode: 'SELL' | 'BUY') => void;
}

export default function PosHeader({
  storeName,
  cashierName,
  isShiftOpen,
  initialCash,
  networkStatus,
  onOpenShiftClick,
  onCloseShiftClick,
  isFullscreen,
  onToggleFullscreen,
  posMode,
  onTogglePosMode,
}: PosHeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-CL', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0E121B] rounded-2xl border border-white/10 shadow-lg">
      {/* Información del Local y Cajero */}
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-colors ${
          posMode === 'BUY'
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
            : 'bg-red/10 border border-red/30 text-red'
        }`}>
          TT
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">
              {storeName || 'TapTrade POS'}
            </h1>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
              Terminal Mostrador
            </span>
          </div>
          <p className="text-xs text-white/50">
            Atiende:{' '}
            <span className="text-white font-medium">
              {cashierName || 'Cajero Principal'}
            </span>
          </p>
        </div>
      </div>

      {/* Switch / Interruptor Central de Modo de Operación: VENDER vs COMPRAR (Trade-in) */}
      <div className="flex items-center p-1 rounded-2xl bg-[#07090E] border border-white/10 shadow-inner">
        <button
          type="button"
          onClick={() => onTogglePosMode('SELL')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            posMode === 'SELL'
              ? 'bg-red text-white shadow-lg shadow-red/30'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <IconCart className="w-4 h-4" />
          <span>Vender Cartas</span>
        </button>

        <button
          type="button"
          onClick={() => onTogglePosMode('BUY')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            posMode === 'BUY'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400/50'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          <IconRepeat className="w-4 h-4" />
          <span>Comprar (Trade-in)</span>
        </button>
      </div>

      {/* Reloj y Estado de Red */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-mono font-bold text-white tracking-widest">
            {currentTime}
          </span>
          <span className="text-[10px] text-white/40">Hora Local (CLST)</span>
        </div>

        <PosNetworkBadge
          isOnline={networkStatus.isOnline}
          isSimulatedOffline={networkStatus.isSimulatedOffline}
          isSyncing={networkStatus.isSyncing}
          pendingCount={networkStatus.pendingCount}
          syncFeedback={networkStatus.syncFeedback}
          onToggleSimulation={networkStatus.toggleSimulatedOffline}
          onManualSync={networkStatus.triggerSync}
        />
      </div>

      {/* Control de Turno de Caja y Pantalla Completa */}
      <div className="flex items-center gap-2">
        {isShiftOpen ? (
          <button
            onClick={onCloseShiftClick}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all shadow-sm"
          >
            <span>Cerrar Caja (Arqueo)</span>
          </button>
        ) : (
          <button
            onClick={onOpenShiftClick}
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all shadow-sm"
          >
            <span>Abrir Turno de Caja</span>
          </button>
        )}

        <button
          onClick={onToggleFullscreen}
          type="button"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Modo pantalla completa'}
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isFullscreen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 4v6m0 0H4m6 0L3 3m14 7h6m0 0V4m0 6l7-7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            )}
          </svg>
        </button>
      </div>
    </header>
  );
}
