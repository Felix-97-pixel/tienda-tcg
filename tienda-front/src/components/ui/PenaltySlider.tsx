import React from 'react';

interface PenaltySliderProps {
  label: string;
  penalty: number;
  disabled?: boolean;
  onChange: (newPenalty: number) => void;
  icon?: React.ReactNode;
}

export function PenaltySlider({ label, penalty, disabled = false, onChange, icon }: PenaltySliderProps) {
  // Safe bounds
  const safePenalty = Math.max(0, Math.min(100, penalty));
  const retained = 100 - safePenalty;

  return (
    <div className={`bg-[#161920] border border-stroke rounded-2xl p-5 flex flex-col gap-4 transition-all ${disabled ? 'opacity-50 grayscale' : 'hover:border-blue/50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="text-gray-4">{icon}</div>}
          <span className="font-bold text-white text-base">{label}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="100"
            disabled={disabled}
            value={safePenalty}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) onChange(val);
            }}
            className="w-20 bg-[#111318] border border-stroke rounded-lg px-3 py-1.5 text-white text-right disabled:opacity-50 font-bold focus:border-blue focus:ring-1 focus:ring-blue transition-all"
          />
          <span className="text-gray-4 font-bold text-sm">%</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-emerald-400 w-16">Conserva</span>
          <input
            type="range"
            min="0"
            max="100"
            disabled={disabled}
            value={retained}
            onChange={(e) => {
              const newRetained = parseFloat(e.target.value);
              onChange(100 - newRetained);
            }}
            className="flex-1 h-2 bg-red-500/20 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: `linear-gradient(to right, #10B981 ${retained}%, #EF4444 ${retained}%)`
            }}
          />
          <span className="text-xs font-semibold text-red-500 w-16 text-right">Penalidad</span>
        </div>
        <div className="flex justify-between text-[10px] font-bold tracking-wider uppercase">
          <span className="text-emerald-500/70">{retained}%</span>
          <span className="text-red-500/70">-{safePenalty}%</span>
        </div>
      </div>
    </div>
  );
}
