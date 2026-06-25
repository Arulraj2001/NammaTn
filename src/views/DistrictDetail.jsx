import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getDistrictBySlug } from "@/lib/districts";
import { CATEGORIES } from "@/lib/categories";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import { getDistrictPosts, getDistrictCivicPosts } from "@/services/posts";
import { getDistrictStats } from "@/services/analytics";
import DistrictStatsPanel from "@/components/district/DistrictStatsPanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import AdSlot from "@/components/ads/AdSlot";
import DistrictCivicStats from "@/components/civic/DistrictCivicStats";

const POST_TYPES = [
  { value: "all", en: "All", ta: "அனைத்தும்" },
  { value: "complaint", en: "Complaints", ta: "புகார்கள்" },
  { value: "appreciation", en: "Appreciation", ta: "பாராட்டு" },
  { value: "alert", en: "Alerts", ta: "எச்சரிக்கைகள்" },
  { value: "local_update", en: "Updates", ta: "புதுப்பிப்புகள்" },
  { value: "discussion", en: "Discussion", ta: "விவாதம்" },
];

export default function DistrictDetail() {
  const { slug } = useParams();
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const district = getDistrictBySlug(slug);
  usePageMeta({
    title: district ? `${T(district.name_en, district.name_ta)} | NammaTN234` : "District | NammaTN234",
    description: district ? `Community posts, complaints, and updates from ${district.name_en}, Tamil Nadu.` : "",
  });
  const [typeFilter, setTypeFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["district-posts", slug],
    queryFn: () => getDistrictPosts(slug, 60),
    enabled: !!slug,
    staleTime: 60_000,
  });

  const { data: civicPosts = [] } = useQuery({
    queryKey: ["district-civic-posts", slug],
    queryFn: () => getDistrictCivicPosts(slug, 100),
    enabled: !!slug,
    staleTime: 60_000,
  });

  const { data: stats } = useQuery({
    queryKey: ["district-stats", slug],
    queryFn: () => getDistrictStats(slug),
    enabled: !!slug,
    staleTime: 120_000,
  });

  const filtered = posts.filter((p) => {
    const typeMatch = typeFilter === "all" || p.post_type === typeFilter;
    const catMatch = catFilter === "all" || p.category_slug === catFilter;
    return typeMatch && catMatch;
  });

  if (!district) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500 dark:text-slate-400">{T("District not found.", "மாவட்டம் கண்டுபிடிக்கப்படவில்லை.")}</p>
        <Link to="/districts" className="mt-4 inline-block text-blue-600 hover:underline">{T("← Back to Districts", "← மாவட்டங்களுக்கு திரும்பு")}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/districts" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {T("All Districts", "அனைத்து மாவட்டங்கள்")}
      </Link>

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="w-6 h-6" />
          <h1 className="text-2xl sm:text-3xl font-bold">{T(district.name_en, district.name_ta)}</h1>
        </div>
        <p className="text-blue-100 text-sm capitalize">{district.region} Tamil Nadu</p>
        <div className="flex flex-wrap gap-3 mt-4 text-sm">
          <span className="bg-white/20 rounded-xl px-3 py-1">{posts.length} {T("Posts", "பதிவுகள்")}</span>
          {civicPosts.length > 0 && <span className="bg-white/20 rounded-xl px-3 py-1">{civicPosts.length} {T("Civic Receipts", "குடிமை ரசீதுகள்")}</span>}
          <span className="bg-white/20 rounded-xl px-3 py-1 capitalize">{district.region} {T("Region", "பகுதி")}</span>
        </div>
        <Link to={`/create?district=${slug}`} className="inline-flex items-center gap-1.5 mt-4 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
          + {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}
        </Link>
      </div>

      {/* District Civic stats */}
      {civicPosts.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
          {[
            { label: T("Total Civic", "மொத்த குடிமை"), value: civicPosts.length, color: "text-slate-700 dark:text-slate-300", bg: "bg-slate-50 dark:bg-slate-800" },
            { label: T("Verified", "சரிபார்க்கப்பட்டவை"), value: civicPosts.filter((p) => (p.verification_count || 0) >= 3).length, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
            { label: T("Complaint Filed", "புகார் தாக்கல்"), value: civicPosts.filter((p) => p.official_complaint_id).length, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
            { label: T("Follow-up", "பின்தொடர்ச்சி"), value: civicPosts.filter((p) => p.civic_status === "under_followup").length, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: T("Fixed", "சரிசெய்யப்பட்டது"), value: civicPosts.filter((p) => p.civic_status === "citizen_verified_fixed").length, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
            { label: T("Escalated", "நடவடிக்கை"), value: civicPosts.filter((p) => p.civic_status === "unresolved_escalated").length, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-3 text-center`}>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <DistrictStatsPanel stats={stats} lang={lang} />
      <div className="mb-6">
        <DistrictCivicStats districtSlug={slug} districtName={T(district.name_en, district.name_ta)} />
      </div>
      <AdSlot placement="district" className="mb-4" />

      {/* Type Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {POST_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              typeFilter === t.value
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            {T(t.en, t.ta)}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        <button
          onClick={() => setCatFilter("all")}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${catFilter === "all" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}
        >
          {T("All Categories", "அனைத்து வகைகளும்")}
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            onClick={() => setCatFilter(c.slug)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${catFilter === c.slug ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"}`}
          >
            {c.icon} {T(c.name_en, c.name_ta)}
          </button>
        ))}
      </div>

      {/* Posts */}
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{filtered.length} {T("posts", "பதிவுகள்")}</p>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <PostSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-500 dark:text-slate-400 mb-4">{T("No posts yet for this filter.", "இந்த வடிகட்டிக்கு பதிவுகள் இல்லை.")}</p>
          <Link to="/create" className="px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            {T("Be the first to post", "முதலில் பதிவிடுங்கள்")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}