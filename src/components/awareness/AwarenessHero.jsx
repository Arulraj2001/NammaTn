import React, { useState } from "react";
import { BookOpen, Search } from "lucide-react";

export default function AwarenessHero({ onSearch, lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left side */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {T("Citizen Awareness", "குடிமக்கள் விழிப்புணர்வு")}
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-lg mb-6">
              {T(
                "Know your rights, access government services, and stay informed about civic resources in Tamil Nadu.",
                "உங்கள் உரிமைகளை அறிந்து, அரசு சேவைகளை அணுகி, தமிழ்நாட்டில் குடிமக்கள் வளங்கள் பற்றி தெரிந்துகொள்ளுங்கள்."
              )}
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto lg:mx-0 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={T(
                    "Search schemes, rights, portals, helplines...",
                    "திட்டங்கள், உரிமைகள், இணையதளங்கள், உதவி எண்கள்..."
                  )}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <Search className="w-4 h-4" />
                {T("Search", "தேடு")}
              </button>
            </form>

            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-lg mx-auto lg:mx-0">
              {T(
                "Examples: ration card, electricity complaint, RTI, health insurance...",
                "எடுத்துக்காட்டுகள்: குடும்ப அட்டை, மின்சார புகார், தகவல் உரிமை, சுகாதார காப்பீடு..."
              )}
            </p>
          </div>

          {/* Right side – inline SVG illustration */}
          <div className="flex-shrink-0 w-64 h-52 sm:w-80 sm:h-64 hidden sm:block">
            <svg viewBox="0 0 320 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {/* Ground */}
              <rect x="20" y="220" width="280" height="6" rx="3" fill="#E2E8F0" />
              {/* Building body */}
              <rect x="80" y="100" width="160" height="120" rx="4" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
              {/* Building roof / pediment */}
              <polygon points="60,100 160,40 260,100" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5" />
              {/* Pillars */}
              <rect x="100" y="110" width="10" height="100" rx="2" fill="#93C5FD" />
              <rect x="140" y="110" width="10" height="100" rx="2" fill="#93C5FD" />
              <rect x="170" y="110" width="10" height="100" rx="2" fill="#93C5FD" />
              <rect x="210" y="110" width="10" height="100" rx="2" fill="#93C5FD" />
              {/* Door */}
              <rect x="145" y="170" width="30" height="50" rx="2" fill="#3B82F6" />
              <circle cx="170" cy="196" r="2" fill="#DBEAFE" />
              {/* Windows */}
              <rect x="100" y="130" width="16" height="16" rx="2" fill="#3B82F6" opacity="0.6" />
              <rect x="204" y="130" width="16" height="16" rx="2" fill="#3B82F6" opacity="0.6" />
              {/* Flag */}
              <line x1="160" y1="40" x2="160" y2="15" stroke="#64748B" strokeWidth="1.5" />
              <rect x="160" y="15" width="24" height="14" rx="2" fill="#F97316" />
              <rect x="160" y="22" width="24" height="7" rx="0" fill="#22C55E" />
              <rect x="160" y="19" width="24" height="3" fill="white" />
              {/* Person 1 */}
              <circle cx="50" cy="195" r="8" fill="#3B82F6" />
              <rect x="44" y="204" width="12" height="16" rx="4" fill="#3B82F6" />
              {/* Person 2 */}
              <circle cx="275" cy="195" r="8" fill="#8B5CF6" />
              <rect x="269" y="204" width="12" height="16" rx="4" fill="#8B5CF6" />
              {/* Person 3 */}
              <circle cx="290" cy="200" r="6" fill="#EC4899" />
              <rect x="285" y="207" width="10" height="13" rx="3" fill="#EC4899" />
              {/* Trees */}
              <circle cx="35" cy="180" r="14" fill="#86EFAC" opacity="0.7" />
              <rect x="33" y="190" width="4" height="30" rx="2" fill="#4ADE80" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
