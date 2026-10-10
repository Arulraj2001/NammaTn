"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import HomeTopSection from "@/components/home/HomeTopSection";
import LiveAlertsTicker from "@/components/home/LiveAlertsTicker";
import QuickActions from "@/components/home/QuickActions";
import TnTodaySpotlight from "@/components/home/TnTodaySpotlight";
import CivicProofSection from "@/components/home/CivicProofSection";
import DistrictGateway from "@/components/home/DistrictGateway";
import CustomAdBanner from "@/components/ads/CustomAdBanner";

const CtaBanner = dynamic(() => import("@/components/home/CtaBanner"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Zone 1: Hero with Clean Interactive Live Map */}
      <HomeTopSection />

      {/* Zone 2: Live Emergency & Utility Alerts Ticker */}
      <LiveAlertsTicker />

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
      <Suspense fallback={null}>
        <CtaBanner />
      </Suspense>
    </div>
  );
}