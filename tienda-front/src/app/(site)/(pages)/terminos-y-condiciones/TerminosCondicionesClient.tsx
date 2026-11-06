"use client";
import React from "react";
import Link from "next/link";
import LegalPageLayout, { LegalLink } from "@/components/layout/LegalPageLayout";
import LegalSection from "@/components/layout/LegalSection";
import {
  IconShieldCheck,
  IconStore,
  IconAlertCircle,
} from "@/components/ui/Icons";
import { useTranslations } from "next-intl";

const TerminosCondicionesClient = () => {
  const t = useTranslations("legal.terms");

  const sidebarLinks: LegalLink[] = [
    { id: "introduccion", label: t("nav.s1") },
    { id: "modelo-negocio", label: t("nav.s2") },
    { id: "registro-cuentas", label: t("nav.s3") },
    { id: "precios-pagos", label: t("nav.s4") },
    { id: "graduacion-autenticidad", label: t("nav.s5") },
    { id: "logistica-envios", label: t("nav.s6") },
    { id: "buylist-creditos", label: t("nav.s7") },
    { id: "garantias-devoluciones", label: t("nav.s8") },
    { id: "propiedad-intelectual", label: t("nav.s9") },
    { id: "privacidad-datos", label: t("nav.s10") },
    { id: "responsabilidad-indemnidad", label: t("nav.s11") },
    { id: "jurisdiccion-ley", label: t("nav.s12") },
  ];

  return (
    <LegalPageLayout
      title={t("pageTitle")}
      navTitle={t("navTitle")}
      links={sidebarLinks}
      lastUpdated={t("lastUpdated")}
      backToShopText={t("backToShop")}
    >
      {/* Header Overview Card */}
      <div className="border-b border-white/10 pb-8 mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#E10E0E]/20 text-[#E10E0E] border border-[#E10E0E]/40 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10E0E] animate-pulse"></span>
            {t("badge")}
          </span>
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-white/5 border border-white/10 text-gray-300">
            {t("rutBadge")}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          {t("mainTitle")}
        </h1>

        <p className="text-gray-400 text-sm sm:text-base mt-3 leading-relaxed">
          {t("description")}
        </p>

        {/* Legal Identity Pill Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/5">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">{t("pill1_label")}</span>
            <span className="text-xs font-bold text-white block mt-0.5">{t("pill1_val")}</span>
            <span className="text-[11px] font-mono text-gray-500">{t("pill1_sub")}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">{t("pill2_label")}</span>
            <span className="text-xs font-bold text-white block mt-0.5">{t("pill2_val")}</span>
            <span className="text-[11px] font-mono text-gray-500">{t("pill2_sub")}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">{t("pill3_label")}</span>
            <span className="text-xs font-bold text-white block mt-0.5">{t("pill3_val")}</span>
            <span className="text-[11px] font-mono text-gray-500">{t("pill3_sub")}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-12 text-gray-300">
        {/* SECCIÓN 1: INTRODUCCIÓN */}
        <LegalSection id="introduccion" num={1} title={t("s1.title")}>
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">{t("s1.p1_label")}</strong> {t("s1.p1_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s1.p2_label")}</strong> {t("s1.p2_text")}
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm">
              <li><strong className="text-white">{t("s1.li1_label")}</strong> {t("s1.li1_text")}</li>
              <li><strong className="text-white">{t("s1.li2_label")}</strong> {t("s1.li2_text")}</li>
              <li><strong className="text-white">{t("s1.li3_label")}</strong> {t("s1.li3_text")}</li>
            </ul>
            <p>
              <strong className="text-white font-mono">{t("s1.p3_label")}</strong> {t("s1.p3_text")}
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* SECCIÓN 2: MODELO DE NEGOCIO SAAS Y MARKETPLACE */}
        <LegalSection id="modelo-negocio" num={2} title={t("s2.title")}>
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">{t("s2.p1_label")}</strong> {t("s2.p1_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s2.p2_label")}</strong> {t("s2.p2_text")}
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3">
              <IconStore className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block mb-0.5">{t("s2.box_title")}</span>
                {t("s2.box_desc")}
              </div>
            </div>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* SECCIÓN 3: REGISTRO Y KYC */}
        <LegalSection id="registro-cuentas" num={3} title={t("s3.title")}>
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">{t("s3.p1_label")}</strong> {t("s3.p1_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s3.p2_label")}</strong> {t("s3.p2_text")}
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm">
              <li>{t("s3.li1")}</li>
              <li>{t("s3.li2")}</li>
              <li>{t("s3.li3")}</li>
            </ul>
            <p>{t("s3.p3")}</p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* SECCIÓN 4: PRECIOS, MODELO SAAS Y LIQUIDACIÓN DIRECTA */}
        <LegalSection id="precios-pagos" num={4} title={t("s4.title")}>
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">{t("s4.p1_label")}</strong> {t("s4.p1_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s4.p2_label")}</strong> {t("s4.p2_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s4.p3_label")}</strong> {t("s4.p3_text")}
            </p>

            {/* Plans Table */}
            <div className="mt-2 overflow-x-auto">
              <table className="w-full text-left text-xs border border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-white/5 text-gray-300 font-mono uppercase">
                  <tr>
                    <th className="p-3 border-b border-white/10">{t("s4.th_plan")}</th>
                    <th className="p-3 border-b border-white/10">{t("s4.th_fee")}</th>
                    <th className="p-3 border-b border-white/10">{t("s4.th_limit")}</th>
                    <th className="p-3 border-b border-white/10">{t("s4.th_commission")}</th>
                    <th className="p-3 border-b border-white/10">{t("s4.th_payout")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300">
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">{t("s4.r1_plan")}</td>
                    <td className="p-3 font-mono font-bold text-white">{t("s4.r1_fee")}</td>
                    <td className="p-3 font-mono">{t("s4.r1_limit")}</td>
                    <td className="p-3 text-emerald-400 font-mono font-bold">{t("s4.r_comm_val")}</td>
                    <td className="p-3 text-emerald-400 font-bold">{t("s4.r_payout_val")}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">{t("s4.r2_plan")}</td>
                    <td className="p-3 font-mono font-bold text-white">{t("s4.r2_fee")}</td>
                    <td className="p-3 font-mono">{t("s4.r2_limit")}</td>
                    <td className="p-3 text-emerald-400 font-mono font-bold">{t("s4.r_comm_val")}</td>
                    <td className="p-3 text-emerald-400 font-bold">{t("s4.r_payout_val")}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">{t("s4.r3_plan")}</td>
                    <td className="p-3 font-mono font-bold text-white">{t("s4.r3_fee")}</td>
                    <td className="p-3 font-mono">{t("s4.r3_limit")}</td>
                    <td className="p-3 text-emerald-400 font-mono font-bold">{t("s4.r_comm_val")}</td>
                    <td className="p-3 text-emerald-400 font-bold">{t("s4.r_payout_val")}</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02]">
                    <td className="p-3 font-bold text-white">{t("s4.r4_plan")}</td>
                    <td className="p-3 font-mono font-bold text-white">{t("s4.r4_fee")}</td>
                    <td className="p-3 font-mono">{t("s4.r4_limit")}</td>
                    <td className="p-3 text-emerald-400 font-mono font-bold">{t("s4.r_comm_val")}</td>
                    <td className="p-3 text-emerald-400 font-bold">{t("s4.r_payout_val")}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              <strong className="text-white font-mono">{t("s4.p4_label")}</strong> {t("s4.p4_text")}
            </p>

            <p>
              <strong className="text-white font-mono">{t("s4.p5_label")}</strong> {t("s4.p5_text")}
            </p>

            <p>
              <strong className="text-white font-mono">{t("s4.p6_label")}</strong> {t("s4.p6_text")}
            </p>

            <p>
              <strong className="text-white font-mono">{t("s4.p7_label")}</strong> {t("s4.p7_text")}
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-start gap-3 mt-1">
              <IconShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block mb-0.5">
                  {t("s4.p8_title")}
                </span>
                {t("s4.p8_text")}
              </div>
            </div>

            <p>
              <strong className="text-white font-mono">{t("s4.p9_label")}</strong> {t("s4.p9_text")}
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* SECCIÓN 5: GRADUACIÓN Y AUTENTICIDAD */}
        <LegalSection id="graduacion-autenticidad" num={5} title={t("s5.title")}>
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">{t("s5.p1_label")}</strong> {t("s5.p1_text")}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {t("s5.c1_badge")}
                  </span>
                  <span className="font-bold text-white">{t("s5.c1_title")}</span>
                </div>
                <p className="text-gray-400">{t("s5.c1_desc")}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    {t("s5.c2_badge")}
                  </span>
                  <span className="font-bold text-white">{t("s5.c2_title")}</span>
                </div>
                <p className="text-gray-400">{t("s5.c2_desc")}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {t("s5.c3_badge")}
                  </span>
                  <span className="font-bold text-white">{t("s5.c3_title")}</span>
                </div>
                <p className="text-gray-400">{t("s5.c3_desc")}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-orange-500/20 text-orange-300 border border-orange-500/40">
                    {t("s5.c4_badge")}
                  </span>
                  <span className="font-bold text-white">{t("s5.c4_title")}</span>
                </div>
                <p className="text-gray-400">{t("s5.c4_desc")}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 sm:col-span-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-red-500/20 text-red-300 border border-red-500/40">
                    {t("s5.c5_badge")}
                  </span>
                  <span className="font-bold text-white">{t("s5.c5_title")}</span>
                </div>
                <p className="text-gray-400">{t("s5.c5_desc")}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 flex items-start gap-3 mt-2">
              <IconShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-white block mb-0.5">{t("s5.zero_title")}</span>
                {t("s5.zero_desc")}
              </div>
            </div>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* SECCIÓN 6: LOGÍSTICA Y ENVÍOS */}
        <LegalSection id="logistica-envios" num={6} title={t("s6.title")}>
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">{t("s6.p1_label")}</strong> {t("s6.p1_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s6.p2_label")}</strong> {t("s6.p2_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s6.p3_label")}</strong> {t("s6.p3_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s6.p4_label")}</strong> {t("s6.p4_text")}
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* SECCIÓN 7: BUYLIST Y CRÉDITO DE TIENDA */}
        <LegalSection id="buylist-creditos" num={7} title={t("s7.title")}>
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">{t("s7.p1_label")}</strong> {t("s7.p1_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s7.p2_label")}</strong> {t("s7.p2_text")}
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm">
              <li>{t("s7.li1")}</li>
              <li>{t("s7.li2")}</li>
              <li>{t("s7.li3")}</li>
            </ul>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* SECCIÓN 8: GARANTÍA Y RETRACTO */}
        <LegalSection id="garantias-devoluciones" num={8} title={t("s8.title")}>
          <div className="flex flex-col gap-3.5">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs flex items-start gap-2.5">
              <IconAlertCircle className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300 block mb-1">{t("s8.box_title")}</span>
                {t("s8.box_desc")}
              </div>
            </div>

            <p>
              <strong className="text-white font-mono">{t("s8.p1_label")}</strong> {t("s8.p1_text")}
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1 text-sm">
              <li>{t("s8.li1")}</li>
              <li>{t("s8.li2")}</li>
              <li>{t("s8.li3")}</li>
            </ul>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* SECCIÓN 9: PROPIEDAD INTELECTUAL */}
        <LegalSection id="propiedad-intelectual" num={9} title={t("s9.title")}>
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">{t("s9.p1_label")}</strong> {t("s9.p1_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s9.p2_label")}</strong> {t("s9.p2_text")}
            </p>
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-gray-400">
              {t("s9.brands")}
            </div>
            <p className="text-xs text-gray-400">
              {t("s9.p3")}
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* SECCIÓN 10: PROTECCIÓN DE DATOS */}
        <LegalSection id="privacidad-datos" num={10} title={t("s10.title")}>
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">{t("s10.p1_label")}</strong> {t("s10.p1_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s10.p2_label")}</strong> {t("s10.p2_text")}{" "}
              <Link href="/politica-de-privacidad" className="text-red-light underline font-bold hover:text-white">
                {t("s10.privacy_link")}
              </Link>.
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* SECCIÓN 11: RESPONSABILIDAD */}
        <LegalSection id="responsabilidad-indemnidad" num={11} title={t("s11.title")}>
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">{t("s11.p1_label")}</strong> {t("s11.p1_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s11.p2_label")}</strong> {t("s11.p2_text")}
            </p>
          </div>
        </LegalSection>

        <hr className="border-white/10" />

        {/* SECCIÓN 12: JURISDICCIÓN */}
        <LegalSection id="jurisdiccion-ley" num={12} title={t("s12.title")}>
          <div className="flex flex-col gap-3.5">
            <p>
              <strong className="text-white font-mono">{t("s12.p1_label")}</strong> {t("s12.p1_text")}
            </p>
            <p>
              <strong className="text-white font-mono">{t("s12.p2_label")}</strong> {t("s12.p2_text")}
            </p>

            <div className="mt-4 p-5 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-white block">{t("s12.cta_title")}</span>
                <span className="text-xs text-gray-400">{t("s12.cta_desc")}</span>
              </div>
              <a
                href="mailto:legal@taptrade.cl"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#E10E0E] hover:bg-[#F23030] text-white shadow-md shadow-[#E10E0E]/20 transition-all shrink-0"
              >
                {t("s12.cta_btn")}
              </a>
            </div>
          </div>
        </LegalSection>
      </div>
    </LegalPageLayout>
  );
};

export default TerminosCondicionesClient;
