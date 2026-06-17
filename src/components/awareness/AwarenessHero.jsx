import React, { useState } from "react";
import { BookOpen, Search } from "lucide-react";

export default function AwarenessHero({ onSearch, lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    // Live search as user types
    onSearch?.(e.target.value);
  };

  return (
    <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* ── Left side ── */}
          <div className="flex-1 text-left">
            {/* Title row */}
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {T("Citizen Awareness", "குடிமக்கள் விழிப்புணர்வு")}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  {T(
                    "Know your rights, find the right services, and take the next step.",
                    "உங்கள் உரிமைகளை அறிந்து, சரியான சேவைகளை கண்டறிந்து, அடுத்த படியை எடுங்கள்."
                  )}
                </p>
              </div>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mt-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={handleChange}
                  placeholder={T(
                    "Search schemes, rights, portals, helplines...",
                    "திட்டங்கள், உரிமைகள், இணையதளங்கள், உதவி எண்கள்..."
                  )}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {T("Search", "தேடு")}
              </button>
            </form>

            {/* Examples */}
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2.5">
              {T(
                "Examples: ration card, electricity complaint, RTI, women helpline, water connection",
                "எடுத்துக்காட்டுகள்: குடும்ப அட்டை, மின்சாரம், RTI, பெண்கள் உதவி, குடிநீர் இணைப்பு"
              )}
            </p>
          </div>

          {/* ── Right side: SVG civic illustration ── */}
          <div className="flex-shrink-0 w-72 h-56 sm:w-96 sm:h-72 hidden md:flex items-center justify-center relative">
            {/* Floating icon badges */}
            <div className="absolute top-2 right-8 w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="absolute top-12 right-2 w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="absolute bottom-4 left-4 w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            {/* Main government building SVG */}
            <svg viewBox="0 0 340 280" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Ground */}
              <rect x="10" y="238" width="320" height="6" rx="3" fill="#E2E8F0" />

              {/* Building body */}
              <rect x="90" y="115" width="160" height="123" rx="3" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />

              {/* Roof / pediment */}
              <polygon points="70,115 170,48 270,115" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5" />

              {/* Flag pole + flag */}
              <line x1="170" y1="48" x2="170" y2="18" stroke="#94A3B8" strokeWidth="1.5" />
              <rect x="170" y="18" width="26" height="10" rx="2" fill="#FF9933" />
              <rect x="170" y="25" width="26" height="7" rx="0" fill="#138808" />
              <rect x="170" y="22" width="26" height="3" fill="white" />

              {/* Pillars */}
              <rect x="108" y="125" width="9" height="113" rx="2" fill="#93C5FD" />
              <rect x="143" y="125" width="9" height="113" rx="2" fill="#93C5FD" />
              <rect x="178" y="125" width="9" height="113" rx="2" fill="#93C5FD" />
              <rect x="213" y="125" width="9" height="113" rx="2" fill="#93C5FD" />

              {/* Door */}
              <rect x="150" y="185" width="40" height="53" rx="3" fill="#3B82F6" />
              <circle cx="186" cy="213" r="2.5" fill="#BFDBFE" />

              {/* Windows */}
              <rect x="108" y="140" width="18" height="18" rx="2" fill="#3B82F6" opacity="0.55" />
              <rect x="213" y="140" width="18" height="18" rx="2" fill="#3B82F6" opacity="0.55" />
              <rect x="108" y="170" width="18" height="18" rx="2" fill="#3B82F6" opacity="0.35" />
              <rect x="213" y="170" width="18" height="18" rx="2" fill="#3B82F6" opacity="0.35" />

              {/* People group */}
              {/* Person 1 — blue */}
              <circle cx="44" cy="210" r="9" fill="#3B82F6" />
              <rect x="37" y="220" width="14" height="18" rx="5" fill="#3B82F6" />
              {/* Person 2 — orange */}
              <circle cx="66" cy="213" r="9" fill="#F59E0B" />
              <rect x="59" y="223" width="14" height="16" rx="5" fill="#F59E0B" />
              {/* Person 3 — green */}
              <circle cx="87" cy="210" r="8" fill="#10B981" />
              <rect x="81" y="219" width="12" height="19" rx="4" fill="#10B981" />

              {/* Person 4 — purple (right side) */}
              <circle cx="265" cy="210" r="9" fill="#8B5CF6" />
              <rect x="258" y="220" width="14" height="18" rx="5" fill="#8B5CF6" />
              {/* Person 5 — pink */}
              <circle cx="286" cy="213" r="8" fill="#EC4899" />
              <rect x="280" y="222" width="12" height="16" rx="4" fill="#EC4899" />
              {/* Person 6 — red */}
              <circle cx="305" cy="210" r="8" fill="#EF4444" />
              <rect x="299" y="219" width="12" height="19" rx="4" fill="#EF4444" />

              {/* Trees */}
              <circle cx="30" cy="202" r="16" fill="#86EFAC" opacity="0.8" />
              <rect x="28" y="214" width="4" height="24" rx="2" fill="#4ADE80" />
              <circle cx="316" cy="204" r="14" fill="#86EFAC" opacity="0.8" />
              <rect x="314" y="214" width="4" height="24" rx="2" fill="#4ADE80" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
