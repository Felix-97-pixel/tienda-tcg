"use client";
import React from "react";
import { SyncProgress } from "@/types/tcg";
import { useTranslations } from "next-intl";

interface ProgressDisplayProps {
  progress: SyncProgress;
  label?: string;
}

export default function ProgressDisplay({ progress, label }: ProgressDisplayProps) {
  const tc = useTranslations("common");
  const displayLabel = label || tc("updating");
  const { current, total, active } = progress;
  
  if (!active && current === 0) return null;
  
  // Forzar 100% si el proceso ya no está activo pero tiene progreso
  const isFinished = !active && current > 0;
  const pct = isFinished ? 100 : (total > 0 ? Math.round((current / total) * 100) : 0);
  const displayCurrent = isFinished ? total : current;
  const isCompleted = isFinished;
  
  return (
    <div className={`mt-4 p-3 rounded-xl border transition-all duration-500 ${
      isCompleted 
        ? "bg-green-50 border-green-200" 
        : "bg-blue/5 border-blue/10"
    }`}>
      <div className={`flex justify-between text-xs font-bold mb-1 ${
        isCompleted ? "text-green-600" : "text-blue"
      }`}>
        <span>{isCompleted ? "✓ " + tc("completed") : active ? displayLabel : tc("completed")}</span>
        <span>{displayCurrent} / {total} ({pct}%)</span>
      </div>
      <div className="w-full bg-[#222630]00 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ease-out rounded-full ${
            isCompleted ? "bg-green-500" : "bg-blue"
          }`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    </div>
  );
}
