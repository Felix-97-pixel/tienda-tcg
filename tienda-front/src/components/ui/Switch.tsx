import React from "react";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  wrapperClassName?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, wrapperClassName = "", className = "", ...props }, ref) => {
    return (
      <div className={`flex items-center gap-3 p-3 bg-[#080B12] rounded-xl border border-white/10 transition-colors hover:border-white/20 ${wrapperClassName}`}>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className={`sr-only peer ${className}`}
            ref={ref}
            {...props}
          />
          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red shadow-inner"></div>
        </label>
        {label && <span className="text-sm font-bold text-white">{label}</span>}
      </div>
    );
  }
);

Switch.displayName = "Switch";
