"use client";
import React from "react";
import { useTranslations } from "next-intl";
import { IconInfo, IconUpload, IconCoins, IconPencil } from "@/components/ui/Icons";

export default function AdminSync() {
  const t = useTranslations("sync");

  return (
    <div className="p-6 space-y-8 pb-24 max-w-4xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">{t("hub_title")}</h1>
        <p className="text-gray-4 text-base">
          {t("hub_subtitle")}
        </p>
      </div>

      <div className="bg-[#0f1115] rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <IconInfo className="w-6 h-6 text-blue" />
              {t("how_it_works_title")}
            </h2>
            <p className="text-gray-4 text-sm leading-relaxed">
              {t("how_it_works_desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-[#1a1d24]/50 p-6 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-blue/20 text-blue rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <IconUpload className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold mb-1">{t("import_expansions_card_title")}</h3>
              <p className="text-xs text-gray-5 leading-relaxed">{t("import_expansions_card_desc")}</p>
            </div>

            <div className="bg-[#1a1d24]/50 p-6 rounded-2xl border border-white/5">
              <div className="w-10 h-10 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center mb-4 shadow-sm">
                <IconCoins className="w-5 h-5" />
              </div>
              <h3 className="text-white font-bold mb-1">{t("price_update_card_title")}</h3>
              <p className="text-xs text-gray-5 leading-relaxed">{t("price_update_card_desc")}</p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue/10 border border-blue/20 rounded-xl">
            <p className="text-sm text-blue font-medium flex items-center gap-2">
              <IconPencil className="w-5 h-5 flex-shrink-0" />
              {t("select_game_hint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
