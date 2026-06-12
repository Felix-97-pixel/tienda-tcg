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
      description: "Administra el catálogo global, agrega cartas base, define categorías y organiza las marcas de la plataforma.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "from-blue to-blue-light",
      shadow: "shadow-blue/20"
    },
    {
      href: "/superadmin/stores",
      title: "Módulo de Tiendas",
      description: "Supervisa a los tenants registrados, monitorea la actividad de cada tienda y aprueba nuevos vendedores.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: "from-teal to-teal-dark",
      shadow: "shadow-teal/20"
    },
    {
      href: "/superadmin/sync",
      title: "Módulo de Sincronización",
      description: "Sincroniza masivamente el catálogo desde Scryfall y actualiza los precios oficiales de referencia.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      color: "from-orange to-yellow",
      shadow: "shadow-orange/20"
    },
    {
      href: "/superadmin/config/sync",
      title: "Módulo de Configuración",
      description: "Ajusta las reglas globales de destino, categorías por defecto y la vinculación oficial de expansiones para la plataforma.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "from-purple-500 to-indigo-600",
      shadow: "shadow-purple-500/20"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-16 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Selecciona un Módulo
        </h1>
        <p className="text-lg text-gray-4">
          Bienvenido al panel central de TapMaster. Elige el área de trabajo global a la que deseas ingresar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-[90rem]">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group relative bg-[#1a1d24]/5 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/10 hover:border-white/20 overflow-hidden"
          >
            {/* Glow effect on hover */}
            <div className={`absolute -inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-3xl`} />
            
            <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center mb-8 shadow-lg ${mod.shadow} group-hover:scale-110 transition-transform duration-300`}>
              {mod.icon}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-3">
              {mod.title}
            </h2>
            <p className="text-gray-4 leading-relaxed group-hover:text-gray-3 transition-colors">
              {mod.description}
            </p>
            
            <div className="mt-8 flex items-center text-sm font-bold text-white uppercase tracking-wider group-hover:gap-2 transition-all opacity-80 group-hover:opacity-100">
              <span>Ingresar al Módulo</span>
              <svg className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
