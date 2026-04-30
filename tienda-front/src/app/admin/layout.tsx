"use client";
import React, { useState } from "react";
import AdminGuard from "@/components/Admin/AdminGuard";
import Sidebar from "@/components/Admin/Sidebar";
import Header from "@/components/Admin/Header";
import { ReduxProvider } from "@/redux/provider";

import "../css/euclid-circular-a-font.css";
import "../css/style.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning={true} data-scroll-behavior="smooth">
      <body>
        <ReduxProvider>
          <AdminGuard>
            <div className="flex h-screen overflow-hidden bg-gray-1">
              {/* SIDEBAR */}
              <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              {/* SIDEBAR END */}

              {/* CONTENT AREA */}
              <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                {/* HEADER */}
                <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                {/* HEADER END */}

                {/* MAIN CONTENT */}
                <main>
                  <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                    {children}
                  </div>
                </main>
                {/* MAIN CONTENT END */}
              </div>
            </div>
          </AdminGuard>
        </ReduxProvider>
      </body>
    </html>
  );
}
