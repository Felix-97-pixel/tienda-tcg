import React, { Suspense } from "react";
import TcgMarketplaceCatalog from "./_components/TcgMarketplaceCatalog";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("shop");
  return {
    title: t("meta_catalog_title"),
    description: t("meta_catalog_desc"),
  };
}

const ShopPage = async () => {
  const t = await getTranslations("shop");

  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-[#07090E] pt-32 text-center text-white/50 font-mono">{t("loading_catalog")}</div>}>
        <TcgMarketplaceCatalog />
      </Suspense>
    </main>
  );
};

export default ShopPage;
