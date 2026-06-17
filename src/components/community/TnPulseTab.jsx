import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle2, Zap, Droplets, Construction, AlertTriangle,
  ShieldAlert, HelpCircle, Users, Hash, ChevronRight,
  Wifi
} from "lucide-react";
import { getActiveSituations } from "@/services/situations";
import { getActiveEmergencies } from "@/services/emergencyPosts";
import { getActiveScams } from "@/services/scamAlerts";
import { getQuestions } from "@/services/questions";
import { getActivePosts } from "@/services/posts";

/* ─── helpers ─────────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return "";
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } catch {
    return "";
  }
}

/* ─── Situation type → badge config ─────────────────────── */
const SITUATION_BADGE = {
  live: { label: "Live", color: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300" },
  eb_shutdown: { label: "Power", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300" },
  water_shortage: { label: "Water", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300" },
  traffic: { label: "Traffic", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300" },
  flooding: { label: "Flood", color: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/40 dark:text-cyan-300" },
  road_block: { label: "Road", color: "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300" },
};
function getSituationBadge(s) {
  return SITUATION_BADGE[s.situation_type] || { label: "Live", color: "bg-red-100 text-red-600" };
}
function getSituationIcon(type) {
  if (type === "eb_shutdown") return <Zap className="w-4 h-4 text-yellow-500" />;
  if (type === "water_shortage") return <Droplets className="w-4 h-4 text-blue-500" />;
  if (type === "road_block" || type === "traffic") return <Construction className="w-4 h-4 text-orange-500" />;
  return <AlertTriangle className="w-4 h-4 text-red-500" />;
}

/* ─── Skeleton loader ──────────────────────────────────────── */
function Skeleton({ className }) {
  return <div className={`animate-pulse rounded-lg bg-slate-100 dark:bg-slate-700 ${className}`} />;
}

/* ─── Community Wins card ──────────────────────────────────── */
function CommunityWinsSection({ posts }) {
  const resolved = posts.filter(
    (p) => p.civic_status === "citizen_verified_fixed" || p.civic_status === "resolved"
  ).slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">Community Wins This Week</span>
        </div>
        <Link to="/community/wins" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          View all wins <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Horizontal scroll cards */}
      <div className="flex gap-3 p-4 overflow-x-auto scrollbar-hide">
        {resolved.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 px-2">No resolved issues this week yet.</p>
        ) : resolved.map((post) => (
          <Link key={post.id} to={`/post/${post.id}`} className="flex-shrink-0 w-44 group">
            {/* Image placeholder with resolved badge */}
            <div className="relative w-full h-28 rounded-xl overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 mb-2">
              {post.image_url ? (
                <img src={post.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
              )}
              <span className="absolute top-2 left-2 text-[10px] font-bold bg-green-500 text-white px-2 py-0.5 rounded-full">
                Resolved
              </span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {post.title_en || post.title}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              {post.area_name || post.district_name || "Tamil Nadu"}
              {post.area_name && post.district_name ? `, ${post.district_name}` : ""}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{timeAgo(post.created_date)}</p>
            {post.verification_count > 0 && (
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />
                Verified by {post.verification_count} citizen{post.verification_count !== 1 ? "s" : ""}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Live Situations section ─────────────────────────────── */
function LiveSituationsSection({ situations }) {
  const top = situations.slice(0, 5);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
            <Wifi className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">Live Situations</span>
        </div>
        <Link to="/situations" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {top.length === 0 && (
          <p className="px-5 py-4 text-xs text-slate-400 text-center">No active situations right now.</p>
        )}
        {top.map((s) => {
          const badge = getSituationBadge(s);
          return (
            <Link key={s.id} to="/situations" className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getSituationIcon(s.situation_type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                  {s.title || s.description_en || "Situation Update"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {s.area_name || s.district_name || "Tamil Nadu"} · {timeAgo(s.created_date)}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badge.color}`}>
                {badge.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Scam Alerts section ─────────────────────────────────── */
function ScamAlertsSection({ scams }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">Scam Alerts</span>
        </div>
        <Link to="/scams" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {scams.slice(0, 3).map((scam) => (
          <Link key={scam.id} to="/scams" className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                {scam.title || scam.title_en || "Scam Alert"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {scam.district_name || "Tamil Nadu"} · {timeAgo(scam.created_date)}
              </p>
            </div>
          </Link>
        ))}
        {scams.length === 0 && (
          <p className="px-5 py-4 text-xs text-slate-400 text-center">No active scam alerts.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Emergency Help section ──────────────────────────────── */
function EmergencySection({ emergencies }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">Emergency Help</span>
        </div>
        <Link to="/help" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {emergencies.slice(0, 3).map((em) => (
          <Link key={em.id} to="/help" className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">
                {em.title || em.title_en || "Emergency Request"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {em.district_name || "Tamil Nadu"} · {timeAgo(em.created_date)}
              </p>
            </div>
            {em.emergency_type === "blood" || em.blood_group ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300 flex-shrink-0">Urgent</span>
            ) : null}
          </Link>
        ))}
        {emergencies.length === 0 && (
          <p className="px-5 py-4 text-xs text-slate-400 text-center">No active emergencies.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Community Questions section ─────────────────────────── */
function QuestionsSection({ questions }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm">Community Questions</span>
        </div>
        <Link to="/ask" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {questions.slice(0, 3).map((q) => (
          <Link key={q.id} to={`/question/${q.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 flex items-center justify-center flex-shrink-0">
              <HelpCircle className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                {q.title || q.content_en || "Community Question"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {q.district_name || "Tamil Nadu"}
                {q.answer_count != null && ` · ${q.answer_count} ${q.answer_count === 1 ? "reply" : "replies"}`}
              </p>
            </div>
          </Link>
        ))}
        {questions.length === 0 && (
          <p className="px-5 py-4 text-xs text-slate-400 text-center">No questions yet.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Right Sidebar: TN Pulse Summary ─────────────────────── */
function PulseSummary({ situations, emergencies, scams, discussions }) {
  const stats = [
    { icon: <Wifi className="w-5 h-5 text-blue-500" />, count: situations.length, label: "Live Situations" },
    { icon: <AlertTriangle className="w-5 h-5 text-orange-500" />, count: emergencies.length, label: "Emergency Help" },
    { icon: <ShieldAlert className="w-5 h-5 text-yellow-500" />, count: scams.length, label: "Scam Alerts" },
    { icon: <Users className="w-5 h-5 text-green-500" />, count: discussions, label: "Discussions" },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-900 dark:text-white text-sm">TN Pulse Summary</span>
        <span className="text-[10px] text-slate-400">Updated 2 mins ago</span>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-1">
        {stats.map((st, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-1">
            {st.icon}
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">{st.count}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{st.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Right Sidebar: Trending Topics ──────────────────────── */
function TrendingTopics({ posts }) {
  const hashCounts = useMemo(() => {
    const map = {};
    posts.forEach((p) => {
      const tags = p.tags || [];
      tags.forEach((t) => {
        const key = t.replace(/\s+/g, "");
        map[key] = (map[key] || 0) + 1;
      });
      // Also derive from category_slug
      if (p.category_slug) {
        const key = p.category_slug.replace(/-/g, "").split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
        map[key] = (map[key] || 0) + 1;
      }
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const PILL_COLORS = [
    "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/50",
    "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800/50",
    "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800/50",
    "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/50",
    "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/50",
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-900 dark:text-white text-sm">Trending Topics</span>
        <Link to="/explore" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      {hashCounts.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-2">No trending topics yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {hashCounts.map(({ tag, count }, i) => (
            <Link key={tag} to={`/explore`} className={`flex flex-col rounded-xl border px-3 py-2 min-w-[5rem] ${PILL_COLORS[i % PILL_COLORS.length]} hover:opacity-80 transition-opacity`}>
              <span className="flex items-center gap-1 text-xs font-bold">
                <Hash className="w-3 h-3" />{tag}
              </span>
              <span className="text-[10px] opacity-70 mt-0.5">{count} discussions</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Right Sidebar: Today in Tamil Nadu ──────────────────── */
function TodayInTN({ situations, emergencies, posts }) {
  const today = useMemo(() => {
    const cutoff = Date.now() - 24 * 3600_000;
    const todayPosts = posts.filter((p) => new Date(p.created_date).getTime() >= cutoff);
    const todaySituations = situations.filter((s) => new Date(s.created_date).getTime() >= cutoff);
    const todayEmergencies = emergencies.filter((e) => new Date(e.created_date).getTime() >= cutoff);
    const resolved = todayPosts.filter((p) => p.civic_status === "citizen_verified_fixed" || p.civic_status === "resolved");
    const powerCuts = todaySituations.filter((s) => s.situation_type === "eb_shutdown");
    const waterIssues = todaySituations.filter((s) => s.situation_type === "water_shortage");

    return [
      { icon: <Zap className="w-4 h-4 text-yellow-500" />, count: powerCuts.length, label: "Areas reported power cuts", link: "/situations" },
      { icon: <AlertTriangle className="w-4 h-4 text-blue-500" />, count: waterIssues.length, label: "Areas facing water issues", link: "/situations" },
      { icon: <AlertTriangle className="w-4 h-4 text-orange-500" />, count: todayEmergencies.length, label: "Emergency help requests", link: "/help" },
      { icon: <Users className="w-4 h-4 text-purple-500" />, count: todayPosts.length, label: "Community discussions", link: "/explore" },
      { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, count: resolved.length, label: "Issues resolved today", link: "/explore" },
    ];
  }, [situations, emergencies, posts]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold text-slate-900 dark:text-white text-sm">Today in Tamil Nadu</span>
        <Link to="/explore" className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
          View full report <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {today.map((item, i) => (
          <Link key={i} to={item.link} className="flex items-center gap-3 py-2.5 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
              {item.icon}
            </div>
            <div className="flex-1">
              <span className="text-sm font-bold text-slate-800 dark:text-white">{item.count}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{item.label}</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ─── Main TnPulseTab ──────────────────────────────────────── */
export default function TnPulseTab() {

  const { data: situations = [], isLoading: l1 } = useQuery({
    queryKey: ["pulse-situations"],
    queryFn: () => getActiveSituations(20),
    staleTime: 60_000,
  });
  const { data: emergencies = [], isLoading: l2 } = useQuery({
    queryKey: ["pulse-emergencies"],
    queryFn: () => getActiveEmergencies(20),
    staleTime: 60_000,
  });
  const { data: scams = [], isLoading: l3 } = useQuery({
    queryKey: ["pulse-scams"],
    queryFn: () => getActiveScams(20),
    staleTime: 60_000,
  });
  const { data: questions = [], isLoading: l4 } = useQuery({
    queryKey: ["pulse-questions"],
    queryFn: () => getQuestions(20),
    staleTime: 60_000,
  });
  const { data: posts = [], isLoading: l5 } = useQuery({
    queryKey: ["pulse-all-posts"],
    queryFn: () => getActivePosts(50),
    staleTime: 60_000,
  });

  const isLoading = l1 || l2 || l3 || l4 || l5;

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-40 w-full" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        </div>
        <div className="lg:w-72 space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── Left / Main ── */}
      <div className="flex-1 space-y-4 min-w-0">
        {/* Community Wins */}
        <CommunityWinsSection posts={posts} />

        {/* Bottom 3-col row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScamAlertsSection scams={scams} />
          <EmergencySection emergencies={emergencies} />
          <QuestionsSection questions={questions} />
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="lg:w-72 space-y-4 flex-shrink-0">
        {/* Live Situations */}
        <LiveSituationsSection situations={situations} />

        {/* Pulse Summary */}
        <PulseSummary
          situations={situations}
          emergencies={emergencies}
          scams={scams}
          discussions={posts.filter((p) => p.post_type === "discussion").length}
        />

        {/* Trending Topics */}
        <TrendingTopics posts={posts} />

        {/* Today in Tamil Nadu */}
        <TodayInTN situations={situations} emergencies={emergencies} posts={posts} />
      </div>
    </div>
  );
}