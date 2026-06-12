"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function AdminSync() {
  const t = useTranslations("sync");

  return (
    <div className="p-6 space-y-8 pb-24 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Módulo de Sincronización</h1>
        <p className="text-gray-4 text-base">
          Bienvenido al centro neurálgico de catálogo y precios de TapMaster.
        </p>
      </div>

      <div className="bg-[#0f1115] rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ¿Cómo funciona este módulo?
            </h2>
            <p className="text-gray-4 text-sm leading-relaxed">
              Este módulo es exclusivo para Super Administradores y te permite inyectar productos oficiales y actualizar precios de referencia globales para que las tiendas puedan basar sus catálogos en datos reales y actualizados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-[#1a1d24]/50 p-6 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-blue/20 text-blue rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </div>
              <h3 className="text-white font-bold mb-1">Importación de Expansiones</h3>
              <p className="text-xs text-gray-5 leading-relaxed">Descarga catálogos masivos directamente desde Scryfall, TCGPlayer o bases de datos propias para armar el catálogo global.</p>
            </div>

            <div className="bg-[#1a1d24]/50 p-6 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-white font-bold mb-1">Actualización de Precios</h3>
              <p className="text-xs text-gray-5 leading-relaxed">Sincroniza los precios de mercado en tiempo real para que los vendedores tengan una referencia clara al publicar.</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue/10 border border-blue/20 rounded-xl">
            <p className="text-sm text-blue font-medium flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Selecciona un juego en la barra lateral izquierda para comenzar a sincronizar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
