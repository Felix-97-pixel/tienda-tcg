"use client";
import React from "react";

interface LegalSectionProps {
  id: string;
  title?: string;
  num?: number;
  badgeColor?: string;
  titleColor?: string;
  className?: string;
  children: React.ReactNode;
}

const LegalSection: React.FC<LegalSectionProps> = ({
  id,
  title,
  num,
  badgeColor = "bg-[#E10E0E]",
  titleColor = "text-white",
  className = "",
  children
}) => {
  return (
    <section id={id} className={`scroll-mt-[130px] ${className}`}>
      {title && (
        <h3 className={`text-xl sm:text-2xl font-black ${titleColor} mb-4 flex items-center gap-2.5 tracking-tight`}>
          {num !== undefined && (
            <span className={`${badgeColor} text-white rounded-lg w-7 h-7 flex items-center justify-center text-xs font-mono font-black shadow-md shadow-[#E10E0E]/20 shrink-0`}>
              {num}
            </span>
          )}
          {title}
        </h3>
      )}
      <div className="text-sm sm:text-[15px] text-gray-300 leading-relaxed">
        {children}
      </div>
    </section>
  );
};

export default LegalSection;
