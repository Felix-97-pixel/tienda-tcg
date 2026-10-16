import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-xs font-medium text-white/70">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full rounded-xl border bg-[#080B12] py-2.5 px-4 text-sm text-white placeholder:text-white/30 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-red focus:border-red focus:ring-1 focus:ring-red/50" : "border-white/10 focus:border-red focus:ring-1 focus:ring-red/30"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
