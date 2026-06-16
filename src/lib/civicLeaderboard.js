// Civic leaderboard & trust badge helpers

export const TRUST_BADGES = [
  { key: "verified_citizen", label: "Verified Citizen", icon: "✅", color: "text-blue-600 bg-blue-50", description: "Identity verified community member" },
  { key: "area_contributor", label: "Area Contributor", icon: "📍", color: "text-green-600 bg-green-50", description: "Regular contributor in a specific area" },
  { key: "issue_verifier", label: "Issue Verifier", icon: "🔍", color: "text-indigo-600 bg-indigo-50", description: "Actively verifies civic issues" },
  { key: "civic_helper", label: "Civic Helper", icon: "🤝", color: "text-teal-600 bg-teal-50", description: "Helps community members with civic guidance" },
  { key: "community_solver", label: "Community Solver", icon: "⚡", color: "text-amber-600 bg-amber-50", description: "Has helped resolve community issues" },
  { key: "scam_reporter", label: "Scam Reporter", icon: "🛡️", color: "text-red-600 bg-red-50", description: "Reports misinformation and scams" },
  { key: "rwa_admin", label: "RWA Admin", icon: "🏘️", color: "text-purple-600 bg-purple-50", description: "Manages a registered community group" },
  { key: "sponsor", label: "Civic Sponsor", icon: "💚", color: "text-emerald-600 bg-emerald-50", description: "Supports civic transparency" },
];

export const LEADERBOARD_CATEGORIES = [
  { key: "most_verified", label: "Most Verified Issues", icon: "🔍", description: "Issues with most community verifications" },
  { key: "fastest_fixed", label: "Fastest Fixed Areas", icon: "⚡", description: "Areas where issues get resolved quickly" },
  { key: "top_contributors", label: "Most Active Contributors", icon: "🌟", description: "Citizens with most civic contributions" },
  { key: "community_solved", label: "Best Community Solved", icon: "🤝", description: "Issues resolved by community action" },
  { key: "longest_pending", label: "Longest Pending Issues", icon: "⏰", description: "Issues awaiting resolution the longest" },
  { key: "civic_wins", label: "Top Civic Wins This Month", icon: "🏆", description: "Issues resolved with proof this month" },
];

export function getBadgeMeta(key) {
  return TRUST_BADGES.find((b) => b.key === key) || null;
}