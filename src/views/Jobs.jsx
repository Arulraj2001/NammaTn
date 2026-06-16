import React, { useState } from "react";
import PageHero from "@/components/common/PageHero";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Briefcase, Plus, X, Loader2, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import { createJob, detectSuspiciousJob, getActiveJobs } from "@/services/jobAlerts";
import { getAreasByDistrict } from "@/services/areas";
import { DISTRICTS } from "@/lib/districts";
import { usePageMeta } from "@/hooks/usePageMeta";
import JobCard from "@/components/phase8/JobCard";
import { checkRateLimit, sanitizeText } from "@/lib/security";
import { useNotify } from "@/hooks/useNotify";

const JOB_TYPES = [
  { value: "part_time", label: "Part-time" },
  { value: "temporary", label: "Temporary" },
  { value: "local_hiring", label: "Local Hiring" },
  { value: "delivery", label: "Delivery" },
  { value: "helper", label: "Helper Required" },
  { value: "urgent_manpower", label: "Urgent Manpower" },
  { value: "other", label: "Other" },
];

export default function Jobs() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();
  const { notify } = useNotify();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);

  const handleToggleForm = () => {
    if (!showForm && !isAuthenticated) {
      requireAuth(() => setShowForm(true), "Sign in to post a job alert");
      return;
    }
    setShowForm(f => !f);
  };
  const [filterDistrict, setFilterDistrict] = useState("");
  const [filterType, setFilterType] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", job_type: "local_hiring",
    district_slug: "", district_name: "", area_slug: "", area_name: "",
    salary_info: "", duration: "", contact_info: "", contact_visible: false,
  });
  const [formError, setFormError] = useState(null);

  usePageMeta({ title: "NammaTN - Local Jobs", description: "Discover local job updates and employment opportunities shared for Tamil Nadu communities. Report suspicious job posts." });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", filterDistrict, filterType],
    queryFn: () => getActiveJobs(40, filterDistrict, filterType),
    staleTime: 30_000,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["areas-district-jobs", form.district_slug],
    queryFn: () => getAreasByDistrict(form.district_slug),
    enabled: !!form.district_slug,
  });

  const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      setShowForm(false);
      setForm({ title: "", description: "", job_type: "local_hiring", district_slug: "", district_name: "", area_slug: "", area_name: "", salary_info: "", duration: "", contact_info: "", contact_visible: false });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim() || !form.description.trim() || !form.district_slug) {
      setFormError("Please fill in title, description and district.");
      return;
    }
    if (!checkRateLimit("job_post", 2, 60 * 60_000)) { setFormError("Please wait before posting another job."); return; }
    if (form.contact_visible && !form.contact_info.trim()) { setFormError("Please enter contact info or uncheck 'Show contact info publicly'."); return; }
    const title = sanitizeText(form.title).substring(0, 200);
    const description = sanitizeText(form.description).substring(0, 1000);
    const isSuspicious = detectSuspiciousJob(title, description);
    // All jobs go pending for admin approval. Suspicious jobs get suspicious safety_status.
    mutation.mutate({ ...form, title, description, status: "pending", safety_status: isSuspicious ? "suspicious" : "pending_review" }, {
      onSuccess: (created) => {
        notify({
          type: "job_pending_review",
          title: "Job submitted for review",
          message: `Your job post "${title.substring(0, 60)}" has been submitted and will be published after admin approval.`,
          target_type: "job_alert",
          target_id: created?.id || "",
        });
      },
    });
  };

  return (
    <div>
      <PageHero
        icon="💼"
        title_en="Local Jobs"
        title_ta="உள்ளூர் வேலை"
        desc_en="Discover local job updates and employment opportunities shared for Tamil Nadu communities. Report suspicious job posts."
        desc_ta="தமிழ்நாடு சமுதாயங்களுக்காக பகிரப்பட்ட உள்ளூர் வேலை வாய்ப்புகளை கண்டுபிடிக்கவும். சந்தேகமான வேலை பதிவுகளை புகாரளிக்கவும்."
        cta_en="Explore Jobs"
        cta_ta="வேலை ஆராய்க"
        ctaPath="/jobs"
        secondary_en="Report Scam Job"
        secondary_ta="மோசடி வேலை புகாரளி"
        secondaryPath="/scams"
        bgFrom="from-green-700"
        bgTo="to-emerald-800"
        lang={lang}
        badge_en="Community Job Alerts"
        badge_ta="சமுதாய வேலை எச்சரிக்கைகள்"
        disclaimer={T("Job posts require admin approval before publishing. Verify before applying.", "வேலை பதிவுகள் வெளியிடப்படும் முன் நிர்வாக ஒப்புதல் தேவை.")}
      />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div />
        <button onClick={handleToggleForm}
          className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? T("Cancel", "ரத்து") : T("Post Job", "வேலை பதிவிடு")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6 space-y-3">
          <h3 className="font-semibold text-slate-800 dark:text-white">{T("Post a Work Alert", "வேலை எச்சரிக்கையை பதிவிடுங்கள்")}</h3>
          <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
            {T("⚠ Job posts require admin approval before publishing.", "⚠ வேலை பதிவுகள் வெளியிடப்படும் முன் நிர்வாக ஒப்புதல் தேவை.")}
          </p>
          <select value={form.job_type} onChange={(e) => setForm(f => ({ ...f, job_type: e.target.value }))}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
            {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder={T("Title (e.g. Need delivery rider in Adyar)", "தலைப்பு")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none" />
          <textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder={T("Details about the work...", "வேலை விவரங்கள்...")} rows={3}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm resize-none focus:outline-none" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.district_slug} onChange={(e) => {
              const d = DISTRICTS.find(d => d.slug === e.target.value);
              setForm(f => ({ ...f, district_slug: e.target.value, district_name: d?.name_en || "", area_slug: "", area_name: "" }));
            }} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
              <option value="">{T("District *", "மாவட்டம் *")}</option>
              {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
            </select>
            <select value={form.area_slug} onChange={(e) => {
              const a = areas.find(a => a.slug === e.target.value);
              setForm(f => ({ ...f, area_slug: e.target.value, area_name: a?.name_en || "" }));
            }} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
              <option value="">{T("Area", "பகுதி")}</option>
              {areas.map(a => <option key={a.slug} value={a.slug}>{T(a.name_en, a.name_ta)}</option>)}
            </select>
            <input value={form.salary_info} onChange={(e) => setForm(f => ({ ...f, salary_info: e.target.value }))}
              placeholder={T("Salary (e.g. ₹500/day)", "சம்பளம்")}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none" />
            <input value={form.duration} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))}
              placeholder={T("Duration (e.g. 1 week)", "காலம்")}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
            <input type="checkbox" checked={form.contact_visible} onChange={(e) => setForm(f => ({ ...f, contact_visible: e.target.checked }))} className="accent-green-600" />
            {T("Show contact info publicly", "தொடர்பு தகவலை பகிரங்கமாக காட்டு")}
          </label>
          {form.contact_visible && (
            <input value={form.contact_info} onChange={(e) => setForm(f => ({ ...f, contact_info: e.target.value }))}
              placeholder={T("Contact info (phone/WhatsApp)", "தொடர்பு தகவல்")}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none" />
          )}
          {formError && <p className="text-red-500 text-xs">{formError}</p>}
          <button type="submit" disabled={mutation.isPending}
            className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
            {mutation.isPending ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Submitting...</span> : T("Submit for Review", "மதிப்பாய்விற்கு சமர்ப்பி")}
          </button>
        </form>
      )}

      {/* Safety warning */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-4 text-xs text-amber-700 dark:text-amber-400">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>{T("Do not pay money for job offers. Report fake jobs, advance-fee scams, and suspicious recruiters.", "வேலை வாய்ப்புகளுக்கு பணம் செலுத்தாதீர்கள். போலி வேலைகள், முன்பணம் மோசடிகள் மற்றும் சந்தேகமான ஆட்சேர்ப்பாளர்களை புகாரளிக்கவும்.")}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-300 focus:outline-none">
          <option value="">{T("All Districts", "அனைத்து மாவட்டங்கள்")}</option>
          {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
        </select>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {["", ...JOB_TYPES.map(t => t.value)].map((type) => (
          <button key={type || "all"} onClick={() => setFilterType(type)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex-shrink-0 transition-all ${filterType === type ? "bg-green-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>
            {type ? JOB_TYPES.find(t => t.value === type)?.label : T("All", "அனைத்தும்")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{T("No local job updates yet.", "இன்னும் உள்ளூர் வேலை புதுப்பிப்புகள் இல்லை.")}</p>
          <p className="text-xs text-slate-400 mt-1">{T("Check again later or share a trusted opportunity.", "பின்னர் மீண்டும் சரிபார்க்கவும் அல்லது நம்பகமான வாய்ப்பை பகிரவும்.")}</p>
        </div>
      ) : (
        <div className="space-y-3">{jobs.map(j => <JobCard key={j.id} item={j} />)}</div>
      )}
    </div>
    </div>
  );
}