import React from "react";
import Home from "@/app/landing/_components/Home";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop");
  return {
    title: t("meta_home_title"),
    description: t("meta_home_desc"),
  };
}

export default function StoreFrontHomePage() {
  return (
    <>
      <Home />
    </>
  );
}
