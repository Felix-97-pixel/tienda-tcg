"use client";
import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/redux/store";
import { BranchItem, setActiveStore } from "@/redux/features/admin-auth-slice";
import { useDispatch } from "react-redux";
import { getAdminActiveBranchId } from "@/utils/api";

export function useActiveBranch() {
  const dispatch = useDispatch();
  const { user } = useAppSelector((state) => state.adminAuthReducer);

  const [activeBranchId, setActiveBranchId] = useState<string | null>(() => {
    return user?.activeStore?.id || getAdminActiveBranchId();
  });

  const [activeBranch, setActiveBranch] = useState<BranchItem | null>(() => {
    return user?.activeStore || null;
  });

  // Sincronizar cuando el usuario en Redux cambia
  useEffect(() => {
    if (user?.activeStore) {
      setActiveBranchId(user.activeStore.id);
      setActiveBranch(user.activeStore);
      if (typeof window !== "undefined") {
        localStorage.setItem("taptrade_active_branch_id", user.activeStore.id);
        localStorage.setItem("admin_active_store_id", user.activeStore.id);
      }
    }
  }, [user?.activeStore]);

  // Escuchar el evento personalizado emitido por BranchSelector
  useEffect(() => {
    const handleBranchChange = (event: Event) => {
      const customEvent = event as CustomEvent<BranchItem>;
      if (customEvent.detail) {
        setActiveBranchId(customEvent.detail.id);
        setActiveBranch(customEvent.detail);
      }
    };

    window.addEventListener("branchChanged", handleBranchChange);
    return () => window.removeEventListener("branchChanged", handleBranchChange);
  }, []);

  const changeBranch = useCallback(
    (branch: BranchItem) => {
      setActiveBranchId(branch.id);
      setActiveBranch(branch);
      if (typeof window !== "undefined") {
        localStorage.setItem("taptrade_active_branch_id", branch.id);
        localStorage.setItem("admin_active_store_id", branch.id);
      }
      dispatch(setActiveStore(branch));
      window.dispatchEvent(new CustomEvent("branchChanged", { detail: branch }));
    },
    [dispatch]
  );

  return {
    activeBranch,
    activeBranchId,
    branchName: activeBranch?.name || "Sucursal Activa",
    isMainBranch: !!activeBranch?.isMainBranch,
    changeBranch,
  };
}
