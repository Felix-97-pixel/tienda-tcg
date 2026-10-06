"use client";
import React, { useState } from "react";

export interface CheckboxListOption {
  label: string;
  value: string;
}

interface CheckboxListProps {
  options: CheckboxListOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  label?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  maxHeight?: string;
}

export const CheckboxItem = ({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  id?: string;
}) => (
  <label
    htmlFor={id}
    className={`group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5 ${
      checked ? "text-white" : "text-gray-300"
    }`}
  >
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="peer sr-only"
    />
    <span
      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-blue/40 ${
        checked
          ? "border-blue bg-blue shadow-[0_0_10px_rgba(60,80,224,0.4)]"
          : "border-white/20 bg-[#111318] group-hover:border-blue/60"
      }`}
    >
      <svg
        className={`h-3.5 w-3.5 text-white transition-transform ${checked ? "scale-100" : "scale-0"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </span>
    <span className="select-none">{label}</span>
  </label>
);

export const CheckboxList = ({
  options = [],
  selectedValues = [],
  onChange,
  label,
  searchPlaceholder = "Buscar...",
  noResultsText = "Sin resultados",
  maxHeight = "max-h-48",
}: CheckboxListProps) => {
  const [search, setSearch] = useState("");

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (val: string, checked: boolean) => {
    onChange(checked ? [...selectedValues, val] : selectedValues.filter((v) => v !== val));
  };

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((o) => selectedValues.includes(o.value));

  const toggleAll = (checked: boolean) => {
    const filteredValues = filtered.map((o) => o.value);
    onChange(
      checked
        ? Array.from(new Set([...selectedValues, ...filteredValues]))
        : selectedValues.filter((v) => !filteredValues.includes(v))
    );
  };

  return (
    <div>
      {label && (
        <div className="mb-1 flex items-center justify-between">
          <span className="block text-sm font-medium text-gray-300">{label}</span>
          <span className="text-xs text-gray-400">
            {selectedValues.length} seleccionado{selectedValues.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111318]">
        <div className="relative border-b border-white/10">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent py-2.5 pl-9 pr-4 text-sm text-white outline-none placeholder:text-gray-500"
          />
        </div>
        <div className={`${maxHeight} overflow-y-auto p-1`}>
          {filtered.length === 0 ? (
            <p className="px-3 py-3 text-sm italic text-gray-500">{noResultsText}</p>
          ) : (
            <>
              <div className="border-b border-white/5 pb-1 mb-1">
                <CheckboxItem
                  checked={allFilteredSelected}
                  onChange={toggleAll}
                  label={<span className="font-bold">Seleccionar todos</span>}
                />
              </div>
              {filtered.map((opt) => (
                <CheckboxItem
                  key={opt.value}
                  checked={selectedValues.includes(opt.value)}
                  onChange={(c) => toggle(opt.value, c)}
                  label={opt.label}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
