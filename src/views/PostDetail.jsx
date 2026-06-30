import React, { useState, useEffect } from "react";
import { useParams, Link } from "@/lib/router-compat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSessionId } from "@/lib/security";
import { supabase } from "@/api/supabaseClient";
import { motion } from "framer-motion";
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, MapPin, Tag, Clock, AlertTriangle, Star, Megaphone, Shield, MessageCircle, User, Loader2, FileText, Users, Share2 } from "lucide-react";
import ReportButton from "@/components/posts/ReportButton";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/context/LanguageContext";
import { getPostById } from "@/services/posts";
import { toggleReaction, getMyReaction } from "@/services/reactions";
import { Button } from "@/components/ui/button";
import PostSkeleton from "@/components/posts/PostSkeleton";
import BookmarkButton from "@/components/posts/BookmarkButton";
import { usePageMeta } from "@/hooks/usePageMeta";
import { injectPostStructuredData, injectBreadcrumbStructuredData, cleanupStructuredData } from "@/lib/seo";
import ShareBar from "@/components/sharing/ShareBar";
import PublicTrustBar from "@/components/engagement/PublicTrustBar";
import RelatedPosts from "@/components/discovery/RelatedPosts";
import AdSlot from "@/components/ads/AdSlot";
import EngagementBadge, { computeBadge } from "@/components/engagement/EngagementBadge";
import { isCivicPost, getCivicStatus, generateComplaintMessage } from "@/lib/civicReceipt";
import CivicReceiptHeader from "@/components/civic/CivicReceiptHeader";
import CivicTimeline from "@/components/civic/CivicTimeline";
import CivicReceiptActions from "@/components/civic/CivicReceiptActions";
import OfficialRouteSection from "@/components/civic/OfficialRouteSection";
import ComplaintTrackerPanel from "@/components/civic/ComplaintTrackerPanel";
import CivicShareCard from "@/components/civic/CivicShareCard";
import AccountabilityMeter from "@/components/civic/AccountabilityMeter";
import BeforeAfterPanel from "@/components/civic/BeforeAfterPanel";
import ReceiptCredibilityScore from "@/components/civic/ReceiptCredibilityScore";
import CaseFileSidebar from "@/components/civic/CaseFileSidebar";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import CommentSection from "@/components/comments/CommentSection";
import SponsorThisIssue from "@/components/sponsors/SponsorThisIssue";

