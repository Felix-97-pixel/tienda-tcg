import React from "react";
import Link from "next/link";
import {
  IconPosTerminal,
  IconCheckCircle,
  IconSparkles,
  IconStore,
  IconShieldCheck,
  IconTrendingUp,
  IconWallet,
  IconSearch,
  IconArrowRight,
  IconUsers,
  IconReceipt,
} from "@/components/ui/Icons";

interface PlanItem {
  id: string;
  name: string;
  description: string;
  price: string;
  skuLimit: string;
  branches: string;
  staff: string;
  support: string;
  popular: boolean;
}

const STATIC_PLANS: PlanItem[] = [
  {
    id: "plan-starter",
    name: "Plan Starter",
    description: "Para tiendas emergentes y coleccionistas que inician su catálogo digital en línea.",
    price: "1.5",
    skuLimit: "Hasta 1.500 SKUs",
    branches: "1 Casa Matriz",
    staff: "1 de c/tipo para operar",
    support: "Soporte Estándar",
    popular: false,
  },
  {
    id: "plan-store",
    name: "Plan Store",
    description: "El estándar para tiendas de hobby establecidas con rotación constante de singles.",
    price: "3.5",
    skuLimit: "Hasta 6.000 SKUs",
    branches: "1 Casa Matriz",
    staff: "1 de c/tipo para operar",
    support: "Soporte Prioritario",
    popular: true,
  },
  {
    id: "plan-mega-store",
    name: "Plan Mega Store",
    description: "Para tiendas consolidadas con alto volumen de inventario y múltiples formatos TCG.",
    price: "6.5",
    skuLimit: "Hasta 18.000 SKUs",
    branches: "1 Casa Matriz",
    staff: "1 de c/tipo para operar",
    support: "Soporte Preferencial WhatsApp",
    popular: false,
  },
  {
    id: "plan-enterprise",
    name: "Plan Enterprise",
    description: "Operación masiva sin restricciones para holdings, distribuidoras y grandes cadenas.",
    price: "11.5",
    skuLimit: "SKUs Ilimitados",
    branches: "1 Casa Matriz",
    staff: "1 de c/tipo para operar",
    support: "Onboarding & Asesoría VIP",
    popular: false,
  },
];

const INCLUDED_MODULES = [
  {
    title: "Punto de Venta POS Mostrador",
    desc: "Cobra a velocidad récord en tu local físico. Funciona offline, lee código de barras e imprime tickets térmicos.",
    icon: <IconPosTerminal className="w-5 h-5 text-emerald-400" />,
  },
  {
    title: "Motor de Buylist Automatizada",
    desc: "Compra cartas a los jugadores directamente desde tu vitrina con cálculo automático de devaluación según estado.",
    icon: <IconSparkles className="w-5 h-5 text-amber-400" />,
  },
  {
    title: "Radar de Demanda (Wishlists)",
    desc: "Detecta qué cartas buscan activamente los jugadores para ajustar tus precios de compra y rotar tu inventario.",
    icon: <IconSearch className="w-5 h-5 text-purple-400" />,
  },
  {
    title: "Crédito de Tienda & Fidelización",
    desc: "Billetera digital propia para retener saldo y premiar torneos sin pagar comisiones a pasarelas de pago.",
    icon: <IconWallet className="w-5 h-5 text-cyan-400" />,
  },
  {
    title: "Cuadratura Tributaria F29",
    desc: "Desglose automático de ventas brutas, débito fiscal y factura de comisión como crédito para tu contador ante el SII.",
    icon: <IconTrendingUp className="w-5 h-5 text-blue" />,
  },
  {
    title: "TapTrade Shield Antifraude",
    desc: "Registro fotográfico de empaque y validación en vivo con Starken y Chilexpress para liberar fondos con 0 riesgo.",
    icon: <IconShieldCheck className="w-5 h-5 text-emerald-400" />,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/5">
      {/* Header Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4 shadow-sm">
          <IconPosTerminal className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Todos los módulos incluidos en todos los planes • 100% Sin Comisiones por Venta</span>
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E10E0E] block mb-3">
          Suscripción SaaS Simple • Escala Únicamente por Límite de SKUs
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          Un solo sistema, todas las herramientas
        </h2>
        <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
          Cada plan incluye 1 Casa Matriz base con su dotación completa de usuarios para operar. Puedes sumar sucursales y cajeros según la escala de tu negocio.
        </p>
      </div>

      {/* Grid de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {STATIC_PLANS.map((plan) => {
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-7 md:p-8 backdrop-blur-xl transition-all duration-300 ${plan.popular
                  ? "bg-gradient-to-b from-[#1C1417] via-[#10131B] to-[#0A0D14] border-2 border-[#E10E0E] shadow-[0_0_50px_rgba(225,14,14,0.22)] hover:shadow-[0_0_70px_rgba(225,14,14,0.35)] hover:-translate-y-1.5"
                  : "bg-gradient-to-b from-[#111520] to-[#090C12] border border-white/10 hover:border-white/25 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl"
                }`}
            >
              {/* Popular Pill */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#E10E0E] to-[#FF2E2E] text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-[#E10E0E]/40 font-mono border border-white/20 whitespace-nowrap z-20">
                  Más Popular
                </div>
              )}

              {/* Top Info */}
              <div>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2.5">
                  {plan.name}
                </h3>

                <p className="text-xs md:text-sm text-gray-400 leading-relaxed mb-6 min-h-[48px] flex items-start">
                  {plan.description}
                </p>

                {/* Bloque de Precio */}
                <div className="mb-6 pb-6 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xl font-black text-emerald-400 font-mono ml-1">
                      UF
                    </span>
                    <span className="text-xs text-gray-400 font-medium ml-0.5">
                      /mes
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-1.5 font-mono">
                    + 19% IVA mensual (Factura deducible)
                  </p>
                </div>

                {/* Especificaciones de Escala (SKUs, Sucursales, Staff, Soporte) */}
                <div className="space-y-2 mb-6">
                  <div className="bg-blue/10 border border-blue/20 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Límite de Catálogo:</span>
                    <span className="font-bold text-white font-mono">{plan.skuLimit}</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Sucursal Base:</span>
                    <span className="font-bold text-emerald-400 font-mono">1 Casa Matriz</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 flex flex-col gap-0.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 font-medium">Personal Base:</span>
                      <span className="font-bold text-white font-mono text-[11px]">1 de c/tipo para operar</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      (1 Dueño, 1 Contador, 1 Encargado, 1 Cajero)
                    </span>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                    <span className="text-purple-300 font-medium">Sucursal Extra:</span>
                    <span className="font-bold text-purple-300 font-mono">+2.50 UF/mes (+ IVA)</span>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                    <span className="text-amber-300 font-medium">Cajero POS Extra:</span>
                    <span className="font-bold text-amber-300 font-mono">+0.35 UF/mes (+ IVA)</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Soporte:</span>
                    <span className="font-bold text-gray-300">{plan.support}</span>
                  </div>
                </div>

                {/* 0% Comisión SaaS */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2.5 flex items-center justify-between mb-6 shadow-sm">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <IconCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>0% Comisión por Venta</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase bg-emerald-500/20 px-2 py-0.5 rounded">
                    SaaS
                  </span>
                </div>

                {/* Banner Universal: Todos los Módulos Incluidos */}
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs space-y-1 mb-8">
                  <p className="font-bold text-emerald-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                    <IconCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Suite Completa Incluida</span>
                  </p>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    POS Mostrador, Buylist, Radar, Créditos, F29, Shield y Envíos activos sin costo adicional.
                  </p>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <Link
                href="mailto:contacto@taptrade.cl"
                className={`w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-200 block ${plan.popular
                    ? "bg-gradient-to-r from-[#E10E0E] to-[#FF2E2E] hover:from-[#F21A1A] hover:to-[#FF4D4D] text-white font-black shadow-lg shadow-[#E10E0E]/40 border border-[#FF5555]/30 active:scale-[0.98]"
                    : "bg-white/[0.08] hover:bg-white/[0.15] text-white border border-white/15 hover:border-white/30 active:scale-[0.98]"
                  }`}
              >
                Comenzar con {plan.name}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Bloque Destacado de Multi-Sucursal Holding (+2.50 UF/mes) y Personal Operativo */}
      <div className="mt-10 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-950/20 via-[#111522] to-purple-950/20 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
            <IconStore className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400">
                Holding & Red de Tiendas
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                +2.50 UF / mes (+ IVA) por sucursal
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                +0.35 UF / mes (+ IVA) por cajero extra
              </span>
            </div>
            <h4 className="text-lg md:text-xl font-bold text-white mb-1.5">
              ¿Tu empresa opera más de un local físico o requiere más cajas en mesón?
            </h4>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-3xl">
              Cualquiera sea tu plan base, incluye 1 Casa Matriz equipada con 1 usuario de cada rol (Dueño, Contador, Encargado y Cajero POS). Puedes sumar todas las sucursales que necesites por <strong className="text-purple-300">+2.50 UF/mes (+ IVA) cada una</strong> (incluye su propio Encargado + Cajero local), y agregar terminales de cobro adicionales para torneos o fin de semana por <strong className="text-amber-300">+0.35 UF/mes (+ IVA)</strong> por cajero.
            </p>
          </div>
        </div>

        <Link
          href="mailto:contacto@taptrade.cl"
          className="shrink-0 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-purple-950/50 whitespace-nowrap"
        >
          <span>Consultar Multi-Sucursal</span>
          <IconArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tarjeta de Liquidación Mensual & Cumplimiento Tributario F29 (Facturación con IVA) */}
      <div className="mt-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/20 via-[#0E131E] to-blue/10 border border-cyan-500/30 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <IconReceipt className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-cyan-400">
                  Facturación Mensual Transparente & Cumplimiento SII
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  100% Crédito Fiscal F29
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-bold text-white mb-1.5">
                ¿Cómo se calcula tu cuenta mensual a fin de mes?
              </h4>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-3xl">
                A fin de cada ciclo mensual, se liquida tu cuenta según tus recursos activos: <br className="hidden sm:inline" />
                <span className="font-mono text-white text-xs bg-white/5 px-2 py-1 rounded inline-block mt-1.5">
                  Total Neto (UF) = [Plan Base] + [Sucursales Extra × 2.50 UF] + [Cajeros Extra × 0.35 UF]
                </span>
              </p>
            </div>
          </div>

          <div className="bg-[#111522] border border-white/10 rounded-2xl p-4 w-full lg:w-auto shrink-0 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-6">
              <span className="text-gray-400 font-medium">Conversión Oficial:</span>
              <span className="text-white font-mono font-bold">Valor UF al día de facturación</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-gray-400 font-medium">Impuesto Aplicable:</span>
              <span className="text-emerald-400 font-mono font-bold">+ 19% IVA (Factura Electrónica)</span>
            </div>
            <div className="flex items-center justify-between gap-6 pt-1 border-t border-white/5">
              <span className="text-gray-400 font-medium">Tratamiento Tributario:</span>
              <span className="text-cyan-300 font-bold">Crédito Fiscal Deducible en F29</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Todos los Módulos Incluidos */}
      <div className="mt-16 bg-[#0E121B] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
        <div className="text-center mb-10">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            Suite Completa Sin Costos Ocultos
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Todos estos módulos ya están incluidos en tu suscripción
          </h3>
          <p className="text-gray-400 text-sm max-w-2xl mx-auto">
            Olvídate de pagar extras por cada herramienta. Cada tienda cuenta con la infraestructura tecnológica más avanzada del mercado TCG.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INCLUDED_MODULES.map((module, idx) => (
            <div
              key={idx}
              className="bg-[#111522] border border-white/10 rounded-2xl p-5 flex gap-4 items-start hover:border-white/20 transition-all group"
            >
              <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-105 transition-transform">
                {module.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <h4 className="text-sm font-bold text-white truncate">
                    {module.title}
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">
                    Incluido
                  </span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {module.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <IconStore className="w-4 h-4 text-blue shrink-0" />
            <span>¿Tienes más de 18.000 cartas o una cadena de locales? Tenemos planes holding personalizados.</span>
          </div>
          <Link
            href="mailto:contacto@taptrade.cl"
            className="text-white hover:text-red font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <span>Hablar con un asesor técnico</span>
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
