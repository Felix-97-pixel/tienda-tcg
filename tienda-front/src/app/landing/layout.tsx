import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale, getTranslations } from "next-intl/server";
import Header from "@/app/landing/_components/Marketing/Header";
import Footer from "@/app/landing/_components/Marketing/Footer";
import "../css/euclid-circular-a-font.css";
import "../css/store-style.css"; // Reusing Tailwind setup

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("landing");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
  };
}

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning={true} data-scroll-behavior="smooth">
      <body className="bg-[#07090E] text-white antialiased selection:bg-[#ff3366] selection:text-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-20">
              {children}
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
