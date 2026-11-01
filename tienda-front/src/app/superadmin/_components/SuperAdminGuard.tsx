"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/store";
import { useDispatch } from "react-redux";
import { adminLogout } from "@/redux/features/admin-auth-slice";
import { API_URL } from "@/utils/api";

export default function SuperAdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.adminAuthReducer);

  const [isMounted, setIsMounted] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    if (!isAuthenticated || user?.role !== "SUPERADMIN") {
      router.push("/admin/login");
      return;
    }

    // Validar token activo con el backend
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    const headers: Record<string, string> = { "x-auth-scope": "admin" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    fetch(`${API_URL}/stores/companies`, {
      credentials: "include",
      headers,
    })
      .then((res) => {
        if (res.status === 401) {
          dispatch(adminLogout());
          router.push("/admin/login");
        }
      })
      .catch(() => {
        // Red o timeout, permitir continuar
      })
      .finally(() => {
        setIsValidating(false);
      });
  }, [isAuthenticated, user, router, dispatch]);

  if (!isMounted || !isAuthenticated || user?.role !== "SUPERADMIN" || isValidating) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#07090E]">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-red border-t-transparent shadow-lg shadow-red/20"></div>
      </div>
    );
  }

  return <>{children}</>;
}
