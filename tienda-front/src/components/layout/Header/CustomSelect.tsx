"use client";
import React, { useState, useEffect, useRef } from "react";

interface CustomSelectProps {
  options: any[];
  value?: string;
  onChange?: (option: any) => void;
}

const CustomSelect = ({ options, value, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultOption = options?.[0] || { name: "Todas las categorías" };
  const [selectedOption, setSelectedOption] = useState<any>(defaultOption);

  useEffect(() => {
    if (value && options && options.length > 0) {
      const match = options.find((opt) => opt.name === value || opt.slug === value);
      if (match) {
        setSelectedOption(match);
        return;
      }
    }
    if (options && options.length > 0) {
      setSelectedOption(options[0]);
    }
  }, [value, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (option: any) => {
    setSelectedOption(option);
    onChange?.(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-[150px] sm:w-[185px] flex-shrink-0">
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center justify-between gap-1.5 w-full text-left cursor-pointer text-xs font-semibold py-2.5 pl-3 pr-2 text-white hover:text-white transition-colors select-none rounded-l-xl focus:outline-none"
        title={selectedOption?.name || "Categorías"}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate max-w-[125px] sm:max-w-[155px]">
          {selectedOption?.name || "Todas las categorías"}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-red" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] w-[220px] sm:w-[240px] bg-[#0E121B] border border-white/15 rounded-xl shadow-2xl shadow-black/90 py-1.5 z-[100] max-h-72 overflow-y-auto backdrop-blur-xl">
          {options.map((option, idx) => {
            const isCurrent =
              (selectedOption?.name || "Todas las categorías") === option.name;
            return (
              <button
                key={option.id || option.name || idx}
                type="button"
                onClick={() => handleOptionClick(option)}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                  isCurrent
                    ? "text-red font-bold bg-white/[0.08]"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="truncate">{option.name}</span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-red shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
