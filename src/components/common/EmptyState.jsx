import React from "react";
import { Link } from "@/lib/router-compat";

/**
 * Reusable empty state component.
 * Props: icon (LucideIcon), title, description, actionLabel, actionTo, actionFn
 */
export default function EmptyState({
  icon: Icon,
  title = "Nothing here yet",
  description,
  actionLabel,
  actionTo,
  actionFn,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-slate-400 dark:text-slate-500" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">{description}</p>
      )}
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && actionFn && !actionTo && (
        <button
          onClick={actionFn}
          className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}