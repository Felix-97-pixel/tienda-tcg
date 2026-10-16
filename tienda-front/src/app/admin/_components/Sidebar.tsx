"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth-slice";

const icons = {
  products: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  ),
  categories: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
  ),
  brands: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /></svg>
  ),
  sync: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
  ),
  wishlist: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
  ),
  sales: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ),
  orders: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ),
  shipping: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
  ),
  back: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
  )
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (arg: boolean) => void }) => {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const t = useTranslations("dashboard");
  const ts = useTranslations("sidebar");
  const tc = useTranslations("common");

  const handleLogout = () => {
    dispatch(logout());
    router.push("/signin");
  };

  const catalogItems = [
    { href: "/admin/products", label: "Singles", icon: icons.products },
    { href: "/admin/sealed", label: "Sellado", icon: icons.categories },
    { href: "/admin/wishlist", label: t("modules.wishlist"), icon: icons.wishlist },
    { href: "/admin/buylist", label: "Buylist", icon: icons.orders },
    { href: "/admin/store-credit", label: "Crédito de Tienda", icon: icons.sales },
  ];

  const statsItems = [
    { href: "/admin/orders", label: t("modules.orders"), icon: icons.orders },
    { href: "/admin/statistics", label: t("modules.statistics"), icon: icons.sales }, // Reusing the sales icon for statistics for now
    { href: "/admin/sales", label: t("modules.sales"), icon: icons.sales },
  ];

  const configItems = [
    { href: "/admin/profile", label: "Mi Tienda", icon: icons.settings },
    { href: "/admin/games", label: "Juegos Soportados", icon: icons.products },
    { href: "/admin/devaluations", label: "Reglas de Estado", icon: icons.settings },
    { href: "/admin/wallet", label: "Billetera", icon: icons.sales },
    { href: "/admin/currencies", label: "Divisas", icon: icons.settings },
    { href: "/admin/shipping", label: "Métodos de Envío", icon: icons.shipping },
    { href: "/admin/coupons", label: "Cupones", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg> },
  ];

  const isCatalog = ["/admin/products", "/admin/sealed", "/admin/wishlist", "/admin/buylist", "/admin/store-credit"].some(p => pathname.startsWith(p));
  const isStats = ["/admin/sales", "/admin/orders", "/admin/statistics"].some(p => pathname.startsWith(p));
  const isConfig = ["/admin/currencies", "/admin/shipping", "/admin/profile", "/admin/games", "/admin/devaluations", "/admin/coupons", "/admin/wallet"].some(p => pathname.startsWith(p));

  const { features } = useAppSelector((state) => state.authReducer);

  let navItems = [];
  let moduleName = "";

  if (isCatalog) {
    navItems = catalogItems;
    moduleName = "Módulo de Catálogo";
  } else if (isStats) {
    navItems = statsItems;
    moduleName = "Módulo de Ventas";
  } else if (isConfig) {
    navItems = configItems;
    moduleName = "Módulo de Configuración";
  } else {
    // Fallback
    navItems = [...catalogItems, ...configItems];
    if (features.includes("module:statistics")) {
      navItems = [...catalogItems, ...statsItems, ...configItems];
    }
    moduleName = "Todos los Módulos";
  }

  return (
    <aside
      className={`absolute left-0 top-0 z-9999 flex h-screen w-70 flex-col overflow-y-hidden bg-[#0E121B] border-r border-white/10 duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Logo Area */}
      <div className="flex items-center justify-between gap-2 px-6 py-6 border-b border-white/5">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-red-dark to-red rounded-xl flex items-center justify-center shadow-lg shadow-red/25 border border-white/10 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl">T</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-tight leading-none">Tap<span className="text-red">Trade</span></h1>
            <span className="text-[9px] font-black uppercase tracking-widest text-white/40 block mt-1">Admin Vault</span>
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
              href="/admin"
              className="group relative flex items-center gap-3 rounded-xl py-2.5 px-3.5 font-bold text-xs text-white/70 bg-white/[0.03] border border-white/10 hover:border-red/40 hover:bg-red/10 hover:text-white transition-all duration-200 shadow-sm"
            >
              <span className="text-white/60 group-hover:text-red transition-colors">
                {icons.back}
              </span>
              Volver al Hub
            </Link>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 ml-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{moduleName}</h3>
            <ul className="space-y-1.5">
              {navItems.map(({ href, label, icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`group relative flex items-center gap-3 rounded-xl py-2.5 px-3.5 font-bold text-xs transition-all duration-200 border ${
                        isActive
                          ? "bg-gradient-to-r from-red-dark to-red text-white shadow-lg shadow-red/20 border-red/30"
                          : "text-white/60 hover:bg-white/[0.04] hover:text-white border-transparent"
                      }`}
                    >
                      <span className={`${isActive ? "text-white" : "text-white/50 group-hover:text-red-light transition-colors"}`}>
                        {icon}
                      </span>
                      <span>{label}</span>
                      {isActive && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
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
      <div className="p-5 border-t border-white/10 bg-[#090C14]/60 space-y-3">
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white/60 hover:text-red hover:bg-red/10 hover:border-red/30 transition-all border border-white/10">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          CERRAR SESIÓN
        </button>
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10 group hover:border-white/20 transition-all">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-dark to-red flex items-center justify-center text-xs font-black text-white shadow-md shadow-red/30">AD</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black text-white truncate uppercase tracking-tight">{tc("admin")}</p>
            <p className="text-[9px] text-white/40 truncate font-bold">{ts("version")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
