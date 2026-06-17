import React, { useState } from "react";
import { BookOpen, Search, X } from "lucide-react";

export default function AwarenessHero({ onSearch, lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [query, setQuery] = useState("");

  const handleChange = (val) => {
    setQuery(val);
    onSearch?.(val);
  };

  return (
    <section className="relative overflow-hidden border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">

          {/* ── Left ── */}
          <div className="flex-1 w-full text-left">
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                  {T("Citizen Awareness", "குடிமக்கள் விழிப்புணர்வு")}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
                  {T(
                    "Know your rights, find the right services, and take the next step.",
                    "உங்கள் உரிமைகளை அறிந்து, சரியான சேவைகளை கண்டறிந்து, அடுத்த படியை எடுங்கள்."
                  )}
                </p>
              </div>
            </div>

            {/* Search */}
            <div className="flex gap-2 max-w-xl mt-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => handleChange(e.target.value)}
                  placeholder={T(
                    "Search schemes, rights, portals, helplines...",
                    "திட்டங்கள், உரிமைகள், இணையதளங்கள், உதவி எண்கள்..."
                  )}
                  className="w-full pl-10 pr-9 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
                {query && (
                  <button
                    onClick={() => handleChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => onSearch?.(query)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm whitespace-nowrap"
              >
                {T("Search", "தேடு")}
              </button>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              {T(
                "Examples: ration card, electricity complaint, RTI, women helpline, water connection",
                "எடுத்துக்காட்டுகள்: குடும்ப அட்டை, மின்சாரம், RTI, பெண்கள் உதவி, குடிநீர் இணைப்பு"
              )}
            </p>
          </div>

          {/* ── Right: SVG illustration ── */}
          <div className="flex-shrink-0 hidden md:block w-72 h-56 lg:w-88 lg:h-64">
            <svg viewBox="0 0 340 270" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <rect x="10" y="238" width="320" height="5" rx="2.5" fill="#E2E8F0"/>
              {/* Building */}
              <rect x="95" y="118" width="150" height="120" rx="3" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5"/>
              <polygon points="75,118 170,52 265,118" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5"/>
              {/* Flag */}
              <line x1="170" y1="52" x2="170" y2="24" stroke="#94A3B8" strokeWidth="1.5"/>
              <rect x="170" y="24" width="24" height="9" rx="1.5" fill="#FF9933"/>
              <rect x="170" y="30" width="24" height="6" rx="0" fill="#138808"/>
              <rect x="170" y="27" width="24" height="3" fill="white"/>
              {/* Pillars */}
              <rect x="112" y="128" width="9" height="110" rx="2" fill="#93C5FD"/>
              <rect x="145" y="128" width="9" height="110" rx="2" fill="#93C5FD"/>
              <rect x="176" y="128" width="9" height="110" rx="2" fill="#93C5FD"/>
              <rect x="209" y="128" width="9" height="110" rx="2" fill="#93C5FD"/>
              {/* Door */}
              <rect x="151" y="188" width="38" height="50" rx="3" fill="#3B82F6"/>
              <circle cx="185" cy="214" r="2.5" fill="#BFDBFE"/>
              {/* Windows */}
              <rect x="112" y="142" width="17" height="17" rx="2" fill="#3B82F6" opacity="0.6"/>
              <rect x="209" y="142" width="17" height="17" rx="2" fill="#3B82F6" opacity="0.6"/>
              {/* People left */}
              <circle cx="40" cy="210" r="9" fill="#3B82F6"/>
              <rect x="33" y="220" width="14" height="18" rx="5" fill="#3B82F6"/>
              <circle cx="62" cy="213" r="9" fill="#F59E0B"/>
              <rect x="55" y="223" width="14" height="15" rx="5" fill="#F59E0B"/>
              <circle cx="83" cy="210" r="8" fill="#10B981"/>
              <rect x="77" y="219" width="12" height="19" rx="4" fill="#10B981"/>
              {/* People right */}
              <circle cx="263" cy="210" r="9" fill="#8B5CF6"/>
              <rect x="256" y="220" width="14" height="18" rx="5" fill="#8B5CF6"/>
              <circle cx="284" cy="213" r="8" fill="#EC4899"/>
              <rect x="278" y="222" width="12" height="16" rx="4" fill="#EC4899"/>
              <circle cx="303" cy="210" r="8" fill="#EF4444"/>
              <rect x="297" y="219" width="12" height="19" rx="4" fill="#EF4444"/>
              {/* Trees */}
              <circle cx="28" cy="205" r="16" fill="#86EFAC" opacity="0.85"/>
              <rect x="26" y="216" width="4" height="22" rx="2" fill="#4ADE80"/>
              <circle cx="315" cy="206" r="14" fill="#86EFAC" opacity="0.85"/>
              <rect x="313" y="216" width="4" height="22" rx="2" fill="#4ADE80"/>
              {/* Floating icons */}
              <rect x="282" y="58" width="36" height="36" rx="10" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1"/>
              <text x="291" y="81" fontSize="18">🛡️</text>
              <rect x="18" y="148" width="36" height="36" rx="10" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1"/>
              <text x="27" y="171" fontSize="18">📄</text>
              <rect x="290" y="108" width="32" height="32" rx="9" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1"/>
              <text x="298" y="129" fontSize="16">🌐</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
