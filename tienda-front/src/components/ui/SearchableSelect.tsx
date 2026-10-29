"use client";
import React, { useState } from "react";
import { IconChevronDown } from "@/components/ui/Icons";

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
  inputClassName?: string;
}

export default function SearchableSelect({
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  noResultsText = "No results",
  className = "",
  inputClassName = "",
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
          setTimeout(() => setIsOpen(false), 200); 
        }}
        className={`w-full rounded-xl border border-white/10 bg-[#080B12] py-2.5 pl-4 pr-10 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-red focus:ring-1 focus:ring-red/30 disabled:opacity-50 ${inputClassName}`}
      />
      <IconChevronDown
        size={14}
        className={`absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 transition-transform duration-200 ${
          isOpen ? "rotate-180 text-white" : ""
        }`}
      />
      {isOpen && !disabled && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-white/10 bg-[#0E121B] shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-200">
          {filteredOptions.length === 0 ? (
            <li className="px-5 py-3 text-sm text-white/40 italic">{noResultsText}</li>
          ) : (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                onClick={() => { 
                  onChange(opt.value); 
                  setIsOpen(false); 
                }}
                className={`cursor-pointer px-4 py-2.5 hover:bg-white/10 text-sm text-white/90 transition-colors ${
                  value === opt.value ? 'bg-red/15 font-bold text-red-light' : ''
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
