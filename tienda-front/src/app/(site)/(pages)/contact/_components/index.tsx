"use client";
import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface FormData {
  name: string;
  email: string;
  phone: string;
  orderNumber: string;
  category: string;
  message: string;
}

function BoxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function StorefrontIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v5m-4 0h8m-9-9H5a2 2 0 01-2-2V7a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2a2 2 0 01-2 2h-2m-8-4h8a4 4 0 014 4v2a4 4 0 01-4 4H9a4 4 0 01-4-4V7a4 4 0 014-4z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

const CATEGORIES = [
  { id: "pedido", label: "Consulta de Pedido / Envío", icon: BoxIcon },
  { id: "tienda", label: "Afiliación de Tienda / Ventas", icon: StorefrontIcon },
  { id: "soporte", label: "Problema Técnico o de Cuenta", icon: WrenchIcon },
  { id: "torneo", label: "Alianzas y Eventos TCG", icon: TrophyIcon },
  { id: "otro", label: "Otra Consulta", icon: ChatIcon },
];

const FAQS = [
  {
    q: "¿Cuánto tarda en llegar mi pedido?",
    a: "Los envíos se procesan mediante Chilexpress y Starken en un plazo estimado de 24 a 48 horas hábiles tras el despacho de la tienda. Si seleccionaste retiro en tienda física ($0), recibirás una notificación cuando tu compra esté lista.",
  },
  {
    q: "¿Cómo funciona la Garantía y Custodia de Fondos (Escrow)?",
    a: "Tu dinero se retiene de forma 100% segura en la plataforma y solo se libera a la tienda vendedora cuando ingresa el número de seguimiento y confirmas la recepción conforme de tus cartas.",
  },
  {
    q: "¿Qué hago si una carta no corresponde a la condición publicada?",
    a: "Todas las tiendas de TapTrade están obligadas a clasificar según el estándar oficial (NM, LP, MP, HP, DMG). Si recibes algo distinto, abre un ticket de mediación desde tu panel o escríbenos a soporte@taptrade.cl para reemplazo o reembolso.",
  },
  {
    q: "¿Cómo puedo abrir una tienda y vender en TapTrade?",
    a: "Ofrecemos un modelo SaaS con 0% comisión sobre el valor de tus cartas. Solo necesitas registrarte como tienda, configurar tus datos de transferencia y sincronizar tu inventario.",
  },
];

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    orderNumber: "",
    category: "pedido",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    toast.success(`${label} copiado al portapapeles`);
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Por favor ingresa tu nombre completo");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }
    if (formData.message.trim().length < 10) {
      toast.error("El mensaje debe contener al menos 10 caracteres");
      return;
    }

    setLoading(true);

    // Simulación de envío con confirmación visual
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("¡Mensaje enviado con éxito a TapTrade!");
    }, 900);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      orderNumber: "",
      category: "pedido",
      message: "",
    });
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-white pt-24 sm:pt-28 pb-24 selection:bg-red selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-red/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-red-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-white/50 mb-8">
          <Link href="/" className="hover:text-red transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <span className="text-white font-semibold">Contacto & Soporte</span>
        </div>

        {/* Hero Section */}
        <div className="mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red/10 border border-red/20 text-red text-xs font-bold tracking-wider uppercase mb-4 shadow-sm shadow-red/20">
            <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
            Canales Oficiales TapTrade SpA
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            ¿En qué podemos <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">ayudarte hoy?</span>
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Atención especializada para compradores, coleccionistas y tiendas de cartas coleccionables. Respondemos en menos de 24 horas hábiles.
          </p>
        </div>

        {/* Main Grid: Info Cards (Left) + Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Información Corporativa y Canales Directos (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Identity Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0D111A]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-red/15 to-transparent rounded-bl-full pointer-events-none" />

              <div className="flex items-center gap-3.5 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-dark via-red to-orange flex items-center justify-center shadow-lg shadow-red/30 border border-white/10 shrink-0">
                  <span className="text-white font-black text-2xl leading-none">T</span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight leading-snug">
                    TAPTRADE SpA
                  </h2>
                  <p className="text-xs text-red font-mono tracking-wider font-semibold">
                    RUT Empresa • Santiago de Chile
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                El marketplace líder en Chile para comprar, vender y coleccionar cartas Magic: The Gathering, Pokémon TCG, Yu-Gi-Oh!, Riftbound y accesorios con garantía escrow.
              </p>

              {/* Status Badge */}
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span>Equipo de soporte activo • Lunes a Sábado</span>
              </div>
            </div>

            {/* Direct Channels */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0D111A]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl space-y-5">
              <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-white/50">
                Canales de Atención Directa
              </h3>

              {/* Channel 1: Correo Soporte */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-red/30 transition-all group flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-red/10 border border-red/20 flex items-center justify-center text-red shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Soporte a Pedidos & Compras</span>
                    <a href="mailto:soporte@taptrade.cl" className="text-sm font-bold text-white hover:text-red transition-colors">
                      soporte@taptrade.cl
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy("soporte@taptrade.cl", "Correo de soporte")}
                  className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5"
                  title="Copiar correo"
                >
                  {copiedEmail === "soporte@taptrade.cl" ? "Copiado!" : "Copiar"}
                </button>
              </div>

              {/* Channel 2: Correo General / Empresas */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-amber-500/30 transition-all group flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-medium block">Tiendas, Alianzas & Facturación</span>
                    <a href="mailto:contacto@taptrade.cl" className="text-sm font-bold text-white hover:text-amber-400 transition-colors">
                      contacto@taptrade.cl
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => handleCopy("contacto@taptrade.cl", "Correo general")}
                  className="px-2.5 py-1 text-xs rounded-md bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5"
                  title="Copiar correo"
                >
                  {copiedEmail === "contacto@taptrade.cl" ? "Copiado!" : "Copiar"}
                </button>
              </div>

              {/* Channel 3: Horarios & Cobertura */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Horario de Atención</span>
                  <p className="text-sm font-bold text-white">Lun - Vie: 09:00 a 19:00 hrs</p>
                  <p className="text-xs text-slate-400 mt-0.5">Sábados: 10:00 a 14:00 hrs (Hora Chile)</p>
                </div>
              </div>

              {/* Channel 4: Cobertura Logística */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0 mt-0.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Cobertura & Logística</span>
                  <p className="text-sm font-bold text-white">Santiago & Regiones de Chile</p>
                  <p className="text-xs text-slate-400 mt-0.5">Envíos vía Chilexpress, Starken y Retiro Presencial</p>
                </div>
              </div>
            </div>

            {/* Quick Action for Sellers */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-red/10 via-amber-500/10 to-transparent border border-red/20 flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-red uppercase tracking-wider block">¿Tienes una tienda TCG?</span>
                <p className="text-xs text-slate-300 mt-0.5">Vende sin comisiones por transacción.</p>
              </div>
              <Link
                href="/landing"
                className="px-3.5 py-2 rounded-xl bg-red hover:bg-red-dark text-white text-xs font-bold transition-all shadow-md shadow-red/30 shrink-0"
              >
                Vender Cartas
              </Link>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 lg:p-10 rounded-2xl bg-[#0D111A]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl relative">
              
              {submitted ? (
                /* Success View */
                <div className="py-12 text-center space-y-5 animate-fade-in">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">¡Mensaje Enviado con Éxito!</h3>
                    <p className="mt-2 text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                      Muchas gracias <span className="font-bold text-white">{formData.name}</span>. Hemos recibido tu consulta y nuestro equipo te responderá a <span className="font-bold text-red">{formData.email}</span> en menos de 24 horas hábiles.
                    </p>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={resetForm}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors border border-white/10"
                    >
                      Enviar otro mensaje
                    </button>
                    <Link
                      href="/shop"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red via-rose-600 to-amber-600 hover:opacity-90 text-white text-xs font-bold transition-opacity shadow-lg shadow-red/25"
                    >
                      Explorar el Catálogo TCG
                    </Link>
                  </div>
                </div>
              ) : (
                /* Form View */
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Envíanos un mensaje
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      Completa el formulario y te responderemos a tu correo a la brevedad.
                    </p>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2.5">
                      Motivo de contacto <span className="text-red">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {CATEGORIES.map((cat) => {
                        const IconComponent = cat.icon;
                        const isSelected = formData.category === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, category: cat.id })}
                            className={`p-2.5 rounded-xl text-left border transition-all text-xs flex items-center gap-2.5 group ${
                              isSelected
                                ? "bg-red/15 border-red text-white font-bold shadow-md shadow-red/20"
                                : "bg-[#121622] border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "bg-red text-white shadow-sm shadow-red/30"
                                  : "bg-white/5 text-slate-400 group-hover:text-white group-hover:bg-white/10"
                              }`}
                            >
                              <IconComponent className="w-3.5 h-3.5" />
                            </span>
                            <span className="truncate">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name and Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Nombre Completo <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="ej. Matías Valenzuela"
                        className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red focus:ring-1 focus:ring-red transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Correo Electrónico <span className="text-red">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red focus:ring-1 focus:ring-red transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone & Order Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        Teléfono / WhatsApp <span className="text-slate-500 font-normal lowercase">(opcional)</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+56 9 1234 5678"
                        className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red focus:ring-1 focus:ring-red transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                        N° de Orden / Pedido <span className="text-slate-500 font-normal lowercase">(opcional)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.orderNumber}
                        onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                        placeholder="ej. TT-1082"
                        className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red focus:ring-1 focus:ring-red transition-all"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Mensaje / Detalle de la consulta <span className="text-red">*</span>
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Escribe aquí tu consulta con el mayor detalle posible para darte una solución rápida..."
                      className="w-full px-4 py-3 rounded-xl bg-[#121622] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-red focus:ring-1 focus:ring-red transition-all resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Tus datos están protegidos por TapTrade SpA</span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-red via-rose-600 to-amber-600 hover:opacity-95 text-white font-bold text-sm tracking-wide transition-all shadow-xl shadow-red/30 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <span>Enviar Mensaje</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Frequently Asked Questions */}
        <div className="mt-20 pt-16 border-t border-white/[0.08]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-red">
              Centro de Ayuda Rápida
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Preguntas Frecuentes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Revisa las dudas más habituales sobre compras, despachos y garantías en TapTrade.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-[#0D111A]/90 border border-white/[0.08] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-red transition-colors"
                >
                  <span>{faq.q}</span>
                  <span
                    className={`w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 shrink-0 transition-all duration-200 ${
                      openFaq === idx ? "rotate-180 text-red bg-red/10" : ""
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
