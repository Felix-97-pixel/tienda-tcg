"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { IconLock } from "@/components/ui/Icons";

interface UpsellBannerProps {
  featureName: string;
}

export default function UpsellBanner({ featureName }: UpsellBannerProps) {
  const t = useTranslations("store_profile_form");
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[60vh] bg-[#0E121B] rounded-3xl border border-white/10 p-10 text-center shadow-2xl overflow-hidden group">
      {/* Ambient Radial Glow */}
      <div className="absolute w-96 h-96 bg-red/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-red/15 transition-all duration-700" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Lock Icon Container */}
        <div className="w-20 h-20 bg-red/10 border border-red/25 rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_35px_rgba(225,14,14,0.25)] text-red group-hover:scale-105 transition-transform duration-300">
          <IconLock className="w-9 h-9" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-red/10 border border-red/25 text-red mb-3">
          {t("restricted_access")}
        </span>

        <h2 className="text-3xl font-black text-white tracking-tight mb-3">{t("module_locked")}</h2>
        <p className="text-white/50 max-w-md mb-8 text-sm leading-relaxed">
          {t("module_locked_desc", { name: featureName })}
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            window.location.href = "/admin/profile";
          }}
          className="shadow-[0_0_25px_rgba(225,14,14,0.4)]"
        >
          {t("upgrade_plan")}
        </Button>
      </div>
    </div>
  );
}
