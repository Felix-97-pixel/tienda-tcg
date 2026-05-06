"use client";
import React, { useState } from "react";
import AdminGuard from "@/components/Admin/AdminGuard";
import Sidebar from "@/components/Admin/Sidebar";
import Header from "@/components/Admin/Header";
import { ReduxProvider } from "@/redux/provider";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ReduxProvider>
      <AdminGuard>
        <div className="flex h-screen overflow-hidden bg-gray-1">
          {/* SIDEBAR */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* CONTENT AREA */}
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            {/* HEADER */}
            <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            {/* MAIN CONTENT */}
            <main>
              <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                {children}
              </div>
            </main>
          </div>
        </div>
      </AdminGuard>
    </ReduxProvider>
  );
}
