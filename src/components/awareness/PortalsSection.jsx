import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ArrowRight, LinkIcon, ExternalLink, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";
import * as LucideIcons from "lucide-react";

const getIcon = (name) => LucideIcons[name] || LucideIcons.Globe;

const PORTAL_COLORS = [
  "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
];

export default function PortalsSection({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [copiedId, setCopiedId] = useState(null);

  const { data: portals = [], isLoading } = useQuery({
    queryKey: ["awarenessPortals"],
    queryFn: () => base44.entities.AwarenessPortal.filter({ is_active: true }, "sort_order"),
  });

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (isLoading) {
    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-44 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <LinkIcon className="w-5 h-5 text-blue-500" />
          {T("Official Links", "அதிகாரப்பூர்வ இணைப்புகள்")}
        </h2>
        <Link
          to="/awareness/portals"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          {T("View all portals", "அனைத்து இணையதளங்கள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {portals.slice(0, 5).map((portal, idx) => {
          const Icon = getIcon(portal.icon);
          const name = lang === "ta" ? portal.name_ta || portal.name_en : portal.name_en;
          const desc = lang === "ta" ? portal.description_ta || portal.description_en : portal.description_en;
          const colorCls = PORTAL_COLORS[idx % PORTAL_COLORS.length];

          return (
            <div
              key={portal.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col items-center text-center"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${colorCls}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white mb-1 line-clamp-2 leading-snug">
                {name}
              </h3>
              {desc && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {desc}
                </p>
              )}

              <div className="flex gap-2 mt-auto w-full">
                <a
                  href={portal.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  {T("Open", "திற")}
                </a>
                <button
                  onClick={() => handleCopy(portal.url, portal.id)}
                  className="flex items-center justify-center gap-1 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors"
                >
                  {copiedId === portal.id ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
