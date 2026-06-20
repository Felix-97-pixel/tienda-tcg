"use client";
import React from "react";
import Link from "next/link";
import { useMarketingPricing } from "@/components/Marketing/hooks/useMarketingPricing";

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
          wrapper: "bg-white/5 border border-white/10 hover:-translate-y-2",
          button: "bg-white/10 hover:bg-white/20 text-white",
          check: "text-red",
        };
      case 1:
        return {
          wrapper: "bg-gradient-to-b from-blue/10 to-transparent border border-blue/30 hover:-translate-y-2 shadow-[0_0_30px_rgba(59,130,246,0.15)]",
          button: "bg-blue hover:bg-blue-light text-white shadow-lg shadow-blue/20",
          check: "text-blue",
          isPopular: true
        };
      case 2:
        return {
          wrapper: "bg-white/5 border border-white/10 hover:-translate-y-2",
          button: "bg-white/10 hover:bg-white/20 text-white",
          check: "text-orange-400",
        };
      case 3:
      default:
        return {
          wrapper: "bg-white/5 border border-white/10 hover:-translate-y-2",
          button: "bg-white/10 hover:bg-white/20 text-white",
          check: "text-purple-400",
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
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Planes diseñados para adaptarse al volumen de tu inventario. Menores comisiones mientras más creces.</p>
      </div>

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, index) => {
            const styles = getPlanStyles(index);
            return (
              <div key={plan.id} className={`${styles.wrapper} rounded-3xl p-8 backdrop-blur-sm transition-transform duration-300 relative flex flex-col`}>
                {styles.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Más Popular</div>
                )}
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-6 h-10">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-white">{plan.price} UF</span><span className="text-gray-400">/mes</span>
                  <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">+ IVA</p>
                </div>
                <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
                  <li className="flex items-center gap-3">
                    <span className={styles.check}>✓</span> 
                    {plan.skuLimit === -1 ? "SKUs Ilimitados" : `Hasta ${plan.skuLimit.toLocaleString()} SKUs`}
                  </li>
                  <li className="flex items-center gap-3">
                    <span className={styles.check}>✓</span> 
                    {(Number(plan.commissionRate) * 100).toFixed(1)}% comisión por venta
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
        <div className="text-center text-gray-500 py-12 border-2 border-dashed border-white/5 rounded-3xl">
          No hay planes configurados en este momento.
        </div>
      )}

      {/* Addons Section */}
      <div className="mt-16 bg-[#1a1d24]/50 border border-white/5 rounded-3xl p-8 md:p-12">
        <h3 className="text-2xl font-bold text-white mb-2 text-center">Potencia tu negocio con Módulos Premium</h3>
        <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">Agrega funcionalidades avanzadas a tu tienda cuando estés listo para escalar al siguiente nivel.</p>
        
        {features.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const iconData = getFeatureIcon(feature.key);
              return (
                <div key={feature.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-6 items-start hover:bg-white/10 transition-colors">
                  <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${iconData.bg} ${iconData.text}`}>
                     {iconData.icon}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-bold text-white">{feature.name}</h4>
                      <span className={`text-sm font-bold ${iconData.text}`}>+ {feature.price} UF/mes</span>
                    </div>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-6">
            No hay módulos adicionales disponibles por ahora.
          </div>
        )}
      </div>
    </section>
  );
}
