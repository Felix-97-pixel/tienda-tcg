"use client";
import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/utils/api";
import { AdminStatistics } from "../types/statistics.types";

export function useAdminStatistics(features: string[] | undefined) {
  const [stats, setStats] = useState<AdminStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/payments/stats`, { credentials: "include" });
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch (err) {
      console.error("Error fetching admin statistics:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (features && features.includes("addon:reports")) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [fetchStats, features]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}
