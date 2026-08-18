// scratch/diagnose-tn-today-size.mjs
// Measures bytes per column for the tn_today archive query to find the 10.4MB culprit.
import fs from 'node:fs';

const envText = fs.readFileSync('.env.local', 'utf-8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const url = env.NEXT_PUBLIC_VITE_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const FIELDS = [
  'id', 'title', 'slug', 'subtitle', 'featured_image', 'category',
  'author_name', 'publish_date', 'reading_time', 'summary',
  'is_featured', 'view_count',
].join(',');

async function main() {
  const res = await fetch(
    `${url}/rest/v1/tn_today?select=${encodeURIComponent(FIELDS)}&status=eq.published&order=publish_date.desc&limit=50`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` } }
  );
  const data = await res.json();
  if (!Array.isArray(data)) { console.error('Unexpected response', data); return; }
  console.log(`Rows: ${data.length}`);

  const totalBytes = new TextEncoder().encode(JSON.stringify(data)).length;
  console.log(`Total payload: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

  const columnTotals = {};
  const columnMax = {};
  for (const row of data) {
    for (const [col, val] of Object.entries(row)) {
      const bytes = new TextEncoder().encode(String(val ?? '')).length;
      columnTotals[col] = (columnTotals[col] || 0) + bytes;
      columnMax[col] = Math.max(columnMax[col] || 0, bytes);
    }
  }

  console.log('\nColumn size breakdown (bytes):');
  for (const [col, total] of Object.entries(columnTotals).sort((a, b) => b[1] - a[1])) {
    console.log(
      `${col.padEnd(16)} total=${(total / 1024 / 1024).toFixed(2)}MB  avg=${Math.round(total / data.length)}B  max=${columnMax[col]}B`
    );
  }

  // Show a sample of the largest feature_image values (type + first 80 chars)
  const biggest = [...data].sort((a, b) =>
    (String(b.featured_image || '').length) - (String(a.featured_image || '').length)
  )[0];
  if (biggest) {
    const img = String(biggest.featured_image || '');
    console.log('\nLargest featured_image sample:');
    console.log('  length:', img.length);
    console.log('  prefix:', JSON.stringify(img.slice(0, 80)));
    console.log('  title:', biggest.title);
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });