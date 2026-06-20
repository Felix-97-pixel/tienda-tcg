"use client";
import { useState, useEffect } from "react";
import { API_URL } from "@/utils/api";
import { useTcgSync } from "@/app/superadmin/_components/Sync/hooks/useTcgSync";

export function usePokemonSync() {
  const [destination, setDestination] = useState("Singles Pokemon");

  useEffect(() => {
    fetch(`${API_URL}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data.pokemon_sync_destination) {
          setDestination(data.pokemon_sync_destination);
        }
      })
      .catch(() => { });
  }, []);

  const sync = useTcgSync("pokemon", destination);

  return {
    destination,
    ...sync
  };
}
