"use client";
import React, { useState } from "react";

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  disabled = false
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedOption = options.find((o) => o.value === value);
  const displayValue = isOpen ? search : selectedOption ? selectedOption.label : "";

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()) || o.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full">
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
          // Delay closing to allow click event to register
          setTimeout(() => setIsOpen(false), 200);
        }}
        className="w-full rounded border border-stroke bg-white py-3 pl-5 pr-10 font-medium text-black outline-none transition focus:border-primary active:border-primary disabled:bg-gray-2"
      />
      {value && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange("");
            setSearch("");
            setIsOpen(false);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          title="Limpiar selección"
        >
          ✕
        </button>
      )}
      {isOpen && !disabled && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded border border-stroke bg-white shadow-default">
          {filteredOptions.length === 0 ? (
            <li className="px-5 py-3 text-sm text-gray-500">No hay resultados</li>
          ) : (
            filteredOptions.map((opt) => (
              <li
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`cursor-pointer px-5 py-3 hover:bg-gray-2 text-sm text-black ${value === opt.value ? 'bg-gray-2 font-bold' : ''}`}
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
