"use client";
import { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTcgSync } from "@/app/superadmin/_components/Sync/hooks/useTcgSync";

export function useOnePieceSync() {
  const [destination, setDestination] = useState("Singles One Piece");

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.onepiece_sync_destination) {
          setDestination(data.onepiece_sync_destination);
        }
      })
      .catch(() => {});
  }, []);

  const sync = useTcgSync("onepiece", destination);

  return {
    destination,
    ...sync,
  };
}

