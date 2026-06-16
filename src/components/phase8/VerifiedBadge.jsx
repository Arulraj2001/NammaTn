import React from "react";
import { ShieldCheck } from "lucide-react";

export default function VerifiedBadge({ size = "sm" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-medium ${size === "sm" ? "text-xs" : "text-sm"}`}>
      <ShieldCheck className="w-3 h-3" />
      Verified Update
    </span>
  );
}