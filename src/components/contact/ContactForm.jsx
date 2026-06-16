import React, { useState } from "react";
import { Mail, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/context/LanguageContext";
import { base44 } from "@/api/base44Client";

const TOPIC_OPTIONS = [
  { value: "general", en: "General Feedback", ta: "பொது கருத்து" },
  { value: "content_report", en: "Content Report", ta: "உள்ளடக்க புகார்" },
  { value: "support", en: "Support Request", ta: "உதவி கோரிக்கை" },
  { value: "advertising", en: "Advertising", ta: "விளம்பரம்" },
  { value: "other", en: "Other", ta: "மற்றவை" },
];

export default function ContactForm() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [form, setForm] = useState({ name: "", email: "", topic: "general", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError(T("Please fill all required fields.", "அனைத்து தேவையான புலங்களையும் நிரப்பவும்."));
      return;
    }
    setError("");
    setLoading(true);
    // Save to DB for admin management
    await base44.entities.ContactMessage.create({
      name: form.name,
      email: form.email,
      topic: form.topic,
      subject: form.subject,
      message: form.message,
      status: "new",
    });
    // Also send email notification
    await base44.integrations.Core.SendEmail({
      to: "support@tnvoice.in",
      subject: `[TN Voice Contact] ${form.subject || "General Inquiry"} from ${form.name}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nTopic: ${form.topic}\nSubject: ${form.subject}\n\nMessage:\n${form.message}`,
      from_name: "TN Voice Contact Form",
    });
    setLoading(false);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center">
        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {T("Message Sent!", "செய்தி அனுப்பப்பட்டது!")}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {T("We'll get back to you within 24–48 hours.", "24–48 மணி நேரத்திற்குள் பதிலளிப்போம்.")}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">{T("Contact Us", "தொடர்பு கொள்ளுங்கள்")}</h3>
          <p className="text-xs text-slate-400">{T("We usually reply in 24–48 hours", "24–48 மணி நேரத்தில் பதிலளிப்போம்")}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{T("Name *", "பெயர் *")}</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={T("Your name", "உங்கள் பெயர்")} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{T("Email *", "மின்னஞ்சல் *")}</label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{T("Topic", "தலைப்பு")}</label>
          <select
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TOPIC_OPTIONS.map(o => <option key={o.value} value={o.value}>{T(o.en, o.ta)}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{T("Subject", "விஷயம்")}</label>
          <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder={T("What is this about?", "இது எதைப் பற்றியது?")} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 block">{T("Message *", "செய்தி *")}</label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder={T("Your message here...", "உங்கள் செய்தி இங்கே...")}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full flex items-center gap-2">
          <Send className="w-4 h-4" />
          {loading ? T("Sending...", "அனுப்புகிறது...") : T("Send Message", "செய்தி அனுப்பு")}
        </Button>
      </form>
    </div>
  );
}