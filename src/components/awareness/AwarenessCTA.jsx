import React from "react";
import { ArrowRight, Landmark } from "lucide-react";
import { Link } from "react-router-dom";

export default function AwarenessCTA({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-10">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Left */}
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Landmark className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {T(
                  "Share Local Issues. Build a Better Tamil Nadu.",
                  "உள்ளூர் பிரச்சினைகளைப் பகிரவும். சிறந்த தமிழ்நாட்டைக் கட்டமைக்கவும்."
                )}
              </h2>
              <p className="text-blue-100 text-sm">
                {T(
                  "Know about a problem in your area? Raise it on NammaTN and help your community.",
                  "உங்கள் பகுதியில் ஒரு பிரச்சினை இருக்கிறதா? NammaTN இல் தெரிவியுங்கள்."
                )}
              </p>
            </div>
          </div>

          {/* Right */}
          <Link
            to="/create"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm flex-shrink-0"
          >
            {T("Post Now", "இப்போது பதிவிடுங்கள்")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
