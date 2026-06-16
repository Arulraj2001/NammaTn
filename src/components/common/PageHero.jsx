import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Reusable page hero for all feature pages.
 * Props:
 *  icon - emoji or lucide icon element
 *  title (en/ta)
 *  description (en/ta)
 *  ctaLabel (en/ta) + ctaPath
 *  secondaryCtaLabel + secondaryCtaPath (optional)
 *  badge (optional string label)
 *  bgClass (optional tailwind bg gradient)
 *  lang
 */
export default function PageHero({
  icon,
  title_en, title_ta,
  desc_en, desc_ta,
  cta_en, cta_ta, ctaPath,
  secondary_en, secondary_ta, secondaryPath,
  badge_en, badge_ta,
  bgFrom = "from-slate-700",
  bgTo = "to-slate-800",
  lang = "en",
  disclaimer,
}) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <div className={`bg-gradient-to-br ${bgFrom} ${bgTo} text-white`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs mb-5 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          {T("Back to NammaTN", "NammaTN-க்கு திரும்பு")}
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            {badge_en && (
              <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {T(badge_en, badge_ta || badge_en)}
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 flex items-center gap-3">
              {icon && <span className="text-3xl">{icon}</span>}
              {T(title_en, title_ta)}
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl mb-5">
              {T(desc_en, desc_ta)}
            </p>
            <div className="flex flex-wrap gap-3">
              {ctaPath && (
                <Link to={ctaPath}>
                  <button className="bg-white text-slate-800 font-bold px-6 py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-sm flex items-center gap-1.5">
                    {T(cta_en, cta_ta || cta_en)}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              )}
              {secondaryPath && (
                <Link to={secondaryPath}>
                  <button className="border-2 border-white/50 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm">
                    {T(secondary_en, secondary_ta || secondary_en)}
                  </button>
                </Link>
              )}
            </div>
            {disclaimer && (
              <p className="text-white/50 text-xs mt-4 max-w-lg">🔒 {disclaimer}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}