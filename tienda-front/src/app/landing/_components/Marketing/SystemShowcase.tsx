"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  IconBox,
  IconPosTerminal,
  IconTag,
  IconBarChart,
  IconLock,
  IconZap,
  IconCheckCircle,
  IconShieldCheck,
  IconStore,
  IconReceipt,
  IconSparkles,
} from "@/components/ui/Icons";

interface ShowcaseTab {
  id: "inventory" | "pos" | "buylist" | "dashboard" | "shield" | "accounting";
  title: string;
  shortLabel: string;
  badge: string;
  headline: string;
  description: string;
  imageSrc: string;
  simulatedUrl: string;
  glowColor: string;
  accentBadgeColor: string;
  features: {
    title: string;
    description: string;
  }[];
  floatingHighlights: {
    top: string;
    left?: string;
    right?: string;
    label: string;
    sublabel: string;
  }[];
  metrics: {
    value: string;
    label: string;
  }[];
}

export default function SystemShowcase() {
  const t = useTranslations("landing.showcase");
  const [activeTabId, setActiveTabId] = useState<ShowcaseTab["id"]>("inventory");

  const showcaseTabs: ShowcaseTab[] = [
    {
      id: "inventory",
      title: t("tabs.inventory.title"),
      shortLabel: t("tabs.inventory.shortLabel"),
      badge: t("tabs.inventory.badge"),
      headline: t("tabs.inventory.headline"),
      description: t("tabs.inventory.desc"),
      imageSrc: "/images/showcase/showcase-inventory.png",
      simulatedUrl: "taptrade.cl/admin/products",
      glowColor: "from-blue-600/20 via-indigo-600/10 to-transparent",
      accentBadgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      features: [
        {
          title: t("tabs.inventory.f1_title"),
          description: t("tabs.inventory.f1_desc"),
        },
        {
          title: t("tabs.inventory.f2_title"),
          description: t("tabs.inventory.f2_desc"),
        },
        {
          title: t("tabs.inventory.f3_title"),
          description: t("tabs.inventory.f3_desc"),
        },
      ],
      floatingHighlights: [
        {
          top: "16%",
          left: "24%",
          label: "Sync Oficial Scryfall",
          sublabel: "Metadata y arte HD automático",
        },
        {
          top: "44%",
          right: "8%",
          label: "Badges de Foil & Idioma",
          sublabel: "Filtros precisos para coleccionistas",
        },
      ],
      metrics: [
        { value: t("tabs.inventory.m1_val"), label: t("tabs.inventory.m1_lbl") },
        { value: t("tabs.inventory.m2_val"), label: t("tabs.inventory.m2_lbl") },
        { value: t("tabs.inventory.m3_val"), label: t("tabs.inventory.m3_lbl") },
      ],
    },
    {
      id: "pos",
      title: t("tabs.pos.title"),
      shortLabel: t("tabs.pos.shortLabel"),
      badge: t("tabs.pos.badge"),
      headline: t("tabs.pos.headline"),
      description: t("tabs.pos.desc"),
      imageSrc: "/images/showcase/showcase-pos.png",
      simulatedUrl: "taptrade.cl/admin/pos",
      glowColor: "from-red-600/20 via-rose-600/10 to-transparent",
      accentBadgeColor: "bg-red-500/20 text-[#FF5555] border-red-500/30",
      features: [
        {
          title: t("tabs.pos.f1_title"),
          description: t("tabs.pos.f1_desc"),
        },
        {
          title: t("tabs.pos.f2_title"),
          description: t("tabs.pos.f2_desc"),
        },
        {
          title: t("tabs.pos.f3_title"),
          description: t("tabs.pos.f3_desc"),
        },
      ],
      floatingHighlights: [
        {
          top: "22%",
          left: "30%",
          label: "IndexedDB Local",
          sublabel: "Opera sin internet a <5ms",
        },
        {
          top: "52%",
          right: "12%",
          label: "Cobro Ultra-Rápido [F10]",
          sublabel: "Efectivo, Débito o Crédito en Tienda",
        },
      ],
      metrics: [
        { value: t("tabs.pos.m1_val"), label: t("tabs.pos.m1_lbl") },
        { value: t("tabs.pos.m2_val"), label: t("tabs.pos.m2_lbl") },
        { value: t("tabs.pos.m3_val"), label: t("tabs.pos.m3_lbl") },
      ],
    },
    {
      id: "buylist",
      title: t("tabs.buylist.title"),
      shortLabel: t("tabs.buylist.shortLabel"),
      badge: t("tabs.buylist.badge"),
      headline: t("tabs.buylist.headline"),
      description: t("tabs.buylist.desc"),
      imageSrc: "/images/showcase/showcase-buylist.png",
      simulatedUrl: "taptrade.cl/admin/buylist",
      glowColor: "from-amber-500/20 via-yellow-600/10 to-transparent",
      accentBadgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      features: [
        {
          title: t("tabs.buylist.f1_title"),
          description: t("tabs.buylist.f1_desc"),
        },
        {
          title: t("tabs.buylist.f2_title"),
          description: t("tabs.buylist.f2_desc"),
        },
        {
          title: t("tabs.buylist.f3_title"),
          description: t("tabs.buylist.f3_desc"),
        },
      ],
      floatingHighlights: [
        {
          top: "20%",
          left: "22%",
          label: "Grading TCG Automático",
          sublabel: "Multiplicadores por estado NM/LP/MP",
        },
        {
          top: "48%",
          right: "14%",
          label: "Store Credit Integrado",
          sublabel: "Retiene el capital dentro de tu tienda",
        },
      ],
      metrics: [
        { value: t("tabs.buylist.m1_val"), label: t("tabs.buylist.m1_lbl") },
        { value: t("tabs.buylist.m2_val"), label: t("tabs.buylist.m2_lbl") },
        { value: t("tabs.buylist.m3_val"), label: t("tabs.buylist.m3_lbl") },
      ],
    },
    {
      id: "dashboard",
      title: t("tabs.dashboard.title"),
      shortLabel: t("tabs.dashboard.shortLabel"),
      badge: t("tabs.dashboard.badge"),
      headline: t("tabs.dashboard.headline"),
      description: t("tabs.dashboard.desc"),
      imageSrc: "/images/showcase/showcase-dashboard.png",
      simulatedUrl: "taptrade.cl/admin/sales",
      glowColor: "from-purple-600/20 via-pink-600/10 to-transparent",
      accentBadgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      features: [
        {
          title: t("tabs.dashboard.f1_title"),
          description: t("tabs.dashboard.f1_desc"),
        },
        {
          title: t("tabs.dashboard.f2_title"),
          description: t("tabs.dashboard.f2_desc"),
        },
        {
          title: t("tabs.dashboard.f3_title"),
          description: t("tabs.dashboard.f3_desc"),
        },
      ],
      floatingHighlights: [
        {
          top: "22%",
          left: "26%",
          label: "Valor de Inventario Activo",
          sublabel: "Auditoría en tiempo real del stock",
        },
        {
          top: "48%",
          right: "12%",
          label: "Evolución de Ingresos",
          sublabel: "Gráfico histórico de facturación",
        },
      ],
      metrics: [
        { value: t("tabs.dashboard.m1_val"), label: t("tabs.dashboard.m1_lbl") },
        { value: t("tabs.dashboard.m2_val"), label: t("tabs.dashboard.m2_lbl") },
        { value: t("tabs.dashboard.m3_val"), label: t("tabs.dashboard.m3_lbl") },
      ],
    },
    {
      id: "shield",
      title: t("tabs.shield.title"),
      shortLabel: t("tabs.shield.shortLabel"),
      badge: t("tabs.shield.badge"),
      headline: t("tabs.shield.headline"),
      description: t("tabs.shield.desc"),
      imageSrc: "/images/showcase/showcase-shield.png",
      simulatedUrl: "taptrade.cl/admin/orders/dispatch",
      glowColor: "from-emerald-600/20 via-teal-600/10 to-transparent",
      accentBadgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      features: [
        {
          title: t("tabs.shield.f1_title"),
          description: t("tabs.shield.f1_desc"),
        },
        {
          title: t("tabs.shield.f2_title"),
          description: t("tabs.shield.f2_desc"),
        },
        {
          title: t("tabs.shield.f3_title"),
          description: t("tabs.shield.f3_desc"),
        },
      ],
      floatingHighlights: [
        {
          top: "20%",
          left: "22%",
          label: "Blindaje de Empaque 3x",
          sublabel: "Cero reclamos por cartas falsas o cambiadas",
        },
        {
          top: "48%",
          right: "10%",
          label: "Liberación Atómica de Fondos",
          sublabel: "Dinero disponible al despachar con guía oficial",
        },
      ],
      metrics: [
        { value: t("tabs.shield.m1_val"), label: t("tabs.shield.m1_lbl") },
        { value: t("tabs.shield.m2_val"), label: t("tabs.shield.m2_lbl") },
        { value: t("tabs.shield.m3_val"), label: t("tabs.shield.m3_lbl") },
      ],
    },
    {
      id: "accounting",
      title: t("tabs.accounting.title"),
      shortLabel: t("tabs.accounting.shortLabel"),
      badge: t("tabs.accounting.badge"),
      headline: t("tabs.accounting.headline"),
      description: t("tabs.accounting.desc"),
      imageSrc: "/images/showcase/showcase-accounting.png",
      simulatedUrl: "taptrade.cl/admin/finances/f29",
      glowColor: "from-cyan-600/20 via-blue-600/10 to-transparent",
      accentBadgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      features: [
        {
          title: t("tabs.accounting.f1_title"),
          description: t("tabs.accounting.f1_desc"),
        },
        {
          title: t("tabs.accounting.f2_title"),
          description: t("tabs.accounting.f2_desc"),
        },
        {
          title: t("tabs.accounting.f3_title"),
          description: t("tabs.accounting.f3_desc"),
        },
      ],
      floatingHighlights: [
        {
          top: "20%",
          left: "25%",
          label: "Débito Fiscal Consolidado",
          sublabel: "Total listo para el casillero de tu F29",
        },
        {
          top: "48%",
          right: "12%",
          label: "Retiro TEF Bancario",
          sublabel: "Transferencia a cuenta de tu empresa",
        },
      ],
      metrics: [
        { value: t("tabs.accounting.m1_val"), label: t("tabs.accounting.m1_lbl") },
        { value: t("tabs.accounting.m2_val"), label: t("tabs.accounting.m2_lbl") },
        { value: t("tabs.accounting.m3_val"), label: t("tabs.accounting.m3_lbl") },
      ],
    },
  ];

  const activeTab = showcaseTabs.find((tab) => tab.id === activeTabId) || showcaseTabs[0];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-4 backdrop-blur-md">
          <IconSparkles className="w-3.5 h-3.5 text-[#E10E0E]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
            {t("badge_demo")}
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          {t("title_prefix")}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E10E0E] via-[#F23030] to-amber-400">
            {t("title_highlight")}
          </span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base mt-4 leading-relaxed font-normal">
          {t("subtitle")}
        </p>
      </div>

      {/* Tab Switcher Navigation Bar */}
      <div className="w-full max-w-full mx-auto mb-10 px-2 sm:px-4">
        <div
          style={{ scrollbarColor: "#E10E0E rgba(255,255,255,0.06)", scrollbarWidth: "thin" }}
          className="w-fit max-w-full mx-auto flex items-center justify-start overflow-x-auto gap-1.5 xl:gap-2 p-2 pb-3 lg:pb-2 rounded-2xl bg-[#090D16]/90 border border-white/10 backdrop-blur-xl shadow-2xl [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-white/[0.06] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:mx-2 [&::-webkit-scrollbar-thumb]:bg-[#E10E0E] [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-[#FF2E2E]"
        >
          {showcaseTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 py-2 xl:py-2.5 px-3.5 xl:px-4 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 select-none whitespace-nowrap shrink-0 ${
                  isActive
                    ? "bg-gradient-to-r from-[#E10E0E] to-[#FF2E2E] text-white font-bold shadow-lg shadow-[#E10E0E]/30 border border-white/10"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {tab.id === "inventory" && <IconBox className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />}
                {tab.id === "pos" && <IconPosTerminal className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />}
                {tab.id === "buylist" && <IconTag className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />}
                {tab.id === "dashboard" && <IconBarChart className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />}
                {tab.id === "shield" && <IconShieldCheck className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />}
                {tab.id === "accounting" && <IconReceipt className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-gray-400"}`} />}
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Showcase Window */}
      <div className="relative">
        {/* Dynamic Atmospheric Glow according to the active tab */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${activeTab.glowColor} blur-3xl -z-10 rounded-3xl opacity-80 transition-all duration-700`}
        />

        {/* macOS Style Window Frame */}
        <div className="rounded-3xl bg-[#090C14] border border-white/15 shadow-[0_20px_80px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* Window Title Bar */}
          <div className="h-12 px-4 sm:px-6 bg-[#0E121C] border-b border-white/10 flex items-center justify-between gap-4">
            {/* macOS Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50"></span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50"></span>
            </div>

            {/* Address Bar */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-gray-400 max-w-sm w-full justify-center">
              <IconLock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-gray-200 truncate">{activeTab.simulatedUrl}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1 shrink-0 animate-pulse"></span>
            </div>

            {/* Badge Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${activeTab.accentBadgeColor}`}
              >
                {activeTab.badge}
              </span>
            </div>
          </div>

          {/* Screenshot Display with Floating Visual Pills */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#080A10] overflow-hidden group">
            <Image
              key={activeTab.id}
              src={activeTab.imageSrc}
              alt={activeTab.title}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />

            {/* Subtle Gradient Vignette to blend into dark layout */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090C14] via-transparent to-black/10 pointer-events-none" />

            {/* Floating Interactive Callout Badges */}
            {activeTab.floatingHighlights.map((hl, idx) => (
              <div
                key={idx}
                style={{
                  top: hl.top,
                  left: hl.left,
                  right: hl.right,
                }}
                className="hidden md:flex absolute items-center gap-3 p-2.5 px-3.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-300 hover:scale-105 transition-transform cursor-default"
              >
                <div className="w-7 h-7 rounded-xl bg-[#E10E0E]/20 border border-[#E10E0E]/40 flex items-center justify-center text-[#E10E0E] shrink-0">
                  <IconZap className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight">{hl.label}</div>
                  <div className="text-[10px] text-gray-400 font-mono leading-tight">{hl.sublabel}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Context Panel with Capabilities & Metrics */}
          <div className="p-6 sm:p-8 bg-[#0B0E17] border-t border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Feature Highlights */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${activeTab.accentBadgeColor}`}
                  >
                    {activeTab.badge}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">• {t("real_admin_view")}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-snug">
                  {activeTab.headline}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                  {activeTab.description}
                </p>

                {/* 3 Capabilities Bullet Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeTab.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                        <IconCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat.title}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug">{feat.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Key Metrics & CTAs */}
              <div className="lg:col-span-5 flex flex-col justify-between h-full lg:border-l lg:border-white/10 lg:pl-8">
                {/* 3 Performance Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {activeTab.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <span className="text-base sm:text-lg font-black text-white font-mono block">
                        {m.value}
                      </span>
                      <span className="text-[10px] text-gray-400 leading-tight block mt-1">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTAs for Store Owners */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/admin/login"
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-extrabold bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-lg shadow-[#E10E0E]/25 hover:shadow-xl hover:shadow-[#E10E0E]/40 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <IconStore className="w-4 h-4 text-white" />
                    {t("cta_try_panel")}
                  </Link>
                  <Link
                    href="/contact"
                    className="py-3 px-4 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors text-center"
                  >
                    {t("cta_schedule_demo")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
