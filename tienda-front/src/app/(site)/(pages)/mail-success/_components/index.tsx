"use client";
import React from "react";
import Breadcrumb from "@/components/layout/Breadcrumb";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { IconArrowLeft, IconCheckCircle } from "@/components/ui/Icons";

const MailSuccess = () => {
  const t = useTranslations("common.mail_success");

  return (
    <>
      <Breadcrumb title={t("breadcrumb_title")} pages={[t("breadcrumb_page")]} />
      <section className="overflow-hidden py-20 bg-[var(--tt-bg-canvas)] transition-colors duration-200">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] rounded-2xl shadow-xl px-4 py-10 sm:py-15 lg:py-20 xl:py-25">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 mb-6">
                <IconCheckCircle className="w-8 h-8" />
              </div>

              <h2 className="font-bold text-emerald-500 dark:text-emerald-400 text-3xl lg:text-[40px] lg:leading-[50px] mb-3">
                {t("title")}
              </h2>

              <h3 className="font-medium text-[var(--tt-text-main)] text-xl sm:text-2xl mb-3">
                {t("subtitle")}
              </h3>

              <p className="max-w-[491px] w-full mx-auto mb-7.5 text-[var(--tt-text-muted)] text-sm leading-relaxed">
                {t("desc")}
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

export default MailSuccess;
