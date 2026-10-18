"use client";
import React from "react";
import Link from "next/link";
import { useMarketingPricing } from "@/app/landing/_components/Marketing/hooks/useMarketingPricing";

export default function PricingSection() {
  const { plans, features, loading } = useMarketingPricing();

  if (loading) {
    return (
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  // Assign specific styles or icons to plans based on their index or name
  const getPlanStyles = (index: number) => {
    switch (index) {
      case 0:
        return {
          wrapper: "bg-[#111522] border border-white/10 hover:border-white/25 hover:-translate-y-1.5 transition-all",
          button: "bg-white/10 hover:bg-white/15 text-white border border-white/10",
          check: "text-red-400 font-bold",
        };
      case 1:
        return {
          wrapper: "bg-gradient-to-b from-[#E10E0E]/15 via-[#111522] to-[#111522] border-2 border-[#E10E0E]/50 hover:-translate-y-1.5 shadow-[0_0_40px_rgba(225,14,14,0.2)] transition-all",
          button: "bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-lg shadow-[#E10E0E]/30 font-bold",
          check: "text-[#E10E0E] font-bold",
          isPopular: true
        };
      case 2:
        return {
          wrapper: "bg-[#111522] border border-white/10 hover:border-white/25 hover:-translate-y-1.5 transition-all",
          button: "bg-white/10 hover:bg-white/15 text-white border border-white/10",
          check: "text-amber-400 font-bold",
        };
      case 3:
      default:
        return {
          wrapper: "bg-[#111522] border border-white/10 hover:border-white/25 hover:-translate-y-1.5 transition-all",
          button: "bg-white/10 hover:bg-white/15 text-white border border-white/10",
          check: "text-purple-400 font-bold",
        };
    }
  };

  // Pre-defined icons for features based on their key
  const getFeatureIcon = (key: string) => {
    switch (key) {
      case 'addon:reports':
        return {
          bg: "bg-teal-500/20",
          text: "text-teal-400",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        };
      case 'addon:buylist':
        return {
          bg: "bg-yellow-500/20",
          text: "text-yellow-400",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        };
      case 'addon:radar':
        return {
          bg: "bg-purple-500/20",
          text: "text-purple-400",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        };
      case 'addon:store_credit':
        return {
          bg: "bg-green-500/20",
          text: "text-green-400",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        };
      default:
        return {
          bg: "bg-blue/20",
          text: "text-blue",
          icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        };
    }
  };

  return (
    <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Escala tu negocio sin límites</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Planes de suscripción mensual fija sin comisiones por venta. El 100% del valor de tus ventas es tuyo.</p>
      </div>

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const styles = getPlanStyles(index);
            return (
              <div key={plan.id} className={`${styles.wrapper} rounded-3xl p-8 backdrop-blur-sm transition-transform duration-300 relative flex flex-col`}>
                {styles.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E10E0E] text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md shadow-[#E10E0E]/40 font-mono">
                    Más Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6 h-10">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white font-mono">{plan.price} UF</span><span className="text-gray-400 text-sm">/mes</span>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1 font-mono">+ IVA</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <span className={styles.check}>✓</span> 
                    {plan.skuLimit === -1 ? "SKUs Ilimitados" : `Hasta ${plan.skuLimit.toLocaleString()} SKUs`}
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">✓</span> 
                    <span className="font-semibold text-emerald-400">0% Comisión por Venta</span>
                  </li>
                  {plan.features.map(f => (
                    <li key={f.id} className="flex items-center gap-3">
                      <span className={styles.check}>✓</span> {f.name}
                    </li>
                  ))}
                </ul>
                <Link href="mailto:contacto@taptrade.cl" className={`w-full text-center py-3 rounded-xl font-semibold transition-colors ${styles.button}`}>
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
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">Potencia tu negocio con Módulos Premium</h3>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">Agrega funcionalidades avanzadas a tu tienda cuando estés listo para escalar al siguiente nivel.</p>
        </div>
        
        {features.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => {
              const iconData = getFeatureIcon(feature.key);
              return (
                <div key={feature.id} className="bg-[#111522] border border-white/10 rounded-2xl p-5 flex gap-4 items-start hover:border-white/20 transition-all">
                  <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${iconData.bg} ${iconData.text}`}>
                     {iconData.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1 gap-2">
                      <h4 className="text-sm font-bold text-white truncate">{feature.name}</h4>
                      <span className={`text-xs font-mono font-bold shrink-0 ${iconData.text}`}>+ {feature.price} UF</span>
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{feature.description}</p>
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
