import React from "react";
import Cart from "@/app/(site)/(pages)/cart/_components";

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("cart");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
