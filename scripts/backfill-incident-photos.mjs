#!/usr/bin/env node
/**
 * scripts/backfill-incident-photos.mjs
 * 
 * Backfills authentic photojournalist incident images into existing
 * active posts and published TN Today articles in Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import { matchIncidentPhoto } from '../src/lib/incidentPhotoMatcher.js';

try {
  process.loadEnvFile('.env.local');
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function backfill() {
  console.log('--- STARTING INCIDENT PHOTO BACKFILL ---');

  // 1. BACKFILL TN TODAY ARTICLES
  console.log('\n[1/2] Checking published TN Today articles...');
  const { data: articles, error: artErr } = await supabase
    .from('tn_today')
    .select('id, title, category, featured_image')
    .eq('status', 'published');

  if (artErr) {
    console.error('Error fetching articles:', artErr.message);
  } else {
    let updatedArticles = 0;
    for (const art of articles || []) {
      const curImg = (art.featured_image || '').trim();
      const needsPhoto = !curImg || curImg.includes('/images/tntoday/') || curImg.includes('googleusercontent.com');

      if (needsPhoto) {
        const photo = await matchIncidentPhoto({ title: art.title, category: art.category });
        if (photo?.image_url) {
          const { error: upErr } = await supabase
            .from('tn_today')
            .update({ featured_image: photo.image_url, social_image: photo.image_url })
            .eq('id', art.id);

          if (!upErr) {
            console.log(`  ✓ Updated TN Today: "${art.title.slice(0, 50)}..." via ${photo.source}`);
            updatedArticles++;
          }
        }
      }
    }
    console.log(`TN Today: Updated ${updatedArticles} article(s) with real photojournalist images.`);
  }

  // 2. BACKFILL POSTS
  console.log('\n[2/2] Checking active civic posts...');
  const { data: posts, error: postErr } = await supabase
    .from('post')
    .select('id, title_en, title_ta, category_slug, media_urls')
    .eq('status', 'active')
    .limit(100);

  if (postErr) {
    console.error('Error fetching posts:', postErr.message);
  } else {
    let matchedCount = 0;
    let cleanedOgCount = 0;

    for (const post of posts || []) {
      const curUrls = post.media_urls || [];
      const hasRealPhoto = curUrls.length > 0 && !curUrls[0].includes('/api/og') && !curUrls[0].includes('googleusercontent.com') && !curUrls[0].startsWith('/images/categories/');

      if (!hasRealPhoto) {
        const titleToSearch = post.title_en || post.title_ta || '';
        const photo = await matchIncidentPhoto({ title: titleToSearch, category: post.category_slug });

        if (photo?.image_url) {
          await supabase
            .from('post')
            .update({
              media_urls: [photo.image_url]
            })
            .eq('id', post.id);

          console.log(`  ✓ Matched News Photo: "${titleToSearch.slice(0, 45)}..." via ${photo.source}`);
          matchedCount++;
        } else if (curUrls.length > 0 && curUrls[0].includes('/api/og')) {
          // Clean /api/og so card renders clean departmental helpline badge
          await supabase
            .from('post')
            .update({ media_urls: [] })
            .eq('id', post.id);
          cleanedOgCount++;
        }
      }
    }

    console.log(`Posts: Matched ${matchedCount} real news photo(s). Cleaned ${cleanedOgCount} old /api/og placeholder(s).`);
  }

  console.log('\n--- BACKFILL COMPLETE ---');
}

backfill();
