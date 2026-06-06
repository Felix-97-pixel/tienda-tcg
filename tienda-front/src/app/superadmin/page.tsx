import React from "react";
import Link from "next/link";

export default function SuperAdminDashboard() {
  const stats = [
    { label: "Tiendas Activas", value: "24", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { label: "Cartas en Catálogo Global", value: "14,520", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
    { label: "Usuarios Registrados", value: "1,204", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">TapMaster Dashboard</h1>
        <p className="text-gray-4">Bienvenido al panel de control central. Aquí administras el SaaS, los tenants y el catálogo global.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#1a1d24]/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute -inset-0 bg-gradient-to-br from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-4 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-black text-white mt-1">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acceso Rápido Catálogo */}
        <div className="bg-[#1a1d24]/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Gestión de Catálogo Global</h2>
          <p className="text-gray-4 mb-6">Administra las cartas base, productos sellados globales y accesorios que todas las tiendas pueden vender.</p>
          <Link href="/superadmin/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-colors">
            Ir al Catálogo Maestro
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>

        {/* Acceso Rápido Tiendas */}
        <div className="bg-[#1a1d24]/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Gestión de Tiendas (Tenants)</h2>
          <p className="text-gray-4 mb-6">Monitorea la actividad de las tiendas, suspende cuentas o aprueba nuevos registros de vendedores.</p>
          <Link href="/superadmin/stores" className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a1d24]/10 hover:bg-[#1a1d24]/20 border border-white/10 text-white font-bold rounded-xl transition-colors">
            Ver Directorio de Tiendas
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
