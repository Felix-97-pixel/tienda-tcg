"use client";
import React from "react";
import { SyncProgress } from "@/types/tcg";

interface ProgressDisplayProps {
  progress: SyncProgress;
  label?: string;
}

export default function ProgressDisplay({ progress, label = "Actualizando..." }: ProgressDisplayProps) {
  const { current, total, active } = progress;
  
  if (!active && current === 0) return null;
  
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="mt-4 p-3 bg-blue/5 rounded-xl border border-blue/10 animate-in slide-in-from-top-2 duration-300">
      <div className="flex justify-between text-xs font-bold text-blue mb-1">
        <span>{active ? label : "Completado"}</span>
        <span>{current} / {total} ({pct}%)</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="bg-blue h-full transition-all duration-500 ease-out" 
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    </div>
  );
}
