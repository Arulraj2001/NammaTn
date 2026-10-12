// src/components/seo/InternalLinks.jsx
// Reusable internal linking components for SEO link equity distribution.
// All components are server-renderable (no "use client" — pure HTML links).
//
// Rules:
//  1. Anchor text describes the destination in natural language
//  2. Links use canonical paths
//  3. No duplicate link targets within the same page

import Link from 'next/link';
import { CATEGORIES, DISTRICT_MAP } from '@/lib/seo-data';
import { getDistrictBySlug } from '@/lib/districts';

function getAnchorText(cityName, issueName) {
  return `${issueName} in ${cityName}`;
}

// ── 1. HomeCityLinks ──────────────────────────────────────────────────────────
// Usage: Homepage — links to Tier 1 city hub pages
export function HomeCityLinks() {
  const tier1 = ['chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem',
                  'tirunelveli', 'erode', 'vellore', 'thoothukudi', 'tiruppur'];
  const districts = tier1
    .map(slug => DISTRICT_MAP[slug])
    .filter(Boolean);

  return (
    <nav aria-label="Browse reports by city">
      <ul className="flex flex-wrap gap-2">
        {districts.map(d => (
          <li key={d.slug}>
            <Link
              href={`/${d.slug}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline-offset-2 hover:underline transition-colors"
            >
              {d.name} Hub
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/districts"
            className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline-offset-2 hover:underline transition-colors"
          >
            All Districts →
          </Link>
        </li>
      </ul>
    </nav>
  );
}

// ── 2. DistrictCategoryLinks ──────────────────────────────────────────────────
// Usage: City hub page (/[city]/) — links to each city x issue page
export function DistrictCategoryLinks({ districtSlug, districtName }) {
  return (
    <nav aria-label={`Issue categories in ${districtName}`}>
      <ul className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <li key={cat.slug}>
            <Link
              href={`/${districtSlug}/${cat.slug}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline-offset-2 hover:underline transition-colors"
            >
              {getAnchorText(districtName, cat.plural)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ── 3. NearbyDistrictLinks ────────────────────────────────────────────────────
// Usage: City hub page — links to adjacent city hubs
export function NearbyDistrictLinks({ districtSlug }) {
  const district = DISTRICT_MAP[districtSlug];
  if (!district?.nearby?.length) return null;

  const nearbyDistricts = district.nearby
    .map(slug => {
      const d = DISTRICT_MAP[slug];
      const dMeta = getDistrictBySlug(slug);
      return d ? { ...d, name_ta: dMeta?.name_ta || '' } : null;
    })
    .filter(Boolean);

  if (!nearbyDistricts.length) return null;

  return (
    <nav aria-label="Nearby districts" className="pt-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Neighboring Districts / அருகிலுள்ள மாவட்டங்கள்
        </h3>
        <span className="text-[11px] text-slate-400">Hyperlocal Network</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {nearbyDistricts.map(d => (
          <Link
            key={d.slug}
            href={`/${d.slug}`}
            className="flex flex-col p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all group shadow-xs"
          >
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {d.name}
            </span>
            {d.name_ta && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-tamil mt-0.5">
                {d.name_ta}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

// ── 4. CategoryDistrictLinks ──────────────────────────────────────────────────
// Usage: State-wide Category page — links to city-specific issue pages
export function CategoryDistrictLinks({ categorySlug, categoryName }) {
  const tier1 = ['chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem',
                  'erode', 'tirunelveli', 'vellore', 'thoothukudi', 'tiruppur'];
  const districts = tier1
    .map(slug => DISTRICT_MAP[slug])
    .filter(Boolean);

  return (
    <nav aria-label={`${categoryName} reports by city`}>
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
        {categoryName} Reports by City
      </p>
      <ul className="flex flex-wrap gap-2">
        {districts.map(d => (
          <li key={d.slug}>
            <Link
              href={`/${d.slug}/${categorySlug}`}
              className="text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 underline-offset-2 hover:underline transition-colors"
            >
              {getAnchorText(d.name, categoryName)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ── 5. AllCategoryLinks ───────────────────────────────────────────────────────
// Usage: Homepage footer / sidebar
export function AllCategoryLinks() {
  return (
    <nav aria-label="Browse by issue category">
      <ul className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <li key={cat.slug}>
            <Link
              href={`/category/${cat.slug}`}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 underline-offset-2 hover:underline transition-colors"
            >
              {cat.plural} in Tamil Nadu
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
