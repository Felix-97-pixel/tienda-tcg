import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { ReduxProvider } from "@/redux/provider";
import ToastContainer from "@/components/layout/ToastContainer";
import "../css/euclid-circular-a-font.css";
import "../css/store-style.css";

export const metadata: Metadata = {
  title: "Restablecer Contraseña | TapTrade TCG Marketplace",
  description: "Crea una nueva contraseña segura para tu cuenta de TapTrade.",
};

export default async function RestablecerContrasenaLayout({
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
