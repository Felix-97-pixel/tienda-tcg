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
      <div className="flex h-screen items-center justify-center bg-[#07090E]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-red border-t-transparent shadow-lg shadow-red/20"></div>
      </div>
    );
  }

  return <>{children}</>;
}
