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
  
  let bgGradient = '';
  if (safeVal <= 100) {
    // Green up to value, Red from value to 100, empty after 100
    bgGradient = `linear-gradient(to right, #10B981 ${percent}%, #EF4444 ${percent}%, #EF4444 50%, #1e293b 50%)`;
  } else {
    // Green up to 100, Blue from 100 to value, empty after value
    bgGradient = `linear-gradient(to right, #10B981 50%, #3B82F6 50%, #3B82F6 ${percent}%, #1e293b ${percent}%)`;
  }

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
            max="200"
            disabled={disabled}
            value={safeVal}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) onChange(val);
            }}
            className="w-20 bg-[#111318] border border-stroke rounded-lg px-3 py-1.5 text-white text-right disabled:opacity-50 font-bold focus:border-blue focus:ring-1 focus:ring-blue transition-all"
          />
          <span className="text-gray-4 font-bold text-sm">%</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <div className="relative w-full flex items-center">
          {/* Center marker */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-4 bg-white/20 rounded-full z-0 pointer-events-none" />
          
          <input
            type="range"
            min="0"
            max="200"
            disabled={disabled}
            value={safeVal}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed z-10"
            style={{
              background: bgGradient
            }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] font-bold tracking-wider uppercase mt-1">
          <span className="text-red-500/70">Devaluación</span>
          <span className="text-emerald-500/70">Base (100%)</span>
          <span className="text-blue-500/70">Premium</span>
        </div>
      </div>
    </div>
  );
}
