import React from "react";
import { Droplets, Users, GraduationCap, Heart, Briefcase, Home, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const SCHEMES = [
  {
    id: "water",
    icon: Droplets,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge: "Water & Sanitation",
    badge_ta: "நீர் & சுகாதாரம்",
    badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    name_en: "Amma Drinking Water Scheme",
    name_ta: "அம்மா குடிநீர் திட்டம்",
    desc_en: "Provides safe drinking water supply connections to all eligible households.",
    desc_ta: "அனைத்து தகுதியான குடும்பங்களுக்கும் பாதுகாப்பான குடிநீர் இணைப்பு வழங்குகிறது.",
    website: "#",
    apply: "#",
  },
  {
    id: "women",
    icon: Users,
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
    badge: "Women Welfare",
    badge_ta: "பெண்கள் நலன்",
    badgeCls: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    name_en: "Kalaignar Magalir Urimai Thittam",
    name_ta: "கலைஞர் மகளிர் உரிமை திட்டம்",
    desc_en: "Financial assistance for women of eligible families.",
    desc_ta: "தகுதியான குடும்பங்களின் பெண்களுக்கு நிதி உதவி.",
    website: "#",
    apply: "#",
  },
  {
    id: "education",
    icon: GraduationCap,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    badge: "Education",
    badge_ta: "கல்வி",
    badgeCls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    name_en: "Tamil Nadu Student Insurance Scheme",
    name_ta: "மாணவர் காப்பீட்டுத் திட்டம்",
    desc_en: "Insurance coverage for students from classes 1 to 12.",
    desc_ta: "1 முதல் 12 வகுப்பு மாணவர்களுக்கு காப்பீட்டு திட்டம்.",
    website: "#",
    apply: "#",
  },
  {
    id: "health",
    icon: Heart,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    badge: "Health",
    badge_ta: "சுகாதாரம்",
    badgeCls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    name_en: "Chief Minister's Comprehensive Health Insurance",
    name_ta: "முதலமைச்சர் விரிவான சுகாதார காப்பீடு",
    desc_en: "Cashless treatment for eligible families statewide.",
    desc_ta: "தகுதியான குடும்பங்களுக்கு கட்டணமில்லா சிகிச்சை.",
    website: "#",
    apply: "#",
  },
  {
    id: "employment",
    icon: Briefcase,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge: "Employment",
    badge_ta: "வேலைவாய்ப்பு",
    badgeCls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    name_en: "MGNREGA Employment Guarantee",
    name_ta: "MGNREGA வேலை உத்தரவாத திட்டம்",
    desc_en: "Provides 100 days of wage employment to rural households.",
    desc_ta: "கிராமப்புற குடும்பங்களுக்கு 100 நாட்கள் வேலை.",
    website: "#",
    apply: "#",
  },
  {
    id: "housing",
    icon: Home,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    badge: "Housing",
    badge_ta: "வீட்டுவசதி",
    badgeCls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    name_en: "Pradhan Mantri Awas Yojana",
    name_ta: "பிரதான் மந்திரி ஆவாஸ் யோஜனா",
    desc_en: "Affordable housing scheme for urban and rural poor.",
    desc_ta: "நகர்ப்புற மற்றும் கிராமப்புற ஏழைகளுக்கு மலிவு விலை வீட்டுவசதி.",
    website: "#",
    apply: "#",
  },
];

export default function SchemesSection({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <section id="schemes" className="mb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <span className="text-yellow-500">★</span>
          {T("Key Government Schemes", "முக்கிய அரசு திட்டங்கள்")}
        </h2>
        <Link
          to="/awareness"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          {T("View all schemes", "அனைத்து திட்டங்கள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2×3 Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCHEMES.map((scheme) => {
          const Icon = scheme.icon;
          return (
            <div
              key={scheme.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${scheme.iconBg}`}>
                  <Icon className={`w-5 h-5 ${scheme.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full mb-1.5 ${scheme.badgeCls}`}>
                    {T(scheme.badge, scheme.badge_ta)}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 leading-snug">
                    {T(scheme.name_en, scheme.name_ta)}
                  </h3>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                {T(scheme.desc_en, scheme.desc_ta)}
              </p>

              <div className="flex gap-2 mt-auto">
                <a
                  href={scheme.website}
                  className="border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  {T("Check Eligibility", "தகுதி சரிபார்")}
                </a>
                <a
                  href={scheme.apply}
                  className="border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  {T("Apply Now", "விண்ணப்பிக்க")}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
