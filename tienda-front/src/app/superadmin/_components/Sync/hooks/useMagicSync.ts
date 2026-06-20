"use client";
import { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTcgSync } from "@/app/superadmin/_components/Sync/hooks/useTcgSync";

export function useMagicSync() {
  const [destination, setDestination] = useState("Singles Magic The Gathering");

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.mtg_sync_destination) {
          setDestination(data.mtg_sync_destination);
        }
      })
      .catch(() => { });
  }, []);

  const sync = useTcgSync("magic", destination);

  return {
    destination,
    ...sync
  };
}
