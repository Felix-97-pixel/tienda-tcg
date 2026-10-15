"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import PricingSection from "@/app/landing/_components/Marketing/PricingSection";
import {
  IconSparkles,
  IconShieldCheck,
  IconTruck,
  IconCreditCard,
  IconStore,
  IconCard,
  IconZap,
  IconBox,
  IconTag,
  IconFlagES,
  IconFlagUS,
  IconFlagJP,
} from "@/components/ui/Icons";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<"players" | "stores">("players");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const tcgGames = [
    { name: "Magic: The Gathering", publisher: "Wizards of the Coast", badge: "Scryfall Sync", color: "from-blue-600/20 to-indigo-600/10 border-blue-500/30 text-blue-400" },
    { name: "Pokémon TCG", publisher: "The Pokémon Company", badge: "API Oficial", color: "from-amber-500/20 to-yellow-600/10 border-amber-500/30 text-amber-300" },
    { name: "Yu-Gi-Oh!", publisher: "Konami", badge: "Catálogo Global", color: "from-purple-600/20 to-pink-600/10 border-purple-500/30 text-purple-400" },
    { name: "Riftbound TCG", publisher: "Riftbound Games", badge: "Riftcodex Sync", color: "from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-300" },
    { name: "One Piece Card Game", publisher: "Bandai Carddass", badge: "Alta Demanda", color: "from-red-600/20 to-rose-600/10 border-red-500/30 text-red-400" },
    { name: "Mitos y Leyendas", publisher: "Fenix / Klu", badge: "Chile Tradición", color: "from-emerald-600/20 to-teal-600/10 border-emerald-500/30 text-emerald-300" },
  ];

  const faqs = [
    {
      q: "¿Cómo funciona comprar cartas de distintas tiendas en un solo carrito?",
      a: "TapTrade cuenta con un sistema de checkout multi-tienda inteligente. Puedes agregar singles de cualquier tienda verificada de Chile a un único carrito. Al momento de pagar realizas una sola transacción y nuestro sistema divide automáticamente el pago hacia cada vendedor y genera sus etiquetas de envío individuales con Chilexpress o Starken.",
    },
    {
      q: "¿Qué es el Motor de Buylist y cómo ayuda a mi tienda?",
      a: "El Buylist permite que tus clientes te vendan sus cartas directamente desde tu vitrina online. El sistema calcula en tiempo real los valores de compra aplicando devaluaciones automáticas según el estado (Near Mint, Lightly Played, etc.) y el idioma de cada carta. Puedes liquidar la compra en efectivo o acreditar saldo digital (Crédito en Tienda) para compras futuras.",
    },
    {
      q: "¿Qué comisiones cobra la plataforma a las tiendas?",
      a: "Nuestros planes están pensados para escalar contigo. Partes con el plan Starter sin costo mensual fijo y una comisión del 7% por venta. A medida que tu negocio crece, puedes acceder a comisiones reducidas de 5%, 3% e incluso 1.5% mensual, maximizando el margen de ganancia de tu inventario.",
    },
    {
      q: "¿Cómo se garantiza el estado y autenticidad de las cartas?",
      a: "Todas las tiendas y dealers pasan por un proceso de verificación legal de su RUT chileno. Además, exigimos el estándar internacional de graduación TCG (Mint, Near Mint, Excellent, Lightly Played, Good, Moderately Played, Heavily Played y Damaged). Si una carta recibida no coincide con el estado descrito, cuentas con protección y garantía de devolución.",
    },
    {
      q: "¿Cómo se sincroniza el catálogo de cartas en mi tienda?",
      a: "Olvídate de ingresar fotos, nombres en inglés y español o textos de reglas a mano. TapTrade está integrado directamente con Scryfall, PokemonTCG y Riftcodex. Solo buscas el nombre de la carta o expansión y en 1 clic importas toda la metadata oficial con fotos en alta resolución.",
    },
    {
      q: "¿Cómo despacho las ventas que entran a mi tienda?",
      a: "Directamente desde tu panel de vendedor tendrás un botón para 'Generar Etiqueta'. El sistema calcula las dimensiones del envío, genera el código de seguimiento de Chilexpress o Starken y te entrega la etiqueta lista para imprimir y entregar en la sucursal más cercana.",
    },
  ];

  return (
    <div className="w-full relative overflow-hidden bg-[#07090E] text-white selection:bg-[#E10E0E] selection:text-white">
      {/* Dynamic Background Atmosphere */}
      <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] bg-[#E10E0E]/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[30%] right-[-15%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] left-[10%] w-[45%] h-[45%] bg-amber-500/5 rounded-full blur-[160px] pointer-events-none z-0" />
      
      {/* Subtle Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"></div>

      {/* =========================================================================
          HERO SECTION: High-Impact Cinematic Intro
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 pb-20">
        <div className="flex flex-col items-center text-center">
          {/* Official Launch Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-8 backdrop-blur-md shadow-lg shadow-black/40 hover:border-red-500/40 transition-all">
            <span className="flex w-2 h-2 rounded-full bg-[#E10E0E] animate-pulse"></span>
            <span className="text-xs font-semibold text-gray-300 tracking-wide uppercase">
              La Plataforma Integral de TCG en Chile
            </span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl leading-[1.08] mb-6">
            El ecosistema definitivo para{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
              comprar, vender
            </span>{" "}
            y escalar en{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E10E0E] via-[#F23030] to-amber-500">
              Trading Cards.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-400 max-w-3xl mb-10 leading-relaxed font-normal">
            Centralizamos el inventario de las mejores tiendas y dealers de Chile. Sincronización oficial de catálogos (Scryfall y Pokémon), motor de Buylist inteligente, un solo carrito multi-tienda y envíos integrados con Chilexpress y Starken.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-16">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-[#E10E0E] hover:bg-[#F23030] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-[#E10E0E]/30 hover:shadow-2xl hover:shadow-[#E10E0E]/50 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <IconSparkles className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              Explorar Catálogo de Singles
            </Link>
            <Link
              href="/admin/login"
              className="w-full sm:w-auto px-8 py-4 bg-[#111522] hover:bg-[#161C2C] text-white font-bold text-sm rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <IconStore className="w-4 h-4 text-amber-400" />
              Crear mi Tienda / Acceso LGS
            </Link>
          </div>

          {/* =========================================================================
              FLOATING HOLOGRAPHIC VAULT SHOWCASE
             ========================================================================= */}
          <div className="w-full max-w-5xl relative mt-4">
            {/* Ambient Backlight Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#E10E0E]/20 via-blue-600/10 to-transparent blur-3xl -z-10 rounded-3xl"></div>

            <div className="rounded-3xl bg-[#0E121B]/80 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <IconZap className="w-4 h-4 text-amber-400" /> Mercado TCG en Vivo
                    </h3>
                    <p className="text-xs text-gray-400">Cotización consolidada en tiempo real de tiendas en Chile</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white/5 border border-white/10 text-gray-300">
                    CLP • Precios Locales
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    Split Payments OK
                  </span>
                </div>
              </div>

              {/* Holographic Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Card 1: Black Lotus */}
                <div className="relative group rounded-2xl bg-[#111522] border border-white/10 p-4 hover:border-white/30 transition-all hover:-translate-y-1 shadow-lg">
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/40 mb-3 border border-white/10">
                    <Image
                      src="/images/products/product-1-bg-1.png"
                      alt="Black Knight / Alpha Lotus"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        NM
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-black/60 text-gray-300 border border-white/10">
                        EN
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] text-blue-400 font-bold block truncate">Magic: The Gathering</span>
                    <h4 className="text-sm font-extrabold text-white truncate">Black Knight (Classic Alpha)</h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Mejor oferta</span>
                        <span className="text-sm font-black text-white font-mono">$18.990 CLP</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium px-2 py-1 rounded bg-white/5 border border-white/10">
                        BloodMoonGames
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2 (Centerpiece): Ezreal Holographic Foil */}
                <div className="relative group rounded-2xl bg-gradient-to-b from-red-600/10 via-[#111522] to-[#111522] border border-red-500/30 p-4 hover:border-red-500/60 transition-all hover:-translate-y-1 shadow-xl">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E10E0E] text-white shadow-md shadow-[#E10E0E]/40 z-20">
                    Foil Iridiscente
                  </div>
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/40 mb-3 border border-red-500/20">
                    <Image
                      src="/images/products/product-2-bg-1.png"
                      alt="Ezreal Alternate Art"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="card-foil-overlay !opacity-60"></div>
                    <div className="absolute top-2 left-2 flex gap-1 z-10">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        NM
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        FOIL
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] text-cyan-400 font-bold block truncate">Riftbound TCG</span>
                    <h4 className="text-sm font-extrabold text-white truncate">Ezreal - Dashing (Alt Art)</h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Mejor oferta</span>
                        <span className="text-sm font-black text-amber-400 font-mono">$45.000 CLP</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium px-2 py-1 rounded bg-white/5 border border-white/10">
                        Rift Vault
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Annie Dark Child */}
                <div className="relative group rounded-2xl bg-[#111522] border border-white/10 p-4 hover:border-white/30 transition-all hover:-translate-y-1 shadow-lg">
                  <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-black/40 mb-3 border border-white/10">
                    <Image
                      src="/images/products/product-3-bg-1.png"
                      alt="Annie Dark Child"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        NM
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        FOIL
                      </span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] text-red-400 font-bold block truncate">Singles Sellados</span>
                    <h4 className="text-sm font-extrabold text-white truncate">Annie - Dark Child</h4>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <div>
                        <span className="text-[10px] text-gray-500 block">Mejor oferta</span>
                        <span className="text-sm font-black text-white font-mono">$22.000 CLP</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium px-2 py-1 rounded bg-white/5 border border-white/10">
                        TCG Chile
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Platform Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/[0.08]">
                <div className="text-center md:text-left">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono block">+850</span>
                  <span className="text-xs text-gray-400">Expansiones Sincronizadas</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono block">100%</span>
                  <span className="text-xs text-gray-400">Tiendas Verificadas con RUT</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-2xl sm:text-3xl font-black text-white font-mono block">24-48h</span>
                  <span className="text-xs text-gray-400">Envíos Chilexpress & Starken</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="text-2xl sm:text-3xl font-black text-[#E10E0E] font-mono block">$0</span>
                  <span className="text-xs text-gray-400">Retiro Presencial en Tienda</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          TCG GAMES SHOWCASE
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            Compatibilidad Universal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Soporte nativo para los Trading Card Games más populares
          </h2>
          <p className="text-gray-400 text-sm mt-2 max-w-2xl mx-auto">
            Catálogos sincronizados directamente con las APIs maestras globales para garantizar datos exactos de cartas, sets y rarezas.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {tcgGames.map((game) => (
            <div
              key={game.name}
              className={`p-4 rounded-2xl bg-gradient-to-b ${game.color} bg-white/[0.02] border transition-all hover:scale-[1.03] flex flex-col justify-between`}
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-75">
                  {game.badge}
                </span>
                <h4 className="text-sm font-extrabold text-white mt-1 leading-tight">{game.name}</h4>
              </div>
              <span className="text-[10px] text-gray-400 mt-3 block">{game.publisher}</span>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE DUAL AUDIENCE SWITCHER (Players vs Stores)
         ========================================================================= */}
      <section id="for-stores" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            Diseñado a tu Medida
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Una solución hecha para cada actor del TCG
          </h2>

          {/* Tab Selector */}
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 mt-6 backdrop-blur-md">
            <button
              type="button"
              onClick={() => setActiveTab("players")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "players"
                  ? "bg-[#E10E0E] text-white shadow-lg shadow-[#E10E0E]/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <IconCard className="w-4 h-4" /> Para Jugadores & Coleccionistas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("stores")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "stores"
                  ? "bg-[#E10E0E] text-white shadow-lg shadow-[#E10E0E]/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <IconStore className="w-4 h-4" /> Para Tiendas & Dealers (SaaS)
            </button>
          </div>
        </div>

        {/* Dynamic Tab Content */}
        {activeTab === "players" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl bg-[#111522] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500 mb-6">
                  <IconZap className="w-6 h-6 text-[#E10E0E]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Un Solo Carrito Multi-Tienda</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  ¿Necesitas cartas de 3 tiendas distintas? Agrégalas todas a un solo pedido. Pagas una única vez mediante Webpay o Mercado Pago y el sistema genera los envíos correspondientes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-gray-500 font-mono">
                ✓ Checkout consolidado • Sin transferencias manuales
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#111522] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
                  <IconSparkles className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Búsqueda Rápida Deckbuilder</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Pega tu lista de mazo completa o busca por edición, acabado (Foil / Normal) e idioma. Compara precios en vivo y adquiere las versiones más convenientes en segundos.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-gray-500 font-mono">
                ✓ Filtros por Foil, Idioma y Condición NM a DMG
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#111522] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                  <IconShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Garantía de Estado & Protección</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Solo comercios verificados con RUT. Si una carta no corresponde al estado descrito (Near Mint, Lightly Played), cuentas con mediación y reembolso garantizado.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-gray-500 font-mono">
                ✓ 100% Tiendas con respaldo legal en Chile
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl bg-[#111522] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
                  <IconBox className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Sincronización Scryfall & Pokémon</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Cero tipeo manual. Sincroniza sets completos con arte oficial, precios de referencia, texto de reglas y números de coleccionista con un solo clic.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-gray-500 font-mono">
                ✓ Catálogos actualizados automáticamente
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#111522] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6">
                  <IconTag className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Motor de Buylist Automatizado</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Permite a tus clientes venderte sus cartas. El sistema calcula devaluaciones automáticas por condición e idioma, liquidando en efectivo o crédito en tu tienda.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-gray-500 font-mono">
                ✓ Devaluaciones dinámicas configurables
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[#111522] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                  <IconTruck className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Logística Chilexpress & Starken</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Genera etiquetas oficiales en 1 clic. El cliente paga el envío según peso y comuna, y tú solo imprimes la guía para entregar en sucursal.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 text-xs text-gray-500 font-mono">
                ✓ Tarifas preferenciales integradas
              </div>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          BENTO GRID: CARACTERÍSTICAS TÉCNICAS
         ========================================================================= */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            Arquitectura de Grado Profesional
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Todo lo necesario para operar tu negocio de TCG
          </h2>
          <p className="text-gray-400 text-base max-w-2xl mx-auto mt-3">
            Construido con tecnología moderna para asegurar que tu tienda nunca se caiga en lanzamientos de nuevas expansiones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento 1: Vitrina con Subdominio */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-[#0E121B] border border-white/10 hover:border-white/20 transition-all relative overflow-hidden group">
            <div className="relative z-10">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600/20 text-blue-400 border border-blue-500/30 mb-4 inline-block">
                Multi-tenant SaaS
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">Vitrina Digital con Subdominio Propio</h3>
              <p className="text-gray-400 text-sm max-w-lg mb-6 leading-relaxed">
                Obtén tu propia tienda online personalizada (ej: <span className="text-white font-mono">mitienda.taptrade.cl</span>) con tu logotipo, redes sociales, horarios de atención presencial y catálogo exclusivo, además de figurar en el marketplace nacional.
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Responsive Dark Vault • Optimizado para móviles</span>
              </div>
            </div>
          </div>

          {/* Bento 2: Split Payments */}
          <div className="p-8 rounded-3xl bg-[#0E121B] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-4 inline-block">
                Finanzas Claras
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Split Payments Automáticos</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                El dinero de tus ventas se deposita directamente en tu cuenta bancaria. Liquidaciones transparentes con Mercado Pago y Transbank Webpay Plus.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 text-xs text-gray-400 font-mono">
              ✓ Cero demoras en pagos
            </div>
          </div>

          {/* Bento 3: Radar de Precios */}
          <div className="p-8 rounded-3xl bg-[#0E121B] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-400 border border-purple-500/30 mb-4 inline-block">
                Inteligencia Comercial
              </span>
              <h3 className="text-xl font-bold text-white mb-2">Radar de Precios de Mercado</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Consulta los precios históricos y actuales de cada carta para ajustar tu stock sin vender bajo el costo de reposición.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 text-xs text-gray-400 font-mono">
              ✓ Comparativas Scryfall & TCGPlayer
            </div>
          </div>

          {/* Bento 4: Crédito en Tienda */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-[#0E121B] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-4 inline-block">
                Fidelización Activa
              </span>
              <h3 className="text-2xl font-bold text-white mb-2">Billetera de Crédito en Tienda (Store Credit)</h3>
              <p className="text-gray-400 text-sm max-w-lg mb-6 leading-relaxed">
                Retén el capital dentro de tu negocio. Ofrece hasta un 20% o 30% extra en crédito en tienda a los clientes que te vendan singles por Buylist, asegurando que reinviertan su saldo en tus productos.
              </p>
            </div>
            <div className="pt-4 border-t border-white/5 text-xs text-gray-400 font-mono">
              ✓ Saldo digital asociado a la cuenta del usuario
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CÓMO FUNCIONA: 3 PASOS
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            Flujo Sin Fricción
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">¿Cómo funciona TapTrade?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#E10E0E]/20 text-[#E10E0E] font-mono font-black text-lg flex items-center justify-center mx-auto mb-6 border border-[#E10E0E]/30">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Conecta tu Tienda o Busca Singles</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Las tiendas suben su stock en segundos mediante importador masivo o sincronización Scryfall. Los jugadores exploran miles de cartas con filtros por edición, estado e idioma.
            </p>
          </div>

          <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 font-mono font-black text-lg flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Pago Único con Respaldo Escrow</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              El comprador paga con Webpay Plus o Mercado Pago. El dinero queda protegido y se distribuye automáticamente a cada tienda vendedora.
            </p>
          </div>

          <div className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/10 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-black text-lg flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Despacho Express o Retiro $0</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              La tienda genera la etiqueta de Chilexpress o Starken con 1 clic. El comprador hace seguimiento en vivo o retira presencialmente sin costo de envío.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PLANES Y PRECIOS DINÁMICOS DESDE LA BASE DE DATOS
         ========================================================================= */}
      <div id="pricing" className="relative z-10">
        <PricingSection />
      </div>

      {/* =========================================================================
          FAQ: PREGUNTAS FRECUENTES INTERACTIVAS
         ========================================================================= */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/5">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E10E0E] block mb-2">
            Resolvemos tus Dudas
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Preguntas Frecuentes</h2>
          <p className="text-gray-400 text-sm mt-2">
            Todo lo que necesitas saber antes de comprar o vender en la plataforma.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-[#0E121B] border border-white/10 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-red-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className={`text-xl transition-transform font-mono ${isOpen ? "rotate-45 text-[#E10E0E]" : "text-gray-400"}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-3 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          FINAL HIGH-CONVERTING CTA BANNER
         ========================================================================= */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative rounded-3xl bg-gradient-to-r from-red-950/60 via-[#111522] to-amber-950/40 border border-red-500/30 p-8 sm:p-14 text-center overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          <span className="text-xs font-bold font-mono uppercase tracking-widest text-amber-400 mb-3 inline-block">
            El Futuro del TCG en Chile Comienza Aquí
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white max-w-3xl mx-auto leading-tight mb-6">
            ¿Listo para llevar tu colección o tu tienda al siguiente nivel?
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Únete a la comunidad de tiendas especializadas y coleccionistas que ya operan con la tecnología de TapTrade.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-4 bg-[#E10E0E] hover:bg-[#F23030] text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-[#E10E0E]/40 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <IconSparkles className="w-4 h-4 text-white" />
              Explorar Singles en Vivo
            </Link>
            <Link
              href="/admin/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <IconStore className="w-4 h-4 text-white" />
              Ingresar como Tienda
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
