"use client";
import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
}

export default function StatCard({ label, value, sub, color, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-1 p-6 flex items-start gap-5 hover:shadow-md transition-shadow duration-300 border border-transparent hover:border-stroke">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/5 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-dark-4 text-xs font-black uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-black text-dark tracking-tight">{value}</p>
          {trend && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-lg ${trend.positive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              {trend.positive ? "▲" : "▼"} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        {sub && <p className="text-[10px] text-dark-4 mt-1 font-bold truncate uppercase">{sub}</p>}
      </div>
    </div>
  );
}
