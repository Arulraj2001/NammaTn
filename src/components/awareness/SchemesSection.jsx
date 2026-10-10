"use client";

import React from "react";
import { Droplets, Users, GraduationCap, Heart, Briefcase, UtensilsCrossed, ArrowRight, ExternalLink, Sparkles } from "lucide-react";
import { Link } from "@/lib/router-compat";

// Real active TN government schemes with verified data
const SCHEMES = [
  {
    id: "magalir-urimai",
    slug: "kalaignar-magalir-urimai-thogai",
    icon: Users,
    iconBg: "bg-pink-500/10 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400",
    badge_en: "Women Welfare",
    badge_ta: "பெண்கள் நலன்",
    badgeCls: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
    benefit_en: "₹1,000 / Month DBT",
    benefit_ta: "மாதம் ₹1,000 நேரடி உதவி",
    name_en: "Kalaignar Magalir Urimai Thogai",
    name_ta: "கலைஞர் மகளிர் உரிமைத் தொகை",
    desc_en: "Direct financial assistance for female heads of families with annual income below ₹2.5 lakh.",
    desc_ta: "ஆண்டு வருமானம் ₹2.5 லட்சத்திற்கு குறைவான குடும்பத் தலைவிகளுக்கான நேரடி வங்கி உதவி.",
    eligibility_en: "Age 21+, family income < ₹2.5L/yr, no govt employee in family",
    eligibility_ta: "வயது 21+, குடும்ப வருமானம் < ₹2.5 லட்சம், அரசு ஊழியர் அல்லாதவர்",
    apply_url: "https://www.kmut.tn.gov.in",
    dept_en: "Social Welfare Dept",
    dept_ta: "சமூக நலத்துறை",
  },
  {
    id: "pudhumai-penn",
    slug: "pudhumai-penn",
    icon: GraduationCap,
    iconBg: "bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    badge_en: "Higher Education",
    badge_ta: "உயர்கல்வி",
    badgeCls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
    benefit_en: "₹1,000 / Month Higher Ed",
    benefit_ta: "மாதம் ₹1,000 கல்வி உதவி",
    name_en: "Pudhumai Penn Scheme",
    name_ta: "புதுமை பெண் திட்டம்",
    desc_en: "Monthly scholarship for girl students who studied Classes 6–12 in government schools.",
    desc_ta: "அரசுப் பள்ளியில் 6-12 படித்து உயர்கல்வி பயிலும் மாணவிகளுக்கான மாதாந்திர ஊக்கத்தொகை.",
    eligibility_en: "Girl students from TN govt schools currently in college/diploma",
    eligibility_ta: "அரசுப் பள்ளியில் படித்து கல்லூரி / டிப்ளமோ பயிலும் மாணவிகள்",
    apply_url: "https://pudhummapenn.tn.gov.in",
    dept_en: "Higher Education Dept",
    dept_ta: "உயர்கல்வித் துறை",
  },
  {
    id: "cmchis",
    slug: "cmchis-health-insurance",
    icon: Heart,
    iconBg: "bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400",
    badge_en: "Free Healthcare",
    badge_ta: "இலவச மருத்துவம்",
    badgeCls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    benefit_en: "₹5 Lakh / Year Cashless",
    benefit_ta: "ஆண்டுக்கு ₹5 லட்சம் இலவச சிகிச்சை",
    name_en: "CM Comprehensive Health Insurance (CMCHIS)",
    name_ta: "முதலமைச்சர் விரிவான சுகாதார காப்பீடு",
    desc_en: "Cashless medical treatments at 1,150+ empanelled government and private hospitals.",
    desc_ta: "அங்கீகரிக்கப்பட்ட 1,150+ அரசு மற்றும் தனியார் மருத்துவமனைகளில் பணமில்லா சிகிச்சை.",
    eligibility_en: "Valid Tamil Nadu Smart Ration Card holders",
    eligibility_ta: "செல்லுபடியாகும் தமிழ்நாடு ஸ்மார்ட் குடும்ப அட்டை உடையவர்கள்",
    apply_url: "https://www.cmchis.com",
    dept_en: "Health & Family Welfare",
    dept_ta: "சுகாதாரத் துறை",
  },
  {
    id: "breakfast-scheme",
    slug: "breakfast-scheme",
    icon: UtensilsCrossed,
    iconBg: "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400",
    badge_en: "Child Nutrition",
    badge_ta: "குழந்தை ஊட்டச்சத்து",
    badgeCls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    benefit_en: "Nutritious Breakfast Daily",
    benefit_ta: "தினசரி சத்தான காலை உணவு",
    name_en: "CM Breakfast Scheme (Classes 1–5)",
    name_ta: "முதலமைச்சர் காலை உணவுத் திட்டம்",
    desc_en: "Hot wholesome breakfast served every school day across all government primary schools.",
    desc_ta: "அனைத்து அரசு தொடக்கப் பள்ளிகளிலும் 1 முதல் 5 ஆம் வகுப்பு வரை படிக்கும் மாணவர்களுக்கு காலை உணவு.",
    eligibility_en: "All students enrolled in TN govt primary schools",
    eligibility_ta: "அரசு தொடக்கப் பள்ளிகளில் படிக்கும் அனைத்து மாணவர்கள்",
    apply_url: "https://www.tn.gov.in",
    dept_en: "School Education Dept",
    dept_ta: "பள்ளிக் கல்வித் துறை",
  },
  {
    id: "mgnrega",
    slug: "mgnrega-100-days-employment-scheme-tamil-nadu",
    icon: Briefcase,
    iconBg: "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    badge_en: "Rural Employment",
    badge_ta: "ஊரக வேலைவாய்ப்பு",
    badgeCls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    benefit_en: "100 Days Statutory Wage",
    benefit_ta: "100 நாள் கூலி வேலை உத்தரவாதம்",
    name_en: "MGNREGA — 100 Days Rural Employment",
    name_ta: "100 நாள் வேலைத் திட்டம் (MGNREGA)",
    desc_en: "Guaranteed unskilled wage employment for rural households with direct bank credit.",
    desc_ta: "கிராமப்புற குடும்பங்களுக்கு சட்டப்பூர்வ வேலை உத்தரவாதம் மற்றும் நேரடி கூலி வரவு.",
    eligibility_en: "Adult rural household members holding a Gram Panchayat Job Card",
    eligibility_ta: "கிராம பஞ்சாயத்து வேலை அட்டை வைத்திருக்கும் ஊரக குடும்பத்தினர்",
    apply_url: "https://nrega.nic.in",
    dept_en: "Rural Development Dept",
    dept_ta: "ஊரக வளர்ச்சித் துறை",
  },
  {
    id: "jal-jeevan",
    slug: "jal-jeevan",
    icon: Droplets,
    iconBg: "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400",
    badge_en: "Clean Water",
    badge_ta: "குடிநீர் சேவை",
    badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    benefit_en: "Functional Household Tap",
    benefit_ta: "வீட்டு குழாய் குடிநீர் இணைப்பு",
    name_en: "Jal Jeevan Mission — Har Ghar Jal",
    name_ta: "ஜல் ஜீவன் மிஷன் — இல்லம்தோறும் குடிநீர்",
    desc_en: "Potable piped drinking water supply for rural households across Tamil Nadu.",
    desc_ta: "தமிழ்நாட்டில் கிராமப்புற குடும்பங்களுக்கு பாதுகாக்கப்பட்ட குழாய் குடிநீர் விநியோகம்.",
    eligibility_en: "Rural households without functional domestic tap water connection",
    eligibility_ta: "செயல்பாட்டு குடிநீர் இணைப்பு இல்லாத கிராமப்புற குடும்பங்கள்",
    apply_url: "https://jaljeevanmission.gov.in",
    dept_en: "TWAD Board & Water Supply",
    dept_ta: "TWAD வாரியம் & குடிநீர் துறை",
  },
];

