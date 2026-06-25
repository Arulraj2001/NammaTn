// Server Component
import React from "react";
import HomeTopSection from "@/components/home/HomeTopSection";
import MyAreaPulse from "@/components/home/MyAreaPulse";
import QuickActions from "@/components/home/QuickActions";
import TopCategories from "@/components/home/TopCategories";
import RecentReceipts from "@/components/home/RecentReceipts";
import PopularAreasAndServices from "@/components/home/PopularAreasAndServices";
import HowToUseSection from "@/components/home/HowToUseSection";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <HomeTopSection />
      <MyAreaPulse />
      <QuickActions />
      <TopCategories />
      <RecentReceipts />
      <PopularAreasAndServices />
      <HowToUseSection />
      <CtaBanner />
    </div>
  );
}