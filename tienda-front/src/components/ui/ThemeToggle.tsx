"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/app/context/ThemeContext";
import { IconSun, IconMoon } from "@/components/ui/Icons";
import { useTranslations } from "next-intl";

interface ThemeToggleProps {
  className?: string;
  showText?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = "",
  showText = false,
}) => {
  const { theme, isLight, toggleTheme } = useTheme();
  const t = useTranslations("header");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const label = isLight ? t("theme_dark") : t("theme_light");

  if (!mounted) {
    return (
      <div
        className={`h-10 w-10 rounded-xl bg-[#111522] border border-white/10 shrink-0 ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`h-10 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center group ${
        showText
          ? "w-full justify-between px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white"
          : "w-10 bg-[#111522] border border-white/10 hover:border-red-500/40 text-gray-300 hover:text-white"
      } ${className}`}
    >
      {showText && (
        <span className="text-xs font-semibold">
          {isLight ? t("theme_mode_light") : t("theme_mode_dark")}
        </span>
      )}

      {isLight ? (
        <IconMoon className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />
      ) : (
        <IconSun className="w-5 h-5 text-amber-300 group-hover:rotate-45 transition-transform duration-200" />
      )}
    </button>
  );
};

export default ThemeToggle;

