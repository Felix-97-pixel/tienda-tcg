import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import SuperAdminLayoutClient from "./SuperAdminLayoutClient";

import "../css/euclid-circular-a-font.css";
import "../css/admin-style.css";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning={true} data-scroll-behavior="smooth">
      <body suppressHydrationWarning={true}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SuperAdminLayoutClient>
            {children}
          </SuperAdminLayoutClient>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
