"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { API_URL } from "@/utils/api";

export default function RestablecerContrasenaForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Cálculo de fuerza de contraseña
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: "Vacía", color: "bg-white/10" };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) return { score: 1, label: "Débil", color: "bg-red" };
    if (score <= 3) return { score: 2, label: "Media", color: "bg-yellow" };
    return { score: 3, label: "Fuerte y Segura", color: "bg-emerald-500" };
  }, [password]);

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsDontMatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      return setError("Falta el token de seguridad. Por favor solicita un nuevo enlace de recuperación.");
    }

    if (password.length < 6) {
      return setError("La nueva contraseña debe tener al menos 6 caracteres.");
    }

    if (password !== confirmPassword) {
      return setError("Las contraseñas no coinciden. Por favor verifícalas.");
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
        throw new Error(data.message || "Error al restablecer la contraseña.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar la contraseña. El enlace puede haber expirado.");
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
        {/* Imagen de fondo */}
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
            <span className="text-xs font-mono text-white/80">Restablecimiento Cifrado</span>
          </div>
        </div>

        {/* Center: Info de Bóveda */}
        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red/10 border border-red/30 text-red-light text-xs font-semibold mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Nueva Clave de Acceso
          </div>

          <h1 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight text-white mb-4">
            Crea una nueva contraseña para tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-light via-orange to-yellow">cuenta</span>.
          </h1>

          <p className="text-white/70 text-sm leading-relaxed mb-8">
            Elige una combinación robusta que incluya letras, números o símbolos. Al actualizarla, tu sesión anterior quedará invalidada por tu propia seguridad.
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-sm flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Cifrado de Una Sola Vía</h2>
                <p className="text-[12px] text-white/50 leading-snug mt-0.5">
                  Tu nueva contraseña se almacena con hash irreversible bcrypt y salt criptográfico de 10 rondas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
          <span>TapTrade SpA • Chile</span>
          <span className="font-mono">Seguridad de Bóveda</span>
        </div>
      </div>

      {/* ============================================================ */}
      {/* COLUMNA DERECHA: FORMULARIO */}
      {/* ============================================================ */}
      <div className="w-full lg:w-1/2 xl:w-[48%] flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen">
        {/* Barra superior */}
        <div className="flex items-center justify-between mb-8">
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
          {!token ? (
            /* ========================================================== */
            /* SIN TOKEN EN LA URL */
            /* ========================================================== */
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto mb-5 shadow-lg shadow-amber-500/10">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Enlace Incompleto</h2>
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                No encontramos el token de seguridad en la dirección web. Por favor solicita un nuevo enlace de recuperación desde tu correo.
              </p>
              <Link
                href="/recuperar-cuenta"
                className="inline-flex items-center justify-center py-3 px-6 rounded-xl bg-gradient-to-r from-red-dark via-red to-orange text-white font-bold text-sm shadow-lg shadow-red/25 hover:brightness-110 transition-all"
              >
                Solicitar Nuevo Enlace
              </Link>
            </div>
          ) : !isSuccess ? (
            /* ========================================================== */
            /* FORMULARIO DE NUEVA CONTRASEÑA */
            /* ========================================================== */
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red/20 via-orange/10 to-transparent border border-red/30 flex items-center justify-center text-red shadow-lg shadow-red/20 mb-5">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                  Nueva Contraseña
                </h2>
                <p className="text-sm text-white/60 leading-relaxed">
                  Ingresa y confirma tu nueva clave de acceso para asegurar tu cuenta de TapTrade.
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
                  <div className="flex-1">
                    <p className="text-xs text-red-light leading-relaxed">{error}</p>
                    {error.includes("expirado") || error.includes("inválido") || error.includes("utilizado") ? (
                      <Link
                        href="/recuperar-cuenta"
                        className="inline-block mt-2 text-xs text-white underline hover:text-red-light font-semibold"
                      >
                        Solicitar un nuevo enlace aquí &rarr;
                      </Link>
                    ) : null}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nueva Contraseña */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-white/70">
                      Nueva Contraseña
                    </label>
                    {password && (
                      <span className="text-[11px] font-semibold text-white/50">
                        Nivel: <span className="text-white">{passwordStrength.label}</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoFocus
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#0E121B] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Barra de progreso de fuerza */}
                  {password && (
                    <div className="mt-2 flex gap-1 h-1">
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.color : "bg-white/10"} transition-all`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.color : "bg-white/10"} transition-all`} />
                      <div className={`flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.color : "bg-white/10"} transition-all`} />
                    </div>
                  )}
                </div>

                {/* Confirmar Nueva Contraseña */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-white/70">
                      Confirmar Contraseña
                    </label>
                    {passwordsMatch && (
                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        ✓ Coinciden
                      </span>
                    )}
                    {passwordsDontMatch && (
                      <span className="text-[11px] font-semibold text-red-light flex items-center gap-1">
                        ✗ No coinciden
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/30">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Repite la nueva contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-[#0E121B] border ${
                        passwordsMatch
                          ? "border-emerald-500/50 focus:border-emerald-500"
                          : passwordsDontMatch
                          ? "border-red/50 focus:border-red"
                          : "border-white/10 focus:border-red"
                      } rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-red/20 transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
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
                        <span className="text-sm">Actualizando contraseña...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">Guardar Nueva Contraseña</span>
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
            </>
          ) : (
            /* ========================================================== */
            /* ÉXITO: CONTRASEÑA ACTUALIZADA */
            /* ========================================================== */
            <div className="text-center py-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-3">
                ¡Contraseña Actualizada!
              </h2>

              <p className="text-sm text-white/70 leading-relaxed mb-8 max-w-sm mx-auto">
                Tu clave ha sido restablecida exitosamente. Tu cuenta ahora se encuentra protegida con tus nuevas credenciales.
              </p>

              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-xl bg-gradient-to-r from-red-dark via-red to-orange text-white font-bold text-sm shadow-lg shadow-red/25 hover:brightness-110 transition-all"
              >
                Iniciar Sesión Ahora
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
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
