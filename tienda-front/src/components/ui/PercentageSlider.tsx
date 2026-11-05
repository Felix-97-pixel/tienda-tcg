"use client";
import React from 'react';

export interface PercentageSliderProps {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  badgeLabel?: string;
  variant?: 'emerald' | 'cyan' | 'amber' | 'red' | 'purple';
  suggestedValue?: number;
  suggestedLabel?: string;
  minLabel?: string;
  maxLabel?: string;
}

export function PercentageSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  icon,
  description,
  badgeLabel,
  variant = 'emerald',
  suggestedValue,
  suggestedLabel,
  minLabel,
  maxLabel,
}: PercentageSliderProps) {
  // Asegurar límites válidos
  const safeVal = Math.max(min, Math.min(max, isNaN(value) ? min : value));

  // Porcentaje para el stop del degradado de la barra
  const percent = max > min ? ((safeVal - min) / (max - min)) * 100 : 0;

  // Variantes de color y acentos
  const variantStyles = {
    emerald: {
      activeColor: '#10B981',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
      focusRing: 'focus:border-emerald-500 focus:ring-emerald-500/30',
      dot: 'bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]',
    },
    cyan: {
      activeColor: '#06B6D4',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/25',
      focusRing: 'focus:border-cyan-500 focus:ring-cyan-500/30',
      dot: 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]',
    },
    amber: {
      activeColor: '#F59E0B',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
      focusRing: 'focus:border-amber-500 focus:ring-amber-500/30',
      dot: 'bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]',
    },
    red: {
      activeColor: '#E10E0E',
      badge: 'bg-red/10 text-red border-red/25 shadow-[0_0_10px_rgba(225,14,14,0.15)]',
      focusRing: 'focus:border-red focus:ring-red/30',
      dot: 'bg-red shadow-[0_0_6px_rgba(225,14,14,0.8)]',
    },
    purple: {
      activeColor: '#A855F7',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/25',
      focusRing: 'focus:border-purple-500 focus:ring-purple-500/30',
      dot: 'bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]',
    },
  }[variant];

  const bgGradient = `linear-gradient(to right, ${variantStyles.activeColor} 0%, ${variantStyles.activeColor} ${percent}%, #131824 ${percent}%, #131824 100%)`;

  return (
    <div
      className={`bg-[#080B12] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 transition-all ${
        disabled ? 'opacity-60' : 'hover:border-white/20 hover:bg-[#0A0E17]'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {icon && <div className="flex-shrink-0">{icon}</div>}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">
              {label}
            </span>
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${variantStyles.badge}`}
            >
              {badgeLabel || `${safeVal}%`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative flex items-center">
            <input
              type="number"
              min={min}
              max={max}
              disabled={disabled}
              value={safeVal}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) onChange(Math.max(min, Math.min(max, val)));
              }}
              className={`w-20 bg-[#07090E] border border-white/10 rounded-xl px-3 py-1.5 text-white text-right disabled:opacity-50 font-black text-sm ${variantStyles.focusRing} focus:ring-1 focus:outline-none transition-all`}
            />
            <span className="absolute right-2.5 text-white/30 font-bold text-xs pointer-events-none">
              %
            </span>
          </div>
        </div>
      </div>

      {description && (
        <p className="text-[11px] text-white/40 -mt-1 font-medium">{description}</p>
      )}

      <div className="flex flex-col gap-1.5 pt-1">
        <div className="relative w-full flex items-center py-1.5">
          {suggestedValue !== undefined && max > min && (
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-white/50 rounded-full z-10 pointer-events-none shadow-[0_0_6px_rgba(255,255,255,0.4)]"
              style={{ left: `${((suggestedValue - min) / (max - min)) * 100}%` }}
              title={`Sugerido (${suggestedValue}%)`}
            />
          )}

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            value={safeVal}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="darkvault-range w-full h-2 rounded-lg cursor-pointer disabled:cursor-not-allowed z-20"
            style={{
              background: bgGradient,
            }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-black tracking-wider uppercase text-white/40">
          <span>{minLabel || `${min}% Mínimo`}</span>
          {suggestedLabel && (
            <span className="text-white/70 flex items-center gap-1 font-semibold">
              <span className={`w-1.5 h-1.5 rounded-full ${variantStyles.dot}`} />
              {suggestedLabel}
            </span>
          )}
          <span>{maxLabel || `${max}% Máximo`}</span>
        </div>
      </div>
    </div>
  );
}

