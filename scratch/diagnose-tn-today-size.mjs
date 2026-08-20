// scratch/diagnose-tn-today-size.mjs
// Verifies tn_today list payloads stay under Next.js's 2MB data cache limit.
import fs from 'node:fs';

const envText = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const url = env.NEXT_PUBLIC_VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mirrors src/lib/tnTodayServer.js ARTICLE_FIELDS (server archive, limit 20)
const SERVER_FIELDS = [
  'id', 'title', 'title_ta', 'slug', 'subtitle', 'subtitle_ta', 'category',
  'author_name', 'publish_date', 'reading_time', 'summary',
  'is_featured', 'view_count',
].join(',');

// Mirrors src/services/tnToday.js getPublishedTnToday (client list, limit 50)
const CLIENT_FIELDS = [
  'id', 'title', 'title_ta', 'slug', 'subtitle', 'subtitle_ta', 'category',
  'author_name', 'publish_date', 'reading_time', 'summary', 'is_featured', 'view_count',
].join(',');

async function measure(label, fields, limit) {
  const res = await fetch(
    `${url}/rest/v1/tn_today?select=${encodeURIComponent(fields)}&status=eq.published&order=publish_date.desc&limit=${limit}`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  const data = await res.json();
  if (!Array.isArray(data)) { console.error(`${label}: unexpected response`, data); return; }
  const bytes = new TextEncoder().encode(JSON.stringify(data)).length;
  const mb = (bytes / 1024 / 1024).toFixed(2);
  const ok = bytes < 2 * 1024 * 1024;
  console.log(`${label}: ${data.length} rows, ${mb} MB ${ok ? '✅ under 2MB' : '❌ OVER 2MB'}`);
}

async function main() {
  await measure('Server archive (limit 20)', SERVER_FIELDS, 20);
  await measure('Client list (limit 50)', CLIENT_FIELDS, 50);

  // Article detail (select *) — single row that includes featured_image + content.
  // Must also stay under the 2MB cache limit per-row.
  const res = await fetch(
    `${url}/rest/v1/tn_today?select=${encodeURIComponent('*')}&status=eq.published&limit=50`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  const rows = await res.json();
  if (!Array.isArray(rows)) { console.error('Detail probe: unexpected response', rows); return; }
  let worst = 0;
  let worstRow = null;
  for (const row of rows) {
    const bytes = new TextEncoder().encode(JSON.stringify(row)).length;
    if (bytes > worst) { worst = bytes; worstRow = row; }
  }
  const worstMb = (worst / 1024 / 1024).toFixed(2);
  console.log(`\nArticle detail max single row: ${worstMb} MB ${worst < 2 * 1024 * 1024 ? '✅ under 2MB' : '❌ OVER 2MB'} (title: ${worstRow?.title})`);

  // Column breakdown for the worst single row
  console.log('\nWorst row column sizes:');
  const colSizes = Object.entries(worstRow).map(([col, val]) => ({
    col,
    bytes: new TextEncoder().encode(String(val ?? '')).length,
  })).sort((a, b) => b.bytes - a.bytes);
  for (const { col, bytes } of colSizes) {
    console.log(`  ${col.padEnd(18)} ${(bytes / 1024).toFixed(1)} KB  prefix=${JSON.stringify(String(worstRow[col] || '').slice(0, 60))}`);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });