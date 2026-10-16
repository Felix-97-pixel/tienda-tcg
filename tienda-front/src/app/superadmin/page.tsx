import React from "react";
import Link from "next/link";

export const metadata = {
  title: "Seleccionar Módulo | TapMaster Superadmin",
  description: "Selecciona el módulo de administración global",
};

export default function SuperAdminHub() {
  const modules = [
    {
      href: "/superadmin/products",
      title: "Módulo de Catálogo",
      description: "Administra el catálogo global de cartas, juegos base, categorías y organiza las marcas oficiales del ecosistema.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "from-red-600 to-rose-700",
      shadow: "shadow-red/30",
      accentText: "text-red-light",
      tag: "Maestro TCG"
    },
    {
      href: "/superadmin/stores",
      title: "Módulo de Tiendas",
      description: "Supervisa los tenants registrados en la plataforma, monitorea la actividad de cada tienda y aprueba nuevos vendedores.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "from-purple-600 to-indigo-700",
      shadow: "shadow-purple-900/30",
      accentText: "text-purple-400",
      tag: "Tenants & Payouts"
    },
    {
      href: "/superadmin/sync",
      title: "Módulo de Sincronización",
      description: "Sincroniza masivamente el catálogo desde Scryfall y actualiza las cotizaciones oficiales de referencia del mercado.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: "from-teal-600 to-cyan-700",
      shadow: "shadow-teal-900/30",
      accentText: "text-teal-400",
      tag: "Scryfall & APIs"
    },
    {
      href: "/superadmin/config/sync",
      title: "Módulo de Configuración",
      description: "Ajusta las reglas globales de destino, planes de suscripción, vinculación oficial de expansiones y divisas maestras.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-900/30",
      accentText: "text-amber-400",
      tag: "Planes & Reglas"
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
          <span>TapMaster Global HQ</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Panel Superadministrador
        </h1>
        <p className="text-base md:text-lg text-white/60 leading-relaxed">
          Bienvenido al centro de comando de TapMaster. Selecciona el área de control global para supervisar la plataforma.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[90rem]">
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
    </div>
  );
}
