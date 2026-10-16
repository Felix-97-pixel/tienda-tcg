import React from "react";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, placeholder, error, className = "", ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full rounded-xl border bg-[#080B12] py-2.5 px-3 text-sm text-white outline-none transition ${
          error ? "border-red focus:border-red" : "border-white/10 focus:border-red"
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = "Select";
