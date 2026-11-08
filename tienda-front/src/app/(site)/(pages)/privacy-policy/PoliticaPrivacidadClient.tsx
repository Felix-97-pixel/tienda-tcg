"use client";

import React from "react";
import LegalPageLayout, { LegalLink } from "@/components/layout/LegalPageLayout";
import LegalSection from "@/components/layout/LegalSection";
import {
  IconShieldCheck,
  IconCheck,
  IconEye,
  IconEdit,
  IconTrash,
  IconBan,
  IconBox,
  IconAlertCircle,
  IconBuilding,
} from "@/components/ui/Icons";
import { useTranslations } from "next-intl";

const PoliticaPrivacidadClient = () => {
  const t = useTranslations("legal.privacy");

  const sidebarLinks: LegalLink[] = [
    { id: "responsable-marco", label: t("nav.s1") },
    { id: "principios-tratamiento", label: t("nav.s2") },
    { id: "bases-licitud", label: t("nav.s3") },
    { id: "datos-recopilados", label: t("nav.s4") },
    { id: "finalidades", label: t("nav.s5") },
    { id: "seguridad-bancaria", label: t("nav.s6") },
    { id: "terceros-encargados", label: t("nav.s7") },
    { id: "derechos-arco", label: t("nav.s8") },
    { id: "procedimiento-derechos", label: t("nav.s9") },
    { id: "autoridad-control", label: t("nav.s10") },
    { id: "seguridad-brechas", label: t("nav.s11") },
    { id: "plazo-conservacion", label: t("nav.s12") },
    { id: "cookies-rastreo", label: t("nav.s13") },
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
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
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
            <span className="text-xs font-bold text-emerald-400 block mt-0.5">{t("pill2_val")}</span>
            <span className="text-[11px] text-gray-500">{t("pill2_sub")}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase block">{t("pill3_label")}</span>
            <span className="text-xs font-bold text-white block mt-0.5">{t("pill3_val")}</span>
            <span className="text-[11px] text-gray-500">{t("pill3_sub")}</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: Responsable y Marco Legal */}
      <LegalSection id="responsable-marco" num={1} title={t("s1.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s1.p1")}</p>
          <p>{t("s1.p2")}</p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-300">
            <li>{t("s1.li1")}</li>
            <li>{t("s1.li2")}</li>
            <li>{t("s1.li3")}</li>
          </ul>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 2: Principios del Tratamiento */}
      <LegalSection id="principios-tratamiento" num={2} title={t("s2.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s2.p1")}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
            <div className="bg-[#111522] border border-white/10 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" /> {t("s2.c1_title")}
              </h4>
              <p className="text-xs text-gray-400">{t("s2.c1_desc")}</p>
            </div>

            <div className="bg-[#111522] border border-white/10 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" /> {t("s2.c2_title")}
              </h4>
              <p className="text-xs text-gray-400">{t("s2.c2_desc")}</p>
            </div>

            <div className="bg-[#111522] border border-white/10 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" /> {t("s2.c3_title")}
              </h4>
              <p className="text-xs text-gray-400">{t("s2.c3_desc")}</p>
            </div>

            <div className="bg-[#111522] border border-white/10 p-4 rounded-xl">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <IconCheck className="w-4 h-4 text-emerald-400 shrink-0" /> {t("s2.c4_title")}
              </h4>
              <p className="text-xs text-gray-400">{t("s2.c4_desc")}</p>
            </div>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 3: Bases de Licitud */}
      <LegalSection id="bases-licitud" num={3} title={t("s3.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s3.p1")}</p>
          <div className="bg-[#111522] p-5 rounded-2xl border-l-4 border-emerald-500 space-y-3">
            <div>
              <strong className="text-white text-sm block">{t("s3.b1_title")}</strong>
              <p className="text-xs text-gray-300 mt-0.5">{t("s3.b1_desc")}</p>
            </div>
            <div>
              <strong className="text-white text-sm block">{t("s3.b2_title")}</strong>
              <p className="text-xs text-gray-300 mt-0.5">{t("s3.b2_desc")}</p>
            </div>
            <div>
              <strong className="text-white text-sm block">{t("s3.b3_title")}</strong>
              <p className="text-xs text-gray-300 mt-0.5">{t("s3.b3_desc")}</p>
            </div>
            <div>
              <strong className="text-white text-sm block">{t("s3.b4_title")}</strong>
              <p className="text-xs text-gray-300 mt-0.5">{t("s3.b4_desc")}</p>
            </div>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 4: Datos Recopilados */}
      <LegalSection id="datos-recopilados" num={4} title={t("s4.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s4.p1")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="bg-[#0B0E17] border border-white/10 p-5 rounded-2xl">
              <span className="text-xs font-mono font-bold text-red uppercase block mb-1">{t("s4.catA_title")}</span>
              <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                <li>{t("s4.catA_li1")}</li>
                <li>{t("s4.catA_li2")}</li>
                <li>{t("s4.catA_li3")}</li>
                <li>{t("s4.catA_li4")}</li>
              </ul>
            </div>

            <div className="bg-[#0B0E17] border border-white/10 p-5 rounded-2xl">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase block mb-1">{t("s4.catB_title")}</span>
              <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
                <li>{t("s4.catB_li1")}</li>
                <li>{t("s4.catB_li2")}</li>
                <li>{t("s4.catB_li3")}</li>
                <li>{t("s4.catB_li4")}</li>
              </ul>
            </div>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 5: Finalidades del Uso */}
      <LegalSection id="finalidades" num={5} title={t("s5.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s5.p1")}</p>
          <ol className="list-decimal pl-5 space-y-2 text-gray-300">
            <li><strong className="text-white">{t("s5.li1_title")}</strong> {t("s5.li1_desc")}</li>
            <li><strong className="text-white">{t("s5.li2_title")}</strong> {t("s5.li2_desc")}</li>
            <li><strong className="text-white">{t("s5.li3_title")}</strong> {t("s5.li3_desc")}</li>
            <li><strong className="text-white">{t("s5.li4_title")}</strong> {t("s5.li4_desc")}</li>
            <li><strong className="text-white">{t("s5.li5_title")}</strong> {t("s5.li5_desc")}</li>
          </ol>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 6: Seguridad Bancaria y Pagos */}
      <LegalSection id="seguridad-bancaria" num={6} title={t("s6.title")}>
        <div className="bg-[#111522] border border-emerald-500/30 p-6 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold text-lg">
              <IconShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{t("s6.box_title")}</h3>
              <p className="text-xs text-emerald-400/90 font-medium">{t("s6.box_sub")}</p>
            </div>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed pt-2">
            <strong className="text-white">{t("s6.p1")}</strong>
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            {t("s6.p2")}
          </p>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 7: Transferencia a Terceros */}
      <LegalSection id="terceros-encargados" num={7} title={t("s7.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s7.p1")}</p>
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#0B0E17] border border-white/10">
              <strong className="text-white text-sm block">{t("s7.t1_title")}</strong>
              <p className="text-xs text-gray-400 mt-1">{t("s7.t1_desc")}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0E17] border border-white/10">
              <strong className="text-white text-sm block">{t("s7.t2_title")}</strong>
              <p className="text-xs text-gray-400 mt-1">{t("s7.t2_desc")}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0E17] border border-white/10">
              <strong className="text-white text-sm block">{t("s7.t3_title")}</strong>
              <p className="text-xs text-gray-400 mt-1">{t("s7.t3_desc")}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-red/10 border border-red/30 mt-2 flex items-start gap-2.5">
            <IconBan className="w-4 h-4 text-red-light shrink-0 mt-0.5" />
            <p className="text-xs text-red-light font-bold">
              {t("s7.warn")}
            </p>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 8: Derechos del Titular (ARCO+) */}
      <LegalSection id="derechos-arco" num={8} title={t("s8.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s8.p1")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <IconEye className="w-4 h-4 text-red shrink-0" /> {t("s8.r1_title")}
              </strong>
              <p className="text-xs text-gray-400 mt-1">{t("s8.r1_desc")}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <IconEdit className="w-4 h-4 text-amber-400 shrink-0" /> {t("s8.r2_title")}
              </strong>
              <p className="text-xs text-gray-400 mt-1">{t("s8.r2_desc")}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <IconTrash className="w-4 h-4 text-rose-400 shrink-0" /> {t("s8.r3_title")}
              </strong>
              <p className="text-xs text-gray-400 mt-1">{t("s8.r3_desc")}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <IconBan className="w-4 h-4 text-blue-400 shrink-0" /> {t("s8.r4_title")}
              </strong>
              <p className="text-xs text-gray-400 mt-1">{t("s8.r4_desc")}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <IconBox className="w-4 h-4 text-emerald-400 shrink-0" /> {t("s8.r5_title")}
              </strong>
              <p className="text-xs text-gray-400 mt-1">{t("s8.r5_desc")}</p>
            </div>

            <div className="p-4 rounded-xl bg-[#111522] border border-white/10">
              <strong className="text-white text-sm flex items-center gap-2">
                <IconAlertCircle className="w-4 h-4 text-purple-400 shrink-0" /> {t("s8.r6_title")}
              </strong>
              <p className="text-xs text-gray-400 mt-1">{t("s8.r6_desc")}</p>
            </div>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 9: Procedimiento y Plazos */}
      <LegalSection id="procedimiento-derechos" num={9} title={t("s9.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s9.p1")}</p>

          <div className="bg-[#0B0E17] border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase block mb-1">{t("s9.box_label")}</span>
              <p className="text-sm font-bold text-white">{t("s9.box_email")}</p>
              <p className="text-xs text-gray-400 mt-0.5">{t("s9.box_subj")}</p>
            </div>
            <a
              href="mailto:privacidad@taptrade.cl"
              className="bg-gradient-to-r from-red-dark via-red to-orange text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-xl hover:brightness-110 transition-all shrink-0 shadow-lg shadow-red/20"
            >
              {t("s9.box_btn")}
            </a>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed mt-2">
            <strong className="text-white">{t("s9.p2_label")}</strong> {t("s9.p2_text")}
          </p>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 10: Autoridad de Control */}
      <LegalSection id="autoridad-control" num={10} title={t("s10.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s10.p1")}</p>
          <div className="bg-[#111522] border border-white/10 p-5 rounded-2xl space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <IconBuilding className="w-4 h-4 text-emerald-400 shrink-0" /> {t("s10.box_title")}
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {t("s10.box_desc")}
            </p>
          </div>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 11: Seguridad y Brechas */}
      <LegalSection id="seguridad-brechas" num={11} title={t("s11.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s11.p1")}</p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-300 text-xs sm:text-sm">
            <li><strong className="text-white">{t("s11.li1_title")}</strong> {t("s11.li1_desc")}</li>
            <li><strong className="text-white">{t("s11.li2_title")}</strong> {t("s11.li2_desc")}</li>
            <li><strong className="text-white">{t("s11.li3_title")}</strong> {t("s11.li3_desc")}</li>
            <li><strong className="text-white">{t("s11.li4_title")}</strong> {t("s11.li4_desc")}</li>
          </ul>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 12: Conservación y Supresión */}
      <LegalSection id="plazo-conservacion" num={12} title={t("s12.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s12.p1")}</p>
          <ul className="list-disc pl-5 space-y-1.5 text-gray-300 text-xs sm:text-sm">
            <li><strong className="text-white">{t("s12.li1_title")}</strong> {t("s12.li1_desc")}</li>
            <li><strong className="text-white">{t("s12.li2_title")}</strong> {t("s12.li2_desc")}</li>
            <li><strong className="text-white">{t("s12.li3_title")}</strong> {t("s12.li3_desc")}</li>
          </ul>
        </div>
      </LegalSection>

      <hr className="border-white/10 my-8" />

      {/* SECCIÓN 13: Cookies */}
      <LegalSection id="cookies-rastreo" num={13} title={t("s13.title")}>
        <div className="flex flex-col gap-3.5 text-sm sm:text-base text-gray-300 leading-relaxed">
          <p>{t("s13.p1")}</p>
          <p className="text-xs text-gray-400">{t("s13.p2")}</p>
        </div>
      </LegalSection>
    </LegalPageLayout>
  );
};

export default PoliticaPrivacidadClient;
