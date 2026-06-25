import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import AdSlot from "@/components/ads/AdSlot";

import AwarenessHero from "@/components/awareness/AwarenessHero";
import QuickHelpRow from "@/components/awareness/QuickHelpRow";
import QuickResourceCards from "@/components/awareness/QuickResourceCards";
import WhatToDoSection from "@/components/awareness/WhatToDoSection";
import SchemesSection from "@/components/awareness/SchemesSection";
import PortalsSection from "@/components/awareness/PortalsSection";
import AwarenessFaqSection from "@/components/awareness/AwarenessFaqSection";
import AwarenessCTA from "@/components/awareness/AwarenessCTA";

export default function Awareness() {
  const { lang } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  usePageMeta({
    title: "Citizen Awareness | VizhiTN",
    description:
      "Citizen rights, government welfare schemes, emergency contacts, and civic resources for Tamil Nadu residents.",
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero with integrated search bar */}
      <AwarenessHero onSearch={setSearchQuery} lang={lang} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category pill shortcuts */}
        <QuickHelpRow lang={lang} />

        {/* Quick resource cards (emergency, rights, portals, complaints) */}
        <QuickResourceCards lang={lang} />

        {/* Mid-page ad */}
        <AdSlot placement="homepage" className="my-6 max-w-3xl mx-auto" />

        {/* What to Do If… guide row */}
        <WhatToDoSection lang={lang} />

        {/* Key government schemes grid */}
        <SchemesSection lang={lang} />

        {/* Official portals */}
        <PortalsSection lang={lang} />

        {/* FAQ accordion */}
        <AwarenessFaqSection lang={lang} />
      </div>

      {/* Bottom CTA */}
      <AwarenessCTA lang={lang} />
    </div>
  );
}