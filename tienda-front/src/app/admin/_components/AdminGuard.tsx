"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { updateAdminFeatures, adminLogout, setActiveStore } from "@/redux/features/admin-auth-slice";
import { adminFetch } from "@/utils/api";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, features } = useAppSelector((state) => state.adminAuthReducer);
  const dispatch = useDispatch();

  const [isMounted, setIsMounted] = useState(false);
  const [loadingFeatures, setLoadingFeatures] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    } 
    
    if (user?.role === "SUPERADMIN" || user?.sessionType === "SUPERADMIN") {
      router.push("/superadmin");
      return;
    } 
    
    if (user?.role !== "ADMIN") {
      router.push("/admin/login");
      return;
    }

    // Role-based route guard
    const sessionType = user.sessionType;

    // Cajero: únicamente operaciones y consulta de catálogo
    if (sessionType === "CASHIER") {
      const allowedCashierRoutes = [
        "/admin/pos",
        "/admin/transactions",
        "/admin/orders",
        "/admin/store-credit",
        "/admin/products",
        "/admin/sealed",
        "/admin/buylist",
      ];
      const isAllowed = allowedCashierRoutes.some((route) => pathname.startsWith(route));
      if (!isAllowed) {
        router.replace("/admin/pos");
        return;
      }
    }

    // Encargado de sucursal: no tiene acceso a billetera holding
    if (sessionType === "BRANCH_MANAGER") {
      if (pathname.startsWith("/admin/wallet")) {
        router.replace("/admin/products");
        return;
      }
    }

    // Fetch features for ADMIN always to avoid stale features
    if (features.length === 0) {
      setLoadingFeatures(true);
    }
    adminFetch("/stores/me", {}, user?.activeStore?.id)
      .then((res) => {
        if (res.status === 401) {
          dispatch(adminLogout());
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          if (data.activeFeatures) {
            dispatch(updateAdminFeatures(data.activeFeatures));
          }
          if ((!user?.activeStore || !user?.activeStore?.id) && data.id) {
            dispatch(
              setActiveStore({
                id: data.id,
                name: data.name,
                subdomain: data.subdomain,
                isMainBranch: data.isMainBranch,
                address: data.address,
              })
            );
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingFeatures(false));
  }, [isAuthenticated, user, pathname, router, dispatch]);

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
