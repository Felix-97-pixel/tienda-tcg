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
  IconHeadphones,
} from "@/components/ui/Icons";

interface PlanItem {
  id: string;
  name: string;
  description: string;
  price: string;
  skuLimit: string;
  popular: boolean;
}

const STATIC_PLANS: PlanItem[] = [
  {
    id: "plan-starter",
    name: "Plan Starter",
    description: "Para tiendas emergentes y coleccionistas que inician su catálogo digital en línea.",
    price: "1.5",
    skuLimit: "Hasta 1.500 SKUs",
    popular: false,
  },
  {
    id: "plan-store",
    name: "Plan Store",
    description: "El estándar para tiendas establecidas con rotación activa de cartas y productos.",
    price: "3.5",
    skuLimit: "Hasta 6.000 SKUs",
    popular: true,
  },
  {
    id: "plan-mega-store",
    name: "Plan Mega Store",
    description: "Para tiendas consolidadas con alto volumen de inventario y múltiples líneas TCG.",
    price: "6.5",
    skuLimit: "Hasta 18.000 SKUs",
    popular: false,
  },
  {
    id: "plan-enterprise",
    name: "Plan Enterprise",
    description: "Operación masiva sin restricciones para holdings, distribuidoras y grandes cadenas.",
    price: "11.5",
    skuLimit: "SKUs Ilimitados",
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-gray-300 text-xs font-bold mb-4 shadow-sm backdrop-blur-md">
          <IconCheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>SaaS Puro: 0% Comisión por Venta</span>
          <span className="text-gray-500">•</span>
          <span>100% Herramientas Incluidas</span>
          <span className="text-gray-500">•</span>
          <span>Mismo Soporte Para Todos</span>
        </div>
        <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E10E0E] block mb-3">
          Suscripción Simple • Escala Únicamente por Capacidad de Catálogo
        </span>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
          Un solo sistema, todas las herramientas
        </h2>
        <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
          Elige tu plan según el volumen total de tu catálogo (singles, productos sellados y accesorios). Todos los planes cuentan con la misma infraestructura tecnológica, 1 Casa Matriz base, soporte técnico total y 0% de comisión por venta.
        </p>
      </div>

      {/* Grid de Planes - Enfocado estrictamente en Capacidad de SKUs y Precio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-6 items-stretch">
        {STATIC_PLANS.map((plan) => {
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-5 sm:p-6 xl:p-8 backdrop-blur-xl transition-all duration-300 ${plan.popular
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
                <h3 className="text-xl xl:text-2xl font-black text-white tracking-tight mb-2">
                  {plan.name}
                </h3>

                <p className="text-xs xl:text-sm text-gray-400 leading-relaxed mb-6 min-h-[44px]">
                  {plan.description}
                </p>

                {/* Bloque de Precio */}
                <div className="mb-6 pb-6 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-1.5 font-mono">
                    <span className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-lg xl:text-xl font-bold text-emerald-400 ml-1">
                      UF
                    </span>
                    <span className="text-xs text-gray-400 font-medium ml-0.5">
                      /mes
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider font-semibold mt-1.5">
                    + 19% IVA mensual
                  </p>
                </div>

                {/* Límite Total de Catálogo - Diseño apilado centrado inmune a cortes de texto */}
                <div className="mb-7 bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 px-3 text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 block mb-1">
                    Límite Total de Catálogo
                  </span>
                  <span className="text-lg xl:text-xl font-black text-white font-mono tracking-tight block">
                    {plan.skuLimit}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium block mt-1">
                    Cartas, sellado y accesorios
                  </span>
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

      {/* Secciones de Infraestructura, Sucursales y Soporte */}
      <div className="mt-12 space-y-6">
        {/* Bloque 1: Modelo SaaS Puro (0% Comisión por Transacción) */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0E121B] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl hover:border-emerald-500/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <IconCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
                  Modelo SaaS Puro • 100% Para Tu Tienda
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  0% Comisión por Transacción
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-black text-white mb-1.5">
                Tus ventas son 100% tuyas: sin cobros porcentuales ni comisiones ocultas
              </h4>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-3xl">
                A diferencia de los marketplaces tradicionales que descuentan entre el 8% y el 15% de cada transacción, en TapTrade operas bajo un modelo SaaS puro con suscripción mensual en UF. El 100% del dinero recaudado en tu vitrina web y en tu mesón POS ingresa íntegro a tu comercio.
              </p>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto text-right">
            <div className="inline-block px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 font-mono text-emerald-400 text-xs font-bold uppercase tracking-wider">
              100% Margen Para Ti
            </div>
          </div>
        </div>

        {/* Bloque 2: Multi-Sucursal Holding (+2.50 UF/mes por sucursal extra) */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0E121B] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl hover:border-purple-500/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <IconStore className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-purple-400">
                  Holding & Red de Tiendas
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  +2.50 UF / mes (+ IVA) por sucursal extra
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-black text-white mb-1.5">
                ¿Tu empresa opera más de un local físico o bodega?
              </h4>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-3xl">
                Cualquiera sea tu plan contratado, incluye 1 Casa Matriz base. Puedes sumar todas las sucursales adicionales que necesites por <strong className="text-purple-300">+2.50 UF/mes (+ IVA) cada una</strong> (ej: Providencia, Viña del Mar, Concepción), con inventario, arqueos POS, cajeros, subdominio web y retiro presencial gratis ($0) completamente independientes.
              </p>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link
              href="mailto:contacto@taptrade.cl"
              className="w-full md:w-auto px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 whitespace-nowrap"
            >
              <span>Consultar Multi-Sucursal</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bloque 3: Soporte Técnico Directo e Igualitario (Mismo Nivel Para Todos) */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0E121B] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl hover:border-red-500/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E10E0E]/15 border border-[#E10E0E]/30 flex items-center justify-center text-[#E10E0E] shrink-0">
              <IconHeadphones className="w-6 h-6 text-[#E10E0E]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#E10E0E]">
                  Soporte Técnico Directo • Todos Tienen el Mismo Respaldo
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E10E0E]/15 text-red-300 border border-[#E10E0E]/25">
                  Sin Niveles Artificiales
                </span>
              </div>
              <h4 className="text-lg md:text-xl font-black text-white mb-1.5">
                Misma atención técnica inmediata para cualquier tienda
              </h4>
              <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-3xl">
                En TapTrade no discriminamos a ninguna tienda por tamaño ni cobramos por &quot;soporte prioritario&quot;. Si el sistema presenta alguna eventualidad o requieres ayuda con tu inventario, mesón POS o facturación electrónica, nuestro equipo técnico te atiende con la misma máxima prioridad y rapidez por canales oficiales, tanto en el Plan Starter de 1.50 UF como en Enterprise.
              </p>
            </div>
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <Link
              href="mailto:soporte@taptrade.cl"
              className="w-full md:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border border-white/15 whitespace-nowrap"
            >
              <span>Contactar Soporte</span>
              <IconArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bloque Tarifario de Personal & Roles de Usuario (Seat-Based Pricing) */}
      <div className="mt-12 p-6 md:p-8 rounded-3xl bg-[#0E131F] border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-sky-400">
                Dotación Flexible por Asientos (Seat-Based)
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
              Tarifario de Personal & Roles de Usuario
            </h3>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-2xl">
              Cada plan incluye tu dotación base para operar al 100% (1 Dueño, 1 Contador, 1 Encargado y 1 Cajero por local). Si tu operación crece o necesitas más personal en mesón, agrega cuentas a la carta:
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 shrink-0 font-mono">
            ✓ Facturación mensual unificada + 19% IVA
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Cajero */}
          <div className="p-5 rounded-2xl bg-[#111522] border border-sky-500/20 hover:border-sky-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-sky-500/15 text-sky-300 border border-sky-500/30">
                  Nivel Sucursal
                </span>
                <span className="text-[10px] font-mono text-gray-400">1 base incluido</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-sky-300 transition-colors">
                Cajero de Mesón
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Terminal POS adicional, arqueo propio de caja, cobro y venta presencial en mesón o torneos.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-white">+0.35</span>
                <span className="text-xs font-bold text-sky-300">UF / mes</span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">+ IVA mensual</p>
            </div>
          </div>

          {/* 2. Encargado */}
          <div className="p-5 rounded-2xl bg-[#111522] border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Nivel Sucursal
                </span>
                <span className="text-[10px] font-mono text-gray-400">1 base incluido</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                Encargado de Sucursal
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Supervisor de turno de tarde, jefe de compras en Buylist o encargado de bodega local.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-white">+0.60</span>
                <span className="text-xs font-bold text-emerald-300">UF / mes</span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">+ IVA mensual</p>
            </div>
          </div>

          {/* 3. Administrador Holding */}
          <div className="p-5 rounded-2xl bg-[#111522] border border-purple-500/20 hover:border-purple-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Nivel Holding
                </span>
                <span className="text-[10px] font-mono text-gray-400">1 Dueño base</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                Admin Corporativo
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Socio comercial, gerente general de operaciones o director de e-commerce del holding.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-white">+0.85</span>
                <span className="text-xs font-bold text-purple-300">UF / mes</span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">+ IVA mensual</p>
            </div>
          </div>

          {/* 4. Contador */}
          <div className="p-5 rounded-2xl bg-[#111522] border border-cyan-500/20 hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Nivel Holding
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">1ro Gratis</span>
              </div>
              <h4 className="text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                Contador Adicional
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed mb-4">
                Estudio contable externo o segundo auditor para liquidaciones y Formulario 29 ante el SII.
              </p>
            </div>
            <div className="pt-3 border-t border-white/5">
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl font-black text-white">+0.30</span>
                <span className="text-xs font-bold text-cyan-300">UF / mes</span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono mt-0.5">+ IVA mensual</p>
            </div>
          </div>
        </div>
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
                <span className="font-mono text-white text-xs bg-white/5 px-2 py-1 rounded inline-block mt-1.5 leading-relaxed">
                  Total Neto (UF) = [Plan Base] + [Sucursales Extra × 2.50 UF] + [Cajeros Extra × 0.35 UF] + [Encargados Extra × 0.60 UF] + [Admins Extra × 0.85 UF]
                </span>
              </p>
            </div>
          </div>

          <div className="bg-[#111522] border border-white/10 rounded-2xl p-4 w-full lg:w-auto shrink-0 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-6">
              <span className="text-gray-400 font-medium">Conversión Oficial:</span>
              <span className="text-white font-mono font-bold">Valor UF al día de emisión</span>
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
