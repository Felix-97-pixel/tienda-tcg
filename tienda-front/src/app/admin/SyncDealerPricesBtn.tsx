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
      className="bg-gradient-to-r from-red-dark to-red text-white shadow-lg shadow-red/25 hover:shadow-red/40 border border-red/30 !px-5 !py-2.5 !rounded-xl text-xs font-bold"
    >
      Sincronizar Mis Precios
    </Button>
  );
}
