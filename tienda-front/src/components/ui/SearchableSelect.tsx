"use client";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
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
  usePortal?: boolean;
  direction?: "auto" | "down" | "up";
}

interface DropdownCoords {
  top: number;
  bottom: number;
  left: number;
  width: number;
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
  usePortal = false,
  direction = "auto",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<DropdownCoords | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find((o) => o.value === value);
  const displayValue = isOpen ? search : selectedOption ? selectedOption.label : "";

  const filteredOptions = safeOptions.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()) || 
    o.value.toLowerCase().includes(search.toLowerCase())
  );

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

    if (usePortal) {
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
    }
  }, [isOpen, usePortal]);

  // Determine direction
  const spaceBelow = typeof window !== "undefined" && coords ? window.innerHeight - coords.bottom : 300;
  const spaceAbove = coords ? coords.top : 300;
  const openUpwards = direction === "up" || (direction === "auto" && spaceBelow < 260 && spaceAbove > spaceBelow);

  const calculatedMaxHeight = Math.max(
    120,
    Math.min(240, openUpwards ? spaceAbove - 24 : spaceBelow - 24)
  );

  const dropdownList = (
    <ul
      ref={dropdownRef}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      style={
        usePortal && coords
          ? {
              position: "fixed",
              top: openUpwards ? undefined : `${coords.bottom + 4}px`,
              bottom: openUpwards ? `${window.innerHeight - coords.top + 4}px` : undefined,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: `${calculatedMaxHeight}px`,
              zIndex: 99999,
            }
          : undefined
      }
      className={`${
        usePortal ? "fixed" : "absolute w-full"
      } z-50 ${
        !usePortal ? (openUpwards ? "bottom-full mb-1" : "mt-1") : ""
      } max-h-60 overflow-auto rounded-xl border border-white/10 bg-[#0E121B] shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-200`}
    >
      {filteredOptions.length === 0 ? (
        <li className="px-5 py-3 text-sm text-white/40 italic">{noResultsText}</li>
      ) : (
        filteredOptions.map((opt) => (
          <li
            key={opt.value}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(opt.value);
              setIsOpen(false);
            }}
            onClick={(e) => {
              e.stopPropagation();
              onChange(opt.value);
              setIsOpen(false);
            }}
            className={`cursor-pointer px-4 py-2.5 hover:bg-white/10 text-sm text-white/90 transition-colors ${
              value === opt.value ? "bg-red/15 font-bold text-red-light" : ""
            }`}
          >
            {opt.label}
          </li>
        ))
      )}
    </ul>
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <input
        type="text"
        disabled={disabled}
        placeholder={placeholder}
        value={displayValue}
        onFocus={() => {
          updateCoords();
          setIsOpen(true);
          setSearch("");
        }}
        onClick={() => {
          updateCoords();
          if (!isOpen) {
            setIsOpen(true);
            setSearch("");
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setIsOpen(false);
          }
        }}
        onChange={(e) => setSearch(e.target.value)}
        onBlur={() => {
          if (!usePortal) {
            setTimeout(() => setIsOpen(false), 200);
          } else {
            setTimeout(() => {
              if (
                typeof document !== "undefined" &&
                document.activeElement &&
                !containerRef.current?.contains(document.activeElement) &&
                !dropdownRef.current?.contains(document.activeElement)
              ) {
                setIsOpen(false);
              }
            }, 150);
          }
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
        usePortal && mounted && typeof document !== "undefined"
          ? createPortal(dropdownList, document.body)
          : dropdownList
      )}
    </div>
  );
}
