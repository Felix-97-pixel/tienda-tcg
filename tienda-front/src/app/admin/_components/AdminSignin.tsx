"use client";
import Link from "next/link";
import React from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useAdminSignin } from "./hooks/useAdminSignin";

const AdminSignin = () => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    setCaptchaToken,
    error,
    isLoading,
    handleSubmit
  } = useAdminSignin();

  return (
    <section className="min-h-screen flex items-center justify-center bg-[#07090E] relative overflow-hidden p-4">
      {/* Background gradients and grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[350px] bg-red/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[10%] w-[450px] h-[350px] bg-red-dark/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-[450px] w-full relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-dark to-red flex items-center justify-center shadow-lg shadow-red/30 border border-white/10 group-hover:scale-105 transition-transform">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tight text-white">Tap<span className="text-red">Trade</span> Admin</span>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight mb-1">Bienvenido de vuelta</h2>
          <p className="text-white/60 text-sm">Ingresa las credenciales para acceder a tu panel</p>
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
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#080B12] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-red focus:ring-1 focus:ring-red/30 transition-all text-sm"
              />
            </div>

            <div className="flex justify-center my-2">
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"}
                onSuccess={(token) => setCaptchaToken(token)}
                options={{ theme: 'dark' }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-red-dark to-red text-white font-bold rounded-xl py-3 hover:brightness-110 transition-all ease-out duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-red/25 border border-red/30 flex justify-center items-center gap-2 text-sm uppercase tracking-wider active:scale-95"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Ingresando...
                </>
              ) : (
                "Ingresar al Panel"
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AdminSignin;
