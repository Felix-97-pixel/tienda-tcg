import React from "react";
import Link from "next/link";
import { ShippingBadge } from "@/components/ui/ShippingBadge";
import { IconShieldCheck } from "@/components/ui/Icons";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#07090E] text-white border-t border-white/[0.08] overflow-hidden">
      {/* Top logistics assurance strip */}
      <div className="border-b border-white/[0.05] bg-[#0A0D14]/80 py-4">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium">Envíos y Logística Oficial:</span>
            <div className="flex items-center gap-2">
              <ShippingBadge name="retiro_tienda" size="sm" />
              <ShippingBadge name="chilexpress" size="sm" />
              <ShippingBadge name="starken" size="sm" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <IconShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Transacciones protegidas con Mercado Pago & Webpay
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-emerald-400 font-mono">100% Tiendas Verificadas</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.06]">
          {/* Col 1: Brand & SpA Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-dark via-red to-orange flex items-center justify-center shadow-lg shadow-red/30 group-hover:scale-105 transition-all border border-white/10">
                <span className="text-white font-black text-xl leading-none">T</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white leading-none">
                  Tap<span className="text-red">Trade</span>
                </span>
                <span className="text-[10px] font-mono tracking-widest text-red-light uppercase font-bold mt-0.5">
                  TCG Marketplace
                </span>
              </div>
            </Link>

            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              El marketplace de cartas coleccionables líder en Chile. Conectamos tiendas especializadas y jugadores competitivos para comprar y vender singles con cotización de envíos en tiempo real.
            </p>

            <div className="space-y-1 text-xs text-gray-400 font-mono pt-2">
              <p className="text-gray-300 font-bold">TAPTRADE SpA</p>
              <p>RUT: 78.531.106-K</p>
              <p>Padre Mariano 98 Of. 315, Providencia, Santiago</p>
            </div>
          </div>

          {/* Col 2: Juegos TCG */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-4 font-mono">
              Juegos TCG
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/shop?category=Singles%20Magic%20The%20Gathering" className="hover:text-white transition-colors">
                  Magic: The Gathering
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Singles%20Pokemon" className="hover:text-white transition-colors">
                  Pokémon TCG
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Singles%20Yu-Gi-Oh!" className="hover:text-white transition-colors">
                  Yu-Gi-Oh!
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Singles%20One%20Piece" className="hover:text-white transition-colors">
                  One Piece Card Game
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Singles%20Riftbound" className="hover:text-white transition-colors">
                  Riftbound TCG
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Singles%20Mitos%20y%20Leyendas" className="hover:text-white transition-colors">
                  Mitos y Leyendas
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navegación */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-4 font-mono">
              Marketplace
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  Explorar Catálogo
                </Link>
              </li>
              <li>
                <Link href="/sealed" className="hover:text-white transition-colors">
                  Cajas y Boosters Sellados
                </Link>
              </li>
              <li>
                <Link href="/landing" className="hover:text-white transition-colors">
                  Directorio de Tiendas
                </Link>
              </li>
              <li>
                <Link href="/admin/buylist" className="hover:text-white transition-colors">
                  Vender Cartas (Buylist)
                </Link>
              </li>
              <li>
                <Link href="/my-account" className="hover:text-white transition-colors">
                  Mi Cuenta de Coleccionista
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Soporte */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-4 font-mono">
              Soporte y Legal
            </h3>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Centro de Ayuda
                </Link>
              </li>
              <li>
                <Link href="/terminos-y-condiciones" className="hover:text-white transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidad" className="hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/56950223095"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>WhatsApp: +56 9 5022 3095</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:contacto@taptrade.cl"
                  className="hover:text-white transition-colors"
                >
                  contacto@taptrade.cl
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>© {year} TAPTRADE SpA. Todos los derechos reservados. Desarrollado para coleccionistas.</p>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-400">Medios de Pago:</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300">
              Webpay Plus
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300">
              Mercado Pago
            </span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-300">
              Débito / Crédito
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
