"use client";

import React from "react";
import HomeTopSection from "@/components/home/HomeTopSection";
import DistrictQuickStrip from "@/components/home/DistrictQuickStrip";
import RecentDispatchesStrip from "@/components/home/RecentDispatchesStrip";
import QuickActions from "@/components/home/QuickActions";
import TnTodaySpotlight from "@/components/home/TnTodaySpotlight";
import CivicProofSection from "@/components/home/CivicProofSection";
import DistrictGateway from "@/components/home/DistrictGateway";
import CustomAdBanner from "@/components/ads/CustomAdBanner";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-civic-50/50 dark:bg-[#071E3D] flex flex-col">
      {/* Zone 1: Hero with Clean Interactive Live Map, Live Stats Bar & Balanced CTAs */}
      <HomeTopSection />

      {/* Zone 2A: 38-District Horizontal Quick Access Strip */}
      <div id="district-strip">
        <DistrictQuickStrip />
      </div>

      {/* Zone 2B: Happening Right Now (3 Freshest Live Verified Dispatches) */}
      <RecentDispatchesStrip />

      {/* Zone 2C: Quick Civic Actions Bar */}
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