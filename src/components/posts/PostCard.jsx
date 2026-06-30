import React, { memo } from "react";
import { Link } from "@/lib/router-compat";
import { MapPin, Tag, ThumbsUp, MessageSquare, Clock, AlertTriangle, Star, Megaphone, Shield, MessageCircle, Users, FileText, CheckCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import EngagementBadge, { computeBadge } from "@/components/engagement/EngagementBadge";
import ShareBar from "@/components/sharing/ShareBar";
import { isCivicPost, getDaysOpen } from "@/lib/civicReceipt";
import CivicStatusBadge from "@/components/civic/CivicStatusBadge";

const TYPE_CONFIG = {
  complaint: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label_en: "Complaint", label_ta: "புகார்" },
  appreciation: { icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", label_en: "Appreciation", label_ta: "பாராட்டு" },
  local_update: { icon: Megaphone, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label_en: "Local Update", label_ta: "உள்ளூர் புதுப்பிப்பு" },
  alert: { icon: Shield, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", label_en: "Alert", label_ta: "எச்சரிக்கை" },
  discussion: { icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", label_en: "Discussion", label_ta: "விவாதம்" },
};

const PostCard = memo(function PostCard({ post }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" && ta ? ta : en;

  const type = TYPE_CONFIG[post.post_type] || TYPE_CONFIG.discussion;
  const TypeIcon = type.icon;
  const title = T(post.title_en, post.title_ta) || post.title_en;
  const content = T(post.content_en, post.content_ta) || post.content_en;
  const badge = computeBadge(post);
  const isCivic = isCivicPost(post);
  const daysOpen = getDaysOpen(post.created_date);
  const firstPhoto = (post.before_photos?.[0] || post.media_urls?.[0]);

  return (
    <article className={`bg-white dark:bg-slate-800 rounded-2xl border hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group overflow-hidden ${
      isCivic ? "border-blue-200 dark:border-blue-800/60" : "border-slate-200 dark:border-slate-700"
    }`}>

      {/* Civic Receipt top bar */}
      {isCivic && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-3 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-blue-400" />
            <span className="text-xs font-mono font-bold text-white tracking-wide">
              {post.civic_receipt_id || "CIVIC"}
            </span>
          </div>
          <CivicStatusBadge status={post.civic_status || "reported"} size="xs" />
        </div>
      )}

      <div className="p-4">
        {/* Type badge + engagement badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${type.bg} ${type.color}`}>
              <TypeIcon className="w-3 h-3" />
              {T(type.label_en, type.label_ta)}
            </span>
            {badge && <EngagementBadge type={badge} />}
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ""}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Content preview */}
        {content && (
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">
            {content}
          </p>
        )}

        {/* Media thumbnail */}
        {firstPhoto && (
          <div className="mb-3 rounded-xl overflow-hidden h-40 bg-slate-100 dark:bg-slate-700">
            <img src={firstPhoto} alt={title} className="w-full h-full object-cover" loading="lazy" />
          </div>
        )}

        {/* Civic stats row */}
        {isCivic && (
          <div className="flex flex-wrap gap-2 mb-3">
            {(post.verification_count || 0) > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-300 px-2 py-0.5 rounded-full font-medium">
                <Users className="w-3 h-3" />
                {post.verification_count} {T("verified", "சரிபார்த்தது")}
              </span>
            )}
            {post.official_complaint_id && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle className="w-3 h-3" />
                {T("Complaint filed", "புகார் தாக்கல்")}
              </span>
            )}
            {daysOpen > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                daysOpen > 30 ? "text-red-600 bg-red-50 dark:bg-red-900/20" :
                daysOpen > 7 ? "text-orange-600 bg-orange-50 dark:bg-orange-900/20" :
                "text-slate-500 bg-slate-100 dark:bg-slate-700"
              }`}>
                {daysOpen}d {T("open", "திறந்தது")}
              </span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {post.area_name ? `${post.area_name}, ${post.district_name}` : post.district_name}
            </span>
            {post.category_name && !isCivic && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {post.category_name}
              </span>
            )}
          </div>
          {!isCivic && (
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{post.upvotes || 0}</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{post.comment_count || 0}</span>
            </div>
          )}
        </div>

        {post.is_anonymous && (
          <p className="text-xs text-slate-400 mt-2">{T("Posted anonymously", "அநாமதேயமாக பதிவிடப்பட்டது")}</p>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between gap-2">
          <Link
            to={`/post/${post.id}`}
            className={`text-xs font-medium hover:underline ${isCivic ? "text-blue-600 dark:text-blue-400" : "text-blue-600 dark:text-blue-400"}`}
          >
            {isCivic ? T("View Civic Receipt →", "குடிமை ரசீது பார்க்க →") : T("Read more →", "மேலும் படிக்க →")}
          </Link>
          <ShareBar post={post} lang={lang} compact />
        </div>
      </div>
    </article>
  );
});

export default PostCard;