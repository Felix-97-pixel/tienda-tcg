import React from "react";
import { Metadata } from "next";
import PoliticaPrivacidadClient from "./PoliticaPrivacidadClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

const PoliticaPrivacidadPage = () => {
  return <PoliticaPrivacidadClient />;
};

export default PoliticaPrivacidadPage;
