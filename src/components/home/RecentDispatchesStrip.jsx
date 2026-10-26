"use client";

import React from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { getActivePosts } from "@/services/posts";
import { Zap, AlertTriangle, FileText, ArrowRight, ShieldCheck, Clock } from "lucide-react";

export default function RecentDispatchesStrip() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const { data: posts = [] } = useQuery({
    queryKey: ["home-recent-mini-feed"],
    queryFn: () => getActivePosts(3),
    staleTime: 60_000,
  });

  if (!posts || posts.length === 0) return null;

  const getCategoryBadge = (post) => {
    const slug = post.category_slug;
    if (slug === "electricity" || slug === "power-cut") {
      return { icon: Zap, label: T("Power Shutdown", "மின்தடை"), bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700/50" };
    }
    if (slug === "weather" || slug === "rain") {
      return { icon: AlertTriangle, label: T("Weather / Rain", "மழை எச்சரிக்கை"), bg: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-700/50" };
    }
    return { icon: FileText, label: T("Civic Report", "குடிமை தகவல்"), bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700/50" };
  };

  return (
    <section className="bg-civic-50/70 dark:bg-[#051329] border-b border-civic-200 dark:border-civic-800 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
              {T("Happening Right Now — Tamil Nadu Live Dispatches", "நிகழ்நேர கள நிலவரம் — நேரடி கள அறிக்கைகள்")}
            </h3>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 transition"
          >
            <span>{T("View Live Feed", "முழு நேரடி ஊட்டம்")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {posts.map((post) => {
            const badge = getCategoryBadge(post);
            const Icon = badge.icon;
            const title = lang === "ta" && post.title_ta ? post.title_ta : (post.title_en || post.title || "");
            const district = post.district_name || post.district_slug || "Tamil Nadu";
            const area = post.area_name || post.location_text || "";

            return (
              <Link
                key={post.id || post.slug}
                to={`/post/${post.slug || post.id}`}
                className="group p-3 rounded-2xl bg-white dark:bg-[#0D2B52] border border-civic-200 dark:border-civic-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${badge.bg}`}>
                      <Icon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      <span>{district.toUpperCase()}</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug mb-1">
                    {title}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[10.5px] text-slate-400">
                  <span className="truncate max-w-[170px]">{area || district}</span>
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>{T("Verified Update", "உண்மைச் சரிபார்ப்பு")}</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
