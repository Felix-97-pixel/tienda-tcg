"use client";
import Loader from "@/components/ui/Loader";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Breadcrumb from "@/components/layout/Breadcrumb";
import { API_URL } from "@/utils/api";
import { useTranslations } from "next-intl";
import { IconCheckCircle, IconAlertTriangle } from "@/components/ui/Icons";

const VerifyEmailContent = () => {
  const t = useTranslations("verify_email");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState(t("verifying"));

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("missing_token"));
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || t("error_msg"));
        }

        setStatus("success");
        setMessage(data.message || t("success_msg"));
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || t("error_msg"));
      }
    };

    verifyToken();
  }, [token, t]);

  return (
    <div className="max-w-[570px] w-full mx-auto rounded-2xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] shadow-xl p-8 sm:p-12 text-center border-t-4 border-t-red transition-colors duration-200">
      {status === "loading" && (
        <div className="flex flex-col items-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-solid border-red border-t-transparent mb-6"></div>
          <h2 className="font-bold text-2xl text-[var(--tt-text-main)] mb-3">{t("title_loading")}</h2>
          <p className="text-[var(--tt-text-muted)] text-custom-sm leading-relaxed">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 mb-6">
            <IconCheckCircle className="w-8 h-8" />
          </div>
          <h2 className="font-bold text-2xl text-[var(--tt-text-main)] mb-4">{t("title_success")}</h2>
          <p className="text-[var(--tt-text-muted)] text-custom-sm leading-relaxed mb-8">{message}</p>
          <Link
            href="/login"
            className="w-full inline-block text-center font-bold text-white bg-red hover:bg-red-dark py-3 px-6 rounded-xl ease-out duration-200 shadow-lg shadow-red/25"
          >
            {t("login_btn")}
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red/10 text-red mb-6">
            <IconAlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-bold text-2xl text-[var(--tt-text-main)] mb-4">{t("title_error")}</h2>
          <p className="text-[var(--tt-text-muted)] text-custom-sm leading-relaxed mb-8">{message}</p>
          <Link
            href="/login"
            className="w-full inline-block text-center font-bold text-[var(--tt-text-main)] bg-[var(--tt-bg-subtle)] hover:bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] py-3 px-6 rounded-xl ease-out duration-200 shadow-sm"
          >
            {t("back_login_btn")}
          </Link>
        </div>
      )}
    </div>
  );
};

const VerifyEmailPage = () => {
  const t = useTranslations("verify_email");

  return (
    <>
      <Breadcrumb title={t("breadcrumb_title")} pages={[t("breadcrumb_page")]} />
      <section className="overflow-hidden py-20 bg-[var(--tt-bg-canvas)] transition-colors duration-200">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <Suspense
            fallback={
              <div className="max-w-[570px] w-full mx-auto rounded-2xl bg-[var(--tt-bg-surface)] border border-[var(--tt-border-medium)] shadow-xl p-8 sm:p-12 text-center border-t-4 border-t-red flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-solid border-red border-t-transparent mb-6"></div>
                <Loader text="Cargando..." className="min-h-[40vh] bg-transparent py-10" />
              </div>
            }
          >
            <VerifyEmailContent />
          </Suspense>
        </div>
      </section>
    </>
  );
};

export default VerifyEmailPage;
