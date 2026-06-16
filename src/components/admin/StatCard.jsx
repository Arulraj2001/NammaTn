import React from "react";
import { cn } from "@/lib/utils";

export default function StatCard({ label, value, icon: IconComponent, color = "blue", loading }) {
  const Icon = IconComponent;
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        {Icon && (
          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", colors[color])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-slate-200 animate-pulse rounded" />
      ) : (
        <div className="text-2xl font-bold text-slate-900">{value ?? 0}</div>
      )}
    </div>
  );
}