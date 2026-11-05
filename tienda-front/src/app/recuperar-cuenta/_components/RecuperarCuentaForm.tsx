"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Turnstile } from "@marsidev/react-turnstile";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import LanguageSelector from "@/components/ui/LanguageSelector";
import {
  IconShieldCheck,
  IconClock,
  IconMail,
  IconArrowLeft,
  IconCheckCircle,
  IconAlertTriangle,
  IconLock,
} from "@/components/ui/Icons";

export default function RecuperarCuentaForm() {
  const t = useTranslations("recovery");
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
      return setError(t("err_email_required"));
    }

    if (!captchaToken) {
      return setError(t("err_captcha_required"));
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
        throw new Error(data.message || t("err_generic"));
      }

      setIsSubmitted(true);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || t("err_generic"));
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
        throw new Error(data.message || t("err_generic"));
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
            <span className="text-xs font-mono text-white/80">{t("security_badge")}</span>
          </div>
        </div>

        {/* Center: Mensaje y tarjetas de seguridad de la Bóveda */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red/10 border border-red/30 text-red-light text-xs font-semibold mb-6">
            <IconLock className="w-3.5 h-3.5 text-red-light" />
            <span>{t("protocol_tag")}</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white mb-4">
            {t("hero_title")}
          </h1>

          <p className="text-white/70 text-sm leading-relaxed mb-8">
            {t("hero_desc")}
          </p>

          {/* Cards informativas sobre seguridad */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red/10 border border-red/20 text-red shrink-0 mt-0.5">
                <IconShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">{t("crypto_title")}</h2>
                <p className="text-[12px] text-white/50 leading-snug mt-0.5">
                  {t("crypto_desc")}
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange/10 border border-orange/20 text-orange shrink-0 mt-0.5">
                <IconShieldCheck className="w-4 h-4 text-orange" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">{t("vault_safe_title")}</h2>
                <p className="text-[12px] text-white/50 leading-snug mt-0.5">
                  {t("vault_safe_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>TapTrade SpA • Chile</span>
          <span className="font-mono">{t("compliance")}</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* COLUMNA DERECHA: FORMULARIO INTERACTIVO DE RECUPERACIÓN */}
      {/* ============================================================ */}
      <div className="w-full lg:w-1/2 xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen relative">
        {/* Barra superior de navegación rápida */}
        <div className="flex items-center justify-between mb-8 gap-3">
          {/* Logo en versión mobile */}
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-dark via-red to-orange flex items-center justify-center font-black text-white text-base">
              T
            </div>
            <span className="font-black text-lg text-white">
              Tap<span className="text-red">Trade</span>
            </span>
          </Link>

          <div className="flex items-center gap-2.5 ml-auto">
            <LanguageSelector />
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors group px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10"
            >
              <IconArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>{t("back_to_login")}</span>
            </Link>
          </div>
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
                  <IconLock className="w-5 h-5 text-red" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                  {t("title")}
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>

              {/* Banner de Error */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red/10 border border-red/30 flex items-start gap-3 animate-shake">
                  <div className="text-red shrink-0 mt-0.5">
                    <IconAlertTriangle className="w-4 h-4 text-red" />
                  </div>
                  <p className="text-xs text-red-light leading-relaxed">{error}</p>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Campo Email */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                    {t("email_label")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                      <IconMail className="w-4 h-4" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      required
                      autoFocus
                      placeholder={t("email_placeholder")}
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
                    onError={() => setError(t("err_captcha_load"))}
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
                        <span className="text-sm">{t("sending_btn")}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">{t("submit_btn")}</span>
                        <IconMail className="w-4 h-4" />
                      </>
                    )}
                  </div>
                </button>
              </form>

              {/* Links adicionales */}
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-xs text-white/50">
                  {t("remember_pwd_prompt")}{" "}
                  <Link href="/login" className="text-white hover:text-red-light font-bold transition-colors">
                    {t("login_here")}
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
                <IconCheckCircle className="w-8 h-8 text-emerald-400" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
                {t("success_title")}
              </h2>

              <p className="text-sm text-white/70 leading-relaxed mb-4">
                {t("success_desc")}
              </p>

              <div className="font-mono text-sm font-semibold text-white bg-[#0E121B] border border-white/10 rounded-xl py-3 px-4 mb-6 break-all">
                {email}
              </div>

              {/* Banner Informativo sin emojis */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 text-left space-y-2.5 mb-6">
                <div className="flex items-start gap-2.5 text-xs text-white/80">
                  <IconClock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t("link_valid_notice")}</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-white/80">
                  <IconMail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>{t("spam_notice")}</span>
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
                  {isLoading
                    ? t("resending_btn")
                    : cooldown > 0
                    ? t("resend_available_in", { seconds: cooldown })
                    : t("resend_btn")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setError("");
                  }}
                  className="w-full text-xs text-white/50 hover:text-white py-1 transition-colors"
                >
                  {t("try_another_email")}
                </button>

                <div className="pt-4">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-dark via-red to-orange text-white font-bold text-sm shadow-lg shadow-red/25 hover:brightness-110 transition-all"
                  >
                    {t("back_to_login")}
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
              {t("terms")}
            </Link>
            <span>•</span>
            <Link href="/politica-de-privacidad" className="hover:text-white transition-colors">
              {t("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
