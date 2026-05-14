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
  
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  const isCompleted = !active && pct === 100;
  
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
        <span>{current} / {total} ({pct}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
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
