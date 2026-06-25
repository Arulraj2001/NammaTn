import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { base44 } from "@/api/base44Client";
import { getActiveSituations, createSituation } from "@/services/situations";
import { getAreasByDistrict } from "@/services/areas";
import { DISTRICTS } from "@/lib/districts";
import { usePageMeta } from "@/hooks/usePageMeta";
import SituationCard from "@/components/phase8/SituationCard";
import { checkRateLimit } from "@/lib/security";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import dynamic from "next/dynamic";
import { supabase } from "@/api/supabaseClient";

const LocationPickerMap = dynamic(() => import("@/components/media/LocationPickerMap"), { ssr: false });


const SITUATION_TYPES = [
  { value: "eb_shutdown", label: "⚡ EB Shutdown" },
  { value: "water_shortage", label: "💧 Water Shortage" },
  { value: "traffic", label: "🚗 Heavy Traffic" },
  { value: "flooding", label: "🌧️ Flooding" },
  { value: "internet_outage", label: "📶 Internet Outage" },
  { value: "office_closed", label: "🏢 Office Closed" },
  { value: "protest", label: "📢 Protest" },
  { value: "transport_issue", label: "🚌 Transport Issue" },
  { value: "local_emergency", label: "🚨 Local Emergency" },
  { value: "service_disruption", label: "⚙️ Service Disruption" },
  { value: "other", label: "❗ Other" },
];

