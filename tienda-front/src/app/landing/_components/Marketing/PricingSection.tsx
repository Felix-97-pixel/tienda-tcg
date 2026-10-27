"use client";
import React from "react";
import Link from "next/link";
import { useMarketingPricing } from "@/app/landing/_components/Marketing/hooks/useMarketingPricing";
import { IconPosTerminal } from "@/components/ui/Icons";

export default function PricingSection() {
  const { plans, features, loading } = useMarketingPricing();

  if (loading) {
    return (
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  // Pre-defined icons for features based on their key
  const getFeatureIcon = (key: string) => {
    switch (key) {
      case "addon:reports":
        return {
          bg: "bg-teal-500/20",
          text: "text-teal-400",
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        };
      case "addon:buylist":
        return {
          bg: "bg-yellow-500/20",
          text: "text-yellow-400",
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        };
      case "addon:radar":
        return {
          bg: "bg-purple-500/20",
          text: "text-purple-400",
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
        };
      case "addon:store_credit":
        return {
          bg: "bg-green-500/20",
          text: "text-green-400",
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      default:
        return {
          bg: "bg-blue/20",
          text: "text-blue",
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        };
    }
  };

  const standardPlans = [...plans]
    .filter((p) => p.isStandard !== false)
    .sort((a, b) => Number(a.price) - Number(b.price));

  return (
    <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4 shadow-sm">
          <IconPosTerminal className="w-4 h-4 text-emerald-400" />
          <span>Punto de Venta (POS) Mostrador incluido en todos los planes sin costo adicional</span>
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E10E0E] block mb-3">
          Suscripción Mensual Fija • 100% Sin Comisiones
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          Escala tu negocio sin límites
        </h2>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Planes SaaS sin retenciones sobre el dinero de tus cartas. El 100% de cada venta va directo a tu cuenta.
        </p>
      </div>

      {/* Grid de Planes */}
      {standardPlans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {standardPlans.map((plan, index) => {
            const isPopular =
              plan.name.toLowerCase().includes("store") &&
              !plan.name.toLowerCase().includes("mega");

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col justify-between rounded-3xl p-7 md:p-8 backdrop-blur-xl transition-all duration-300 ${
                  isPopular
                    ? "bg-gradient-to-b from-[#1C1417] via-[#10131B] to-[#0A0D14] border-2 border-[#E10E0E] shadow-[0_0_50px_rgba(225,14,14,0.22)] hover:shadow-[0_0_70px_rgba(225,14,14,0.35)] hover:-translate-y-1.5"
                    : "bg-gradient-to-b from-[#111520] to-[#090C12] border border-white/10 hover:border-white/25 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl"
                }`}
              >
                {/* Popular Pill */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E10E0E] to-[#FF2E2E] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-[#E10E0E]/40 font-mono border border-white/20 whitespace-nowrap z-20">
                    Más Popular
                  </div>
                )}

                {/* Top Info */}
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2.5">
                    {plan.name}
                  </h3>

                  {/* Descripción con espacio garantizado sin colisión */}
                  <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-6 min-h-[50px] flex items-start">
                    {plan.description}
                  </p>

                  {/* Bloque de Precio */}
                  <div className="mb-6 pb-6 border-b border-white/[0.08]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
                        {Number(plan.price).toLocaleString()}
                      </span>
                      <span className="text-xl font-black text-emerald-400 font-mono ml-1">
                        UF
                      </span>
                      <span className="text-xs text-gray-400 font-medium ml-0.5">
                        /mes
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1.5 font-mono">
                      + IVA mensual
                    </p>
                  </div>

                  {/* Destacado 0% Comisión SaaS */}
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2.5 flex items-center justify-between mb-6 shadow-sm">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                      <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      0% Comisión por Venta
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase bg-emerald-500/20 px-2 py-0.5 rounded">
                      SaaS
                    </span>
                  </div>

                  {/* Capacidades y Módulos */}
                  <div className="space-y-3.5 mb-8 text-sm">
                    <p className="text-[10px] font-mono uppercase tracking-widest font-bold text-gray-500 mb-3">
                      Capacidades y Módulos
                    </p>

                    {/* Límite de cartas */}
                    <div className="flex items-center gap-2.5 text-xs text-gray-200">
                      <div className="w-5 h-5 rounded-lg bg-blue/15 text-blue border border-blue/30 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>
                        {plan.skuLimit === -1 ? (
                          <strong className="text-white font-bold">Catálogo y SKUs Ilimitados</strong>
                        ) : (
                          <>Hasta <strong className="text-white font-bold">{plan.skuLimit.toLocaleString()}</strong> cartas en catálogo</>
                        )}
                      </span>
                    </div>

                    {/* Sincronización automática */}
                    <div className="flex items-center gap-2.5 text-xs text-gray-300">
                      <div className="w-5 h-5 rounded-lg bg-white/5 text-gray-300 border border-white/10 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Sincronización automática</span>
                    </div>

                    {/* Envíos integrados */}
                    <div className="flex items-center gap-2.5 text-xs text-gray-300">
                      <div className="w-5 h-5 rounded-lg bg-white/5 text-gray-300 border border-white/10 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Envíos Starken & Chilexpress</span>
                    </div>

                    {/* Punto de Venta POS Mostrador (Offline-First) */}
                    <div className="flex items-center gap-2.5 text-xs text-white">
                      <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-semibold text-emerald-300">Punto de Venta POS (Offline-First)</span>
                    </div>

                    {/* Add-on features incluidas en el plan */}
                    {plan.features.map((f) => (
                      <div key={f.id} className="flex items-center gap-2.5 text-xs text-white">
                        <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="font-semibold">{f.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <Link
                  href="mailto:contacto@taptrade.cl"
                  className={`w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-200 block ${
                    isPopular
                      ? "bg-gradient-to-r from-[#E10E0E] to-[#FF2E2E] hover:from-[#F21A1A] hover:to-[#FF4D4D] text-white font-black shadow-lg shadow-[#E10E0E]/40 border border-[#FF5555]/30 active:scale-[0.98]"
                      : "bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/15 hover:border-white/30 active:scale-[0.98]"
                  }`}
                >
                  Contactar Ventas
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12 border-2 border-dashed border-white/5 rounded-3xl font-mono text-sm">
          Cargando planes del sistema...
        </div>
      )}

      {/* Addons Section */}
      <div className="mt-16 bg-[#0E121B] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
        <div className="text-center mb-10">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            Add-ons Opcionales
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Potencia tu negocio con Módulos Premium
          </h3>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Agrega funcionalidades avanzadas a tu tienda cuando estés listo para escalar al siguiente nivel.
          </p>
        </div>

        {features.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const iconData = getFeatureIcon(feature.key);
              return (
                <div
                  key={feature.id}
                  className="bg-[#111522] border border-white/10 rounded-2xl p-5 flex gap-4 items-start hover:border-white/20 transition-all"
                >
                  <div
                    className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${iconData.bg} ${iconData.text}`}
                  >
                    {iconData.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <h4 className="text-sm font-bold text-white truncate">
                        {feature.name}
                      </h4>
                      <span className={`text-xs font-mono font-bold shrink-0 ${iconData.text}`}>
                        + {feature.price} UF
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6 font-mono text-xs">
            No hay módulos adicionales disponibles por ahora.
          </div>
        )}
      </div>
    </section>
  );
}
