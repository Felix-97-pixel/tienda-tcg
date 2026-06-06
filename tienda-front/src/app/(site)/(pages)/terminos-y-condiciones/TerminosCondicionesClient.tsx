"use client";
import React from "react";
import { useTranslations } from "next-intl";
import LegalPageLayout, { LegalLink } from "@/components/layout/LegalPageLayout";
import LegalSection from "@/components/layout/LegalSection";

const TerminosCondicionesClient = () => {
  const t = useTranslations("terms");

  const sidebarLinks: LegalLink[] = [
    { id: "introduccion", label: t("nav.introduccion") },
    { id: "informacion", label: t("nav.informacion") },
    { id: "precios-pagos", label: t("nav.precios") },
    { id: "envios-entregas", label: t("nav.envios") },
    { id: "devoluciones", label: t("nav.devoluciones") },
    { id: "privacidad", label: t("nav.privacidad") },
    { id: "responsabilidad", label: t("nav.responsabilidad") },
    { id: "ley-aplicable", label: t("nav.ley") },
    { id: "disposiciones-generales", label: t("nav.disposiciones") },
    { id: "creditos-tienda", label: t("nav.creditos") },
    { id: "transferencias", label: t("nav.transferencias") }
  ];

  const sectionsConfig = [
    { id: "introduccion", key: "introduccion", num: 1, type: "standard", paragraphs: ["p1", "p2"] },
    { id: "informacion", key: "informacion", num: 2, type: "standard", paragraphs: ["p1", "p2"] },
    { id: "precios-pagos", key: "precios", num: 3, type: "standard", paragraphs: ["p1", "p2", "p3"] },
    { id: "envios-entregas", key: "envios", num: 4, type: "envios" },
    { id: "devoluciones", key: "devoluciones", num: 5, type: "standard", paragraphs: ["p1", "p2", "p3"] },
    { id: "privacidad", key: "privacidad", num: 6, type: "standard", paragraphs: ["p1"] },
    { id: "responsabilidad", key: "responsabilidad", num: 7, type: "standard", paragraphs: ["p1", "p2", "p3"] },
    { id: "ley-aplicable", key: "ley", num: 8, type: "standard", paragraphs: ["p1", "p2"] },
    { id: "disposiciones-generales", key: "disposiciones", num: 9, type: "standard", paragraphs: ["p1", "p2", "p3"] },
    { id: "creditos-tienda", key: "creditos", num: 10, type: "creditos" },
    { id: "transferencias", key: "transferencias", num: 11, type: "transferencias" }
  ];

  return (
    <LegalPageLayout
      title={t("pageTitle")}
      navTitle={t("navTitle")}
      links={sidebarLinks}
      lastUpdated={t("lastUpdated")}
      backToShopText={t("backToShop")}
    >
      {/* Header Box */}
      <div className="border-b border-white/10 pb-8 mb-10">
        <div className="inline-block bg-red/10 text-red font-bold text-xs uppercase px-3 py-1 rounded-full mb-4">
          {t("badge")}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {t("mainTitle")}
        </h2>
        <p className="text-gray-5 text-custom-sm mt-2">
          {t("description")}
        </p>
      </div>

      {/* Loop over sections */}
      {sectionsConfig.map((section, idx) => {
        const isFirst = idx === 0;
        
        return (
          <React.Fragment key={section.id}>
            {!isFirst && <hr className="border-white/10 my-8" />}
            
            {section.type === "standard" && (
              <LegalSection id={section.id} num={section.num} title={t(`${section.key}.title`)}>
                <div className="flex flex-col gap-3">
                  {section.paragraphs?.map((p, pIdx) => (
                    <p key={pIdx}>
                      <strong className="text-white">{section.num}.{pIdx + 1}</strong> {t(`${section.key}.${p}`)}
                    </p>
                  ))}
                </div>
              </LegalSection>
            )}

            {section.type === "envios" && (
              <LegalSection id={section.id} num={section.num} title={t(`${section.key}.title`)}>
                <div className="flex flex-col gap-3">
                  <p>
                    <strong className="text-white">4.1</strong> {t("envios.p1")}
                  </p>
                  <p>
                    <strong className="text-white">4.2</strong> {t("envios.p2")}
                  </p>
                  <p>
                    <strong className="text-white">4.3</strong> {t("envios.p3")}
                  </p>
                  <div className="bg-[#222630] border-l-4 border-blue p-4.5 rounded-r-[5px] mt-2">
                    <p className="font-semibold text-white mb-1">{t("envios.scheduleTitle")}</p>
                    <p className="text-custom-sm">
                      <strong className="text-white">4.4</strong> {t("envios.scheduleDesc")}
                    </p>
                  </div>
                </div>
              </LegalSection>
            )}

            {section.type === "creditos" && (
              <LegalSection
                id={section.id}
                num={section.num}
                title={t("creditos.title")}
                badgeColor="bg-blue"
                titleColor="text-white text-xl"
                className="bg-dark text-white rounded-lg p-6 sm:p-8 border-l-4 border-blue"
              >
                <div className="flex flex-col gap-4 text-gray-3">
                  <p>
                    <strong className="text-white">10.1</strong> {t("creditos.p1")}
                  </p>
                  
                  <div className="border border-white/10 rounded p-4 bg-[#1a1d24]/5">
                    <p className="font-bold text-blue mb-1">{t("creditos.t1_title")}</p>
                    <p>
                      <strong className="text-white">10.2</strong> {t("creditos.t1_desc")}
                    </p>
                  </div>

                  <div className="border border-white/10 rounded p-4 bg-[#1a1d24]/5">
                    <p className="font-bold text-blue mb-1">{t("creditos.t2_title")}</p>
                    <p>
                      <strong className="text-white">10.3</strong> {t("creditos.t2_desc")}
                    </p>
                  </div>

                  <div>
                    <strong className="text-white">10.4</strong> {t("creditos.p4_desc")}
                    <ul className="list-disc pl-5 mt-2 flex flex-col gap-1 text-gray-4">
                      <li>{t("creditos.p4_li1")}</li>
                      <li>{t("creditos.p4_li2")}</li>
                      <li>{t("creditos.p4_li3")}</li>
                    </ul>
                  </div>

                  <div>
                    <strong className="text-white">10.5</strong> {t("creditos.p5_desc")}
                    <ul className="list-disc pl-5 mt-2 flex flex-col gap-1 text-gray-4">
                      <li>{t("creditos.p5_li1")}</li>
                      <li>{t("creditos.p5_li2")}</li>
                    </ul>
                  </div>
                </div>
              </LegalSection>
            )}

            {section.type === "transferencias" && (
              <LegalSection
                id={section.id}
                className="bg-red/5 border border-red/20 rounded-lg p-6 sm:p-8"
              >
                <h3 className="text-lg font-bold text-red mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z" />
                  </svg>
                  {t("transferencias.title")}
                </h3>
                <div className="flex flex-col gap-3">
                  <p>
                    {t("transferencias.p1")}
                  </p>
                  <p className="font-medium text-white bg-yellow-100/50 p-3.5 border-l-2 border-yellow-500 rounded-r">
                    {t("transferencias.warning")}
                  </p>
                </div>
              </LegalSection>
            )}
          </React.Fragment>
        );
      })}
    </LegalPageLayout>
  );
};

export default TerminosCondicionesClient;
