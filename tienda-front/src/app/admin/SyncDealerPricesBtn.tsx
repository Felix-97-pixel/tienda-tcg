"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface SyncDealerPricesBtnProps {
  className?: string;
}

export default function SyncDealerPricesBtn({ className }: SyncDealerPricesBtnProps) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push("/admin/price-sync")}
      className={`w-full 2xl:w-auto bg-gradient-to-r from-red-dark to-red text-white shadow-lg shadow-red/25 hover:shadow-red/40 border border-red/30 !px-4 !py-2.5 !rounded-xl text-xs font-bold text-center justify-center whitespace-nowrap ${className || ""}`}
    >
      Sincronizar Mis Precios
    </Button>
  );
}
