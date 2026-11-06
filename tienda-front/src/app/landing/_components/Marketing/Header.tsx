"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IconSparkles, IconStore, IconMenu, IconX } from "@/components/ui/Icons";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { useTranslations } from "next-intl";

const Header = () => {
  const t = useTranslations("landing.nav");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[#0A0D14]/90 backdrop-blur-xl border-b border-white/[0.08] py-3 shadow-2xl shadow-black/50"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E10E0E] via-[#F23030] to-amber-500 flex items-center justify-center shadow-lg shadow-[#E10E0E]/25 group-hover:scale-105 transition-transform shrink-0">
            <span className="text-white font-black text-lg font-mono">T</span>
          </div>
          <div className="flex flex-col shrink-0">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
              Tap<span className="text-red">Trade</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#E10E0E]/20 text-red border border-red/30 uppercase tracking-widest">
                TCG
              </span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider -mt-1 hidden sm:block whitespace-nowrap">
              {t("tagline")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation (Protected with shrink-0 and whitespace-nowrap so text never wraps) */}
        <nav className="hidden lg:flex items-center gap-3 xl:gap-5 2xl:gap-6 bg-white/[0.03] border border-white/[0.08] px-4 xl:px-5 py-2 rounded-full backdrop-blur-md shrink-0">
          <Link
            href="#marketplace"
            className="text-xs font-semibold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
          >
            {t("marketplace")}
          </Link>
          <Link
            href="#showcase"
            className="text-xs font-semibold text-gray-300 hover:text-white transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10E0E] animate-pulse shrink-0"></span>
            {t("platform")}
          </Link>
          <Link
            href="#pos"
            className="text-xs font-semibold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
          >
            {t("pos")}
          </Link>
          <Link
            href="#for-stores"
            className="text-xs font-semibold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
          >
            {t("for_stores")}
          </Link>
          <Link
            href="#pricing"
            className="text-xs font-semibold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
          >
            {t("plans")}
          </Link>
          <Link
            href="#faq"
            className="text-xs font-semibold text-gray-300 hover:text-white transition-colors whitespace-nowrap"
          >
            {t("faq")}
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5 shrink-0">
          <LanguageSelector />
          <Link
            href="/admin/login"
            className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
          >
            <IconStore className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>{t("store_login")}</span>
          </Link>
          <Link
            href="/shop"
            className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#E10E0E] hover:bg-[#F23030] shadow-md shadow-[#E10E0E]/30 hover:shadow-lg hover:shadow-[#E10E0E]/40 active:scale-95 transition-all"
          >
            <IconSparkles className="w-3.5 h-3.5 text-white shrink-0" />
            <span>{t("explore_singles")}</span>
          </Link>
        </div>

        {/* Mobile Controls (Language + Menu Button) */}
        <div className="flex items-center gap-2 sm:hidden">
          <LanguageSelector showLabel={false} />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 shrink-0"
            aria-label={t("open_menu_aria")}
          >
            {mobileMenuOpen ? (
              <IconX className="w-5 h-5 text-gray-300" />
            ) : (
              <IconMenu className="w-5 h-5 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0E121B] border-b border-white/10 px-6 py-6 mt-3 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200 shadow-2xl">
          <div className="py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">{t("language_label")}</span>
            <LanguageSelector />
          </div>
          <nav className="flex flex-col space-y-3">
            <Link
              href="#marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1"
            >
              {t("marketplace")}
            </Link>
            <Link
              href="#showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#E10E0E]"></span>
              {t("platform")}
            </Link>
            <Link
              href="#pos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1"
            >
              {t("pos")}
            </Link>
            <Link
              href="#for-stores"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1"
            >
              {t("for_stores")}
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1"
            >
              {t("features")}
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1"
            >
              {t("plans")}
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1"
            >
              {t("faq")}
            </Link>
          </nav>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-white/5 border border-white/10"
            >
              {t("store_login")}
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-[#E10E0E]"
            >
              {t("explore_singles")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
