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
  badgeColor = "bg-red",
  titleColor = "text-red",
  className = "",
  children
}) => {
  return (
    <section id={id} className={`scroll-mt-[160px] ${className}`}>
      {title && (
        <h3 className={`text-lg font-bold ${titleColor} mb-4 flex items-center gap-2`}>
          {num !== undefined && (
            <span className={`${badgeColor} text-white rounded w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0`}>
              {num}
            </span>
          )}
          {title}
        </h3>
      )}
      <div className="text-custom-sm text-gray-6 leading-relaxed">
        {children}
      </div>
    </section>
  );
};

export default LegalSection;
