import React from "react";

type ShippingCarrier = "chilexpress" | "starken" | "retiro_tienda" | "retiro" | "default";
type BadgeSize = "sm" | "md" | "lg";

export interface ShippingBadgeProps {
  name: string;
  size?: BadgeSize;
  className?: string;
}

interface SizeStyles {
  wrapper: string;
  text: string;
  stripe: string;
}

const sizeStyles: Record<BadgeSize, SizeStyles> = {
  sm: {
    wrapper: "w-20 h-8 rounded px-2.5",
    text: "text-[9px]",
    stripe: "w-1.5",
  },
  md: {
    wrapper: "w-28 h-10 rounded-lg px-3.5",
    text: "text-xs",
    stripe: "w-2",
  },
  lg: {
    wrapper: "w-32 h-12 rounded-lg px-4",
    text: "text-sm",
    stripe: "w-2.5",
  },
};

const carrierStyles: Record<string, { wrapper: string; renderContent: (size: SizeStyles) => React.ReactNode }> = {
  chilexpress: {
    wrapper: "bg-[#FFF100] border border-[#002C6C]/15",
    renderContent: (size) => (
      <span className={`font-black italic text-[#002C6C] tracking-tight leading-none ${size.text}`}>
        chilexpress
      </span>
    ),
  },
  starken: {
    wrapper: "bg-[#009639] border border-[#007A2E]/15 shadow-sm",
    renderContent: (size) => (
      <span className={`font-black italic text-white tracking-tight leading-none ${size.text}`}>
        starken
      </span>
    ),
  },
  retiro_tienda: {
    wrapper: "bg-emerald-600/90 border border-emerald-400/30 shadow-sm",
    renderContent: (size) => (
      <span className={`font-black uppercase tracking-tight text-white leading-none ${size.text}`}>
        Retiro $0
      </span>
    ),
  },
  retiro: {
    wrapper: "bg-emerald-600/90 border border-emerald-400/30 shadow-sm",
    renderContent: (size) => (
      <span className={`font-black uppercase tracking-tight text-white leading-none ${size.text}`}>
        Retiro $0
      </span>
    ),
  },
  default: {
    wrapper: "bg-[#111318] border border-stroke",
    renderContent: (size) => (
      <span className={`font-black uppercase tracking-widest text-gray-4 leading-none ${size.text}`}>
        despacho
      </span>
    ),
  },
};

export function ShippingBadge({ name, size = "sm", className = "" }: ShippingBadgeProps) {
  const normalizedName = (name || "").toLowerCase().replace(/[\s-]/g, "_");
  const carrierKey = carrierStyles[normalizedName] ? normalizedName : normalizedName.includes("retiro") ? "retiro_tienda" : "default";

  const carrier = carrierStyles[carrierKey];
  const sizeStyle = sizeStyles[size] || sizeStyles.sm;

  const baseStyles = "flex items-center justify-center shadow-sm relative overflow-hidden flex-shrink-0 select-none animate-fade-in";

  return (
    <div className={`${baseStyles} ${carrier.wrapper} ${sizeStyle.wrapper} ${className}`}>
      {carrier.renderContent(sizeStyle)}
    </div>
  );
}

export default ShippingBadge;
