import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { FileText } from "lucide-react";

const FOOTER_GROUPS = [
  {
    en_title: "Civic Proof",
    ta_title: "குடிமை ஆதாரம்",
    links: [
      { path: "/create", en: "Create Civic Receipt", ta: "குடிமை ரசீது உருவாக்கு" },
      { path: "/explore", en: "Explore", ta: "ஆராய்க" },
      { path: "/trending", en: "Trending", ta: "டிரெண்டிங்" },
      { path: "/situations", en: "Live", ta: "நேரடி" },
      { path: "/leaderboard", en: "Leaderboard", ta: "தகுதிப் பட்டி" },
    ],
  },
  {
    en_title: "Community",
    ta_title: "சமுதாயம்",
    links: [
      { path: "/community", en: "Community", ta: "சமுதாயம்" },
      { path: "/ask", en: "Ask Local", ta: "கேளுங்கள்" },
      { path: "/scams", en: "Scams", ta: "மோசடி" },
      { path: "/awareness", en: "Awareness", ta: "விழிப்புணர்வு" },
    ],
  },
  {
    en_title: "Local Life",
    ta_title: "உள்ளூர் வாழ்க்கை",
    links: [
      { path: "/jobs", en: "Jobs", ta: "வேலை" },
      { path: "/stay", en: "Stay & Rooms", ta: "தங்குமிடம்" },
      { path: "/offices", en: "Offices", ta: "அலுவலகங்கள்" },
      { path: "/listings", en: "Local Listings", ta: "உள்ளூர் பட்டியல்" },
    ],
  },
  {
    en_title: "Organizations",
    ta_title: "நிறுவனங்கள்",
    links: [
      { path: "/rwa", en: "RWA Dashboard", ta: "RWA டாஷ்போர்டு" },
      { path: "/csr", en: "CSR Dashboard", ta: "CSR டாஷ்போர்டு" },
      { path: "/areas", en: "Areas", ta: "பகுதிகள்" },
      { path: "/districts", en: "Districts", ta: "மாவட்டங்கள்" },
    ],
  },
  {
    en_title: "Help",
    ta_title: "உதவி",
    links: [
      { path: "/help", en: "Help", ta: "உதவி" },
      { path: "/support", en: "Support", ta: "ஆதரவு" },
      { path: "/contact", en: "Contact", ta: "தொடர்பு" },
    ],
  },
];

export default function Footer() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Brand */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-10">
          <div className="flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">TN</span>
              </div>
              <span className="font-bold text-white text-lg">NammaTN</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              {T(
                "Tamil Nadu's Public Civic Proof Platform. Helping citizens document, verify, route, track, and prove local civic issues.",
                "தமிழ்நாட்டின் பொது குடிமை ஆதார தளம். குடிமக்கள் உள்ளூர் சிக்கல்களை ஆவணப்படுத்த, சரிபார்க்க மற்றும் நிரூபிக்க உதவுகிறது."
              )}
            </p>
            <Link to="/create" className="inline-flex items-center gap-1.5 mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
              <FileText className="w-3.5 h-3.5" />
              {T("Create Civic Receipt", "குடிமை ரசீது உருவாக்கு")}
            </Link>
          </div>

          {/* Link Groups */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 flex-1">
            {FOOTER_GROUPS.map((group, i) => (
              <div key={i}>
                <h3 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">
                  {T(group.en_title, group.ta_title)}
                </h3>
                <ul className="space-y-2">
                  {group.links.map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} className="text-xs text-slate-400 hover:text-white transition-colors">
                        {T(link.en, link.ta)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-slate-700 pt-6">
          <div className="bg-slate-800 rounded-xl p-4 mb-4">
            <p className="text-xs text-slate-400 leading-relaxed text-center">
              ⚠️ {T(
                "NammaTN is not a government portal and does not replace official grievance systems. We help citizens document local issues, find the right authority, and track public proof.",
                "NammaTN ஒரு அரசு போர்டல் அல்ல மற்றும் அதிகாரப்பூர்வ புகார் அமைப்புகளை மாற்றவில்லை. குடிமக்கள் உள்ளூர் சிக்கல்களை ஆவணப்படுத்தவும், சரியான அதிகாரிகளை கண்டுபிடிக்கவும் உதவுகிறோம்."
              )}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400">
            <p>© 2026 NammaTN. {T("Built for Tamil Nadu citizens.", "தமிழ்நாடு குடிமக்களுக்காக கட்டமைக்கப்பட்டது.")}</p>
            <p>{T("People-powered civic documentation.", "மக்களால் இயக்கப்படும் குடிமை ஆவணப்படுத்தல்.")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}