export default function Situations() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const qc = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const { requireAuth } = useAuthModal();

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
  const [showForm, setShowForm] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [form, setForm] = useState({
    situation_type: "eb_shutdown", title: "", details: "",
    district_slug: "", district_name: "", area_slug: "", area_name: "",
    urgency: "moderate", latitude: null, longitude: null,
  });
  const [formError, setFormError] = useState(null);

  const handleToggleForm = () => {
    if (!showForm && !isAuthenticated) {
      requireAuth(() => setShowForm(true), T("Sign in to report a live situation", "நேரடி நிலைமையை புகாரளிக்க உள்நுழையுங்கள்"));
      return;
    }
    setShowForm(f => !f);
  };

  usePageMeta({ title: "VizhiTN - Live Situations", description: "Follow urgent local situations, emergency updates, active alerts, and real-time public reports from Tamil Nadu areas." });

  const { data: situations = [], isLoading } = useQuery({
    queryKey: ["situations", filterDistrict],
    queryFn: () => filterDistrict
      ? base44.entities.SituationUpdate.filter({ district_slug: filterDistrict, status: "active" }, "-created_date", 30)
      : getActiveSituations(30),
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["areas-district", form.district_slug],
    queryFn: () => getAreasByDistrict(form.district_slug),
    enabled: !!form.district_slug,
  });

  const mutation = useMutation({
    mutationFn: createSituation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["situations"] });
      qc.invalidateQueries({ queryKey: ["admin-situations"] });
      setShowForm(false);
      setForm({ situation_type: "eb_shutdown", title: "", details: "", district_slug: "", district_name: "", area_slug: "", area_name: "", urgency: "moderate", latitude: null, longitude: null });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.district_slug) {
      setFormError("Please fill in title and district.");
      return;
    }
    if (!checkRateLimit("situation_post", 3, 5 * 60_000)) {
      setFormError("You're posting too fast. Please wait a few minutes.");
      return;
    }
    mutation.mutate({ ...form, status: "active" });
  };

  return (
    <div>
      {/* ── Hero banner — matches Community style ── */}
      <div className="bg-gradient-to-br from-yellow-600 to-amber-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0 border border-white/20 shadow-lg mt-1">
              <span className="text-3xl">⚡</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                {T("Live Updates", "நேரடி புதுப்பிப்புகள்")}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-1.5">
                {T("Live Situations", "நேரடி நிலைமைகள்")}
              </h1>
              <p className="text-yellow-100 text-xs sm:text-sm leading-relaxed max-w-xl mb-3">
                {T(
                  "Follow urgent local situations, emergency updates, active alerts, and real-time public reports from Tamil Nadu areas.",
                  "தமிழ்நாடு பகுதிகளில் இருந்து அவசர உள்ளூர் நிலைமைகள், அவசர புதுப்பிப்புகள், செயலில் உள்ள எச்சரிக்கைகள் மற்றும் நேரடி பொது அறிக்கைகளை பின்தொடருங்கள்."
                )}
              </p>
              <Link to="/create" className="inline-flex items-center text-xs font-bold border border-white/40 hover:bg-white/10 text-white px-3.5 py-1.5 rounded-xl transition-colors">
                {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div />
        <button
          onClick={handleToggleForm}
          className="flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? T("Cancel", "ரத்து") : T("Report Situation", "நிலைமையை புகாரளி")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6 space-y-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h3 className="font-semibold text-slate-800 dark:text-white">{T("Report a Situation", "ஒரு நிலைமையை புகாரளிக்கவும்")}</h3>
            {isAuthenticated && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800 rounded-xl">
                <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wider">{T("Your Score", "உங்கள் மதிப்பு")}</span>
                <span className="text-sm font-extrabold text-yellow-700 dark:text-yellow-300">★ {profile?.trust_score || 10}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SITUATION_TYPES.map((t) => (
              <button key={t.value} type="button"
                onClick={() => setForm(f => ({ ...f, situation_type: t.value }))}
                className={`p-2 rounded-xl border text-xs font-medium transition-all ${form.situation_type === t.value ? "bg-yellow-50 border-yellow-400 text-yellow-700 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-300" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"}`}
              >{t.label}</button>
            ))}
          </div>
          <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder={T("Brief title (e.g. No water supply in Adyar)", "சுருக்கமான தலைப்பு")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          <textarea value={form.details} onChange={(e) => setForm(f => ({ ...f, details: e.target.value }))}
            placeholder={T("More details (optional)...", "மேலும் விவரங்கள் (விருப்பத்தேர்வு)...")}
            rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.district_slug} onChange={(e) => {
              const d = DISTRICTS.find(d => d.slug === e.target.value);
              setForm(f => ({ ...f, district_slug: e.target.value, district_name: d?.name_en || "", area_slug: "", area_name: "" }));
            }} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
              <option value="">{T("Select District *", "மாவட்டம் *")}</option>
              {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
            </select>
            {areas.length > 0 ? (
              <select value={form.area_slug} onChange={(e) => {
                const a = areas.find(a => a.slug === e.target.value);
                setForm(f => ({ ...f, area_slug: e.target.value, area_name: a?.name_en || "" }));
              }} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
                <option value="">{T("Area (optional)", "பகுதி (விருப்பத்தேர்வு)")}</option>
                {areas.map(a => <option key={a.slug} value={a.slug}>{T(a.name_en, a.name_ta)}</option>)}
              </select>
            ) : (
              <input value={form.area_name || ""} onChange={(e) => {
                setForm(f => ({ ...f, area_slug: "", area_name: e.target.value }));
              }} placeholder={T("Area (optional)", "பகுதி (விருப்பத்தேர்வு)")}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none" />
            )}
          </div>
          <LocationPickerMap
            districtSlug={form.district_slug}
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))}
          />
          <select value={form.urgency} onChange={(e) => setForm(f => ({ ...f, urgency: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
            <option value="info">ℹ Info</option>
            <option value="moderate">⚠ Moderate</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="critical">🚨 Critical</option>
          </select>
          {formError && <p className="text-red-500 text-xs">{formError}</p>}
          <button type="submit" disabled={mutation.isPending}
            className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
            {mutation.isPending ? T("Submitting...", "சமர்ப்பிக்கிறது...") : T("Submit Update", "புதுப்பிப்பை சமர்ப்பிக்கவும்")}
          </button>
        </form>
      )}

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setFilterDistrict("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all ${!filterDistrict ? "bg-yellow-500 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>
          {T("All", "அனைத்தும்")}
        </button>
        {DISTRICTS.slice(0, 8).map(d => (
          <button key={d.slug} onClick={() => setFilterDistrict(d.slug)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all ${filterDistrict === d.slug ? "bg-yellow-500 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>
            {T(d.name_en, d.name_ta)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}</div>
      ) : situations.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Zap className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{T("No current situation updates.", "தற்போது நிலைமை புதுப்பிப்புகள் இல்லை.")}</p>
          <p className="text-xs text-slate-400 mt-1">{T("Check again soon or report an active situation.", "சீக்கிரம் மீண்டும் சரிபார்க்கவும் அல்லது ஒரு செயலில் உள்ள நிலைமையை புகாரளிக்கவும்.")}</p>
        </div>
      ) : (
        <div className="space-y-3">{situations.map(s => <SituationCard key={s.id} item={s} />)}</div>
      )}
    </div>
    </div>
  );
}