import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Leaf, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AreaSponsorBadge({ areaSlug, districtSlug }) {
  const { lang } = useLanguage();
  const T = (en, ta) => lang === "ta" ? ta : en;

  const { data: sponsors = [] } = useQuery({
    queryKey: ["area-sponsor", areaSlug, districtSlug],
    queryFn: () =>
      base44.entities.CivicSponsor.filter(
        { status: "active", is_verified: true, is_active: true },
        "-created_date", 5
      ),
    staleTime: 10 * 60_000,
  });

  // Match by area or district, must be active + verified + is_active
  // No fallback to unrelated sponsors — only show if there is an explicit area/district match
  const sponsor = sponsors.find(s =>
    (areaSlug && s.area_slug === areaSlug) ||
    (!areaSlug && districtSlug && s.district_slug === districtSlug)
  ) || null;

  if (!sponsor) return null;

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2.5">
      <div className="flex items-start gap-2">
        <Leaf className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            {T("Area civic transparency supported by", "பகுதி குடிமை வெளிப்படைத்தன்மை ஆதரிக்கப்படுகிறது")}{" "}
            <strong>{sponsor.sponsor_name}</strong>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            🏷️ {T("Sponsored placement · Does not affect Civic Receipt status, rankings, or proof.", "நிதியுதவி இடம் · குடிமை ரசீது நிலை, தரவரிசை அல்லது சான்றை பாதிக்காது.")}
          </p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {sponsor.sponsor_website && (
            <a href={sponsor.sponsor_website} target="_blank" rel="noreferrer" className="text-emerald-600 hover:text-emerald-800">
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}