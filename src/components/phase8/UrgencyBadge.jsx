import React from "react";

const CONFIG = {
  critical: { label: "Critical", cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" },
  high:     { label: "Urgent",   cls: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  medium:   { label: "Medium",   cls: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  urgent:   { label: "Urgent",   cls: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800" },
  moderate: { label: "Moderate", cls: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800" },
  info:     { label: "Info",     cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
};

export default function UrgencyBadge({ level }) {
  const c = CONFIG[level] || CONFIG.info;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${c.cls}`}>
      {c.label}
    </span>
  );
}