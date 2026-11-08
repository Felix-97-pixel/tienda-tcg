"use client";
import React, { useState, useRef, useEffect } from "react";
import { IconChevronDown } from "@/components/ui/Icons";

interface SortOption {
  value: string;
  label: string;
}

interface CustomSortDropdownProps {
  options: SortOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function CustomSortDropdown({ options, value, onChange }: CustomSortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-11 px-3.5 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-red-500/40 text-[var(--tt-text-main)] text-xs font-semibold focus:outline-none focus:border-red/60 focus:ring-1 focus:ring-red/30 cursor-pointer flex items-center justify-between gap-2.5 shadow-xs transition-all select-none"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <IconChevronDown
          className={`w-3.5 h-3.5 text-[var(--tt-text-muted)] transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-red" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-[calc(100%+6px)] w-48 bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-xl shadow-2xl py-1.5 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? "text-red font-bold bg-red-500/10"
                    : "text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

