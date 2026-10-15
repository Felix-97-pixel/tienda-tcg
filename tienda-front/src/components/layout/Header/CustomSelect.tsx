import React, { useState, useEffect } from "react";

interface CustomSelectProps {
  options: any[];
  onChange?: (option: any) => void;
}

const CustomSelect = ({ options, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options?.[0]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: any) => {
    setSelectedOption(option);
    onChange?.(option);
    setIsOpen(false);
  };

  useEffect(() => {
    if (options && options.length > 0) {
      setSelectedOption(options[0]);
    }
  }, [options]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest(".dropdown-content")) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="dropdown-content custom-select relative w-[140px] sm:w-[190px] flex-shrink-0">
      <div
        className={`select-selected whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer text-xs font-semibold py-2 px-3 text-white ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
        title={selectedOption?.name}
      >
        {selectedOption?.name || "Categorías"}
      </div>
      <div className={`select-items absolute left-0 top-full mt-1 w-full bg-[#111522] border border-white/10 rounded-xl shadow-2xl py-1 z-50 max-h-60 overflow-y-auto ${isOpen ? "block" : "hidden"}`}>
        {options.map((option, idx) => (
          <div
            key={option.id || option.name || idx}
            onClick={() => handleOptionClick(option)}
            className={`px-3 py-2 text-xs hover:bg-white/10 cursor-pointer transition-colors ${
              selectedOption?.name === option.name ? "text-red-400 font-bold bg-white/5" : "text-gray-300"
            }`}
          >
            {option.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
