import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HeartHandshake, Plus, X, Loader2 } from "lucide-react";
import PageHero from "@/components/common/PageHero";
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

const EMERGENCY_TYPES = [
  { value: "blood_requirement", label: "🩸 Blood Required" },
  { value: "ambulance_help", label: "🚑 Ambulance Help" },
  { value: "flood_assistance", label: "🌊 Flood Assistance" },
  { value: "medicine_support", label: "💊 Medicine Support" },
  { value: "missing_person", label: "🔍 Missing Person" },
  { value: "community_help", label: "🤝 Community Help" },
  { value: "other", label: "❗ Other Emergency" },
];

export default function Help() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();
  const [showForm, setShowForm] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterType, setFilterType] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", emergency_type: "community_help",
    urgency: "high", district_slug: "", district_name: "",
    area_slug: "", area_name: "", contact_info: "", contact_visible: true,
  });
  const [formError, setFormError] = useState(null);

  const handleToggleForm = () => {
    if (!showForm && !isAuthenticated) {
      requireAuth(() => setShowForm(true), T("Sign in to post a help request", "உதவி கோரிக்கை பதிவிட உள்நுழையுங்கள்"));
      return;
    }
    setShowForm(f => !f);
  };

  usePageMeta({ title: "NammaTN - Help", description: "Community emergency help requests and assistance across Tamil Nadu." });

  const { data: emergencies = [], isLoading } = useQuery({
    queryKey: ["emergencies", filterDistrict, filterType],
    queryFn: async () => {
      const filter = { status: "active" };
      if (filterDistrict) filter.district_slug = filterDistrict;
      if (filterType) filter.emergency_type = filterType;
      return base44.entities.EmergencyPost.filter(filter, "-created_date", 40);
    },
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
      setForm({ title: "", description: "", emergency_type: "community_help", urgency: "high", district_slug: "", district_name: "", area_slug: "", area_name: "", contact_info: "", contact_visible: true });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.description.trim() || !form.district_slug) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (!checkRateLimit("emergency_post", 3, 10 * 60_000)) { setFormError("Please wait before posting another emergency."); return; }
    mutation.mutate({ ...form, title: sanitizeText(form.title).substring(0, 200), description: sanitizeText(form.description).substring(0, 1000), status: "active" });
  };

  return (
    <div>
      <PageHero
        icon="🤝"
        title_en="Help Center"
        title_ta="உதவி மையம்"
        desc_en="Community emergency help requests, missing persons, and assistance across Tamil Nadu. NammaTN helps you find and share help publicly."
        desc_ta="தமிழ்நாடு முழுவதும் சமுதாய அவசர உதவி கோரிக்கைகள், காணாமல்போனவர்கள் மற்றும் உதவி. NammaTN பொதுவாக உதவி கண்டுபிடிக்கவும் பகிரவும் உதவுகிறது."
        cta_en="Post Help Request"
        cta_ta="உதவி கோரிக்கையை பதிவிடு"
        secondary_en="Create Civic Receipt"
        secondary_ta="குடிமை ரசீது உருவாக்கு"
        secondaryPath="/create"
        bgFrom="from-red-700"
        bgTo="to-rose-800"
        lang={lang}
        badge_en="Community Help"
        badge_ta="சமுதாய உதவி"
      />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div />
        <button onClick={handleToggleForm}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? T("Cancel", "ரத்து") : T("Post Help Request", "உதவி கோரிக்கை பதிவிடு")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-800 p-5 mb-6 space-y-3">
          <h3 className="font-semibold text-slate-800 dark:text-white">{T("Post Emergency / Help Request", "அவசர / உதவி கோரிக்கையை பதிவிடுங்கள்")}</h3>
          <div className="grid grid-cols-2 gap-2">
            {EMERGENCY_TYPES.map(t => (
              <button key={t.value} type="button"
                onClick={() => setForm(f => ({ ...f, emergency_type: t.value }))}
                className={`p-2 rounded-xl border text-xs font-medium transition-all ${form.emergency_type === t.value ? "bg-red-50 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder={T("Brief title (e.g. Need O+ blood in Chennai)", "சுருக்கமான தலைப்பு")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none" />
          <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder={T("Describe the situation and what help is needed...", "சூழ்நிலையை மற்றும் என்ன உதவி தேவை என்பதை விவரிக்கவும்...")}
            rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm resize-none focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.district_slug} onChange={(e) => {
              const d = DISTRICTS.find(d => d.slug === e.target.value);
              setForm(f => ({ ...f, district_slug: e.target.value, district_name: d?.name_en || "", area_slug: "", area_name: "" }));
            }} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
              <option value="">{T("District *", "மாவட்டம் *")}</option>
              {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
            </select>
            <select value={form.urgency} onChange={(e) => setForm(f => ({ ...f, urgency: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
              <option value="medium">Medium</option>
              <option value="high">Urgent</option>
              <option value="critical">Critical</option>
            </select>
            {areas.length > 0 ? (
              <select value={form.area_slug} onChange={(e) => {
                const a = areas.find(a => a.slug === e.target.value);
                setForm(f => ({ ...f, area_slug: e.target.value, area_name: a?.name_en || "" }));
              }} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none col-span-2">
                <option value="">{T("Area (optional)", "பகுதி (விருப்பத்தேர்வு)")}</option>
                {areas.map(a => <option key={a.slug} value={a.slug}>{T(a.name_en, a.name_ta)}</option>)}
              </select>
            ) : (
              <input value={form.area_name || ""} onChange={(e) => {
                setForm(f => ({ ...f, area_slug: "", area_name: e.target.value }));
              }} placeholder={T("Area (optional)", "பகுதி (விருப்பத்தேர்வு)")}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none col-span-2" />
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={form.contact_visible} onChange={(e) => setForm(f => ({ ...f, contact_visible: e.target.checked }))} className="accent-red-600" />
            {T("Show contact publicly", "தொடர்பை பகிரங்கமாக காட்டு")}
          </label>
          {form.contact_visible && (
            <input value={form.contact_info} onChange={(e) => setForm(f => ({ ...f, contact_info: e.target.value }))}
              placeholder={T("Contact number / WhatsApp", "தொடர்பு எண்")}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none" />
          )}
          {formError && <p className="text-red-500 text-xs">{formError}</p>}
          <button type="submit" disabled={mutation.isPending}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
            {mutation.isPending ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Posting...</span> : T("Post Emergency", "அவசர பதிவை பதிவிடு")}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {["", ...EMERGENCY_TYPES.map(t => t.value)].map((type) => (
          <button key={type || "all"} onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all ${filterType === type ? "bg-red-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>
            {type ? EMERGENCY_TYPES.find(t2 => t2.value === type)?.label : T("All", "அனைத்தும்")}
          </button>
        ))}
      </div>
      <div className="mb-4">
        <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
          <option value="">{T("All Districts", "அனைத்து மாவட்டங்கள்")}</option>
          {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}</div>
      ) : emergencies.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <HeartHandshake className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{T("No help requests at the moment.", "தற்போது உதவி கோரிக்கைகள் இல்லை.")}</p>
          <p className="text-xs text-slate-400 mt-1">{T("Post a verified help request to reach the community.", "சமுதாயத்தை சென்றடைய ஒரு சரிபார்க்கப்பட்ட உதவி கோரிக்கையை பதிவிடுங்கள்.")}</p>
        </div>
      ) : (
        <div className="space-y-3">{emergencies.map(e => <EmergencyCard key={e.id} item={e} />)}</div>
      )}
    </div>
    </div>
  );
}