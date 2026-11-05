"use client";
import Link from "next/link";
import React from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useAdminSignin } from "./hooks/useAdminSignin";
import { useTranslations } from "next-intl";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { IconArrowLeft } from "@/components/ui/Icons";

const AdminSignin = () => {
  const t = useTranslations("login");
  const {
    email,
    setEmail,
    password,
    setPassword,
    setCaptchaToken,
    error,
    isLoading,
    handleSubmit,
  } = useAdminSignin();

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#07090E] relative overflow-hidden p-4">
      {/* Background gradients and grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[350px] bg-red/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[10%] w-[450px] h-[350px] bg-red-dark/10 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Top right language switch */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      <div className="max-w-[450px] w-full relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-dark to-red flex items-center justify-center shadow-lg shadow-red/30 border border-white/10 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xl font-mono">T</span>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              Tap<span className="text-red">Trade</span> Admin
            </span>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">
            {t("hero_welcome")}
          </h2>
          <p className="text-white/60 text-sm">
            {t("subtitle")}
          </p>
        </div>

        <div className="bg-[#0E121B] border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl shadow-black ring-1 ring-white/5">
          {error && (
            <div className="mb-6 p-4 bg-red/10 border border-red/30 rounded-xl text-red-light text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                {t("email")}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t("email_placeholder")}
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                {t("password")}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t("password_placeholder")}
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all text-sm"
              />
            </div>

            <div className="flex justify-center my-2">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                onSuccess={(token) => setCaptchaToken(token)}
                options={{ theme: "dark" }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-dark to-red text-white font-bold rounded-xl py-3 hover:brightness-110 transition-all ease-out duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red/25 border border-red/30 flex justify-center items-center gap-2 text-sm uppercase tracking-wider active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>{t("submitting")}</span>
                </>
              ) : (
                <span>{t("submit")}</span>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/5 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
            >
              <IconArrowLeft className="w-3.5 h-3.5" />
              <span>{t("back_to_shop")}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminSignin;
