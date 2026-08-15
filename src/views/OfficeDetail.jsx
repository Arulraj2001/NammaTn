"use client";

import React, { useState } from "react";
import { useParams, Link } from "@/lib/router-compat";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Building2, Clock, Plus, X, Loader2, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { OFFICES, getOfficeBySlug } from "@/lib/offices";
import { DISTRICTS } from "@/lib/districts";
import { getOfficeReports, createOfficeReport, summarizeWaitingTime } from "@/services/officeReports";
import { formatDistanceToNow } from "date-fns";
import { usePageMeta } from "@/hooks/usePageMeta";
import { checkRateLimit } from "@/lib/security";
import VerifiedBadge from "@/components/phase8/VerifiedBadge";
import { useAuth } from "@/lib/AuthContext";
import { useAuthModal } from "@/context/AuthModalContext";
import SidebarRelatedLinks from "@/components/seo/SidebarRelatedLinks";

const WAIT_LABELS = { less_30min: "< 30 min", "30_60min": "30–60 min", "1_2hrs": "1–2 hrs", "2_3hrs": "2–3 hrs", more_3hrs: "> 3 hrs", not_served: "Not Served" };
const STATUS_LABELS = { open_normal: { l: "Open (Normal)", c: "text-green-600" }, open_slow: { l: "Open (Slow)", c: "text-yellow-600" }, partial: { l: "Partial Service", c: "text-orange-600" }, closed: { l: "Closed", c: "text-red-600" }, system_down: { l: "System Down", c: "text-red-600" } };

export default function OfficeDetail({ initialSlug, initialDistrict = "" }) {
  const routeParams = useParams();
  const slug = initialSlug || routeParams.slug;
  const defaultDistrict = initialDistrict;
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const qc = useQueryClient();
  const office = getOfficeBySlug(slug);
  const [showForm, setShowForm] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(defaultDistrict);
  const [form, setForm] = useState({ waiting_time: "30_60min", service_speed: "normal", office_status: "open_normal", staff_behavior: "good", cleanliness: "average", notes: "", purpose_of_visit: "", district_slug: defaultDistrict, district_name: "", is_anonymous: true });
  const [formError, setFormError] = useState(null);
  const { isAuthenticated } = useAuth();
  const { requireAuth } = useAuthModal();

  const handleToggleForm = () => {
    if (!showForm && !isAuthenticated) {
      requireAuth(() => setShowForm(true), T("Sign in to report office status", "அலுவலக நிலையை புகாரளிக்க உள்நுழையுங்கள்"));
      return;
    }
    setShowForm(f => !f);
  };

  usePageMeta({ title: office ? `${office.name_en} Reports – VizhiTN` : "Office Reports" });

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["office-reports", slug, selectedDistrict],
    queryFn: () => selectedDistrict ? getOfficeReports(slug, 30).then(r => r.filter(rep => rep.district_slug === selectedDistrict)) : getOfficeReports(slug, 30),
    enabled: !!slug,
  });

  const avgWait = summarizeWaitingTime(reports);

  const mutation = useMutation({
    mutationFn: createOfficeReport,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["office-reports"] });
      setShowForm(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(null);
    if (!form.district_slug) { setFormError("Please select a district."); return; }
    if (!checkRateLimit("office_report", 2, 10 * 60_000)) { setFormError("You're reporting too fast. Please wait."); return; }
    mutation.mutate({ ...form, office_slug: slug, office_name: office?.name_en || slug, notes: form.notes.substring(0, 500) });
  };

  if (!office) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">
      <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
      <p>Office not found.</p>
      <Link to="/offices" className="text-blue-600 text-sm hover:underline mt-2 block">← All Offices</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/offices" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> {T("All Offices", "அனைத்து அலுவலகங்கள்")}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <main className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-300 dark:border-slate-700 p-5 mb-5">
            <div className="flex items-center gap-4 mb-3">
              <span className="text-4xl">{office.icon}</span>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{T(office.name_en, office.name_ta)}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">{reports.length} {T("community reports", "சமுதாய அறிக்கைகள்")}</p>
              </div>
            </div>
            {avgWait && (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-orange-500" />
                {T("Avg. waiting time:", "சராசரி காத்திருப்பு நேரம்:")} <span className="text-orange-600 font-bold">{avgWait}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}
              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none">
              <option value="">{T("All Districts", "அனைத்து மாவட்டங்கள்")}</option>
              {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
            </select>
            <button onClick={handleToggleForm}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors">
              {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showForm ? T("Cancel", "ரத்து") : T("Report Visit", "வருகையை புகாரளி")}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6 space-y-3">
              <h3 className="font-semibold text-slate-800 dark:text-white text-sm">{T("Report Office Visit", "அலுவலக வருகையை புகாரளி")}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{T("District *", "மாவட்டம் *")}</label>
                  <select value={form.district_slug} onChange={(e) => {
                    const d = DISTRICTS.find(d => d.slug === e.target.value);
                    setForm(f => ({ ...f, district_slug: e.target.value, district_name: d?.name_en || "" }));
                  }} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
                    <option value="">Select District</option>
                    {DISTRICTS.map(d => <option key={d.slug} value={d.slug}>{T(d.name_en, d.name_ta)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{T("Waiting Time", "காத்திருப்பு நேரம்")}</label>
                  <select value={form.waiting_time} onChange={(e) => setForm(f => ({ ...f, waiting_time: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
                    {Object.entries(WAIT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{T("Office Status", "அலுவலக நிலை")}</label>
                  <select value={form.office_status} onChange={(e) => setForm(f => ({ ...f, office_status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none">
                    {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">{T("Purpose of Visit", "வருகையின் நோக்கம்")}</label>
                  <input value={form.purpose_of_visit} onChange={(e) => setForm(f => ({ ...f, purpose_of_visit: e.target.value }))}
                    placeholder="e.g. Patta transfer, Birth cert..." className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:outline-none" />
                </div>
              </div>
              <textarea value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder={T("Describe your experience (staff response, counters active, infrastructure...)", "உங்கள் அனுபவத்தை விவரிக்கவும்...")}
                rows={3} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm resize-none focus:outline-none" />
              {formError && <p className="text-red-500 text-xs">{formError}</p>}
              <button type="submit" disabled={mutation.isPending}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60">
                {mutation.isPending ? <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Submitting...</span> : T("Submit Report", "அறிக்கையை சமர்ப்பி")}
              </button>
            </form>
          )}

          {isLoading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">{T("No visit reports yet.", "இன்னும் வருகை அறிக்கைகள் இல்லை.")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => {
                const statusInfo = STATUS_LABELS[r.office_status] || STATUS_LABELS.open_normal;
                return (
                  <div key={r.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 ${statusInfo.c}`}>{statusInfo.l}</span>
                        {r.waiting_time && <span className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-950 px-2 py-0.5 rounded-md">{WAIT_LABELS[r.waiting_time]}</span>}
                      </div>
                      <span className="text-xs text-slate-400">{r.created_at ? formatDistanceToNow(new Date(r.created_at), { addSuffix: true }) : ""}</span>
                    </div>
                    {r.purpose_of_visit && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Purpose: {r.purpose_of_visit}</p>}
                    {r.notes && <p className="text-sm text-slate-700 dark:text-slate-300">{r.notes}</p>}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{r.district_name}</span>
                      <span>Service: {r.service_speed}</span>
                      <span>Staff: {r.staff_behavior}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Right Sidebar Related Links */}
        <aside className="lg:col-span-4">
          <SidebarRelatedLinks type="office" currentSlug={slug} />
        </aside>
      </div>
    </div>
  );
}
