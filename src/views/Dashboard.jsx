import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, MapPin, MessageSquare, ThumbsUp, AlertTriangle, Star, Flame, ArrowRight, Users, FileText, CheckCircle, Clock, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getPublicDashboard } from "@/services/analytics";
import { getTrendingPosts, getTrendingDistricts, getTrendingCategories } from "@/services/trending";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import DashboardStatCard from "@/components/dashboard/DashboardStatCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import TrendingDistrictRow from "@/components/dashboard/TrendingDistrictRow";
import { CATEGORIES } from "@/lib/categories";
import { usePageMeta } from "@/hooks/usePageMeta";
import { base44 } from "@/api/base44Client";
import CivicReceiptCard from "@/components/civic/CivicReceiptCard";

export default function Dashboard() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  usePageMeta({
    title: "Tamil Nadu Public Dashboard | VizhiTN",
    description: "Live transparency insights, trending posts, active districts and community statistics from across Tamil Nadu.",
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["public-dashboard"],
    queryFn: getPublicDashboard,
    staleTime: 120_000,
  });

  const { data: trendingPosts = [], isLoading: trendingLoading } = useQuery({
    queryKey: ["trending-posts"],
    queryFn: () => getTrendingPosts(6),
    staleTime: 120_000,
  });

  const { data: trendingDistricts = [] } = useQuery({
    queryKey: ["trending-districts"],
    queryFn: getTrendingDistricts,
    staleTime: 120_000,
  });

  const { data: trendingCategories = [] } = useQuery({
    queryKey: ["trending-categories"],
    queryFn: getTrendingCategories,
    staleTime: 120_000,
  });

  const { data: civicReceipts = [] } = useQuery({
    queryKey: ["civic-dashboard"],
    queryFn: async () => {
      const items = await base44.entities.Post.filter({ post_type: "complaint", status: "active" }, "-created_date", 60);
      return items.filter(p => p.moderation_status !== "hidden" && p.is_publicly_visible !== false && p.civic_status !== "duplicate_invalid");
    },
    staleTime: 120_000,
  });

  const civicStats = {
    total: civicReceipts.length,
    verified: civicReceipts.filter(p => p.civic_status === "community_verified").length,
    needsComplaint: civicReceipts.filter(p => p.civic_status === "complaint_needed").length,
    followup: civicReceipts.filter(p => p.civic_status === "under_followup").length,
    claimedFixed: civicReceipts.filter(p => p.civic_status === "claimed_fixed").length,
    fixed: civicReceipts.filter(p => p.civic_status === "citizen_verified_fixed").length,
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {T("Tamil Nadu Public Dashboard", "தமிழ்நாடு பொது டாஷ்போர்டு")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {T("Live transparency insights from across Tamil Nadu", "தமிழ்நாடு முழுவதும் நேரடி வெளிப்படைத்தன்மை நுண்ணறிவு")}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
      >
        <DashboardStatCard icon={BarChart2} label={T("Total Posts", "மொத்த பதிவுகள்")} value={stats?.totalPosts} color="blue" loading={statsLoading} />
        <DashboardStatCard icon={MapPin} label={T("Active Districts", "செயலில் மாவட்டங்கள்")} value={stats?.activeDistricts} color="green" loading={statsLoading} />
        <DashboardStatCard icon={AlertTriangle} label={T("Complaints", "புகார்கள்")} value={stats?.complaints} color="red" loading={statsLoading} />
        <DashboardStatCard icon={Star} label={T("Appreciations", "பாராட்டுகள்")} value={stats?.appreciations} color="yellow" loading={statsLoading} />
        <DashboardStatCard icon={ThumbsUp} label={T("Total Upvotes", "மொத்த வாக்குகள்")} value={stats?.totalUpvotes} color="purple" loading={statsLoading} />
        <DashboardStatCard icon={MessageSquare} label={T("Comments", "கருத்துகள்")} value={stats?.totalComments} color="cyan" loading={statsLoading} />
      </motion.div>

      {/* Positive Ratio Banner */}
      {stats && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {T("Community Sentiment", "சமுதாய உணர்வு")}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.positiveRatio}%` }} />
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{stats.positiveRatio}% {T("Positive", "நேர்மறை")}</span>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />{T("Appreciation", "பாராட்டு")}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />{T("Complaint", "புகார்")}</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Activity Chart */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              {T("Activity — Last 7 Days", "செயல்பாடு — கடைசி 7 நாட்கள்")}
            </h2>
            {stats?.activityLast7Days ? (
              <ActivityChart data={stats.activityLast7Days} />
            ) : (
              <div className="h-32 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />
            )}
          </div>
        </motion.div>

        {/* Trending Categories */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp}>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 h-full">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              {T("Trending Categories", "டிரெண்டிங் வகைகள்")}
            </h2>
            <div className="space-y-2">
              {trendingCategories.slice(0, 6).map((cat, i) => {
                const catInfo = CATEGORIES.find((c) => c.slug === cat.slug);
                const max = trendingCategories[0]?.engagement || 1;
                return (
                  <Link key={cat.slug} to={`/category/${cat.slug}`} className="flex items-center gap-2 group">
                    <span className="text-sm w-5">{catInfo?.icon || "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">{catInfo ? (lang === "ta" ? catInfo.name_ta : catInfo.name_en) : cat.name}</span>
                        <span className="text-xs text-slate-400 ml-2">{cat.postCount}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${(cat.engagement / max) * 100}%` }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trending Districts */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              {T("Most Active Districts", "மிகவும் செயலில் உள்ள மாவட்டங்கள்")}
            </h2>
            <Link to="/districts" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              {T("All", "அனைத்தும்")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {trendingDistricts.slice(0, 8).map((d, i) => (
              <TrendingDistrictRow key={d.slug} district={d} rank={i + 1} max={trendingDistricts[0]?.engagement || 1} lang={lang} />
            ))}
            {trendingDistricts.length === 0 && (
              <div className="space-y-2">
                {[1,2,3,4].map(i => <div key={i} className="h-8 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />)}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Civic Receipts Dashboard */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                  {T("VizhiTN Civic Receipts", "VizhiTN குடிமை ரசீதுகள்")}
                </h2>
                <p className="text-xs text-slate-500">{T("Report. Prove. Resolve.", "புகார். நிரூபி. தீர்.")}</p>
              </div>
            </div>
            <Link to="/explore" className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              {T("All issues", "அனைத்து சிக்கல்கள்")} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
            {[
              { label: T("Total Issues", "மொத்த சிக்கல்கள்"), value: civicStats.total, icon: FileText, color: "blue" },
              { label: T("Community Verified", "சமுதாயம் சரிபார்த்தது"), value: civicStats.verified, icon: Users, color: "indigo" },
              { label: T("Needs Complaint", "புகார் தேவை"), value: civicStats.needsComplaint, icon: AlertTriangle, color: "orange" },
              { label: T("Under Follow-up", "தொடர் கண்காணிப்பு"), value: civicStats.followup, icon: Clock, color: "yellow" },
              { label: T("Claimed Fixed", "சரி செய்யப்பட்டதாக"), value: civicStats.claimedFixed, icon: Shield, color: "teal" },
              { label: T("Citizen Verified ✓", "குடிமகன் சரிபார்த்தது ✓"), value: civicStats.fixed, icon: CheckCircle, color: "green" },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs text-slate-500 leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {civicReceipts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {civicReceipts.slice(0, 3).map(p => <CivicReceiptCard key={p.id} post={p} />)}
            </div>
          )}

          <p className="text-xs text-slate-400 mt-3 italic">
            {T("VizhiTN helps citizens document, verify, and track local issues. VizhiTN is not a government office.", "VizhiTN குடிமக்கள் உள்ளூர் சிக்கல்களை ஆவணப்படுத்த, கண்காணிக்க உதவுகிறது. VizhiTN ஒரு அரசு அலுவலகம் அல்ல.")}
          </p>
        </div>
      </motion.div>

      {/* Trending Posts */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            {T("Trending Now", "இப்போது டிரெண்டிங்")}
          </h2>
          <Link to="/explore" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            {T("View all", "அனைத்தும்")} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {trendingLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <PostSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingPosts.map((post) => <PostCard key={post.id} post={post} />)}
          </div>
        )}
      </motion.div>
    </div>
  );
}