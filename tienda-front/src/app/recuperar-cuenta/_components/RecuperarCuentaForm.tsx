"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Turnstile } from "@marsidev/react-turnstile";
import { API_URL } from "@/utils/api";

export default function RecuperarCuentaForm() {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Manejar cuenta regresiva para reenvío
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      return setError("Por favor, ingresa tu correo electrónico.");
    }

    if (!captchaToken) {
      return setError("Por favor, completa el CAPTCHA de seguridad para continuar.");
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: trimmedEmail, captchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "No se pudo procesar la solicitud.");
      }

      setIsSubmitted(true);
      setCooldown(60); // 60 segundos antes de permitir reenviar
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado al solicitar el restablecimiento.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isLoading) return;
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), captchaToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al reenviar el correo.");
      }

      setCooldown(60);
    } catch (err: any) {
      setError(err.message);
    } finally {
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

          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono text-white/80">Recuperación Segura</span>
          </div>
        </div>

        {/* Center: Mensaje y tarjetas de seguridad de la Bóveda */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red/10 border border-red/30 text-red-light text-xs font-semibold mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Protocolo de Bóveda y Autenticación
          </div>

          <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white mb-4">
            Tu colección y tus datos siempre <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-light via-orange to-yellow">protegidos</span>.
          </h1>

          <p className="text-white/70 text-sm leading-relaxed mb-8">
            En TapTrade aplicamos rigurosos estándares de seguridad digital. El proceso de recuperación genera enlaces efímeros de uso único para garantizar que solo tú puedas restablecer el acceso a tu cuenta.
          </p>

          {/* Cards informativas sobre seguridad */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red/10 border border-red/20 text-red shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Cifrado Criptográfico</h2>
                <p className="text-[12px] text-white/50 leading-snug mt-0.5">
                  Tus contraseñas están protegidas con hashing bcrypt y los tokens de recuperación expiran en 60 minutos.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange/10 border border-orange/20 text-orange shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Protección de Cuenta y Bóveda</h2>
                <p className="text-[12px] text-white/50 leading-snug mt-0.5">
                  Tus compras, ventas, historial y cartas coleccionables permanecen totalmente a resguardo en todo momento.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Legalidad ANPD y Ley 19.628 */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>TapTrade SpA • Chile</span>
          <span className="font-mono">Cumplimiento Ley N° 19.628</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* COLUMNA DERECHA: FORMULARIO INTERACTIVO DE RECUPERACIÓN */}
      {/* ============================================================ */}
      <div className="w-full lg:w-1/2 xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen">
        {/* Barra superior de navegación rápida */}
        <div className="flex items-center justify-between mb-8">
          {/* Logo en versión mobile */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-dark via-red to-orange flex items-center justify-center font-black text-white text-base">
              T
            </div>
            <span className="font-black text-lg text-white">
              Tap<span className="text-red">Trade</span>
            </span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition-colors group px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 ml-auto"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="group-hover:-translate-x-0.5 transition-transform"
            >
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Volver a Iniciar Sesión
          </Link>
        </div>

        {/* Contenedor Central */}
        <div className="max-w-[460px] w-full mx-auto my-auto py-6">
          {!isSubmitted ? (
            /* ========================================================== */
            /* ESTADO 1: FORMULARIO DE INGRESO DE CORREO */
            /* ========================================================== */
            <>
              {/* Encabezado del Formulario */}
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red/20 via-orange/10 to-transparent border border-red/30 flex items-center justify-center text-red shadow-lg shadow-red/20 mb-5">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                  Recuperar Cuenta
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  Ingresa el correo electrónico asociado a tu cuenta de TapTrade y te enviaremos un enlace seguro para crear una nueva contraseña.
                </p>
              </div>

              {/* Banner de Error */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red/10 border border-red/30 flex items-start gap-3 animate-shake">
                  <div className="text-red shrink-0 mt-0.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <p className="text-xs text-red-light leading-relaxed">{error}</p>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Campo Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      autoFocus
                      placeholder="nombre@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0E121B] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all"
                    />
                  </div>
                </div>

                {/* Turnstile CAPTCHA */}
                <div className="pt-2 flex justify-center">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onError={() => setError("Error al cargar la verificación CAPTCHA. Intenta recargar la página.")}
                    options={{ theme: "dark" }}
                  />
                </div>

                {/* Botón Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-red-dark via-red to-orange p-px font-bold text-white shadow-lg shadow-red/25 hover:shadow-red/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-full h-full bg-gradient-to-r from-red-dark via-red to-orange py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 group-hover:brightness-110 transition-all">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">Enviando enlace seguro...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">Enviar Enlace de Recuperación</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="group-hover:translate-x-1 transition-transform"
                        >
                          <line x1="5" y1="12" x2="19" y2="12"/>
                          <polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Links adicionales */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-xs text-white/50">
                  ¿Te acordaste de tu contraseña?{" "}
                  <Link href="/login" className="text-white hover:text-red-light font-bold transition-colors">
                    Inicia Sesión aquí
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* ========================================================== */
            /* ESTADO 2: CONFIRMACIÓN DE ENVÍO EXITOSO */
            /* ========================================================== */
            <div className="text-center py-2 animate-fadeIn">
              {/* Icono de Correo Enviado */}
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h9"/>
                  <polyline points="22,6 12,13 2,6"/>
                  <polyline points="16 19 19 22 24 17"/>
                </svg>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
                ¡Revisa tu correo!
              </h2>

              <p className="text-sm text-white/70 leading-relaxed mb-4">
                Hemos enviado las instrucciones y el enlace para restablecer tu contraseña a:
              </p>

              <div className="font-mono text-sm font-semibold text-white bg-[#0E121B] border border-white/10 rounded-xl py-3 px-4 mb-6 break-all">
                {email}
              </div>

              {/* Banner Informativo */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-left space-y-2 mb-6">
                <div className="flex items-start gap-2.5 text-xs text-white/80">
                  <span className="text-amber-400 font-bold shrink-0">⏳</span>
                  <span>El enlace es válido por <strong>60 minutos</strong> por seguridad.</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-white/80">
                  <span className="text-blue-400 font-bold shrink-0">📁</span>
                  <span>Si no lo ves en tu bandeja principal, revisa la carpeta de <strong>Spam</strong> o Promociones.</span>
                </div>
              </div>

              {/* Botón de reenvío con temporizador */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    "Reenviando..."
                  ) : cooldown > 0 ? (
                    `Reenviar correo disponible en ${cooldown}s`
                  ) : (
                    "¿No recibiste el correo? Haz clic para reenviar"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setError("");
                  }}
                  className="w-full text-xs text-white/50 hover:text-white py-1 transition-colors"
                >
                  Probar con otro correo electrónico
                </button>

                <div className="pt-4">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-dark via-red to-orange text-white font-bold text-sm shadow-lg shadow-red/25 hover:brightness-110 transition-all"
                  >
                    Volver a Iniciar Sesión
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* FOOTER INFERIOR DERECHO */}
        {/* ============================================================ */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} TapTrade Marketplace.</p>
          <div className="flex items-center gap-4">
            <Link href="/terminos-y-condiciones" className="hover:text-white transition-colors">
              Términos
            </Link>
            <span>•</span>
            <Link href="/politica-de-privacidad" className="hover:text-white transition-colors">
              Privacidad (Ley 19.628)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
