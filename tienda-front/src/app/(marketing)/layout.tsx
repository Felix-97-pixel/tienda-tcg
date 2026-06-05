import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import Header from "@/components/Marketing/Header";
import Footer from "@/components/Marketing/Footer";
import "../css/euclid-circular-a-font.css";
import "../css/store-style.css"; // Reusing Tailwind setup

export const metadata: Metadata = {
  title: "TapTrade | La Plataforma de E-commerce para TCG",
  description: "Crea tu tienda de cartas en minutos. Gestión de inventario sincronizado, catálogo global y múltiples opciones de envío.",
};

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning={true} data-scroll-behavior="smooth">
      <body className="bg-[#0f1115] text-white antialiased selection:bg-[#ff3366] selection:text-white">
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
