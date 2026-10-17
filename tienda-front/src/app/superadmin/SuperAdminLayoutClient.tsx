"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth-slice";

import SuperAdminGuard from "@/app/superadmin/_components/SuperAdminGuard";
import { ReduxProvider } from "@/redux/provider";
import ToastContainer from "@/components/layout/ToastContainer";
import { useAppSelector } from "@/redux/store";

function SuperAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isHub = pathname === "/superadmin";

  const handleLogout = () => {
    dispatch(logout());
    router.push("/signin");
  };

  const { user } = useAppSelector((state) => state.authReducer) || { user: null };

  const dashboardItems = [
    {
      path: "/superadmin",
      label: "Dashboard",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      exact: true
    }
  ];

  const storeItems = [
    {
      path: "/superadmin/stores",
      label: "Gestión de Tiendas",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    },
    {
      path: "/superadmin/payouts",
      label: "Payouts (Pagos)",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    }
  ];

  const syncItems = [
    {
      path: "/superadmin/sync/magic",
      label: "Magic",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      path: "/superadmin/sync/pokemon",
      label: "Pokémon",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      path: "/superadmin/sync/riftbound",
      label: "Riftbound",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    },
    {
      path: "/superadmin/sync/backups",
      label: "Backups CSV",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
    },
  ];

  const configItems = [
    {
      path: "/superadmin/config/sync",
      label: "Destinos de Sincronización",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      path: "/superadmin/config/expansions",
      label: "Mapeo de Expansiones",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    },
    {
      path: "/superadmin/config/games",
      label: "Juegos Soportados",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>,
    },
    {
      path: "/superadmin/config/features",
      label: "Funciones (Features)",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
    },
    {
      path: "/superadmin/config/plans",
      label: "Planes de Suscripción",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
    },
    {
      path: "/superadmin/config/supported-currencies",
      label: "Divisas Soportadas",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      path: "/superadmin/config/currencies",
      label: "Tasas Globales por Juego",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    },
    {
      path: "/superadmin/config/locations",
      label: "Regiones y Comunas",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    }
  ];

  const catalogItems = [
    {
      path: "/superadmin/products",
      label: "Productos",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
    },
    {
      path: "/superadmin/categories",
      label: "Categorías",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    },
    {
      path: "/superadmin/brands",
      label: "Marcas",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143z" /></svg>,
    }
  ];

  const allMenuSections = [
    { title: "PANEL SUPERADMIN", items: dashboardItems },
    { title: "MÓDULO DE TIENDAS", items: storeItems },
    { title: "MÓDULO DE CATÁLOGO", items: catalogItems },
    { title: "SINCRONIZACIÓN", items: syncItems },
    { title: "MÓDULO DE CONFIGURACIÓN", items: configItems }
  ];

  let visibleSections = allMenuSections;
  if (pathname.startsWith("/superadmin/products") || pathname.startsWith("/superadmin/categories") || pathname.startsWith("/superadmin/brands")) {
    visibleSections = allMenuSections.filter(section => section.title === "MÓDULO DE CATÁLOGO");
  } else if (pathname.startsWith("/superadmin/stores") || pathname.startsWith("/superadmin/payouts")) {
    visibleSections = allMenuSections.filter(section => section.title === "MÓDULO DE TIENDAS");
  } else if (pathname.startsWith("/superadmin/sync")) {
    visibleSections = allMenuSections.filter(section => section.title === "SINCRONIZACIÓN");
  } else if (pathname.startsWith("/superadmin/config")) {
    visibleSections = allMenuSections.filter(section => section.title === "MÓDULO DE CONFIGURACIÓN");
  } else if (pathname === "/superadmin") {
    visibleSections = allMenuSections; // Mostrar todo en el dashboard, o nada porque la sidebar se esconde de todas formas
  }

  return (
    <SuperAdminGuard>
      <div className="relative flex h-screen overflow-hidden bg-[#07090E] text-white">
        {/* Ambient lighting & subtle grid */}
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="fixed top-[-10%] left-[25%] w-[600px] h-[350px] bg-red/10 blur-[150px] pointer-events-none" />
        <div className="fixed bottom-[-10%] right-[10%] w-[500px] h-[300px] bg-indigo-900/10 blur-[160px] pointer-events-none" />

        {/* SIDEBAR PARA SUPER ADMIN */}
        {!isHub && (
          <aside className={`absolute left-0 top-0 z-9999 flex h-screen w-70 flex-col overflow-y-hidden bg-[#0E121B] border-r border-white/10 duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between gap-2 px-6 py-6 border-b border-white/5">
            <Link href="/superadmin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-red-dark to-red rounded-xl flex items-center justify-center shadow-lg shadow-red/25 border border-white/10 group-hover:scale-105 transition-transform">
                 <span className="text-white font-black text-xl">S</span>
              </div>
              <div>
                <h1 className="text-lg font-black text-white tracking-tight leading-none">Tap<span className="text-red">Master</span></h1>
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mt-1">SuperAdmin Vault</span>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="block lg:hidden text-white/50 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-1">
            <nav className="mt-2 py-4 px-4 lg:px-5">
              <div className="mb-6">
                <Link 
                  href="/superadmin" 
                  className="group relative flex items-center gap-3 rounded-xl py-2.5 px-3.5 font-bold text-xs text-white/70 bg-white/[0.03] border border-white/10 hover:border-red/40 hover:bg-red/10 hover:text-white transition-all duration-200 shadow-sm"
                >
                  <span className="text-white/60 group-hover:text-red transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  </span>
                  Volver al Menú
                </Link>
              </div>

              {visibleSections.map((section, idx) => (
                <div key={idx} className="mb-6">
                  <h3 className="mb-3 ml-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{section.title}</h3>
                  <ul className="space-y-1.5">
                    {section.items.map((item: any) => {
                      const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path);
                      return (
                        <li key={item.label}>
                          <Link 
                            href={item.path} 
                            className={`group relative flex items-center gap-3 rounded-xl py-2.5 px-3.5 font-bold text-xs transition-all duration-200 border ${
                              isActive 
                                ? "bg-gradient-to-r from-red-dark to-red text-white shadow-lg shadow-red/20 border-red/30" 
                                : "text-white/60 hover:bg-white/[0.04] hover:text-white border-transparent"
                            }`}
                          >
                            <span className={`${isActive ? "text-white" : "text-white/50 group-hover:text-red-light transition-colors"}`}>
                              {item.icon}
                            </span>
                            <span>{item.label}</span>
                            {isActive && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          {/* Footer Info */}
          <div className="p-5 border-t border-white/10 bg-[#090C14]/60 space-y-3">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-red hover:bg-red/10 hover:border-red/30 transition-all border border-white/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              CERRAR SESIÓN
            </button>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 group hover:border-white/20 transition-all">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-dark to-red flex items-center justify-center text-xs font-black text-white shadow-md shadow-red/30">SA</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-white truncate uppercase tracking-tight">Super Admin</p>
                <p className="text-[9px] text-white/40 truncate font-bold">TapMaster HQ</p>
              </div>
            </div>
          </div>
        </aside>
        )}

        {/* CONTENT AREA */}
        <div className="relative z-10 flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* HEADER */}
          {!isHub && (
            <header className="sticky top-0 z-999 flex w-full bg-[#0E121B]/80 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20">
            <div className="flex flex-grow items-center justify-between px-6 py-4 md:px-8 2xl:px-11">
              <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                <button
                  aria-controls="sidebar"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(!sidebarOpen);
                  }}
                  className="z-99999 block rounded-xl border border-white/10 bg-white/5 p-2 shadow-sm lg:hidden text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                  </svg>
                </button>
              </div>

              <div className="hidden lg:block">
                <p className="text-xs font-bold text-white/50 uppercase tracking-[0.1em]">
                  Administración Global <span className="text-red mx-1.5 font-black">/</span> <span className="text-white">Resumen General</span>
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                  <span className="hidden text-right lg:block">
                    <span className="block text-sm font-black text-white tracking-tight leading-tight">
                      {user?.name || user?.email || "Félix"}
                    </span>
                    <span className="inline-block text-[9px] font-black text-red-light uppercase tracking-widest mt-0.5 px-2 py-0.5 rounded-full bg-red/10 border border-red/20">
                      Super Admin
                    </span>
                  </span>

                  <Link
                    href="/superadmin"
                    className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-bold text-white/70 hover:border-red/40 hover:bg-red/10 hover:text-white transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4 text-white/50 group-hover:text-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Volver al Menú
                  </Link>
                </div>
              </div>
            </div>
          </header>
          )}

          {/* MAIN CONTENT */}
          <main className="flex-1">
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SuperAdminGuard>
  );
}

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/superadmin/login";

  if (isAuthPage) {
    return (
      <ReduxProvider>
        {children}
        <ToastContainer />
      </ReduxProvider>
    );
  }

  return (
    <ReduxProvider>
      <SuperAdminLayoutContent>{children}</SuperAdminLayoutContent>
      <ToastContainer />
    </ReduxProvider>
  );
}
