import React from "react";
import CheckoutWebpay from "@/app/(site)/(pages)/checkout/_components";

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

const CheckoutPage = () => {
  return (
    <main>
      <CheckoutWebpay />
    </main>
  );
};

export default CheckoutPage;
