"use client";
import React from "react";
import SearchableSelect from "./SearchableSelect";

export interface CheckboxOption {
  label: string;
  value: string;
}

export interface CheckboxProps {
  options: CheckboxOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  badgeColor?: "blue" | "emerald";
}

export const Checkbox = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Buscar y seleccionar...",
  label,
  description,
  badgeColor = "blue",
}: CheckboxProps) => {
  
  const handleSelect = (val: string) => {
    if (val && !selectedValues.includes(val)) {
      onChange([...selectedValues, val]);
    }
  };

  const handleRemove = (val: string) => {
    onChange(selectedValues.filter(id => id !== val));
  };

  const availableOptions = options.filter(opt => !selectedValues.includes(opt.value));

  const badgeClass = badgeColor === "blue" 
    ? "bg-blue/10 text-blue border border-blue/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20";

  return (
    <div>
      {label && <label className="mb-2 block text-sm font-bold text-white">{label}</label>}
      {description && <p className="text-xs text-gray-4 mb-3">{description}</p>}
      
      <SearchableSelect
        options={availableOptions}
        value=""
        onChange={handleSelect}
        placeholder={placeholder}
      />

      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedValues.map(val => {
            const opt = options.find(o => o.value === val);
            return (
              <span 
                key={val} 
                onClick={() => handleRemove(val)} 
                className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all text-sm font-bold ${badgeClass}`}
              >
                {opt ? opt.label : val}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
