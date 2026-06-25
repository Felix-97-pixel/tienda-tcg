import React from "react";
import Link from "next/link";
import Image from "next/image";
import PricingSection from "@/app/landing/_components/Marketing/PricingSection";

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
          <Link href="/" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-full hover:bg-white/10 border border-white/10 transition-colors backdrop-blur-sm">
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
      <PricingSection />
    </div>
  );
}
