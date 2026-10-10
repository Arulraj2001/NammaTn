"use client";
import React, { useState, useMemo } from "react";
import { Phone, Shield, ExternalLink, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import AdSlot from "@/components/ads/AdSlot";

import AwarenessHero from "@/components/awareness/AwarenessHero";
import AwarenessSearch from "@/components/awareness/AwarenessSearch";
import QuickHelpRow from "@/components/awareness/QuickHelpRow";
import QuickResourceCards from "@/components/awareness/QuickResourceCards";
import WhatToDoSection from "@/components/awareness/WhatToDoSection";
import SchemesSection from "@/components/awareness/SchemesSection";
import PortalsSection from "@/components/awareness/PortalsSection";
import ArticlesSection from "@/components/awareness/ArticlesSection";
import AwarenessFaqSection from "@/components/awareness/AwarenessFaqSection";
import AwarenessCTA from "@/components/awareness/AwarenessCTA";
import AwarenessSubNav from "@/components/awareness/AwarenessSubNav";
import AwarenessRelatedLinks from "@/components/awareness/AwarenessRelatedLinks";

import {
  getAllSchemes,
  getAllRights,
  getAllGuides,
  getAllPortals,
  getAllFaqs,
  getAllEmergencyContacts,
  getAllArticles,
} from "@/lib/awarenessServer";

const TOP_SOS_NUMBERS = [
  { number: "112", en: "All Emergencies", ta: "அனைத்து அவசரம்", sub_en: "Police, Fire, Medical (GPS Dispatch)", sub_ta: "காவல், தீ, ஆம்புலன்ஸ்", color: "bg-red-600 hover:bg-red-700" },
  { number: "108", en: "Free Ambulance", ta: "இலவச ஆம்புலன்ஸ்", sub_en: "GVK EMRI Medical Rescue 24x7", sub_ta: "மருத்துவ மீட்பு சேவை", color: "bg-rose-600 hover:bg-rose-700" },
  { number: "1912", en: "Power Cuts & Wires", ta: "மின்வாரியம் 1912", sub_en: "TANGEDCO Minnalagam 24x7", sub_ta: "மின் தடை & கம்பி அறுந்து விழுதல்", color: "bg-amber-600 hover:bg-amber-700" },
  { number: "1930", en: "Cyber Financial Fraud", ta: "சைபர் கிரைம் 1930", sub_en: "National Cyber Crime Golden Hour", sub_ta: "வங்கி & UPI மோசடி மீட்பு", color: "bg-blue-600 hover:bg-blue-700" },
  { number: "181", en: "Women in Distress", ta: "பெண்கள் உதவி 181", sub_en: "Tamil Nadu Domestic & Safety Aid", sub_ta: "பாதுகாப்பு & சட்ட உதவி", color: "bg-pink-600 hover:bg-pink-700" },
  { number: "1100", en: "CM Grievance Cell", ta: "முதல்வர் தனிப்பிரிவு", sub_en: "Direct Collector Grievance Escalation", sub_ta: "அரசு குறைதீர்ப்பு மையம்", color: "bg-emerald-600 hover:bg-emerald-700" },
];

export default function Awareness() {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);
  const [searchQuery, setSearchQuery] = useState("");

  usePageMeta({
    title: "Tamil Nadu Citizen Awareness, Rights & Welfare Schemes | VizhiTN",
    description:
      "Citizen rights, government welfare schemes, emergency helplines, official portals, and civic procedures for Tamil Nadu residents in English & Tamil.",
  });

  const schemes = useMemo(() => getAllSchemes(), []);
  const rights = useMemo(() => getAllRights(), []);
  const guides = useMemo(() => getAllGuides(), []);
  const portals = useMemo(() => getAllPortals(), []);
  const faqs = useMemo(() => getAllFaqs(), []);
  const emergencyContacts = useMemo(() => getAllEmergencyContacts(), []);

  const isSearching = searchQuery.trim().length >= 2;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <AwarenessSubNav activePath="/awareness" />

      {/* Hero with integrated search bar & chips */}
      <AwarenessHero onSearch={setSearchQuery} lang={lang} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Live Search Results Modal/Container */}
        {isSearching && (
          <AwarenessSearch
            query={searchQuery}
            lang={lang}
            schemes={schemes}
            resources={rights}
            guides={guides}
            portals={portals}
            faqs={faqs}
            emergencyContacts={emergencyContacts}
            onClose={() => setSearchQuery("")}
          />
        )}

        {/* 🚨 Universal 24x7 Emergency Speed-Dial SOS Strip (Extreme Hot Zone) */}
        <section aria-label="Emergency Speed Dial" className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                🚨 {T("24x7 Emergency Speed-Dial (1-Tap Call)", "24x7 அவசர உடனடி அழைப்பு (1-தட்டு)")}
              </h2>
            </div>
            <Link
              to="/awareness/emergency"
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              {T("All Helplines", "அனைத்து எண்கள்")} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {TOP_SOS_NUMBERS.map((sos) => (
              <a
                key={sos.number}
                href={`tel:${sos.number}`}
                className="group relative flex flex-col justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-red-500 dark:hover:border-red-500 shadow-sm hover:shadow-md transition-all text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                      {sos.number}
                    </span>
                    <span className="w-7 h-7 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center text-xs">
                      <Phone className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {T(sos.en, sos.ta)}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                    {T(sos.sub_en, sos.sub_ta)}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-red-600 dark:text-red-400">
                  <span>{T("Call Now", "அழை")}</span>
                  <span>📞</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Category pill shortcuts */}
        <QuickHelpRow lang={lang} />

        {/* Quick resource cards (emergency, rights, portals, complaints) */}
        <QuickResourceCards lang={lang} />

        {/* Mid-page ad */}
        <AdSlot placement="homepage" className="my-6 max-w-3xl mx-auto" />

        {/* What to Do If… action guides */}
        <WhatToDoSection lang={lang} />

        {/* Key government welfare schemes with direct links */}
        <SchemesSection lang={lang} />

        {/* Official portals */}
        <PortalsSection lang={lang} />

        {/* Knowledge Base Articles */}
        <ArticlesSection lang={lang} />

        {/* FAQ accordion */}
        <AwarenessFaqSection lang={lang} />

        {/* Cross-Linking Modules for SEO & User Discovery */}
        <AwarenessRelatedLinks currentSection="awareness-home" />
      </div>

      {/* Bottom CTA */}
      <AwarenessCTA lang={lang} />
    </div>
  );
}
