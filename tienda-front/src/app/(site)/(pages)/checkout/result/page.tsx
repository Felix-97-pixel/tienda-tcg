import Loader from "@/components/ui/Loader";
import React, { Suspense } from "react";
import PaymentResult from "@/app/(site)/(pages)/checkout/_components/PaymentResult";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return {
    title: t("meta_result_title"),
    description: t("meta_result_description"),
  };
}

const CheckoutResultPage = async () => {
  const tCommon = await getTranslations("common");
  return (
    <Suspense fallback={<Loader text={tCommon("loading")} className="min-h-[40vh] bg-transparent py-10" />}>
      <PaymentResult />
    </Suspense>
  );
};

export default CheckoutResultPage;
