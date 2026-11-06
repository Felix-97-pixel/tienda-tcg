import React, { Suspense } from "react";
import SignupForm from "./_components/SignupForm";
import { getTranslations } from "next-intl/server";

export default async function SignupPage() {
  const t = await getTranslations("auth.signup");

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
      <SignupForm />
    </Suspense>
  );
}
