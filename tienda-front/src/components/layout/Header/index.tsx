"use client";
import { API_URL } from "@/utils/api";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomSelect from "./CustomSelect";
import { menuData } from "./menuData";
import Dropdown from "./Dropdown";
import UserDropdown from "./UserDropdown";
import { useAppSelector } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { logout } from "@/redux/features/auth-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { formatPrice } from "@/utils/currency";

const Header = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas las categorías");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const { openCartModal } = useCartModalContext();

  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  const { user, isAuthenticated } = useAppSelector((state) => state.authReducer);
  const currency = useAppSelector((state: any) => state.currencyReducer);
  const dispatch = useDispatch();
  const [categoriesData, setCategoriesData] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const q = sp.get("search");
      const cat = sp.get("category");
      if (q) setSearchQuery(q);
      if (cat) setSelectedCategory(cat);
    }
  }, []);

  const handleOpenCartModal = () => {
    openCartModal();
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout error", e);
    }
    dispatch(logout());
  };

  const handleStickyMenu = () => {
    if (window.scrollY >= 40) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/products/meta/categories`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        const categories = [{ name: "Todas las categorías" }, ...(Array.isArray(data) ? data : [])];
        setCategoriesData(categories);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCategory && selectedCategory !== "Todas las categorías") {
      params.set("category", selectedCategory);
    }
    router.push(`/shop?${params.toString()}`);
  };

  return (
    <header
      className={`fixed left-0 top-0 w-full z-[9999] transition-all duration-300 ${stickyMenu
        ? "bg-[#090C13]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-2xl"
        : "bg-[#090C13]/90 backdrop-blur-lg border-b border-white/[0.06]"
        }`}
    >
      {/* Top micro-gradient indicator */}
      <div className="w-full h-[2px] bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500"></div>

      {/* Main Top Bar */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3 sm:py-3.5">
          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-dark via-red to-orange flex items-center justify-center shadow-lg shadow-red/30 group-hover:scale-105 transition-all border border-white/10">
                <span className="text-white font-black text-xl leading-none">T</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                  Tap<span className="text-red">Trade</span>
                </span>
                <span className="text-[9px] font-mono tracking-widest text-red-light uppercase font-bold mt-0.5">
                  TCG Marketplace
                </span>
              </div>
            </Link>
          </div>

          {/* Search Capsule Bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative flex items-center bg-[#111522] rounded-xl border border-white/10 hover:border-white/20 focus-within:border-red/60 focus-within:ring-1 focus-within:ring-red/30 transition-all">
                <div className="shrink-0 border-r border-white/10 text-xs text-gray-300">
                  <CustomSelect
                    options={categoriesData}
                    value={selectedCategory}
                    onChange={(val: any) => setSelectedCategory(val?.name || "Todas las categorías")}
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar cartas, expansiones, singles..."
                  className="w-full bg-transparent text-white text-xs px-3 py-2.5 outline-none placeholder:text-gray-500 rounded-none"
                />
                <button
                  type="submit"
                  aria-label="Buscar"
                  className="px-3.5 py-2.5 text-gray-400 hover:text-white hover:text-red transition-colors shrink-0 rounded-r-xl"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Support Tooltip / Contact Link */}
            <Link
              href="/contact"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              title="Contacto y Soporte 24/7"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>Ayuda</span>
            </Link>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              title="Lista de Favoritos"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </Link>

            {/* Account Dropdown or Login Link */}
            {isMounted && isAuthenticated ? (
              <UserDropdown user={user} />
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                Ingresar
              </Link>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={handleOpenCartModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111522] border border-white/10 hover:border-red-500/40 text-white transition-all shadow-sm group"
            >
              <div className="relative">
                <svg
                  className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold font-mono flex items-center justify-center animate-pulse">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-mono font-bold text-xs text-white">
                {formatPrice(totalPrice, currency)}
              </span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              aria-label="Abrir menú"
              onClick={() => setNavigationOpen(!navigationOpen)}
              className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {navigationOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar for Desktop */}
      <div className="hidden md:block bg-[#07090E]/80 border-t border-white/[0.04]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between py-2">
            <ul className="flex items-center gap-5 lg:gap-6">
              {menuData.map((item, i) => (
                <li key={i}>
                  <Link
                    href={item.path}
                    target={item.newTab ? "_blank" : undefined}
                    rel={item.newTab ? "noopener noreferrer" : undefined}
                    className="text-xs font-semibold text-gray-300 hover:text-red transition-colors flex items-center gap-1"
                  >
                    <span>{item.title}</span>
                    {item.newTab && (
                      <span className="text-[10px] text-gray-400 font-mono">↗</span>
                    )}
                  </Link>
                </li>
              ))}

              {/* Botón destacado con cuadrado rojo para ir a Landing */}
              <li>
                <Link
                  href="/landing"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red text-white text-xs font-bold hover:bg-red-dark transition-all shadow-md shadow-red/25 border border-red-light/30 active:scale-95 group"
                  title="Conoce la plataforma y cómo funciona TapTrade"
                >
                  <span>Conoce TapTrade</span>
                </Link>
              </li>
            </ul>

            <div className="flex items-center gap-4 text-[11px] text-gray-400 font-mono">
              <span className="inline-flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Envíos 24-48h Chilexpress & Starken
              </span>
              <span>•</span>
              <span className="text-gray-400">Retiro en Tienda $0</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {navigationOpen && (
        <div className="md:hidden bg-[#0A0D14] border-t border-white/10 px-4 py-4 space-y-3">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center bg-[#111522] rounded-xl border border-white/10 px-3 py-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cartas..."
                className="w-full bg-transparent text-white text-xs outline-none"
              />
              <button type="submit" className="text-gray-400">
                🔍
              </button>
            </div>
          </form>

          <nav className="space-y-1.5 pt-2">
            {menuData.map((item, i) => (
              <Link
                key={i}
                href={item.path}
                target={item.newTab ? "_blank" : undefined}
                rel={item.newTab ? "noopener noreferrer" : undefined}
                onClick={() => setNavigationOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <span>{item.title}</span>
                {item.newTab && <span className="text-xs text-gray-400 font-mono">↗ nueva pestaña</span>}
              </Link>
            ))}

            {/* Mobile Landing Link in red square box */}
            <div className="pt-2">
              <Link
                href="/landing"
                onClick={() => setNavigationOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-red text-white text-sm font-bold shadow-md shadow-red/30 hover:bg-red-dark transition-all border border-red-light/30"
              >
                <div className="flex items-center gap-2">
                  <span>🚀</span>
                  <span>Conoce TapTrade</span>
                </div>
                <span className="bg-black/30 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Landing
                </span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
