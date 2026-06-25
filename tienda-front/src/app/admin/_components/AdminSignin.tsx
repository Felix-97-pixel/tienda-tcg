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
    <section className="min-h-screen flex items-center justify-center bg-[#0f1115] relative overflow-hidden p-4">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red/20 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] bg-blue/20 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-[450px] w-full relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-red to-orange flex items-center justify-center shadow-lg shadow-red/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">TapTrade Admin</span>
          </Link>
          <h2 className="text-2xl font-bold text-white mb-2">Bienvenido de vuelta</h2>
          <p className="text-gray-4 text-sm">Ingresa a tu panel de administración</p>
        </div>

        <div className="bg-[#1a1d24]/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-3 mb-1.5">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="tu@email.com"
                className="w-full bg-[#0b0c0f] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-3 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-[#0b0c0f] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
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
              className="w-full bg-red-light text-white font-semibold rounded-lg py-3 hover:bg-red transition-all ease-out duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,96,96,0.2)] flex justify-center items-center gap-2"
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
