import React from "react";
import ShopDetails from "@/app/(site)/(pages)/shop-details/_components";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("product_details");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

const ShopDetailsPage = () => {
  return (
    <main>
      <ShopDetails />
    </main>
  );
};

export default ShopDetailsPage;
