"use client";
import React from "react";
import { Mail, MessageSquare, Shield, HelpCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import ContactForm from "@/components/contact/ContactForm";

export default function Contact() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  usePageMeta({
    title: "Contact | VizhiTN",
    description: "Contact the VizhiTN team for support, feedback, or platform queries.",
  });

  const TOPICS = [
    { icon: MessageSquare, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400", en: "General Feedback", ta: "பொது கருத்து", en_desc: "Share your thoughts on the platform.", ta_desc: "தளம் பற்றிய உங்கள் எண்ணங்களைப் பகிரவும்." },
    { icon: Shield, color: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400", en: "Content Reports", ta: "உள்ளடக்க புகார்", en_desc: "Report harmful or false content.", ta_desc: "தீங்கான உள்ளடக்கத்தை புகாரளிக்கவும்." },
    { icon: HelpCircle, color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400", en: "Support Request", ta: "உதவி கோரிக்கை", en_desc: "Need technical help or account support.", ta_desc: "தொழில்நுட்ப உதவி தேவை." },
    { icon: Mail, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400", en: "Advertising", ta: "விளம்பரம்", en_desc: "Interested in advertising on VizhiTN.", ta_desc: "VizhiTN இல் விளம்பரம் செய்ய விரும்புகிறேன்." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          {T("Contact VizhiTN", "VizhiTN ஐ தொடர்பு கொள்ளுங்கள்")}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
          {T(
            "Have feedback, a report, or need support? We're here to help build a better platform for Tamil Nadu.",
            "கருத்து, புகார் அல்லது ஆதரவு தேவையா? தமிழ்நாட்டிற்கான சிறந்த தளத்தை கட்டமைக்க நாங்கள் இங்கே இருக்கிறோம்."
          )}
        </p>
      </div>

      {/* Topics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {TOPICS.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.en} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center">
              <div className={`w-10 h-10 rounded-xl ${t.color} flex items-center justify-center mx-auto mb-2`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-white">{T(t.en, t.ta)}</p>
              <p className="text-xs text-slate-400 mt-1">{T(t.en_desc, t.ta_desc)}</p>
            </div>
          );
        })}
      </div>

      <div className="max-w-2xl mx-auto">
        <ContactForm />
      </div>
    </div>
  );
}
