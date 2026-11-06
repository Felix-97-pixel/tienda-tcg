import AdminSignin from "@/app/admin/_components/AdminSignin";
import React from "react";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");
  return {
    title: t("admin_meta_title"),
    description: t("admin_meta_description"),
  };
}

const SigninPage = () => {
  return (
    <main>
      <AdminSignin />
    </main>
  );
};

export default SigninPage;
