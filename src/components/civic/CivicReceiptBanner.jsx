import React from "react";
import { FileText } from "lucide-react";

/**
 * Shown on CreatePost when user picks an issue category.
 * Explains what a Civic Receipt is — in plain language.
 */
export default function CivicReceiptBanner({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;
  return (
    <div className="flex gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
      <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
        <FileText className="w-4 h-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
          {T("NammaTN234 Civic Receipt", "NammaTN234 குடிமை ரசீது")}
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
          {T(
            "NammaTN234 is not a government office. Your post creates a public Civic Receipt — a transparent proof trail that helps citizens document, verify, route, track, and prove local issues.",
            "NammaTN234 ஒரு அரசு அலுவலகம் அல்ல. உங்கள் பதிவு ஒரு பொது குடிமை ரசீதை உருவாக்குகிறது — இது குடிமக்கள் உள்ளூர் சிக்கல்களை ஆவணப்படுத்த, சரிபார்க்க, கண்காணிக்க உதவுகிறது."
          )}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1.5 font-medium">
          📋 {T("Report. Prove. Resolve.", "புகார் செய். நிரூபி. தீர்.")}
        </p>
      </div>
    </div>
  );
}