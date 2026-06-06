"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/Admin/AdminGuard";
import Sidebar from "@/components/Admin/Sidebar";
import Header from "@/components/Admin/Header";
import { ReduxProvider } from "@/redux/provider";
import ToastContainer from "@/components/layout/ToastContainer";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isHub = pathname === "/admin";
  const isAuthPage = pathname === "/admin/login";

  return (
    <ReduxProvider>
      {isAuthPage ? (
        <>
          {children}
          <ToastContainer />
        </>
      ) : (
        <AdminGuard>
          <div className={`flex h-screen overflow-hidden ${isHub ? "bg-[#0f1115]" : "bg-[#111318]"}`}>
            {/* SIDEBAR */}
            {!isHub && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

            {/* CONTENT AREA */}
            <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
              {/* HEADER */}
              {!isHub && <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

              {/* MAIN CONTENT */}
              <main>
                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <ToastContainer />
        </AdminGuard>
      )}
    </ReduxProvider>
  );
}
