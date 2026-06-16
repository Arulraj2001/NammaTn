import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, Plus, X, Loader2 } from "lucide-react";
import PageHero from "@/components/common/PageHero";
import { useLanguage } from "@/context/LanguageContext";
import { base44 } from "@/api/base44Client";
import { getActiveScams, createScamAlert } from "@/services/scamAlerts";
import { getAreasByDistrict } from "@/services/areas";
import { DISTRICTS } from "@/lib/districts";
import { usePageMeta } from "@/hooks/usePageMeta";
import ScamCard from "@/components/phase8/ScamCard";
import { checkRateLimit, sanitizeText } from "@/lib/security";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(() => import("@/components/media/LocationPickerMap"), { ssr: false });


const SCAM_TYPES = [
  { value: "fake_agent", label: "🕵️ Fake Agent" },
  { value: "fake_job", label: "💼 Fake Job Scam" },
  { value: "fraud_call", label: "📞 Fraud Call Pattern" },
  { value: "online_scam", label: "💻 Online Scam" },
  { value: "fake_document", label: "📄 Fake Document Service" },
  { value: "local_cheating", label: "⚠ Local Cheating Pattern" },
  { value: "other", label: "❗ Other Alert" },
];

export default function Scams() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();
  const [showForm, setShowForm] = useState(false);
  const [filterDistrict, setFilterDistrict] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", scam_type: "fake_job",
    district_slug: "", district_name: "", area_slug: "", area_name: "",
    warning_level: "medium", is_anonymous: true,
    latitude: null, longitude: null,
  });
  const [formError, setFormError] = useState(null);

  const handleToggleForm = () => {
    if (!showForm && !isAuthenticated) {
      requireAuth(() => setShowForm(true), T("Sign in to report a scam", "மோசடியை புகாரளிக்க உள்நுழையுங்கள்"));
      return;
    }
    setShowForm(f => !f);
  };

  usePageMeta({ title: "NammaTN - Scam Alerts", description: "View and report local scam alerts, fake jobs, fake rentals, fraud messages, and unsafe activities across Tamil Nadu." });

  const { data: scams = [], isLoading } = useQuery({
    queryKey: ["scams", filterDistrict],
    queryFn: () => filterDistrict
      ? base44.entities.ScamAlert.filter({ status: "active", district_slug: filterDistrict }, "-created_date", 40)
      : getActiveScams(40),
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["areas-scam", form.district_slug],
    queryFn: () => getAreasByDistrict(form.district_slug),
    enabled: !!form.district_slug,
  });

  const mutation = useMutation({
    mutationFn: createScamAlert,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["scams"] });
      qc.invalidateQueries({ queryKey: ["admin-scams"] });
      setShowForm(false);
      setForm({ title: "", description: "", scam_type: "fake_job", district_slug: "", district_name: "", area_slug: "", area_name: "", warning_level: "medium", is_anonymous: true, latitude: null, longitude: null });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.description.trim() || !form.district_slug) {
      setFormError("Please fill all required fields.");
      return;
    }
    if (!checkRateLimit("scam_report", 2, 30 * 60_000)) { setFormError("Please wait before submitting another report."); return; }
    mutation.mutate({ ...form, title: sanitizeText(form.title).substring(0, 200), description: sanitizeText(form.description).substring(0, 1000), status: "pending" });
  };

  return (
    <div>
      <PageHero
        icon="⚠️"
        title_en="Scam Alerts"
        title_ta="மோசடி எச்சரிக்கைகள்"
        desc_en="View and report local scam alerts, fake jobs, fake rentals, fraud messages, and unsafe activities. Help warn others in your community."
        desc_ta="உள்ளூர் மோசடி எச்சரிக்கைகள், போலி வேலை, போலி வாடகை, மோசடி செய்திகள் மற்றும் பாதுகாப்பற்ற நடவடிக்கைகளை பார்க்கவும் மற்றும் புகாரளிக்கவும்."
        cta_en="Report Scam"
        cta_ta="மோசடியை புகாரளி"
        secondary_en="Create Civic Receipt"
        secondary_ta="குடிமை ரசீது உருவாக்கு"
        secondaryPath="/create"
        bgFrom="from-red-700"
        bgTo="to-rose-800"
        lang={lang}
        badge_en="Public Awareness Only"
        badge_ta="பொது விழிப்புணர்விற்காக மட்டுமே"
        disclaimer={T("All scam reports are for public awareness only. Not verified accusations. Posts are moderated.", "அனைத்து மோசடி அறிக்கைகளும் பொது விழிப்புணர்விற்காக மட்டுமே.")}
      />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div />
        <button onClick={handleToggleForm}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? T("Cancel", "ரத்து") : T("Report Scam", "மோசடியை புகாரளி")}
        </button>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 mb-5">
        <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
          {T("⚠ Legal Notice: All scam reports are public awareness only. Do not post unverified personal accusations. All posts are moderated.", "⚠ சட்ட அறிவிப்பு: அனைத்து மோசடி அறிக்கைகளும் பொது விழிப்புணர்விற்காக மட்டுமே. சரிபார்க்கப்படாத தனிப்பட்ட குற்றச்சாட்டுகளை பதிவிடாதீர்கள்.")}
        </p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6 space-y-3">
          <h3 className="font-semibold text-slate-800 dark:text-white">{T("Report a Scam Pattern", "மோசடி முறையை புகாரளி")}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{T("Describe the pattern factually without naming individuals. Focus on awareness, not accusations.", "தனிநபர்களை பெயரிடாமல் முறையை உண்மையாக விவரிக்கவும்.")}</p>
          <div className="grid grid-cols-2 gap-2">
            {SCAM_TYPES.map(t => (
              <button key={t.value} type="button"
                onClick={() => setForm(f => ({ ...f, scam_type: t.value }))}
                className={`p-2 rounded-xl border text-xs font-medium transition-all ${form.scam_type === t.value ? "bg-red-50 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-600" : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder={T("Alert title (pattern description)...", "எச்சரிக்கை தலைப்பு...")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none" />
          <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder={T("Describe the pattern (factual, neutral wording only)...", "முறையை விவரிக்கவும் (உண்மையான, நடுநிலை வார்த்தைகள் மட்டும்)...")}
            rows={4} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm resize-none focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.district_slug} onChange={(e) => {
              const d = DISTRICTS.find(d => d.slug === e.target.value);
              setForm(f => ({ ...f, district_slug: e.target.value, district_name: d?.name_en || "", area_slug: "", area_name: "" }));
            }} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
              <option value="">{T("District *", "மாவட்டம் *")}</option>
              {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
            </select>
            <select value={form.warning_level} onChange={(e) => setForm(f => ({ ...f, warning_level: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
              <option value="low">Low Warning</option>
              <option value="medium">Medium Warning</option>
              <option value="high">High Warning</option>
              <option value="critical">Critical Warning</option>
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
          <LocationPickerMap
            districtSlug={form.district_slug}
            latitude={form.latitude}
            longitude={form.longitude}
            onChange={(lat, lng) => setForm(f => ({ ...f, latitude: lat, longitude: lng }))}
          />
          {formError && <p className="text-red-500 text-xs">{formError}</p>}
          <button type="submit" disabled={mutation.isPending}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
            {mutation.isPending ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Submitting...</span> : T("Submit for Review", "மதிப்பாய்விற்கு சமர்ப்பி")}
          </button>
        </form>
      )}

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button onClick={() => setFilterDistrict("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all ${!filterDistrict ? "bg-red-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>
          {T("All", "அனைத்தும்")}
        </button>
        {DISTRICTS.slice(0, 7).map(d => (
          <button key={d.slug} onClick={() => setFilterDistrict(d.slug)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all ${filterDistrict === d.slug ? "bg-red-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>
            {T(d.name_en, d.name_ta)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}</div>
      ) : scams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{T("No scam alerts yet.", "இன்னும் மோசடி எச்சரிக்கைகள் இல்லை.")}</p>
          <p className="text-xs text-slate-400 mt-1">{T("Report suspicious activity to warn others in your community.", "உங்கள் சமுதாயத்தில் மற்றவர்களை எச்சரிக்க சந்தேகமான நடவடிக்கையை புகாரளிக்கவும்.")}</p>
        </div>
      ) : (
        <div className="space-y-3">{scams.map(s => <ScamCard key={s.id} item={s} />)}</div>
      )}
    </div>
    </div>
  );
}