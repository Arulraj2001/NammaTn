"use client";

import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getActiveCivicPosts } from "@/services/posts";
import { getActiveSituations } from "@/services/situations";
import { getActiveScams } from "@/services/scamAlerts";
import { getActiveEmergencies } from "@/services/emergencyPosts";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function NearYouStats({ userLocation }) {
  const { lang } = useLanguage();
  const T = (en, ta) => (lang === "ta" ? ta : en);

  const { data: civicPosts = [], isLoading: l1 } = useQuery({
    queryKey: ["home-civic-posts"],
    queryFn: () => getActiveCivicPosts(20),
    staleTime: 60_000,
  });
  const { data: situations = [], isLoading: l2 } = useQuery({
    queryKey: ["home-situations"],
    queryFn: () => getActiveSituations(20),
    staleTime: 60_000,
  });
  const { data: scams = [], isLoading: l3 } = useQuery({
    queryKey: ["home-scams"],
    queryFn: () => getActiveScams(20),
    staleTime: 60_000,
  });
  const { data: emergencies = [], isLoading: l4 } = useQuery({
    queryKey: ["home-emergencies"],
    queryFn: () => getActiveEmergencies(10),
    staleTime: 60_000,
  });

  const loading = l1 || l2 || l3 || l4;

  const getNearbyItems = (items) => {
    if (!userLocation) return items;
    return items.filter(item => {
      if (!item.latitude || !item.longitude) return false;
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(item.latitude),
        parseFloat(item.longitude)
      );
      return dist <= 60;
    });
  };

  const nearbySituations = getNearbyItems(situations);
  const nearbyScams = getNearbyItems(scams);
  const nearbyCivicPosts = getNearbyItems(civicPosts);
  const nearbyEmergencies = getNearbyItems(emergencies);

  const powerIssues   = nearbySituations.filter(s => s.situation_type === "eb_shutdown").length;
  const waterAlerts   = nearbySituations.filter(s => s.situation_type === "water_shortage").length;
  const scamWarnings  = nearbyScams.length;
  const roadProblems  = nearbyCivicPosts.filter(p => p.category_slug?.includes("road")).length;
  const emergCount    = nearbyEmergencies.length;

  const NEAR_YOU_STATS = [
    { path: "/category/electricity",       icon: "⚡", color: "text-yellow-500", bgColor: "bg-yellow-50 dark:bg-yellow-900/20", border: "border-yellow-200 dark:border-yellow-700", count: powerIssues, label_en: "Power Issues",       label_ta: "மின் சிக்கல்கள்",    sub_en: "areas affected",      sub_ta: "பகுதிகள் பாதிக்கப்பட்டன" },
    { path: "/category/water-sanitation",  icon: "💧", color: "text-blue-500",   bgColor: "bg-blue-50 dark:bg-blue-900/20",     border: "border-blue-200 dark:border-blue-700",   count: waterAlerts,  label_en: "Water Alert",        label_ta: "நீர் எச்சரிக்கை",   sub_en: "area affected",       sub_ta: "பகுதி பாதிக்கப்பட்டது" },
    { path: "/scams",                      icon: "⚠️", color: "text-red-500",   bgColor: "bg-red-50 dark:bg-red-900/20",       border: "border-red-200 dark:border-red-700",     count: scamWarnings, label_en: "Scam Warnings",      label_ta: "மோசடி எச்சரிக்கை", sub_en: "new reports",         sub_ta: "புதிய புகார்கள்" },
    { path: "/category/road-infrastructure",icon: "🚧", color: "text-orange-500", bgColor: "bg-orange-50 dark:bg-orange-900/20", border: "border-orange-200 dark:border-orange-700",count: roadProblems, label_en: "Road Problems",      label_ta: "சாலை சிக்கல்கள்",   sub_en: "areas affected",      sub_ta: "பகுதிகள் பாதிக்கப்பட்டன" },
    { path: "/help",                       icon: "🚨", color: "text-rose-500",   bgColor: "bg-rose-50 dark:bg-rose-900/20",     border: "border-rose-200 dark:border-rose-700",   count: emergCount,   label_en: "Emergency Request",  label_ta: "அவசர கோரிக்கை",    sub_en: "needs help",          sub_ta: "உதவி தேவை" },
  ];

  return (
    <section className="bg-slate-50 dark:bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {T("What's happening near you?", "உங்கள் அருகில் என்ன நடக்கிறது?")}
          </h2>
          <Link to={userLocation ? `/explore?lat=${userLocation.latitude}&lng=${userLocation.longitude}&nearby=true` : "/explore"} className="flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            {T("View all", "அனைத்தும்")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 min-h-[100px]">
          {loading ? (
            [1,2,3,4,5].map(i => (
              <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-4 animate-pulse h-[100px]" />
            ))
          ) : (
            NEAR_YOU_STATS.map((stat, i) => (
              <Link key={i} to={stat.path}>
                <div className={`${stat.bgColor} ${stat.border} border rounded-2xl p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer`}>
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-xl leading-none">{stat.icon}</span>
                    <span className={`text-2xl font-extrabold ${stat.color} leading-none`}>{stat.count}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight mb-0.5">
                    {T(stat.label_en, stat.label_ta)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {stat.count} {T(stat.sub_en, stat.sub_ta)}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
