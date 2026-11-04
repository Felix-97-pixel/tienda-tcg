"use client";
import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "@/utils/api";
import { AdminStatistics } from "../types/statistics.types";
import { useActiveBranch } from "@/hooks/useActiveBranch";

export function useAdminStatistics(features: string[] | undefined) {
  const { activeBranchId } = useActiveBranch();
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await adminFetch("/payments/stats");
      if (res.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_user");
          localStorage.removeItem("admin_features");
          window.location.href = "/admin/login";
        }
        return;
      }
      if (!res.ok) {
        const errText = await res.text();
        console.error("[useAdminStatistics] error body:", res.status, errText);
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
      setStats(await res.json());
    } catch (err) {
      console.error("Error fetching admin statistics:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats, activeBranchId]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
