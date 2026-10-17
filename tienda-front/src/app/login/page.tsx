import React, { Suspense } from "react";
import LoginForm from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#07090E] text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-red border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-white/50 font-mono tracking-wider">Cargando Bóveda TapTrade...</span>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
