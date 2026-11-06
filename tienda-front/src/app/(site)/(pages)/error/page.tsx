import React from "react";
import Error from "@/app/(site)/(pages)/error/_components";

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("errors");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

const ErrorPage = () => {
  return (
    <main>
      <Error />
    </main>
  );
};

export default ErrorPage;
