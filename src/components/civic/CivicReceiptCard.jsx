import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Users } from "lucide-react";
import CivicStatusBadge from "./CivicStatusBadge";
import { getUrgency, getDaysOpen } from "@/lib/civicReceipt";
import { useLanguage } from "@/context/LanguageContext";

export default function CivicReceiptCard({ post }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const urgency = getUrgency(post.urgency_level);
  const days = getDaysOpen(post.created_date);

  return (
    <Link to={`/post/${post.id}`} className="block group">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700 transition-all">
        {/* Before photo */}
        {(post.before_photos?.[0] || post.media_urls?.[0]) && (
          <div className="aspect-video bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <img
              src={post.before_photos?.[0] || post.media_urls[0]}
              alt={post.title_en}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {post.civic_receipt_id && (
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">
                  {post.civic_receipt_id}
                </span>
              )}
              <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${urgency.bg} ${urgency.color}`}>
                {T(urgency.label, urgency.label_ta)}
              </span>
            </div>
            <CivicStatusBadge status={post.civic_status || "reported"} size="sm" />
          </div>

          <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {post.title_en}
          </h3>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{post.district_name}{post.area_name ? `, ${post.area_name}` : ""}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{days} {T("days open", "நாட்கள்")}</span>
            {(post.verification_count || 0) > 0 && (
              <span className="flex items-center gap-1 text-indigo-500"><Users className="w-3 h-3" />{post.verification_count} {T("verified", "சரிபார்க்கப்பட்டது")}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}