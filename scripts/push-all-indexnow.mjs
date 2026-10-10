#!/usr/bin/env node
/**
 * scripts/push-all-indexnow.mjs
 *
 * One-click batch runner to push all published TN Today articles,
 * district hubs, and key public pages to Microsoft Bing, Yahoo, and IndexNow.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Helper to load .env.local
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  } else if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf-8');
    for (const line of envContent.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        process.env[key] = val.trim();
      }
    }
  }
} catch (_) {}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

const SITE_URL = 'https://www.vizhitn.in';
const INDEXNOW_HOST = 'www.vizhitn.in';
const INDEXNOW_KEY = '6dda567a62b7b1c8c971a8b90bda6a0ed368c012cc32df60eee7144a99444b56';
const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

const CORE_HUBS = [
  `${SITE_URL}/`,
  `${SITE_URL}/tn-today`,
  `${SITE_URL}/tn-politics`,
  `${SITE_URL}/explore`,
  `${SITE_URL}/power-cuts-today-tamil-nadu`,
  `${SITE_URL}/school-college-holiday-alerts`,
  `${SITE_URL}/awareness`,
  `${SITE_URL}/rights`,
  `${SITE_URL}/esevai`,
  `${SITE_URL}/rti`,
  `${SITE_URL}/helplines`,
  `${SITE_URL}/about`,
  `${SITE_URL}/contact`,
  `${SITE_URL}/privacy-policy`,
  `${SITE_URL}/terms`,
];

const DISTRICT_SLUGS = [
  'chennai', 'coimbatore', 'madurai', 'tiruchirappalli', 'salem', 'tirunelveli',
  'vellore', 'erode', 'thoothukudi', 'dindigul', 'thanjavur', 'ranipet',
  'sivaganga', 'virudhunagar', 'nagapattinam', 'kallakurichi', 'chengalpattu',
  'tiruppur', 'tenkasi', 'mayiladuthurai', 'tirupattur', 'nilgiris', 'krishnagiri',
  'dharmapuri', 'cuddalore', 'villupuram', 'perambalur', 'ariyalur', 'pudukkottai',
  'ramanathapuram', 'theni', 'kancheepuram', 'tiruvarur', 'karur', 'namakkal',
  'tiruvannamalai', 'kanyakumari', 'tiruvallur'
];

async function main() {
  console.log('====================================================');
  console.log('   VizhiTN IndexNow Master Batch Submission Engine   ');
  console.log('====================================================');

  if (!SUPABASE_KEY) {
    console.error('[ERROR] Supabase API key not found in environment.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  console.log('[1/4] Fetching all published TN Today articles from Supabase...');
  const { data: articles, error: artErr } = await supabase
    .from('tn_today')
    .select('slug, title, publish_date')
    .eq('status', 'published')
    .order('publish_date', { ascending: false });

  if (artErr) {
    console.error('[ERROR] Failed to fetch articles:', artErr.message);
    process.exit(1);
  }

  const articleUrls = (articles || [])
    .filter(a => a.slug)
    .map(a => `${SITE_URL}/tn-today/${a.slug}`);

  console.log(`[✓] Retrieved ${articleUrls.length} published TN Today articles.`);

  // 2. Add 38 district hubs
  const districtUrls = DISTRICT_SLUGS.map(d => `${SITE_URL}/${d}`);

  // 3. Assemble total unique URL batch
  const urlSet = new Set([...CORE_HUBS, ...districtUrls, ...articleUrls]);
  const urlList = Array.from(urlSet);

  console.log(`[2/4] Prepared batch payload of ${urlList.length} total URLs:`);
  console.log(`      - ${CORE_HUBS.length} Core Hubs & Service Pages`);
  console.log(`      - ${districtUrls.length} District Hubs`);
  console.log(`      - ${articleUrls.length} In-Depth TN Today Articles`);

  // 4. Submit to IndexNow API
  console.log('\n[3/4] Dispatching to IndexNow API (Bing, Yahoo, Yandex, Seznam)...');
  const payload = {
    host: INDEXNOW_HOST,
    key: INDEXNOW_KEY,
    keyLocation: INDEXNOW_KEY_LOCATION,
    urlList,
  };

  try {
    const startTime = Date.now();
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const elapsed = Date.now() - startTime;
    console.log(`[✓] IndexNow Response Code: ${response.status} ${response.statusText} (${elapsed}ms)`);

    if (response.status === 200) {
      console.log('    Status 200: All URLs successfully submitted and validated!');
    } else if (response.status === 202) {
      console.log('    Status 202: URLs accepted! Key validation queued and processing.');
    } else {
      const errText = await response.text();
      console.warn(`    Status ${response.status} Warning: ${errText}`);
    }
  } catch (err) {
    console.error('[ERROR] Failed to communicate with IndexNow:', err.message);
  }

  // 5. Ping Google Sitemap endpoint
  console.log('\n[4/4] Pinging Google Sitemap endpoint...');
  try {
    const mainSitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
    const newsSitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap-news.xml`);

    const [gRes1, gRes2] = await Promise.allSettled([
      fetch(`https://www.google.com/ping?sitemap=${mainSitemapUrl}`),
      fetch(`https://www.google.com/ping?sitemap=${newsSitemapUrl}`),
    ]);

    console.log(`[✓] Google Main Sitemap Ping: ${gRes1.status === 'fulfilled' ? 'Sent (✓)' : 'Error'}`);
    console.log(`[✓] Google News Sitemap Ping: ${gRes2.status === 'fulfilled' ? 'Sent (✓)' : 'Error'}`);
  } catch (gErr) {
    console.warn('[WARN] Google ping notice:', gErr.message);
  }

  console.log('\n====================================================');
  console.log(`✓ COMPLETE: ${urlList.length} URLs submitted to search engines.`);
  console.log('Bing Webmaster Tools will reflect these crawls within 30-60 minutes.');
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('[FATAL]', err);
  process.exit(1);
});
