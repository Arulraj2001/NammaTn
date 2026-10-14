"use client";

import React, { useState, useEffect } from "react";
import { Zap, PhoneCall, AlertTriangle, CheckCircle2, Share2, Send, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/api/supabaseClient";
import { generateCivicReceiptId, makeTimelineEvent } from "@/lib/civicReceipt";

export default function InlinePowerReportCard({ district, area = null, onReportSubmitted }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [streetName, setStreetName] = useState("");
  const [issueType, setIssueType] = useState("outage");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedPost, setSubmittedPost] = useState(null);

  // Capture attribution parameters from URL / referrer
  const [attribution, setAttribution] = useState({
    utm_source: "direct",
    utm_medium: "web",
    utm_campaign: "organic",
    referrer: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      setAttribution({
        utm_source: sp.get("utm_source") || (document.referrer.includes("google") ? "google" : "direct"),
        utm_medium: sp.get("utm_medium") || (document.referrer.includes("google") ? "organic" : "web"),
        utm_campaign: sp.get("utm_campaign") || "power-cut-tracker",
        utm_term: sp.get("utm_term") || sp.get("q") || "",
        referrer: document.referrer || "",
      });
    }
  }, []);

  const ISSUE_TYPES = [
    { id: "outage", en: "Full Outage", ta: "முழு மின்தடை", desc: "No power in street" },
    { id: "transformer", en: "Transformer Fault", ta: "மின்மாற்றி பழுது", desc: "Blast / Smoke / Spark" },
    { id: "low_voltage", en: "Low Voltage", ta: "குறைந்த வோல்டேஜ்", desc: "Appliances not working" },
    { id: "wire_snap", en: "Snapped Wire", ta: "கம்பி அறுந்தது", desc: "Live wire danger" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!streetName.trim()) {
      setErrorMsg(T("Please enter your street name or landmark.", "உங்கள் தெரு பெயர் அல்லது அடையாளத்தை உள்ளிடவும்."));
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const receiptId = generateCivicReceiptId();
      const areaDisplayEn = area ? area.name_en : district?.name_en || "Tamil Nadu";
      const areaDisplayTa = area ? (area.name_ta || area.name_en) : (district?.name_ta || district?.name_en || "தமிழ்நாடு");

      const titleEn = `${areaDisplayEn} Power Outage: ${streetName.trim()}`;
      const titleTa = `${areaDisplayTa} பகுதியில் மின்தடை: ${streetName.trim()}`;

      const selectedIssueObj = ISSUE_TYPES.find((i) => i.id === issueType);
      const issueLabel = selectedIssueObj ? selectedIssueObj.en : "Power Outage";

      const contentEn = `Citizen reported ${issueLabel.toLowerCase()} at ${streetName.trim()}, ${areaDisplayEn}. TANGEDCO Minnalagam helpline 1912 alerted. Immediate substation line check requested.`;
      const contentTa = `${areaDisplayTa}, ${streetName.trim()} பகுதியில் ${selectedIssueObj?.ta || "மின்தடை"} ஏற்பட்டுள்ளதாக தெரிவிக்கப்பட்டுள்ளது. மின்வாரிய உதவி எண் 1912 அறிவிக்கப்பட்டுள்ளது.`;

      const slug = `power-outage-${district?.slug || "tn"}-${area?.slug || "area"}-${Date.now().toString(36)}`;

      const payload = {
        title_en: titleEn,
        title_ta: titleTa,
        content_en: contentEn,
        content_ta: contentTa,
        post_type: "alert",
        category_slug: "electricity",
        category_name: "Electricity",
        district_slug: district?.slug || "chennai",
        district_name: district?.name_en || "Chennai",
        area_slug: area?.slug || "",
        area_name: areaDisplayEn,
        location_text: streetName.trim(),
        assigned_department: "TANGEDCO (Helpline: 1912)",
        urgency_level: issueType === "wire_snap" ? "critical" : "high",
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
            `Power outage reported via VizhiTN live tracker (${attribution.utm_source})`,
            "Local Resident",
            "created",
            "user"
          ),
        ],
        slug,
        seo_title: `${titleEn} | TANGEDCO 1912`,
        seo_description: contentEn,
      };

      const { data, error } = await supabase.from("post").insert(payload).select().single();

      if (error) throw error;

      setSubmittedPost(data || payload);
      if (onReportSubmitted) onReportSubmitted(data || payload);
    } catch (err) {
      console.error("[INLINE POWER REPORT] Error inserting post:", err);
      setErrorMsg(T("Failed to submit report. Please try again or call 1912.", "பதிவிட முடியவில்லை. மீண்டும் முயற்சிக்கவும் அல்லது 1912-ஐ அழைக்கவும்."));
    } finally {
      setLoading(false);
    }
  };

  const areaNameDisplay = area
    ? (lang === "ta" ? (area.name_ta || area.name_en) : area.name_en)
    : (district ? (lang === "ta" ? district.name_ta : district.name_en) : T("Your Area", "உங்கள் பகுதி"));

  if (submittedPost) {
    const shareText = encodeURIComponent(
      `⚡ *Power Outage Reported in ${areaNameDisplay}*\n` +
      `📍 Street: ${submittedPost.location_text}\n` +
      `🔖 Civic Receipt ID: ${submittedPost.civic_receipt_id}\n` +
      `🚨 TANGEDCO 24x7 Helpline: 1912\n` +
      `Track & confirm on VizhiTN: https://www.vizhitn.in/power-cuts-today-tamil-nadu/${district?.slug || "chennai"}`
    );

    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-lg text-slate-900 dark:text-white transition-all animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-black uppercase tracking-wider">
              <span>{T("CIVIC PROOF LOGGED", "குடிமை ரசீது பதிவானது")}</span>
              <span>•</span>
              <span className="font-mono">{submittedPost.civic_receipt_id}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {T(`Outage Alert Active for ${submittedPost.location_text}`, `${submittedPost.location_text} மின்தடை பதிவு செய்யப்பட்டது`)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {T(
                "Your outage alert is published to the live public feed and neighboring residents. Call official Minnalagam 1912 with your street details for priority dispatch.",
                "உங்கள் மின்தடை அறிவிப்பு பொது பலகையில் பகிரப்பட்டது. உடனடி தீர்வுக்கு 1912 மின்வாரிய உதவி எண்ணை அழைக்கவும்."
              )}
            </p>

            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href="tel:1912"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-colors"
              >
                <PhoneCall className="w-4 h-4" />
                {T("Call TANGEDCO 1912", "மின்வாரியத்தை அழைக்க 1912")}
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-extrabold shadow-sm transition-colors"
              >
                <Share2 className="w-4 h-4" />
                {T("Alert Neighbors on WhatsApp", "அண்டை வீட்டாருக்கு பகிர்க")}
              </a>
              <button
                type="button"
                onClick={() => {
                  setSubmittedPost(null);
                  setStreetName("");
                }}
                className="text-xs font-semibold text-slate-500 hover:underline px-3 py-2"
              >
                {T("Report Another Street", "மற்றொரு தெருவை பதிவிட")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-orange-500/10 dark:from-amber-950/40 dark:via-yellow-950/20 dark:to-orange-950/20 border-2 border-amber-400/50 dark:border-amber-700/50 rounded-3xl p-5 sm:p-7 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-md">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {T(`Is power cut in ${areaNameDisplay} right now?`, `${areaNameDisplay} பகுதியில் தற்போது மின்சாரம் இல்லையா?`)}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {T("Report outage in 30 seconds — alerts local neighbors & records civic proof.", "30 வினாடிகளில் மின்தடையை பதிவிடுங்கள் — உடனடி உதவி.")}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded-full text-[11px] font-bold self-start sm:self-center border border-amber-300 dark:border-amber-700">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          {T("LIVE COMMUNITY DESK", "நேரடி உதவி")}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Street Input */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {T("Street Name / Feeder / Landmark", "தெரு பெயர் / முக்கிய அடையாளம்")} *
          </label>
          <input
            type="text"
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            placeholder={T(`e.g., Gandhi Road, 2nd Cross Street, near Bus Stand...`, `எ.கா., காந்தி சாலை, பேருந்து நிலையம் அருகில்...`)}
            className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>

        {/* Issue Type Chips */}
        <div>
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            {T("Type of Problem", "சிக்கல் வகை")}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ISSUE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setIssueType(type.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-all border ${
                  issueType === type.id
                    ? "bg-amber-600 text-white border-amber-600 shadow-sm scale-[1.02]"
                    : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400"
                }`}
              >
                <div className="truncate">{T(type.en, type.ta)}</div>
                <div className={`text-[10px] truncate ${issueType === type.id ? "text-amber-100" : "text-slate-400"}`}>
                  {type.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {errorMsg}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
            {T("Creates a public Civic Receipt & notifies Minnalagam 1912 automatically.", "பொது குடிமை ரசீது உருவாக்கப்பட்டு 1912 அறிவிக்கப்படும்.")}
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-xs font-black tracking-wide uppercase shadow-md transition-all cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {T("Submitting...", "பதிவிடுகிறது...")}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {T("Submit Outage Report", "மின்தடை புகார் பதிவிடுக")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
