import React, { useState, useCallback, useRef, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Search as SearchIcon, X, Clock, MapPin, ArrowRight,
  FileText, SlidersHorizontal, AlertTriangle, Briefcase,
  Home as HomeIcon, Building2, Users, RefreshCw, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import {
  searchPosts, searchScams, searchJobs, searchStay, searchListings, searchDiscussions,
  getSearchSuggestions, addRecentSearch, getRecentSearches, clearRecentSearches
} from "@/services/search";
import PostCard from "@/components/posts/PostCard";
import PostSkeleton from "@/components/posts/PostSkeleton";
import { DISTRICTS } from "@/lib/districts";
import { CATEGORIES } from "@/lib/categories";
import { usePageMeta } from "@/hooks/usePageMeta";
import SearchResultsSections from "@/components/search/SearchResultsSections";

const CONTENT_TYPES = [
  { value: "all", en: "All", ta: "அனைத்தும்" },
  { value: "civic", en: "Civic Receipts", ta: "குடிமை ரசீதுகள்" },
  { value: "posts", en: "Community Posts", ta: "சமுதாய பதிவுகள்" },
  { value: "scam", en: "Scam Alerts", ta: "மோசடி" },
  { value: "job", en: "Jobs", ta: "வேலைகள்" },
  { value: "stay", en: "Stay", ta: "தங்குமிடம்" },
  { value: "listing", en: "Listings", ta: "பட்டியல்" },
  { value: "discussion", en: "Discussions", ta: "விவாதங்கள்" },
];

const CIVIC_STATUS_OPTIONS = [
  { value: "all", en: "Any Status", ta: "எந்த நிலையும்" },
  { value: "civic_only", en: "Civic Receipts Only", ta: "குடிமை ரசீதுகள் மட்டும்" },
  { value: "has_complaint", en: "Has Complaint ID", ta: "புகார் ID உள்ளது" },
  { value: "no_complaint", en: "Complaint Needed", ta: "புகார் தேவை" },
  { value: "community_verified", en: "Community Verified", ta: "சமுதாயம் சரிபார்த்தது" },
  { value: "under_followup", en: "Under Follow-up", ta: "பின்தொடர்ச்சியில்" },
  { value: "unresolved_escalated", en: "Escalated", ta: "நடவடிக்கை எடுக்கப்பட்டது" },
  { value: "citizen_verified_fixed", en: "Citizen Verified Fixed", ta: "குடிமகன் சரிபார்த்த தீர்வு" },
];

const SORT_OPTIONS = [
  { value: "-created_date", en: "Newest", ta: "புதியவை" },
  { value: "-updated_date", en: "Recently Updated", ta: "சமீபத்தில் புதுப்பிக்கப்பட்டவை" },
  { value: "-upvotes", en: "Most Voted", ta: "அதிக வாக்குகள்" },
  { value: "-comment_count", en: "Most Discussed", ta: "அதிக விவாதம்" },
  { value: "-verification_count", en: "Most Verified", ta: "அதிகம் சரிபார்க்கப்பட்டவை" },
];

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Search() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [searchParams, setSearchParams] = useSearchParams();

  usePageMeta({
    title: "Search | NammaTN",
    description: "Search Civic Receipts, issues, scams, jobs, stay listings, and community posts across Tamil Nadu.",
  });

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const debouncedQuery = useDebounce(query, 400);
  const [contentType, setContentType] = useState("all");
  const [districtFilter, setDistrictFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [civicStatus, setCivicStatus] = useState("all");
  const [sort, setSort] = useState("-created_date");
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches());
  const inputRef = useRef(null);

  const isActive = debouncedQuery.trim().length >= 2 || contentType !== "all" || districtFilter !== "all" || categoryFilter !== "all" || civicStatus !== "all";

  const handleSearch = useCallback((term) => {
    setQuery(term);
    setSearchParams(term ? { q: term } : {});
  }, [setSearchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) { addRecentSearch(query.trim()); setRecentSearches(getRecentSearches()); }
  };

  const clearAll = () => {
    setQuery(""); setContentType("all"); setDistrictFilter("all");
    setCategoryFilter("all"); setCivicStatus("all"); setSort("-created_date");
    setSearchParams({});
    inputRef.current?.focus();
  };

  // Determine post_type to pass based on contentType
  const postTypeFilter = contentType === "civic" ? "complaint" : (contentType === "posts" ? "all" : "all");
  const civicStatusFilter = contentType === "civic" ? (civicStatus === "all" ? "civic_only" : civicStatus) : civicStatus;
  const skipPostSearch = ["scam", "job", "stay", "listing", "discussion"].includes(contentType);

  const { data: postData, isLoading: postsLoading } = useQuery({
    queryKey: ["search-posts", debouncedQuery, postTypeFilter, districtFilter, categoryFilter, civicStatusFilter, sort],
    queryFn: () => searchPosts(debouncedQuery, { type: postTypeFilter, district: districtFilter, category: categoryFilter, civicStatus: civicStatusFilter, sort }),
    enabled: isActive && !skipPostSearch,
    staleTime: 30_000,
    placeholderData: { civicMatch: null, results: [] },
  });

  const showOtherTypes = contentType === "all" && debouncedQuery.trim().length >= 2;

  const { data: scams = [], isLoading: scamsLoading } = useQuery({
    queryKey: ["search-scams", debouncedQuery],
    queryFn: () => searchScams(debouncedQuery),
    enabled: (showOtherTypes || contentType === "scam") && debouncedQuery.trim().length >= 2,
    staleTime: 60_000,
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery({
    queryKey: ["search-jobs", debouncedQuery],
    queryFn: () => searchJobs(debouncedQuery),
    enabled: (showOtherTypes || contentType === "job") && debouncedQuery.trim().length >= 2,
    staleTime: 60_000,
  });

  const { data: stay = [], isLoading: stayLoading } = useQuery({
    queryKey: ["search-stay", debouncedQuery],
    queryFn: () => searchStay(debouncedQuery),
    enabled: (showOtherTypes || contentType === "stay") && debouncedQuery.trim().length >= 2,
    staleTime: 60_000,
  });

  const { data: listings = [], isLoading: listingsLoading } = useQuery({
    queryKey: ["search-listings", debouncedQuery],
    queryFn: () => searchListings(debouncedQuery),
    enabled: (showOtherTypes || contentType === "listing") && debouncedQuery.trim().length >= 2,
    staleTime: 60_000,
  });

  const { data: discussions = [], isLoading: discussionsLoading } = useQuery({
    queryKey: ["search-discussions", debouncedQuery],
    queryFn: () => searchDiscussions(debouncedQuery),
    enabled: (showOtherTypes || contentType === "discussion") && debouncedQuery.trim().length >= 2,
    staleTime: 60_000,
  });

  const civicMatch = postData?.civicMatch || null;
  const postResults = postData?.results || [];
  const suggestions = getSearchSuggestions(query);
  const isLoading = postsLoading || scamsLoading || jobsLoading || stayLoading || listingsLoading || discussionsLoading;
  const activeFilterCount = [contentType !== "all", districtFilter !== "all", categoryFilter !== "all", civicStatus !== "all"].filter(Boolean).length;

  const showScams = (contentType === "all" || contentType === "scam") && scams.length > 0;
  const showJobs = (contentType === "all" || contentType === "job") && jobs.length > 0;
  const showStay = (contentType === "all" || contentType === "stay") && stay.length > 0;
  const showListings = (contentType === "all" || contentType === "listing") && listings.length > 0;
  const showDiscussions = (contentType === "all" || contentType === "discussion") && discussions.length > 0;

  const totalCount = postResults.length +
    (showScams ? scams.length : 0) + (showJobs ? jobs.length : 0) +
    (showStay ? stay.length : 0) + (showListings ? listings.length : 0) +
    (showDiscussions ? discussions.length : 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        {T("Search NammaTN", "NammaTN தேடுக")}
      </h1>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="relative mb-4">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={T("Search issues, TN-000001, district, area...", "சிக்கல்கள், TN-000001, மாவட்டம், பகுதி தேடுங்கள்...")}
          className="w-full pl-12 pr-24 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button type="button" onClick={() => handleSearch("")} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              showFilters || activeFilterCount > 0 ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
            }`}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {activeFilterCount > 0 && <span className="font-bold ml-0.5">{activeFilterCount}</span>}
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {query.length >= 1 && suggestions.length > 0 && !isActive && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden mb-4 shadow-lg">
            {suggestions.map((s, i) => (
              <Link key={i} to={s.type === "district" ? `/district/${s.slug}` : `/category/${s.slug}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b last:border-0 border-slate-100 dark:border-slate-700">
                {s.type === "district" ? <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" /> : <span className="text-base">{s.icon}</span>}
                <span className="text-sm text-slate-700 dark:text-slate-300">{s.label}</span>
                <span className="text-xs text-slate-400 ml-auto capitalize">{s.type}</span>
                <ArrowRight className="w-3 h-3 text-slate-300" />
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content type chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {CONTENT_TYPES.map((t) => (
          <button key={t.value} onClick={() => setContentType(t.value)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              contentType === t.value ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300"
            }`}>
            {T(t.en, t.ta)}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 mb-4 overflow-hidden">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: T("District", "மாவட்டம்"), value: districtFilter, onChange: setDistrictFilter, opts: [{ value: "all", label: T("All Districts", "அனைத்து மாவட்டங்கள்") }, ...DISTRICTS.map((d) => ({ value: d.slug, label: T(d.name_en, d.name_ta) }))] },
                { label: T("Category", "வகை"), value: categoryFilter, onChange: setCategoryFilter, opts: [{ value: "all", label: T("All Categories", "அனைத்து வகைகள்") }, ...CATEGORIES.map((c) => ({ value: c.slug, label: `${c.icon} ${T(c.name_en, c.name_ta)}` }))] },
                { label: T("Civic Status", "குடிமை நிலை"), value: civicStatus, onChange: setCivicStatus, opts: CIVIC_STATUS_OPTIONS.map((o) => ({ value: o.value, label: T(o.en, o.ta) })) },
                { label: T("Sort", "வரிசை"), value: sort, onChange: setSort, opts: SORT_OPTIONS.map((o) => ({ value: o.value, label: T(o.en, o.ta) })) },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                  <select value={f.value} onChange={(e) => f.onChange(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none">
                    {f.opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearAll} className="mt-3 flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                <X className="w-3 h-3" /> {T("Clear all filters", "அனைத்து வடிகட்டிகளையும் அழி")}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent searches */}
      {!isActive && recentSearches.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{T("Recent Searches", "சமீபத்திய தேடல்கள்")}</p>
            <button onClick={() => { clearRecentSearches(); setRecentSearches([]); }} className="text-xs text-blue-500 hover:underline">{T("Clear", "அழி")}</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((s) => (
              <button key={s} onClick={() => handleSearch(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Clock className="w-3 h-3" />{s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {isActive && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {isLoading
                ? <span className="flex items-center gap-1.5"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> {T("Searching...", "தேடுகிறது...")}</span>
                : `${totalCount} ${T("results", "முடிவுகள்")}`
              }
            </p>
            <button onClick={clearAll} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
              <X className="w-3 h-3" /> {T("Clear", "அழி")}
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => <PostSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Exact civic receipt match */}
              {civicMatch && (
                <div>
                  <div className="mb-2">
                    <span className="text-xs font-bold text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-300 px-2.5 py-1 rounded-full">
                      ✓ {T("Exact Civic Receipt Match", "சரியான குடிமை ரசீது பொருத்தம்")}
                    </span>
                  </div>
                  <PostCard post={civicMatch} />
                </div>
              )}

              {/* Post results */}
              {!skipPostSearch && postResults.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                    📋 {T("Posts & Civic Receipts", "பதிவுகள் & குடிமை ரசீதுகள்")} ({postResults.length})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {postResults.slice(0, 20).map((post) => <PostCard key={post.id} post={post} />)}
                  </div>
                </div>
              )}

              {/* Other content type results */}
              <SearchResultsSections
                scams={showScams ? scams : []}
                jobs={showJobs ? jobs : []}
                stay={showStay ? stay : []}
                listings={showListings ? listings : []}
                discussions={showDiscussions ? discussions : []}
                T={T}
              />

              {/* Empty state */}
              {totalCount === 0 && !civicMatch && (
                <div className="text-center py-16">
                  <SearchIcon className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">{T("No results found", "முடிவுகள் இல்லை")}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{T("Try another keyword, district, area, or category.", "வேறு சொல், மாவட்டம், பகுதி அல்லது வகையை முயற்சிக்கவும்.")}</p>
                  <button onClick={clearAll} className="mt-4 text-xs text-blue-600 underline">{T("Clear filters", "வடிகட்டிகளை அழி")}</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Idle: browse by district */}
      {!isActive && recentSearches.length === 0 && (
        <div className="mt-6">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">{T("Browse by District", "மாவட்டம் வாரியாக")}</p>
          <div className="flex flex-wrap gap-2">
            {DISTRICTS.slice(0, 14).map((d) => (
              <Link key={d.slug} to={`/district/${d.slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors">
                <MapPin className="w-3 h-3" />{T(d.name_en, d.name_ta)}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}