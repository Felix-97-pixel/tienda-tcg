import MyAccount from "@/app/(site)/(pages)/my-account/_components";
import React, { Suspense } from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("account");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

const MyAccountPage = () => {
  return (
    <main>
      <Suspense fallback={<div className="min-h-screen bg-[#222630]" />}>
        <MyAccount />
      </Suspense>
    </main>
  );
};

export default MyAccountPage;
