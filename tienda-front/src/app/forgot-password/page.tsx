import React, { Suspense } from "react";
import RecuperarCuentaForm from "./_components/RecuperarCuentaForm";
import { getTranslations } from "next-intl/server";

export default async function RecuperarCuentaPage() {
  const t = await getTranslations("auth.login");

  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#07090E] text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-red border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-white/50 font-mono tracking-wider">{t("loading_vault")}</span>
          </div>
        </div>
      }
    >
      <RecuperarCuentaForm />
    </Suspense>
  );
}
