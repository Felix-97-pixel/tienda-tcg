"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  IconGlobe,
  IconChevronDown,
  IconCheck,
  IconFlagES,
  IconFlagUK,
  IconFlagPT,
} from "@/components/ui/Icons";

interface LanguageOption {
  code: "es" | "en" | "pt";
  label: string;
  nativeLabel: string;
  flag: React.ReactNode;
}

const LANGUAGES: LanguageOption[] = [
  {
    code: "es",
    label: "Español",
    nativeLabel: "Español",
    flag: <IconFlagES className="w-4 h-3 rounded-xs shrink-0" />,
  },
  {
    code: "en",
    label: "English",
    nativeLabel: "English",
    flag: <IconFlagUK className="w-4 h-3 rounded-xs shrink-0" />,
  },
  {
    code: "pt",
    label: "Português",
    nativeLabel: "Português",
    flag: <IconFlagPT className="w-4 h-3 rounded-xs shrink-0" />,
  },
];

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = "",
  showLabel = true,
}) => {
  const t = useTranslations("common");
  const currentLocale = useLocale() as "es" | "en" | "pt";
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeLang =
    LANGUAGES.find((lang) => lang.code === currentLocale) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectLanguage = (code: "es" | "en" | "pt") => {
    if (code === currentLocale) {
      setIsOpen(false);
      return;
    }

    // Persistir cookie NEXT_LOCALE por 1 año
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000; SameSite=Lax`;
    setIsOpen(false);

    // Refrescar servidor para re-renderizar componentes con nuevo idioma
    router.refresh();
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t("select_language_aria")}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-all text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-red-500/50 shadow-sm"
      >
        <div className="flex items-center gap-1.5">
          {activeLang.flag}
          {showLabel && (
            <span className="uppercase tracking-wider text-[11px] font-bold">
              {activeLang.code}
            </span>
          )}
        </div>
        <IconChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={t("available_languages_aria")}
          className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[#0D111A] border border-white/15 shadow-2xl backdrop-blur-xl py-1.5 z-[99999] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-white/[0.06] mb-1 flex items-center gap-1.5">
            <IconGlobe className="w-3 h-3 text-gray-400" />
            <span>{t("language_dual_label")}</span>
          </div>

          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === currentLocale;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left ${
                  isSelected
                    ? "bg-red-500/10 text-white font-bold"
                    : "text-gray-300 hover:bg-white/5 hover:text-white font-medium"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {lang.flag}
                  <span className="text-[12px]">{lang.label}</span>
                </div>
                {isSelected ? (
                  <IconCheck className="w-3.5 h-3.5 text-red-400" />
                ) : (
                  <span className="text-[10px] uppercase font-mono text-gray-500">
                    {lang.code}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;

