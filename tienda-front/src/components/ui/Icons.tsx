import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export const IconSparkles: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

export const IconCard: React.FC<IconProps> = ({ className = "w-5 h-5", size, ...props }) => (
  <svg
    width={size || 20}
    height={size || 20}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <path d="M8 6h.01" />
    <path d="M16 18h.01" />
    <path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />
  </svg>
);

export const IconTruck: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14v10Z" />
    <circle cx="17" cy="18" r="2" />
    <circle cx="7" cy="18" r="2" />
  </svg>
);

export const IconStore: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <path d="M22 7a2 2 0 0 1-2 2c-.68 0-1.28-.33-1.66-.84A2 2 0 0 1 16 9c-.68 0-1.28-.33-1.66-.84A2 2 0 0 1 12 9c-.68 0-1.28-.33-1.66-.84A2 2 0 0 1 8 9c-.68 0-1.28-.33-1.66-.84A2 2 0 0 1 4 9a2 2 0 0 1-2-2" />
  </svg>
);

export const IconTag: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);

export const IconBox: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

export const IconMapPin: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const IconCreditCard: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

export const IconShieldCheck: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const IconLock: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export const IconCart: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

export const IconAlertTriangle: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);

export const IconSearch: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" x2="16.65" y1="21" y2="16.65" />
  </svg>
);

export const IconFilter: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export const IconCheck: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const IconX: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

export const IconZap: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

export const IconFlame: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

export const IconGem: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M6 3h12l4 6-10 13L2 9Z" />
    <path d="M11 3 8 9l4 13 4-13-3-6" />
    <path d="M2 9h20" />
  </svg>
);

export const IconTrophy: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
);

export const IconFlagES: React.FC<{ className?: string }> = ({ className = "w-4 h-3" }) => (
  <svg viewBox="0 0 640 480" className={`${className} rounded-sm overflow-hidden shrink-0 shadow-sm inline-block align-middle`}>
    <path fill="#c60b1e" d="M0 0h640v480H0z" />
    <path fill="#ffc400" d="M0 120h640v240H0z" />
  </svg>
);

export const IconFlagUS: React.FC<{ className?: string }> = ({ className = "w-4 h-3" }) => (
  <svg viewBox="0 0 640 480" className={`${className} rounded-sm overflow-hidden shrink-0 shadow-sm inline-block align-middle`}>
    <path fill="#bd3d44" d="M0 0h640v480H0z" />
    <path stroke="#fff" strokeWidth="37" d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640" />
    <path fill="#192f5d" d="M0 0h260v260H0z" />
  </svg>
);

export const IconFlagJP: React.FC<{ className?: string }> = ({ className = "w-4 h-3" }) => (
  <svg viewBox="0 0 640 480" className={`${className} rounded-sm overflow-hidden shrink-0 border border-white/20 shadow-sm inline-block align-middle`}>
    <path fill="#ffffff" d="M0 0h640v480H0z" />
    <circle cx="320" cy="240" r="144" fill="#bc002d" />
  </svg>
);

export const IconFlagDE: React.FC<{ className?: string }> = ({ className = "w-4 h-3" }) => (
  <svg viewBox="0 0 640 480" className={`${className} rounded-sm overflow-hidden shrink-0 shadow-sm inline-block align-middle`}>
    <path fill="#000" d="M0 0h640v160H0z" />
    <path fill="#dd0000" d="M0 160h640v160H0z" />
    <path fill="#ffce00" d="M0 320h640v160H0z" />
  </svg>
);

export const IconFlagFR: React.FC<{ className?: string }> = ({ className = "w-4 h-3" }) => (
  <svg viewBox="0 0 640 480" className={`${className} rounded-sm overflow-hidden shrink-0 shadow-sm inline-block align-middle`}>
    <path fill="#002654" d="M0 0h213.3v480H0z" />
    <path fill="#ffffff" d="M213.3 0h213.4v480H213.3z" />
    <path fill="#ce1126" d="M426.7 0h213.3v480H426.7z" />
  </svg>
);

export const IconFlagIT: React.FC<{ className?: string }> = ({ className = "w-4 h-3" }) => (
  <svg viewBox="0 0 640 480" className={`${className} rounded-sm overflow-hidden shrink-0 shadow-sm inline-block align-middle`}>
    <path fill="#009246" d="M0 0h213.3v480H0z" />
    <path fill="#ffffff" d="M213.3 0h213.4v480H213.3z" />
    <path fill="#ce2b37" d="M426.7 0h213.3v480H426.7z" />
  </svg>
);

export const IconFlagPT: React.FC<{ className?: string }> = ({ className = "w-4 h-3" }) => (
  <svg viewBox="0 0 640 480" className={`${className} rounded-sm overflow-hidden shrink-0 shadow-sm inline-block align-middle`}>
    <path fill="#006600" d="M0 0h256v480H0z" />
    <path fill="#ff0000" d="M256 0h384v480H256z" />
    <circle cx="256" cy="240" r="80" fill="#ffff00" stroke="#000" strokeWidth="6" />
  </svg>
);

export const IconFlagCN: React.FC<{ className?: string }> = ({ className = "w-4 h-3" }) => (
  <svg viewBox="0 0 640 480" className={`${className} rounded-sm overflow-hidden shrink-0 shadow-sm inline-block align-middle`}>
    <path fill="#de2910" d="M0 0h640v480H0z" />
    <polygon points="128,48 152,120 90,75 166,75 104,120" fill="#ffde00" />
    <polygon points="213,24 220,48 200,33 226,33 206,48" fill="#ffde00" />
    <polygon points="256,72 263,96 243,81 269,81 249,96" fill="#ffde00" />
    <polygon points="256,144 263,168 243,153 269,153 249,168" fill="#ffde00" />
    <polygon points="213,192 220,216 200,201 226,201 206,216" fill="#ffde00" />
  </svg>
);

export const IconGlobe: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const IconLanguageFlag: React.FC<{ code?: string; name?: string; className?: string }> = ({
  code,
  name,
  className = "w-4 h-3",
}) => {
  const c = (code || "").toLowerCase();
  const n = (name || "").toLowerCase();

  if (c === "es" || c === "spa" || n.includes("span") || n.includes("españ")) {
    return <IconFlagES className={className} />;
  }
  if (c === "en" || c === "eng" || c === "us" || n.includes("engl") || n.includes("ingl")) {
    return <IconFlagUS className={className} />;
  }
  if (c === "ja" || c === "jp" || c === "jpn" || n.includes("japan") || n.includes("japon")) {
    return <IconFlagJP className={className} />;
  }
  if (c === "de" || c === "ger" || n.includes("german") || n.includes("alem")) {
    return <IconFlagDE className={className} />;
  }
  if (c === "fr" || c === "fra" || n.includes("french") || n.includes("franc")) {
    return <IconFlagFR className={className} />;
  }
  if (c === "it" || c === "ita" || n.includes("italian") || n.includes("ital")) {
    return <IconFlagIT className={className} />;
  }
  if (c === "pt" || c === "por" || n.includes("portug")) {
    return <IconFlagPT className={className} />;
  }
  if (c === "zh_cn" || c === "zh" || c === "chi" || n.includes("chin")) {
    return <IconFlagCN className={className} />;
  }
  return <IconGlobe className={`${className} text-gray-400`} />;
};

export const IconHeart: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

export const IconTrash: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

export const IconCheckCircle: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const IconClock: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const IconEye: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const IconInfo: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

export const IconExternalLink: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
);

export const IconRefresh: React.FC<IconProps> = ({ className = "w-4 h-4", size, ...props }) => (
  <svg
    width={size || 16}
    height={size || 16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

