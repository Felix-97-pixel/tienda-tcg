"use client";
import React from "react";
import Image from "next/image";
import {
  IconStore,
  IconTruck,
  IconBox,
  IconClock,
  IconMapPin,
  IconMail,
  IconCheck,
} from "@/components/ui/Icons";
import { useTranslations } from "next-intl";

interface TcgStoreHeroProps {
  store: {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    latitude?: number;
    longitude?: number;
    settings?: Array<{ key: string; value: string }>;
  };
  totalProducts?: number;
  onSearchChange?: (val: string) => void;
  searchValue?: string;
}

export default function TcgStoreHero({
  store,
  totalProducts = 0,
  onSearchChange,
  searchValue = "",
}: TcgStoreHeroProps) {
  const t = useTranslations("store");

  // Normalize settings map
  const s = (store.settings || []).reduce((acc: Record<string, string>, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  const address = s.address || "";
  const phone = s.phone || s.whatsapp || "";
  const email = s.email || "";
  const openingHours = s.hours || s.opening_hours || "Lun - Sáb: 11:00 - 19:30 hrs";

  const mapUrl =
    store.latitude && store.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${store.latitude},${store.longitude}`
      : address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
      : null;

  return (
    <section className="relative w-full border-b border-[var(--tt-border-medium)] bg-[var(--tt-bg-surface)] overflow-hidden pt-28 md:pt-36 pb-8 transition-colors">
      {/* Background Atmosphere Layers (Anti-Slop Dark/Light Mode Vault) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle radial ambient light */}
        <div className="absolute top-[-20%] left-1/4 w-[550px] h-[350px] bg-red-600/10 blur-[140px] rounded-full"></div>
        {/* Grid pattern texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] text-black/[0.03] dark:text-white/[0.04] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header Card */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pb-6">
          {/* Left: Store Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
            {/* Store Avatar Logo */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] p-1 shadow-lg shadow-black/5 dark:shadow-2xl overflow-hidden flex items-center justify-center">
                {store.logoUrl ? (
                  <Image
                    src={store.logoUrl}
                    alt={store.name}
                    width={96}
                    height={96}
                    unoptimized
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-tr from-red-600 to-amber-600 flex items-center justify-center text-white text-2xl font-black font-mono">
                    {store.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <span 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[var(--tt-bg-surface)] flex items-center justify-center text-white text-[11px] shadow-md"
                title={t("live_commerce_title")}
              >
                <IconCheck className="w-3.5 h-3.5 stroke-[3]" />
              </span>
            </div>

            {/* Title & Badges */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse"></span>
                  {t("official_store_badge")}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {t("verified_taptrade")}
                </span>
                {totalProducts > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono text-[var(--tt-text-muted)] bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)]">
                    {t("active_cards_count", { count: totalProducts })}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--tt-text-main)] tracking-tight">
                {store.name}
              </h1>

              <p className="text-[var(--tt-text-muted)] text-sm max-w-xl leading-relaxed line-clamp-2">
                {store.description || t("default_description")}
              </p>
            </div>
          </div>

          {/* Right: Quick Social & Contact Bar */}
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2.5 w-full lg:w-auto">
            {s.whatsapp && (
              <a
                href={`https://wa.me/${s.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.072.043.419-.101.824z" />
                </svg>
                {t("whatsapp_btn")}
              </a>
            )}

            {s.instagram && (
              <a
                href={s.instagram.startsWith("http") ? s.instagram : `https://instagram.com/${s.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[#E4405F]/10 text-[#E4405F] border border-[#E4405F]/30 hover:bg-[#E4405F] hover:text-white transition-all shadow-sm"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                Instagram
              </a>
            )}

            {email && (
              <a
                href={`mailto:${email}`}
                className="p-2 rounded-xl text-[var(--tt-text-muted)] bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-medium)] hover:text-[var(--tt-text-main)] hover:bg-[var(--tt-bg-canvas)] transition-all"
                title={t("send_email_title", { email })}
              >
                <IconMail className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Logistics & Store Trust Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-[var(--tt-border-subtle)]">
          {/* 1. Retiro en Tienda ($0) */}
          <div className="rounded-xl p-3 flex items-start gap-3 bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-subtle)] hover:border-emerald-500/40 shadow-sm transition-all">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <IconStore className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--tt-text-main)] uppercase tracking-wider">
                  {t("pickup_title")}
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold font-mono bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-500/40">
                  {t("pickup_free_badge")}
                </span>
              </div>
              <p className="text-[12px] text-[var(--tt-text-muted)] truncate mt-0.5">
                {address ? (
                  mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--tt-text-main)] hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2 transition-colors"
                      title={t("view_map")}
                    >
                      {address}
                    </a>
                  ) : (
                    address
                  )
                ) : (
                  t("pickup_coordinated")
                )}
              </p>
              <span className="text-[11px] text-[var(--tt-text-muted)] flex items-center gap-1 mt-0.5">
                <IconClock className="w-3 h-3 text-[var(--tt-text-muted)] shrink-0" />
                <span>{openingHours}</span>
              </span>
            </div>
          </div>

          {/* 2. Chilexpress Despacho */}
          <div className="rounded-xl p-3 flex items-start gap-3 bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-subtle)] hover:border-amber-500/40 shadow-sm transition-all">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <IconTruck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--tt-text-main)] uppercase tracking-wider">
                  {t("chilexpress_title")}
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded border border-amber-500/30">
                  {t("chilexpress_badge")}
                </span>
              </div>
              <p className="text-[12px] text-[var(--tt-text-muted)] mt-0.5">
                {t("chilexpress_desc")}
              </p>
            </div>
          </div>

          {/* 3. Starken Envíos */}
          <div className="rounded-xl p-3 flex items-start gap-3 bg-[var(--tt-bg-subtle)] border border-[var(--tt-border-subtle)] hover:border-blue-500/40 shadow-sm transition-all">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <IconBox className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--tt-text-main)] uppercase tracking-wider">
                  {t("starken_title")}
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 rounded border border-blue-500/30">
                  {t("starken_badge")}
                </span>
              </div>
              <p className="text-[12px] text-[var(--tt-text-muted)] mt-0.5">
                {t("starken_desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
