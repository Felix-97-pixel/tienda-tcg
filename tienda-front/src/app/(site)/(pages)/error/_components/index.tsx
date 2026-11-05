"use client";
import React from "react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { IconArrowLeft } from "@/components/ui/Icons";

const Error = () => {
  const t = useTranslations("errors");

  return (
    <>
      <Breadcrumb title={t("breadcrumb_title")} pages={[t("breadcrumb_page")]} />
      <section className="overflow-hidden py-20 bg-[#222630]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-[#1a1d24] rounded-xl shadow-1 px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              <Image
                src="/images/404.svg"
                alt="404"
                className="mx-auto mb-8 w-1/2 sm:w-auto"
                width={288}
                height={190}
              />

              <h2 className="font-bold text-white text-xl sm:text-2xl mb-3">
                {t("not_found_title")}
              </h2>

              <p className="max-w-[440px] w-full mx-auto mb-7.5 text-gray-4 text-sm leading-relaxed">
                {t("not_found_desc")}
              </p>

              <Link
                href="/"
                className="inline-flex items-center gap-2 font-bold text-white bg-red hover:bg-red-dark py-3 px-6 rounded-xl transition-all shadow-lg shadow-red/25"
              >
                <IconArrowLeft className="w-4 h-4" />
                <span>{t("back_to_home")}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Error;
