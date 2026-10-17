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
  blue_express: {
    wrapper: "bg-[#00529B] border border-[#00386C]/15 shadow-sm",
    renderContent: (size) => (
      <span className={`font-black italic text-white tracking-tight leading-none ${size.text}`}>
        blue express
      </span>
    ),
  },
  blueexpress: {
    wrapper: "bg-[#00529B] border border-[#00386C]/15 shadow-sm",
    renderContent: (size) => (
      <span className={`font-black italic text-white tracking-tight leading-none ${size.text}`}>
        blue express
      </span>
    ),
  },
  correos_chile: {
    wrapper: "bg-[#D9261C] border border-[#B31D14]/15 shadow-sm",
    renderContent: (size) => (
      <span className={`font-black italic text-white tracking-tight leading-none ${size.text}`}>
        correos chile
      </span>
    ),
  },
  correos: {
    wrapper: "bg-[#D9261C] border border-[#B31D14]/15 shadow-sm",
    renderContent: (size) => (
      <span className={`font-black italic text-white tracking-tight leading-none ${size.text}`}>
        correos chile
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
    wrapper: "bg-[#111318] border border-white/10 shadow-sm",
    renderContent: (size) => (
      <span className={`font-black uppercase tracking-wider text-gray-300 leading-none truncate max-w-full px-1 ${size.text}`}>
        despacho
      </span>
    ),
  },
};

export function ShippingBadge({ name, size = "sm", className = "" }: ShippingBadgeProps) {
  const normalizedName = (name || "").toLowerCase().replace(/[\s-]/g, "_");
  const carrierKey = carrierStyles[normalizedName]
    ? normalizedName
    : normalizedName.includes("retiro")
    ? "retiro_tienda"
    : normalizedName.includes("chilexpress")
    ? "chilexpress"
    : normalizedName.includes("starken")
    ? "starken"
    : normalizedName.includes("blue")
    ? "blue_express"
    : normalizedName.includes("correo")
    ? "correos_chile"
    : "default";

  const carrier = carrierStyles[carrierKey];
  const sizeStyle = sizeStyles[size] || sizeStyles.sm;

  const baseStyles = "flex items-center justify-center shadow-sm relative overflow-hidden flex-shrink-0 select-none animate-fade-in";

  return (
    <div className={`${baseStyles} ${carrier.wrapper} ${sizeStyle.wrapper} ${className}`}>
      {carrierKey === "default" && name ? (
        <span className={`font-black uppercase tracking-wider text-gray-300 leading-none truncate max-w-full px-1 ${sizeStyle.text}`}>
          {name.replace(/_/g, " ")}
        </span>
      ) : (
        carrier.renderContent(sizeStyle)
      )}
    </div>
  );
}

export default ShippingBadge;
