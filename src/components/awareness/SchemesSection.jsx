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
                    {T(scheme.badge_en, scheme.badge_ta)}
                  </span>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white line-clamp-2 leading-snug">
                    {T(scheme.name_en, scheme.name_ta)}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 flex-1">
                {T(scheme.desc_en, scheme.desc_ta)}
              </p>
              <div className="flex gap-2 mt-auto flex-wrap">
                <a
                  href={scheme.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  {T("Check Eligibility", "தகுதி சரிபார்")}
                </a>
                <a
                  href={scheme.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
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

export { SCHEMES };
