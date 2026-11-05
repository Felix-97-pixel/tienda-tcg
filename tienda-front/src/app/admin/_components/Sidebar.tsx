"use client";
import React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/store";
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
  IconPieChart,
  IconWallet,
  IconStore,
  IconUsers,
  IconTruck,
  IconTicket,
  IconCoins,
  IconGamepad,
  IconSliders,
  IconArrowLeft,
  IconLogout,
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
  const ta = useTranslations("admin.sidebar");
  const { user } = useAppSelector((state) => state.adminAuthReducer);

  const sessionType = user?.sessionType || "COMPANY_OWNER";

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/admin/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    }
    dispatch(adminLogout());
    router.push("/admin/login");
  };

  // Build dynamic navigation sections based on sessionType
  const getSections = (): NavSection[] => {
    // 1. CASHIER: Solo Operaciones y Consulta de Catálogo
    if (sessionType === "CASHIER") {
      return [
        {
          title: ta("sections.cashier_ops"),
          items: [
            { href: "/admin/pos", label: ta("items.pos"), icon: <IconPos className="w-4 h-4" /> },
            { href: "/admin/transactions", label: ta("items.cash_shifts"), icon: <IconReceipt className="w-4 h-4" /> },
            { href: "/admin/orders", label: ta("items.orders_pickup"), icon: <IconOrders className="w-4 h-4" /> },
            { href: "/admin/store-credit", label: ta("items.store_credit_redeem"), icon: <IconCreditCard className="w-4 h-4" /> },
          ],
        },
        {
          title: ta("sections.cashier_catalog"),
          items: [
            { href: "/admin/products", label: ta("items.singles_inquiry"), icon: <IconCard className="w-4 h-4" /> },
            { href: "/admin/sealed", label: ta("items.sealed_inquiry"), icon: <IconBox className="w-4 h-4" /> },
            { href: "/admin/buylist", label: ta("items.buylist_reception"), icon: <IconRepeat className="w-4 h-4" /> },
          ],
        },
      ];
    }

    // 2. BRANCH_MANAGER: Operaciones, Catálogo Local, Métricas de sucursal, Personal de tienda
    if (sessionType === "BRANCH_MANAGER") {
      return [
        {
          title: ta("sections.branch_ops"),
          items: [
            { href: "/admin/pos", label: ta("items.pos"), icon: <IconPos className="w-4 h-4" /> },
            { href: "/admin/transactions", label: ta("items.registers_and_shifts"), icon: <IconReceipt className="w-4 h-4" /> },
            { href: "/admin/orders", label: ta("items.orders_dispatch"), icon: <IconOrders className="w-4 h-4" /> },
            { href: "/admin/store-credit", label: ta("items.store_credit"), icon: <IconCreditCard className="w-4 h-4" /> },
          ],
        },
        {
          title: ta("sections.branch_inventory"),
          items: [
            { href: "/admin/products", label: ta("items.singles"), icon: <IconCard className="w-4 h-4" /> },
            { href: "/admin/sealed", label: ta("items.sealed"), icon: <IconBox className="w-4 h-4" /> },
            { href: "/admin/buylist", label: ta("items.buylist_branch"), icon: <IconRepeat className="w-4 h-4" /> },
            { href: "/admin/price-sync", label: ta("items.price_sync"), icon: <IconRefresh className="w-4 h-4" /> },
            { href: "/admin/wishlist", label: ta("items.wishlist"), icon: <IconHeart className="w-4 h-4" /> },
          ],
        },
        {
          title: ta("sections.branch_metrics"),
          items: [
            { href: "/admin/sales", label: ta("items.reports_sales"), icon: <IconPieChart className="w-4 h-4" /> },
          ],
        },
        {
          title: ta("sections.branch_config"),
          items: [
            { href: "/admin/team", label: ta("items.team_branch"), icon: <IconUsers className="w-4 h-4" /> },
            { href: "/admin/profile", label: ta("items.store_settings"), icon: <IconStore className="w-4 h-4" /> },
            { href: "/admin/shipping", label: ta("items.shipping_methods"), icon: <IconTruck className="w-4 h-4" /> },
            { href: "/admin/currencies", label: ta("items.currencies"), icon: <IconCoins className="w-4 h-4" /> },
            { href: "/admin/games", label: ta("items.games_config"), icon: <IconGamepad className="w-4 h-4" /> },
            { href: "/admin/devaluations", label: ta("items.buylist_engine"), icon: <IconSliders className="w-4 h-4" /> },
          ],
        },
      ];
    }

    // 3. COMPANY_ADMIN: Finanzas y control de holding
    if (sessionType === "COMPANY_ADMIN") {
      return [
        {
          title: ta("sections.company_ops"),
          items: [
            { href: "/admin/pos", label: ta("items.pos"), icon: <IconPos className="w-4 h-4" /> },
            { href: "/admin/transactions", label: ta("items.registers_and_shifts"), icon: <IconReceipt className="w-4 h-4" /> },
            { href: "/admin/orders", label: ta("items.orders_dispatch"), icon: <IconOrders className="w-4 h-4" /> },
            { href: "/admin/store-credit", label: ta("items.store_credit"), icon: <IconCreditCard className="w-4 h-4" /> },
          ],
        },
        {
          title: ta("sections.company_catalog"),
          items: [
            { href: "/admin/products", label: ta("items.singles"), icon: <IconCard className="w-4 h-4" /> },
            { href: "/admin/sealed", label: ta("items.sealed"), icon: <IconBox className="w-4 h-4" /> },
            { href: "/admin/buylist", label: ta("items.buylist_branch"), icon: <IconRepeat className="w-4 h-4" /> },
            { href: "/admin/wishlist", label: ta("items.wishlist"), icon: <IconHeart className="w-4 h-4" /> },
          ],
        },
        {
          title: ta("sections.company_metrics"),
          items: [
            { href: "/admin/sales", label: ta("items.reports_sales"), icon: <IconPieChart className="w-4 h-4" /> },
            { href: "/admin/wallet", label: ta("items.wallet_payouts"), icon: <IconWallet className="w-4 h-4" /> },
          ],
        },
        {
          title: ta("sections.company_config"),
          items: [
            { href: "/admin/profile", label: ta("items.store_settings"), icon: <IconStore className="w-4 h-4" /> },
            { href: "/admin/currencies", label: ta("items.currencies"), icon: <IconCoins className="w-4 h-4" /> },
          ],
        },
      ];
    }

    // 4. COMPANY_OWNER (Por defecto): Acceso total a nivel de holding y sucursales
    return [
      {
        title: ta("sections.company_ops"),
        items: [
          { href: "/admin/pos", label: ta("items.pos"), icon: <IconPos className="w-4 h-4" /> },
          { href: "/admin/transactions", label: ta("items.registers_and_shifts"), icon: <IconReceipt className="w-4 h-4" /> },
          { href: "/admin/orders", label: ta("items.orders_dispatch"), icon: <IconOrders className="w-4 h-4" /> },
          { href: "/admin/store-credit", label: ta("items.store_credit"), icon: <IconCreditCard className="w-4 h-4" /> },
        ],
      },
      {
        title: ta("sections.company_catalog"),
        items: [
          { href: "/admin/products", label: ta("items.singles"), icon: <IconCard className="w-4 h-4" /> },
          { href: "/admin/sealed", label: ta("items.sealed"), icon: <IconBox className="w-4 h-4" /> },
          { href: "/admin/buylist", label: ta("items.buylist_branch"), icon: <IconRepeat className="w-4 h-4" /> },
          { href: "/admin/price-sync", label: ta("items.price_sync"), icon: <IconRefresh className="w-4 h-4" /> },
          { href: "/admin/wishlist", label: ta("items.wishlist"), icon: <IconHeart className="w-4 h-4" /> },
        ],
      },
      {
        title: ta("sections.company_metrics"),
        items: [
          { href: "/admin/sales", label: ta("items.metrics_sales"), icon: <IconPieChart className="w-4 h-4" /> },
          { href: "/admin/wallet", label: ta("items.wallet_payouts"), icon: <IconWallet className="w-4 h-4" /> },
        ],
      },
      {
        title: ta("sections.company_management"),
        items: [
          { href: "/admin/team", label: ta("items.team_colleagues"), icon: <IconUsers className="w-4 h-4" /> },
          { href: "/admin/profile", label: ta("items.store_settings"), icon: <IconStore className="w-4 h-4" /> },
          { href: "/admin/shipping", label: ta("items.shipping_methods"), icon: <IconTruck className="w-4 h-4" /> },
          { href: "/admin/coupons", label: ta("items.coupons"), icon: <IconTicket className="w-4 h-4" /> },
          { href: "/admin/currencies", label: ta("items.currencies"), icon: <IconCoins className="w-4 h-4" /> },
          { href: "/admin/games", label: ta("items.games_config"), icon: <IconGamepad className="w-4 h-4" /> },
          { href: "/admin/devaluations", label: ta("items.buylist_engine"), icon: <IconSliders className="w-4 h-4" /> },
        ],
      },
    ];
  };

  const sections = getSections();

  // Role tag helpers
  const getRoleTag = () => {
    switch (sessionType) {
      case "COMPANY_OWNER":
        return { tag: "OWN", label: ta("roles.company_owner"), color: "from-red-dark to-red text-white" };
      case "COMPANY_ADMIN":
        return { tag: "ADM", label: ta("roles.company_owner"), color: "from-blue-600 to-indigo-600 text-white" };
      case "BRANCH_MANAGER":
        return { tag: "MGR", label: ta("roles.branch_manager"), color: "from-amber-600 to-orange-600 text-white" };
      case "CASHIER":
        return { tag: "POS", label: ta("roles.cashier"), color: "from-emerald-600 to-teal-600 text-white" };
      default:
        return { tag: "USR", label: "Usuario", color: "from-gray-700 to-gray-800 text-white" };
    }
  };

  const roleInfo = getRoleTag();

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
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col overflow-y-hidden bg-[#0B0E17] border-r border-white/10 duration-300 ease-in-out lg:static ${
          sidebarOpen ? "w-72 max-w-[85vw] translate-x-0 shadow-2xl shadow-black/80 lg:shadow-none" : "w-0 -translate-x-full lg:w-0 lg:-translate-x-full border-r-0 pointer-events-none opacity-0"
        }`}
      >
        {/* Logo & Header */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 sm:px-6 sm:py-5 border-b border-white/5 bg-[#080A10]">
          <Link href="/admin" className="flex items-center gap-3 group">
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
          
        </div>

        {/* Navigation List */}
        <div className="flex flex-col overflow-y-auto flex-1 px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          {/* Hub Link - Oculto para cajeros ya que su landing es el POS */}
          {sessionType !== "CASHIER" && (
            <div>
              <Link
                href="/admin"
                className="group relative flex items-center gap-3 rounded-xl py-2 px-3 font-bold text-xs text-white/70 bg-white/[0.03] border border-white/10 hover:border-red/40 hover:bg-red/10 hover:text-white transition-all duration-200 shadow-sm"
              >
                <IconArrowLeft className="w-4 h-4 text-white/60 group-hover:text-red transition-colors" />
                <span>{ta("items.back_to_hub")}</span>
              </Link>
            </div>
          )}

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
            <span>{ta("items.logout")}</span>
          </button>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${roleInfo.color} flex items-center justify-center text-[10px] font-black shadow-md`}>
              {roleInfo.tag}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-white truncate uppercase tracking-tight">
                {user?.name || tc("admin")}
              </p>
              <p className="text-[9px] text-white/40 truncate font-medium">
                {roleInfo.label} {user?.activeStore ? `• ${user.activeStore.name}` : ""}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
