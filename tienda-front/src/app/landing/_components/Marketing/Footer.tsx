import React from "react";
import Link from "next/link";
import { IconShieldCheck, IconTruck, IconCreditCard } from "@/components/ui/Icons";

const Footer = () => {
  return (
    <footer className="bg-[#07090E] border-t border-white/[0.08] text-white pt-16 pb-12 mt-24 relative overflow-hidden">
      {/* Glow orb */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#E10E0E]/5 blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Trust Badges Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-white/[0.06]">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
              <IconShieldCheck className="w-5 h-5 text-[#E10E0E]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Tiendas Verificadas</h4>
              <p className="text-xs text-gray-400">Comercios formales en Chile con inventario verificado.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <IconTruck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Logística Oficial Integrada</h4>
              <p className="text-xs text-gray-400">Chilexpress, Starken y Retiro en Tienda $0 en todo Chile.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <IconCreditCard className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Pagos Seguros & Custodia</h4>
              <p className="text-xs text-gray-400">Recaudación protegida y depósitos a la cuenta de tu empresa.</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-white/[0.06]">
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#E10E0E] via-[#F23030] to-amber-500 flex items-center justify-center shadow-lg shadow-[#E10E0E]/20">
                <span className="text-white font-black text-sm font-mono">T</span>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Tap<span className="text-red">Trade</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-4">
              La plataforma SaaS y marketplace líder para Trading Card Games en Chile. Centralizamos inventarios, automatizamos buylists y conectamos a tiendas y coleccionistas.
            </p>
            <div className="text-xs text-gray-500 font-mono space-y-1">
              <p className="text-gray-400 font-semibold">TAPTRADE SpA</p>
              <p>RUT: 78.531.106-K</p>
              <p>Padre Mariano 98 Of. 315, Providencia, Santiago</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Marketplace</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/shop" className="hover:text-white transition-colors">Catálogo de Singles</Link></li>
              <li><Link href="/shop?category=Singles%20Magic%20The%20Gathering" className="hover:text-white transition-colors">Magic: The Gathering</Link></li>
              <li><Link href="/shop?category=Singles%20Pokemon" className="hover:text-white transition-colors">Pokémon TCG</Link></li>
              <li><Link href="/shop?category=Singles%20Riftbound" className="hover:text-white transition-colors">Riftbound TCG</Link></li>
              <li><Link href="/cart" className="hover:text-white transition-colors">Carrito Unificado</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Para Tiendas</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/admin/login" className="hover:text-white transition-colors">Portal de Tiendas</Link></li>
              <li><Link href="/admin/buylist" className="hover:text-white transition-colors">Motor de Buylist</Link></li>
              <li><Link href="#pricing" className="hover:text-white transition-colors">Planes y Suscripción SaaS</Link></li>
              <li><Link href="#features" className="hover:text-white transition-colors">Sincronización Scryfall</Link></li>
              <li><Link href="mailto:contacto@taptrade.cl" className="hover:text-white transition-colors">Contacto Ventas</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">Legal & Soporte</h3>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link href="/politica-de-privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              <li><Link href="/terminos-y-condiciones" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Centro de Ayuda</Link></li>
              <li><Link href="https://wa.me/56950223095" target="_blank" className="hover:text-white transition-colors">WhatsApp Soporte</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Logistics and Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} TAPTRADE SpA. Todos los derechos reservados. Desarrollado para coleccionistas.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] text-gray-400 font-medium">Logística y Pagos Oficiales:</span>
            <span className="px-2 py-0.5 rounded bg-black/60 border border-white/10 font-mono text-white text-[10px]">RETIRO $0</span>
            <span className="px-2 py-0.5 rounded bg-[#f6b400]/20 border border-[#f6b400]/40 text-[#f6b400] font-bold text-[10px]">chilexpress</span>
            <span className="px-2 py-0.5 rounded bg-[#009b3a]/20 border border-[#009b3a]/40 text-[#00b040] font-bold text-[10px]">starken</span>
            <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-[10px]">Mercado Pago</span>
            <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-400/30 text-red-300 font-bold text-[10px]">Webpay Plus</span>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-white/[0.04] text-[10px] text-gray-500 leading-relaxed">
          TapTrade isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
