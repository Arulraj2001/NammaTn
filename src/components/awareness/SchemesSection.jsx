"use client";

import React from "react";
import { Droplets, Users, GraduationCap, Heart, Briefcase, UtensilsCrossed, ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";

// Real active TN government schemes 2024-2025 with verified data
const SCHEMES = [
  {
    id: "magalir-urimai",
    icon: Users,
    iconBg: "bg-pink-100 dark:bg-pink-900/30",
    iconColor: "text-pink-600 dark:text-pink-400",
    badge_en: "Women Welfare",
    badge_ta: "பெண்கள் நலன்",
    badgeCls: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
    name_en: "Kalaignar Magalir Urimai Thogai",
    name_ta: "கலைஞர் மகளிர் உரிமை தொகை",
    desc_en: "₹1,000/month for female heads of households (age 21+, income below ₹2.5 lakh/yr).",
    desc_ta: "பெண் குடும்பத் தலைவர்களுக்கு மாதம் ₹1,000 (வயது 21+, வருமானம் ₹2.5 லட்சம் குறைவு).",
    eligibility_en: "Age 21+, annual income < ₹2.5L, not a govt employee or income tax payer",
    apply_url: "https://www.kmut.tn.gov.in",
    website_url: "https://www.kmut.tn.gov.in",
    dept_en: "Social Welfare Dept.",
  },
  {
    id: "pudhumai-penn",
    icon: GraduationCap,
    iconBg: "bg-indigo-100 dark:bg-indigo-900/30",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    badge_en: "Education",
    badge_ta: "கல்வி",
    badgeCls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    name_en: "Pudhumai Penn Scheme",
    name_ta: "புதுமை பெண் திட்டம்",
    desc_en: "₹1,000/month for girl students who completed Class 6–12 in govt schools and pursue higher education.",
    desc_ta: "அரசுப் பள்ளியில் படித்து உயர்கல்வி பயிலும் மாணவிகளுக்கு மாதம் ₹1,000.",
    eligibility_en: "Girl student from govt school, pursuing higher education",
    apply_url: "https://www.pudhummapenn.tn.gov.in",
    website_url: "https://www.pudhummapenn.tn.gov.in",
    dept_en: "Higher Education Dept.",
  },
  {
    id: "cmchis",
    icon: Heart,
    iconBg: "bg-red-100 dark:bg-red-900/30",
    iconColor: "text-red-600 dark:text-red-400",
    badge_en: "Health",
    badge_ta: "சுகாதாரம்",
    badgeCls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    name_en: "CM's Comprehensive Health Insurance (CMCHIS)",
    name_ta: "முதலமைச்சர் விரிவான சுகாதார காப்பீடு",
    desc_en: "Cashless treatment up to ₹5 lakh per year for govt ration card holders at empanelled hospitals.",
    desc_ta: "அரசு குடும்ப அட்டை வைத்திருப்பவர்களுக்கு ஆண்டுக்கு ₹5 லட்சம் வரை இலவச சிகிச்சை.",
    eligibility_en: "Must have a valid Tamil Nadu ration card",
    apply_url: "https://www.cmchis.com",
    website_url: "https://www.cmchis.com",
    dept_en: "Health & Family Welfare Dept.",
  },
  {
    id: "breakfast-scheme",
    icon: UtensilsCrossed,
    iconBg: "bg-amber-100 dark:bg-amber-900/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    badge_en: "Child Welfare",
    badge_ta: "குழந்தை நலன்",
    badgeCls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    name_en: "CM's Breakfast Scheme",
    name_ta: "முதலமைச்சர் காலை உணவு திட்டம்",
    desc_en: "Free nutritious breakfast for Classes 1–5 students in all Tamil Nadu government primary schools.",
    desc_ta: "அரசு தொடக்கப் பள்ளி மாணவர்களுக்கு (1–5) இலவச காலை உணவு.",
    eligibility_en: "Students of government primary schools (Classes 1-5)",
    apply_url: "https://www.tn.gov.in",
    website_url: "https://www.tn.gov.in",
    dept_en: "School Education Dept.",
  },
  {
    id: "mgnrega",
    icon: Briefcase,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    badge_en: "Employment",
    badge_ta: "வேலைவாய்ப்பு",
    badgeCls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    name_en: "MGNREGA — 100 Days Employment",
    name_ta: "MGNREGA — 100 நாட்கள் வேலை",
    desc_en: "Legal guarantee of 100 days of unskilled manual work per year for rural households. Wages paid to bank account.",
    desc_ta: "கிராமப்புற குடும்பங்களுக்கு வருடத்திற்கு 100 நாட்கள் வேலை உத்தரவாதம். ஊதியம் வங்கி கணக்கில் வரவு.",
    eligibility_en: "Any adult rural household member willing to do manual work",
    apply_url: "https://nrega.nic.in",
    website_url: "https://nrega.nic.in",
    dept_en: "Rural Development Dept.",
  },
  {
    id: "water-scheme",
    icon: Droplets,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    badge_en: "Water & Sanitation",
    badge_ta: "நீர் & சுகாதாரம்",
    badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    name_en: "Jal Jeevan Mission — Tap Water for All",
    name_ta: "ஜல் ஜீவன் மிஷன் — அனைவருக்கும் குழாய் நீர்",
    desc_en: "Household tap water connections for every rural family in Tamil Nadu by 2024 under Jal Jeevan Mission.",
    desc_ta: "தமிழ்நாட்டில் ஒவ்வொரு கிராமப்புற குடும்பத்திற்கும் குழாய் நீர் இணைப்பு.",
    eligibility_en: "Rural households without existing tap water connection",
    apply_url: "https://jaljeevanmission.gov.in",
    website_url: "https://jaljeevanmission.gov.in",
    dept_en: "Public Works Dept.",
  },
];

export default function SchemesSection({ lang = "en" }) {
  const T = (en, ta) => lang === "ta" ? ta : en;

  return (
    <section id="schemes" className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span className="text-yellow-500">★</span>
          {T("Key Government Schemes", "முக்கிய அரசு திட்டங்கள்")}
        </h2>
        <Link
          to="/awareness/schemes"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
        >
          {T("View all schemes", "அனைத்து திட்டங்கள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

        {SCHEMES.map((scheme) => {
          const Icon = scheme.icon;
          const detailUrl = `/awareness/scheme/${scheme.slug || scheme.id}`;
          return (
            <div
              key={scheme.id}
              className="group bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-500 rounded-3xl p-5 sm:p-6 hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${scheme.iconBg}`}>
                    <Icon className={`w-6 h-6 ${scheme.iconColor}`} />
                  </div>
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${scheme.badgeCls}`}>
                    {T(scheme.badge_en, scheme.badge_ta)}
                  </span>
                </div>

                <Link to={detailUrl} className="block group-hover:text-blue-600 transition">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {T(scheme.name_en, scheme.name_ta)}
                  </h3>
                </Link>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {T(scheme.desc_en, scheme.desc_ta)}
                </p>

                {scheme.eligibility_en && (
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-700 dark:text-slate-200 block mb-0.5">
                      ✓ {T("Eligibility:", "தகுதி:")}
                    </strong>
                    <span className="line-clamp-2">{T(scheme.eligibility_en, scheme.eligibility_ta)}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <Link
                  to={detailUrl}
                  className="flex-1 text-center py-2 px-3 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white font-bold text-xs rounded-xl transition shadow-sm"
                >
                  {T("Check Eligibility & Docs", "தகுதி & ஆவணங்கள்")} →
                </Link>
                {scheme.apply_url && (
                  <a
                    href={scheme.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={T("Apply on Official Portal", "அரசு தளத்தில் விண்ணப்பிக்க")}
                    className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold transition"
                  >
                    ↗
                  </a>
                )}
              </div>
            </div>
          );
        })}
    </section>
  );
}

export { SCHEMES };
