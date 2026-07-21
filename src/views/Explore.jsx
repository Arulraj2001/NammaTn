"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "@/lib/router-compat";
import { Search, SlidersHorizontal, X, FileText, RefreshCw, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { DISTRICTS } from "@/lib/districts";
import { CATEGORIES } from "@/lib/categories";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import { getActivePosts } from "@/services/posts";
import AdSlot from "@/components/ads/AdSlot";
import { usePageMeta } from "@/hooks/usePageMeta";

const TYPES = [
  { value: "all", en: "All Types", ta: "அனைத்து வகைகளும்" },
  { value: "civic", en: "Civic Receipts", ta: "குடிமை ரசீதுகள்" },
  { value: "complaint", en: "Complaints", ta: "புகார்கள்" },
  { value: "appreciation", en: "Appreciation", ta: "பாராட்டு" },
  { value: "local_update", en: "Local Updates", ta: "உள்ளூர் புதுப்பிப்புகள்" },
  { value: "alert", en: "Alerts", ta: "எச்சரிக்கைகள்" },
  { value: "discussion", en: "Discussion", ta: "விவாதம்" },
];

const CIVIC_STATUS_FILTERS = [
  { value: "all", en: "All Statuses", ta: "அனைத்து நிலைகளும்" },
  { value: "community_verified", en: "Community Verified", ta: "சமுதாயம் சரிபார்த்தது" },
  { value: "complaint_filed", en: "Complaint Filed", ta: "புகார் தாக்கல்" },
  { value: "under_followup", en: "Under Follow-up", ta: "பின்தொடர்ச்சியில்" },
  { value: "unresolved_escalated", en: "Escalated", ta: "நடவடிக்கை எடுக்கப்பட்டது" },
  { value: "citizen_verified_fixed", en: "Citizen Verified Fixed", ta: "குடிமகன் சரிபார்த்த தீர்வு" },
];

const SORT_OPTIONS = [
  { value: "-created_date", en: "Newest First", ta: "புதியவை முதலில்" },
  { value: "-updated_date", en: "Recently Updated", ta: "சமீபத்தில் புதுப்பிக்கப்பட்டவை" },
  { value: "-upvotes", en: "Most Voted", ta: "அதிக வாக்குகள்" },
  { value: "-comment_count", en: "Most Discussed", ta: "அதிக விவாதம்" },
  { value: "-verification_count", en: "Most Verified", ta: "அதிகம் சரிபார்க்கப்பட்டவை" },
];

const PAGE_SIZE = 18;

const getNextCursor = (lastPage) => {
  if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
  return lastPage[lastPage.length - 1]?.created_date;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export default function Explore({ initialPosts = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [searchParams, setSearchParams] = useSearchParams();
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const nearbyParam = searchParams.get("nearby") === "true";

  usePageMeta({
    title: "Explore | VizhiTN",
    description: "Discover Civic Receipts, local alerts, community posts, area updates, and useful Tamil Nadu features.",
  });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");
  const [districtFilter, setDistrictFilter] = useState(searchParams.get("district") || "all");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "all");
  const [civicStatusFilter, setCivicStatusFilter] = useState("all");
  const [sort, setSort] = useState("-created_date");
  const [showFilters, setShowFilters] = useState(false);
  const loadMoreRef = useRef(null);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", "explore"],
    queryFn: ({ pageParam = null }) => getActivePosts({ limit: PAGE_SIZE, cursor: pageParam }),
    initialPageParam: null,
    initialData: { pages: [initialPosts], pageParams: [null] },
    getNextPageParam: getNextCursor,
    staleTime: 60_000,
  });

  const posts = useMemo(() => data?.pages.flatMap((page) => page) || [], [data]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || !hasNextPage) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const filtered = useMemo(() => {
    const userLat = latParam ? parseFloat(latParam) : null;
    const userLng = lngParam ? parseFloat(lngParam) : null;

    return posts.filter((p) => {
      // Exclude duplicate_invalid from public feed
      if (p.civic_status === "duplicate_invalid") return false;

      // Type filter: "civic" means has civic_receipt_id
      if (typeFilter === "civic") { if (!p.civic_receipt_id) return false; }
      else if (typeFilter !== "all" && p.post_type !== typeFilter) return false;

      const districtMatch = districtFilter === "all" || p.district_slug === districtFilter;
      const catMatch = categoryFilter === "all" || p.category_slug === categoryFilter;

      // Civic status filter
      let civicStatusMatch = true;
      if (civicStatusFilter !== "all") {
        civicStatusMatch = p.civic_status === civicStatusFilter;
      }

      // Nearby filter (60km radius)
      if (nearbyParam && userLat !== null && userLng !== null) {
        if (!p.latitude || !p.longitude) return false;
        const dist = calculateDistance(
          userLat,
          userLng,
          parseFloat(p.latitude),
          parseFloat(p.longitude)
        );
        if (dist > 60) return false;
      }

      const searchMatch = search === "" ||
        (p.title_en || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.title_ta || "").includes(search) ||
        (p.content_en || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.civic_receipt_id || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.district_name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.area_name || "").toLowerCase().includes(search.toLowerCase());

      return districtMatch && catMatch && civicStatusMatch && searchMatch;
    }).sort((a, b) => {
      if (sort === "-upvotes") return (b.upvotes || 0) - (a.upvotes || 0);
      if (sort === "-comment_count") return (b.comment_count || 0) - (a.comment_count || 0);
      if (sort === "-verification_count") return (b.verification_count || 0) - (a.verification_count || 0);
      if (sort === "-updated_date") return new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date);
      return new Date(b.created_date) - new Date(a.created_date);
    });
  }, [posts, typeFilter, districtFilter, categoryFilter, civicStatusFilter, search, sort, latParam, lngParam, nearbyParam]);

  const activeFilterCount = [
    typeFilter !== "all",
    districtFilter !== "all",
    categoryFilter !== "all",
    civicStatusFilter !== "all",
    nearbyParam
  ].filter(Boolean).length;

  const clearFilters = useCallback(() => {
    setTypeFilter("all"); setDistrictFilter("all"); setCategoryFilter("all");
    setCivicStatusFilter("all"); setSort("-created_date"); setSearch("");
    setSearchParams({});
  }, [setSearchParams]);

  const handleTypeChange = (val) => { setTypeFilter(val); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
          {T("Explore VizhiTN", "VizhiTN ஆராய்க")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {T("Discover Civic Receipts, local alerts, community posts, and updates from Tamil Nadu.", "தமிழ்நாட்டிலிருந்து குடிமை ரசீதுகள், உள்ளூர் எச்சரிக்கைகள் மற்றும் சமுதாய பதிவுகளை கண்டுபிடிக்கவும்.")}
        </p>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={T("Search posts, civic receipts...", "பதிவுகள், குடிமை ரசீதுகள் தேடுங்கள்...")}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors flex-shrink-0 ${
            showFilters || activeFilterCount > 0 ? "bg-blue-600 text-white border-blue-600" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          }`}>
          <SlidersHorizontal className="w-4 h-4" />
          {T("Filters", "வடிகட்டிகள்")}
          {activeFilterCount > 0 && <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">{activeFilterCount}</span>}
        </button>
      </div>

      {/* Type chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {TYPES.map((t) => (
          <button key={t.value} onClick={() => handleTypeChange(t.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              typeFilter === t.value ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}>
            {t.value === "civic" && <FileText className="w-3.5 h-3.5 inline mr-1" />}
            {T(t.en, t.ta)}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4 overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: T("Sort by", "வரிசைப்படுத்து"), value: sort, onChange: setSort, opts: SORT_OPTIONS.map((o) => ({ value: o.value, label: T(o.en, o.ta) })) },
                { label: T("District", "மாவட்டம்"), value: districtFilter, onChange: setDistrictFilter, opts: [{ value: "all", label: T("All Districts", "அனைத்து மாவட்டங்கள்") }, ...DISTRICTS.map((d) => ({ value: d.slug, label: T(d.name_en, d.name_ta) }))] },
                { label: T("Category", "வகை"), value: categoryFilter, onChange: setCategoryFilter, opts: [{ value: "all", label: T("All Categories", "அனைத்து வகைகளும்") }, ...CATEGORIES.map((c) => ({ value: c.slug, label: `${c.icon} ${T(c.name_en, c.name_ta)}` }))] },
                { label: T("Civic Status", "குடிமை நிலை"), value: civicStatusFilter, onChange: setCivicStatusFilter, opts: CIVIC_STATUS_FILTERS.map((o) => ({ value: o.value, label: T(o.en, o.ta) })) },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">{f.label}</label>
                  <select value={f.value} onChange={(e) => f.onChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white">
                    {f.opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nearby Location Filter Info */}
      {nearbyParam && latParam && lngParam && (
        <div className="flex items-center gap-2 mb-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-800/50 self-start w-fit animate-in fade-in slide-in-from-top-1 duration-200">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          <span>{T("Showing updates within 60km of your location", "உங்கள் இருப்பிடத்திலிருந்து 60 கி.மீ எல்லைக்குள் உள்ள தகவல்கள்")}</span>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.delete("lat");
              params.delete("lng");
              params.delete("nearby");
              setSearchParams(params);
            }}
            className="ml-1 text-blue-500 hover:text-blue-700 dark:hover:text-blue-100 transition-colors"
            title={T("Clear location filter", "இருப்பிட வடிகட்டியை அழி")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Count + clear */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isLoading
            ? <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> {T("Loading...", "ஏற்றுகிறது...")}</span>
            : `${filtered.length} ${T("posts found", "பதிவுகள் கண்டுபிடிக்கப்பட்டன")}`
          }
        </p>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
            <X className="w-3 h-3" /> {T("Clear filters", "வடிகட்டிகளை அழி")}
          </button>
        )}
      </div>

      {/* Posts grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => <PostSkeleton key={i} />)}
        </div>
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-slate-500 dark:text-slate-400 mb-4">{T("Could not load content. Please try again.", "உள்ளடக்கத்தை ஏற்ற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.")}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium">{T("Retry", "மீண்டும் முயற்சி")}</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">{T("No public content yet", "இன்னும் பொது உள்ளடக்கம் இல்லை")}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{T("Create the first Civic Receipt or check another area.", "முதல் குடிமை ரசீதை உருவாக்கவும் அல்லது வேறு பகுதியை சரிபார்க்கவும்.")}</p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="mr-3 text-xs text-blue-600 underline">{T("Clear filters", "வடிகட்டிகளை அழி")}</button>
          )}
          <Link to="/create" className="inline-flex items-center gap-1 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
            {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}
          </Link>
          <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
          {isFetchingNextPage && (
            <div className="flex justify-center mt-4">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((post, i) => (
              <div key={post.id} className="contents">
                <PostCard post={post} />
                {i === 8 && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <AdSlot placement="feed" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
          {isFetchingNextPage && (
            <div className="flex justify-center mt-6">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
