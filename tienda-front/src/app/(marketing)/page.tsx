import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function MarketingPage() {
  return (
    <div className="w-full relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-blue/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm">
          <span className="flex w-2 h-2 rounded-full bg-red animate-pulse"></span>
          <span className="text-xs font-medium text-gray-300">El Marketplace definitivo para TCG en Chile</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-6 max-w-4xl">
          Compra singles de las mejores <br className="hidden md:block" />
          tiendas del país en <span className="text-transparent bg-clip-text bg-gradient-to-r from-red to-orange">un solo lugar.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          TapTrade centraliza el inventario de las tiendas y dealers más confiables de Chile. Busca, compara precios, añade a un solo carrito y recibe en la puerta de tu casa con total seguridad.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/shop" className="w-full sm:w-auto px-8 py-4 bg-white text-[#0f1115] font-semibold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Explorar Singles
          </Link>
          <Link href="/explore" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-full hover:bg-white/10 border border-white/10 transition-colors backdrop-blur-sm">
            Explorar
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">La forma más segura de coleccionar</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Nuestra prioridad es la confianza entre compradores y vendedores.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-red/20 text-red flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Tiendas Verificadas</h3>
            <p className="text-gray-400 leading-relaxed">
              Solo trabajamos con tiendas y dealers de confianza previamente autorizados, garantizando que recibas exactamente lo que compraste.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-blue/20 text-blue flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Un Solo Carrito</h3>
            <p className="text-gray-400 leading-relaxed">
              ¿Quieres singles de 3 tiendas distintas? No hay problema. Agrega todo a un solo carrito y haz un único pago seguro.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Búsqueda Global</h3>
            <p className="text-gray-400 leading-relaxed">
              Encuentra ese single difícil en el idioma, edición y estado exacto que necesitas explorando el inventario de todo Chile a la vez.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">Escala tu negocio sin límites</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">Planes diseñados para adaptarse al volumen de tu inventario. Menores comisiones mientras más creces.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Plan 1: Dealer */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300 relative flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Dealer</h3>
            <p className="text-gray-400 text-sm mb-6 h-10">Para vendedores serios y carpetas de alto valor.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">1.5 UF</span><span className="text-gray-400">/mes</span>
              <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">+ IVA</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
              <li className="flex items-center gap-3"><span className="text-red">✓</span> Hasta 3.000 SKUs</li>
              <li className="flex items-center gap-3"><span className="text-red">✓</span> 6.5% comisión por venta</li>
              <li className="flex items-center gap-3"><span className="text-red">✓</span> Soporte estándar</li>
            </ul>
            <Link href="mailto:contacto@taptrade.cl" className="w-full text-center py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors">Solicitar Acceso</Link>
          </div>

          {/* Plan 2: Store */}
          <div className="bg-gradient-to-b from-blue/10 to-transparent border border-blue/30 rounded-3xl p-8 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300 relative flex flex-col shadow-[0_0_30px_rgba(59,130,246,0.15)]">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Más Popular</div>
            <h3 className="text-xl font-bold text-white mb-2">Store</h3>
            <p className="text-gray-400 text-sm mb-6 h-10">Ideal para tiendas tradicionales con vitrinas.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">3.5 UF</span><span className="text-gray-400">/mes</span>
              <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">+ IVA</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
              <li className="flex items-center gap-3"><span className="text-blue">✓</span> Hasta 15.000 SKUs</li>
              <li className="flex items-center gap-3"><span className="text-blue">✓</span> 5.5% comisión por venta</li>
              <li className="flex items-center gap-3"><span className="text-blue">✓</span> Posicionamiento destacado</li>
            </ul>
            <Link href="mailto:contacto@taptrade.cl" className="w-full text-center py-3 rounded-xl bg-blue text-white font-semibold hover:bg-blue-light transition-colors shadow-lg shadow-blue/20">Comenzar Ahora</Link>
          </div>

          {/* Plan 3: Mega Store */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300 relative flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Mega Store</h3>
            <p className="text-gray-400 text-sm mb-6 h-10">Para líderes con alto volumen de ventas.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">7 UF</span><span className="text-gray-400">/mes</span>
              <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">+ IVA</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
              <li className="flex items-center gap-3"><span className="text-orange-400">✓</span> Hasta 60.000 SKUs</li>
              <li className="flex items-center gap-3"><span className="text-orange-400">✓</span> 4% comisión por venta</li>
              <li className="flex items-center gap-3"><span className="text-orange-400">✓</span> Account Manager dedicado</li>
            </ul>
            <Link href="mailto:contacto@taptrade.cl" className="w-full text-center py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors">Contactar Ventas</Link>
          </div>

          {/* Plan 4: Enterprise */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:-translate-y-2 transition-transform duration-300 relative flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
            <p className="text-gray-400 text-sm mb-6 h-10">Para distribuidores y ventas masivas online.</p>
            <div className="mb-6">
              <span className="text-4xl font-extrabold text-white">15 UF</span><span className="text-gray-400">/mes</span>
              <p className="text-xs text-gray-400 font-bold tracking-widest uppercase mt-1">+ IVA</p>
            </div>
            <ul className="space-y-4 mb-8 flex-1 text-sm text-gray-300">
              <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> SKUs Ilimitados</li>
              <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> 3% comisión por venta</li>
              <li className="flex items-center gap-3"><span className="text-purple-400">✓</span> API y Soporte 24/7</li>
            </ul>
            <Link href="mailto:contacto@taptrade.cl" className="w-full text-center py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors">Contactar Ventas</Link>
          </div>
        </div>

        {/* Addons Section */}
        <div className="mt-16 bg-[#1a1d24]/50 border border-white/5 rounded-3xl p-8 md:p-12">
          <h3 className="text-2xl font-bold text-white mb-2 text-center">Potencia tu negocio con Módulos Premium</h3>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">Agrega funcionalidades avanzadas a tu tienda cuando estés listo para escalar al siguiente nivel.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-6 items-start hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-white">Estadísticas Detalladas</h4>
                  <span className="text-sm font-bold text-teal-400">+ 0.5 UF/mes</span>
                </div>
                <p className="text-gray-400 text-sm">Desbloquea paneles avanzados para analizar tus ventas, rotación de inventario y tendencias del mercado en tiempo real.</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-6 items-start hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-white">Buylist Automatizada</h4>
                  <span className="text-sm font-bold text-yellow-400">+ 1 UF/mes</span>
                </div>
                <p className="text-gray-400 text-sm">Permite que tus clientes te vendan sus cartas a través de un portal automatizado con tus propios precios de compra.</p>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex gap-6 items-start hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 shrink-0 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-bold text-white">Radar de Demanda</h4>
                  <span className="text-sm font-bold text-purple-400">+ 0.5 UF/mes</span>
                </div>
                <p className="text-gray-400 text-sm">Visualiza las Wishlists de los jugadores para saber exactamente qué cartas debes reponer y vender más rápido.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
