"use client";
import React from "react";
import { useTranslations } from "next-intl";

import { useAppSelector } from "@/redux/store";
import UpsellBanner from "@/components/Admin/UpsellBanner";

export default function AdminSalesPage() {
  const t = useTranslations("sales");
  const { features } = useAppSelector((state) => state.authReducer);

  if (!features.includes("function:statistics")) {
    return (
      <div className="p-6 pb-24">
        <UpsellBanner featureName="Reportes Avanzados" />
      </div>
    );
  }

  return (
    <div className="p-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t("title")}</h1>
          <p className="text-gray-4 text-sm font-medium mt-1">{t("subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-32 text-center bg-[#1a1d24] rounded-2xl shadow-1 border border-stroke">
        <div className="w-16 h-16 bg-blue/10 text-blue rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          🚀
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Próximamente</h2>
        <p className="text-gray-4 text-sm max-w-sm mx-auto">
          Aquí podrás ver y gestionar tus ventas de forma avanzada.
          Por ahora, dirígete a Órdenes o Estadísticas para monitorear tu negocio.
        </p>
      </div>
    </div>
  );
}
