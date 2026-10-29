#!/usr/bin/env node
/**
 * scripts/admin/adsense-cleanup.mjs
 *
 * VizhiTN Database Quality & AdSense Compliance Maintainer
 * 1. Archives redundant/duplicate cyber scam posts, leaving 1 canonical advisory per topic.
 * 2. Archives duplicate Chennai Metro trial run articles in tn_today, keeping the flagship piece.
 * 3. Triggers /api/revalidate to purge server-side cache.
 */

import { createClient } from '@supabase/supabase-js';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;
const siteUrl = process.env.SITE_URL || 'https://www.vizhitn.in';

if (!supabaseUrl || !supabaseKey) {
  console.error('[FATAL] Missing Supabase credentials.');
  process.exit(1);
}

const isDryRun = process.argv.includes('--dry-run');

async function main() {
  console.log('====================================================');
  console.log(' VizhiTN Database Quality & AdSense Clean-up Engine ');
  console.log('====================================================');
  console.log(`[INFO] Mode: ${isDryRun ? 'DRY RUN (No DB Writes)' : 'PRODUCTION (Archiving Duplicates)'}`);

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  // ── 1. CLEAN UP DUPLICATE SCAM POSTS ──────────────────────────────
  console.log('\n[1/3] Scanning for duplicate cyber scam posts in "post" table...');
  const { data: scamPosts, error: scamErr } = await supabase
    .from('post')
    .select('id, slug, title_en, title_ta, category_slug, created_date, status')
    .eq('status', 'active')
    .or('title_en.ilike.%fake electricity bill%,title_en.ilike.%part-time job%,title_en.ilike.%whatsapp job%,title_en.ilike.%otp%theft%,title_ta.ilike.%போலி மின் கட்டண%,title_ta.ilike.%பகுதி நேர வேலை%')
    .order('created_date', { ascending: false });

  if (scamErr) {
    console.error('[ERROR] Failed to query scam posts:', scamErr.message);
  } else {
    console.log(`[SCAM AUDIT] Found ${scamPosts?.length || 0} active scam advisories.`);

    // Group by scam type (electricity bill vs whatsapp job vs otp)
    const groups = {
      eb_bill: [],
      job_scam: [],
      otp_scam: []
    };

    (scamPosts || []).forEach(post => {
      const text = `${post.title_en} ${post.title_ta}`.toLowerCase();
      if (text.includes('electricity') || text.includes('மின் கட்டண') || text.includes('eb')) {
        groups.eb_bill.push(post);
      } else if (text.includes('job') || text.includes('வேலை') || text.includes('part-time')) {
        groups.job_scam.push(post);
      } else {
        groups.otp_scam.push(post);
      }
    });

    const toArchivePostIds = [];

    // For each group, keep index 0 (the freshest, best post) as active, archive the rest
    for (const [groupName, posts] of Object.entries(groups)) {
      if (posts.length > 1) {
        console.log(`\n  Group "${groupName}": ${posts.length} posts found.`);
        console.log(`  -> KEEPING ACTIVE: [${posts[0].slug}] "${posts[0].title_en}"`);
        const redundant = posts.slice(1);
        redundant.forEach(p => {
          console.log(`  -> TO ARCHIVE: [${p.slug}] "${p.title_en}"`);
          toArchivePostIds.push(p.id);
        });
      } else if (posts.length === 1) {
        console.log(`\n  Group "${groupName}": 1 post found (Retaining: "${posts[0].title_en}").`);
      }
    }

    if (toArchivePostIds.length > 0) {
      console.log(`\n[ACTION] Archiving ${toArchivePostIds.length} duplicate scam posts...`);
      if (!isDryRun) {
        const { error: archiveErr } = await supabase
          .from('post')
          .update({
            status: 'archived',
            is_publicly_visible: false,
            admin_note: 'Archived by AdSense quality cleanup engine (deduplication)'
          })
          .in('id', toArchivePostIds);

        if (archiveErr) console.error('[ERROR] Failed to archive scam posts:', archiveErr.message);
        else console.log(`[SUCCESS] Archived ${toArchivePostIds.length} redundant scam posts.`);
      } else {
        console.log(`[DRY RUN] Would archive IDs:`, toArchivePostIds);
      }
    } else {
      console.log('[SCAM AUDIT ✓] No redundant scam posts needed archiving.');
    }
  }

  // ── 2. CLEAN UP DUPLICATE CHENNAI METRO ARTICLES IN TN_TODAY ───────
  console.log('\n[2/3] Scanning for duplicate Chennai Metro trial run articles in "tn_today"...');
  const { data: metroArticles, error: metroErr } = await supabase
    .from('tn_today')
    .select('id, slug, title, publish_date, status')
    .eq('status', 'published')
    .ilike('title', '%chennai metro phase 2%')
    .order('publish_date', { ascending: false });

  if (metroErr) {
    console.error('[ERROR] Failed to query metro articles:', metroErr.message);
  } else {
    console.log(`[METRO AUDIT] Found ${metroArticles?.length || 0} published Chennai Metro articles.`);

    if ((metroArticles?.length || 0) > 1) {
      console.log(`  -> KEEPING ACTIVE FLAGSHIP: [${metroArticles[0].slug}] "${metroArticles[0].title}"`);
      const redundantMetro = metroArticles.slice(1);
      const toArchiveMetroIds = redundantMetro.map(a => {
        console.log(`  -> TO ARCHIVE: [${a.slug}] "${a.title}"`);
        return a.id;
      });

      if (!isDryRun) {
        const { error: mArchErr } = await supabase
          .from('tn_today')
          .update({ status: 'archived' })
          .in('id', toArchiveMetroIds);

        if (mArchErr) console.error('[ERROR] Failed to archive metro articles:', mArchErr.message);
        else console.log(`[SUCCESS] Archived ${toArchiveMetroIds.length} redundant metro articles.`);
      } else {
        console.log(`[DRY RUN] Would archive Metro article IDs:`, toArchiveMetroIds);
      }
    } else {
      console.log('[METRO AUDIT ✓] Chennai Metro articles count is balanced.');
    }
  }

  // ── 3. PURGE CACHE VIA /api/revalidate ────────────────────────────
  console.log('\n[3/3] Purging public cache via /api/revalidate...');
  if (!isDryRun) {
    const revalSecret = process.env.REVALIDATE_SECRET || process.env.AUTO_PUBLISH_SECRET;
    try {
      const res = await fetch(`${siteUrl}/api/revalidate?path=/explore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(revalSecret ? { 'x-revalidate-secret': revalSecret } : {})
        }
      });
      console.log(`[REVALIDATE ✓] Cache purge status: ${res.status}`);
    } catch (rErr) {
      console.warn(`[REVALIDATE WARN] Could not trigger remote revalidate: ${rErr.message}`);
    }
  } else {
    console.log('[DRY RUN] Skipping cache purge.');
  }

  console.log('\n====================================================');
  console.log(' AdSense Compliance Cleanup Finished Successfully! ');
  console.log('====================================================');
}

main().catch(err => {
  console.error('[FATAL ERROR]:', err);
  process.exit(1);
});
