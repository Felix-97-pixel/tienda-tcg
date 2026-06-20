import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import AdminLayoutClient from "@/app/admin/_components/AdminLayoutClient";

import "../css/euclid-circular-a-font.css";
import "../css/admin-style.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages(); // ya incluye admin.json + es-CL.json (mergeado en request.ts)

  return (
    <html lang={locale} suppressHydrationWarning={true} data-scroll-behavior="smooth">
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AdminLayoutClient>
            {children}
          </AdminLayoutClient>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
