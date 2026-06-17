import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import * as LucideIcons from "lucide-react";

const getIcon = (name) => LucideIcons[name] || LucideIcons.Info;

const COLOR_MAP = {
  red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  pink: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
};

function getColorClasses(color) {
  return COLOR_MAP[color] || COLOR_MAP.blue;
}

export default function QuickHelpRow({ lang = "en", onCategoryClick }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["awarenessCategories"],
    queryFn: () => base44.entities.AwarenessCategory.filter({ is_active: true }, "sort_order"),
  });

  if (isLoading) {
    return (
      <div className="flex gap-3 overflow-x-auto py-6 scrollbar-hide">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex-shrink-0 h-12 w-36 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => {
          const Icon = getIcon(cat.icon);
          const colorCls = getColorClasses(cat.color);
          const label = lang === "ta" ? cat.name_ta || cat.name_en : cat.name_en;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryClick?.(cat.slug)}
              className="flex-shrink-0 flex items-center gap-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2.5 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorCls}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
