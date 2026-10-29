"use client";
import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";
import { adminLogout } from "@/redux/features/admin-auth-slice";
import { API_URL } from "@/utils/api";
import {
  IconPos,
  IconOrders,
  IconReceipt,
  IconCard,
  IconBox,
  IconRepeat,
  IconRefresh,
  IconCreditCard,
  IconHeart,
  IconBarChart,
  IconPieChart,
  IconWallet,
  IconStore,
  IconTruck,
  IconTicket,
  IconCoins,
  IconGamepad,
  IconSliders,
  IconArrowLeft,
  IconLogout,
  IconX,
} from "@/components/ui/Icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const tc = useTranslations("common");

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/admin/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    dispatch(adminLogout());
    router.push("/admin/login");
  };

  const sections: NavSection[] = [
    {
      title: "Operaciones",
      items: [
        { href: "/admin/pos", label: "Punto de Venta (POS)", icon: <IconPos className="w-4 h-4" /> },
        { href: "/admin/transactions", label: "Transacciones & Caja", icon: <IconReceipt className="w-4 h-4" /> },
        { href: "/admin/orders", label: "Despachos & Pedidos", icon: <IconOrders className="w-4 h-4" /> },
        { href: "/admin/store-credit", label: "Crédito de Tienda", icon: <IconCreditCard className="w-4 h-4" /> },
      ],
    },
    {
      title: "Catálogo",
      items: [
        { href: "/admin/products", label: "Singles", icon: <IconCard className="w-4 h-4" /> },
        { href: "/admin/sealed", label: "Sellado", icon: <IconBox className="w-4 h-4" /> },
        { href: "/admin/buylist", label: "Buylist", icon: <IconRepeat className="w-4 h-4" /> },
        { href: "/admin/price-sync", label: "Sincronizar Precios", icon: <IconRefresh className="w-4 h-4" /> },
        { href: "/admin/wishlist", label: "Lista de Deseos", icon: <IconHeart className="w-4 h-4" /> },
      ],
    },
    {
      title: "Métricas & Finanzas",
      items: [
        { href: "/admin/sales", label: "Reportes & Analítica", icon: <IconPieChart className="w-4 h-4" /> },
        { href: "/admin/wallet", label: "Billetera & Retiros", icon: <IconWallet className="w-4 h-4" /> },
      ],
    },
    {
      title: "Configuración",
      items: [
        { href: "/admin/profile", label: "Mi Tienda", icon: <IconStore className="w-4 h-4" /> },
        { href: "/admin/shipping", label: "Métodos de Envío", icon: <IconTruck className="w-4 h-4" /> },
        { href: "/admin/coupons", label: "Cupones de Descuento", icon: <IconTicket className="w-4 h-4" /> },
        { href: "/admin/currencies", label: "Divisas", icon: <IconCoins className="w-4 h-4" /> },
        { href: "/admin/games", label: "Juegos Soportados", icon: <IconGamepad className="w-4 h-4" /> },
        { href: "/admin/devaluations", label: "Reglas de Estado", icon: <IconSliders className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col overflow-y-hidden bg-[#0B0E17] border-r border-white/10 duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl shadow-black/80" : "-translate-x-full"
        }`}
      >
        {/* Logo & Header */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 sm:px-6 sm:py-5 border-b border-white/5 bg-[#080A10]">
          <Link href="/admin" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 bg-gradient-to-br from-red-dark to-red rounded-xl flex items-center justify-center shadow-lg shadow-red/25 border border-white/10 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg">T</span>
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight leading-none">
                Tap<span className="text-red">Trade</span>
              </h1>
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mt-1">
                Admin Vault
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 lg:hidden transition-colors"
            aria-label="Cerrar barra lateral"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex flex-col overflow-y-auto flex-1 px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          {/* Hub Link */}
          <div>
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
              className="group relative flex items-center gap-3 rounded-xl py-2 px-3 font-bold text-xs text-white/70 bg-white/[0.03] border border-white/10 hover:border-red/40 hover:bg-red/10 hover:text-white transition-all duration-200 shadow-sm"
            >
              <IconArrowLeft className="w-4 h-4 text-white/60 group-hover:text-red transition-colors" />
              <span>Volver al Hub</span>
            </Link>
          </div>

          {/* Dynamic Categorized Sections */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map(({ href, label, icon }) => {
                  const isActive = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setSidebarOpen(false)}
                        className={`group relative flex items-center gap-3 rounded-xl py-2.5 px-3 font-semibold text-xs transition-all duration-200 border ${
                          isActive
                            ? "bg-gradient-to-r from-red-dark to-red text-white shadow-md shadow-red/25 border-red/40 font-bold"
                            : "text-white/60 hover:bg-white/[0.04] hover:text-white border-transparent"
                        }`}
                      >
                        <span
                          className={`${
                            isActive ? "text-white" : "text-white/40 group-hover:text-red-light transition-colors"
                          }`}
                        >
                          {icon}
                        </span>
                        <span className="truncate">{label}</span>
                        {isActive && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Info & Logout */}
        <div className="p-4 border-t border-white/10 bg-[#07090F] space-y-2.5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-white/60 hover:text-red hover:bg-red/10 hover:border-red/30 transition-all border border-white/10"
          >
            <IconLogout className="w-4 h-4" />
            <span>CERRAR SESIÓN</span>
          </button>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-dark to-red flex items-center justify-center text-[10px] font-black text-white shadow-md shadow-red/20">
              AD
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate uppercase tracking-tight">
                {tc("admin")}
              </p>
              <p className="text-[9px] text-white/40 truncate font-medium">TapTrade Vault v2.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
