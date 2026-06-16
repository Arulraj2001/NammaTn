import React, { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { LISTING_CATEGORIES, LISTING_PLANS } from "@/lib/listingCategories";
import { DISTRICTS } from "@/lib/districts";
import { useLanguage } from "@/context/LanguageContext";
import { useNotify } from "@/hooks/useNotify";

export default function ListingSubmitModal({ onClose }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const { notify } = useNotify();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    business_name: "", category: "plumber", plan: "free",
    description: "", district_slug: "", area_name: "",
    contact_phone: "", contact_whatsapp: "", contact_email: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const session = (() => {
    let s = localStorage.getItem("tn_session");
    if (!s) { s = Math.random().toString(36).slice(2); localStorage.setItem("tn_session", s); }
    return s;
  })();

  const district = DISTRICTS.find((d) => d.slug === form.district_slug);

  const handleSubmit = async () => {
    if (!form.business_name.trim() || !form.district_slug) return;
    setLoading(true);
    const created = await base44.entities.LocalListing.create({
      ...form,
      district_name: district?.name_en || "",
      session_ref: session,
      status: "pending",
    });
    notify({
      type: "listing_verified",
      title: "Listing submitted for review",
      message: `"${form.business_name}" has been submitted and will be published after admin approval.`,
      target_type: "local_listing",
      target_id: created?.id || "",
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
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{T("Listing Submitted!", "பட்டியல் சமர்ப்பிக்கப்பட்டது!")}</h3>
          <p className="text-sm text-slate-500 mb-4">{T("Your listing is under review. It will go live within 24 hours after approval.", "உங்கள் பட்டியல் மதிப்பாய்வில் உள்ளது. ஒப்புதலுக்கு பிறகு 24 மணி நேரத்தில் இயக்கமாகும்.")}</p>
          <button onClick={onClose} className="w-full py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700">
            {T("Close", "மூடு")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">{T("List Your Service", "உங்கள் சேவையை பட்டியலிடுங்கள்")}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{T("Step", "படி")} {step}/2</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">{T("Business / Service Name *", "வணிக / சேவை பெயர் *")}</label>
                <input value={form.business_name} onChange={(e) => set("business_name", e.target.value)}
                  placeholder={T("e.g. Ravi Plumbing Services", "எ.கா. ரவி குழாய் சேவைகள்")}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">{T("Category *", "வகை *")}</label>
                <select value={form.category} onChange={(e) => set("category", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none">
                  {LISTING_CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">{T("District *", "மாவட்டம் *")}</label>
                <select value={form.district_slug} onChange={(e) => set("district_slug", e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none">
                  <option value="">{T("Select district...", "மாவட்டம் தேர்வு...")}</option>
                  {DISTRICTS.map((d) => <option key={d.slug} value={d.slug}>{d.name_en}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">{T("Area / Locality", "பகுதி / இடம்")}</label>
                <input value={form.area_name} onChange={(e) => set("area_name", e.target.value)}
                  placeholder={T("e.g. Anna Nagar, Perambur", "எ.கா. அண்ணா நகர்")}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">{T("Description", "விளக்கம்")}</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
                  rows={3} placeholder={T("Describe your services...", "உங்கள் சேவைகளை விவரிக்கவும்...")}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none resize-none" />
              </div>
              <button onClick={() => setStep(2)} disabled={!form.business_name.trim() || !form.district_slug}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {T("Next: Contact & Plan", "அடுத்து: தொடர்பு & திட்டம்")}
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">{T("Phone Number", "தொலைபேசி எண்")}</label>
                <input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)}
                  type="tel" placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">{T("WhatsApp Number", "WhatsApp எண்")}</label>
                <input value={form.contact_whatsapp} onChange={(e) => set("contact_whatsapp", e.target.value)}
                  type="tel" placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none" />
              </div>

              {/* Plan selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">{T("Listing Plan", "பட்டியல் திட்டம்")}</label>
                <div className="space-y-2">
                  {LISTING_PLANS.map((plan) => (
                    <label key={plan.key} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.plan === plan.key ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" : "border-slate-200 dark:border-slate-600 hover:border-blue-300"}`}>
                      <input type="radio" name="plan" value={plan.key} checked={form.plan === plan.key} onChange={() => set("plan", plan.key)} className="mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800 dark:text-white">{plan.label}</span>
                          {plan.badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${plan.badgeColor}`}>{plan.badge}</span>}
                        </div>
                        <p className="text-xs text-blue-600 font-bold mt-0.5">{plan.price === 0 ? "Free" : `₹${plan.price}/${plan.billing}`}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{plan.features[0]}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {form.plan !== "free" && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-400">
                  {T("After submission, our team will contact you for payment and verification within 24 hours.", "சமர்ப்பிப்பிற்கு பிறகு, 24 மணி நேரத்தில் கட்டண மற்றும் சரிபார்ப்பிற்கு எங்கள் குழு தொடர்புகொள்ளும்.")}
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50">
                  {T("Back", "பின்")}
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {loading ? T("Submitting...", "சமர்ப்பிக்கிறது...") : T("Submit Listing", "பட்டியல் சமர்ப்பி")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}