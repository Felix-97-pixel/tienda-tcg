"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Turnstile } from "@marsidev/react-turnstile";
import { API_URL } from "@/utils/api";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import { IconShieldCheck, IconTrendingUp, IconZap, IconArrowLeft, IconCheckCircle, IconAlertTriangle } from "@/components/ui/Icons";
import LanguageSelector from "@/components/ui/LanguageSelector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme } from "@/app/context/ThemeContext";

export default function SignupForm() {
  const t = useTranslations("register");
  const { isLight } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== rePassword) {
      return setError(t("error_password_match"));
    }

    if (password.length < 6) {
      return setError(t("error_password_length"));
    }

    if (!acceptedTerms) {
      return setError(t("error_terms_required"));
    }

    if (!captchaToken) {
      return setError(t("error_captcha_required"));
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, captchaToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("error_register_failed"));
      }

      setIsRegistered(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] transition-colors">
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
            <span className="text-xs font-mono text-white/80">{t("badge_register")}</span>
          </div>
        </div>

        {/* Centro / Texto Hero */}
        <div className="relative z-10 my-auto max-w-xl py-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red/10 border border-red/30 text-red-light text-xs font-semibold mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-red animate-pulse" />
            {t("badge_register")}
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.15] mb-5">
            {t("hero_join")}{" "}
            <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-amber-500">
              {t("hero_community")}
            </span>
          </h1>

          <p className="text-white/75 text-base xl:text-lg leading-relaxed mb-8">
            {t("hero_desc")}
          </p>

          {/* Tarjetas de Beneficios */}
          <div className="grid grid-cols-3 gap-3.5 pt-2">
            <div className="bg-[#0B0E17]/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-red/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-red/15 border border-red/30 flex items-center justify-center text-red-light mb-2.5 font-bold text-sm">
                <IconShieldCheck className="w-5 h-5 text-red-light" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">{t("benefit_protection_title")}</h4>
              <p className="text-[11px] text-white/50 leading-tight">{t("benefit_protection_desc")}</p>
            </div>

            <div className="bg-[#0B0E17]/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#F59E0B]/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#FCD34D] mb-2.5 font-bold text-sm">
                <IconTrendingUp className="w-5 h-5 text-[#FCD34D]" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">{t("benefit_prices_title")}</h4>
              <p className="text-[11px] text-white/50 leading-tight">{t("benefit_prices_desc")}</p>
            </div>

            <div className="bg-[#0B0E17]/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#2CD673]/40 transition-all">
              <div className="w-8 h-8 rounded-lg bg-[#22AD5C]/15 border border-[#22AD5C]/30 flex items-center justify-center text-[#2CD673] mb-2.5 font-bold text-sm">
                <IconZap className="w-5 h-5 text-[#2CD673]" />
              </div>
              <h4 className="text-xs font-bold text-white mb-0.5">{t("benefit_sell_title")}</h4>
              <p className="text-[11px] text-white/50 leading-tight">{t("benefit_sell_desc")}</p>
            </div>
          </div>
        </div>

        {/* Footer Izquierdo */}
        <div className="relative z-10 flex items-center justify-between text-xs text-white/40 pt-4 border-t border-white/10">
          <span>© {new Date().getFullYear()} TapTrade Inc.</span>
          <span>{t("footer_compliance")}</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* COLUMNA DERECHA: FORMULARIO DE REGISTRO */}
      {/* ============================================================ */}
      <div className="w-full lg:w-1/2 xl:w-[48%] flex items-center justify-center p-6 sm:p-12 xl:p-16 relative">
        {/* Glow de fondo decorativo */}
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-red/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Language selector, Theme toggle & Back button in top right (Desktop) */}
        <div className="hidden lg:flex items-center gap-2.5 absolute top-6 right-6 z-20">
          <LanguageSelector />
          <ThemeToggle />
          <Link
            href="/"
            aria-label={t("back_to_shop" as any) || "Volver"}
            title={t("back_to_shop" as any) || "Volver"}
            className="h-10 w-10 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-red-500/40 text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] flex items-center justify-center transition-all shadow-xs group shrink-0"
          >
            <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="w-full max-w-[460px] relative z-10">
          {/* Logo móvil y controles superiores sin superposición */}
          <div className="lg:hidden flex items-center justify-between gap-2 mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-dark to-orange flex items-center justify-center shadow-lg shadow-red/25">
                <span className="text-white font-black text-lg leading-none">T</span>
              </div>
              <span className="text-xl font-black tracking-tight text-[var(--tt-text-main)]">
                Tap<span className="text-red">Trade</span>
              </span>
            </Link>

            <div className="flex items-center gap-2 shrink-0">
              <LanguageSelector />
              <ThemeToggle />
              <Link
                href="/"
                aria-label={t("back_to_shop" as any) || "Volver"}
                title={t("back_to_shop" as any) || "Volver"}
                className="h-10 w-10 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-red-500/40 text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] flex items-center justify-center transition-all shadow-xs group shrink-0"
              >
                <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* ESTADO 1: REGISTRO EXITOSO */}
          {isRegistered ? (
            <div className="bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                <IconCheckCircle className="w-8 h-8 text-emerald-500" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[var(--tt-text-main)] tracking-tight mb-3">
                {t("success_title")}
              </h2>

              <p className="text-[var(--tt-text-muted)] text-sm leading-relaxed mb-6">
                {t("success_desc")}
                <br />
                <span className="font-bold text-[var(--tt-text-main)] text-base mt-1 inline-block bg-[var(--tt-bg-subtle)] px-3 py-1 rounded-lg border border-[var(--tt-border-medium)]">
                  {email}
                </span>
              </p>

              <div className="bg-red/5 border border-red/20 rounded-2xl p-4 text-left text-xs text-[var(--tt-text-main)] space-y-2 mb-8">
                <div className="font-bold text-red flex items-center gap-2">
                  <IconAlertTriangle className="w-4 h-4 text-red shrink-0" />
                  {t("instructions_title")}
                </div>
                <ol className="list-decimal pl-4.5 space-y-1 text-[var(--tt-text-muted)]">
                  <li>{t("instruction_1")}</li>
                  <li>{t("instruction_2")}</li>
                  <li>{t("instruction_3")}</li>
                </ol>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  className="w-full bg-gradient-to-r from-red-dark via-red to-orange text-white font-bold rounded-xl py-3.5 px-6 hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-red/25 border border-red/30 text-sm uppercase tracking-wider block text-center"
                >
                  {t("go_to_login")}
                </Link>

                <Link
                  href="/"
                  className="w-full bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-canvas)] text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] font-semibold rounded-xl py-3 px-4 border border-[var(--tt-border-medium)] text-xs transition-all block text-center"
                >
                  {t("back_to_shop" as any) || "Volver a la tienda"}
                </Link>
              </div>
            </div>
          ) : (
            /* ESTADO 2: FORMULARIO DE REGISTRO */
            <div>
              {/* Encabezado del Formulario */}
              <div className="mb-6">
                <h2 className="text-3xl font-black text-[var(--tt-text-main)] tracking-tight mb-2">
                  {t("title")}
                </h2>
                <p className="text-[var(--tt-text-muted)] text-sm">
                  {t("subtitle")}
                </p>
              </div>

              {/* Botón de Registro con Google */}
              <div className="mb-6">
                <GoogleSignInButton text="signup_with" onError={(err) => setError(err)} />
              </div>

              {/* Separador elegante y sutil sin recuadro */}
              <div className="flex items-center gap-3 my-6">
                <div className="h-px flex-1 bg-[var(--tt-border-medium)]" />
                <span className="text-[11px] font-medium tracking-wider uppercase text-[var(--tt-text-muted)] select-none shrink-0">
                  {t("or_email")}
                </span>
                <div className="h-px flex-1 bg-[var(--tt-border-medium)]" />
              </div>


              {/* Mensaje de Error */}
              {error && (
                <div className="mb-6 p-3.5 bg-red/10 border border-red/30 rounded-xl text-red-light text-xs font-semibold flex items-center gap-2.5">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nombre Completo */}
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)] mb-2">
                    {t("name_label")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--tt-text-muted)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder={t("name_placeholder")}
                      autoComplete="name"
                      className="w-full bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--tt-text-main)] placeholder:text-[var(--tt-text-muted)] outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)] mb-2">
                    {t("email_label")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--tt-text-muted)]">
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
                      placeholder={t("email_placeholder")}
                      autoComplete="email"
                      className="w-full bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--tt-text-main)] placeholder:text-[var(--tt-text-muted)] outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all shadow-xs"
                    />
                  </div>
                </div>

                {/* Contraseña */}
                <div>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)] mb-2">
                    {t("password_label")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--tt-text-muted)]">
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
                      placeholder={t("password_placeholder")}
                      autoComplete="new-password"
                      className="w-full bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-xl pl-10 pr-11 py-3 text-sm text-[var(--tt-text-main)] placeholder:text-[var(--tt-text-muted)] outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? (t("hide_pwd_aria" as any) || "Ocultar") : (t("show_pwd_aria" as any) || "Ver")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] transition-colors"
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

                {/* Confirmar Contraseña */}
                <div>
                  <label htmlFor="rePassword" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-muted)] mb-2">
                    {t("confirm_password")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--tt-text-muted)]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      type={showRePassword ? "text" : "password"}
                      id="rePassword"
                      name="rePassword"
                      value={rePassword}
                      onChange={(e) => setRePassword(e.target.value)}
                      required
                      placeholder={t("confirm_password_placeholder")}
                      autoComplete="new-password"
                      className="w-full bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-xl pl-10 pr-11 py-3 text-sm text-[var(--tt-text-main)] placeholder:text-[var(--tt-text-muted)] outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRePassword(!showRePassword)}
                      aria-label={showRePassword ? (t("hide_pwd_aria" as any) || "Ocultar") : (t("show_pwd_aria" as any) || "Ver")}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] transition-colors"
                    >
                      {showRePassword ? (
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

                {/* Checkbox Términos y Privacidad (Requerimiento Ley de Protección de Datos) */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 text-xs text-[var(--tt-text-muted)] cursor-pointer select-none group leading-relaxed">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="w-4 h-4 rounded bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] text-red focus:ring-red/30 focus:ring-offset-0 focus:ring-1 accent-[#F23030] cursor-pointer shrink-0 mt-0.5"
                    />
                    <span className="group-hover:text-[var(--tt-text-main)] transition-colors">
                      {t("terms_accept")}{" "}
                      <Link
                        href="/terms-and-conditions"
                        target="_blank"
                        className="text-red hover:underline font-semibold"
                      >
                        {t("terms_link")}
                      </Link>{" "}
                      {t("terms_middle")}{" "}
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        className="text-red hover:underline font-semibold"
                      >
                        {t("privacy_link")}
                      </Link>{" "}
                      {t("terms_suffix")}
                    </span>
                  </label>
                </div>

                {/* Cloudflare Turnstile */}
                <div className="flex justify-center pt-2 pb-1">
                  <Turnstile
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                    onSuccess={(token) => setCaptchaToken(token)}
                    options={{ theme: isLight ? "light" : "dark" }}
                  />
                </div>

                {/* Botón de Registro */}
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
                      <span>{t("submitting")}</span>
                    </>
                  ) : (
                    <span>{t("submit_btn")}</span>
                  )}
                </button>
              </form>

              {/* Enlace para Iniciar Sesión */}
              <div className="mt-8 pt-6 border-t border-[var(--tt-border-subtle)] text-center">
                <p className="text-xs text-[var(--tt-text-muted)]">
                  {t("have_account_prompt")}{" "}
                  <Link
                    href="/login"
                    className="text-red hover:underline font-bold transition-colors ml-1"
                  >
                    {t("login_link_here")}
                  </Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
