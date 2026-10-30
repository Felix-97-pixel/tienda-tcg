"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { adminLogout } from "@/redux/features/admin-auth-slice";
import { API_URL } from "@/utils/api";

import SuperAdminGuard from "@/app/superadmin/_components/SuperAdminGuard";
import { ReduxProvider } from "@/redux/provider";
import ToastContainer from "@/components/layout/ToastContainer";
import { useAppSelector } from "@/redux/store";
import {
  IconStore,
  IconWallet,
  IconCard,
  IconTag,
  IconZap,
  IconDownload,
  IconSliders,
  IconGamepad,
  IconTicket,
  IconCoins,
  IconMapPin,
  IconArrowLeft,
  IconLogout,
  IconX,
  IconSettings,
} from "@/components/ui/Icons";

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  exact?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

function SuperAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isHub = pathname === "/superadmin";

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/admin/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    dispatch(adminLogout());
    router.push("/admin/login");
  };

  const { user } = useAppSelector((state) => state.adminAuthReducer) || { user: null };

  const sections: NavSection[] = [
    {
      title: "Gestión Comercial",
      items: [
        { path: "/superadmin/stores", label: "Empresas & Sucursales", icon: <IconStore className="w-4 h-4" /> },
        { path: "/superadmin/payouts", label: "Payouts (Liquidaciones)", icon: <IconWallet className="w-4 h-4" /> },
      ],
    },
    {
      title: "Catálogo Maestro",
      items: [
        { path: "/superadmin/products", label: "Productos Globales", icon: <IconCard className="w-4 h-4" /> },
        { path: "/superadmin/categories", label: "Categorías", icon: <IconTag className="w-4 h-4" /> },
        { path: "/superadmin/brands", label: "Marcas", icon: <IconSliders className="w-4 h-4" /> },
      ],
    },
    {
      title: "Sincronización TCG",
      items: [
        { path: "/superadmin/sync/magic", label: "Magic: The Gathering", icon: <IconZap className="w-4 h-4" /> },
        { path: "/superadmin/sync/pokemon", label: "Pokémon TCG", icon: <IconZap className="w-4 h-4" /> },
        { path: "/superadmin/sync/riftbound", label: "Riftbound TCG", icon: <IconZap className="w-4 h-4" /> },
        { path: "/superadmin/sync/backups", label: "Backups CSV", icon: <IconDownload className="w-4 h-4" /> },
      ],
    },
    {
      title: "Configuración Sistema",
      items: [
        { path: "/superadmin/config/plans", label: "Planes SaaS & Add-ons", icon: <IconTicket className="w-4 h-4" /> },
        { path: "/superadmin/config/features", label: "Funciones (Features)", icon: <IconSettings className="w-4 h-4" /> },
        { path: "/superadmin/config/expansions", label: "Mapeo de Expansiones", icon: <IconSliders className="w-4 h-4" /> },
        { path: "/superadmin/config/sync", label: "Destinos de Sincronización", icon: <IconSliders className="w-4 h-4" /> },
        { path: "/superadmin/config/games", label: "Juegos Soportados", icon: <IconGamepad className="w-4 h-4" /> },
        { path: "/superadmin/config/currencies", label: "Divisas & Tasas", icon: <IconCoins className="w-4 h-4" /> },
        { path: "/superadmin/config/locations", label: "Regiones y Comunas", icon: <IconMapPin className="w-4 h-4" /> },
      ],
    },
  ];

  return (
    <SuperAdminGuard>
      <div className="relative flex h-screen overflow-hidden bg-[#07090E] text-white">
        {/* Ambient lighting & subtle grid */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="fixed top-[-10%] left-[25%] w-[600px] h-[350px] bg-red/10 blur-[150px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[10%] w-[500px] h-[300px] bg-indigo-900/10 blur-[160px] pointer-events-none" />

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            aria-hidden="true"
          />
        )}

        {/* SIDEBAR PARA SUPER ADMIN (Permanente y categorizada) */}
        {!isHub && (
          <aside
            className={`fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col overflow-y-hidden bg-[#0B0E17] border-r border-white/10 duration-300 ease-in-out lg:static lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0 shadow-2xl shadow-black/80" : "-translate-x-full"
            }`}
          >
            {/* Logo & Header */}
            <div className="flex items-center justify-between gap-2 px-5 py-4 sm:px-6 sm:py-5 border-b border-white/5 bg-[#080A10]">
              <Link href="/superadmin" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
                <div className="w-9 h-9 bg-gradient-to-br from-red-dark to-red rounded-xl flex items-center justify-center shadow-lg shadow-red/25 border border-white/10 group-hover:scale-105 transition-transform">
                  <span className="text-white font-black text-lg">S</span>
                </div>
                <div>
                  <h1 className="text-base font-black text-white tracking-tight leading-none">
                    Tap<span className="text-red">Master</span>
                  </h1>
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mt-1">
                    SuperAdmin Vault
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
              {/* Back to Hub Link */}
              <div>
                <Link
                  href="/superadmin"
                  onClick={() => setSidebarOpen(false)}
                  className="group relative flex items-center gap-3 rounded-xl py-2 px-3 font-bold text-xs text-white/70 bg-white/[0.03] border border-white/10 hover:border-red/40 hover:bg-red/10 hover:text-white transition-all duration-200 shadow-sm"
                >
                  <IconArrowLeft className="w-4 h-4 text-white/60 group-hover:text-red transition-colors" />
                  <span>Volver al Hub</span>
                </Link>
              </div>

              {/* Categorized Sections */}
              {sections.map((section) => (
                <div key={section.title} className="space-y-1.5">
                  <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map(({ path, label, icon, exact }) => {
                      const isActive = exact ? pathname === path : pathname === path || pathname.startsWith(path + "/");
                      return (
                        <li key={path}>
                          <Link
                            href={path}
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
                  SA
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-white truncate uppercase tracking-tight">Super Admin</p>
                  <p className="text-[9px] text-white/40 truncate font-medium">TapMaster HQ</p>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* CONTENT AREA */}
        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-w-0">
          {/* Header */}
          {!isHub && (
            <header className="sticky top-0 z-40 flex w-full bg-[#0E121B]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
              <div className="flex flex-grow items-center justify-between px-6 py-4 md:px-8 2xl:px-11">
                <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="block rounded-xl border border-white/10 bg-white/5 p-2 shadow-sm text-white/80 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                    </svg>
                  </button>
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-bold text-white/50 uppercase tracking-[0.1em]">
                    ADMINISTRACIÓN GLOBAL <span className="text-red mx-1.5 font-black">/</span>{" "}
                    <span className="text-white">RESUMEN GENERAL</span>
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <span className="block text-xs font-black text-white">{user?.name || "Félix (Super Admin)"}</span>
                    <span className="inline-block text-[9px] font-black text-red uppercase tracking-widest px-2 py-0.5 rounded-full bg-red/10 border border-red/20">
                      SUPER ADMIN
                    </span>
                  </div>
                  <Link
                    href="/superadmin"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 hover:border-red/40 hover:bg-red/10 text-xs font-bold text-white/70 hover:text-white transition-all"
                  >
                    <IconArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver al Menú</span>
                  </Link>
                </div>
              </div>
            </header>
          )}

          <main className="flex-1 p-4 md:p-6 2xl:p-10">{children}</main>
        </div>
      </div>
      <ToastContainer />
    </SuperAdminGuard>
  );
}

export default function SuperAdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <SuperAdminLayoutContent>{children}</SuperAdminLayoutContent>
    </ReduxProvider>
  );
}
