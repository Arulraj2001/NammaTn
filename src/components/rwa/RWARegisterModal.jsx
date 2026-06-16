import React, { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { DISTRICTS } from "@/lib/districts";

export default function RWARegisterModal({ plan, onClose }) {
  const [form, setForm] = useState({ group_name: "", group_type: "rwa", district_slug: "", area_name: "", admin_email: "", description: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const session = (() => {
    let s = localStorage.getItem("tn_session");
    if (!s) { s = Math.random().toString(36).slice(2); localStorage.setItem("tn_session", s); }
    return s;
  })();

  const district = DISTRICTS.find((d) => d.slug === form.district_slug);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.group_name.trim() || !form.district_slug || !form.admin_email.trim()) return;
    setLoading(true);
    await base44.entities.RWAGroup.create({
      ...form,
      district_name: district?.name_en || "",
      area_name: form.area_name,
      admin_session: session,
      plan: plan.key,
      status: "pending",
    });
    setLoading(false);
    setSubmitted(true);
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Registration Submitted!</h3>
          <p className="text-sm text-slate-500 mb-4">We'll review and set up your {plan.label} dashboard within 48 hours. Check your email for next steps.</p>
          <button onClick={onClose} className="w-full py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Register Your Community</h2>
            <p className="text-xs text-blue-600 font-medium mt-0.5">{plan.label} Plan</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Community / Group Name *</label>
            <input required value={form.group_name} onChange={(e) => set("group_name", e.target.value)}
              placeholder="e.g. Anna Nagar RWA, Sunrise Apartments"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Group Type *</label>
            <select value={form.group_type} onChange={(e) => set("group_type", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none">
              <option value="rwa">Resident Welfare Association (RWA)</option>
              <option value="apartment">Apartment Association</option>
              <option value="traders">Traders Association</option>
              <option value="volunteers">Volunteer Group</option>
              <option value="other">Other Community Group</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">District *</label>
            <select required value={form.district_slug} onChange={(e) => set("district_slug", e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none">
              <option value="">Select district...</option>
              {DISTRICTS.map((d) => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Area / Locality</label>
            <input value={form.area_name} onChange={(e) => set("area_name", e.target.value)} placeholder="e.g. Anna Nagar West"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Admin Email *</label>
            <input required type="email" value={form.admin_email} onChange={(e) => set("admin_email", e.target.value)} placeholder="admin@example.com"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">About Your Community</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={2}
              placeholder="Briefly describe your community group..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none resize-none" />
          </div>

          {plan.price > 0 && (
            <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-200 rounded-xl p-3 text-xs text-purple-700 dark:text-purple-400">
              This is a paid plan (₹{plan.price}/{plan.billing}). Our team will contact you at the provided email for payment within 24 hours.
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold disabled:opacity-50">
            {loading ? "Submitting..." : "Submit Registration"}
          </button>
        </form>
      </div>
    </div>
  );
}