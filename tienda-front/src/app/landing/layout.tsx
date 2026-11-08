import { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale, getTranslations } from "next-intl/server";
import { ThemeProvider } from "../context/ThemeContext";
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
  const cookieStore = await cookies();
  const savedTheme = cookieStore.get("theme")?.value;
  const themeClass = savedTheme === "light" ? "light" : "dark";

  return (
    <html lang={locale} className={themeClass} suppressHydrationWarning={true} data-scroll-behavior="smooth">
      <body className="bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] antialiased selection:bg-[#ff3366] selection:text-white transition-colors duration-200">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow pt-20">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
