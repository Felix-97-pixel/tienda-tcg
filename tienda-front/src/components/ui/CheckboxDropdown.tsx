"use client";
import React, { useState, useRef, useEffect } from "react";
import { IconChevronDown, IconCheck, IconSearch, IconX } from "@/components/ui/Icons";

export interface CheckboxDropdownOption {
  label: string;
  value: string;
  code?: string;
  badge?: string;
}

export interface CheckboxDropdownProps {
  label?: string;
  options: CheckboxDropdownOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  quickToggles?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

export default function CheckboxDropdown({
  label,
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Seleccionar opciones...",
  searchPlaceholder = "Buscar...",
  className = "",
  quickToggles,
}: CheckboxDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      (opt.code && opt.code.toLowerCase().includes(search.toLowerCase()))
  );

  // Texto representativo para mostrar en el input principal
  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    const selectedLabels = selectedValues
      .map((val) => options.find((o) => o.value === val)?.label)
      .filter(Boolean);

    if (selectedLabels.length === 1) return selectedLabels[0];
    if (selectedLabels.length === 2) return selectedLabels.join(", ");
    return `${selectedLabels.length} seleccionados (${selectedLabels.slice(0, 2).join(", ")}...)`;
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      {/* Botón Principal Desplegable */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-11 px-3.5 rounded-xl bg-[#0A0D14] border text-left text-xs font-semibold flex items-center justify-between gap-2 transition-all cursor-pointer ${
          isOpen
            ? "border-amber-500 ring-2 ring-amber-500/20 text-white"
            : selectedValues.length > 0
            ? "border-white/20 text-white hover:border-white/30"
            : "border-white/10 text-gray-400 hover:border-white/20"
        }`}
      >
        <span className="truncate">{getDisplayText()}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedValues.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {selectedValues.length}
            </span>
          )}
          <IconChevronDown
            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-amber-400" : ""
            }`}
          />
        </div>
      </button>

      {/* Popover / Menú Desplegable con Checkboxes */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-[260px] rounded-2xl bg-[#0E121B] border border-white/10 p-3 shadow-2xl z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          {/* Quick Toggles (si se proporcionan) */}
          {quickToggles && quickToggles.length > 0 && (
            <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-white/5 flex-wrap">
              {quickToggles.map((qt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    qt.onClick();
                  }}
                  className="px-2 py-1 rounded-lg text-[11px] font-bold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                >
                  {qt.label}
                </button>
              ))}
            </div>
          )}

          {/* Buscador dentro del dropdown */}
          {options.length > 5 && (
            <div className="relative mb-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full h-8 pl-8 pr-7 rounded-lg bg-[#0A0D14] border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-500 transition-all"
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              <IconSearch className="w-3.5 h-3.5 text-gray-500 absolute left-2.5 top-2.5 pointer-events-none" />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-white"
                >
                  <IconX className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Lista de Opciones con Checkbox */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-500 italic">
                No se encontraron opciones
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isChecked = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      isChecked
                        ? "bg-amber-500/15 text-white border border-amber-500/30"
                        : "bg-white/[0.02] text-gray-300 hover:bg-white/[0.06] hover:text-white border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Checkbox visual */}
                      <span
                        className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-all ${
                          isChecked
                            ? "bg-amber-500 border-amber-500 text-black shadow-sm"
                            : "border-white/20 bg-white/5"
                        }`}
                      >
                        {isChecked && <IconCheck className="w-3 h-3 stroke-[3]" />}
                      </span>

                      {opt.code && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-gray-400">
                          {opt.code.toUpperCase()}
                        </span>
                      )}

                      <span className="truncate">{opt.label}</span>
                    </div>

                    {opt.badge && (
                      <span className="text-[10px] text-gray-400 shrink-0 font-mono ml-2">
                        {opt.badge}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

