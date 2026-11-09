"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { API_URL } from "@/utils/api";
import LanguageSelector from "@/components/ui/LanguageSelector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useTheme } from "@/app/context/ThemeContext";
import {
  IconLock,
  IconShieldCheck,
  IconArrowLeft,
  IconCheckCircle,
  IconAlertTriangle,
  IconEye,
  IconEyeOff,
} from "@/components/ui/Icons";

export default function RestablecerContrasenaForm() {
  const t = useTranslations("reset_password");
  const tr = useTranslations("recovery");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { isLight } = useTheme();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Cálculo de fuerza de contraseña
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: t("strength_empty"), color: "bg-white/10" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 1, label: t("strength_weak"), color: "bg-red" };
    if (score <= 3) return { score: 2, label: t("strength_medium"), color: "bg-yellow" };
    return { score: 3, label: t("strength_strong"), color: "bg-emerald-500" };
  }, [password, t]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsDontMatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      return setError(t("err_no_token"));
    }

    if (password.length < 6) {
      return setError(t("err_min_length"));
    }

    if (password !== confirmPassword) {
      return setError(t("err_match"));
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || tr("err_generic"));
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || tr("err_generic"));
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
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/auth/auth_showcase_bg.jpg"
            alt="TapTrade TCG Vault"
            fill
            priority
            className="object-cover object-center scale-105 transform hover:scale-100 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/65 to-[#07090E]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#07090E]/30 to-[#07090E]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#E10E0E20,transparent_60%)]" />
        </div>

        {/* Top: Logo */}
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
            <span className="text-xs font-mono text-white/80">{tr("security_badge")}</span>
          </div>
        </div>

        {/* Center: Mensaje y tarjetas de seguridad */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red/10 border border-red/30 text-red-light text-xs font-semibold mb-6">
            <IconLock className="w-3.5 h-3.5 text-red-light" />
            <span>{tr("protocol_tag")}</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white mb-4">
            {tr("hero_title")}
          </h1>

          <p className="text-white/70 text-sm leading-relaxed mb-8">
            {tr("hero_desc")}
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red/10 border border-red/20 text-red shrink-0 mt-0.5">
                <IconShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">{tr("crypto_title")}</h2>
                <p className="text-[12px] text-white/50 leading-snug mt-0.5">
                  {tr("crypto_desc")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>TapTrade SpA • Chile</span>
          <span className="font-mono">{tr("compliance")}</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* COLUMNA DERECHA: FORMULARIO */}
      {/* ============================================================ */}
      <div className="w-full lg:w-1/2 xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen relative">
        {/* Glow de fondo decorativo */}
        <div className="absolute top-1/4 right-1/4 w-[350px] h-[350px] bg-red/10 rounded-full blur-[140px] pointer-events-none" />

        {/* Language selector, Theme toggle & Back button in top right (Desktop) */}
        <div className="hidden lg:flex items-center gap-2.5 absolute top-6 right-6 z-20">
          <LanguageSelector />
          <ThemeToggle />
          <Link
            href="/login"
            aria-label={tr("back_to_login")}
            title={tr("back_to_login")}
            className="h-10 w-10 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-red-500/40 text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] flex items-center justify-center transition-all shadow-xs group shrink-0"
          >
            <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Logo móvil y controles superiores sin superposición */}
        <div className="lg:hidden flex items-center justify-between gap-2 mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-dark via-red to-orange flex items-center justify-center font-black text-white text-base">
              T
            </div>
            <span className="font-black text-lg text-[var(--tt-text-main)]">
              Tap<span className="text-red">Trade</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageSelector />
            <ThemeToggle />
            <Link
              href="/login"
              aria-label={tr("back_to_login")}
              title={tr("back_to_login")}
              className="h-10 w-10 rounded-xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] hover:border-red-500/40 text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] flex items-center justify-center transition-all shadow-xs group shrink-0"
            >
              <IconArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Contenedor Central */}
        <div className="max-w-[460px] w-full mx-auto my-auto py-6 relative z-10">
          {!token ? (
            /* ========================================================== */
            /* SIN TOKEN EN LA URL */
            /* ========================================================== */
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-5 shadow-lg shadow-amber-500/10">
                <IconAlertTriangle className="w-7 h-7 text-amber-500" />
              </div>
              <h2 className="text-2xl font-black text-[var(--tt-text-main)] mb-2">{t("missing_token_title")}</h2>
              <p className="text-sm text-[var(--tt-text-muted)] mb-6 leading-relaxed">
                {t("missing_token_desc")}
              </p>
              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center py-3 px-6 rounded-xl bg-gradient-to-r from-red-dark via-red to-orange text-white font-bold text-sm shadow-lg shadow-red/25 hover:brightness-110 transition-all"
              >
                {t("request_new_link")}
              </Link>
            </div>
          ) : !isSuccess ? (
            /* ========================================================== */
            /* FORMULARIO DE NUEVA CONTRASEÑA */
            /* ========================================================== */
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red/20 via-orange/10 to-transparent border border-red/30 flex items-center justify-center text-red shadow-lg shadow-red/20 mb-5">
                  <IconLock className="w-5 h-5 text-red" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--tt-text-main)] mb-2">
                  {t("title")}
                </h2>
                <p className="text-sm text-[var(--tt-text-muted)] leading-relaxed">
                  {t("subtitle")}
                </p>
              </div>

              {/* Banner de Error */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red/10 border border-red/30 flex items-start gap-3 animate-shake">
                  <div className="text-red shrink-0 mt-0.5">
                    <IconAlertTriangle className="w-4 h-4 text-red" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-red leading-relaxed">{error}</p>
                    {error.includes("expirado") || error.includes("inválido") || error.includes("utilizado") ? (
                      <Link
                        href="/forgot-password"
                        className="inline-block mt-2 text-xs text-[var(--tt-text-main)] underline hover:text-red font-semibold"
                      >
                        {t("err_token_expired")}
                      </Link>
                    ) : null}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nueva Contraseña */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-main)]">
                      {t("new_password_label")}
                    </label>
                    {password && (
                      <span className="text-[11px] font-semibold text-[var(--tt-text-muted)]">
                        {t("strength_level")} <span className="text-[var(--tt-text-main)]">{passwordStrength.label}</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--tt-text-muted)]">
                      <IconLock className="w-4 h-4" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoFocus
                      placeholder={t("placeholder_min_length")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-xl pl-10 pr-11 py-3 text-sm text-[var(--tt-text-main)] placeholder:text-[var(--tt-text-muted)] focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] transition-colors"
                      aria-label={t("toggle_password_aria")}
                    >
                      {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Barra de progreso de fuerza */}
                  {password && (
                    <div className="mt-2 flex gap-1 h-1">
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-[var(--tt-border-medium)]"} transition-all`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-[var(--tt-border-medium)]"} transition-all`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-[var(--tt-border-medium)]"} transition-all`} />
                    </div>
                  )}
                </div>

                {/* Confirmar Nueva Contraseña */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-[var(--tt-text-main)]">
                      {t("confirm_password_label")}
                    </label>
                    {passwordsMatch && (
                      <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                        {t("passwords_match")}
                      </span>
                    )}
                    {passwordsDontMatch && (
                      <span className="text-[11px] font-semibold text-red flex items-center gap-1">
                        {t("passwords_dont_match")}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--tt-text-muted)]">
                      <IconLock className="w-4 h-4" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder={t("placeholder_confirm")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-[var(--tt-bg-surface)] border ${
                        passwordsMatch
                          ? "border-emerald-500/50 focus:border-emerald-500"
                          : passwordsDontMatch
                          ? "border-red/50 focus:border-red"
                          : "border-[var(--tt-border-medium)] focus:border-red"
                      } rounded-xl pl-10 pr-11 py-3 text-sm text-[var(--tt-text-main)] placeholder:text-[var(--tt-text-muted)] focus:outline-none focus:ring-2 focus:ring-red/20 transition-all shadow-xs`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--tt-text-muted)] hover:text-[var(--tt-text-main)] transition-colors"
                      aria-label={t("toggle_confirm_aria")}
                    >
                      {showConfirmPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Botón Actualizar */}
                <button
                  type="submit"
                  disabled={isLoading || !passwordsMatch || password.length < 6}
                  className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-red-dark via-red to-orange p-px font-bold text-white shadow-lg shadow-red/25 hover:shadow-red/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="w-full h-full bg-gradient-to-r from-red-dark via-red to-orange py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 group-hover:brightness-110 transition-all">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">{t("submitting")}</span>
                      </>
                    ) : (
                      <span className="text-sm">{t("submit_btn")}</span>
                    )}
                  </div>
                </button>
              </form>
            </>
          ) : (
            /* ========================================================== */
            /* ESTADO 3: ÉXITO */
            /* ========================================================== */
            <div className="text-center py-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                <IconCheckCircle className="w-8 h-8 text-emerald-500" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[var(--tt-text-main)] mb-3">
                {t("success_title")}
              </h2>

              <p className="text-sm text-[var(--tt-text-muted)] leading-relaxed mb-8 max-w-sm mx-auto">
                {t("success_desc")}
              </p>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-dark via-red to-orange text-white font-bold text-sm shadow-lg shadow-red/25 hover:brightness-110 transition-all"
              >
                {t("go_to_login")}
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[var(--tt-border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--tt-text-muted)]">
          <p>© {new Date().getFullYear()} TapTrade Marketplace.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms-and-conditions" className="hover:text-[var(--tt-text-main)] transition-colors">
              {tr("terms")}
            </Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:text-[var(--tt-text-main)] transition-colors">
              {tr("privacy")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
