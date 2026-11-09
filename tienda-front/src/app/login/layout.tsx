import { Metadata } from "next";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale, getTranslations } from "next-intl/server";
import { ReduxProvider } from "@/redux/provider";
import ToastContainer from "@/components/layout/ToastContainer";
import { ThemeProvider } from "../context/ThemeContext";
import "../css/euclid-circular-a-font.css";
import "../css/store-style.css";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("login");
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icon.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon.ico" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-icon.png",
    },
  };
}

export default async function LoginLayout({
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
    <html lang={locale} className={themeClass} suppressHydrationWarning={true}>
      <body className="bg-[var(--tt-bg-canvas)] text-[var(--tt-text-main)] antialiased min-h-screen selection:bg-red-500 selection:text-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            <ThemeProvider>
              {children}
              <ToastContainer />
            </ThemeProvider>
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
