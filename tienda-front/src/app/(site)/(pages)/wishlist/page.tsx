import React from "react";
import { Wishlist } from "@/app/(site)/(pages)/wishlist/_components";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("wishlist");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

const WishlistPage = () => {
  return (
    <main>
      <Wishlist />
    </main>
  );
};

export default WishlistPage;
