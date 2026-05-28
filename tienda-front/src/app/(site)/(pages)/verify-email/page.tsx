"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { API_URL } from "@/utils/api";

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verificando tu cuenta...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de activación faltante. Por favor revisa el enlace de tu correo.");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "La verificación falló.");
        }

        setStatus("success");
        setMessage(data.message || "¡Cuenta activada con éxito!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Error al verificar la cuenta.");
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-8 sm:p-12 text-center border-t-4 border-[#800D0D]">
      {status === "loading" && (
        <div className="flex flex-col items-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-solid border-[#800D0D] border-t-transparent mb-6"></div>
          <h2 className="font-bold text-2xl text-dark mb-3">Verificando tu correo</h2>
          <p className="text-gray-5 text-custom-sm leading-relaxed">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#800D0D]/10 text-[#800D0D] mb-6">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="font-bold text-2xl text-dark mb-4">¡Activación Exitosa!</h2>
          <p className="text-gray-6 text-custom-sm leading-relaxed mb-8">{message}</p>
          <Link href="/signin" className="w-full inline-block text-center font-bold text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue">
            Iniciar Sesión
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red mb-6">
            <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="font-bold text-2xl text-dark mb-4">Error de Activación</h2>
          <p className="text-gray-6 text-custom-sm leading-relaxed mb-8">{message}</p>
          <Link href="/signin" className="w-full inline-block text-center font-bold text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue">
            Volver a Iniciar Sesión
          </Link>
        </div>
      )}
    </div>
  );
};

const VerifyEmailPage = () => {
  return (
    <>
      <Breadcrumb title={"Verificación de Correo"} pages={["Verificar Correo"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <Suspense fallback={
            <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-8 sm:p-12 text-center border-t-4 border-[#800D0D] flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-solid border-[#800D0D] border-t-transparent mb-6"></div>
              <h2 className="font-bold text-2xl text-dark mb-3">Cargando verificación...</h2>
            </div>
          }>
            <VerifyEmailContent />
          </Suspense>
        </div>
      </section>
    </>
  );
};

export default VerifyEmailPage;
