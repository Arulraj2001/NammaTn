import Image from "next/image";
import React, { memo } from "react";
import { Link } from "@/lib/router-compat";
import {
  MapPin, Tag, ThumbsUp, MessageSquare, Clock, AlertTriangle, Star, Megaphone,
  Shield, MessageCircle, Users, FileText, CheckCircle, Zap, Droplets, Construction,
  Bus, Landmark, GraduationCap, HeartPulse, Sprout, Scale
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { formatDistanceToNow } from "date-fns";
import EngagementBadge, { computeBadge } from "@/components/engagement/EngagementBadge";
import ShareBar from "@/components/sharing/ShareBar";
import { isCivicPost, getDaysOpen, getUrgency } from "@/lib/civicReceipt";
import CivicStatusBadge from "@/components/civic/CivicStatusBadge";
import { getPostUrl } from "@/lib/postUrl";

const CATEGORY_BULLETINS = {
  'public-safety': {
    icon: Shield,
    label: 'Public Safety & Cyber',
    bg: 'bg-gradient-to-br from-rose-950 via-slate-900 to-red-950',
    border: 'border-rose-700/50 hover:border-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30',
    accentText: 'text-rose-400',
    dept: 'Cyber Crime Wing & Police (1930 / 112)',
  },
  'electricity': {
    icon: Zap,
    label: 'Electricity & Power',
    bg: 'bg-gradient-to-br from-amber-950 via-slate-900 to-yellow-950',
    border: 'border-amber-700/50 hover:border-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
    accentText: 'text-amber-400',
    dept: 'TANGEDCO Minnalagam (1912)',
  },
  'water-sanitation': {
    icon: Droplets,
    label: 'Water & Sanitation',
    bg: 'bg-gradient-to-br from-cyan-950 via-slate-900 to-blue-950',
    border: 'border-cyan-700/50 hover:border-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
    accentText: 'text-cyan-400',
    dept: 'Metrowater / TWAD (1913)',
  },
  'road-infrastructure': {
    icon: Construction,
    label: 'Roads & Flyovers',
    bg: 'bg-gradient-to-br from-orange-950 via-slate-900 to-stone-900',
    border: 'border-orange-700/50 hover:border-orange-400',
    badge: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
    accentText: 'text-orange-400',
    dept: 'Highways & GCC Works (1913)',
  },
  'transport': {
    icon: Bus,
    label: 'Transport & Transit',
    bg: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
    border: 'border-blue-700/50 hover:border-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    accentText: 'text-blue-400',
    dept: 'CMRL / MTC / Southern Railway (139)',
  },
  'government-schemes': {
    icon: Landmark,
    label: 'Govt Schemes',
    bg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950',
    border: 'border-indigo-700/50 hover:border-indigo-400',
    badge: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
    accentText: 'text-indigo-400',
    dept: 'e-Sevai & Civil Supplies (1967)',
  },
  'education': {
    icon: GraduationCap,
    label: 'Education & Schools',
    bg: 'bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950',
    border: 'border-teal-700/50 hover:border-teal-400',
    badge: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
    accentText: 'text-teal-400',
    dept: 'School Education Department (14417)',
  },
  'healthcare': {
    icon: HeartPulse,
    label: 'Public Health',
    bg: 'bg-gradient-to-br from-red-950 via-slate-900 to-rose-950',
    border: 'border-red-700/50 hover:border-red-400',
    badge: 'bg-red-500/20 text-red-300 border border-red-500/30',
    accentText: 'text-red-400',
    dept: 'Public Health Care (108 / 104)',
  },
  'agriculture': {
    icon: Sprout,
    label: 'Agriculture & Farmers',
    bg: 'bg-gradient-to-br from-lime-950 via-slate-900 to-emerald-950',
    border: 'border-lime-700/50 hover:border-lime-400',
    badge: 'bg-lime-500/20 text-lime-300 border border-lime-500/30',
    accentText: 'text-lime-400',
    dept: 'Agriculture & Farmer Welfare',
  },
  'tn-politics': {
    icon: Scale,
    label: 'TN Politics',
    bg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-fuchsia-950',
    border: 'border-purple-700/50 hover:border-purple-400',
    badge: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    accentText: 'text-purple-400',
    dept: 'TN Legislative Assembly & Parties',
  },
  'general': {
    icon: FileText,
    label: 'Civic Dispatch',
    bg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800',
    border: 'border-slate-700 hover:border-slate-500',
    badge: 'bg-slate-700/50 text-slate-300 border border-slate-600',
    accentText: 'text-slate-400',
    dept: 'Tamil Nadu Civic Administration (1100)',
  }
};

const isStaticPlaceholder = (url) => {
  if (!url || typeof url !== "string") return true;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed.startsWith("/images/categories/") ||
    trimmed.startsWith("/images/mlas/") ||
    trimmed === "/images/placeholder.webp" ||
    trimmed === "/images/default-post.webp"
  );
};

