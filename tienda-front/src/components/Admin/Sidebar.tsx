"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

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
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (arg: boolean) => void }) => {
  const pathname = usePathname();
  const t = useTranslations("dashboard");
  const ts = useTranslations("sidebar");
  const tc = useTranslations("common");

  const navItems = [
    { href: "/admin/products",    label: t("modules.products"),   icon: icons.products },
    { href: "/admin/categories",  label: t("modules.categories"), icon: icons.categories },
    { href: "/admin/brands",      label: t("modules.brands"),     icon: icons.brands },
    { href: "/admin/sync",        label: t("modules.sync"),       icon: icons.sync },
    { href: "/admin/wishlist",    label: t("modules.wishlist"),   icon: icons.wishlist },
    { href: "/admin/sales",       label: t("modules.sales"),      icon: icons.sales },
    { href: "/admin/orders",      label: t("modules.orders"),     icon: icons.orders },
    { href: "/admin/settings",    label: t("modules.settings"),   icon: icons.settings },
  ];

  return (
    <aside
      className={`absolute left-0 top-0 z-9999 flex h-screen w-70 flex-col overflow-y-hidden bg-[#1C2434] duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
    >
      {/* Logo Area */}
      <div className="flex items-center justify-between gap-2 px-6 py-8">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue/30 border border-white/10">
             <span className="text-white font-black text-xl">T</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Tienda <span className="text-blue">Admin</span></h1>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="block lg:hidden text-gray-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-1">
        <nav className="mt-2 py-4 px-4 lg:px-6">
          <div className="mb-6">
            <h3 className="mb-4 ml-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{ts("menu")}</h3>
            <ul className="space-y-1.5">
              {navItems.map(({ href, label, icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + "/");
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`group relative flex items-center gap-3.5 rounded-xl py-3 px-4 font-bold text-sm transition-all duration-200 ${
                        isActive 
                          ? "bg-blue text-white shadow-xl shadow-blue/20" 
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className={`${isActive ? "text-white" : "text-gray-500 group-hover:text-blue transition-colors"}`}>
                        {icon}
                      </span>
                      {label}
                      {isActive && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white rounded-l-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
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
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-lg">AD</div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-black text-white truncate uppercase tracking-tighter">{tc("admin")}</p>
            <p className="text-[9px] text-gray-500 truncate font-bold">{ts("version")}</p>
          </div>
        </div>
      </div>
    </aside>

  );
};

export default Sidebar;

