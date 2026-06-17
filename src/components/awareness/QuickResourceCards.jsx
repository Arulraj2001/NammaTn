import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import * as LucideIcons from "lucide-react";

const getIcon = (name) => LucideIcons[name] || LucideIcons.Info;

const HEADER_COLORS = {
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    icon: "bg-red-100 text-red-600 dark:bg-red-800/40 dark:text-red-400",
    border: "border-red-100 dark:border-red-900/30",
  },
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-800/40 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-900/30",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    icon: "bg-green-100 text-green-600 dark:bg-green-800/40 dark:text-green-400",
    border: "border-green-100 dark:border-green-900/30",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    icon: "bg-purple-100 text-purple-600 dark:bg-purple-800/40 dark:text-purple-400",
    border: "border-purple-100 dark:border-purple-900/30",
  },
  amber: {
    bg: "bg-amber-50 dark:bg-amber-900/20",
    icon: "bg-amber-100 text-amber-600 dark:bg-amber-800/40 dark:text-amber-400",
    border: "border-amber-100 dark:border-amber-900/30",
  },
  pink: {
    bg: "bg-pink-50 dark:bg-pink-900/20",
    icon: "bg-pink-100 text-pink-600 dark:bg-pink-800/40 dark:text-pink-400",
    border: "border-pink-100 dark:border-pink-900/30",
  },
};

function getHeaderColor(color) {
  return HEADER_COLORS[color] || HEADER_COLORS.blue;
}

function getButtonClasses(variant) {
  if (variant === "primary") {
    return "border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30";
  }
  return "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700";
}

export default function QuickResourceCards({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ["awarenessResources"],
    queryFn: () => base44.entities.AwarenessResource.filter({ is_active: true }, "sort_order"),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <section className="mb-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resources.slice(0, 4).map((r) => {
          const Icon = getIcon(r.icon);
          const colors = getHeaderColor(r.icon_color);
          const title = lang === "ta" ? r.title_ta || r.title_en : r.title_en;
          const desc = lang === "ta" ? r.description_ta || r.description_en : r.description_en;
          const items = lang === "ta" ? (r.items_ta || r.items_en || []) : (r.items_en || []);

          const btn1Text = lang === "ta" ? r.action_btn1_text_ta || r.action_btn1_text_en : r.action_btn1_text_en;
          const btn2Text = lang === "ta" ? r.action_btn2_text_ta || r.action_btn2_text_en : r.action_btn2_text_en;

          return (
            <div
              key={r.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Colored header */}
              <div className={`px-5 py-4 ${colors.bg} border-b ${colors.border}`}>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colors.icon}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">{title}</h3>
                </div>
                {desc && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
                )}
              </div>

              {/* Bullet list */}
              <div className="px-5 py-4 flex-1">
                <ul className="space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action buttons */}
              <div className="px-5 pb-4 flex gap-2 mt-auto">
                {btn1Text && (
                  <a
                    href={r.action_btn1_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${getButtonClasses(r.action_btn1_variant)}`}
                  >
                    {btn1Text}
                  </a>
                )}
                {btn2Text && (
                  <a
                    href={r.action_btn2_url || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${getButtonClasses(r.action_btn2_variant)}`}
                  >
                    {btn2Text}
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
