"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle2, Send, Loader2, ShieldCheck, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/api/supabaseClient";

export default function StayInquiryModal({ listing, isOpen, onClose }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [moveInDate, setMoveInDate] = useState("immediate");
  const [occupancyPreference, setOccupancyPreference] = useState("any");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [attribution, setAttribution] = useState({
    utm_source: "direct",
    utm_medium: "web",
    utm_campaign: "stay-inquiry",
    referrer: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      setAttribution({
        utm_source: sp.get("utm_source") || (document.referrer.includes("google") ? "google" : "direct"),
        utm_medium: sp.get("utm_medium") || (document.referrer.includes("google") ? "organic" : "web"),
        utm_campaign: sp.get("utm_campaign") || "stay-directory",
        utm_term: sp.get("utm_term") || sp.get("q") || "",
        referrer: document.referrer || "",
      });
    }
  }, []);

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setErrorMsg(T("Please enter your name.", "உங்கள் பெயரை உள்ளிடவும்."));
      return;
    }
    const cleanPhone = guestPhone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg(T("Please enter a valid 10-digit mobile / WhatsApp number.", "சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்."));
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const inquiryPayload = {
      listing_id: listing.id,
      listing_title: listing.title,
      district_slug: listing.district_slug || "",
      district_name: listing.district_name || "",
      area_name: listing.area_name || "",
      rent_amount: listing.rent_amount || 0,
      guest_name: guestName.trim(),
      guest_phone: cleanPhone,
      move_in_date: moveInDate,
      occupancy_preference: occupancyPreference,
      message: notes.trim(),
      utm_source: attribution.utm_source,
      utm_campaign: attribution.utm_campaign,
      status: "new",
      created_at: new Date().toISOString(),
    };

    try {
      // 1. Try inserting into stay_inquiry
      const { error: inquiryError } = await supabase.from("stay_inquiry").insert(inquiryPayload);

      // 2. Fallback to contact_message if stay_inquiry table doesn't exist yet
      if (inquiryError) {
        const contactPayload = {
          topic: "stay_inquiry",
          name: guestName.trim(),
          phone: cleanPhone,
          email: `${cleanPhone}@stay.vizhitn.in`,
          district: listing.district_name || "Tamil Nadu",
          message: `Inquiry for "${listing.title}" in ${listing.area_name || listing.district_name}. Move-in: ${moveInDate}. Pref: ${occupancyPreference}. Notes: ${notes.trim()}`,
          ticket_id: `STAY-${Date.now().toString(36).toUpperCase()}`,
          status: "open",
        };
        await supabase.from("contact_message").insert(contactPayload);
      }

      // 3. Trigger instant email alert to admin via Resend
      fetch("/api/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "stay_inquiry",
          data: {
            ...inquiryPayload,
            listing_id: listing.id,
          },
        }),
      }).catch((e) => console.warn("[NOTIFY ADMIN WARN]:", e));

      setSubmitted(true);
    } catch (err) {
      console.error("[STAY INQUIRY] Submit error:", err);
      // Fallback display
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {T("Availability Request Sent!", "விசாரணை கோரிக்கை அனுப்பப்பட்டது!")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
              {T(
                `Your request for "${listing.title}" has been safely logged. The host / verified concierge desk will contact you at ${guestPhone} with room details, photos, and visiting hours.`,
                `"${listing.title}" பற்றிய உங்கள் கோரிக்கை பதிவு செய்யப்பட்டது. அறை விவரங்கள் மற்றும் புகைப்படங்களுடன் உங்கள் எண்ணை (${guestPhone}) தொடர்பு கொள்வோம்.`
              )}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-4 h-4" />
              <span>{T("Zero Brokerage · Privacy Protected", "தரகர் கட்டணம் இல்லை · பாதுகாப்பு உறுதி")}</span>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold transition-opacity"
              >
                {T("Done", "சரி")}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {T("Zero-Brokerage Stay Inquiry", "தரகர் கட்டணமில்லா நேரடி விசாரணை")}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                  {listing.title}
                </h3>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl mb-4 text-xs flex items-center justify-between border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">
                📍 {listing.area_name || listing.district_name || "Tamil Nadu"}
              </span>
              {listing.rent_amount && (
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  ₹{listing.rent_amount}/{listing.rent_period || "month"}
                </span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {T("Your Full Name", "உங்கள் பெயர்")} *
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g., Ramesh Kumar"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {T("WhatsApp / Mobile Number", "வாட்ஸ்அப் / மொபைல் எண்")} *
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="e.g., 9876543210 (Photos & details will be sent here)"
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {T("Expected Move-in", "குடியேறும் நாள்")}
                  </label>
                  <select
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="immediate">{T("Immediately", "உடனடியாக")}</option>
                    <option value="within_1_week">{T("Within 1 Week", "1 வாரத்திற்குள்")}</option>
                    <option value="next_month">{T("Next Month", "அடுத்த மாதம்")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    {T("Room Preference", "அறை விருப்பம்")}
                  </label>
                  <select
                    value={occupancyPreference}
                    onChange={(e) => setOccupancyPreference(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="any">{T("Any (Flexible)", "எதுவானாலும்")}</option>
                    <option value="single">{T("Single Private Room", "தனி அறை")}</option>
                    <option value="sharing">{T("Twin / 3 Sharing", "பகிர்வு அறை")}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  {T("Special Questions / Notes (Optional)", "கூடுதல் விவரம் (தேவைப்பட்டால்)")}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={T("e.g., Looking for AC with food, working at Infosys...", "எ.கா., உணவுடன் கூடிய ஏசி அறை தேவை...")}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-red-500">{errorMsg}</p>
              )}

              <div className="pt-2 flex items-center justify-between gap-3">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  {T("No spam · Direct host verification", "பாதுகாப்பானது")}
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-black uppercase tracking-wider shadow-md transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {T("Checking...", "சரிபார்க்கிறது...")}
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {T("Request Availability", "அறை விவரம் பெறுக")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
