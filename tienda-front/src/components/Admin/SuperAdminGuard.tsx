"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";

export default function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.authReducer);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (user?.role !== "SUPERADMIN") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!isMounted || !isAuthenticated || user?.role !== "SUPERADMIN") {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
