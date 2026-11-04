"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconBox,
  IconPosTerminal,
  IconTag,
  IconBarChart,
  IconLock,
  IconZap,
  IconCheckCircle,
  IconBarcode,
  IconWifiOff,
  IconCreditCard,
  IconSparkles,
  IconRefresh,
  IconShieldCheck,
  IconStore,
  IconReceipt,
  IconCamera,
} from "@/components/ui/Icons";

interface ShowcaseTab {
  id: "inventory" | "pos" | "buylist" | "dashboard" | "shield" | "accounting";
  title: string;
  shortLabel: string;
  badge: string;
  headline: string;
  description: string;
  imageSrc: string;
  simulatedUrl: string;
  glowColor: string;
  accentBadgeColor: string;
  features: {
    title: string;
    description: string;
  }[];
  floatingHighlights: {
    top: string;
    left?: string;
    right?: string;
    label: string;
    sublabel: string;
  }[];
  metrics: {
    value: string;
    label: string;
  }[];
}

const SHOWCASE_TABS: ShowcaseTab[] = [
  {
    id: "inventory",
    title: "Inventario Inteligente TCG",
    shortLabel: "Inventario & Singles",
    badge: "Sincronización Scryfall",
    headline: "Publica miles de cartas en minutos sin ingresar fotos ni textos a mano",
    description:
      "Conéctate directamente a las bases de datos oficiales de Magic, Pokémon y Riftbound. Importa sets enteros, gestiona variantes Foil, idiomas, condición y aplica multiplicadores de tipo de cambio USD a CLP en un solo clic.",
    imageSrc: "/images/showcase/showcase-inventory.png",
    simulatedUrl: "taptrade.cl/admin/products",
    glowColor: "from-blue-600/20 via-indigo-600/10 to-transparent",
    accentBadgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    features: [
      {
        title: "Importación Masiva en 1 Clic",
        description: "Busca cartas por nombre o expansión e importa arte oficial en alta resolución y reglas.",
      },
      {
        title: "Multi-Variantes & Foils",
        description: "Diferencia automáticamente ediciones regulares, acabados Foil, idiomas y rarezas.",
      },
      {
        title: "Control de Stock Unificado",
        description: "El stock físico de tu tienda y tu vitrina web se actualizan al instante en cada venta.",
      },
    ],
    floatingHighlights: [
      {
        top: "16%",
        left: "24%",
        label: "Sync Oficial Scryfall",
        sublabel: "Metadata y arte HD automático",
      },
      {
        top: "44%",
        right: "8%",
        label: "Badges de Foil & Idioma",
        sublabel: "Filtros precisos para coleccionistas",
      },
    ],
    metrics: [
      { value: "< 2s", label: "Tiempo de importación por carta" },
      { value: "100%", label: "Imágenes oficiales en alta resolución" },
      { value: "0 Errores", label: "Sincronización de stock en tiempo real" },
    ],
  },
  {
    id: "pos",
    title: "Punto de Venta Físico (POS)",
    shortLabel: "Terminal POS Mostrador",
    badge: "100% Offline-First",
    headline: "Atiende a toda velocidad en mostrador, incluso si se corta internet",
    description:
      "Terminal de caja optimizado para tiendas TCG. Compatible con lectores de código de barras USB, atajos de teclado [F2]/[F10], control de turnos, arqueo ciego e impresión de tickets térmicos sin comisiones extra.",
    imageSrc: "/images/showcase/showcase-pos.png",
    simulatedUrl: "taptrade.cl/admin/pos",
    glowColor: "from-red-600/20 via-rose-600/10 to-transparent",
    accentBadgeColor: "bg-red-500/20 text-[#FF5555] border-red-500/30",
    features: [
      {
        title: "Cero Caídas con IndexedDB",
        description: "Continúa cobrando en torneos o cortes de luz; todo se sincroniza al restablecerse la red.",
      },
      {
        title: "Lectores de Código de Barras",
        description: "Escanea sleeves, binders o singles etiquetados con pistola USB estándar en milisegundos.",
      },
      {
        title: "Arqueo de Turnos & Caja Chica",
        description: "Apertura con fondo inicial, retiro de efectivo, conteo ciego y reportes X/Z automáticos.",
      },
    ],
    floatingHighlights: [
      {
        top: "22%",
        left: "30%",
        label: "IndexedDB Local",
        sublabel: "Opera sin internet a <5ms",
      },
      {
        top: "52%",
        right: "12%",
        label: "Cobro Ultra-Rápido [F10]",
        sublabel: "Efectivo, Débito o Crédito en Tienda",
      },
    ],
    metrics: [
      { value: "0%", label: "Comisión extra por venta en local" },
      { value: "< 5ms", label: "Respuesta táctil y búsqueda local" },
      { value: "80/58mm", label: "Compatibilidad impresoras térmicas" },
    ],
  },
  {
    id: "buylist",
    title: "Motor de Buylist Inteligente",
    shortLabel: "Motor de Buylist",
    badge: "Compra Automatizada",
    headline: "Compra cartas a tus clientes con cálculo de devaluación en vivo",
    description:
      "Permite a los jugadores ofrecerte sus cartas a través de tu vitrina. Configura tus porcentajes de compra según rareza y estado (NM a Damaged) y liquida en efectivo o con saldo de crédito en tu tienda.",
    imageSrc: "/images/showcase/showcase-buylist.png",
    simulatedUrl: "taptrade.cl/admin/buylist",
    glowColor: "from-amber-500/20 via-yellow-600/10 to-transparent",
    accentBadgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    features: [
      {
        title: "Devaluación Graduada Dinámica",
        description: "Ajuste automático de precios según condición (NM, LP, MP, HP, Damaged) e idioma.",
      },
      {
        title: "Billetera de Crédito en Tienda",
        description: "Incentiva a los clientes a aceptar saldo digital con bonificaciones de recompensa.",
      },
      {
        title: "Recepción & Verificación Rápida",
        description: "Revisa los lotes entregados por los clientes en mostrador y aprueba cotizaciones con 1 clic.",
      },
    ],
    floatingHighlights: [
      {
        top: "20%",
        left: "22%",
        label: "Grading TCG Automático",
        sublabel: "Multiplicadores por estado NM/LP/MP",
      },
      {
        top: "48%",
        right: "14%",
        label: "Store Credit Integrado",
        sublabel: "Retiene el capital dentro de tu tienda",
      },
    ],
    metrics: [
      { value: "+35%", label: "Aumento en rotación de inventario" },
      { value: "100%", label: "Control de márgenes de compra" },
      { value: "Directo", label: "Acreditación instantánea de saldo" },
    ],
  },
  {
    id: "dashboard",
    title: "Métricas & Analítica en Vivo",
    shortLabel: "Métricas & Analítica",
    badge: "Analítica Avanzada",
    headline: "KPIs de inventario activo, rotación, dead stock y evolución de ventas",
    description:
      "Panel de control para supervisar el rendimiento de tus singles. Gráficos de facturación por mes, alertas automáticas de bajo stock, top 10 cartas más vendidas y soporte multi-sucursal con trazabilidad total.",
    imageSrc: "/images/showcase/showcase-dashboard.png",
    simulatedUrl: "taptrade.cl/admin/sales",
    glowColor: "from-purple-600/20 via-pink-600/10 to-transparent",
    accentBadgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    features: [
      {
        title: "KPIs de Inventario & Dead Stock",
        description: "Valoración de inventario activo en CLP y alertas de cartas estancadas para activar promociones.",
      },
      {
        title: "Top Productos & Alertas de Stock",
        description: "Ranking de cartas más demandadas y notificaciones cuando quedan pocas unidades de staples.",
      },
      {
        title: "Soporte Multi-Sucursal",
        description: "Identificación de Casa Matriz y sucursales con cajas e inventarios independientes.",
      },
    ],
    floatingHighlights: [
      {
        top: "22%",
        left: "26%",
        label: "Valor de Inventario Activo",
        sublabel: "Auditoría en tiempo real del stock",
      },
      {
        top: "48%",
        right: "12%",
        label: "Evolución de Ingresos",
        sublabel: "Gráfico histórico de facturación",
      },
    ],
    metrics: [
      { value: "En Vivo", label: "Actualización de KPIs y alertas" },
      { value: "Top 10", label: "Ranking de singles más vendidos" },
      { value: "100%", label: "Trazabilidad multi-sucursal" },
    ],
  },
  {
    id: "shield",
    title: "TapTrade Shield & Despachos Inteligentes",
    shortLabel: "TapTrade Shield",
    badge: "Antifraude & Custodia",
    headline: "Protección blindada en cada despacho y fondos en custodia liberados en vivo",
    description:
      "El protocolo que elimina estafas de cartas cambiadas o reclamos de paquetes vacíos. Registro de 3 fotos de empaque con compresión WebP, validación en tiempo real con Starken y Chilexpress, y exigencia de video continuo de unboxing para compradores en órdenes de valor.",
    imageSrc: "/images/showcase/showcase-shield.png",
    simulatedUrl: "taptrade.cl/admin/orders/dispatch",
    glowColor: "from-emerald-600/20 via-teal-600/10 to-transparent",
    accentBadgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    features: [
      {
        title: "Evidencia de 3 Fotos en Empaque",
        description: "Cartas sobre comanda, protección rígida y paquete sellado con la etiqueta de transporte sobre el cierre.",
      },
      {
        title: "Custodia Escrow Inteligente",
        description: "Los fondos del comprador se retienen de forma segura y se liberan automáticamente al validar el tracking oficial.",
      },
      {
        title: "Línea de Tiempo Courier en Vivo",
        description: "Seguimiento minuto a minuto de Starken, Chilexpress y Correos de Chile dentro del detalle del pedido.",
      },
    ],
    floatingHighlights: [
      {
        top: "20%",
        left: "22%",
        label: "Blindaje de Empaque 3x",
        sublabel: "Cero reclamos por cartas falsas o cambiadas",
      },
      {
        top: "48%",
        right: "10%",
        label: "Liberación Atómica de Fondos",
        sublabel: "Dinero disponible al despachar con guía oficial",
      },
    ],
    metrics: [
      { value: "3 Fotos", label: "Protocolo obligatorio sobre $20k" },
      { value: "100%", label: "Validación de tracking oficial" },
      { value: "0 Riesgo", label: "Blindaje antifraude probado" },
    ],
  },
  {
    id: "accounting",
    title: "Liquidaciones F29 & Contabilidad Tributaria",
    shortLabel: "Liquidaciones & F29",
    badge: "Cuadratura SII",
    headline: "Cifras consolidadas listas para el Formulario F29 de tu contador",
    description:
      "Cuadratura automática de ventas de tu tienda para declarar ante el SII. Desglose transparente de tus ventas brutas con débito fiscal, la factura de comisión emitida por TapTrade (crédito fiscal para ti) y retiros bancarios directos por TEF a la cuenta corriente de tu empresa.",
    imageSrc: "/images/showcase/showcase-accounting.png",
    simulatedUrl: "taptrade.cl/admin/finances/f29",
    glowColor: "from-cyan-600/20 via-blue-600/10 to-transparent",
    accentBadgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    features: [
      {
        title: "Cuadratura F29 Consolidada",
        description: "Total de ventas brutas e IVA débito fiscal de tu negocio en el mes sin sumar boleta por boleta.",
      },
      {
        title: "Factura Limpia por Comisión",
        description: "TapTrade no duplica impuestos en tus cartas; factura únicamente su comisión como gasto y crédito fiscal.",
      },
      {
        title: "Retiros TEF a Cuenta Empresa",
        description: "Transferencia directa de tus fondos disponibles a la cuenta bancaria de tu empresa sin cobros ocultos.",
      },
    ],
    floatingHighlights: [
      {
        top: "20%",
        left: "25%",
        label: "Débito Fiscal Consolidado",
        sublabel: "Total listo para el casillero de tu F29",
      },
      {
        top: "48%",
        right: "12%",
        label: "Retiro TEF Bancario",
        sublabel: "Transferencia a cuenta de tu empresa",
      },
    ],
    metrics: [
      { value: "19% IVA", label: "Desglose claro sin doble tributación" },
      { value: "1 Clic", label: "Reporte mensual para tu contador" },
      { value: "TEF Directo", label: "Depósitos a tu cuenta bancaria" },
    ],
  }
];

