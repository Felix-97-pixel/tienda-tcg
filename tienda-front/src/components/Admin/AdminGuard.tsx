"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.authReducer);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (user?.role === "SUPERADMIN") {
      router.push("/superadmin");
    } else if (user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  // Wait until mounted to prevent hydration errors, and show spinner if not admin
  if (!isMounted || !isAuthenticated || user?.role !== "ADMIN") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#1a1d24]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
