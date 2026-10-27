import React from "react";
import ShippingBadge from "@/components/ui/ShippingBadge";

export interface StoreShippingData {
  pickupEnabled?: boolean | null;
  pickupAddress?: string | null;
  pickupSchedule?: string | null;
  shipping?: Array<{
    id?: string;
    name: string;
    price?: number | string | any;
    isActive?: boolean;
  }> | null;
  shippingMethods?: string[]; // Fallback de compatibilidad
}

interface StoreShippingBadgesProps {
  store?: StoreShippingData | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  fallbackText?: string;
}

export function StoreShippingBadges({
  store,
  size = "sm",
  className = "flex items-center gap-1.5 flex-wrap",
  fallbackText = "Consultar con tienda",
}: StoreShippingBadgesProps) {
  if (!store) return null;

  const activeBadges: string[] = [];

  // 1. Retiro en tienda física:
  // Gestionado exclusivamente por store.pickupEnabled
  if (store.pickupEnabled) {
    activeBadges.push("retiro_tienda");
  }

  // 2. Proveedores de despacho configurados (Chilexpress, Starken, Blue Express, etc.)
  if (store.shipping && Array.isArray(store.shipping)) {
    store.shipping.forEach((provider) => {
      const nameUpper = provider.name?.toUpperCase();
      if (nameUpper !== "RETIRO_TIENDA" && provider.isActive) {
        activeBadges.push(provider.name.toLowerCase());
      }
    });
  } else if (store.shippingMethods && Array.isArray(store.shippingMethods)) {
    store.shippingMethods.forEach((method) => {
      const normalized = method.toLowerCase();
      if (normalized !== "retiro_tienda" && normalized !== "retiro") {
        activeBadges.push(normalized);
      }
    });
  }

  if (activeBadges.length === 0) {
    return (
      <span className="text-[11px] text-gray-500 italic font-mono">
        {fallbackText}
      </span>
    );
  }

  return (
    <div className={className}>
      {activeBadges.map((badgeName, idx) => (
        <ShippingBadge key={`${badgeName}-${idx}`} name={badgeName} size={size} />
      ))}
    </div>
  );
}

export default StoreShippingBadges;
