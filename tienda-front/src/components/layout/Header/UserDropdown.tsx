"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useTranslations } from "next-intl";
import { logout } from "@/redux/features/auth-slice";
import { API_URL } from "@/utils/api";
import {
  IconOrders,
  IconMapPin,
  IconWallet,
  IconUser,
  IconHeart,
  IconLogout,
  IconChevronDown,
  IconChevronRight,
} from "@/components/ui/Icons";

interface UserDropdownProps {
  user: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

export default function UserDropdown({ user }: UserDropdownProps) {
  const tNav = useTranslations("nav.account_menu");
  const tAccount = useTranslations("account");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const router = useRouter();

  // Cerrar al hacer click fuera o al presionar ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Ignore network errors on logout
    }
    dispatch(logout());
    router.push("/");
  };

  const displayName = user?.name || user?.email?.split("@")[0] || tAccount("title");
  const initial = (user?.name || user?.email || "U").slice(0, 1).toUpperCase();

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Botón Trigger del Avatar en Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`h-10 flex items-center gap-2 px-2.5 rounded-xl border transition-all duration-200 shadow-sm ${
          isOpen
            ? "bg-white/10 border-red-500/40 text-white shadow-lg shadow-red-500/10"
            : "bg-[#111522] hover:bg-white/10 border-white/10 hover:border-red-500/40 text-gray-200 hover:text-white"
        }`}
        title={tAccount("title")}
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-red-600/40 to-red-500/20 text-red-300 font-bold text-xs flex items-center justify-center border border-red-500/30 shrink-0">
          {initial}
        </div>
        <span className="hidden xl:inline text-xs font-semibold max-w-[100px] truncate">
          {displayName}
        </span>
        <IconChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 hidden sm:inline-block ${
            isOpen ? "rotate-180 text-red-400" : ""
          }`}
        />
      </button>

      {/* Menú Desplegable Flotante */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-72 origin-top-right rounded-2xl bg-[#0b0e14]/95 backdrop-blur-2xl border border-white/10 p-2 shadow-2xl shadow-black/80 ring-1 ring-black/50 z-50 animate-in fade-in zoom-in-95 duration-150"
          role="menu"
        >
          {/* Cabecera del Usuario en el Menú */}
          <div className="p-3 bg-gradient-to-br from-white/[0.04] to-transparent rounded-xl border border-white/5 mb-1.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-red-600/20 shrink-0">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {user?.name || tNav("default_user")}
              </p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5" title={user?.email}>
                {user?.email}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full uppercase tracking-wider">
                {tNav("buyer_badge")}
              </span>
            </div>
          </div>

          {/* Opciones Principales de Navegación */}
          <div className="space-y-1">
            <Link
              href="/my-account?tab=orders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
              role="menuitem"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500/10 text-gray-400 group-hover:text-red-400 flex items-center justify-center transition-colors">
                <IconOrders className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{tNav("orders_title")}</p>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  {tNav("orders_desc")}
                </p>
              </div>
              <IconChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/my-account?tab=address"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
              role="menuitem"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500/10 text-gray-400 group-hover:text-red-400 flex items-center justify-center transition-colors">
                <IconMapPin className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{tNav("addresses_title")}</p>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  {tNav("addresses_desc")}
                </p>
              </div>
              <IconChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/my-account?tab=credits"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
              role="menuitem"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-amber-500/10 text-gray-400 group-hover:text-amber-400 flex items-center justify-center transition-colors">
                <IconWallet className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{tNav("credits_title")}</p>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  {tNav("credits_desc")}
                </p>
              </div>
              <IconChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/my-account?tab=account-details"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
              role="menuitem"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500/10 text-gray-400 group-hover:text-red-400 flex items-center justify-center transition-colors">
                <IconUser className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{tNav("details_title")}</p>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  {tNav("details_desc")}
                </p>
              </div>
              <IconChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
              role="menuitem"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500/10 text-gray-400 group-hover:text-red-400 flex items-center justify-center transition-colors">
                <IconHeart className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">{tNav("wishlist_title")}</p>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  {tNav("wishlist_desc")}
                </p>
              </div>
              <IconChevronRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" />
            </Link>
          </div>

          {/* Separador */}
          <div className="my-1.5 border-t border-white/5" />

          {/* Botón Cerrar Sesión */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600/20 transition-all group text-left"
            role="menuitem"
          >
            <div className="w-7 h-7 rounded-lg bg-red-500/10 group-hover:bg-red-600/30 text-red-400 flex items-center justify-center transition-colors">
              <IconLogout className="w-4 h-4" />
            </div>
            <span>{tNav("logout")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
