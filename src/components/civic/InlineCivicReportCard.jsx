"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, PhoneCall, CheckCircle2, Share2, Send, Loader2, Building2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/api/supabaseClient";
import { generateCivicReceiptId, makeTimelineEvent } from "@/lib/civicReceipt";
import { CATEGORIES } from "@/lib/categories";

// Department helpline mappings per category
const CATEGORY_HELPLINE_MAP = {
  "road-infrastructure": { dept: "Highways & Municipal Corporation", phone: "1913", icon: "🚧" },
  "road-problem": { dept: "Highways & Municipal Corporation", phone: "1913", icon: "🚧" },
  "water-sanitation": { dept: "TWAD & Metrowater Board", phone: "044-45674567", icon: "🚰" },
  "water-issue": { dept: "TWAD & Metrowater Board", phone: "044-45674567", icon: "🚰" },
  "electricity": { dept: "TANGEDCO Minnalagam", phone: "1912", icon: "⚡" },
  "power-cut": { dept: "TANGEDCO Minnalagam", phone: "1912", icon: "⚡" },
  "public-safety": { dept: "TN Police & Cyber Crime", phone: "1930", icon: "🛡️" },
  "scam": { dept: "National Cyber Crime Helpline", phone: "1930", icon: "⚠️" },
  "transport": { dept: "Transport Dept & RTO", phone: "1800-425-1515", icon: "🚌" },
  "environment": { dept: "Pollution Control Board & ULB", phone: "1913", icon: "🌱" },
  "general": { dept: "Chief Minister Helpline", phone: "1100", icon: "🏛️" },
};

