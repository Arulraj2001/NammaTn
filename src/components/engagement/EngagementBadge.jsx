import React from "react";
import { Flame, TrendingUp, Star, Zap, Shield, Users } from "lucide-react";

const BADGES = {
  trending: { icon: Flame, label: "Trending", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  viral: { icon: TrendingUp, label: "Viral", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  featured: { icon: Star, label: "Featured", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  breaking: { icon: Zap, label: "Breaking", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  verified: { icon: Shield, label: "Verified", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  community: { icon: Users, label: "Community Pick", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

export default function EngagementBadge({ type, className = "" }) {
  const badge = BADGES[type];
  if (!badge) return null;
  const Icon = badge.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.color} ${className}`}>
      <Icon className="w-3 h-3" />
      {badge.label}
    </span>
  );
}

export function computeBadge(post) {
  const score = (post.upvotes || 0) * 2 + (post.comment_count || 0);
  const ageHours = (Date.now() - new Date(post.created_date).getTime()) / 3600000;
  if (ageHours < 24 && score > 20) return "viral";
  if (ageHours < 48 && score > 10) return "trending";
  if (score > 50) return "community";
  return null;
}