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
              href={`/${d.slug}/`}
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
              href={`/${districtSlug}/${cat.slug}/`}
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
    .map(slug => DISTRICT_MAP[slug])
    .filter(Boolean);

  if (!nearbyDistricts.length) return null;

  return (
    <nav aria-label="Nearby cities">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
        Nearby Cities
      </p>
      <ul className="flex flex-wrap gap-2">
        {nearbyDistricts.map(d => (
          <li key={d.slug}>
            <Link
              href={`/${d.slug}/`}
              className="text-sm text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 underline-offset-2 hover:underline transition-colors"
            >
              {d.name}
            </Link>
          </li>
        ))}
      </ul>
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
              href={`/${d.slug}/${categorySlug}/`}
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
              href={`/category/${cat.slug}/`}
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
