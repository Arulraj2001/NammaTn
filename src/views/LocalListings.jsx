import React, { useState, useMemo, useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/api/supabaseClient";
import { Search, BadgeCheck, Sparkles, Plus } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { LISTING_CATEGORIES } from "@/lib/listingCategories";
import { DISTRICTS } from "@/lib/districts";
import ListingCard from "@/components/listings/ListingCard";
import ListingSubmitModal from "@/components/listings/ListingSubmitModal";

const PAGE_SIZE = 24;

const isVisibleLocalListing = (listing) =>
  listing?.moderation_status !== "hidden" &&
  listing?.is_publicly_visible !== false &&
  (listing?.report_count || 0) < 5;

const getNextCursor = (lastPage) => {
  if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
  return lastPage[lastPage.length - 1]?.created_date;
};

const getPublicLocalListings = async ({ cursor = null, limit = PAGE_SIZE }) => {
  const page = [];
  let nextCursor = cursor;
  let exhausted = false;
  let scans = 0;
  const scanLimit = Math.max(limit * 2, limit);

  while (page.length < limit && !exhausted && scans < 5) {
    let query = supabase
      .from("local_listing")
      .select("*")
      .eq("status", "active")
      .or("moderation_status.is.null,moderation_status.neq.hidden")
      .or("is_publicly_visible.is.null,is_publicly_visible.eq.true")
      .or("report_count.is.null,report_count.lt.5")
      .order("created_date", { ascending: false })
      .limit(scanLimit);

    if (nextCursor) {
      query = query.lt("created_date", nextCursor);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = data || [];
    if (rows.length === 0) break;

    page.push(...rows.filter(isVisibleLocalListing));
    nextCursor = rows[rows.length - 1]?.created_date || nextCursor;
    exhausted = rows.length < scanLimit;
    scans += 1;
  }

  return page.slice(0, limit);
};

export default function LocalListings() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [showSubmit, setShowSubmit] = useState(false);
  const loadMoreRef = useRef(null);

  const handleOpenSubmit = () => {
    if (!isAuthenticated) {
      requireAuth(() => setShowSubmit(true), "Sign in to list your service");
      return;
    }
    setShowSubmit(true);
  };

  const {
    data,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["local-listings-public"],
    queryFn: ({ pageParam = null }) => getPublicLocalListings({ cursor: pageParam, limit: PAGE_SIZE }),
    initialPageParam: null,
    getNextPageParam: getNextCursor,
    staleTime: 60_000,
  });

  const listings = useMemo(() => data?.pages.flatMap((page) => page) || [], [data]);

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
    const q = search.toLowerCase();
    return listings.filter((l) => {
      const matchSearch = !q || l.business_name?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q) || l.area_name?.toLowerCase().includes(q);
      const matchCat = !categoryFilter || l.category === categoryFilter;
      const matchDist = !districtFilter || l.district_slug === districtFilter;
      const matchPlan = !planFilter || l.plan === planFilter;
      return matchSearch && matchCat && matchDist && matchPlan;
    });
  }, [listings, search, categoryFilter, districtFilter, planFilter]);

  const featured = filtered.filter((l) => l.plan === "district_sponsor" || l.plan === "featured");
  const regular = filtered.filter((l) => l.plan !== "district_sponsor" && l.plan !== "featured");

  const stats = {
    total: listings.length,
    verified: listings.filter((l) => l.is_verified).length,
    featured: listings.filter((l) => l.is_featured).length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <BadgeCheck className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs bg-white/20 rounded-full px-3 py-1 font-medium">
                  {T("Verified Local Services", "சரிபார்க்கப்பட்ட சேவைகள்")}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {T("Local Service Listings", "உள்ளூர் சேவை பட்டியல்")}
              </h1>
              <p className="text-blue-100 text-sm max-w-lg leading-relaxed">
                {T("Find trusted local services in your area. Verified businesses, community-recommended providers, and useful civic services — all in one place.", "உங்கள் பகுதியில் நம்பகமான சேவைகளை கண்டறியுங்கள்.")}
              </p>
              <div className="flex flex-wrap gap-3 mt-4 text-xs">
                <span className="bg-white/10 rounded-full px-3 py-1">✅ {stats.verified} {T("Verified", "சரிபார்க்கப்பட்ட")}</span>
                <span className="bg-white/10 rounded-full px-3 py-1">⭐ {stats.featured} {T("Featured", "சிறப்பு")}</span>
                <span className="bg-white/10 rounded-full px-3 py-1">📋 {stats.total} {T("Total listings", "மொத்த பட்டியல்")}</span>
              </div>
            </div>
            <button
              onClick={handleOpenSubmit}
              className="flex items-center gap-2 bg-white text-blue-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              {T("List Your Service", "உங்கள் சேவையை பட்டியலிடுங்கள்")}
            </button>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800 py-2 px-4">
        <p className="text-xs text-amber-700 dark:text-amber-400 text-center max-w-3xl mx-auto">
          <strong>{T("Note:", "குறிப்பு:")}</strong> {T("Verified = NammaTN reviewed basic listing details. Sponsored = Paid placement. Featured = Highlighted placement. Always use your own judgment before contacting.", "சரிபார்க்கப்பட்டது = NammaTN அடிப்படை விவரங்களை சரிபார்த்தது. நிதியுதவி = கட்டண இடம். சிறப்பு = முன்னிலைப்படுத்தப்பட்ட இடம். தொடர்பு கொள்வதற்கு முன் உங்கள் சொந்த நியாயத்தை பயன்படுத்துங்கள்.")}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder={T("Search business, service, area...", "வணிகம், சேவை, பகுதி தேடுங்கள்...")}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <option value="">{T("All Categories", "அனைத்து வகைகள்")}</option>
              {LISTING_CATEGORIES.filter(c => c.slug !== "other").map((c) => (
                <option key={c.slug} value={c.slug}>{c.icon} {lang === "ta" ? c.label_ta : c.label}</option>
              ))}
            </select>
            <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <option value="">{T("All Districts", "அனைத்து மாவட்டங்கள்")}</option>
              {DISTRICTS.map((d) => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
            </select>
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <option value="">{T("All Plans", "அனைத்து திட்டங்கள்")}</option>
              <option value="verified">{T("✅ Verified", "✅ சரிபார்க்கப்பட்ட")}</option>
              <option value="featured">{T("⭐ Featured", "⭐ சிறப்பு")}</option>
              <option value="district_sponsor">{T("🏆 Sponsored", "🏆 நிதியுதவி")}</option>
              <option value="free">{T("Free Listing", "இலவச பட்டியல்")}</option>
            </select>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setCategoryFilter("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!categoryFilter ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-300"}`}>
            {T("All", "அனைத்தும்")}
          </button>
          {LISTING_CATEGORIES.filter(c => c.slug !== "other").map((c) => (
            <button key={c.slug} onClick={() => setCategoryFilter(c.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${categoryFilter === c.slug ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-blue-300"}`}>
              {c.icon} {lang === "ta" ? c.label_ta : c.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {/* Featured / Sponsored */}
            {featured.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {T("Featured & Sponsored", "சிறப்பு & நிதியுதவி")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featured.map((l) => <ListingCard key={l.id} listing={l} featured />)}
                </div>
              </div>
            )}

            {/* Regular */}
            <div>
              {featured.length > 0 && regular.length > 0 && (
                <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                  {T("All Listings", "அனைத்து பட்டியல்கள்")} ({regular.length})
                </h2>
              )}
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{T("No listings found.", "பட்டியல் எதுவும் கிடைக்கவில்லை.")}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">{T("Try changing filters or be the first to list.", "வடிப்பான்களை மாற்றுங்கள் அல்லது முதலில் பட்டியலிடுங்கள்.")}</p>
                  <button onClick={handleOpenSubmit} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
                    {T("+ List Your Service", "+ உங்கள் சேவையை சேர்க்கவும்")}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regular.map((l) => <ListingCard key={l.id} listing={l} />)}
                </div>
              )}
            </div>
            <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
            {isFetchingNextPage && (
              <div className="flex justify-center mt-6">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </>
        )}

        {/* CTA to list */}
        <div className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center">
          <h3 className="text-lg font-bold mb-2">{T("Are you a local service provider?", "நீங்கள் உள்ளூர் சேவை வழங்குநரா?")}</h3>
          <p className="text-blue-100 text-sm mb-4">{T("Get verified and reach thousands of citizens in your area. Start with a free listing.", "உங்கள் பகுதியில் ஆயிரக்கணக்கான குடிமக்களை சென்றடையுங்கள்.")}</p>
          <button onClick={handleOpenSubmit} className="bg-white text-blue-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all">
            {T("List for Free", "இலவசமாக பட்டியலிடுங்கள்")}
          </button>
        </div>
      </div>

      {showSubmit && <ListingSubmitModal onClose={() => { setShowSubmit(false); refetch(); }} />}
    </div>
  );
}
