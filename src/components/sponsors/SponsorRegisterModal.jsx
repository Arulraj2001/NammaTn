import React, { useState } from "react";
import { X, CheckCircle, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DISTRICTS } from "@/lib/districts";

const PLANS = [
  { key: "area_dashboard", label: "Area Civic Dashboard", desc: "Support civic transparency for one area" },
  { key: "district_dashboard", label: "District Dashboard", desc: "District-wide civic transparency support" },
  { key: "issue_campaign", label: "Issue Awareness Campaign", desc: "Support a specific community-solvable awareness campaign" },
  { key: "csr_impact", label: "CSR Impact Full Package", desc: "Full dashboard, reports, and public sponsor profile" },
];

const CAMPAIGN_TYPES = [
  { key: "clean_street", label: "🧹 Clean Street Awareness" },
  { key: "garbage_hotspot", label: "🗑️ Garbage Hotspot Documentation" },
  { key: "streetlight_mapping", label: "💡 Streetlight Safety Mapping" },
  { key: "school_zone", label: "🏫 School Zone Awareness" },
  { key: "flood_documentation", label: "🌊 Flood-Prone Area Documentation" },
  { key: "awareness", label: "📢 Public Safety Awareness" },
  { key: "scam_awareness", label: "🚨 Scam Awareness Campaign" },
  { key: "volunteer_support", label: "🤝 Volunteer Support Campaign" },
  { key: "dustbin_support", label: "♻️ Dustbin Placement (with permission)" },
  { key: "other", label: "📋 Other (describe below)" },
];

const SPONSOR_TYPES = [
  { key: "csr", label: "Company / Corporate CSR" },
  { key: "ngo", label: "NGO / Foundation" },
  { key: "rwa", label: "RWA / Community Group" },
  { key: "individual", label: "Individual Philanthropist" },
  { key: "business", label: "Local Business" },
];

export default function SponsorRegisterModal({ onClose, linkedPostId, linkedPostTitle }) {
  const [form, setForm] = useState({
    sponsor_name: "",
    sponsor_type: "csr",
    plan: linkedPostId ? "issue_campaign" : "area_dashboard",
    campaign_type: "clean_street",
    campaign_title: linkedPostTitle ? `Support: ${linkedPostTitle}` : "",
    district_slug: "",
    area_name: "",
    contact_email: "",
    sponsor_note: "",
    budget_inr: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const district = DISTRICTS.find((d) => d.slug === form.district_slug);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;
    setLoading(true);
    await base44.entities.CivicSponsor.create({
      ...form,
      district_name: district?.name_en || "",
      budget_inr: form.budget_inr ? Number(form.budget_inr) : 0,
      status: "pending",
      is_active: false,
      is_verified: false,
      linked_post_ids: linkedPostId ? [linkedPostId] : [],
    });
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Sponsor Interest Registered!</h3>
          <p className="text-sm text-slate-500 mb-2">Our team will review your application and contact you within 48 hours.</p>
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">
            Your sponsor support will only appear publicly after admin review and approval. No payment is collected at this stage.
          </p>
          <button onClick={onClose} className="w-full py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Register as Civic Sponsor</h2>
            <p className="text-xs text-slate-500 mt-0.5">Support verified civic transparency in Tamil Nadu</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-4 h-4" /></button>
        </div>

        {linkedPostId && (
          <div className="mx-5 mt-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-400">
            <strong>Supporting issue:</strong> {linkedPostTitle || linkedPostId}
            <br />This will be recorded as a community awareness support interest for this civic issue.
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Organization / Sponsor Name *</label>
            <input required value={form.sponsor_name} onChange={(e) => set("sponsor_name", e.target.value)}
              placeholder="e.g. GreenCo Solutions, TN Foundation"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Sponsor Type</label>
            <select value={form.sponsor_type} onChange={(e) => set("sponsor_type", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none">
              {SPONSOR_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </div>

          {!linkedPostId && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Sponsorship Plan</label>
              <div className="space-y-2">
                {PLANS.map((p) => (
                  <label key={p.key} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer ${form.plan === p.key ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" : "border-slate-200 dark:border-slate-600"}`}>
                    <input type="radio" name="plan" value={p.key} checked={form.plan === p.key} onChange={() => set("plan", p.key)} className="mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{p.label}</p>
                      <p className="text-xs text-slate-500">{p.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Campaign Type</label>
            <select value={form.campaign_type} onChange={(e) => set("campaign_type", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none">
              {CAMPAIGN_TYPES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Campaign Title</label>
            <input value={form.campaign_title} onChange={(e) => set("campaign_title", e.target.value)}
              placeholder="e.g. Anna Nagar Clean Streets Drive 2026"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">District *</label>
              <select required value={form.district_slug} onChange={(e) => set("district_slug", e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none">
                <option value="">Select...</option>
                {DISTRICTS.map((d) => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Area</label>
              <input value={form.area_name} onChange={(e) => set("area_name", e.target.value)} placeholder="Area name"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Contact Email *</label>
            <input required type="email" value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)}
              placeholder="csr@company.com"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Estimated Support Budget (₹) — Optional</label>
            <input type="number" value={form.budget_inr} onChange={(e) => set("budget_inr", e.target.value)} placeholder="e.g. 50000"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Sponsor Note (Public — will be shown on your sponsor profile after approval)</label>
            <textarea value={form.sponsor_note} onChange={(e) => set("sponsor_note", e.target.value)} rows={2}
              placeholder="Brief public statement about why you're supporting this cause..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none resize-none" />
          </div>

          {/* Integrity agreement */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400 space-y-1">
            <p><AlertTriangle className="w-3 h-3 inline mr-1" /><strong>Sponsor Integrity Policy:</strong></p>
            <ul className="space-y-0.5 ml-4 list-disc">
              <li>NammaTN234 independently verifies all claimed impact.</li>
              <li>Sponsors cannot influence Civic Receipt content, status, or rankings.</li>
              <li>Sponsored content is always clearly labeled.</li>
              <li>Sponsorship appears publicly only after admin approval.</li>
              <li>No payment is collected at this stage — our team will contact you.</li>
            </ul>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5" />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              I agree to the sponsor integrity policy and understand that my sponsorship will not affect Civic Receipt data, community verification, or issue rankings.
            </span>
          </label>

          <button type="submit" disabled={loading || !agreed}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-all">
            {loading ? "Submitting..." : "Register Sponsorship Interest"}
          </button>
        </form>
      </div>
    </div>
  );
}