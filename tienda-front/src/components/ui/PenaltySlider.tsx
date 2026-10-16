import React from 'react';

interface PenaltySliderProps {
  label: string;
  value: number; // The actual percentage (e.g. 100, 90, 110)
  disabled?: boolean;
  onChange: (newValue: number) => void;
  icon?: React.ReactNode;
}

export function PenaltySlider({ label, value, disabled = false, onChange, icon }: PenaltySliderProps) {
  // Safe bounds between 0 and 200
  const safeVal = Math.max(0, Math.min(200, value));
  
  // Calculate stops for 0-200 range mapped to 0-100% css
  const percent = safeVal / 2;
  
  // Color classification based on value relative to 100% base
  let statusBadge = {
    text: "Base",
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
  };
  if (safeVal < 100) {
    statusBadge = {
      text: `-${100 - safeVal}% Deval`,
      classes: "bg-amber-500/10 text-amber-400 border-amber-500/25"
    };
  } else if (safeVal > 100) {
    statusBadge = {
      text: `+${safeVal - 100}% Premium`,
      classes: "bg-red/10 text-red border-red/25 shadow-[0_0_10px_rgba(225,14,14,0.15)]"
    };
  }

  // Dynamic gradient for track
  let bgGradient = '';
  if (safeVal < 100) {
    bgGradient = `linear-gradient(to right, #F59E0B 0%, #EAB308 ${percent}%, #131824 ${percent}%, #131824 100%)`;
  } else if (safeVal === 100) {
    bgGradient = `linear-gradient(to right, #10B981 0%, #10B981 50%, #131824 50%, #131824 100%)`;
  } else {
    bgGradient = `linear-gradient(to right, #10B981 0%, #10B981 50%, #E10E0E 50%, #E10E0E ${percent}%, #131824 ${percent}%, #131824 100%)`;
  }

  return (
    <div className={`bg-[#080B12] border border-white/10 rounded-2xl p-5 flex flex-col gap-4 transition-all ${disabled ? 'opacity-60' : 'hover:border-white/20 hover:bg-[#0A0E17]'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="text-white/40">{icon}</div>}
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm tracking-tight">{label}</span>
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadge.classes}`}>
              {statusBadge.text}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <input
              type="number"
              min="0"
              max="200"
              disabled={disabled}
              value={safeVal}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) onChange(val);
              }}
              className="w-20 bg-[#07090E] border border-white/10 rounded-xl px-3 py-1.5 text-white text-right disabled:opacity-50 font-black text-sm focus:border-red focus:ring-1 focus:ring-red/30 focus:outline-none transition-all"
            />
            <span className="absolute right-2.5 text-white/30 font-bold text-xs pointer-events-none">%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="relative w-full flex items-center py-2">
          {/* Center marker (100% Base) */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-5 bg-white/40 rounded-full z-10 pointer-events-none shadow-[0_0_6px_rgba(255,255,255,0.4)]"
            title="Base (100%)" 
          />
          
          <input
            type="range"
            min="0"
            max="200"
            disabled={disabled}
            value={safeVal}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="darkvault-range w-full h-2 rounded-lg cursor-pointer disabled:cursor-not-allowed z-20"
            style={{
              background: bgGradient
            }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] font-black tracking-wider uppercase">
          <span className="text-amber-400/80 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Devaluación (&lt;100%)
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            Base (100%)
          </span>
          <span className="text-red flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red shadow-[0_0_6px_rgba(225,14,14,0.8)]" />
            Premium (&gt;100%)
          </span>
        </div>
      </div>
    </div>
  );
}
