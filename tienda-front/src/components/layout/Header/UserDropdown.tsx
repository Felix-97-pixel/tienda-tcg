"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { logout } from "@/redux/features/auth-slice";
import { API_URL } from "@/utils/api";

interface UserDropdownProps {
  user: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;
}

export default function UserDropdown({ user }: UserDropdownProps) {
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

  const displayName = user?.name || user?.email?.split("@")[0] || "Mi Cuenta";
  const initial = (user?.name || user?.email || "U").slice(0, 1).toUpperCase();

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Botón Trigger del Avatar en Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className={`flex items-center gap-2 p-1 sm:px-2.5 py-1.5 rounded-xl border transition-all duration-200 ${
          isOpen
            ? "bg-white/10 border-red-500/40 text-white shadow-lg shadow-red-500/10"
            : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200 hover:text-white"
        }`}
        title="Mi Cuenta"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-red-600/40 to-red-500/20 text-red-300 font-bold text-xs flex items-center justify-center border border-red-500/30 shrink-0">
          {initial}
        </div>
        <span className="hidden xl:inline text-xs font-semibold max-w-[100px] truncate">
          {displayName}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 hidden sm:inline-block ${
            isOpen ? "rotate-180 text-red-400" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
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
                {user?.name || "Usuario TapTrade"}
              </p>
              <p className="text-[11px] text-gray-400 truncate mt-0.5" title={user?.email}>
                {user?.email}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full uppercase tracking-wider">
                Comprador
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Mis Pedidos</p>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  Historial y seguimiento de compras
                </p>
              </div>
              <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/my-account?tab=address"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
              role="menuitem"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500/10 text-gray-400 group-hover:text-red-400 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Direcciones de Envío</p>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  Tus destinos de entrega registrados
                </p>
              </div>
              <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/my-account?tab=account"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
              role="menuitem"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500/10 text-gray-400 group-hover:text-red-400 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Datos de Cuenta</p>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  Información personal y seguridad
                </p>
              </div>
              <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all group"
              role="menuitem"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 group-hover:bg-red-500/10 text-gray-400 group-hover:text-red-400 flex items-center justify-center transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Favoritos</p>
                <p className="text-[10px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  Cartas guardadas en tu lista
                </p>
              </div>
              <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}