export default function SchemesSection({ lang = "en" }) {
  const T = (en, ta) => (lang === "ta" ? ta : en);

  return (
    <section id="schemes" className="mb-10">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="text-amber-500">★</span>
            {T("Key Government Schemes", "முக்கிய அரசு திட்டங்கள்")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {T("Direct benefit transfers, healthcare, and welfare assistance in Tamil Nadu", "தமிழ்நாட்டின் நேரடி நிதி உதவி, இலவச மருத்துவம் மற்றும் நலத்திட்டங்கள்")}
          </p>
        </div>
        <Link
          to="/awareness/schemes"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 flex-shrink-0"
        >
          {T("View all schemes", "அனைத்து திட்டங்கள்")} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Medium Cards Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SCHEMES.map((scheme) => {
          const Icon = scheme.icon;
          const detailUrl = `/awareness/scheme/${scheme.slug || scheme.id}`;

          return (
            <div
              key={scheme.id}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Icon + Category Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${scheme.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${scheme.badgeCls}`}>
                    {T(scheme.badge_en, scheme.badge_ta)}
                  </span>
                </div>

                {/* Scheme Title */}
                <Link to={detailUrl} className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {T(scheme.name_en, scheme.name_ta)}
                  </h3>
                </Link>

                {/* Financial / Primary Benefit Highlight Pill */}
                <div className="mt-2 mb-2.5 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>{T(scheme.benefit_en, scheme.benefit_ta)}</span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
                  {T(scheme.desc_en, scheme.desc_ta)}
                </p>

                {/* Eligibility Summary Box */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="font-bold text-slate-700 dark:text-slate-200 block mb-0.5">
                    ✓ {T("Eligibility:", "தகுதி:")}
                  </span>
                  <span className="line-clamp-2 text-slate-500 dark:text-slate-400">
                    {T(scheme.eligibility_en, scheme.eligibility_ta)}
                  </span>
                </div>
              </div>

              {/* Action Footer */}
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  to={detailUrl}
                  className="flex-1 text-center py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  {T("Check Eligibility & Docs", "தகுதி & ஆவணங்கள்")} →
                </Link>
                {scheme.apply_url && (
                  <a
                    href={scheme.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={T("Apply on Official Portal", "அரசு தளம்")}
                    className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs transition-colors flex-shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
