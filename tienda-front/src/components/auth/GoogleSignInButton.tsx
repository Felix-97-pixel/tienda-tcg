"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/features/auth-slice";
import { toast } from "react-hot-toast";
import { API_URL } from "@/utils/api";

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleSignInButtonProps {
  text?: "signin_with" | "signup_with" | "continue_with";
  onError?: (err: string) => void;
}

export default function GoogleSignInButton({
  text = "continue_with",
  onError,
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const buttonRef = useRef<HTMLDivElement>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  const handleCredentialResponse = async (response: any) => {
    if (!response?.credential) {
      const err = "No se recibió la credencial de Google.";
      onError?.(err);
      toast.error(err);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Error al autenticar con Google.");
      }

      dispatch(loginSuccess({ user: data.user, features: data.features }));
      toast.success(`¡Bienvenido, ${data.user?.name || "Coleccionista"}!`);

      // Redirigir según el rol o URL previa
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
      const errMsg = err.message || "Ocurrió un error al procesar el inicio de sesión con Google.";
      onError?.(errMsg);
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isScriptLoaded || !clientId || !window.google?.accounts?.id || !buttonRef.current) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Renderizar el botón oficial de Google con tema dark
      window.google.accounts.id.renderButton(buttonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: text,
        shape: "rectangular",
        logo_alignment: "left",
        width: buttonRef.current.offsetWidth || 340,
      });
    } catch (e) {
      console.error("Error al inicializar Google Sign-In:", e);
    }
  }, [isScriptLoaded, clientId, text]);

  const handleFallbackClick = () => {
    if (!clientId) {
      toast(
        "Falta configurar NEXT_PUBLIC_GOOGLE_CLIENT_ID en el archivo .env.local de tienda-front para conectar con Google.",
        {
          icon: "⚙️",
          duration: 6000,
          style: {
            background: "#0E121B",
            color: "#ffffff",
            border: "1px solid rgba(255,255,255,0.15)",
          },
        }
      );
      return;
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="w-full">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      {/* Si clientId está configurado y el script cargó, se monta el contenedor oficial de Google */}
      {clientId && isScriptLoaded ? (
        <div className="relative w-full">
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-[#07090E]/80 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 border border-white/10">
              <div className="w-4 h-4 border-2 border-red border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-white">Autenticando con Google...</span>
            </div>
          )}
          <div
            ref={buttonRef}
            className="w-full min-h-[44px] flex justify-center [&>div]:!w-full [&_iframe]:!w-full [&_iframe]:!rounded-xl"
          />
        </div>
      ) : (
        /* Botón de presentación y fallback */
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 text-white font-semibold text-sm transition-all duration-200 group shadow-sm"
        >
          {/* Logo oficial multi-color de Google */}
          <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-white/90 group-hover:text-white">
            {text === "signup_with"
              ? "Registrarse con Google"
              : text === "signin_with"
              ? "Iniciar sesión con Google"
              : "Continuar con Google"}
          </span>
        </button>
      )}
    </div>
  );
}
