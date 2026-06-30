"use client";
import React from "react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { Map, FileText, AlertTriangle, Users, ArrowRight } from "lucide-react";

export default function HowToUseSection() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const steps = [
    {
      icon: Map,
      color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      en_title: "1. Map & Live Feed",
      ta_title: "1. வரைபடம் & நேரடி ஊட்டம்",
      en_desc: "Explore reported issues and live regional updates across Tamil Nadu.",
      ta_desc: "தமிழ்நாட்டில் பதிவான சிக்கல்கள் மற்றும் நேரடிப் பகுதி மேம்பாடுகளை ஆராயுங்கள்."
    },
    {
      icon: FileText,
      color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      en_title: "2. Civic Receipts",
      ta_title: "2. குடிமை ரசீதுகள்",
      en_desc: "File complaints with visual evidence and request community verification.",
      ta_desc: "புகைப்பட ஆதாரங்களுடன் புகார்களைப் பதிவிட்டு மக்கள் சரிபார்ப்பைக் கோரவும்."
    },
    {
      icon: AlertTriangle,
      color: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
      en_title: "3. Bribe Tracker",
      ta_title: "3. லஞ்சக் கண்காணிப்பு",
      en_desc: "Anonymously report bribe requests to compile transparent regional statistics.",
      ta_desc: "வெளிப்படையான புள்ளிவிவரங்களை உருவாக்க லஞ்சக் கோரிக்கைகளை அநாமதேயமாகப் பதிவிடவும்."
    },
    {
      icon: Users,
      color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      en_title: "4. Community Hubs",
      ta_title: "4. சமுதாயப் பலகைகள்",
      en_desc: "Collaborate with resident groups (RWA) and find corporate CSR sponsorships.",
      ta_desc: "குடியிருப்பு நலச் சங்கங்கள் (RWA) மற்றும் CSR நிறுவனங்களுடன் இணைந்து தீர்வு காணுங்கள்."
    }
  ];

  return (
    <section className="bg-slate-50 dark:bg-slate-950 py-10 border-t border-slate-200/60 dark:border-slate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {T("How to Use VizhiTN", "VizhiTN பயன்படுத்துவது எப்படி")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
            {T(
              "Getting started is easy. Learn how to navigate the platform's core tools to report, verify, and resolve local issues.",
              "பயன்படுத்தத் தொடங்குவது மிகவும் எளிது. உள்ளூர் சிக்கல்களைப் புகாரளிக்கவும், சரிபார்க்கவும், தீர்க்கவும் முக்கியக் கருவிகளைப் பயன்படுத்துவது எப்படி என அறியுங்கள்."
            )}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Link 
                key={idx}
                to="/how-to-use"
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-md transition-shadow group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${step.color} shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {T(step.en_title, step.ta_title)}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      {T(step.en_desc, step.ta_desc)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 group-hover:text-blue-500 mt-4 transition-colors">
                  {T("Learn more", "மேலும் அறிய")} <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* View Guides Button */}
        <div className="flex justify-center">
          <Link to="/how-to-use">
            <button className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-sm">
              {T("View Detailed Feature Guides", "விரிவான பயன்பாட்டு வழிகாட்டிகளைப் பார்க்கவும்")}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
