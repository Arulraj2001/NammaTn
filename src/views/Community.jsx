import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Users, MessageSquare, MapPin, Zap, Radio } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Page hero banner */}
      <div className="bg-gradient-to-br from-purple-700 to-indigo-800 text-white px-4 py-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
              👥 {T("Open Community", "திறந்த சமுதாயம்")}
            </div>
            <h1 className="text-2xl font-extrabold mb-1">{T("Community", "சமுதாயம்")}</h1>
            <p className="text-purple-100 text-sm max-w-lg">
              {T("Discuss local issues, share updates, appreciate progress, and connect with people from your area.", "உள்ளூர் சிக்கல்களை விவாதித்து, புதுப்பிப்புகளை பகிர்ந்து உங்கள் பகுதி மக்களுடன் இணைக்கவும்.")}
            </p>
          </div>
        </div>
      </div>
      {/* Sticky header + tab bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-4">
          <div className="pt-3 pb-0">
            <div className="flex gap-0 overflow-x-auto scrollbar-hide -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
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
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {activeTab === "pulse" && <TnPulseTab />}
        {activeTab === "hall" && <CommunityHallTab />}
        {activeTab === "area" && <AreaDiscussionsTab />}
        {activeTab === "live" && <LiveDiscussionsTab />}
        {activeTab === "chat" && <LiveChatTab />}
      </div>
    </div>
  );
}