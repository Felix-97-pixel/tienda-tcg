"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { updateAdminFeatures } from "@/redux/features/admin-auth-slice";
import { API_URL } from "@/utils/api";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, features } = useAppSelector((state) => state.adminAuthReducer);
  const dispatch = useDispatch();

  const [isMounted, setIsMounted] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      router.push("/admin/login");
    } else if (user?.role === "SUPERADMIN") {
      router.push("/superadmin");
    } else if (user?.role !== "ADMIN") {
      router.push("/admin/login");
    } else {
      // Fetch features for ADMIN always to avoid stale features
      if (features.length === 0) {
        setLoadingFeatures(true);
      }
      fetch(`${API_URL}/stores/me`, { 
        credentials: "include",
        headers: { "x-auth-scope": "admin" }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.activeFeatures) {
            dispatch(updateAdminFeatures(data.activeFeatures));
          }
        })
        .catch(console.error)
        .finally(() => setLoadingFeatures(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, router, dispatch]);

  // Wait until mounted to prevent hydration errors, and show spinner if not admin
  if (!isMounted || !isAuthenticated || user?.role !== "ADMIN" || loadingFeatures) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#07090E]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-red border-t-transparent shadow-lg shadow-red/20"></div>
      </div>
    );
  }

  return <>{children}</>;
}
