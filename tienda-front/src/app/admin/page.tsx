import React from "react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

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
      description: "Administra tu inventario, agrega cartas, define precios y organiza tus colecciones de TCG.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: "from-blue to-blue-light",
      shadow: "shadow-blue/20"
    },
    {
      href: "/admin/sales",
      title: "Módulo de Estadísticas",
      description: "Analiza tus ventas, gestiona las órdenes de tus clientes y monitorea el rendimiento de tu tienda.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "from-teal to-teal-dark",
      shadow: "shadow-teal/20"
    },
    {
      href: "/admin/settings",
      title: "Módulo de Configuración",
      description: "Ajusta las divisas, los métodos de envío, sincronización y preferencias generales de tu negocio.",
      icon: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "from-orange to-yellow",
      shadow: "shadow-orange/20"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-16 max-w-2xl">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Selecciona un Módulo
        </h1>
        <p className="text-lg text-gray-4">
          Bienvenido a tu panel de control. Elige el área de trabajo a la que deseas ingresar para gestionar tu tienda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
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
