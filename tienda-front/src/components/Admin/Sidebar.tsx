"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const Sidebar = ({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (arg: boolean) => void }) => {
  const pathname = usePathname();
  const t = useTranslations("dashboard");

  const navItems = [
    { href: "/admin/brands",      label: t("modules.brands") },
    { href: "/admin/categories",  label: t("modules.categories") },
    { href: "/admin/products",    label: t("modules.products") },
    { href: "/admin/sync",        label: t("modules.sync") },
    { href: "/admin/wishlist",    label: t("modules.wishlist") },
    { href: "/admin/sales",       label: t("modules.sales") },
    { href: "/admin/orders",      label: t("modules.orders") },
  ];

  return (
    <aside
      className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-dark duration-300 ease-linear lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
        <Link href="/admin">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden text-white"
        >
          ✕
        </button>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-sm font-semibold text-gray-4">MENU</h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              {navItems.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-gray-3 duration-300 ease-in-out hover:bg-gray-700 ${
                      pathname.includes(href) ? "bg-gray-700" : ""
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
