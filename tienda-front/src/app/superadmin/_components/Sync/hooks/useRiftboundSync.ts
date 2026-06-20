"use client";
import { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTcgSync } from "@/hooks/useTcgSync";

export function useRiftboundSync() {
  const [destination, setDestination] = useState("Singles Riftbound");

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.riftbound_sync_destination) {
          setDestination(data.riftbound_sync_destination);
        }
      })
      .catch(() => { });
  }, []);

  const sync = useTcgSync("riftbound", destination);

  return {
    destination,
    ...sync
  };
}
