"use client";

import React from "react";
import HomeTopSection from "@/components/home/HomeTopSection";
import QuickActions from "@/components/home/QuickActions";
import TnTodaySpotlight from "@/components/home/TnTodaySpotlight";
import CivicProofSection from "@/components/home/CivicProofSection";
import DistrictGateway from "@/components/home/DistrictGateway";
import CustomAdBanner from "@/components/ads/CustomAdBanner";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Zone 1: Hero with Clean Interactive Live Map */}
      <HomeTopSection />

      {/* Quick Civic Actions Bar */}
      <QuickActions />

      {/* Zone 3: Flagship Editorial Newsroom Spotlight (TN Today) */}
      <TnTodaySpotlight />

      {/* Zone 4: Real Citizen Proof & Verified Receipts */}
      <CivicProofSection />

      {/* Zone 5: 38-District Hyperlocal Gateway */}
      <DistrictGateway />

      {/* Sponsor / Custom Ad Slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full">
        <CustomAdBanner slot="home_footer" />
      </div>

      {/* Bottom Civic Action Banner */}
      <CtaBanner />
    </div>
  );
}