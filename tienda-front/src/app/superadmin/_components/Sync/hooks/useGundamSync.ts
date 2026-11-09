"use client";
import { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTcgSync } from "@/app/superadmin/_components/Sync/hooks/useTcgSync";

export function useGundamSync() {
  const [destination, setDestination] = useState("Singles Gundam");

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.gundam_sync_destination) {
          setDestination(data.gundam_sync_destination);
        }
      })
      .catch(() => {});
  }, []);

  const sync = useTcgSync("gundam", destination);

  return {
    destination,
    ...sync,
  };
}

