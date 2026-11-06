import React from "react";
import DevaluationsForm from "./_components/DevaluationsForm";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.devaluations_page");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function DevaluationsPage() {
  const t = await getTranslations("admin.devaluations_page");

  return (
    <div className="space-y-6 pb-24 text-white">
      <div className="pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red">{t("badge")}</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">{t("title")}</h1>
        <p className="text-white/40 text-xs mt-0.5">
          {t("subtitle")}
        </p>
      </div>

      <DevaluationsForm />
    </div>
  );
}
