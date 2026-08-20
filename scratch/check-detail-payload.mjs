// scratch/check-detail-payload.mjs
// Measures the detail query payload (all detail fields, EXCLUDING blobs)
// to confirm it stays under Next.js's 2MB cache limit.
import fs from 'node:fs';

const envText = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const url = env.NEXT_PUBLIC_VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mirrors getTnTodayBySlug / getTnTodayArticle detail select (no blobs)
const DETAIL_FIELDS = [
  'id', 'title', 'title_ta', 'slug', 'subtitle', 'subtitle_ta', 'category',
  'author_name', 'publish_date', 'status', 'reading_time',
  'content', 'content_ta', 'summary', 'summary_ta',
  'why_it_matters', 'why_it_matters_ta',
  'key_facts', 'key_facts_ta', 'timeline', 'timeline_ta',
  'official_sources', 'related_civic_links',
  'seo_title', 'seo_description', 'seo_keywords', 'canonical_url',
  'is_featured', 'view_count', 'created_date', 'updated_date',
  'district_slug', 'district_name',
].join(',');

async function main() {
  const res = await fetch(
    `${url}/rest/v1/tn_today?select=${encodeURIComponent(DETAIL_FIELDS)}&status=eq.published&limit=50`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  const data = await res.json();
  if (!Array.isArray(data)) { console.error('Unexpected response', data); process.exit(1); }

  let total = 0;
  let worst = { bytes: 0, title: '' };
  for (const row of data) {
    const bytes = new TextEncoder().encode(JSON.stringify(row)).length;
    total += bytes;
    if (bytes > worst.bytes) worst = { bytes, title: row.title };
  }

  const worstMb = (worst.bytes / 1024 / 1024).toFixed(2);
  const worstOk = worst.bytes < 2 * 1024 * 1024;
  const totalMb = (total / 1024 / 1024).toFixed(2);
  console.log(`Detail fields — ${data.length} rows`);
  console.log(`Worst single row: ${worstMb} MB ${worstOk ? '✅ under 2MB' : '❌ OVER 2MB'} — "${worst.title}"`);
  console.log(`All published rows combined: ${totalMb} MB`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });