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
} from "@/components/ui/Icons";

interface PlanItem {
  id: string;
  name: string;
  description: string;
  price: string;
  skuLimit: string;
  branches: string;
  popular: boolean;
  features: string[];
}

const STATIC_PLANS: PlanItem[] = [
  {
    id: "plan-starter",
    name: "Plan Starter",
    description: "Para tiendas emergentes y coleccionistas que inician su catálogo digital.",
    price: "1.50",
    skuLimit: "Hasta 1.500 SKUs",
    branches: "1 Sucursal",
    popular: false,
    features: [
      "Catálogo de hasta 1.500 cartas",
      "Punto de Venta POS Mostrador (Offline-First)",
      "Motor de Buylist Automatizada",
      "Radar de Demanda (Wishlists)",
      "Crédito de Tienda y Billetera",
      "TapTrade Shield & Despacho Seguro",
      "Sincronización Scryfall & Pokémon",
      "Envíos Starken & Chilexpress",
    ],
  },
  {
    id: "plan-store",
    name: "Plan Store",
    description: "El estándar para tiendas de hobby establecidas con rotación constante de singles.",
    price: "3.50",
    skuLimit: "Hasta 6.000 SKUs",
    branches: "1 Sucursal",
    popular: true,
    features: [
      "Catálogo de hasta 6.000 cartas",
      "Punto de Venta POS Mostrador (Offline-First)",
      "Motor de Buylist Automatizada",
      "Radar de Demanda (Wishlists)",
      "Crédito de Tienda y Billetera",
      "Reportes de Ventas & Analítica",
      "Cuadratura F29 para el SII",
      "TapTrade Shield & Despacho Seguro",
      "Importación Masiva por CSV",
      "Soporte Prioritario",
    ],
  },
  {
    id: "plan-mega-store",
    name: "Plan Mega Store",
    description: "Para tiendas consolidadas con alto volumen de inventario y múltiples formatos TCG.",
    price: "6.50",
    skuLimit: "Hasta 18.000 SKUs",
    branches: "Hasta 2 Sucursales",
    popular: false,
    features: [
      "Catálogo de hasta 18.000 cartas",
      "Soporte Multi-Sucursal (2 locales)",
      "Punto de Venta POS Mostrador (Offline-First)",
      "Motor de Buylist Automatizada",
      "Radar de Demanda (Wishlists)",
      "Crédito de Tienda y Billetera",
      "Reportes de Ventas & Analítica F29",
      "Cuentas de Cajero Simultáneas",
      "Arqueo Ciego y Turnos de Caja",
      "TapTrade Shield & Despacho Seguro",
    ],
  },
  {
    id: "plan-enterprise",
    name: "Plan Enterprise",
    description: "Operación masiva sin restricciones para holdings, distribuidoras y grandes cadenas.",
    price: "11.50",
    skuLimit: "SKUs Ilimitados",
    branches: "Multi-Sucursal Ilimitado",
    popular: false,
    features: [
      "Catálogo y SKUs 100% Ilimitados",
      "Multi-Sucursal Holding Ilimitado",
      "Punto de Venta POS Mostrador (Offline-First)",
      "Motor de Buylist Automatizada",
      "Radar de Demanda (Wishlists)",
      "Crédito de Tienda y Billetera",
      "Reportes Consolidados de Holding",
      "API & Sincronización Dedicada",
      "Asesoría Técnica y Onboarding VIP",
    ],
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
    desc: "Detecta qué cartas buscan activamente los jugadores para ajustar tus precios de compra y optimizar compras.",
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
          <span>Todos los módulos profesionales incluidos en todos los planes • 100% Sin Comisiones por Venta</span>
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E10E0E] block mb-3">
          Suscripción SaaS Simple • Escala por Cantidad de SKUs
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          Un solo sistema, todas las herramientas
        </h2>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          No cobramos extra por activar funciones. Tienes acceso completo a la suite desde el día 1; solo eliges el tramo de cartas que necesitas en vitrina.
        </p>
      </div>

      {/* Grid de Planes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {STATIC_PLANS.map((plan) => {
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-7 md:p-8 backdrop-blur-xl transition-all duration-300 ${
                plan.popular
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
                    + IVA mensual
                  </p>
                </div>

                {/* Badges de Límite de SKUs y Sucursales */}
                <div className="space-y-2 mb-6">
                  <div className="bg-blue/10 border border-blue/20 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Límite de Catálogo:</span>
                    <span className="font-bold text-white font-mono">{plan.skuLimit}</span>
                  </div>
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Sucursales Físicas:</span>
                    <span className="font-bold text-gray-300 font-mono">{plan.branches}</span>
                  </div>
                </div>

                {/* Destacado 0% Comisión SaaS */}
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3.5 py-2.5 flex items-center justify-between mb-6 shadow-sm">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <IconCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>0% Comisión por Venta</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase bg-emerald-500/20 px-2 py-0.5 rounded">
                    SaaS
                  </span>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-white">
                      <div className="w-5 h-5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <IconCheckCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-gray-200">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom CTA Button */}
              <Link
                href="mailto:contacto@taptrade.cl"
                className={`w-full text-center py-3.5 rounded-xl font-bold text-sm transition-all duration-200 block ${
                  plan.popular
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

      {/* Grid de Todos los Módulos Incluidos (Reemplazo de los addons de pago) */}
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
