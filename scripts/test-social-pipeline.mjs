#!/usr/bin/env node
/**
 * scripts/test-social-pipeline.mjs
 * End-to-end verification script for VizhiTN Social Media Auto-Poster
 *
 * Usage:
 *   node scripts/test-social-pipeline.mjs               (Dry run single post)
 *   node scripts/test-social-pipeline.mjs --batch       (Dry run batch of 2 posts)
 *   node scripts/test-social-pipeline.mjs --live        (Live broadcast to FB & IG)
 */

import { broadcastToSocials, broadcastBatchToSocials } from './lib/meta-social-poster.mjs';
import { createClient } from '@supabase/supabase-js';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

async function getTestPosts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase
        .from('post')
        .select('*')
        .eq('status', 'active')
        .order('created_date', { ascending: false })
        .limit(2);

      if (!error && data && data.length > 0) {
        console.log(`[TestRunner] Loaded ${data.length} real active posts from database (Slugs: ${data.map(p => p.slug).join(', ')})`);
        return data;
      }
    } catch (e) {
      console.warn('[TestRunner] Failed to fetch real posts from DB, falling back to mock:', e.message);
    }
  }

  return [
    {
      slug: 'chennai-metro-phase-2-madhavaram-poonavallee-update',
      district_slug: 'chennai',
      category_slug: 'transport',
      urgency_level: 'medium',
      title_ta: 'சென்னை மெட்ரோ இரண்டாம் கட்ட பணிகள் தீவிரம்: பூந்தமல்லி - போரூர் பாதை விரைவில் திறப்பு',
      title_en: 'Chennai Metro Phase 2 Update: Poonamallee to Porur line nears completion',
      content_ta: 'சென்னை மெட்ரோ ரயில் இரண்டாம் கட்ட பணிகளில் 116 கி.மீ தொலைவிலான பாதைகளில் பூந்தமல்லி முதல் போரூர் வரையிலான வழித்தடம் இறுதிக்கட்ட சோதனைகளை எட்டியுள்ளது. 2026 இறுதிக்குள் பொதுமக்கள் பயன்பாட்டிற்கு கொண்டுவர சென்னை மெட்ரோ நிர்வாகம் திட்டமிட்டுள்ளது.',
      content_en: 'Chennai Metro Rail Phase 2 corridor between Poonamallee and Porur enters final testing phase for passenger operations.',
      bullet1: 'பூந்தமல்லி ➔ போரூர் வழித்தடம் 16 கி.மீ இறுதிக்கட்டம்',
      bullet2: 'தினசரி 3 லட்சம் பயணிகள் பயனடைவார்கள்',
      bullet3: 'பயணிகள் உதவி எண்: 1860-425-1515',
      assigned_department: 'CMRL (Helpline: 1860-425-1515)'
    }
  ];
}

async function run() {
  const isLive = process.argv.includes('--live');
  const isBatch = process.argv.includes('--batch');
  const isDryRun = !isLive;

  console.log('===========================================================');
  console.log('  VizhiTN Social Media Pipeline Verification Runner        ');
  console.log(`  Mode: ${isLive ? '🔴 LIVE (Will Post to FB & IG)' : '🟢 DRY RUN (Safe local preview)'}`);
  console.log(`  Target: ${isBatch ? 'Batch (2 posts)' : 'Single post'}`);
  console.log('===========================================================\n');

  const samplePosts = await getTestPosts();

  if (isBatch) {
    const summary = await broadcastBatchToSocials(samplePosts, {
      delayMs: 2500,
      isDryRun
    });
    console.log('[Runner Summary]:', JSON.stringify(summary, null, 2));
  } else {
    const res = await broadcastToSocials(samplePosts[0], {
      isDryRun
    });
    console.log('[Runner Result]:', res);
  }

  console.log('\n[Verification Runner] Completed successfully!');
}

run().catch((err) => {
  console.error('[Verification Runner Error]:', err);
  process.exit(1);
});
