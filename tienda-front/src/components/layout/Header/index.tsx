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
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useTranslations } from "next-intl";
import LanguageSelector from "@/components/ui/LanguageSelector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  IconSearch,
  IconSparkles,
  IconUser,
  IconHeart,
  IconCart,
  IconMenu,
  IconX,
  IconExternalLink,
} from "@/components/ui/Icons";

const Header = () => {
  const router = useRouter();
  const tNav = useTranslations("nav");
  const tHeader = useTranslations("header");
  const tCommon = useTranslations("common");
  const allCategoriesLabel = tHeader("all_categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(allCategoriesLabel);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const { openCartModal } = useCartModalContext();

  const cartItems = useAppSelector((state) => state.cartReducer.items);
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

  const getMenuTitle = (path: string, fallback: string) => {
    switch (path) {
      case "/shop":
        return tNav("buy");
      case "/stores":
        return tNav("find_stores");
      case "/sell-cards":
        return tNav("sell_cards");
      case "/contact":
        return tNav("contact_support");
      default:
        return fallback;
    }
  };

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
        const categories = [{ name: allCategoriesLabel }, ...(Array.isArray(data) ? data : [])];
        setCategoriesData(categories);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, [allCategoriesLabel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("search", searchQuery.trim());
    if (selectedCategory && selectedCategory !== allCategoriesLabel && selectedCategory !== "Todas las categorías") {
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
          <div className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-4">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div className="relative flex items-center bg-[#111522] rounded-xl border border-white/10 hover:border-white/20 focus-within:border-red/60 focus-within:ring-1 focus-within:ring-red/30 transition-all">
                <div className="hidden lg:block shrink-0 border-r border-white/10 text-xs text-gray-300">
                  <CustomSelect
                    options={categoriesData}
                    value={selectedCategory}
                    placeholder={allCategoriesLabel}
                    onChange={(val: any) => setSelectedCategory(val?.name || allCategoriesLabel)}
                  />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={tHeader("search_placeholder")}
                  className="w-full bg-transparent text-white text-xs px-3 py-2.5 outline-none placeholder:text-gray-500 rounded-none"
                />
                <button
                  type="submit"
                  aria-label={tNav("account_menu.search_aria")}
                  className="px-3.5 py-2.5 text-gray-400 hover:text-white hover:text-red transition-colors shrink-0 rounded-r-xl"
                >
                  <IconSearch className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          {/* Right Action Widgets */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="hidden sm:flex h-10 w-10 rounded-xl bg-[#111522] border border-white/10 hover:border-red-500/40 text-gray-300 hover:text-white transition-all shadow-sm group shrink-0 items-center justify-center"
              title={tHeader("wishlist")}
              aria-label={tHeader("wishlist")}
            >
              <IconHeart className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors" />
            </Link>

            {/* Language Selector (Desktop/Tablet only; on Mobile lives inside Hamburger Menu) */}
            <div className="hidden md:block">
              <LanguageSelector />
            </div>

            {/* Quick 1-Click Theme Switch (Sun/Moon) */}
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* Account Dropdown or Login Icon Button */}
            {isMounted && isAuthenticated ? (
              <UserDropdown user={user} />
            ) : (
              <Link
                href="/login"
                aria-label={tHeader("login")}
                title={tHeader("login")}
                className="h-10 w-10 rounded-xl bg-[#111522] border border-white/10 hover:border-red-500/40 text-gray-300 hover:text-white transition-all shadow-sm group shrink-0 flex items-center justify-center"
              >
                <IconUser className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors" />
              </Link>
            )}

            {/* Cart Button */}
            <button
              type="button"
              onClick={handleOpenCartModal}
              aria-label={tHeader("cart")}
              title={tHeader("cart")}
              className="relative h-10 w-10 rounded-xl bg-[#111522] border border-white/10 hover:border-red-500/40 text-gray-300 hover:text-white transition-all shadow-sm group shrink-0 flex items-center justify-center"
            >
              <div className="relative">
                <IconCart className="w-5 h-5 text-gray-300 group-hover:text-red-400 transition-colors" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[9px] font-bold font-mono flex items-center justify-center animate-pulse">
                    {cartItems.length > 99 ? "99+" : cartItems.length}
                  </span>
                )}
              </div>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              aria-label={tNav("account_menu.open_menu_aria")}
              onClick={() => setNavigationOpen(!navigationOpen)}
              className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all shrink-0"
            >
              {navigationOpen ? (
                <IconX className="w-5 h-5" />
              ) : (
                <IconMenu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation Bar for Desktop & Medium Resolutions */}
      <div className="hidden md:block bg-[#07090E]/80 border-t border-white/[0.04]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex flex-col xl:flex-row xl:items-center xl:justify-between py-2 gap-2 xl:gap-4">
            {/* Fila 1: Opciones de la tienda (sin quebrar texto en 2 líneas) */}
            <ul className="flex items-center justify-center xl:justify-start flex-wrap gap-x-5 gap-y-1.5 lg:gap-x-6">
              {menuData.map((item, i) => (
                <li key={i} className="shrink-0">
                  <Link
                    href={item.path}
                    target={item.newTab ? "_blank" : undefined}
                    rel={item.newTab ? "noopener noreferrer" : undefined}
                    className="text-xs font-semibold text-gray-300 hover:text-red transition-colors flex items-center gap-1 whitespace-nowrap"
                  >
                    <span>{getMenuTitle(item.path, item.title)}</span>
                    {item.newTab && (
                      <IconExternalLink className="w-3 h-3 text-gray-400" />
                    )}
                  </Link>
                </li>
              ))}

              {/* Botón destacado con cuadrado rojo para ir a Landing */}
              <li className="shrink-0">
                <Link
                  href="/landing"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red text-white text-xs font-bold hover:bg-red-dark transition-all shadow-md shadow-red/25 border border-red-light/30 active:scale-95 group whitespace-nowrap"
                  title={tNav("account_menu.know_taptrade_title")}
                >
                  <IconSparkles className="w-3.5 h-3.5 text-white/90 shrink-0" />
                  <span>{tHeader("know_taptrade")}</span>
                </Link>
              </li>
            </ul>

            {/* Fila 2 en resoluciones medias / Derecha en XL: Envíos, Soporte y Retiro en Tienda $0 */}
            <div className="flex items-center justify-center xl:justify-end flex-wrap gap-x-3 gap-y-1 text-[11px] text-gray-400 font-mono pt-1.5 xl:pt-0 border-t border-white/[0.05] xl:border-t-0">
              <span className="inline-flex items-center gap-1.5 text-emerald-400 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                {tHeader("shipping_notice")}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-gray-300 whitespace-nowrap">{tHeader("pickup_notice")}</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {navigationOpen && (
        <div className="md:hidden bg-[#0A0D14] border-t border-white/10 px-4 py-4 space-y-3 shadow-2xl">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit}>
            <div className="flex items-center bg-[#111522] rounded-xl border border-white/10 px-3 py-2.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={tHeader("search_placeholder")}
                className="w-full bg-transparent text-white text-xs outline-none"
              />
              <button type="submit" className="text-gray-400 hover:text-white pl-2" aria-label={tNav("account_menu.search_aria")}>
                <IconSearch className="w-4 h-4" />
              </button>
            </div>
          </form>

          <nav className="space-y-1.5 pt-1">
            {menuData.map((item, i) => (
              <Link
                key={i}
                href={item.path}
                target={item.newTab ? "_blank" : undefined}
                rel={item.newTab ? "noopener noreferrer" : undefined}
                onClick={() => setNavigationOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <span>{getMenuTitle(item.path, item.title)}</span>
                {item.newTab && <IconExternalLink className="w-3.5 h-3.5 text-gray-400" />}
              </Link>
            ))}

            {/* Wishlist Link for Mobile */}
            <Link
              href="/wishlist"
              onClick={() => setNavigationOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all sm:hidden"
            >
              <span>{tHeader("wishlist")}</span>
              <IconHeart className="w-4 h-4 text-gray-400" />
            </Link>

            {/* Mobile Landing Link in red square box */}
            <div className="pt-2">
              <Link
                href="/landing"
                onClick={() => setNavigationOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-red text-white text-sm font-bold shadow-md shadow-red/30 hover:bg-red-dark transition-all border border-red-light/30"
              >
                <div className="flex items-center gap-2">
                  <IconSparkles className="w-4 h-4 text-white" />
                  <span>{tHeader("know_taptrade")}</span>
                </div>
                <span className="bg-black/30 text-white text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase">
                  Landing
                </span>
              </Link>
            </div>

            {/* Mobile Language Selector inside Hamburger Menu */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between px-1">
              <span className="text-xs text-gray-400 font-medium">{tCommon("language_dual_label")}</span>
              <LanguageSelector />
            </div>

            {/* Mobile Theme Toggle */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between px-1">
              <span className="text-xs text-gray-400 font-medium">{tHeader("theme_mode_dark")} / {tHeader("theme_mode_light")}</span>
              <ThemeToggle className="w-10 h-10" />
            </div>

            {/* Mobile Shipping & Pickup Notice below options */}
            <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-1.5 px-2 text-[11px] font-mono">
              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                {tHeader("shipping_notice")}
              </span>
              <span className="text-gray-400 pl-3">{tHeader("pickup_notice")}</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
