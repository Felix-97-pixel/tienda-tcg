"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import SuperAdminGuard from "@/components/Admin/SuperAdminGuard";
import { ReduxProvider } from "@/redux/provider";
import ToastContainer from "@/components/layout/ToastContainer";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ReduxProvider>
      <SuperAdminGuard>
      <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {/* SIDEBAR PARA SUPER ADMIN */}
      <aside className="w-70 bg-[#0a0a0a] border-r border-white/5 flex-shrink-0 hidden lg:flex flex-col">
        <div className="flex items-center justify-between gap-2 px-6 py-8">
          <Link href="/superadmin" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/30 border border-white/10">
               <span className="text-white font-black text-xl">S</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Tap<span className="text-purple-500">Master</span></h1>
          </Link>
        </div>

        <div className="flex flex-col flex-1 px-4 py-4 space-y-2">
          <Link 
            href="/superadmin" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname === '/superadmin' ? 'bg-purple-600/10 text-purple-500 font-bold' : 'text-gray-4 hover:bg-[#1a1d24]/5 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Dashboard
          </Link>
          <Link 
            href="/superadmin/catalog" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname.startsWith('/superadmin/catalog') ? 'bg-purple-600/10 text-purple-500 font-bold' : 'text-gray-4 hover:bg-[#1a1d24]/5 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Catálogo Maestro
          </Link>
          <Link 
            href="/superadmin/stores" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname.startsWith('/superadmin/stores') ? 'bg-purple-600/10 text-purple-500 font-bold' : 'text-gray-4 hover:bg-[#1a1d24]/5 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            Tiendas (Tenants)
          </Link>
          <Link 
            href="/superadmin/sync" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname.startsWith('/superadmin/sync') ? 'bg-purple-600/10 text-purple-500 font-bold' : 'text-gray-4 hover:bg-[#1a1d24]/5 hover:text-white'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Sincronización
          </Link>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* HEADER */}
        <header className="sticky top-0 z-40 flex w-full bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 shadow-sm">
          <div className="flex flex-grow items-center justify-between px-6 py-4">
            <div className="font-bold text-gray-4 uppercase tracking-widest text-xs">
              <span className="text-purple-500 mr-2">/</span>
              Administración Global
            </div>
            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <div className="text-right">
                <span className="block text-sm font-black text-white">Félix</span>
                <span className="block text-[10px] font-bold text-purple-500 uppercase tracking-widest">Super Admin</span>
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
      <ToastContainer />
    </ReduxProvider>
  );
}