const TYPE_CONFIG = {
  complaint: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label_en: "Complaint", label_ta: "புகார்" },
  appreciation: { icon: Star, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20", label_en: "Appreciation", label_ta: "பாராட்டு" },
  local_update: { icon: Megaphone, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label_en: "Local Update", label_ta: "உள்ளூர் புதுப்பிப்பு" },
  alert: { icon: Shield, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20", label_en: "Alert", label_ta: "எச்சரிக்கை" },
  discussion: { icon: MessageCircle, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20", label_en: "Discussion", label_ta: "விவாதம்" },
};

export default function PostDetail() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const qc = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();
  const actorId = user?.id || getSessionId();

  // voted: null | "like" | "dislike" — reflects current server state
  const [voted, setVoted] = useState(null);
  const [votingLoading, setVotingLoading] = useState(false);

  const { data: post, isLoading, refetch } = useQuery({
    queryKey: ["post", id],
    queryFn: () => getPostById(id),
    enabled: !!id,
  });

  // Query the post author's profile to retrieve their trust score
  const { data: authorProfile = null } = useQuery({
    queryKey: ["post-author-profile", post?.created_by_id],
    queryFn: async () => {
      if (!post?.created_by_id) return null;
      const { data, error } = await supabase
        .from("profile")
        .select("trust_score")
        .eq("id", post.created_by_id)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!post?.created_by_id,
    staleTime: 60_000,
  });

  // Query complaint tracker entries for this post (V2 credibility scoring)
  const { data: complaintTrackers = [] } = useQuery({
    queryKey: ["complaint-trackers", post?.id],
    queryFn: async () => {
      if (!post?.id) return [];
      const { data, error } = await supabase
        .from("complaint_tracker")
        .select("*")
        .eq("post_id", post.id)
        .order("created_date", { ascending: false });
      if (error) return [];
      return data || [];
    },
    enabled: !!post?.id && isCivicPost(post),
    staleTime: 60_000,
  });

  // Hydrate my existing vote from DB on load
  useEffect(() => {
    if (!post?.id) return;
    getMyReaction(post.id, "post", actorId).then((r) => {
      if (r) setVoted(r.reaction_type);
    });
  }, [post?.id, actorId]);

  usePageMeta({
    title: post?.civic_receipt_id ? `${post.civic_receipt_id} — ${post.title_en}` : post?.title_en,
    description: post?.content_en?.substring(0, 160),
    image: (post?.before_photos?.[0] || post?.media_urls?.[0]),
    url: typeof window !== "undefined" ? window.location.href : undefined,
    type: "article",
  });

  useEffect(() => {
    if (!post) return;
    injectPostStructuredData(post);
    injectBreadcrumbStructuredData([
      { name: "Home", url: window.location.origin },
      { name: post.district_name || "District", url: `${window.location.origin}/district/${post.district_slug}` },
      { name: post.title_en, url: window.location.href },
    ]);
    return () => cleanupStructuredData();
  }, [post?.id]);

  const handleVote = async (reactionType) => {
    if (!post || votingLoading) return;
    if (!isAuthenticated) {
      requireAuth(() => handleVote(reactionType), T("Sign in to vote", "வாக்களிக்க உள்நுழையுங்கள்"));
      return;
    }
    setVotingLoading(true);
    const result = await toggleReaction(post.id, "post", reactionType, actorId, isAuthenticated, post);
    setVoted(result.reactionType); // null if toggled off, else the type
    qc.invalidateQueries({ queryKey: ["post", id] });
    setVotingLoading(false);
  };

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8"><PostSkeleton /><PostSkeleton /></div>;
  if (!post) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-2xl mb-2">🔍</p>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{T("Post Not Found", "பதிவு கண்டுபிடிக்கப்படவில்லை")}</h2>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{T("This post may have been removed.", "இந்த பதிவு நீக்கப்பட்டிருக்கலாம்.")}</p>
      <Link to="/explore" className="inline-flex items-center gap-1 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">{T("← Back to Explore", "← ஆராய்வுக்கு திரும்பு")}</Link>
    </div>
  );
  if (post.status === "removed") return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-2xl mb-2">🚫</p>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">{T("Post Removed", "பதிவு நீக்கப்பட்டது")}</h2>
      <Link to="/explore" className="inline-flex items-center gap-1 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">{T("← Back to Explore", "← ஆராய்வுக்கு திரும்பு")}</Link>
    </div>
  );

  const type = TYPE_CONFIG[post.post_type] || TYPE_CONFIG.discussion;
  const TypeIcon = type.icon;
  const title = T(post.title_en, post.title_ta) || post.title_en;
  const content = T(post.content_en, post.content_ta) || post.content_en;
  const badge = computeBadge(post);
  const isCivic = isCivicPost(post);
  const allPhotos = [...(post.before_photos || []), ...(post.media_urls || [])].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);
  const civicStatus = post.civic_status || "reported";

  // Complaint needed nudge: community verified but no complaint ID
  const showComplaintNudge = isCivic &&
    (civicStatus === "community_verified" || civicStatus === "complaint_needed") &&
    !post.official_complaint_id;

  // Copy complaint message helper
  const handleCopyComplaintMsg = () => {
    const msg = generateComplaintMessage(post);
    navigator.clipboard.writeText(msg);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8 relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {T("Back to Explore", "ஆராய்வுக்கு திரும்பு")}
          </Link>

          {/* CIVIC RECEIPT VIEW */}
          {isCivic ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Receipt header — Public Case File identity */}
              <CivicReceiptHeader post={post} />

              {/* Accountability Meter — SLA tracker */}
              <AccountabilityMeter post={post} />

              {/* Complaint needed nudge */}
              {showComplaintNudge && (
                <div className="flex items-start gap-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-2xl p-4">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-orange-800 dark:text-orange-300">
                      {T("Official Complaint Needed", "அதிகாரப்பூர்வ புகார் தேவை")}
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">
                      {T("Community has verified this issue. File an official complaint to advance progress.", "சமுதாயம் இந்த சிக்கலை சரிபார்த்தது. முன்னேற்றத்திற்கு அதிகாரப்பூர்வ புகார் தாக்கல் செய்யவும்.")}
                    </p>
                    <button
                      onClick={handleCopyComplaintMsg}
                      className="mt-2 text-xs text-orange-700 dark:text-orange-300 underline font-medium"
                    >
                      {T("📋 Copy complaint message template", "📋 புகார் செய்தி மூலத்தை நகலெடு")}
                    </button>
                  </div>
                </div>
              )}

              {/* Issue description */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{title}</h2>
                {content && (
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">{content}</p>
                )}
                {post.location_text && (
                  <div className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
                    <MapPin className="w-4 h-4 text-red-400" />
                    {post.location_text}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {badge && <EngagementBadge type={badge} />}
                    <BookmarkButton post={post} />
                  </div>
                  {!post.is_anonymous && post.author_name && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <User className="w-3.5 h-3.5" />
                      <span>{post.author_name}</span>
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold">
                        ★ {authorProfile?.trust_score || 10}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Before/After Evidence Panel — V2 side-by-side comparison */}
              <BeforeAfterPanel
                beforePhotos={allPhotos}
                afterPhotos={post.claimed_fixed_photos || []}
              />

              {/* Official Complaint Route */}
              <OfficialRouteSection post={post} />

              {/* Community actions */}
              <div data-civic-actions className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                <CivicReceiptActions post={post} onRefresh={() => qc.invalidateQueries({ queryKey: ["post", id] })} />
              </div>

              {/* Complaint Tracker */}
              <ComplaintTrackerPanel post={post} onRefresh={() => qc.invalidateQueries({ queryKey: ["post", id] })} />

              {/* Civic Case File Stats & Credibility — mobile only */}
              <div className="lg:hidden space-y-5">
                <CaseFileSidebar
                  post={post}
                  authorTrustScore={authorProfile?.trust_score || 10}
                  complaintTrackers={complaintTrackers}
                />
                <ReceiptCredibilityScore
                  post={post}
                  authorTrustScore={authorProfile?.trust_score || 10}
                  complaintTrackers={complaintTrackers}
                />
              </div>

              {/* Timeline */}
              {post.timeline_events?.length > 0 && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    {T("Civic Receipt Timeline", "குடிமை ரசீது காலவரிசை")}
                  </h3>
                  <CivicTimeline events={post.timeline_events} />
                </div>
              )}

              {/* Share Card */}
              <CivicShareCard post={post} />

              {/* VizhiTN positioning disclaimer */}
              <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center italic">
                  {T(
                    "VizhiTN does not replace government grievance systems. We help citizens document local issues, find the right authority, file better complaints, track progress, and verify real resolution with public proof.",
                    "VizhiTN அரசு குறைகோள் அமைப்புகளை மாற்றாது. உள்ளூர் சிக்கல்களை ஆவணப்படுத்தவும், சரியான அதிகாரியைக் கண்டுபிடிக்கவும், சிறந்த புகார்களை தாக்கல் செய்யவும், முன்னேற்றத்தை கண்காணிக்கவும் குடிமக்களுக்கு நாங்கள் உதவுகிறோம்."
                  )}
                </p>
              </div>

              {/* Sponsor This Issue — only for eligible community-solvable issues */}
              <SponsorThisIssue post={post} />

              {/* Share */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <ShareBar post={post} lang={lang} />
                <ReportButton targetType="post" targetId={post.id} />
              </div>
            </motion.div>
          ) : (
            /* NORMAL POST VIEW */
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden mb-6"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${type.bg} ${type.color}`}>
                    <TypeIcon className="w-4 h-4" />
                    {T(type.label_en, type.label_ta)}
                  </span>
                  <div className="flex items-center gap-2">
                    {badge && <EngagementBadge type={badge} />}
                    <BookmarkButton post={post} />
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-4">{title}</h1>
                <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400 mb-5">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{post.district_name}</span>
                  {post.category_name && <span className="flex items-center gap-1"><Tag className="w-4 h-4" />{post.category_name}</span>}
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{post.created_date ? formatDistanceToNow(new Date(post.created_date), { addSuffix: true }) : ""}</span>
                  {!post.is_anonymous && post.author_name && (
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author_name}</span>
                      <span className="ml-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-[9px] font-bold">
                        ★ {authorProfile?.trust_score || 10}
                      </span>
                    </span>
                  )}
                </div>
                {content && (
                  <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base whitespace-pre-wrap mb-5">{content}</div>
                )}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    {post.media_urls.map((url, idx) => (
                      <div key={idx} className="rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-700 aspect-video">
                        <img src={url} alt={`media-${idx}`} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={() => handleVote("like")}
                    disabled={votingLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${voted === "like" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 ring-2 ring-blue-300" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600"}`}
                  >
                    {votingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}{post.upvotes || 0}
                  </button>
                  <button
                    onClick={() => handleVote("dislike")}
                    disabled={votingLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 ${voted === "dislike" ? "bg-red-100 dark:bg-red-900/30 text-red-600 ring-2 ring-red-300" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600"}`}
                  >
                    {votingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsDown className="w-4 h-4" />}{post.downvotes || 0}
                  </button>
                  <span className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 ml-2">
                    <MessageSquare className="w-4 h-4" />
                    {post.comment_count || 0} {T("comments", "கருத்துகள்")}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-4 flex-wrap">
                  <ShareBar post={post} lang={lang} />
                  <ReportButton targetType="post" targetId={post.id} />
                </div>
              </div>
            </motion.article>
          )}

          {/* Trust Bar (non-civic) */}
          {!isCivic && (
            <div className="mb-6">
              <PublicTrustBar upvotes={post.upvotes} downvotes={post.downvotes} commentCount={post.comment_count || 0} lang={lang} />
            </div>
          )}

          <AdSlot placement="feed" className="mb-6" />

          <CommentSection postId={id} postCommentCount={post.comment_count} />
        </div>

        {/* Sidebar — Civic Case File dashboard on desktop */}
        <div className="hidden lg:block space-y-6 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto pr-1 no-scrollbar h-fit">
          {isCivic ? (
            <>
              <CaseFileSidebar
                post={post}
                authorTrustScore={authorProfile?.trust_score || 10}
                complaintTrackers={complaintTrackers}
              />
              <ReceiptCredibilityScore
                post={post}
                authorTrustScore={authorProfile?.trust_score || 10}
                complaintTrackers={complaintTrackers}
              />
              <RelatedPosts post={post} limit={3} />
            </>
          ) : (
            <>
              <RelatedPosts post={post} limit={4} />
              <AdSlot placement="district" className="w-full" />
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                  {T("More from", "இதிலிருந்து மேலும்")} {post.district_name}
                </p>
                <Link to={`/district/${post.district_slug}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  {T("View all district posts →", "மாவட்ட பதிவுகளை பார்க்க →")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile sticky bottom bar — civic receipts only */}
      {isCivic && (
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-4 py-3 flex gap-2 shadow-2xl">
          <button
            onClick={() => document.querySelector("[data-civic-actions]")?.scrollIntoView({ behavior: "smooth" })}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          >
            <Users className="w-4 h-4" />
            {T("Verify", "சரிபார்")}
          </button>
          <button
            onClick={handleCopyComplaintMsg}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-orange-50 dark:bg-orange-900/20 border border-orange-300 text-orange-700 dark:text-orange-300 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          >
            <FileText className="w-4 h-4" />
            {T("Complaint", "புகார்")}
          </button>
          <button
            onClick={() => {
              const url = window.location.href;
              if (navigator.share) navigator.share({ title: post.title_en, url });
              else navigator.clipboard.writeText(url);
            }}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          >
            <Share2 className="w-4 h-4" />
            {T("Share", "பகிர்")}
          </button>
        </div>
      )}
    </div>
  );
}