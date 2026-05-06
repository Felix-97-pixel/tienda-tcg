import React from "react";
import { NextIntlClientProvider } from "next-intl";
import adminMessages from "../../../messages/admin.json";
import AdminLayoutClient from "@/components/Admin/AdminLayoutClient";

import "../css/euclid-circular-a-font.css";
import "../css/style.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning={true} data-scroll-behavior="smooth">
      <body>
        <NextIntlClientProvider locale="es-CL" messages={adminMessages}>
          <AdminLayoutClient>
            {children}
          </AdminLayoutClient>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