export default function InlineCivicReportCard({
  district,
  category = null,
  areaName = "",
  onReportSubmitted,
}) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [selectedCategory, setSelectedCategory] = useState(
    category?.slug || "road-infrastructure"
  );
  const [streetName, setStreetName] = useState("");
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState("high");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedPost, setSubmittedPost] = useState(null);

  // Attribution tracking for organic conversions
  const [attribution, setAttribution] = useState({
    utm_source: "direct",
    utm_medium: "web",
    utm_campaign: "civic-directory",
    referrer: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      setAttribution({
        utm_source: sp.get("utm_source") || (document.referrer.includes("google") ? "google" : "direct"),
        utm_medium: sp.get("utm_medium") || (document.referrer.includes("google") ? "organic" : "web"),
        utm_campaign: sp.get("utm_campaign") || "civic-pSEO-directory",
        utm_term: sp.get("utm_term") || sp.get("q") || "",
        referrer: document.referrer || "",
      });
    }
  }, []);

  const currentDept = CATEGORY_HELPLINE_MAP[selectedCategory] || {
    dept: "Municipal Corporation & CM Helpline",
    phone: "1100",
    icon: "🏛️",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!streetName.trim()) {
      setErrorMsg(T("Please specify the street name or landmark.", "தெரு பெயர் அல்லது அடையாளத்தை உள்ளிடவும்."));
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setErrorMsg(T("Please provide a brief description of the grievance.", "புகார் விவரத்தை சுருக்கமாக குறிப்பிடவும்."));
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const receiptId = generateCivicReceiptId();
      const districtNameEn = district?.name || district?.name_en || "Tamil Nadu";
      const districtNameTa = district?.name_ta || districtNameEn;
      const districtSlug = district?.slug || "chennai";

      const matchedCat = CATEGORIES.find((c) => c.slug === selectedCategory);
      const catNameEn = matchedCat ? matchedCat.name_en : "Civic Grievance";
      const catNameTa = matchedCat ? matchedCat.name_ta : "குடிமை புகார்";

      const locationLabel = areaName ? `${areaName}, ${streetName.trim()}` : streetName.trim();
      const titleEn = `${locationLabel}: ${catNameEn} Grievance`;
      const titleTa = `${locationLabel}: ${catNameTa} புகார்`;

      const contentEn = `${description.trim()}. Location: ${locationLabel}, ${districtNameEn}. Assigned to ${currentDept.dept}. Documented on VizhiTN for community verification and official follow-up.`;
      const contentTa = `${description.trim()}. இடம்: ${locationLabel}, ${districtNameTa}. பொறுப்பு துறை: ${currentDept.dept}. சமூக சரிபார்ப்புக்காக VizhiTN-ல் ஆவணப்படுத்தப்பட்டுள்ளது.`;

      const slug = `civic-grievance-${districtSlug}-${Date.now().toString(36)}`;

      const payload = {
        title_en: titleEn,
        title_ta: titleTa,
        content_en: contentEn,
        content_ta: contentTa,
        post_type: "complaint",
        category_slug: selectedCategory,
        category_name: catNameEn,
        district_slug: districtSlug,
        district_name: districtNameEn,
        area_name: areaName || "",
        location_text: streetName.trim(),
        assigned_department: `${currentDept.dept} (Helpline: ${currentDept.phone})`,
        urgency_level: urgency,
        civic_status: "reported",
        civic_receipt_id: receiptId,
        status: "active",
        is_publicly_visible: true,
        is_indexable: true,
        upvotes: 1,
        downvotes: 0,
        comment_count: 0,
        timeline_events: [
          makeTimelineEvent(
            `Civic grievance documented via VizhiTN (${attribution.utm_source})`,
            "Resident",
            "created",
            "user"
          ),
        ],
        slug,
        seo_title: `${titleEn} | ${currentDept.dept}`,
        seo_description: contentEn,
      };

      const { data, error } = await supabase.from("post").insert(payload).select().single();
      if (error) throw error;

      // Trigger instant email alert to admin via Resend
      fetch("/api/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "civic_report",
          data: {
            civic_receipt_id: receiptId,
            title: titleEn,
            category_slug: selectedCategory,
            district_name: districtNameEn,
            location_text: streetName.trim(),
            urgency_level: urgency,
            assigned_department: `${currentDept.dept} (Helpline: ${currentDept.phone})`,
            description: description.trim(),
          },
        }),
      }).catch((e) => console.warn("[NOTIFY ADMIN WARN]:", e));

      setSubmittedPost(data || payload);
      if (onReportSubmitted) onReportSubmitted(data || payload);
    } catch (err) {
      console.error("[INLINE CIVIC REPORT] Error inserting post:", err);
      setErrorMsg(T("Could not submit grievance. Please try again.", "புகாரை பதிவு செய்ய முடியவில்லை. மீண்டும் முயற்சிக்கவும்."));
    } finally {
      setLoading(false);
    }
  };

  const districtDisplayName = district
    ? (lang === "ta" ? (district.name_ta || district.name_en || district.name) : (district.name_en || district.name))
    : T("Tamil Nadu", "தமிழ்நாடு");

  if (submittedPost) {
    const shareText = encodeURIComponent(
      `🏛️ *Civic Grievance Logged on VizhiTN*\n` +
      `📍 Location: ${submittedPost.location_text}, ${districtDisplayName}\n` +
      `🔖 Civic Receipt ID: ${submittedPost.civic_receipt_id}\n` +
      `📞 Department Helpline: ${currentDept.phone}\n` +
      `Confirm & Verify this issue: https://www.vizhitn.in/${district?.slug || "chennai"}`
    );

    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-lg text-slate-900 dark:text-white transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-black uppercase tracking-wider">
              <span>{T("CIVIC RECEIPT ISSUED", "குடிமை ரசீது வழங்கப்பட்டது")}</span>
              <span>•</span>
              <span className="font-mono">{submittedPost.civic_receipt_id}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {T(`Grievance Documented for ${submittedPost.location_text}`, `${submittedPost.location_text} புகார் பதிவு செய்யப்பட்டது`)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {T(
                `Your public Civic Receipt has been generated. Call official ${currentDept.dept} at ${currentDept.phone} referencing this report. Share with neighbors to gather community verification.`,
                `உங்கள் பொது குடிமை ரசீது உருவாக்கப்பட்டுள்ளது. ${currentDept.dept} (${currentDept.phone}) உதவி எண்ணை அழைக்கவும். கூடுதல் சரிபார்ப்புக்கு அண்டை வீட்டாருடன் பகிரவும்.`
              )}
            </p>

            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href={`tel:${currentDept.phone}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                {T(`Call ${currentDept.phone}`, `${currentDept.phone}-ஐ அழைக்க`)}
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-extrabold shadow-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
                {T("Ask Neighbors to Verify", "அண்டை வீட்டார் சரிபார்க்க பகிர்க")}
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmittedPost(null);
                  setStreetName("");
                  setDescription("");
                }}
                className="text-xs font-semibold text-slate-500 hover:underline px-3 py-2"
              >
                {T("File Another Grievance", "மற்றொரு புகார் பதிவிட")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-cyan-500/10 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-cyan-950/20 border-2 border-blue-400/50 dark:border-blue-700/50 rounded-3xl p-5 sm:p-7 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {T(`File a Civic Grievance in ${areaName ? `${areaName}, ${districtDisplayName}` : districtDisplayName}`, `${areaName ? `${areaName}, ${districtDisplayName}` : districtDisplayName} - பொதுப் புகார் பதிவிடுக`)}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {T("Creates a verified public Civic Receipt with official helpline routing.", "அதிகாரப்பூர்வ உதவி எண் இணைப்புடன் கூடிய பொது குடிமை ரசீது.")}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-[11px] font-bold self-start sm:self-center border border-blue-300 dark:border-blue-700">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          {T("OFFICIAL HELPLINE LINKED", "அரசு உதவி எண் இணைப்பு")}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Selector Chips */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {T("Grievance Category", "புகார் பிரிவு")}
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { slug: "road-infrastructure", en: "Road / Pothole", ta: "சாலை / பள்ளம்" },
              { slug: "water-sanitation", en: "Water / Drainage", ta: "குடிநீர் / கழிவுநீர்" },
              { slug: "environment", en: "Garbage / Waste", ta: "குப்பை / தூய்மை" },
              { slug: "electricity", en: "Streetlight / EB", ta: "தெருவிளக்கு / மின்சாரம்" },
              { slug: "public-safety", en: "Public Safety", ta: "பொது பாதுகாப்பு" },
            ].map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === cat.slug
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm scale-[1.02]"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400"
                }`}
              >
                {T(cat.en, cat.ta)}
              </button>
            ))}
          </div>
        </div>

        {/* Street / Location */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {T("Exact Street / Ward / Landmark", "சரியான தெru / வார்டு / அடையாளம்")} *
          </label>
          <input
            type="text"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            placeholder={T(`e.g., Cross Street, Ward 14, Near Government Hospital...`, `எ.கா., குறுக்கு தெரு, வார்டு 14, அரசு மருத்துவமனை அருகில்...`)}
            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
          />
        </div>

        {/* Issue Description */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {T("Issue Details (What needs fixing?)", "புகார் விவரம் (என்ன பிரச்சனை?)")} *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder={T(`Describe the issue, how long it has been unresolved, and hazards caused...`, `சிக்கல் என்ன, எத்தனை நாட்களாக உள்ளது போன்ற விவரங்களை விவரிக்கவும்...`)}
            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm resize-none"
          />
        </div>

        {/* Urgency Level Selector */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {T("Urgency Level", "அவசர நிலை")}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "medium", en: "Normal", ta: "சாதாரண" },
              { id: "high", en: "High", ta: "அவசரம்" },
              { id: "critical", en: "Hazard / Critical", ta: "ஆபத்து / தீவிர" },
            ].map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => setUrgency(u.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
                  urgency === u.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-blue-400"
                }`}
              >
                {T(u.en, u.ta)}
              </button>
            ))}
          </div>
        </div>

        {/* Helpline Routing Alert Banner */}
        <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl p-3 border border-blue-200 dark:border-blue-900 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{currentDept.icon}</span>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentDept.dept}</span>
              <span className="text-slate-500 text-[11px] block">{T("Assigned Official Department", "பொறுப்பான அரசுத் துறை")}</span>
            </div>
          </div>
          <a
            href={`tel:${currentDept.phone}`}
            className="font-mono font-black text-blue-600 dark:text-blue-400 px-3 py-1 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800"
          >
            📞 {currentDept.phone}
          </a>
        </div>

        {errorMsg && (
          <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {errorMsg}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
            {T("Documents proof on public Civic Receipt & enables community verification.", "பொது குடிமை ரசீது உருவாக்கப்பட்டு சமூக சரிபார்ப்பு இயங்கும்.")}
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-black tracking-wide uppercase shadow-md transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {T("Filing Grievance...", "பதிவிடுகிறது...")}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {T("Generate Civic Proof", "குடிமை ரசீது பெறுக")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
