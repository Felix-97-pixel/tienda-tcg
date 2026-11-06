import React from "react";
import MailSuccess from "@/app/(site)/(pages)/mail-success/_components";

import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("mail_success");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

const MailSuccessPage = () => {
  return (
    <main>
      <MailSuccess />
    </main>
  );
};

export default MailSuccessPage;
