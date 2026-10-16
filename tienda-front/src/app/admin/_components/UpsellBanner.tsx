"use client";
import React from "react";
import { Button } from "@/components/ui/Button";

interface UpsellBannerProps {
  featureName: string;
}

export default function UpsellBanner({ featureName }: UpsellBannerProps) {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] bg-[#0E121B] rounded-3xl border border-white/10 p-10 text-center shadow-2xl overflow-hidden group">
      {/* Ambient Radial Glow */}
      <div className="absolute w-96 h-96 bg-red/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-red/15 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Lock Icon Container */}
        <div className="w-20 h-20 bg-red/10 border border-red/25 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_35px_rgba(225,14,14,0.25)] text-red group-hover:scale-105 transition-transform duration-300">
          <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red/10 border border-red/25 text-red mb-3">
          Acceso Restringido
        </span>

        <h2 className="text-3xl font-black text-white tracking-tight mb-3">Módulo Bloqueado</h2>
        <p className="text-white/50 max-w-md mb-8 text-sm leading-relaxed">
          El módulo <strong className="text-white font-bold">{featureName}</strong> no está incluido en tu plan actual de tienda. Para acceder a estas herramientas profesionales, necesitas activar esta característica.
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            // Could redirect to subscription / plans or contact
            window.location.href = "/admin/profile";
          }}
          className="shadow-[0_0_25px_rgba(225,14,14,0.4)]"
        >
          Mejorar Plan
        </Button>
      </div>
    </div>
  );
}
