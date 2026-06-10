"use client";
import React, { useState } from "react";
import { API_URL } from "@/utils/api";
import { useToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";

export default function SyncDealerPricesBtn() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSync = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/sync/dealer-prices`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Sincronización exitosa. ${data.updatedCount} precios actualizados.`, "success");
      } else {
        showToast(data.message || "Error al sincronizar precios", "error");
      }
    } catch (err) {
      showToast("Error de red al sincronizar", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSync}
      isLoading={loading}
      className="bg-purple-600 hover:bg-purple-500 text-white font-bold"
    >
      Sincronizar Mis Precios
    </Button>
  );
}
