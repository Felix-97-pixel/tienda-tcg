"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IconSparkles, IconStore, IconZap } from "@/components/ui/Icons";

const Header = () => {
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
          ? "bg-[#0A0D14]/90 backdrop-blur-xl border-b border-white/[0.08] py-3.5 shadow-2xl shadow-black/50"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#E10E0E] via-[#F23030] to-amber-500 flex items-center justify-center shadow-lg shadow-[#E10E0E]/25 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-lg font-mono">T</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              Tap<span className="text-red">Trade</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#E10E0E]/20 text-red border border-red/30 uppercase tracking-widest">
                TCG
              </span>
            </span>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider -mt-1 hidden sm:block">
              Plataforma & Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7 bg-white/[0.03] border border-white/[0.08] px-5 py-2 rounded-full backdrop-blur-md">
          <Link href="#marketplace" className="text-xs font-semibold text-gray-300 hover:text-white transition-colors">
            Marketplace
          </Link>
          <Link href="#pos" className="text-xs font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10E0E] animate-pulse"></span>
            POS Mostrador
          </Link>
          <Link href="#for-stores" className="text-xs font-semibold text-gray-300 hover:text-white transition-colors">
            Para Tiendas (SaaS)
          </Link>
          <Link href="#features" className="text-xs font-semibold text-gray-300 hover:text-white transition-colors">
            Características
          </Link>
          <Link href="#pricing" className="text-xs font-semibold text-gray-300 hover:text-white transition-colors">
            Planes
          </Link>
          <Link href="#faq" className="text-xs font-semibold text-gray-300 hover:text-white transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
          >
            <IconStore className="w-3.5 h-3.5 text-gray-400" />
            Acceso Tiendas
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#E10E0E] hover:bg-[#F23030] shadow-md shadow-[#E10E0E]/30 hover:shadow-lg hover:shadow-[#E10E0E]/40 active:scale-95 transition-all"
          >
            <IconSparkles className="w-3.5 h-3.5 text-white" />
            Explorar Singles
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 border border-white/10"
          aria-label="Abrir Menú"
        >
          {mobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0E121B] border-b border-white/10 px-6 py-6 mt-3 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200 shadow-2xl">
          <nav className="flex flex-col space-y-3">
            <Link
              href="#marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1"
            >
              Marketplace
            </Link>
            <Link
              href="#pos"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-[#E10E0E]"></span>
              POS Mostrador (Offline)
            </Link>
            <Link
              href="#for-stores"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1"
            >
              Para Tiendas (SaaS)
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1"
            >
              Características
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1"
            >
              Planes
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white py-1"
            >
              FAQ
            </Link>
          </nav>
          <div className="pt-4 border-t border-white/10 flex flex-col gap-2.5">
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-white/5 border border-white/10"
            >
              Acceso Tiendas
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-white bg-[#E10E0E]"
            >
              Explorar Singles
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
