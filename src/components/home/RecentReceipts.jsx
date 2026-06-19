"use client";

import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, AlertCircle, MapPin, Clock, MessageSquare, ThumbsUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getActiveCivicPosts } from "@/services/posts";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

const STATUS_LABELS = {
  reported: { label: "Open", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  under_review: { label: "In Progress", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  in_progress: { label: "In Progress", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  citizen_verified_fixed: { label: "Resolved", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
  resolved: { label: "Resolved", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300" },
};

function getStatusBadge(status) {
  return STATUS_LABELS[status] || { label: "Open", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" };
}

export default function RecentReceipts() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const { data: civicPosts = [], isLoading: civicLoading } = useQuery({
    queryKey: ["home-civic-posts"],
    queryFn: () => getActiveCivicPosts(20),
    staleTime: 60_000,
  });

  const recentReceipts = civicPosts.slice(0, 4);

  return (
    <section className="bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {T("Recent Civic Receipts", "அண்மை குடிமை ரசீதுகள்")}
          </h2>
          <Link to="/explore" className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {T("View all", "அனைத்தும்")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {civicLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 animate-pulse h-40" />
            ))}
          </div>
        ) : recentReceipts.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-3">
              {T("No civic receipts yet.", "இன்னும் குடிமை ரசீதுகள் இல்லை.")}
            </p>
            <Link to="/create">
              <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-xl transition-colors">
                {T("Log First Issue", "முதல் சிக்கல் பதிவிடு")}
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentReceipts.map((post) => {
              const badge = getStatusBadge(post.civic_status);
              return (
                <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 hover:shadow-md transition-all flex flex-col">
                  {/* Receipt ID + Status */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      {post.civic_receipt_id || post.id?.slice(0, 8).toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-1.5 line-clamp-2 flex-1">
                    {lang === "ta" ? post.title_ta || post.title_en : post.title_en}
                  </h3>
                  {/* Location + time */}
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{post.area_name || post.district_name || "Tamil Nadu"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-3">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    {timeAgo(post.created_date)}
                  </div>
                  {/* Footer: comments, likes, link */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <MessageSquare className="w-3 h-3" />{post.comment_count || 0}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <ThumbsUp className="w-3 h-3" />{post.upvotes || 0}
                    </span>
                    <Link to={`/post/${post.id}`} className="ml-auto text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline whitespace-nowrap">
                      {T("Open Receipt", "ரசீது பார்")} →
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
