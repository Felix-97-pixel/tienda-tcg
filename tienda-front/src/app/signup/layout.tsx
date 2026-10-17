import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { ReduxProvider } from "@/redux/provider";
import ToastContainer from "@/components/layout/ToastContainer";
import "../css/euclid-circular-a-font.css";
import "../css/store-style.css";

export const metadata: Metadata = {
  title: "Crear Cuenta | TapTrade TCG Marketplace",
  description: "Crea tu cuenta gratis en TapTrade. Compra y vende cartas coleccionables, sincroniza tu inventario y únete a la comunidad de TCG más grande de Chile.",
};

export default async function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning={true}>
      <body className="bg-[#07090E] text-white antialiased min-h-screen selection:bg-red-500 selection:text-white">
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
