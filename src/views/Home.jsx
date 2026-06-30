"use client";

// Client Component (uses LazySection which needs IntersectionObserver)
import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import HomeTopSection from "@/components/home/HomeTopSection";
import MyAreaPulse from "@/components/home/MyAreaPulse";
import QuickActions from "@/components/home/QuickActions";
import LazySection from "@/components/common/LazySection";
import { getAreas } from "@/services/areas";

// Below-the-fold sections: loaded only when they scroll near the viewport
const TopCategories = dynamic(() => import("@/components/home/TopCategories"), { ssr: false });
const RecentReceipts = dynamic(() => import("@/components/home/RecentReceipts"), { ssr: false });
const PopularAreasAndServices = dynamic(() => import("@/components/home/PopularAreasAndServices"), { ssr: false });
const HowToUseSection = dynamic(() => import("@/components/home/HowToUseSection"), { ssr: false });
const CtaBanner = dynamic(() => import("@/components/home/CtaBanner"), { ssr: false });

export default function Home() {
  const { data: areas = [] } = useQuery({
    queryKey: ["home-areas-list"],
    queryFn: () => getAreas(100),
    staleTime: 300_000,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Above-the-fold: load eagerly */}
      <HomeTopSection />
      <MyAreaPulse allAreas={areas} />
      <QuickActions />

      {/* Below-the-fold: defer until near viewport */}
      <LazySection rootMargin="400px" minHeight="300px">
        <Suspense fallback={<div style={{ minHeight: "300px" }} aria-hidden="true" />}>
          <TopCategories />
        </Suspense>
      </LazySection>

      <LazySection rootMargin="400px" minHeight="300px">
        <Suspense fallback={<div style={{ minHeight: "300px" }} aria-hidden="true" />}>
          <RecentReceipts />
        </Suspense>
      </LazySection>

      <LazySection rootMargin="400px" minHeight="200px">
        <Suspense fallback={<div style={{ minHeight: "200px" }} aria-hidden="true" />}>
          <PopularAreasAndServices />
        </Suspense>
      </LazySection>

      <LazySection rootMargin="400px" minHeight="200px">
        <Suspense fallback={<div style={{ minHeight: "200px" }} aria-hidden="true" />}>
          <HowToUseSection />
        </Suspense>
      </LazySection>

      <LazySection rootMargin="200px" minHeight="100px">
        <Suspense fallback={<div style={{ minHeight: "100px" }} aria-hidden="true" />}>
          <CtaBanner />
        </Suspense>
      </LazySection>
    </div>
  );
}