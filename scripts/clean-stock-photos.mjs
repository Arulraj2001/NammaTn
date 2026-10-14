#!/usr/bin/env node
/**
 * scripts/clean-stock-photos.mjs
 * 
 * Cleans out all legacy stock photos, scraped RSS news photos (The Hindu),
 * and broken local relative paths from Supabase tables:
 * 1. tn_today: Replaces scraped stock photos and broken paths with authentic Cloudflare FLUX images or official category graphic cards.
 * 2. post: Clears out all scraped newsroom photos so posts render authentic category graphic cards.
 * 3. Triggers /api/revalidate to purge the ISR cache immediately.
 */

import { createClient } from '@supabase/supabase-js';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;
const siteUrl = process.env.SITE_URL || 'https://www.vizhitn.in';

if (!supabaseUrl || !supabaseKey) {
  console.error('[FATAL] Missing Supabase configuration.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  console.log('===========================================================');
  console.log('   VizhiTN Stock Photo Purge & Cloudflare FLUX Migration   ');
  console.log('===========================================================');

  // --- 1. CLEAN TN TODAY ARTICLES ---
  console.log('\n[1/3] Scanning tn_today articles for stock or broken images...');
  const { data: articles, error: artErr } = await supabase
    .from('tn_today')
    .select('id, title, category, district_slug, slug, featured_image, social_image');

  if (artErr) {
    console.error('[ERROR] Failed to fetch articles:', artErr.message);
  } else {
    let cleanedArticles = 0;
    const { generateEditorialHeroImage } = await import('./lib/cloudflare-image.mjs');

    for (const art of articles || []) {
      const f = (art.featured_image || '').trim();
      const isBad = (
        f.includes('thgim.com') ||
        f.includes('newindianexpress') ||
        f.includes('dtnext') ||
        f.includes('unsplash') ||
        f.includes('pexels') ||
        (f.startsWith('/images/tntoday/') && f.length > 30) // Broken local slug file path
      );

      if (isBad) {
        console.log(`\n  🧹 Found article with bad image: "${art.title.slice(0, 50)}..."`);
        console.log(`     Old image: ${f}`);

        let newImageUrl = null;
        try {
          console.log(`     🎨 Generating Cloudflare FLUX replacement image...`);
          newImageUrl = await generateEditorialHeroImage({
            title: art.title,
            category: art.category,
            district: art.district_slug || 'Tamil Nadu',
            slug: art.slug
          });
        } catch (genErr) {
          console.warn(`     ⚠️ Cloudflare generation skipped: ${genErr.message}`);
        }

        // If Cloudflare AI fails, fallback to clean official category graphic card
        if (!newImageUrl) {
          const cat = (art.category || 'general').toLowerCase();
          newImageUrl = `${siteUrl}/images/tntoday/${cat}.webp`;
          console.log(`     🛡️ Using category graphic card fallback: ${newImageUrl}`);
        }

        const { error: updateErr } = await supabase
          .from('tn_today')
          .update({
            featured_image: newImageUrl,
            social_image: newImageUrl,
            updated_date: new Date().toISOString()
          })
          .eq('id', art.id);

        if (updateErr) {
          console.error(`     ✗ Failed to update article: ${updateErr.message}`);
        } else {
          console.log(`     ✓ Successfully updated with: ${newImageUrl}`);
          cleanedArticles++;
        }
      }
    }
    console.log(`\n[✓ TN TODAY COMPLETE] Purged and upgraded ${cleanedArticles} article(s).`);
  }

  // --- 2. CLEAN POSTS (CIVIC & POLITICS) ---
  console.log('\n[2/3] Scanning civic & politics posts for scraped stock photos...');
  const { data: posts, error: postErr } = await supabase
    .from('post')
    .select('id, title_en, media_urls, category_slug')
    .order('created_date', { ascending: false })
    .limit(300);

  if (postErr) {
    console.error('[ERROR] Failed to fetch posts:', postErr.message);
  } else {
    let cleanedPosts = 0;
    for (const post of posts || []) {
      if (Array.isArray(post.media_urls) && post.media_urls.length > 0) {
        const hasScraped = post.media_urls.some(u =>
          typeof u === 'string' && (
            u.includes('thgim.com') ||
            u.includes('newindianexpress') ||
            u.includes('dtnext') ||
            u.includes('unsplash') ||
            u.includes('pexels') ||
            (u.startsWith('/images/tntoday/') && u.length > 30) // Broken local paths
          )
        );

        if (hasScraped) {
          // Filter out the scraped URLs or set to empty array for graphic card fallback
          const sanitizedUrls = post.media_urls.filter(u =>
            typeof u === 'string' &&
            !u.includes('thgim.com') &&
            !u.includes('newindianexpress') &&
            !u.includes('dtnext') &&
            !u.includes('unsplash') &&
            !u.includes('pexels') &&
            !(u.startsWith('/images/tntoday/') && u.length > 30)
          );

          const { error: pUpErr } = await supabase
            .from('post')
            .update({ media_urls: sanitizedUrls })
            .eq('id', post.id);

          if (!pUpErr) {
            cleanedPosts++;
          }
        }
      }
    }
    console.log(`[✓ POSTS COMPLETE] Purged stock photos from ${cleanedPosts} post(s).`);
  }

  // --- 3. REVALIDATE FRONTEND CACHES ---
  console.log('\n[3/3] Triggering instant revalidation at /api/revalidate...');
  const pathsToRevalidate = ['/tn-today', '/explore', '/', '/tn-politics'];
  const revalidateSecret = process.env.REVALIDATE_SECRET || process.env.AUTO_PUBLISH_SECRET;
  for (const p of pathsToRevalidate) {
    try {
      const res = await fetch(`${siteUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(revalidateSecret ? { Authorization: `Bearer ${revalidateSecret}` } : {}) },
        body: JSON.stringify({ path: p })
      });
      console.log(`  ✓ Purged cache for ${p} (Status ${res.status})`);
    } catch (rErr) {
      console.warn(`  ⚠️ Could not ping /api/revalidate for ${p}: ${rErr.message}`);
    }
  }

  console.log('\n===========================================================');
  console.log('   All stock photos deleted & replaced with graphic cards!  ');
  console.log('===========================================================');
}

clean().catch(err => {
  console.error('[FATAL] Script error:', err);
  process.exit(1);
});
