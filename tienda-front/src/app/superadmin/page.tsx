"use client";
import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBox,
  IconStore,
  IconRefresh,
  IconSettings,
} from "@/components/ui/Icons";

export default function SuperAdminHub() {
  const t = useTranslations("superadmin_page");

  const modules = [
    {
      href: "/superadmin/products",
      title: t("modules.catalog_title"),
      description: t("modules.catalog_desc"),
      icon: <IconBox className="w-8 h-8" />,
      color: "from-red-600 to-rose-700",
      shadow: "shadow-red/30",
      accentText: "text-red-light",
      tag: t("modules.catalog_tag"),
    },
    {
      href: "/superadmin/stores",
      title: t("modules.stores_title"),
      description: t("modules.stores_desc"),
      icon: <IconStore className="w-8 h-8" />,
      color: "from-purple-600 to-indigo-700",
      shadow: "shadow-purple-900/30",
      accentText: "text-purple-400",
      tag: t("modules.stores_tag"),
    },
    {
      href: "/superadmin/sync",
      title: t("modules.sync_title"),
      description: t("modules.sync_desc"),
      icon: <IconRefresh className="w-8 h-8" />,
      color: "from-teal-600 to-cyan-700",
      shadow: "shadow-teal-900/30",
      accentText: "text-teal-400",
      tag: t("modules.sync_tag"),
    },
    {
      href: "/superadmin/config/sync",
      title: t("modules.config_title"),
      description: t("modules.config_desc"),
      icon: <IconSettings className="w-8 h-8" />,
      color: "from-amber-500 to-orange-600",
      shadow: "shadow-amber-900/30",
      accentText: "text-amber-400",
      tag: t("modules.config_tag"),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-6 left-6 z-10">
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-xl py-2 px-4 font-bold text-xs text-white/70 bg-white/[0.04] border border-white/10 hover:border-red/40 hover:bg-red/10 hover:text-white transition-all duration-200 shadow-sm"
        >
          <IconArrowLeft className="w-4 h-4 text-white/50 group-hover:text-red transition-colors" />
          <span>{t("back_to_shop")}</span>
        </Link>
      </div>

      <div className="text-center mb-12 max-w-2xl mt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red/10 border border-red/20 text-red text-xs font-black tracking-widest uppercase mb-4 shadow-sm">
          <span>{t("badge")}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          {t("title")}
        </h1>
        <p className="text-base md:text-lg text-white/60 leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[90rem]">
        {modules.map((mod) => (
          <Link
            key={mod.href}
            href={mod.href}
            className="group relative bg-[#0E121B] rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 border border-white/10 hover:border-white/20 overflow-hidden flex flex-col justify-between"
          >
            {/* Glow effect on hover */}
            <div
              className={`absolute -inset-0 bg-gradient-to-br ${mod.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none rounded-3xl`}
            />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${mod.color} text-white flex items-center justify-center shadow-lg ${mod.shadow} group-hover:scale-105 transition-transform duration-300 border border-white/15`}
                >
                  {mod.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50">
                  {mod.tag}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-white transition-colors">
                {mod.title}
              </h2>
              <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                {mod.description}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-black text-white uppercase tracking-wider">
              <span className={`group-hover:${mod.accentText} transition-colors`}>
                {t("enter_module")}
              </span>
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-red group-hover:border-red text-white transition-all duration-300 group-hover:translate-x-1">
                <IconArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
