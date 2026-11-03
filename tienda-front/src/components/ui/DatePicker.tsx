"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@/components/ui/Icons";

export interface DatePickerProps {
  value?: string; // Formato estándar: "YYYY-MM-DD"
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  className?: string;
  inputClassName?: string;
  usePortal?: boolean;
}

interface DropdownCoords {
  top: number;
  bottom: number;
  left: number;
  width: number;
}

const MONTH_NAMES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const WEEKDAY_NAMES = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

export default function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha...",
  label,
  disabled = false,
  minDate,
  maxDate,
  className = "",
  inputClassName = "",
  usePortal = true,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<DropdownCoords | null>(null);

  // Parsear valor inicial o usar fecha de hoy para la navegación del calendario
  const parsedDate = useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }, [value]);

  const [navDate, setNavDate] = useState<Date>(() => parsedDate || new Date());

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar vista si cambia el valor externo
  useEffect(() => {
    if (parsedDate) {
      setNavDate(parsedDate);
    }
  }, [parsedDate]);

  const updateCoords = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
      });
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    updateCoords();

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    const handleMouseDownOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleMouseDownOutside);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleMouseDownOutside);
    };
  }, [isOpen]);

  // Formato chileno legible: DD/MM/YYYY
  const displayValue = useMemo(() => {
    if (!parsedDate) return "";
    const day = String(parsedDate.getDate()).padStart(2, "0");
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const year = parsedDate.getFullYear();
    return `${day}/${month}/${year}`;
  }, [parsedDate]);

  // Navegación de mes
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNavDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNavDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generación de días del mes
  const daysInGrid = useMemo(() => {
    const year = navDate.getFullYear();
    const month = navDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Ajustar para que la semana empiece en Lunes (0: Lu, 6: Do)
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const days = [];

    // Días del mes anterior para rellenar la primera semana
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Días del mes actual
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      });
    }

    // Días del siguiente mes para completar la cuadrícula (hasta 35 o 42 celdas)
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [navDate]);

  const handleSelectDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    onChange(`${year}-${month}-${day}`);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    onChange(`${year}-${month}-${day}`);
    setNavDate(today);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  // Posicionamiento inteligente
  const spaceBelow = typeof window !== "undefined" && coords ? window.innerHeight - coords.bottom : 350;
  const openUpwards = spaceBelow < 320;

  const calendarPopover = (
    <div
      ref={dropdownRef}
      onMouseDown={(e) => e.stopPropagation()}
      style={
        usePortal && coords
          ? {
              position: "fixed",
              top: openUpwards ? undefined : `${coords.bottom + 6}px`,
              bottom: openUpwards ? `${window.innerHeight - coords.top + 6}px` : undefined,
              left: `${coords.left}px`,
              zIndex: 99999,
              minWidth: "280px",
            }
          : undefined
      }
      className={`rounded-2xl border border-white/10 bg-[#0E121B] p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 select-none text-white ${
        !usePortal ? (openUpwards ? "absolute bottom-full mb-2" : "absolute top-full mt-2") : ""
      }`}
    >
      {/* Header del Calendario: Mes, Año y Controles */}
      <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2.5">
        <div className="text-sm font-bold text-white flex items-center gap-1.5">
          <span>{MONTH_NAMES[navDate.getMonth()]}</span>
          <span className="text-white/40 font-mono text-xs font-normal">
            {navDate.getFullYear()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Mes anterior"
          >
            <IconChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            title="Mes siguiente"
          >
            <IconChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1.5">
        {WEEKDAY_NAMES.map((name) => (
          <div key={name} className="py-1">
            {name}
          </div>
        ))}
      </div>

      {/* Cuadrícula de Días */}
      <div className="grid grid-cols-7 gap-1">
        {daysInGrid.map((item, index) => {
          const isSelected =
            parsedDate &&
            item.date.getFullYear() === parsedDate.getFullYear() &&
            item.date.getMonth() === parsedDate.getMonth() &&
            item.date.getDate() === parsedDate.getDate();

          const isToday =
            item.date.getFullYear() === new Date().getFullYear() &&
            item.date.getMonth() === new Date().getMonth() &&
            item.date.getDate() === new Date().getDate();

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectDate(item.date)}
              className={`h-8 w-8 mx-auto rounded-lg text-xs font-medium flex items-center justify-center transition-all ${
                isSelected
                  ? "bg-red text-white font-bold shadow-md shadow-red/40 scale-105"
                  : item.isCurrentMonth
                  ? "text-white/90 hover:bg-white/10 hover:text-white"
                  : "text-white/20 hover:bg-white/5 hover:text-white/40"
              } ${isToday && !isSelected ? "border border-red/40 text-red" : ""}`}
            >
              {item.date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Footer con Atajos */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-xs">
        <button
          type="button"
          onClick={handleSelectToday}
          className="text-red hover:text-red-light font-bold hover:underline transition-colors"
        >
          Hoy
        </button>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-white/40 hover:text-white transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-white/70 mb-1.5">
          {label}
        </label>
      )}

      <div
        onClick={() => {
          if (!disabled) {
            updateCoords();
            setIsOpen(!isOpen);
          }
        }}
        className={`group flex items-center justify-between w-full bg-[#141A26] border border-white/10 rounded-xl px-3.5 py-2 text-sm text-white cursor-pointer transition-colors ${
          isOpen ? "border-red ring-1 ring-red/30" : "hover:border-white/20"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${inputClassName}`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <IconCalendar
            className={`w-4 h-4 shrink-0 transition-colors ${
              isOpen ? "text-red" : "text-white/40 group-hover:text-white/70"
            }`}
          />
          <span
            className={`truncate ${
              displayValue ? "text-white font-medium" : "text-white/30"
            }`}
          >
            {displayValue || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-white/30 hover:text-white hover:bg-white/10 transition-colors"
              title="Borrar fecha"
            >
              <IconX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {isOpen && !disabled && (
        usePortal && mounted && typeof document !== "undefined"
          ? createPortal(calendarPopover, document.body)
          : calendarPopover
      )}
    </div>
  );
}

