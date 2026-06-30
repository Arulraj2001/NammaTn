import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";

export default function AwarenessCTA({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-12 pt-2">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 overflow-hidden relative">
          {/* Decorative circles */}
          <div className="absolute -left-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="absolute -right-4 -bottom-6 w-32 h-32 bg-white/5 rounded-full" />

          {/* Phone icon graphic */}
          <div className="flex-shrink-0 w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center relative z-10">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="1.5" />
              <path strokeLinecap="round" d="M9 18h6" stroke="currentColor" strokeWidth="1.5" />
              {/* Screen with TN */}
              <rect x="7" y="5" width="10" height="10" rx="1" fill="currentColor" opacity="0.3" />
              <text x="10" y="13" fontSize="6" fill="white" fontWeight="bold">TN</text>
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 text-center sm:text-left relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
              {T(
                "Share Local Issues. Build a Better Tamil Nadu.",
                "உள்ளூர் பிரச்சினைகளைப் பகிரவும். சிறந்த தமிழ்நாட்டைக் கட்டமைக்கவும்."
              )}
            </h2>
            <p className="text-blue-100 text-sm">
              {T(
                "Your voice can bring change. Report and track issues in your area.",
                "உங்கள் குரல் மாற்றத்தை கொண்டுவரும். உங்கள் பகுதியில் பிரச்சினைகளை புகாரளிக்கவும்."
              )}
            </p>
          </div>

          {/* CTA Button */}
          <Link
            to="/create"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm flex-shrink-0 relative z-10 shadow-sm"
          >
            {T("Post Now", "இப்போது பதிவிடுங்கள்")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