export default function SystemShowcase() {
  const [activeTabId, setActiveTabId] = useState<ShowcaseTab["id"]>("inventory");

  const activeTab = SHOWCASE_TABS.find((t) => t.id === activeTabId) || SHOWCASE_TABS[0];

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 mb-4 backdrop-blur-md">
          <IconSparkles className="w-3.5 h-3.5 text-[#E10E0E]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300">
            Demostración en Vivo de la Plataforma
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Diseñado exclusivamente para la operativa real de un{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E10E0E] via-[#F23030] to-amber-400">
            comercio de TCG
          </span>
        </h2>
        <p className="text-gray-400 text-sm sm:text-base mt-4 leading-relaxed font-normal">
          Olvídate de adaptar plataformas genéricas. TapTrade reúne en una sola interfaz el Punto de Venta para mostrador, sincronización con bases de datos mundiales, catálogo web y compra automatizada de cartas.
        </p>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8 p-1.5 rounded-2xl bg-[#0B0E16] border border-white/10 max-w-2xl mx-auto backdrop-blur-xl">
          {SHOWCASE_TABS.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 select-none ${
                  isActive
                    ? "bg-[#E10E0E] text-white shadow-lg shadow-[#E10E0E]/30 scale-[1.02]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.id === "inventory" && <IconBox className="w-4 h-4" />}
                {tab.id === "pos" && <IconPosTerminal className="w-4 h-4" />}
                {tab.id === "buylist" && <IconTag className="w-4 h-4" />}
                {tab.id === "dashboard" && <IconBarChart className="w-4 h-4" />}
                {tab.id === "shield" && <IconShieldCheck className="w-4 h-4 text-emerald-400" />}
                {tab.id === "accounting" && <IconReceipt className="w-4 h-4 text-cyan-400" />}
                <span>{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Showcase Window */}
      <div className="relative">
        {/* Dynamic Atmospheric Glow according to the active tab */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${activeTab.glowColor} blur-3xl -z-10 rounded-3xl opacity-80 transition-all duration-700`}
        />

        {/* macOS Style Window Frame */}
        <div className="rounded-3xl bg-[#090C14] border border-white/15 shadow-[0_20px_80px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* Window Title Bar */}
          <div className="h-12 px-4 sm:px-6 bg-[#0E121C] border-b border-white/10 flex items-center justify-between gap-4">
            {/* macOS Traffic Lights */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E]/50"></span>
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]/50"></span>
              <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29]/50"></span>
            </div>

            {/* Address Bar */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-gray-400 max-w-sm w-full justify-center">
              <IconLock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-gray-200 truncate">{activeTab.simulatedUrl}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1 shrink-0 animate-pulse"></span>
            </div>

            {/* Badge Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${activeTab.accentBadgeColor}`}
              >
                {activeTab.badge}
              </span>
            </div>
          </div>

          {/* Screenshot Display with Floating Visual Pills */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#080A10] overflow-hidden group">
            <Image
              key={activeTab.id}
              src={activeTab.imageSrc}
              alt={activeTab.title}
              fill
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            />

            {/* Subtle Gradient Vignette to blend into dark layout */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090C14] via-transparent to-black/10 pointer-events-none" />

            {/* Floating Interactive Callout Badges */}
            {activeTab.floatingHighlights.map((hl, idx) => (
              <div
                key={idx}
                style={{
                  top: hl.top,
                  left: hl.left,
                  right: hl.right,
                }}
                className="hidden md:flex absolute items-center gap-3 p-2.5 px-3.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/20 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-300 hover:scale-105 transition-transform cursor-default"
              >
                <div className="w-7 h-7 rounded-xl bg-[#E10E0E]/20 border border-[#E10E0E]/40 flex items-center justify-center text-[#E10E0E] shrink-0">
                  <IconZap className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white leading-tight">{hl.label}</div>
                  <div className="text-[10px] text-gray-400 font-mono leading-tight">{hl.sublabel}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Context Panel with Capabilities & Metrics */}
          <div className="p-6 sm:p-8 bg-[#0B0E17] border-t border-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Feature Highlights */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${activeTab.accentBadgeColor}`}
                  >
                    {activeTab.badge}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">• Vista del Administrador Real</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 leading-snug">
                  {activeTab.headline}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm leading-relaxed mb-6 font-normal">
                  {activeTab.description}
                </p>

                {/* 3 Capabilities Bullet Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeTab.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                        <IconCheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat.title}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug">{feat.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Key Metrics & CTAs */}
              <div className="lg:col-span-5 flex flex-col justify-between h-full lg:border-l lg:border-white/10 lg:pl-8">
                {/* 3 Performance Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {activeTab.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <span className="text-base sm:text-lg font-black text-white font-mono block">
                        {m.value}
                      </span>
                      <span className="text-[10px] text-gray-400 leading-tight block mt-1">
                        {m.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTAs for Store Owners */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/admin/login"
                    className="flex-1 py-3 px-4 rounded-xl text-xs font-extrabold bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-lg shadow-[#E10E0E]/25 hover:shadow-xl hover:shadow-[#E10E0E]/40 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <IconStore className="w-4 h-4 text-white" />
                    Probar Panel de Tienda
                  </Link>
                  <Link
                    href="/contact"
                    className="py-3 px-4 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors text-center"
                  >
                    Agendar Demo Técnica
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

