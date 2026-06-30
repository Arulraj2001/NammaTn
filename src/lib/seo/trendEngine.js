// src/lib/seo/trendEngine.js
// Detects high activity city + issue pairs dynamically based on database report count.

import { createClient } from '@supabase/supabase-js';

const fallbackTrends = [
  { city: 'chennai', issue: 'power-cut', count: 12 },
  { city: 'coimbatore', issue: 'water-issue', count: 8 },
  { city: 'madurai', issue: 'road-problem', count: 5 },
  { city: 'salem', issue: 'scam', count: 4 },
  { city: 'tiruchirappalli', issue: 'jobs', count: 3 }
];

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY
  );
}

export async function getTrendingPairs() {
  try {
    const supabase = getSupabase();
    // Fetch last 30 days of active posts to find hot trends
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: posts, error } = await supabase
      .from('post')
      .select('district_slug, category_slug')
      .eq('status', 'active')
      .gt('created_date', thirtyDaysAgo.toISOString())
      .not('district_slug', 'is', null)
      .not('category_slug', 'is', null);

    if (error || !posts || posts.length === 0) {
      return fallbackTrends;
    }

    // Aggregate counts in memory to avoid complex group-by queries on large DB
    const counts = {};
    posts.forEach(p => {
      const key = `${p.district_slug}:${p.category_slug}`;
      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([key, val]) => {
        const [city, issue] = key.split(':');
        return { city, issue, count: val };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return sorted.length > 0 ? sorted : fallbackTrends;
  } catch (e) {
    console.warn('[trendEngine] Failed to fetch trends, using fallbacks:', e.message);
    return fallbackTrends;
  }
}
