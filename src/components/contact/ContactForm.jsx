"use client";

import React, { useState, useEffect } from "react";
import { Mail, Send, CheckCircle, Loader2, Copy, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { base44 } from "@/api/base44Client";
import { DISTRICTS } from "@/lib/districts";

export const TOPIC_OPTIONS = [
  {
    value: "content_report",
    en: "Content Report & Privacy Dispute",
    ta: "உள்ளடக்க புகார் & தனியுரிமை",
    desc_en: "Report false posts, private photos, or duplicate complaints",
    desc_ta: "போலி பதிவு, தனிநபர் புகைப்படம் நீக்க கோரிக்கை",
    sla: "< 6 Hours"
  },
  {
    value: "general",
    en: "General Feedback & Suggestion",
    ta: "பொது கருத்து & ஆலோசனைகள்",
    desc_en: "Feature suggestions, citizen feedback, platform ideas",
    desc_ta: "தள மேம்பாட்டு ஆலோசனைகள் மற்றும் கருத்துக்கள்",
    sla: "< 24 Hours"
  },
  {
    value: "support",
    en: "Technical Support & Bug Report",
    ta: "தொழில்நுட்ப உதவி & பிழை",
    desc_en: "Login errors, GPS mapping bugs, media upload issues",
    desc_ta: "உள்நுழைவு சிக்கல், ஜிபிஎஸ் வரைபட பிழை, வீடியோ பதிவேற்றம்",
    sla: "< 12 Hours"
  },
  {
    value: "advertising",
    en: "Partnership & CSR Campaigns",
    ta: "கூட்டாண்மை & CSR திட்டங்கள்",
    desc_en: "Civic initiatives, NGO alliances, ethical partnerships",
    desc_ta: "சமூக பொறுப்புணர்வு திட்டங்கள் மற்றும் அமைப்புகள்",
    sla: "< 24 Hours"
  },
  {
    value: "other",
    en: "Official Department Liaison",
    ta: "அரசுத் துறை & நகராட்சி தொடர்பு",
    desc_en: "Ward councillors, GCC / TANGEDCO / TWAD engineers",
    desc_ta: "வார்டு உறுப்பினர்கள் மற்றும் அரசுத் துறை பொறியாளர்கள்",
    sla: "< 12 Hours"
  },
];

export default function ContactForm({ activeTopic, onTopicSelect }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    district_slug: "",
    topic: activeTopic || "general",
    subject: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [error, setError] = useState("");
  const [copiedTicket, setCopiedTicket] = useState(false);

  useEffect(() => {
    if (activeTopic) {
      setForm((prev) => ({ ...prev, topic: activeTopic }));
    }
  }, [activeTopic]);

  const handleTopicChange = (newTopic) => {
    setForm((prev) => ({ ...prev, topic: newTopic }));
    if (onTopicSelect) onTopicSelect(newTopic);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError(T("Please fill all required fields (Name, Email, Message).", "அனைத்து தேவையான விவரங்களையும் (பெயர், மின்னஞ்சல், செய்தி) நிரப்பவும்."));
      return;
    }

    setError("");
    setLoading(true);

    // Format combined metadata into message so admin has full context
    const districtText = form.district_slug
      ? DISTRICTS.find((d) => d.slug === form.district_slug)?.name_en || form.district_slug
      : "Not specified";
    const phoneText = form.phone.trim() ? form.phone.trim() : "Not provided";

    const payloadMessage = `[District: ${districtText}] [Phone: ${phoneText}]\n\n${form.message.trim()}`;

    try {
      const generatedTicket = `VZN-${Date.now().toString().slice(-6)}`;
      await base44.entities.ContactMessage.create({
        name: form.name.trim(),
        email: form.email.trim(),
        topic: form.topic,
        subject: form.subject.trim() || `Inquiry from ${form.name.trim()} (${generatedTicket})`,
        message: payloadMessage,
        status: "new",
      });

      // Trigger instant email alert to admin via Resend
      fetch("/api/notify-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact_message",
          data: {
            ticket_id: generatedTicket,
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            district: form.district,
            topic: form.topic,
            message: payloadMessage,
          },
        }),
      }).catch((e) => console.warn("[NOTIFY ADMIN WARN]:", e));

      setTicketId(generatedTicket);
      setLoading(false);
      setSent(true);
    } catch (dbError) {
      console.error("Failed to save contact message to DB:", dbError);
      setError(T("Failed to send message. Please try again or email vizhitnin@gmail.com directly.", "செய்தியை அனுப்ப முடியவில்லை. மீண்டும் முயலவும் அல்லது vizhitnin@gmail.com மின்னஞ்சல் செய்யவும்."));
      setLoading(false);
    }
  };

  const handleCopyTicket = () => {
    if (!ticketId) return;
    navigator.clipboard.writeText(ticketId);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  if (sent) {
    return (
      <div className="bg-white dark:bg-slate-900 border-2 border-emerald-300 dark:border-emerald-800 rounded-3xl p-6 sm:p-8 text-center shadow-lg animate-in fade-in">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>

        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900 inline-block mb-2">
          {T("CITIZEN TICKET GENERATED", "குடிமக்கள் மனு பதிவு செய்யப்பட்டது")}
        </span>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-2">
          {T("Your Message Has Been Submitted", "உங்கள் செய்தி வெற்றிகரமாக அனுப்பப்பட்டது")}
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
          {T(
            "Our civic moderation and support desk will review your inquiry. An official response will be routed to your email address within our committed turnaround window.",
            "எங்கள் குடிமை மேலாண்மை குழு உங்கள் மனுவை ஆய்வு செய்து, குறிப்பிட்ட நேரத்திற்குள் உங்கள் மின்னஞ்சலுக்கு பதில் அளிக்கும்."
          )}
        </p>

        {/* Tracking ID Badge */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 max-w-sm mx-auto flex items-center justify-between gap-3 mb-6">
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">
              {T("Reference Ticket ID", "குறிப்பு எண்")}
            </span>
            <span className="text-base font-black font-mono text-slate-900 dark:text-white">
              {ticketId}
            </span>
          </div>
          <button
            onClick={handleCopyTicket}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors"
          >
            {copiedTicket ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedTicket ? T("Copied", "நகலெடுக்கப்பட்டது") : T("Copy", "நகலெடு")}
          </button>
        </div>

        <button
          onClick={() => {
            setSent(false);
            setForm({
              name: "",
              email: "",
              phone: "",
              district_slug: "",
              topic: "general",
              subject: "",
              message: ""
            });
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          {T("Send another inquiry →", "மற்றொரு செய்தியை அனுப்ப →")}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
            {T("Send a Message to VizhiTN", "VizhiTN குழுவிற்கு செய்தி அனுப்புங்கள்")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {T("All inquiries are answered by our Chennai-based civic editorial desk.", "அனைத்து மனுக்களும் சென்னை குடிமைப் பிரிவால் கவனிக்கப்படும்.")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {T("Full Name *", "முழுப் பெயர் *")}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder={T("e.g. S. Arulraj", "எ.கா. சு. அருள்ராஜ்")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {T("Email Address *", "மின்னஞ்சல் முகவரி *")}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Optional Phone & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {T("Phone / WhatsApp (Optional)", "தொலைபேசி / வாட்ஸ்அப் (விருப்பத்தேர்வு)")}
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder={T("e.g. 9840XXXXXX", "எ.கா. 9840XXXXXX")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              {T("Relevant District (Optional)", "தொடர்புடைய மாவட்டம் (விருப்பத்தேர்வு)")}
            </label>
            <select
              value={form.district_slug}
              onChange={(e) => setForm({ ...form, district_slug: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">{T("Select District", "மாவட்டம் தேர்வு செய்க")}</option>
              {DISTRICTS.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {T(d.name_en, d.name_ta)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Inquiry Topic Dropdown */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {T("Inquiry Topic *", "விசாரணை தலைப்பு *")}
          </label>
          <select
            value={form.topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            {TOPIC_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {T(o.en, o.ta)} ({o.sla})
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {T("Subject", "பொருள்")}
          </label>
          <input
            type="text"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            placeholder={T("Brief summary of your inquiry...", "உங்கள் மனுவின் சுருக்கமான தலைப்பு...")}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
            {T("Detailed Message *", "முழுமையான விவரம் *")}
          </label>
          <textarea
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder={T(
              "Please provide all relevant details: specific URL, area name, or issue description...",
              "விவரங்களை தெளிவாக குறிப்பிடவும்: இணையதள முகவரி, பகுதி பெயர் அல்லது புகார் விவரம்..."
            )}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {error && (
          <p className="text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {T("Submitting Ticket...", "அனுப்பப்படுகிறது...")}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {T("Submit Inquiry to Desk", "செய்தியை அனுப்பவும்")}
            </>
          )}
        </button>
      </form>
    </div>
  );
}