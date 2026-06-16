import React from "react";
import { Flame, TrendingUp, MapPin, Tag } from "lucide-react";
import PageHero from "@/components/common/PageHero";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import TrendingTabs from "@/components/discovery/TrendingTabs";
import DistrictRanking from "@/components/discovery/DistrictRanking";
import AdSlot from "@/components/ads/AdSlot";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getTrendingCategories } from "@/services/trending";
import { CATEGORIES } from "@/lib/categories";

export default function Trending() {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  usePageMeta({
    title: "NammaTN - Trending Now",
    description: "See the most discussed civic issues, alerts, complaints, and community updates across Tamil Nadu.",
  });

  const { data: trendingCats = [] } = useQuery({
    queryKey: ["trending-categories"],
    queryFn: getTrendingCategories,
    staleTime: 180_000,
  });

  return (
    <div>
      <PageHero
        icon="🔥"
        title_en="Trending Now"
        title_ta="இப்போது டிரெண்டிங்"
        desc_en="See what people are discussing most across Tamil Nadu, including alerts, complaints, Civic Receipts, and community updates."
        desc_ta="தமிழ்நாடு முழுவதும் மக்கள் அதிகம் விவாதிக்கும் எச்சரிக்கைகள், புகார்கள், குடிமை ரசீதுகள் மற்றும் சமுதாய புதுப்பிப்புகளை காணுங்கள்."
        cta_en="View Trending Issues"
        cta_ta="டிரெண்டிங் சிக்கல்களை பார்"
        ctaPath="/explore"
        secondary_en="Create Civic Receipt"
        secondary_ta="குடிமை ரசீது உருவாக்கு"
        secondaryPath="/create"
        bgFrom="from-orange-600"
        bgTo="to-red-700"
        lang={lang}
        badge_en="Most Discussed"
        badge_ta="அதிகம் விவாதிக்கப்பட்டவை"
      />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Trending Posts */}
          <section>
            <TrendingTabs limit={9} />
          </section>

          <AdSlot placement="feed" className="w-full" />
        </div>

        <div className="space-y-6">
          {/* District Ranking */}
          <DistrictRanking limit={10} />

          {/* Trending Categories */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-blue-500" />
              {T("Hot Categories", "சூடான வகைகள்")}
            </h3>
            <div className="space-y-2">
              {trendingCats.slice(0, 8).map((cat, i) => {
                const info = CATEGORIES.find((c) => c.slug === cat.slug);
                return (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    className="flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl px-2 py-2 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{info?.icon || "📌"}</span>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {info ? T(info.name_en, info.name_ta) : cat.name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{cat.postCount}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <AdSlot placement="category" className="w-full" />
        </div>
      </div>
    </div>
    </div>
  );
}