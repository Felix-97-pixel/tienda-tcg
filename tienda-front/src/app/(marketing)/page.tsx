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
          <span className="text-xs font-medium text-gray-300">La nueva era del TCG E-commerce</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 mb-6 max-w-4xl">
          Tu tienda de TCG, <br className="hidden md:block" />
          lista en <span className="text-transparent bg-clip-text bg-gradient-to-r from-red to-orange">minutos.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
          TapTrade es la primera plataforma SaaS en Latinoamérica diseñada para dueños de tiendas de cartas. Olvídate de cargar miles de productos manualmente; usa nuestro catálogo global y enfócate en vender.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-white text-dark font-semibold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Comenzar Gratis
          </Link>
          <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white font-semibold rounded-full hover:bg-white/10 border border-white/10 transition-colors backdrop-blur-sm">
            Explorar Funciones
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Todo lo que necesitas, en un solo lugar</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Potencia tu negocio con herramientas diseñadas específicamente para el ecosistema TCG.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-red/20 text-red flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Catálogo Global</h3>
            <p className="text-gray-400 leading-relaxed">
              No pierdas tiempo subiendo imágenes o traduciendo cartas. Nuestro catálogo centralizado tiene todo listo para ti.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-blue/20 text-blue flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Inventario Independiente</h3>
            <p className="text-gray-400 leading-relaxed">
              Define tu propio stock, precio, idioma y estado (Condition) para cada carta. Tú tienes el control total.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/[0.07] transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">Envíos a tu Medida</h3>
            <p className="text-gray-400 leading-relaxed">
              Configura tus propios métodos de envío (Starken, Chilexpress) y ajusta los precios según tu conveniencia.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section (Simple) */}
      <section id="pricing" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
        <div className="bg-gradient-to-br from-[#1a1d24] to-[#0f1115] border border-white/10 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Abre tu tienda hoy mismo</h2>
            <p className="text-gray-400 max-w-xl text-lg">Únete a la revolución del TCG en LATAM. Administra tu inventario como un profesional y aumenta tus ventas.</p>
          </div>
          <Link href="/signup" className="shrink-0 px-8 py-4 bg-gradient-to-r from-red to-orange text-white font-bold rounded-full hover:scale-105 transition-transform shadow-lg shadow-red/25">
            Comenzar mi Tienda
          </Link>
        </div>
      </section>
    </div>
  );
}
