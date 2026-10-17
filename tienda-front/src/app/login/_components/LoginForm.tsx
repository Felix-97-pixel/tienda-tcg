"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/features/auth-slice";
import { Turnstile } from "@marsidev/react-turnstile";
import { API_URL } from "@/utils/api";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Cargar email recordado si existe
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("taptrade_remembered_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      return setError("Por favor, completa el CAPTCHA de seguridad para continuar.");
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, captchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Credenciales inválidas");
      }

      // Guardar o borrar email según el checkbox
      if (typeof window !== "undefined") {
        if (rememberMe) {
          localStorage.setItem("taptrade_remembered_email", email);
        } else {
          localStorage.removeItem("taptrade_remembered_email");
        }
      }

      dispatch(loginSuccess({ user: data.user, features: data.features }));

      // Redirigir a la URL deseada o al dashboard correspondiente
      const redirectUrl = searchParams.get("redirect") || searchParams.get("callbackUrl");
      if (redirectUrl && redirectUrl.startsWith("/")) {
        router.push(redirectUrl);
      } else if (data.user?.role === "SUPERADMIN") {
        router.push("/superadmin");
      } else if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#07090E] text-white">
      {/* ============================================================ */}
      {/* COLUMNA IZQUIERDA: SHOWCASE VISUAL ATMOSFÉRICO */}
      {/* ============================================================ */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-[52%] flex-col justify-between p-12 xl:p-16 overflow-hidden">
        {/* Imagen de fondo con cartas holográficas flotantes */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/auth/auth_showcase_bg.jpg"
            alt="TapTrade TCG Vault"
            fill
            priority
            className="object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
          />
          {/* Capas de gradientes para máxima legibilidad y ambiente dark */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/65 to-[#07090E]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#07090E]/30 to-[#07090E]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#E10E0E20,transparent_60%)]" />
        </div>

        {/* Top: Logo de la plataforma */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-dark via-red to-orange flex items-center justify-center shadow-lg shadow-red/30 group-hover:scale-105 transition-all border border-white/10">
              <span className="text-white font-black text-xl leading-none">T</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white leading-none">
                Tap<span className="text-red">Trade</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-red-light uppercase font-bold mt-0.5">
                TCG Marketplace
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/10 transition-all backdrop-blur-md"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver a la tienda
          </Link>
        </div>

        {/* Centro / Texto Hero */}
        <div className="relative z-10 my-auto max-w-xl py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red/10 border border-red/30 text-red-light text-xs font-semibold mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
            El Marketplace TCG de Chile
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15] mb-5">
            Bienvenido a tu{" "}
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-red-light via-red to-orange">
              Bóveda Coleccionista
            </span>
          </h1>

          <p className="text-white/75 text-base xl:text-lg leading-relaxed mb-8">
            Compra, vende y gestiona tus cartas de Magic, Pokémon, Riftbound y más. Precios de mercado actualizados en tiempo real y envíos certificados a todo el país.
          </p>

          {/* Tarjetas de Beneficios */}
          <div className="grid grid-cols-3 gap-3.5 pt-2">
            <div className="bg-[#0B0E17]/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-red/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-red/15 border border-red/30 flex items-center justify-center text-red-light mb-2.5 font-bold text-sm">
                🛡️
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">Compra Segura</h4>
              <p className="text-[11px] text-white/50 leading-tight">Fondos protegidos hasta tu entrega conforme.</p>
            </div>

            <div className="bg-[#0B0E17]/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#F59E0B]/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#FCD34D] mb-2.5 font-bold text-sm">
                ⚡
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">Envíos 24-48h</h4>
              <p className="text-[11px] text-white/50 leading-tight">Starken y Chilexpress integrados.</p>
            </div>

            <div className="bg-[#0B0E17]/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#2CD673]/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#22AD5C]/15 border border-[#22AD5C]/30 flex items-center justify-center text-[#2CD673] mb-2.5 font-bold text-sm">
                🎴
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">+100k Cartas</h4>
              <p className="text-[11px] text-white/50 leading-tight">Catálogo oficial Scryfall, TCG & Riftcodex.</p>
            </div>
          </div>
        </div>

        {/* Footer Izquierdo */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/40 pt-4 border-t border-white/10">
          <span>© {new Date().getFullYear()} TapTrade Inc.</span>
          <span>Plataforma oficial para tiendas y jugadores</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* COLUMNA DERECHA: FORMULARIO DE INGRESO (Limpio y Despejado) */}
      {/* ============================================================ */}
      <div className="w-full lg:w-1/2 xl:w-[48%] flex items-center justify-center p-6 sm:p-12 xl:p-16 relative">
        {/* Glow de fondo decorativo */}
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-red/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-[440px] relative z-10">
          {/* Logo móvil (solo visible si no está la columna izquierda) */}
          <div className="lg:hidden flex items-center justify-between mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-dark to-orange flex items-center justify-center shadow-lg shadow-red/25">
                <span className="text-white font-black text-lg leading-none">T</span>
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                Tap<span className="text-red">Trade</span>
              </span>
            </Link>

            <Link
              href="/"
              className="text-xs font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 border border-white/10"
            >
              ← Volver
            </Link>
          </div>

          {/* Encabezado del Formulario */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white tracking-tight mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-white/60 text-sm">
              Ingresa tus credenciales para acceder a tu cuenta y gestionar tus cartas.
            </p>
          </div>

          {/* Mensaje de Error / Verificación */}
          {error && (
            error.toLowerCase().includes("verific") ? (
              <div className="mb-6 p-4 bg-yellow/10 border border-yellow/30 rounded-2xl text-left text-xs text-yellow-light flex flex-col gap-1.5 leading-relaxed backdrop-blur-md">
                <div className="font-bold flex items-center gap-2 text-yellow">
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Cuenta no verificada
                </div>
                <p className="text-white/80">{error}</p>
                <p className="text-[11px] text-white/50 mt-1">
                  Revisa el correo de confirmación de <strong>TapTrade</strong> en tu bandeja de entrada o Spam.
                </p>
              </div>
            ) : (
              <div className="mb-6 p-3.5 bg-red/10 border border-red/30 rounded-xl text-red-light text-xs font-semibold flex items-center gap-2.5">
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <span>{error}</span>
              </div>
            )
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ejemplo@correo.com"
                  autoComplete="email"
                  className="w-full bg-[#0E121B] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Campo Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-white/70">
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-red-light hover:text-white font-semibold transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#0E121B] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2.5 text-xs text-white/70 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0E121B] border-white/20 text-red focus:ring-red/30 focus:ring-offset-0 focus:ring-1 accent-[#F23030] cursor-pointer"
                />
                <span className="group-hover:text-white transition-colors">Recordar mi sesión en este dispositivo</span>
              </label>
            </div>

            {/* Cloudflare Turnstile */}
            <div className="flex justify-center pt-2 pb-1">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                onSuccess={(token) => setCaptchaToken(token)}
                options={{ theme: "dark" }}
              />
            </div>

            {/* Botón Principal de Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-dark via-red to-orange text-white font-bold rounded-xl py-3.5 px-6 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-red/25 border border-red/30 flex justify-center items-center gap-2 text-sm uppercase tracking-wider disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Ingresando a tu cuenta...</span>
                </>
              ) : (
                <span>Ingresar ahora</span>
              )}
            </button>
          </form>

          {/* Enlace para Crear Cuenta */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-white/60">
              ¿Aún no tienes una cuenta de coleccionista o tienda?{" "}
              <Link
                href="/signup"
                className="text-red-light hover:text-white font-bold transition-colors ml-1"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>

          {/* Términos y Condiciones */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-white/40 leading-relaxed">
              Al iniciar sesión aceptas nuestros{" "}
              <Link href="/terminos-y-condiciones" className="text-white/60 hover:text-white underline">
                Términos y Condiciones
              </Link>{" "}
              y nuestra{" "}
              <Link href="/politica-de-privacidad" className="text-white/60 hover:text-white underline">
                Política de Privacidad
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
