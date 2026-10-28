"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import AdminGuard from "@/app/admin/_components/AdminGuard";
import Sidebar from "@/app/admin/_components/Sidebar";
import Header from "@/app/admin/_components/Header";
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
          <div className="relative flex h-screen overflow-hidden bg-[#07090E] text-white">
            {/* Ambient lighting & subtle grid */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
            <div className="fixed top-[-10%] left-[20%] w-[600px] h-[350px] bg-red/10 blur-[150px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[10%] w-[500px] h-[300px] bg-red-dark/8 blur-[160px] pointer-events-none" />

            {/* SIDEBAR */}
            {!isHub && <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

            {/* CONTENT AREA */}
            <div className="relative z-10 flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-w-0">
              {/* HEADER */}
              {!isHub && <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />}

              {/* MAIN CONTENT */}
              <main className="flex-1 w-full min-w-0">
                <div className="mx-auto max-w-screen-2xl p-3 sm:p-5 md:p-6 2xl:p-10 w-full min-w-0">
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
