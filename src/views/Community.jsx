'use client';

import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Users, MessageSquare, MapPin, Zap, Radio, Activity } from "lucide-react";
import TnPulseTab from "@/components/community/TnPulseTab";
import CommunityHallTab from "@/components/community/CommunityHallTab";
import AreaDiscussionsTab from "@/components/community/AreaDiscussionsTab";
import LiveDiscussionsTab from "@/components/community/LiveDiscussionsTab";
import LiveChatTab from "@/components/community/LiveChatTab";

const TABS = [
  { id: "pulse", en: "TN Pulse", ta: "TN நாடி", icon: Zap },
  { id: "hall", en: "Community Hall", ta: "சமுதாய மண்டபம்", icon: Users },
  { id: "area", en: "Area Discussions", ta: "பகுதி விவாதங்கள்", icon: MapPin },
  { id: "live", en: "Live Discussions", ta: "நேரடி விவாதங்கள்", icon: Radio },
  { id: "chat", en: "Live Chat", ta: "நேரடி அரட்டை", icon: MessageSquare },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState("pulse");
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  usePageMeta({
    title: "Community — TN Pulse | NammaTN234",
    description: "Real-time pulse of Tamil Nadu. Live situations, scam alerts, emergency help, community questions and wins, all in one place.",
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* ── Hero banner — matches reference: purple/indigo with heartbeat icon ── */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-violet-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center gap-5">
          {/* Animated pulse icon */}
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0 border border-white/20 shadow-lg">
            <Activity className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">
              {T("TN Pulse", "TN நாடி")}
            </h1>
            <p className="text-indigo-200 text-sm font-medium">
              {T("Real-time pulse of your state", "உங்கள் மாநிலத்தின் நேரடி நாடி")}
            </p>
          </div>
        </div>
      </div>

      {/* ── Sticky tab bar ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    active
                      ? "border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {T(tab.en, tab.ta)}
                  {tab.id === "live" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse ml-0.5" />
                  )}
                  {tab.id === "chat" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "pulse" && <TnPulseTab />}
        {activeTab === "hall" && <CommunityHallTab />}
        {activeTab === "area" && <AreaDiscussionsTab />}
        {activeTab === "live" && <LiveDiscussionsTab />}
        {activeTab === "chat" && <LiveChatTab />}
      </div>
    </div>
  );
}