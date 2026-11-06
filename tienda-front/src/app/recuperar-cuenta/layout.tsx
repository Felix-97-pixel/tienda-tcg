import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale, getTranslations } from "next-intl/server";
import { ReduxProvider } from "@/redux/provider";
import ToastContainer from "@/components/layout/ToastContainer";
import "../css/euclid-circular-a-font.css";
import "../css/store-style.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("recovery");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function RecuperarCuentaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body className="bg-[#07090E] text-white antialiased min-h-screen selection:bg-red selection:text-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            {children}
            <ToastContainer />
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
