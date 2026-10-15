"use client";
import React from "react";
import Image from "next/image";

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
    <section className="relative w-full border-b border-white/[0.08] bg-[#0A0D14] overflow-hidden pt-28 md:pt-36 pb-8">
      {/* Background Atmosphere Layers (Anti-Slop Dark Vault) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Subtle radial ambient light */}
        <div className="absolute top-[-20%] left-1/4 w-[550px] h-[350px] bg-red-600/10 blur-[140px] rounded-full"></div>
        <div className="absolute top-[10%] right-[-10%] w-[450px] h-[400px] bg-emerald-500/5 blur-[150px] rounded-full"></div>
        {/* Subtle noise grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)`, backgroundSize: '24px 24px' }}
        ></div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 opacity-80"></div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6">
          {/* Left: Avatar & Store Identity */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Store Avatar Vault Frame */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#111522] border-2 border-white/10 p-2 shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-red-500/50 group-hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-red-600/30 to-amber-600/20 flex items-center justify-center">
                    <span className="text-3xl font-black text-white/70 tracking-wider">
                      {store.name.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <span 
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0A0D14] flex items-center justify-center text-white text-[11px] shadow-md"
                title="Comercio activo en vivo"
              >
                ✓
              </span>
            </div>

            {/* Title & Badges */}
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Tienda Oficial TCG
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ✓ Verificado TapTrade
                </span>
                {totalProducts > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono text-gray-400 bg-white/5 border border-white/10">
                    {totalProducts} cartas activas
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {store.name}
              </h1>

              <p className="text-gray-400 text-sm max-w-xl leading-relaxed line-clamp-2">
                {store.description ||
                  "Inventario oficial en vivo. Compra singles protegidos, boosters y cajas selladas con despacho consolidado o retiro presencial."}
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
                WhatsApp Tienda
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
                className="p-2 rounded-xl text-gray-400 bg-white/5 border border-white/10 hover:text-white hover:bg-white/10 transition-all"
                title={`Enviar correo a ${email}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Logistics & Store Trust Bar (Refactoring UI / Microinteractions) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-white/[0.06]">
          {/* 1. Retiro en Tienda ($0) */}
          <div className="glass-vault rounded-xl p-3 flex items-start gap-3 border border-white/5 hover:border-emerald-500/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 text-sm font-bold">
              🏪
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Retiro en Tienda
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold font-mono bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">
                  GRATIS $0
                </span>
              </div>
              <p className="text-[12px] text-gray-400 truncate mt-0.5">
                {address ? (
                  mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-emerald-400 underline underline-offset-2 transition-colors"
                      title="Ver mapa en Google Maps"
                    >
                      {address}
                    </a>
                  ) : (
                    address
                  )
                ) : (
                  "Retiro presencial coordinado con el vendedor"
                )}
              </p>
              <span className="text-[11px] text-gray-400 block mt-0.5">
                ⏰ {openingHours}
              </span>
            </div>
          </div>

          {/* 2. Chilexpress Despacho */}
          <div className="glass-vault rounded-xl p-3 flex items-start gap-3 border border-white/5 hover:border-amber-500/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 text-sm font-bold">
              🚚
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Chilexpress Courier
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-amber-500/15 text-amber-300 rounded border border-amber-500/30">
                  Cotización en vivo
                </span>
              </div>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Envíos prioritarios a domicilio o sucursal con seguimiento oficial 24-48h.
              </p>
            </div>
          </div>

          {/* 3. Starken Envíos */}
          <div className="glass-vault rounded-xl p-3 flex items-start gap-3 border border-white/5 hover:border-blue-500/30 transition-all">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 text-sm font-bold">
              📦
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Starken Envíos
                </span>
                <span className="px-1.5 py-0.2 text-[10px] font-bold bg-blue-500/15 text-blue-300 rounded border border-blue-500/30">
                  Todo Chile
                </span>
              </div>
              <p className="text-[12px] text-gray-400 mt-0.5">
                Cobertura nacional para cartas protegidas, carpetas y cajas selladas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
