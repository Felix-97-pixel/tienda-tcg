"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  IconPosTerminal,
  IconCheckCircle,
  IconSparkles,
  IconStore,
  IconShieldCheck,
  IconTrendingUp,
  IconWallet,
  IconSearch,
  IconArrowRight,
  IconReceipt,
  IconHeadphones,
} from "@/components/ui/Icons";

export default function PricingSection() {
  const t = useTranslations("landing.pricing");

  const staticPlans = [
    {
      id: "plan-starter",
      name: t("plans.starter.name"),
      description: t("plans.starter.desc"),
      price: t("plans.starter.price"),
      skuLimitLine1: t("plans.starter.limit1"),
      skuLimitLine2: t("plans.starter.limit2"),
      popular: false,
    },
    {
      id: "plan-store",
      name: t("plans.store.name"),
      description: t("plans.store.desc"),
      price: t("plans.store.price"),
      skuLimitLine1: t("plans.store.limit1"),
      skuLimitLine2: t("plans.store.limit2"),
      popular: true,
    },
    {
      id: "plan-mega-store",
      name: t("plans.mega_store.name"),
      description: t("plans.mega_store.desc"),
      price: t("plans.mega_store.price"),
      skuLimitLine1: t("plans.mega_store.limit1"),
      skuLimitLine2: t("plans.mega_store.limit2"),
      popular: false,
    },
    {
      id: "plan-enterprise",
      name: t("plans.enterprise.name"),
      description: t("plans.enterprise.desc"),
      price: t("plans.enterprise.price"),
      skuLimitLine1: t("plans.enterprise.limit1"),
      skuLimitLine2: undefined,
      popular: false,
    },
  ];

  const includedModules = [
    {
      title: t("modules.items.pos.title"),
      desc: t("modules.items.pos.desc"),
      icon: <IconPosTerminal className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: t("modules.items.buylist.title"),
      desc: t("modules.items.buylist.desc"),
      icon: <IconSparkles className="w-5 h-5 text-amber-400" />,
    },
    {
      title: t("modules.items.wishlist.title"),
      desc: t("modules.items.wishlist.desc"),
      icon: <IconSearch className="w-5 h-5 text-purple-400" />,
    },
    {
      title: t("modules.items.wallet.title"),
      desc: t("modules.items.wallet.desc"),
      icon: <IconWallet className="w-5 h-5 text-cyan-400" />,
    },
    {
      title: t("modules.items.tax.title"),
      desc: t("modules.items.tax.desc"),
      icon: <IconTrendingUp className="w-5 h-5 text-blue" />,
    },
    {
      title: t("modules.items.shield.title"),
      desc: t("modules.items.shield.desc"),
      icon: <IconShieldCheck className="w-5 h-5 text-emerald-400" />,
    },
  ];

  return (
    <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-[var(--tt-border-subtle)]">
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-[var(--tt-text-muted)] text-xs font-bold mb-4 shadow-sm backdrop-blur-md">
          <IconCheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span>{t("pill_saas")}</span>
          <span className="text-[var(--tt-text-muted)]">•</span>
          <span>{t("pill_tools")}</span>
          <span className="text-[var(--tt-text-muted)]">•</span>
          <span>{t("pill_support")}</span>
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E10E0E] block mb-3">
          {t("eyebrow")}
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-[var(--tt-text-main)] tracking-tight mb-4">
          {t("title")}
        </h2>
        <p className="text-[var(--tt-text-muted)] text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
          {t("description")}
        </p>
      </div>

      {/* Grid de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6 items-stretch">
        {staticPlans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 xl:p-8 backdrop-blur-xl transition-all duration-300 shadow-sm ${
              plan.popular
                ? "bg-[var(--tt-bg-surface)] dark:bg-gradient-to-b dark:from-[#1C1417] dark:via-[#10131B] dark:to-[#0A0D14] border-2 border-[#E10E0E] shadow-[0_0_50px_rgba(225,14,14,0.18)] hover:shadow-[0_0_70px_rgba(225,14,14,0.3)] hover:-translate-y-1.5"
                : "bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-red-500/40 hover:-translate-y-1.5 shadow-md hover:shadow-xl"
            }`}
          >
            {/* Popular Pill */}
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E10E0E] to-[#FF2E2E] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-[#E10E0E]/40 font-mono border border-white/20 whitespace-nowrap z-20">
                {t("popular_badge")}
              </div>
            )}

            {/* Top Info */}
            <div>
              <h3 className="text-xl xl:text-2xl font-black text-[var(--tt-text-main)] tracking-tight mb-2">
                {plan.name}
              </h3>

              <p className="text-xs xl:text-sm text-[var(--tt-text-muted)] leading-relaxed mb-6 min-h-[44px]">
                {plan.description}
              </p>

              {/* Bloque de Precio */}
              <div className="mb-6 pb-6 border-b border-[var(--tt-border-subtle)]">
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-3xl sm:text-4xl xl:text-5xl font-black text-[var(--tt-text-main)] tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-lg xl:text-xl font-bold text-emerald-500 dark:text-emerald-400 ml-1">
                    UF
                  </span>
                  <span className="text-xs text-[var(--tt-text-muted)] font-medium ml-0.5">
                    {t("per_month")}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--tt-text-muted)] font-mono uppercase tracking-wider font-semibold mt-1.5">
                  {t("plus_vat")}
                </p>
              </div>

              {/* Capacidad de Catálogo */}
              <div className="mb-7 bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] rounded-2xl py-4 px-3 text-center flex flex-col justify-center min-h-[105px] shadow-inner">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-500 dark:text-sky-400 block mb-1.5">
                  {t("catalog_capacity")}
                </span>
                <span className="text-2xl xl:text-[26px] font-black text-[var(--tt-text-main)] tracking-tight leading-tight block font-sans">
                  {plan.skuLimitLine1}
                </span>
                {plan.skuLimitLine2 && (
                  <span className="text-2xl xl:text-[26px] font-black text-[var(--tt-text-main)] tracking-tight leading-tight block font-sans">
                    {plan.skuLimitLine2}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom CTA Button */}
            <Link
              href="mailto:contacto@taptrade.cl"
              className={`w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-200 block shadow-sm ${
                plan.popular
                  ? "bg-gradient-to-r from-[#E10E0E] to-[#FF2E2E] hover:from-[#F21A1A] hover:to-[#FF4D4D] text-white font-black shadow-lg shadow-[#E10E0E]/40 border border-[#FF5555]/30 active:scale-[0.98]"
                  : "bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] border border-[var(--tt-border-medium)] hover:border-red-500/40 active:scale-[0.98]"
              }`}
            >
              {t("cta_plan", { name: plan.name })}
            </Link>
          </div>
        ))}
      </div>

      {/* Secciones de Infraestructura, Sucursales y Soporte */}
      <div className="mt-12 space-y-6">
        {/* Bloque 1: Modelo SaaS Puro (0% Comisión por Transacción) */}
        <div className="p-6 md:p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:border-emerald-500/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
              <IconCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">
                  {t("saas_block.eyebrow")}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 border border-emerald-500/25">
                  {t("saas_block.badge")}
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-black text-[var(--tt-text-main)] mb-1.5">
                {t("saas_block.title")}
              </h4>
              <p className="text-[var(--tt-text-muted)] text-xs md:text-sm leading-relaxed max-w-3xl">
                {t("saas_block.desc")}
              </p>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto text-right">
            <div className="inline-block px-4 py-2.5 rounded-xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] font-mono text-emerald-500 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              {t("saas_block.tag")}
            </div>
          </div>
        </div>

        {/* Bloque 2: Multi-Sucursal Holding (+2.50 UF/mes por sucursal extra) */}
        <div className="p-6 md:p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:border-purple-500/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-500 dark:text-purple-400 shrink-0">
              <IconStore className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-500 dark:text-purple-400">
                  {t("branch_block.eyebrow")}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-500 dark:text-purple-300 border border-purple-500/25">
                  {t("branch_block.badge")}
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-black text-[var(--tt-text-main)] mb-1.5">
                {t("branch_block.title")}
              </h4>
              <p className="text-[var(--tt-text-muted)] text-xs md:text-sm leading-relaxed max-w-3xl">
                {t("branch_block.desc")}
              </p>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link
              href="mailto:contacto@taptrade.cl"
              className="w-full md:w-auto px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 whitespace-nowrap"
            >
              <span>{t("branch_block.cta")}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bloque 3: Soporte Técnico Directo e Igualitario */}
        <div className="p-6 md:p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:border-red-500/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E10E0E]/15 border border-[#E10E0E]/30 flex items-center justify-center text-[#E10E0E] shrink-0">
              <IconHeadphones className="w-6 h-6 text-[#E10E0E]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E10E0E]">
                  {t("support_block.eyebrow")}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E10E0E]/15 text-red-500 dark:text-red-300 border border-[#E10E0E]/25">
                  {t("support_block.badge")}
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-black text-[var(--tt-text-main)] mb-1.5">
                {t("support_block.title")}
              </h4>
              <p className="text-[var(--tt-text-muted)] text-xs md:text-sm leading-relaxed max-w-3xl">
                {t("support_block.desc")}
              </p>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link
              href="mailto:soporte@taptrade.cl"
              className="w-full md:w-auto px-5 py-3 rounded-xl bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-surface)] text-[var(--tt-text-main)] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-[var(--tt-border-medium)] whitespace-nowrap shadow-sm"
            >
              <span>{t("support_block.cta")}</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bloque Tarifario de Personal & Roles de Usuario (Seat-Based Pricing) */}
      <div className="mt-12 p-6 md:p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-[var(--tt-border-subtle)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-500 dark:text-sky-400">
                {t("staff_pricing.badge")}
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-[var(--tt-text-main)] tracking-tight mb-2">
              {t("staff_pricing.title")}
            </h3>
            <p className="text-[var(--tt-text-muted)] text-xs md:text-sm leading-relaxed max-w-2xl">
              {t("staff_pricing.desc")}
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] text-xs text-[var(--tt-text-muted)] shrink-0 font-mono">
            {t("staff_pricing.vat_note")}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Cajero */}
          <div className="p-5 rounded-2xl bg-[var(--tt-bg-subtle)] border border-sky-500/20 hover:border-sky-500/40 transition-all flex flex-col justify-between group shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-500/15 text-sky-500 dark:text-sky-300 border border-sky-500/30">
                  {t("staff_pricing.level_branch")}
                </span>
                <span className="text-[10px] font-mono text-[var(--tt-text-muted)]">{t("staff_pricing.base_included")}</span>
              </div>
              <h4 className="text-base font-bold text-[var(--tt-text-main)] mb-1 group-hover:text-sky-500 transition-colors">
                {t("staff_pricing.roles.cashier.title")}
              </h4>
              <p className="text-xs text-[var(--tt-text-muted)] leading-relaxed mb-4">
                {t("staff_pricing.roles.cashier.desc")}
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--tt-border-subtle)]">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-[var(--tt-text-main)]">{t("staff_pricing.roles.cashier.price")}</span>
                <span className="text-xs font-bold text-sky-500 dark:text-sky-300">UF {t("per_month")}</span>
              </div>
              <p className="text-[10px] text-[var(--tt-text-muted)] font-mono mt-0.5">{t("plus_vat")}</p>
            </div>
          </div>

          {/* 2. Encargado */}
          <div className="p-5 rounded-2xl bg-[var(--tt-bg-subtle)] border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between group shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-500 dark:text-emerald-300 border border-emerald-500/30">
                  {t("staff_pricing.level_branch")}
                </span>
                <span className="text-[10px] font-mono text-[var(--tt-text-muted)]">{t("staff_pricing.base_included")}</span>
              </div>
              <h4 className="text-base font-bold text-[var(--tt-text-main)] mb-1 group-hover:text-emerald-500 transition-colors">
                {t("staff_pricing.roles.manager.title")}
              </h4>
              <p className="text-xs text-[var(--tt-text-muted)] leading-relaxed mb-4">
                {t("staff_pricing.roles.manager.desc")}
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--tt-border-subtle)]">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-[var(--tt-text-main)]">{t("staff_pricing.roles.manager.price")}</span>
                <span className="text-xs font-bold text-emerald-500 dark:text-emerald-300">UF {t("per_month")}</span>
              </div>
              <p className="text-[10px] text-[var(--tt-text-muted)] font-mono mt-0.5">{t("plus_vat")}</p>
            </div>
          </div>

          {/* 3. Administrador Holding */}
          <div className="p-5 rounded-2xl bg-[var(--tt-bg-subtle)] border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between group shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/15 text-purple-500 dark:text-purple-300 border border-purple-500/30">
                  {t("staff_pricing.level_holding")}
                </span>
                <span className="text-[10px] font-mono text-[var(--tt-text-muted)]">{t("staff_pricing.owner_base")}</span>
              </div>
              <h4 className="text-base font-bold text-[var(--tt-text-main)] mb-1 group-hover:text-purple-500 transition-colors">
                {t("staff_pricing.roles.admin.title")}
              </h4>
              <p className="text-xs text-[var(--tt-text-muted)] leading-relaxed mb-4">
                {t("staff_pricing.roles.admin.desc")}
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--tt-border-subtle)]">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-[var(--tt-text-main)]">{t("staff_pricing.roles.admin.price")}</span>
                <span className="text-xs font-bold text-purple-500 dark:text-purple-300">UF {t("per_month")}</span>
              </div>
              <p className="text-[10px] text-[var(--tt-text-muted)] font-mono mt-0.5">{t("plus_vat")}</p>
            </div>
          </div>

          {/* 4. Contador */}
          <div className="p-5 rounded-2xl bg-[var(--tt-bg-subtle)] border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex flex-col justify-between group shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/15 text-cyan-500 dark:text-cyan-300 border border-cyan-500/30">
                  {t("staff_pricing.level_holding")}
                </span>
                <span className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 font-bold">{t("staff_pricing.first_free")}</span>
              </div>
              <h4 className="text-base font-bold text-[var(--tt-text-main)] mb-1 group-hover:text-cyan-500 transition-colors">
                {t("staff_pricing.roles.accountant.title")}
              </h4>
              <p className="text-xs text-[var(--tt-text-muted)] leading-relaxed mb-4">
                {t("staff_pricing.roles.accountant.desc")}
              </p>
            </div>
            <div className="pt-3 border-t border-[var(--tt-border-subtle)]">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-[var(--tt-text-main)]">{t("staff_pricing.roles.accountant.price")}</span>
                <span className="text-xs font-bold text-cyan-500 dark:text-cyan-300">UF {t("per_month")}</span>
              </div>
              <p className="text-[10px] text-[var(--tt-text-muted)] font-mono mt-0.5">{t("plus_vat")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta de Liquidación Mensual & Cumplimiento Tributario F29 */}
      <div className="mt-8 p-6 md:p-8 rounded-3xl bg-[var(--tt-bg-surface)] border border-cyan-500/30 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shrink-0">
              <IconReceipt className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-500 dark:text-cyan-400">
                  {t("billing.eyebrow")}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-500 dark:text-cyan-300 border border-cyan-500/30">
                  {t("billing.badge")}
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-bold text-[var(--tt-text-main)] mb-1.5">
                {t("billing.title")}
              </h4>
              <p className="text-[var(--tt-text-muted)] text-xs md:text-sm leading-relaxed max-w-3xl">
                {t("billing.desc")} <br className="hidden sm:inline" />
                <span className="font-mono text-[var(--tt-text-main)] text-xs bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] px-2 py-1 rounded inline-block mt-1.5 leading-relaxed">
                  {t("billing.formula")}
                </span>
              </p>
            </div>
          </div>

          <div className="bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] rounded-2xl p-4 w-full lg:w-auto shrink-0 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-6">
              <span className="text-[var(--tt-text-muted)] font-medium">{t("billing.official_conversion")}</span>
              <span className="text-[var(--tt-text-main)] font-mono font-bold">{t("billing.conversion_val")}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-[var(--tt-text-muted)] font-medium">{t("billing.tax_applicable")}</span>
              <span className="text-emerald-500 dark:text-emerald-400 font-mono font-bold">{t("billing.tax_val")}</span>
            </div>
            <div className="flex items-center justify-between gap-6 pt-1 border-t border-[var(--tt-border-subtle)]">
              <span className="text-[var(--tt-text-muted)] font-medium">{t("billing.tax_treatment")}</span>
              <span className="text-cyan-500 dark:text-cyan-300 font-bold">{t("billing.tax_treatment_val")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Todos los Módulos Incluidos */}
      <div className="mt-16 bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-3xl p-8 md:p-12 shadow-xl">
        <div className="text-center mb-10">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            {t("modules.eyebrow")}
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-[var(--tt-text-main)] mb-2">
            {t("modules.title")}
          </h3>
          <p className="text-[var(--tt-text-muted)] text-sm max-w-2xl mx-auto">
            {t("modules.desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {includedModules.map((module, idx) => (
            <div
              key={idx}
              className="bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] rounded-2xl p-5 flex gap-4 items-start hover:border-red-500/40 transition-all group shadow-sm"
            >
              <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] group-hover:scale-105 transition-transform shadow-inner">
                {module.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <h4 className="text-sm font-bold text-[var(--tt-text-main)] truncate">
                    {module.title}
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                    {t("modules.included_badge")}
                  </span>
                </div>
                <p className="text-[var(--tt-text-muted)] text-xs leading-relaxed">
                  {module.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--tt-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--tt-text-muted)]">
          <div className="flex items-center gap-2">
            <IconStore className="w-4 h-4 text-blue shrink-0" />
            <span>{t("modules.custom_holding")}</span>
          </div>
          <Link
            href="mailto:contacto@taptrade.cl"
            className="text-[var(--tt-text-main)] hover:text-red font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <span>{t("modules.talk_advisor")}</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
