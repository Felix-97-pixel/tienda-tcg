"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { IconSearch, IconCheck, IconChevronDown, IconX } from "@/components/ui/Icons";

export interface MultiOption {
  value: string;
  label: string;
  count?: number;
}

export interface MultiSearchableSelectProps {
  options: MultiOption[];
  selectedValues: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  allLabel?: string;
  disabled?: boolean;
  className?: string;
  maxVisible?: number;
}

export default function MultiSearchableSelect({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Seleccionar ediciones...",
  allLabel = "Todas las ediciones",
  disabled = false,
  className = "",
  maxVisible = 60,
}: MultiSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Set en memoria para validaciones y mutaciones en O(1)
  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!isOpen) return;

    const handleMouseDownOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDownOutside);
    return () => document.removeEventListener("mousedown", handleMouseDownOutside);
  }, [isOpen]);

  // Enfocar buscador al abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [isOpen]);

  // Filtrado memoizado de alta velocidad
  const filteredOptions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) || opt.value.toLowerCase().includes(q)
    );
  }, [options, search]);

  // Ventana de renderizado (Máximo maxVisible elementos simultáneos para 60 FPS)
  const visibleOptions = useMemo(
    () => filteredOptions.slice(0, maxVisible),
    [filteredOptions, maxVisible]
  );
  const hiddenCount = filteredOptions.length - visibleOptions.length;

  // Comprobar si todas las disponibles están seleccionadas
  const allSelected = useMemo(() => {
    if (options.length === 0) return false;
    return options.every((opt) => selectedSet.has(opt.value));
  }, [options, selectedSet]);

  const toggleOption = useCallback(
    (val: string) => {
      const next = new Set(selectedValues);
      if (next.has(val)) {
        next.delete(val);
      } else {
        next.add(val);
      }
      onChange(Array.from(next));
    },
    [selectedValues, onChange]
  );

  const handleSelectAllToggle = useCallback(() => {
    if (allSelected) {
      // Deseleccionar todas
      onChange([]);
    } else {
      // Seleccionar todas las existentes
      onChange(options.map((o) => o.value));
    }
  }, [allSelected, options, onChange]);

  const handleClearSelection = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange([]);
    },
    [onChange]
  );

  // Texto o badge en el header cerrado
  const triggerLabel = useMemo(() => {
    const count = selectedValues.length;
    if (count === 0) return placeholder;
    if (allSelected && options.length > 0) return `${allLabel} (${options.length})`;
    return `${count} ${count === 1 ? "edición seleccionada" : "ediciones seleccionadas"}`;
  }, [selectedValues.length, allSelected, options.length, allLabel, placeholder]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full select-none text-left font-sans ${className}`}
    >
      {/* Botón Disparador */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500/30 ${
          disabled
            ? "opacity-50 cursor-not-allowed bg-[var(--tt-bg-subtle)] border-[var(--tt-border-medium)] text-[var(--tt-text-muted)]"
            : isOpen
            ? "border-red-500 bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] shadow-lg shadow-red-500/10"
            : selectedValues.length > 0
            ? "border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)]"
            : "border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] text-[var(--tt-text-muted)] hover:border-[var(--tt-border-focus,rgba(255,255,255,0.2))]"
        }`}
      >
        <span className="truncate font-medium flex items-center gap-2">
          {selectedValues.length > 0 && !allSelected && (
            <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-md bg-red-500/15 text-red-500 border border-red-500/30">
              {selectedValues.length}
            </span>
          )}
          {triggerLabel}
        </span>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedValues.length > 0 && !disabled && (
            <span
              onClick={handleClearSelection}
              title="Limpiar selección"
              className="p-1 rounded-md text-[var(--tt-text-muted)] hover:text-red-400 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <IconX className="w-3.5 h-3.5" />
            </span>
          )}
          <IconChevronDown
            className={`w-4 h-4 text-[var(--tt-text-muted)] transition-transform duration-200 ${
              isOpen ? "rotate-180 text-red-500" : ""
            }`}
          />
        </div>
      </button>

      {/* Menú Flotante */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 rounded-2xl border border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] shadow-2xl backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Barra de Búsqueda */}
          <div className="p-2.5 border-b border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)]">
            <div className="relative flex items-center">
              <IconSearch className="w-4 h-4 text-[var(--tt-text-muted)] absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar edición..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] text-xs rounded-lg pl-9 pr-8 py-2 border border-[var(--tt-border-medium)] placeholder:text-[var(--tt-text-muted)] focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] p-0.5"
                >
                  <IconX className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Opción Maestra: Seleccionar todas */}
          {options.length > 0 && !search && (
            <div
              onClick={handleSelectAllToggle}
              className="flex items-center justify-between px-3.5 py-2.5 border-b border-[var(--tt-border-medium)] bg-[var(--tt-bg-subtle)]/50 hover:bg-white/5 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    allSelected
                      ? "bg-red-600 border-red-600 text-white"
                      : selectedValues.length > 0
                      ? "bg-red-600/30 border-red-500 text-white"
                      : "border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)]"
                  }`}
                >
                  {allSelected ? (
                    <IconCheck className="w-3 h-3 stroke-[3]" />
                  ) : selectedValues.length > 0 ? (
                    <span className="w-1.5 h-1.5 rounded-sm bg-white" />
                  ) : null}
                </div>
                <span className="text-xs font-bold text-[var(--tt-text-main)]">
                  {allSelected ? "Deseleccionar todas" : `Seleccionar todas (${options.length})`}
                </span>
              </div>
              <span className="text-[11px] text-[var(--tt-text-muted)] font-medium">
                {selectedValues.length} de {options.length}
              </span>
            </div>
          )}

          {/* Lista de Ediciones */}
          <div className="max-h-64 overflow-y-auto divide-y divide-[var(--tt-border-medium)]/30 custom-scrollbar">
            {visibleOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--tt-text-muted)] font-medium">
                No se encontraron ediciones coincidentes
              </div>
            ) : (
              visibleOptions.map((opt) => {
                const isChecked = selectedSet.has(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-center justify-between px-3.5 py-2 cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-red-500/10 text-[var(--tt-text-main)] hover:bg-red-500/15"
                        : "hover:bg-white/5 text-[var(--tt-text-main)]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-4 h-4 shrink-0 rounded-md border flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-red-600 border-red-600 text-white"
                            : "border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)]"
                        }`}
                      >
                        {isChecked && <IconCheck className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs truncate font-medium">{opt.label}</span>
                    </div>

                    {opt.count !== undefined && (
                      <span className="text-[11px] shrink-0 font-mono text-[var(--tt-text-muted)] bg-[var(--tt-bg-subtle)] px-2 py-0.5 rounded-full border border-[var(--tt-border-medium)]">
                        {opt.count}
                      </span>
                    )}
                  </div>
                );
              })
            )}

            {/* Aviso de lista truncada para evitar saturación del DOM */}
            {hiddenCount > 0 && (
              <div className="p-2 text-center text-[11px] text-[var(--tt-text-muted)] bg-[var(--tt-bg-subtle)]">
                +{hiddenCount} ediciones más. Escribe en el buscador para filtrar.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

