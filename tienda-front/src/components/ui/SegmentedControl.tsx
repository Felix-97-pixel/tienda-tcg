"use client";
import React from "react";

export type SegmentedControlVariant = "default" | "success" | "warning" | "blue" | "neutral";

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  label: string;
  variant?: SegmentedControlVariant;
  count?: number;
  icon?: React.ReactNode;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
}

export default function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = "",
  size = "md",
  fullWidth = true,
}: SegmentedControlProps<T>) {
  const getActiveStyles = (variant: SegmentedControlVariant = "default") => {
    switch (variant) {
      case "success":
        return "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400/40";
      case "warning":
        return "bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-1 ring-amber-300/40";
      case "blue":
        return "bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400/40";
      case "neutral":
        return "bg-white/10 text-white border-white/20 shadow-sm ring-1 ring-white/10";
      case "default":
      default:
        return "bg-gradient-to-r from-red-dark to-red text-white shadow-md shadow-red/25 ring-1 ring-white/20";
    }
  };

  const paddingClasses =
    size === "sm"
      ? "px-3 py-1.5 text-xs"
      : "px-3.5 sm:px-4 py-2 text-xs";

  return (
    <div
      role="tablist"
      className={`flex items-center bg-[#080B12] p-1 sm:p-1.5 rounded-xl border border-white/10 gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none ${
        fullWidth ? "w-full" : "w-auto"
      } ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const activeStyles = getActiveStyles(option.variant || "default");

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.value)}
            className={`font-bold rounded-lg transition-all whitespace-nowrap select-none flex items-center justify-center gap-1.5 ${
              fullWidth ? "flex-1" : "flex-none"
            } ${paddingClasses} ${
              isSelected
                ? activeStyles
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            {option.icon && <span className="shrink-0">{option.icon}</span>}
            <span>{option.label}</span>
            {typeof option.count === "number" && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-white/10 text-white/60"
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
