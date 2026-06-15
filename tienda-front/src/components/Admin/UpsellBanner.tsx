"use client";
import React from "react";
import { useTranslations } from "next-intl";

interface UpsellBannerProps {
  featureName: string;
}

export default function UpsellBanner({ featureName }: UpsellBannerProps) {
  const tc = useTranslations("common");

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#1a1d24] rounded-2xl border border-white/5 p-8 text-center shadow-xl">
      <div className="w-20 h-20 bg-blue/10 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h2 className="text-3xl font-black text-white mb-4">Módulo Bloqueado</h2>
      <p className="text-gray-4 max-w-md mb-8 text-lg">
        El módulo <strong className="text-white">{featureName}</strong> no está incluido en tu plan actual. Para acceder a estas herramientas, necesitas adquirir esta característica.
      </p>
      <button className="bg-blue hover:bg-blue/80 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-lg shadow-blue/30">
        Mejorar Plan
      </button>
    </div>
  );
}
