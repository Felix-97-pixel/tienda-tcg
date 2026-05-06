import { Metadata } from "next";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ScrollToTop from "@/components/Common/ScrollToTop";
import ClientProviders from "./ClientProviders";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";

export const metadata: Metadata = {
  title: "TapTrade | Compra y Venta de Cartas TCG",
  description: "Tu tienda especializada en cartas Magic, Pokémon, Yu-Gi-Oh y más.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning={true} data-scroll-behavior="smooth">
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders>
            <Header />
            {children}
          </ClientProviders>
          <ScrollToTop />
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
