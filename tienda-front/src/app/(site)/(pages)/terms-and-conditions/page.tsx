import React from "react";
import { Metadata } from "next";
import TerminosCondicionesClient from "./TerminosCondicionesClient";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("terms");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

const TerminosCondicionesPage = () => {
  return <TerminosCondicionesClient />;
};

export default TerminosCondicionesPage;
