"use client";
import React, { useState } from "react";

interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  options: Option[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  noResultsText?: string;
  className?: string;
}

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  noResultsText = "No results",
  className = ""
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find((o) => o.value === value);
  const displayValue = isOpen ? search : selectedOption ? selectedOption.label : "";

  const filteredOptions = safeOptions.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()) || 
    o.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative w-full ${className}`}>
      <input
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onFocus={() => { 
          setIsOpen(true); 
          setSearch(""); 
        }}
        onChange={(e) => setSearch(e.target.value)}
        onBlur={() => { 
          // Delay to allow click on option
          setTimeout(() => setIsOpen(false), 200); 
        }}
        className="w-full rounded-xl border border-gray-3 bg-white py-2.5 px-4 text-sm text-dark outline-none transition focus:border-blue focus:ring-2 focus:ring-blue/20 disabled:bg-gray-2"
      />
      {isOpen && !disabled && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-stroke bg-white shadow-lg animate-in fade-in zoom-in duration-200">
          {filteredOptions.length === 0 ? (
            <li className="px-5 py-3 text-sm text-gray-500 italic">{noResultsText}</li>
          ) : (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => { 
                  onChange(opt.value); 
                  setIsOpen(false); 
                }}
                className={`cursor-pointer px-4 py-2.5 hover:bg-blue/5 text-sm text-dark transition-colors ${
                  value === opt.value ? 'bg-blue/10 font-bold text-blue' : ''
                }`}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
