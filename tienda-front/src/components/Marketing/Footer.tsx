import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#0b0c0f] border-t border-white/5 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-red to-orange flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">TapTrade</span>
          </Link>
          <p className="text-gray-4 text-sm max-w-xs">
            La primera plataforma SaaS en Latinoamérica diseñada específicamente para dueños de tiendas de TCG.
          </p>
        </div>
        
        <div>
          <h3 className="text-white font-semibold mb-4">Producto</h3>
          <ul className="space-y-3">
            <li><Link href="#features" className="text-gray-4 hover:text-white text-sm transition-colors">Características</Link></li>
            <li><Link href="#pricing" className="text-gray-4 hover:text-white text-sm transition-colors">Precios</Link></li>
            <li><Link href="/admin/login" className="text-gray-4 hover:text-white text-sm transition-colors">Iniciar Sesión Admin</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-4">Legal</h3>
          <ul className="space-y-3">
            <li><Link href="/politica-de-privacidad" className="text-gray-4 hover:text-white text-sm transition-colors">Privacidad</Link></li>
            <li><Link href="/terminos-y-condiciones" className="text-gray-4 hover:text-white text-sm transition-colors">Términos</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-gray-5 text-xs">
          © {new Date().getFullYear()} TapTrade. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
