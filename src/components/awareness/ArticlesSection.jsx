import React from "react";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";

const FEATURED_ARTICLES = [
  {
    id: "art-esevai-guide",
    slug: "tamil-nadu-esevai-online-services-guide",
    title_en: "TN e-Sevai Online Services & Certificate Applications",
    title_ta: "தமிழ்நாடு இ-சேவை சான்றிதழ்கள் ஆன்லைனில் பெறுவது எப்படி?",
    category_en: "Government Services",
    category_ta: "அரசு சேவைகள்",
    readTime: "5 min read",
    summary_en: "How to apply for Community, Income, Native, and First Graduate certificates without middleman fees.",
    summary_ta: "இடத்தரகர்கள் இன்றி சாதி, வருமானம், இருப்பிடம் சான்றிதழ்களை ஆன்லைனில் விண்ணப்பிக்கும் முறை."
  },
  {
    id: "art-rti-guide",
    slug: "how-to-file-rti-application-tamil-nadu-guide",
    title_en: "How to File an Effective RTI Application in Tamil Nadu",
    title_ta: "தமிழ்நாட்டில் தகவல் அறியும் உரிமைச் சட்டத்தில் (RTI) விண்ணப்பிப்பது எப்படி?",
    category_en: "Citizen Rights",
    category_ta: "குடிமக்கள் உரிமைகள்",
    readTime: "7 min read",
    summary_en: "Step-by-step instructions on drafting RTI queries, court fee stamps, and 30-day first appeal process.",
    summary_ta: "அரசுத் துறைகளிடம் இருந்து RTI மூலம் தகவல்களைப் பெற கேட்க வேண்டிய கேள்விகள் மற்றும் மேல்முறையீடு."
  },
  {
    id: "art-land-records",
    slug: "patta-chitta-fmb-ec-land-records-guide-tamil-nadu",
    title_en: "Patta, Chitta, FMB Sketch & EC Demystified for Property Owners",
    title_ta: "பட்டா, சிட்டா, வரைபடம் (FMB) மற்றும் வில்லங்கச் சான்றிதழ் (EC) — நில ஆவணங்களின் விளக்கம்",
    category_en: "Property & Revenue",
    category_ta: "சொத்து & வருவாய்",
    readTime: "8 min read",
    summary_en: "Essential guide explaining land revenue terminology in TN, online verification steps, and fraud prevention.",
    summary_ta: "தமிழ்நாட்டில் நிலம் வாங்கும் போது சரிபார்க்க வேண்டிய பட்டா, சிட்டா, வில்லங்கச் சான்றிதழ் விவரங்கள்."
  }
];

export default function ArticlesSection({ lang = "en" }) {
  const T = (en, ta) => (lang === "ta" ? ta : en);

  return (
    <section className="py-10 border-t border-slate-100 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {T("Knowledge Base", "அறிவுத் தளம்")}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>{T("Citizen Knowledge Articles & Guides", "குடிமக்கள் வழிகாட்டிக் கட்டுரைகள்")}</span>
          </h2>
        </div>
        <Link
          href="/awareness/articles"
          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition"
        >
          <span>{T("View All Articles", "அனைத்து கட்டுரைகள்")}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {FEATURED_ARTICLES.map((art) => (
          <div
            key={art.id}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {T(art.category_en, art.category_ta)}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {art.readTime}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition leading-snug">
                <Link href={`/awareness/article/${art.slug}`}>
                  {T(art.title_en, art.title_ta)}
                </Link>
              </h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {T(art.summary_en, art.summary_ta)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Link
                href={`/awareness/article/${art.slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <span>{T("Read Article", "கட்டுரையை படிக்க")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
