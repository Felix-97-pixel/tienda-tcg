"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import SuperAdminGuard from "@/components/Admin/SuperAdminGuard";
import { ReduxProvider } from "@/redux/provider";
import ToastContainer from "@/components/layout/ToastContainer";
import { useAppSelector } from "@/redux/store";

function SuperAdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user } = useAppSelector((state) => state.authReducer) || { user: null };

  const menuItems = [
    {
      path: "/superadmin",
      label: "Dashboard",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      exact: true
    },
    {
      path: "/superadmin/catalog",
      label: "Catálogo Maestro",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
    },
    {
      path: "/superadmin/stores",
      label: "Tiendas (Tenants)",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    },
    {
      path: "/superadmin/sync",
      label: "Sincronización",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    }
  ];

  return (
    <SuperAdminGuard>
      <div className="flex h-screen overflow-hidden bg-[#111318] text-white">
        {/* SIDEBAR PARA SUPER ADMIN */}
        <aside className={`absolute left-0 top-0 z-9999 flex h-screen w-70 flex-col overflow-y-hidden bg-[#0f1115] border-r border-white/5 duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="flex items-center justify-between gap-2 px-6 py-8">
            <Link href="/superadmin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue/30 border border-white/10">
                 <span className="text-white font-black text-xl">S</span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Tap<span className="text-blue">Master</span></h1>
            </Link>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="block lg:hidden text-gray-4 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-1">
            <nav className="mt-2 py-4 px-4 lg:px-6">
              <div className="mb-8">
                <Link 
                  href="/" 
                  className="group relative flex items-center gap-3.5 rounded-xl py-3 px-4 font-bold text-sm text-blue bg-blue/10 hover:bg-blue hover:text-white transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                  Volver al Hub
                </Link>
              </div>

              <div className="mb-6">
                <h3 className="mb-4 ml-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-5">PANEL SUPERADMIN</h3>
                <ul className="space-y-1.5">
                  {menuItems.map((item) => {
                    const isActive = item.exact ? pathname === item.path : pathname.startsWith(item.path);
                    return (
                      <li key={item.path}>
                        <Link 
                          href={item.path} 
                          className={`group relative flex items-center gap-3.5 rounded-xl py-3 px-4 font-bold text-sm transition-all duration-200 ${
                            isActive 
                              ? "bg-blue text-white shadow-xl shadow-blue/20" 
                              : "text-gray-4 hover:bg-[#1a1d24]/5 hover:text-white"
                          }`}
                        >
                          <span className={`${isActive ? "text-white" : "text-gray-5 group-hover:text-blue transition-colors"}`}>
                            {item.icon}
                          </span>
                          {item.label}
                          {isActive && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#1a1d24] rounded-l-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </div>

          {/* Footer Info */}
          <div className="p-6 border-t border-white/5">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#1a1d24]/5 border border-white/5 group hover:bg-[#1a1d24]/10 transition-all">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-lg">SA</div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-black text-white truncate uppercase tracking-tighter">Super Admin</p>
                <p className="text-[9px] text-gray-5 truncate font-bold">Panel de Control</p>
              </div>
            </div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* HEADER */}
          <header className="sticky top-0 z-999 flex w-full bg-[#1a1d24]/80 backdrop-blur-md border-b border-stroke/50 shadow-sm">
            <div className="flex flex-grow items-center justify-between px-6 py-4 md:px-8 2xl:px-11">
              <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
                <button
                  aria-controls="sidebar"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSidebarOpen(!sidebarOpen);
                  }}
                  className="z-99999 block rounded-xl border border-stroke bg-[#1a1d24] p-2 shadow-sm lg:hidden hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                  </svg>
                </button>
              </div>

              <div className="hidden lg:block">
                <p className="text-xs font-bold text-gray-4 uppercase tracking-[0.1em]">Administración Global <span className="text-blue mx-1">/</span> <span className="text-white">Resumen General</span></p>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 border-l border-stroke pl-6">
                  <span className="hidden text-right lg:block">
                    <span className="block text-sm font-black text-white tracking-tight leading-tight">
                      {user?.name || user?.email || "Félix"}
                    </span>
                    <span className="block text-[10px] font-bold text-blue uppercase tracking-widest mt-0.5">Super Admin</span>
                  </span>

                  <Link
                    href="/"
                    className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111318] text-xs font-bold text-gray-4 hover:bg-blue hover:text-white transition-all shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Volver al Hub
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* MAIN CONTENT */}
          <main>
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
