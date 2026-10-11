"use client";

import React, { useState, useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  HeartHandshake, Plus, X, Loader2, Phone, Search, AlertCircle,
  Filter, MapPin, ShieldCheck, Heart, Siren, LifeBuoy, ArrowRight,
  Droplets, UserCheck, CheckCircle2, ChevronRight
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { base44 } from "@/api/base44Client";
import { createEmergency } from "@/services/emergencyPosts";
import { getAreasByDistrict } from "@/services/areas";
import { DISTRICTS } from "@/lib/districts";
import { usePageMeta } from "@/hooks/usePageMeta";
import EmergencyCard from "@/components/phase8/EmergencyCard";
import { checkRateLimit, sanitizeText } from "@/lib/security";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import dynamic from "next/dynamic";
import { supabase } from "@/api/supabaseClient";
import NumberedPagination from "@/components/common/NumberedPagination";

const LocationPickerMap = dynamic(() => import("@/components/media/LocationPickerMap"), { ssr: false });

const EMERGENCY_TYPES = [
  { value: "blood_requirement", label_en: "🩸 Blood Required", label_ta: "🩸 ரத்த தானம் தேவை" },
  { value: "ambulance_help", label_en: "🚑 Ambulance Help", label_ta: "🚑 ஆம்புலன்ஸ் உதவி" },
  { value: "flood_assistance", label_en: "🌊 Flood Assistance", label_ta: "🌊 வெள்ள மீட்பு உதவி" },
  { value: "medicine_support", label_en: "💊 Medicine Support", label_ta: "💊 மருந்து உதவி" },
  { value: "missing_person", label_en: "🔍 Missing Person", label_ta: "🔍 காணாமல்போனவர்" },
  { value: "community_help", label_en: "🤝 Community Help", label_ta: "🤝 சமுதாய உதவி" },
  { value: "other", label_en: "❗ Other Emergency", label_ta: "❗ இதர அவசரம்" },
];

const ITEMS_PER_PAGE = 8;

export default function Help({ initialEmergencies = [] }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const qc = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const { requireAuth } = useAuthModal();

  // State
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterUrgency, setFilterUrgency] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Form State
  const [form, setForm] = useState({
    title: "", description: "", emergency_type: "community_help",
    urgency: "high", district_slug: "", district_name: "",
    area_slug: "", area_name: "", contact_info: "", contact_visible: true,
    latitude: null, longitude: null,
  });
  const [formError, setFormError] = useState(null);

  // Fetch user profile for trust score
  const { data: profile = null } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();
      if (error) return null;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  usePageMeta({
    title: "Tamil Nadu Community Emergency Help Center | VizhiTN",
    description: "Verified community emergency requests — Blood requirements, ambulance help, missing persons, flood assistance across Tamil Nadu.",
  });

  const { data: rawEmergencies = [], isLoading } = useQuery({
    queryKey: ["emergencies", filterDistrict, filterType],
    queryFn: async () => {
      const filter = { status: "active" };
      if (filterDistrict) filter.district_slug = filterDistrict;
      if (filterType) filter.emergency_type = filterType;
      return base44.entities.EmergencyPost.filter(filter, "-created_date", 60);
    },
    initialData: !filterDistrict && !filterType ? initialEmergencies : undefined,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["areas-help", form.district_slug],
    queryFn: () => getAreasByDistrict(form.district_slug),
    enabled: !!form.district_slug,
  });

  const mutation = useMutation({
    mutationFn: createEmergency,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["emergencies"] });
      qc.invalidateQueries({ queryKey: ["admin-emergency"] });
      setShowForm(false);
      setForm({
        title: "", description: "", emergency_type: "community_help",
        urgency: "high", district_slug: "", district_name: "",
        area_slug: "", area_name: "", contact_info: "", contact_visible: true,
        latitude: null, longitude: null,
      });
    },
  });

  const handleToggleForm = () => {
    if (!showForm && !isAuthenticated) {
      requireAuth(() => setShowForm(true), T("Sign in to post a help request", "உதவி கோரிக்கை பதிவிட உள்நுழையுங்கள்"));
      return;
    }
    setShowForm((f) => !f);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.description.trim() || !form.district_slug) {
      setFormError(T("Please fill in all required fields.", "அனைத்து தேவையான விவரங்களையும் நிரப்பவும்."));
      return;
    }
    if (!checkRateLimit("emergency_post", 3, 10 * 60_000)) {
      setFormError(T("Please wait before posting another emergency.", "மற்றொரு அவசர பதிவை பதிவிட சிறிது நேரம் காத்திருக்கவும்."));
      return;
    }
    mutation.mutate({
      ...form,
      title: sanitizeText(form.title).substring(0, 200),
      description: sanitizeText(form.description).substring(0, 1000),
      status: "active",
    });
  };

  // Filter emergencies by search query and urgency
  const filteredEmergencies = useMemo(() => {
    return rawEmergencies.filter((item) => {
      if (filterUrgency && item.urgency !== filterUrgency) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        item.title?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.district_name?.toLowerCase().includes(q) ||
        item.area_name?.toLowerCase().includes(q) ||
        item.contact_info?.toLowerCase().includes(q)
      );
    });
  }, [rawEmergencies, searchQuery, filterUrgency]);

  // Pagination calculation
  const totalItems = filteredEmergencies.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedEmergencies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEmergencies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEmergencies, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16">

      {/* ── TOP SPEED HELPLINES TICKER RIBBON ── */}
      <div className="bg-red-700 dark:bg-red-950 text-white border-b border-red-800 dark:border-red-900 py-2.5 px-4 text-xs font-semibold">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping inline-block" />
            <span className="font-extrabold uppercase tracking-wide text-red-200">
              {T("24x7 EMERGENCY HOTLINES:", "24x7 அவசர எண்கள்:")}
            </span>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <a href="tel:108" className="hover:text-red-200 flex items-center gap-1 font-bold">
              🚑 108 <span className="opacity-80 font-normal">({T("Ambulance", "ஆம்புலன்ஸ்")})</span>
            </a>
            <a href="tel:112" className="hover:text-red-200 flex items-center gap-1 font-bold">
              🚨 112 <span className="opacity-80 font-normal">({T("Police/Fire", "காவல்/தீ")})</span>
            </a>
            <a href="tel:1912" className="hover:text-red-200 flex items-center gap-1 font-bold">
              ⚡ 1912 <span className="opacity-80 font-normal">({T("Minnalagam EB", "மின்வாரியம்")})</span>
            </a>
            <a href="tel:1930" className="hover:text-red-200 flex items-center gap-1 font-bold">
              💳 1930 <span className="opacity-80 font-normal">({T("Cyber Fraud", "சைபர் கிரைம்")})</span>
            </a>
            <Link
              to="/helplines"
              className="bg-white/20 hover:bg-white/30 text-white text-[11px] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 font-bold ml-auto"
            >
              {T("Full Directory & SOPs", "அனைத்து எண்கள்")} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-rose-950 text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-rose-600/30 text-rose-300 text-xs font-bold px-3 py-1 rounded-full border border-rose-500/30 mb-2.5">
                <HeartHandshake className="w-3.5 h-3.5" />
                {T("CITIZEN EMERGENCY ASSISTANCE BOARD", "சமுதாய அவசர உதவி மையம்")}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-2">
                {T("Emergency Help Requests & Volunteer Response", "அவசர உதவி கோரிக்கைகள் & தன்னார்வலர் உதவி")}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {T(
                  "Broadcast urgent requirements for blood donors, ambulance navigation, flood assistance, and missing person alerts across Tamil Nadu with verified community confirmation.",
                  "ரத்த தானம், ஆம்புலன்ஸ் உதவி, மழை வெள்ள மீட்பு மற்றும் காணாமல்போனவர்களுக்கான உதவி கோரிக்கைகளை உடனுக்குடன் பதிவு செய்யுங்கள்."
                )}
              </p>
            </div>

            <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleToggleForm}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/30 transition-transform active:scale-95"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? T("Cancel Request", "ரத்து செய்") : T("Post Emergency SOS", "அவசர கோரிக்கை பதிவிடு")}
              </button>
              <Link
                to="/create"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-colors"
              >
                {T("Create Civic Receipt", "குடிமை ரசீது")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT CONTAINER (2 COLUMNS) ── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── EXPANDABLE POST EMERGENCY SOS FORM ── */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-red-300 dark:border-red-800 p-5 sm:p-6 mb-6 shadow-xl space-y-4 animate-in fade-in"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {T("Post Community Emergency / SOS Request", "அவசர / உதவி கோரிக்கையை பதிவிடுங்கள்")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {T("Provide verified hospital or incident contact details for fast volunteer response.", "விரைவு உதவிக்கு துல்லியமான மருத்துவமனை அல்லது தொடர்பு விவரங்களை குறிப்பிடவும்.")}
                </p>
              </div>
              {isAuthenticated && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl">
                  <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">{T("Trust Score", "நம்பகத்தன்மை")}</span>
                  <span className="text-xs font-extrabold text-red-700 dark:text-red-300">★ {profile?.trust_score || 10}</span>
                </div>
              )}
            </div>

            {/* Emergency Type Grid */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {T("Select Emergency Category *", "அவசர வகையை தேர்வு செய்யவும் *")}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EMERGENCY_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, emergency_type: t.value }))}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all text-left ${
                      form.emergency_type === t.value
                        ? "bg-red-50 border-red-500 text-red-700 dark:bg-red-950/40 dark:border-red-600 dark:text-red-300 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    {T(t.label_en, t.label_ta)}
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={T("Brief title (e.g. Urgent O+ Blood Needed at Rajiv Gandhi GH, Chennai)", "சுருக்கமான தலைப்பு (எ.கா. சென்னை ராஜீவ் காந்தி மருத்துவமனையில் O+ ரத்தம் தேவை)")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 dark:text-white"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder={T("Provide exact patient details, hospital ward number, requirement count, or incident description...", "நோயாளி விவரங்கள், வார்டு எண், தேவைப்படும் அலகுகள் அல்லது சம்பவத்தை விவரிக்கவும்...")}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm resize-none focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* Location & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={form.district_slug}
                onChange={(e) => {
                  const d = DISTRICTS.find((d) => d.slug === e.target.value);
                  setForm((f) => ({ ...f, district_slug: e.target.value, district_name: d?.name_en || "", area_slug: "", area_name: "" }));
                }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 dark:text-white font-medium"
              >
                <option value="">{T("Select District *", "மாவட்டம் தேர்வு செய்க *")}</option>
                {DISTRICTS.map((d) => (
                  <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>
                ))}
              </select>

              <select
                value={form.urgency}
                onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value }))}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 dark:text-white font-medium"
              >
                <option value="critical">🔴 {T("Critical (Within 2 Hours)", "உடனடி ஆபத்து (2 மணி நேரத்திற்குள்)")}</option>
                <option value="high">🟠 {T("Urgent (Within 6 Hours)", "அவசரம் (6 மணி நேரத்திற்குள்)")}</option>
                <option value="medium">🟡 {T("Medium (Today)", "நடுத்தரம் (இன்றைய தேவை)")}</option>
              </select>

              {areas.length > 0 ? (
                <select
                  value={form.area_slug}
                  onChange={(e) => {
                    const a = areas.find((a) => a.slug === e.target.value);
                    setForm((f) => ({ ...f, area_slug: e.target.value, area_name: a?.name_en || "" }));
                  }}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none col-span-1 sm:col-span-2 text-slate-900 dark:text-white"
                >
                  <option value="">{T("Area / Taluk (optional)", "பகுதி / வட்டம் (விருப்பத்தேர்வு)")}</option>
                  {areas.map((a) => (
                    <option key={a.slug} value={a.slug}>{T(a.name_en, a.name_ta)}</option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.area_name || ""}
                  onChange={(e) => setForm((f) => ({ ...f, area_slug: "", area_name: e.target.value }))}
                  placeholder={T("Area / Hospital Name (optional)", "பகுதி / மருத்துவமனை பெயர்")}
                  className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none col-span-1 sm:col-span-2 text-slate-900 dark:text-white"
                />
              )}
            </div>

            {/* Map Picker */}
            <LocationPickerMap
              districtSlug={form.district_slug}
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(lat, lng) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
            />

            {/* Contact Visibility */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.contact_visible}
                  onChange={(e) => setForm((f) => ({ ...f, contact_visible: e.target.checked }))}
                  className="accent-red-600 w-4 h-4 rounded"
                />
                {T("Show phone number publicly for immediate calls", "அவசர அழைப்பிற்கு தொடர்பு எண்ணை பகிரங்கமாக காட்டு")}
              </label>
              {form.contact_visible && (
                <input
                  value={form.contact_info}
                  onChange={(e) => setForm((f) => ({ ...f, contact_info: e.target.value }))}
                  placeholder={T("Contact Number / Attender Mobile (e.g. 98400XXXXX)", "தொடர்பு எண் / வாட்ஸ்அப்")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 dark:text-white"
                />
              )}
            </div>

            {formError && (
              <p className="text-red-600 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm shadow-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {T("Broadcasting Emergency SOS...", "அவசர பதிவை பதிவு செய்கிறது...")}
                </>
              ) : (
                T("Broadcast Emergency SOS Request", "அவசர உதவி பதிவை வெளியிடு")
              )}
            </button>
          </form>
        )}

        {/* ── SEARCH & FILTER TOOLBAR ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={T(
                  "Search requests (e.g. O+, blood, ambulance, hospital, Tambaram)...",
                  "தேடுங்கள் (O+, ரத்தம், ஆம்புலன்ஸ், மருத்துவமனை, தாம்பரம்)..."
                )}
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 dark:text-white"
              />
            </div>

            {/* District Filter */}
            <div>
              <select
                value={filterDistrict}
                onChange={(e) => {
                  setFilterDistrict(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full py-2.5 px-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-slate-900 dark:text-white font-medium"
              >
                <option value="">{T("📍 All 38 Districts", "📍 அனைத்து 38 மாவட்டங்கள்")}</option>
                {DISTRICTS.map((d) => (
                  <option key={d.slug} value={d.slug}>
                    {T(d.name_en, d.name_ta)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category Chips & Urgency */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none flex-1">
              <button
                onClick={() => {
                  setFilterType("");
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-colors ${
                  !filterType
                    ? "bg-red-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {T("All Needs", "அனைத்தும்")}
              </button>
              {EMERGENCY_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => {
                    setFilterType(t.value);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-colors ${
                    filterType === t.value
                      ? "bg-red-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {T(t.label_en, t.label_ta)}
                </button>
              ))}
            </div>

            {/* Urgency Pill Toggle */}
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => {
                  setFilterUrgency((u) => (u === "critical" ? "" : "critical"));
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  filterUrgency === "critical"
                    ? "bg-rose-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50"
                }`}
              >
                🔴 {T("Critical Only", "அவசரம் மட்டும்")}
              </button>
            </div>
          </div>
        </div>

        {/* ── 2-COLUMN MAIN CONTENT GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT 2 COLUMNS: EMERGENCY FEED (70%) */}
          <div className="lg:col-span-2 space-y-4" id="emergency-posts-container">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {T("Active Citizen Broadcasts", "செயலில் உள்ள உதவி கோரிக்கைகள்")}
              </h2>
              <span className="text-xs text-slate-400">
                {totalItems} {T("requests", "கோரிக்கைகள்")}
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : paginatedEmergencies.length === 0 ? (
              <div className="text-center py-14 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <HeartHandshake className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1">
                  {T("No Emergency Help Requests Found", "உதவி கோரிக்கைகள் எதுவும் இல்லை")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">
                  {T(
                    "No active community requests match your current filters. Post a verified request to alert volunteers.",
                    "நீங்கள் தேர்வு செய்த வடிகட்டிகளில் கோரிக்கைகள் இல்லை. உதவி தேவைப்பட்டால் புதிய பதிவை உருவாக்கவும்."
                  )}
                </p>
                <button
                  onClick={handleToggleForm}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {T("Post Emergency Request", "உதவி கோரிக்கை பதிவிடு")}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedEmergencies.map((e) => (
                  <EmergencyCard key={e.id} item={e} />
                ))}

                {/* NUMBERED PAGINATION */}
                <NumberedPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  onPageChange={handlePageChange}
                  scrollTargetId="emergency-posts-container"
                  itemLabel={T("help requests", "உதவி கோரிக்கைகள்")}
                />
              </div>
            )}
          </div>

          {/* RIGHT 1 COLUMN: SIDEBAR DESKS (30%) */}
          <div className="space-y-5">

            {/* Blood Bank Guidance Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2.5 mb-3 text-red-600 dark:text-red-400 font-extrabold text-sm">
                <Droplets className="w-5 h-5 fill-current" />
                <span>{T("Blood Donor Guidelines", "ரத்த தான வழிகாட்டுதல்")}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
                {T(
                  "For immediate blood availability across Government Medical Colleges and Taluk hospitals, dial the state health helpline 104.",
                  "அரசு மருத்துவக் கல்லூரி மற்றும் வட்டார மருத்துவமனைகளில் ரத்த இருப்பை அறிய 104 அழைக்கலாம்."
                )}
              </p>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{T("Age 18–65, Weight > 50 kg", "வயது 18-65, எடை > 50 கிலோ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{T("Minimum 90 days gap from last donation", "கடைசி தானத்திலிருந்து 90 நாட்கள்")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{T("Hemoglobin level above 12.5 g/dL", "ஹீமோகுளோபின் 12.5 g/dL மேல்")}</span>
                </div>
              </div>

              <a
                href="tel:104"
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                {T("Call 104 Health Desk", "104 ரத்த வங்கி உதவி")}
              </a>
            </div>

            {/* Golden Hour Ambulance Protocol */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center gap-2.5 mb-2.5 text-rose-600 dark:text-rose-400 font-extrabold text-sm">
                <Siren className="w-5 h-5" />
                <span>{T("Calling 108 Ambulance", "108 ஆம்புலன்ஸ் அழைக்கும் போது")}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                <li>• {T("State the exact landmark and hospital gate.", "துல்லியமான அடையாளத்தை கூறவும்.")}</li>
                <li>• {T("Report patient consciousness & breathing status.", "சுயநினைவு நிலையை தெளிவாக தெரிவிக்கவும்.")}</li>
                <li>• {T("Keep phone line free for driver GPS callback.", "ஓட்டுநர் அழைக்க தொலைபேசியை தொடர்பில் வைக்கவும்.")}</li>
              </ul>
              <a
                href="tel:108"
                className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                {T("Dial 108 Ambulance", "108 ஆம்புலன்ஸ் அழைக்க")}
              </a>
            </div>

            {/* Official Directory Promotion Card */}
            <div className="bg-gradient-to-br from-slate-900 to-red-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 bg-red-950/80 px-2 py-0.5 rounded-md inline-block mb-2">
                VERIFIED DIRECTORY
              </span>
              <h4 className="font-bold text-sm mb-1">
                {T("Tamil Nadu 24x7 Helplines & SOPs", "24x7 உதவி எண்கள் & நெறிமுறைகள்")}
              </h4>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                {T(
                  "Access all 38 District Collectorate Disaster Control lines (1077), TANGEDCO Minnalagam (1912), and life-saving first aid SOPs.",
                  "38 மாவட்ட பேரிடர் எண்கள், மின்வாரியம் மற்றும் முதலுதவி வழிகாட்டிகளை காண்க."
                )}
              </p>
              <Link
                to="/helplines"
                className="w-full py-2 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs rounded-xl inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                {T("View Helplines Directory →", "அனைத்து எண்கள் பார்க்க →")}
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
