"use client";
import React, { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Home, Plus, X, Building, Users, Clock, Hotel, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { createListing, getActiveListings, detectSuspiciousStay } from "@/services/stayListings";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import StayListingCard from "@/components/stay/StayListingCard";
import StayPostForm from "@/components/stay/StayPostForm";
import StayFilters from "@/components/stay/StayFilters";
import StayReportModal from "@/components/stay/StayReportModal";
import AreaLivingPulse from "@/components/stay/AreaLivingPulse";
import { RENT_RANGES } from "@/components/stay/StayFilters";
import { DISTRICTS } from "@/lib/districts";

const TABS = [
  { id: "all", label: "All Stays", icon: Home, filter: null },
  { id: "pg_available", label: "PG Listings", icon: Building, filter: "pg_available" },
  { id: "shared_room", label: "Shared Rooms", icon: Users, filter: "shared_room" },
  { id: "roommate_needed", label: "Roommate Search", icon: Users, filter: "roommate_needed" },
  { id: "temporary_stay", label: "Temporary Stay", icon: Clock, filter: "temporary_stay" },
  { id: "hostel", label: "Nearby Stay", icon: Hotel, filter: "hostel" },
];

const SKELETON = Array(6).fill(0);

function ListingSkeleton() {
  return <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 h-64 animate-pulse" />;
}

export default function Stay({ initialListings = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const qc = useQueryClient();

  usePageMeta({
    title: "Community Stay & Rooms – VizhiTN",
    description: "Find PG stays, shared rooms, roommates and temporary accommodation across Tamil Nadu.",
  });

  const [activeTab, setActiveTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pulseDistrict, setPulseDistrict] = useState("");
  const [filters, setFilters] = useState({ search: "", district: "", gender: "any", rentRange: 0 });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 12;

  const { blocked: rateLimited, attempt: attemptPost } = useRateLimit("stay_post", 2, 10 * 60 * 1000);
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  const handlePostClick = () => {
    if (!isAuthenticated) {
      requireAuth(() => { setShowForm(true); setSubmitted(false); }, "Sign in to post a stay listing");
    } else {
      setShowForm(true);
      setSubmitted(false);
    }
  };

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["stay-listings"],
    queryFn: () => getActiveListings(100),
    initialData: initialListings,
    staleTime: 300_000,
  });

  const filteredListings = useMemo(() => {
    let result = listings;
    const activeTab_filter = TABS.find(t => t.id === activeTab)?.filter;
    if (activeTab_filter) result = result.filter(l => l.listing_type === activeTab_filter);
    if (filters.district) result = result.filter(l => l.district_slug === filters.district);
    if (filters.gender !== "any") result = result.filter(l => l.gender_preference === filters.gender || l.gender_preference === "any");
    if (filters.rentRange > 0) {
      const range = RENT_RANGES[filters.rentRange];
      result = result.filter(l => l.rent_amount >= range.min && l.rent_amount <= range.max);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.area_name?.toLowerCase().includes(q) ||
        l.district_name?.toLowerCase().includes(q) ||
        l.landmark?.toLowerCase().includes(q) ||
        l.nearby_college?.toLowerCase().includes(q) ||
        l.nearby_metro?.toLowerCase().includes(q) ||
        l.nearby_railway?.toLowerCase().includes(q) ||
        l.nearby_office?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [listings, activeTab, filters]);

  const paginated = filteredListings.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filteredListings.length;

  const handleSubmit = async (data) => {
    if (!attemptPost()) return;
    setSubmitting(true);
    const isSuspicious = detectSuspiciousStay(data.title || "", data.description || "");
    await createListing({ ...data, safety_status: isSuspicious ? "suspicious" : "pending_review" });
    qc.invalidateQueries({ queryKey: ["stay-listings"] });
    setSubmitting(false);
    setShowForm(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 6000);
  };

  const pulseDistrictName = DISTRICTS.find(d => d.slug === pulseDistrict)?.name_en || "";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-6 h-6" />
                <span className="text-indigo-200 text-sm font-medium">Community Stay & Rooms</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {T("Find Your Stay in Tamil Nadu", "தமிழ்நாட்டில் உங்கள் தங்குமிடம் கண்டறியுங்கள்")}
              </h1>
              <p className="text-indigo-100 text-sm sm:text-base">
                {T("PG · Shared Rooms · Roommates · Temporary Stays · Hostels", "PG · பகிர்ந்த அறைகள் · அறைத்தோழர்கள் · தற்காலிக தங்குமிடம்")}
              </p>
              <div className="flex gap-3 mt-3 text-xs text-indigo-200">
                <span>🏠 {listings.length} Active Listings</span>
                <span>📍 All TN Districts</span>
                <span>🔒 Privacy Protected</span>
              </div>
            </div>
            <button
              onClick={handlePostClick}
              disabled={rateLimited}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all shadow-lg disabled:opacity-50 flex-shrink-0 text-sm"
            >
              <Plus className="w-4 h-4" />
              {T("Post a Listing", "பட்டியல் இடவும்")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Success banner */}
        {submitted && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400 flex items-center justify-between">
            <span>✓ Listing submitted for review. It will go live once approved.</span>
            <button onClick={() => setSubmitted(false)}><X className="w-4 h-4" /></button>
          </div>
        )}
        {rateLimited && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-700 dark:text-yellow-400">
            ⚠️ You can post only 2 listings every 10 minutes.
          </div>
        )}

        {/* Post Form */}
        {showForm && (
          <div className="mb-6 bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-white">Create Stay Listing</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <StayPostForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} submitting={submitting} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Filters toggle on mobile */}
            <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200">
              <span>Filters & Search</span>
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
              <StayFilters filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} />
            </div>

            {/* Area Living Pulse */}
            <div>
              <label className="text-xs font-medium text-slate-500 block mb-1 px-1">Area Living Pulse — select district:</label>
              <select value={pulseDistrict} onChange={e => setPulseDistrict(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-800 focus:outline-none mb-3">
                <option value="">Select District</option>
                {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
              </select>
              {pulseDistrict && (
                <AreaLivingPulse districtSlug={pulseDistrict} districtName={pulseDistrictName} />
              )}
            </div>

            {/* Safety tips */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
              <h4 className="font-semibold text-amber-800 dark:text-amber-300 text-xs mb-2">🔒 Stay Safe</h4>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium mb-2">
                {T("Visit and verify the place before paying. Do not send advance money without trust and proof.", "பணம் செலுத்துவதற்கு முன் இடத்தை பார்வையிட்டு சரிபார்க்கவும். நம்பிக்கை மற்றும் சான்று இல்லாமல் முன்பணம் அனுப்பாதீர்கள்.")}
              </p>
              <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1.5">
                <li>• Never pay advance without visiting</li>
                <li>• Verify the address before payment</li>
                <li>• Use platform contact protection</li>
                <li>• Report suspicious listings</li>
                <li>• Trust listings marked Verified ✓</li>
                <li>• Verified = Admin reviewed. Sponsored = Paid placement.</li>
              </ul>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1 mb-5 no-scrollbar">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const count = tab.filter ? listings.filter(l => l.listing_type === tab.filter).length : listings.length;
                return (
                  <button key={tab.id} onClick={() => { setActiveTab(tab.id); setPage(1); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium flex-shrink-0 border transition-all ${activeTab === tab.id ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300"}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    <span className={`text-xs px-1 py-0.5 rounded font-bold ${activeTab === tab.id ? "bg-white/20" : "bg-slate-100 dark:bg-slate-700 text-slate-500"}`}>{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Results header */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {filteredListings.length} listing{filteredListings.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {SKELETON.map((_, i) => <ListingSkeleton key={i} />)}
              </div>
            ) : paginated.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Home className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">No listings found for this filter.</p>
                <button onClick={() => setShowForm(true)} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
                  + Post the first listing
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginated.map(listing => (
                    <StayListingCard key={listing.id} listing={listing} onReport={setReportTarget} />
                  ))}
                </div>
                {hasMore && (
                  <div className="text-center mt-6">
                    <button onClick={() => setPage(p => p + 1)}
                      className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                      Load more ({filteredListings.length - paginated.length} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {reportTarget && <StayReportModal listing={reportTarget} onClose={() => setReportTarget(null)} />}
    </div>
  );
}