function CivicBulletinCard({ post, title, postUrl }) {
  const category = (post.category_slug || "general").toLowerCase();
  const theme = CATEGORY_BULLETINS[category] || CATEGORY_BULLETINS.general;
  const CategoryIcon = theme.icon;

  return (
    <Link
      to={postUrl}
      prefetch={true}
      className={`block mb-3 rounded-xl overflow-hidden relative border ${theme.border} ${theme.bg} p-3 sm:p-3.5 shadow-md group/bulletin transition-all duration-300 min-h-[148px] flex flex-col justify-between`}
    >
      {/* Background glow & watermark icon */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
      <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
        <CategoryIcon className="w-24 h-24 text-white" />
      </div>

      {/* Top Bar: Category pill + District chip */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${theme.badge}`}>
          <CategoryIcon className="w-3 h-3" />
          {theme.label}
        </span>
        {post.district_slug && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-200 bg-black/50 px-2 py-0.5 rounded-md border border-white/10 capitalize">
            <MapPin className="w-3 h-3 text-red-400" />
            {post.area_name || post.district_slug}
          </span>
        )}
      </div>

      {/* Centerpiece: Dynamic Story Headline with High-Contrast Typography */}
      <div className="my-2 relative z-10">
        <p className="font-extrabold text-white text-xs sm:text-sm leading-snug line-clamp-2 group-hover/bulletin:text-blue-300 transition-colors">
          {title}
        </p>
      </div>

      {/* Bottom Bar: Verified Helpline + Receipt ID */}
      <div className="flex items-center justify-between text-[10px] text-slate-300/90 pt-2 border-t border-white/10 relative z-10">
        <span className="font-semibold flex items-center gap-1 truncate max-w-[70%]">
          <Shield className="w-3 h-3 text-amber-400 flex-shrink-0" />
          <span className="truncate">{post.assigned_department || theme.dept}</span>
        </span>
        {post.civic_receipt_id && (
          <span className="font-mono font-bold text-slate-400 text-[9px] bg-white/10 px-1.5 py-0.5 rounded tracking-wide">
            {post.civic_receipt_id}
          </span>
        )}
      </div>
    </Link>
  );
}

const TYPE_CONFIG = {
  complaint: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label_en: "Complaint", label_ta: "புகார்" },
  appreciation: { icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", label_en: "Appreciation", label_ta: "பாராட்டு" },
  local_update: { icon: Megaphone, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label_en: "Local Update", label_ta: "உள்ளூர் புதுப்பிப்பு" },
  alert: { icon: Shield, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", label_en: "Alert", label_ta: "எச்சரிக்கை" },
  discussion: { icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", label_en: "Discussion", label_ta: "விவாதம்" },
};

// Only complaints with a real civic_receipt_id get the full civic receipt UI.
// Alerts are warnings — they should NOT show the receipt top bar.
const hasCivicReceiptBar = (post) =>
  post?.post_type === "complaint" && !!post?.civic_receipt_id;

const PostCard = memo(function PostCard({ post }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" && ta ? ta : en;

  const type = TYPE_CONFIG[post.post_type] || TYPE_CONFIG.discussion;
  const TypeIcon = type.icon;
  const postUrl = getPostUrl(post);
  const title = T(post.title_en, post.title_ta) || post.title_en;
  const content = T(post.content_en, post.content_ta) || post.content_en;
  const badge = computeBadge(post);
  // isCivicPost is unchanged — still used for civic stats row, footer text, etc.
  const isCivic = isCivicPost(post);
  // hasCivicReceiptBar is the NEW narrower check — only complaints with a receipt ID
  const showReceiptBar = hasCivicReceiptBar(post);
  const isAlert = post.post_type === "alert";
  const daysOpen = getDaysOpen(post.created_date);

  // Urgency — only shown for complaint/alert post types
  const showUrgency = (post.post_type === "complaint" || post.post_type === "alert") && !!post.urgency_level;
  const urgency = showUrgency ? getUrgency(post.urgency_level) : null;

  // Alert severity: border color driven by urgency level
  const alertBorderColor = isAlert
    ? post.urgency_level === "critical" ? "border-red-400 dark:border-red-700"
    : post.urgency_level === "high" ? "border-orange-400 dark:border-orange-700"
    : "border-orange-300 dark:border-orange-800/70"
    : null;

  const firstPhoto = (post.before_photos?.[0] || post.media_urls?.[0]);
  const [imgError, setImgError] = React.useState(false);

  return (
    <article className={`bg-white dark:bg-slate-900 rounded-2xl border-2 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 group relative focus-within:z-30 hover:z-30 overflow-visible ${
      showReceiptBar ? "border-blue-300 dark:border-blue-800/80 hover:border-blue-500"
      : isAlert ? `${alertBorderColor} hover:border-orange-500`
      : "border-slate-300 dark:border-slate-700 hover:border-blue-500"
    }`}>

      {/* Civic Receipt top bar — only for complaints that have a receipt ID */}
      {showReceiptBar && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-3.5 py-2 flex items-center justify-between gap-2 rounded-t-xl overflow-hidden border-b border-slate-800">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400 stroke-[2.5]" />
            <span className="text-xs font-mono font-bold text-white tracking-wider">
              {post.civic_receipt_id}
            </span>
          </div>
          <CivicStatusBadge status={post.civic_status || "reported"} size="xs" />
        </div>
      )}

      {/* Alert warning bar — replaces receipt bar for alerts */}
      {isAlert && (
        <div className={`px-3.5 py-1.5 flex items-center justify-between gap-2 rounded-t-xl overflow-hidden border-b ${
          post.urgency_level === "critical"
            ? "bg-red-600 border-red-700"
            : "bg-orange-500 border-orange-600"
        }`}>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            <span className="text-xs font-bold text-white tracking-wide">
              {T("Community Alert", "சமுதாய எச்சரிக்கை")}
            </span>
          </div>
          {urgency && (
            <span className="text-[10px] font-extrabold text-white bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {T(urgency.label.replace(" 🚨", ""), urgency.label_ta?.replace(" 🚨", ""))}
            </span>
          )}
        </div>
      )}

      <div className="p-4">
        {/* Type badge + engagement badge + urgency chip for complaints */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-2xs ${type.bg} ${type.color}`}>
              <TypeIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              {T(type.label_en, type.label_ta)}
            </span>
            {/* Urgency badge on complaint cards (not shown for alerts — they have the top bar) */}
            {showUrgency && !isAlert && urgency && (
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${urgency.bg} ${urgency.color}`}>
                <Zap className="w-3 h-3" />
                {T(urgency.label, urgency.label_ta)}
              </span>
            )}
            {badge && <EngagementBadge type={badge} />}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ""}
          </span>
        </div>

        {/* Title — clickable link to post detail */}
        <h3 className="font-extrabold text-slate-900 dark:text-white text-base leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          <Link to={postUrl} prefetch={true} className="hover:underline">
            {title}
          </Link>
        </h3>

        {/* Content preview */}
        {content && (
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-3 font-normal line-clamp-2">
            {content}
          </p>
        )}

        {/* Media thumbnail or Dynamic Civic Bulletin */}
        {firstPhoto && !isStaticPlaceholder(firstPhoto) && !imgError ? (
          <Link to={postUrl} prefetch={true} className="block mb-3 rounded-xl overflow-hidden h-40 bg-slate-100 dark:bg-slate-700">
            <Image
              src={firstPhoto}
              alt={title}
              width={640}
              height={480}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
          </Link>
        ) : (
          <CivicBulletinCard post={post} title={title} postUrl={postUrl} />
        )}

        {/* Civic stats row — unchanged, still driven by isCivicPost */}
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
            to={postUrl}
            prefetch={true}
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