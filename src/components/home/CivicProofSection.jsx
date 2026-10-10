"use client";

import React, { useState } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import {
  FileCheck2,
  ArrowRight,
  PlusCircle,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getActiveCivicPosts } from "@/services/posts";

const CATEGORY_FILTERS = [
  { id: "all", labelEn: "All Reports", labelTa: "அனைத்தும்", icon: "📋" },
  { id: "electricity", labelEn: "Electricity", labelTa: "மின்சாரம்", icon: "⚡" },
  { id: "water-sanitation", labelEn: "Water & Sewage", labelTa: "குடிநீர் & கழிவுநீர்", icon: "💧" },
  { id: "road-infrastructure", labelEn: "Roads & Bridges", labelTa: "சாலைகள்", icon: "🚧" },
  { id: "public-safety", labelEn: "Safety & Scams", labelTa: "பாதுகாப்பு", icon: "⚠️" },
];

const CIVIC_STATUS_MAP = {
  community_verified: {
    labelEn: "Verified by Citizens",
    labelTa: "சரிபார்க்கப்பட்டது",
    color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  },
  complaint_filed: {
    labelEn: "Official Complaint Filed",
    labelTa: "புகார் பதிவு செய்யப்பட்டது",
    color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  },
  claimed_fixed: {
    labelEn: "Claimed Fixed",
    labelTa: "சரிசெய்யப்பட்டது",
    color: "bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  },
  reported: {
    labelEn: "Reported",
    labelTa: "பதிவு செய்யப்பட்டது",
    color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  },
};

export default function CivicProofSection() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" && ta ? ta : en);
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["home-civic-proof-posts"],
    queryFn: () => getActiveCivicPosts(30),
    staleTime: 120_000,
  });

  const filtered = posts.filter((p) => {
    if (activeCategory === "all") return true;
    return p.category_slug === activeCategory;
  });

  const displayPosts = filtered.slice(0, 4);

  return (
    <section className="py-12 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title and Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{T("Civic Proof & Accountability", "குடிமை சான்றுகள் & கண்காணிப்பு")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {T("Real Citizen Reports Across Tamil Nadu", "தமிழ்நாடு முழுவதுமான கள புகார்கள் & ரசீதுகள்")}
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              to="/create"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{T("File Civic Receipt", "புகார் ரசீது பதிவிடு")}</span>
            </Link>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition-all"
            >
              <span>{T("View All", "அனைத்தும்")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
                    : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{T(cat.labelEn, cat.labelTa)}</span>
              </button>
            );
          })}
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 h-56 animate-pulse"
              />
            ))}
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800">
            <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold mb-3">
              {T("No reports logged in this category right now.", "இந்த பிரிவில் தற்போது புகார்கள் இல்லை.")}
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{T("Be the first to file a report", "முதல் புகாரை பதிவு செய்யுங்கள்")}</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayPosts.map((post) => {
              const statusCfg =
                CIVIC_STATUS_MAP[post.civic_status] || CIVIC_STATUS_MAP.reported;
              const title = T(post.title_en || post.title, post.title_ta || post.title);
              const area = post.area_name || post.district_slug || "Tamil Nadu";
              const receiptId =
                post.civic_receipt_id ||
                `TN-${(post.id || "").slice(0, 6).toUpperCase()}`;
              const postPath = post.slug ? `/post/${post.slug}` : `/post/${post.id}`;

              return (
                <div
                  key={post.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/60 dark:hover:border-blue-500/60 p-5 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Receipt ID & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-[11px] font-extrabold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {receiptId}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.color}`}
                      >
                        {T(statusCfg.labelEn, statusCfg.labelTa)}
                      </span>
                    </div>

                    {/* Area Location */}
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold mb-2 capitalize truncate">
                      <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                      <span>{area}</span>
                    </div>

                    {/* Title */}
                    <Link to={postPath}>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug mb-3">
                        {title}
                      </h3>
                    </Link>

                    {/* Department if assigned */}
                    {post.assigned_department && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-1.5 mb-2 truncate">
                        <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate font-medium">{post.assigned_department}</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs mt-2">
                    <span className="text-[11px] text-slate-400">
                      {post.views_count ? `${post.views_count} views` : "Active"}
                    </span>
                    <Link
                      to={postPath}
                      className="font-bold text-blue-600 dark:text-blue-400 group-hover:underline flex items-center gap-0.5"
                    >
                      <span>{T("Details", "விவரம்")}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
