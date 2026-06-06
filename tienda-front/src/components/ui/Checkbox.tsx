import React from "react";

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  wrapperClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, wrapperClassName = "", className = "", ...props }, ref) => {
    return (
      <div className={`flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-stroke transition-colors hover:border-blue/50 ${wrapperClassName}`}>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className={`sr-only peer ${className}`}
            ref={ref}
            {...props}
          />
          <div className="w-11 h-6 bg-[#222630]00 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#1a1d24] after:border-white/1000 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue shadow-inner"></div>
        </label>
        {label && <span className="text-sm font-bold text-white">{label}</span>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
