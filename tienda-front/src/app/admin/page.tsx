import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import SyncDealerPricesBtn from "./SyncDealerPricesBtn";

export const metadata = {
  title: "Seleccionar Módulo | TapTrade Admin",
  description: "Selecciona el módulo de administración",
};

export default async function AdminHub() {
  const t = await getTranslations("dashboard");

  const modules = [
    {
      href: "/admin/products",
      title: "Módulo de Catálogo",
      description: "Administra tu inventario de singles y sellado, define precios, revisa tu buylist y sincroniza tus cartas TCG.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "from-red-600 to-rose-700",
      shadow: "shadow-red/30",
      accentText: "text-red-light",
      tag: "Cartas & Stock"
    },
    {
      href: "/admin/orders",
      title: "Módulo de Ventas",
      description: "Monitorea tus pedidos en curso, gestiona envíos, analiza estadísticas de facturación y el rendimiento de tu negocio.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "from-emerald-600 to-teal-700",
      shadow: "shadow-emerald-900/30",
      accentText: "text-emerald-400",
      tag: "Pedidos & Finanzas"
    },
    {
      href: "/admin/profile",
      title: "Módulo de Configuración",
      description: "Personaliza el perfil de tu tienda, métodos de envío, divisas de cobro, cupones y reglas de estado de cartas.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-900/30",
      accentText: "text-amber-400",
      tag: "Ajustes & Envíos"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-6 left-6 z-10">
        <Link href="/" className="group flex items-center gap-2 rounded-xl py-2 px-4 font-bold text-xs text-white/70 bg-white/[0.04] border border-white/10 hover:border-red/40 hover:bg-red/10 hover:text-white transition-all duration-200 shadow-sm">
          <svg className="w-4 h-4 text-white/50 group-hover:text-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver a la Tienda
        </Link>
      </div>

      <div className="text-center mb-12 max-w-2xl mt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red/10 border border-red/20 text-red text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
          <span>TapTrade Store Admin</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Centro de Control
        </h1>
        <p className="text-base md:text-lg text-white/60 leading-relaxed">
          Bienvenido a tu panel de administración. Selecciona un módulo para gestionar tu catálogo, ventas o configuración.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group relative bg-[#0E121B] rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-white/10 hover:border-white/20 overflow-hidden flex flex-col justify-between"
          >
            {/* Glow effect on hover */}
            <div className={`absolute -inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-3xl`} />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-lg ${mod.shadow} group-hover:scale-105 transition-transform duration-300 border border-white/15`}>
                  {mod.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                  {mod.tag}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-white transition-colors">
                {mod.title}
              </h2>
              <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                {mod.description}
              </p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-black text-white uppercase tracking-wider">
              <span className={`group-hover:${mod.accentText} transition-colors`}>Ingresar al Módulo</span>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-red group-hover:border-red text-white transition-all duration-300 group-hover:translate-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 w-full max-w-6xl">
        <div className="bg-[#0E121B] rounded-3xl p-6 shadow-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
              <svg className="w-6 h-6 text-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sincronización Rápida de Precios</h3>
              <p className="text-xs text-white/50">Actualiza automáticamente tus precios basados en el catálogo maestro y el mercado oficial.</p>
            </div>
          </div>
          <SyncDealerPricesBtn />
        </div>
      </div>
    </div>
  );
}
