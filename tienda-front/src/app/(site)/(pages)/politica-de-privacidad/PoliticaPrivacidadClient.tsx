"use client";
import React from "react";
import { useTranslations } from "next-intl";
import LegalPageLayout, { LegalLink } from "@/components/layout/LegalPageLayout";
import LegalSection from "@/components/layout/LegalSection";

const PoliticaPrivacidadClient = () => {
  const t = useTranslations("privacy");

  const sidebarLinks: LegalLink[] = [
    { id: "introduccion-privacidad", label: t("nav.introduccion") },
    { id: "informacion-recopilada", label: t("nav.informacion") },
    { id: "uso-informacion", label: t("nav.uso") },
    { id: "compartir-informacion", label: t("nav.compartir") },
    { id: "retencion-datos", label: t("nav.retencion") },
    { id: "cambios-contacto", label: t("nav.contacto") }
  ];

  const sectionsConfig = [
    { id: "introduccion-privacidad", key: "introduccion", type: "intro" },
    { id: "informacion-recopilada", key: "informacion", num: 1, type: "informacion" },
    { id: "uso-informacion", key: "uso", num: 2, type: "uso" },
    { id: "compartir-informacion", key: "compartir", num: 3, type: "compartir" },
    { id: "retencion-datos", key: "retencion", num: 4, type: "retencion" },
    { id: "cambios-contacto", key: "contacto", num: 5, type: "contacto" }
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
            
            {section.type === "intro" && (
              <LegalSection id={section.id}>
                <div className="flex flex-col gap-3">
                  <p>
                    El sitio oficial <strong className="text-white">www.TapTradegames.cl</strong> es operado con altos estándares de resguardo. {t("introduccion.p1")}
                  </p>
                </div>
              </LegalSection>
            )}

            {section.type === "informacion" && (
              <LegalSection id={section.id} num={section.num} title={t("informacion.title")}>
                <div className="flex flex-col gap-4">
                  <p>{t("informacion.p1")}</p>
                  <p>{t("informacion.p2")}</p>

                  <div className="bg-[#222630] p-5 rounded-lg border-l-4 border-red flex flex-col gap-3">
                    <p className="font-bold text-white mb-1">{t("informacion.techTitle")}</p>
                    <ul className="list-disc pl-5 flex flex-col gap-2">
                      <li>{t("informacion.techLi1")}</li>
                      <li>{t("informacion.techLi2")}</li>
                    </ul>
                  </div>

                  <div className="bg-dark text-white p-5 rounded-lg border-l-4 border-blue flex flex-col gap-3">
                    <p className="font-bold text-blue mb-1">{t("informacion.orderTitle")}</p>
                    <p className="text-gray-3">{t("informacion.orderDesc")}</p>
                  </div>

                  <p>{t("informacion.p3")}</p>
                </div>
              </LegalSection>
            )}

            {section.type === "uso" && (
              <LegalSection id={section.id} num={section.num} title={t("uso.title")}>
                <div className="flex flex-col gap-4">
                  <p>{t("uso.p1")}</p>
                  <div>
                    <strong className="text-white">{t("uso.listTitle")}</strong>
                    <ul className="list-disc pl-5 mt-2 flex flex-col gap-1.5">
                      <li>{t("uso.listLi1")}</li>
                      <li>{t("uso.listLi2")}</li>
                      <li>{t("uso.listLi3")}</li>
                    </ul>
                  </div>
                  <p>{t("uso.p2")}</p>
                </div>
              </LegalSection>
            )}

            {section.type === "compartir" && (
              <LegalSection id={section.id} num={section.num} title={t("compartir.title")}>
                <div className="flex flex-col gap-4">
                  <p>{t("compartir.p1")}</p>
                  
                  <div className="bg-red/5 border border-red/10 p-4.5 rounded">
                    <p className="font-semibold text-white mb-1">{t("compartir.analyticsTitle")}</p>
                    <p>{t("compartir.analyticsDesc")}</p>
                  </div>

                  <p>{t("compartir.p2")}</p>
                </div>
              </LegalSection>
            )}

            {section.type === "retencion" && (
              <LegalSection id={section.id} num={section.num} title={t("retencion.title")}>
                <div className="flex flex-col gap-3">
                  <p>{t("retencion.p1")}</p>
                </div>
              </LegalSection>
            )}

            {section.type === "contacto" && (
              <LegalSection
                id={section.id}
                num={section.num}
                title={t("contacto.title")}
                className="bg-red/5 border border-red/20 rounded-lg p-6 sm:p-8"
              >
                <div className="flex flex-col gap-4">
                  <p>{t("contacto.p1")}</p>
                  
                  <div className="bg-[#1a1d24] p-4.5 rounded shadow-sm border border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="font-bold text-white">{t("contacto.boxTitle")}</p>
                      <p className="text-xs text-gray-5">{t("contacto.boxDesc")}</p>
                    </div>
                    <a href="mailto:tiendaTapTrade@gmail.com" className="bg-red hover:bg-dark text-white font-bold text-custom-sm py-2 px-4 rounded transition duration-200">
                      {t("contacto.btn")}
                    </a>
                  </div>
                </div>
              </LegalSection>
            )}
          </React.Fragment>
        );
      })}
    </LegalPageLayout>
  );
};

export default PoliticaPrivacidadClient;
