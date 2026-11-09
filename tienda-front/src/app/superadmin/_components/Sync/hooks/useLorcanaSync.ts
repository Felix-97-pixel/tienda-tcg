"use client";
import { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTcgSync } from "@/app/superadmin/_components/Sync/hooks/useTcgSync";

export function useLorcanaSync() {
  const [destination, setDestination] = useState("Singles Lorcana");

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.lorcana_sync_destination) {
          setDestination(data.lorcana_sync_destination);
        }
      })
      .catch(() => {});
  }, []);

  const sync = useTcgSync("lorcana", destination);

  return {
    destination,
    ...sync,
  };
}

