"use client";

import React, { useState } from "react";
import { BookOpen, Search, X, Sparkles, Shield, Zap, Phone, Gift, FileText } from "lucide-react";

const SUGGESTED_QUERIES = [
  { en: "Magalir Urimai ₹1,000", ta: "மகளிர் உரிமை ₹1,000", q: "magalir urimai" },
  { en: "Minnalagam 1912", ta: "மின்னகம் 1912", q: "1912" },
  { en: "Police Check Rules", ta: "வாகன சோதனை விதிகள்", q: "police" },
  { en: "RTI 2005", ta: "தகவல் அறியும் உரிமை", q: "rti" },
  { en: "Cyber Crime 1930", ta: "சைபர் கிரைம் 1930", q: "1930" },
  { en: "e-Sevai Guide", ta: "இ-சேவை வழிகாட்டி", q: "esevai" },
];

export default function AwarenessHero({ onSearch, lang = "en" }) {
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [query, setQuery] = useState("");

  const handleChange = (val) => {
    setQuery(val);
    onSearch?.(val);
  };

  const handleChipClick = (q) => {
    setQuery(q);
    onSearch?.(q);
  };

  return (
    <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-blue-50/50 via-white to-white dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12">

          {/* ── Left Content & Search ── */}
          <div className="flex-1 w-full text-left">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20 text-white">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[11px] font-bold tracking-wide uppercase mb-1">
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  {T("Tamil Nadu Citizen Directory", "தமிழ்நாடு குடிமக்கள் கையேடு")}
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                  {T("Citizen Awareness & Rights", "குடிமக்கள் விழிப்புணர்வு & உரிமைகள்")}
                </h1>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-medium leading-relaxed">
                  {T(
                    "Verified government welfare schemes, statutory citizen rights, 24x7 emergency control rooms, and practical civic procedures for all 38 districts.",
                    "அனைத்து 38 மாவட்டங்களுக்கான சரிபார்க்கப்பட்ட அரசு நலத்திட்டங்கள், குடிமக்கள் சட்ட உரிமைகள், 24x7 அவசர கட்டுப்பாட்டு அறைகள் மற்றும் நடைமுறைகள்."
                  )}
                </p>
              </div>
            </div>

            {/* Live Search Bar */}
            <div className="mt-6 max-w-2xl">
              <div className="relative flex items-center shadow-sm rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder={T(
                    "Search schemes, rights, portals, helplines (e.g., Magalir Urimai, 1912, RTI)...",
                    "திட்டங்கள், உரிமைகள், இணையதளங்கள், அவசர எண்கள் தேடுங்கள்..."
                  )}
                  className="w-full pl-12 pr-12 py-3.5 text-sm sm:text-base rounded-2xl bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
                {query && (
                  <button
                    onClick={() => handleChange("")}
                    aria-label="Clear search"
                    className="absolute right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Suggestion Chips */}
              <div className="flex items-center gap-1.5 flex-wrap mt-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  {T("Trending:", "பிரபலமானவை:")}
                </span>
                {SUGGESTED_QUERIES.map((chip, i) => (
                  <button
                    key={i}
                    onClick={() => handleChipClick(chip.q)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {T(chip.en, chip.ta)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right: Modern Quick-Stats Visual Card ── */}
          <div className="hidden lg:grid grid-cols-2 gap-3 w-80 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-2">
                <Gift className="w-4 h-4" />
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">25+ Schemes</p>
              <p className="text-[11px] text-slate-500 font-medium">{T("Welfare & Allowances", "அரசு நலத்திட்டங்கள்")}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2">
                <Shield className="w-4 h-4" />
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">12 Rights</p>
              <p className="text-[11px] text-slate-500 font-medium">{T("Statutory Protections", "சட்டப்பூர்வ உரிமைகள்")}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center mb-2">
                <Phone className="w-4 h-4" />
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">24x7 SOS</p>
              <p className="text-[11px] text-slate-500 font-medium">{T("Verified Helplines", "அவசர உதவி எண்கள்")}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                <FileText className="w-4 h-4" />
              </div>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">RTI & Portals</p>
              <p className="text-[11px] text-slate-500 font-medium">{T("1-Click Generator", "விண்ணப்ப மாதிரி")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
