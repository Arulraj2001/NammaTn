// scripts/youtube/engine/meta-video-poster.mjs
// Unified Social Video Cross-Poster for Facebook Page Videos & Instagram Reels
// Uses Meta Graph API v21.0 & Supabase Storage CDN hosting

import fs from 'fs';
import path from 'path';
import { uploadCardToStorage } from '../../lib/supabase-storage.mjs';

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

/**
 * Cross-posts a rendered MP4 video to Facebook Page & Instagram Reels
 *
 * @param {Object} params
 * @param {string} params.videoFilePath - Absolute or relative path to MP4
 * @param {string} params.title - Video Title
 * @param {string} params.caption - Rich social caption with hooks and hashtags
 * @param {boolean} [params.isReel=true] - True for 9:16 Shorts/Reels, False for 16:9 Long videos
 * @param {boolean} [params.isDryRun=false] - If true, logs without calling network
 * @returns {Promise<{ facebook: Object|null, instagram: Object|null, videoUrl: string|null }>}
 */
export async function crossPostVideoToMetaSocials({
  videoFilePath,
  title,
  caption,
  isReel = true,
  isDryRun = false
}) {
  console.log('\n====================================================');
  console.log('  Meta Social Cross-Poster (Facebook & Instagram)   ');
  console.log('====================================================');

  if (!fs.existsSync(videoFilePath)) {
    throw new Error(`Video file does not exist: ${videoFilePath}`);
  }

  const fileSizeMb = (fs.statSync(videoFilePath).size / (1024 * 1024)).toFixed(2);
  const pageId = process.env.META_PAGE_ID;
  const pageToken = process.env.META_PAGE_ACCESS_TOKEN;
  const instaId = process.env.META_INSTA_ACCOUNT_ID;

  const hasMetaCreds = Boolean(pageId && pageToken && instaId);

  if (isDryRun || !hasMetaCreds) {
    console.log(`[META DRY-RUN] Video ready for social broadcast (${fileSizeMb} MB)`);
    console.log(`Title: ${title}`);
    console.log(`Format: ${isReel ? 'Instagram Reel & FB Video (9:16)' : 'Facebook Watch Video (16:9)'}`);
    console.log(`Caption Preview:\n${caption.slice(0, 150)}...\n`);
    if (!hasMetaCreds) {
      console.log('[META NOTICE] Missing META_PAGE_ID, META_PAGE_ACCESS_TOKEN, or META_INSTA_ACCOUNT_ID in .env.local.');
      console.log('Cross-posting to Instagram/Facebook is currently in dry-run mode.');
    }
    return {
      dryRun: true,
      videoUrl: null,
      facebook: { mockId: 'DRY_RUN_FB_VID' },
      instagram: { mockId: 'DRY_RUN_INSTA_REEL' }
    };
  }

  // 1. Host Video Buffer in Supabase Storage to get public HTTPS URL
  const videoBuffer = fs.readFileSync(videoFilePath);
  const videoFileName = `videos/${path.basename(videoFilePath)}`;
  console.log(`[META] Uploading ${fileSizeMb} MB to Supabase CDN for Meta ingestion...`);
  const publicVideoUrl = await uploadCardToStorage(videoBuffer, videoFileName, 'video/mp4');

  const results = {
    videoUrl: publicVideoUrl,
    facebook: null,
    instagram: null,
    errors: []
  };

  // 2. Publish to Facebook Page Video
  try {
    console.log(`[META] Publishing to Facebook Page (${pageId})...`);
    // Retrieve page-specific access token if available
    let activePageToken = pageToken;
    try {
      const pageTokenRes = await fetch(`${GRAPH_API_BASE}/${pageId}?fields=access_token&access_token=${pageToken}`);
      const pageTokenData = await pageTokenRes.json();
      if (pageTokenData.access_token) {
        activePageToken = pageTokenData.access_token;
      }
    } catch (_) {}

    const fbRes = await fetch(`${GRAPH_API_BASE}/${pageId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        file_url: publicVideoUrl,
        title: title,
        description: caption,
        access_token: activePageToken
      })
    });

    const fbData = await fbRes.json();
    if (fbData.error) {
      console.warn(`[META FB WARN] ${fbData.error.message}`);
      results.errors.push({ platform: 'facebook', error: fbData.error.message });
    } else {
      console.log(`[META FB SUCCESS] Facebook Video Published! Video ID: ${fbData.id}`);
      results.facebook = fbData;
    }
  } catch (err) {
    console.warn(`[META FB ERROR] ${err.message}`);
    results.errors.push({ platform: 'facebook', error: err.message });
  }

  // 3. Publish to Instagram Reels (if 9:16 format)
  if (isReel && instaId) {
    try {
      console.log(`[META] Step 1: Creating Instagram Reel Container for account ${instaId}...`);
      const containerRes = await fetch(`${GRAPH_API_BASE}/${instaId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          media_type: 'REELS',
          video_url: publicVideoUrl,
          caption: caption,
          share_to_feed: true,
          access_token: pageToken
        })
      });

      const containerData = await containerRes.json();
      if (containerData.error) {
        console.warn(`[META INSTA WARN] Container creation failed: ${containerData.error.message}`);
        results.errors.push({ platform: 'instagram', error: containerData.error.message });
      } else {
        const creationId = containerData.id;
        console.log(`[META INSTA] Container ID: ${creationId}. Polling Meta processing status...`);

        // Poll container status until FINISHED (up to 60s)
        let isReady = false;
        let attempts = 0;
        while (!isReady && attempts < 12) {
          attempts++;
          await new Promise((r) => setTimeout(r, 5000));
          const statusRes = await fetch(`${GRAPH_API_BASE}/${creationId}?fields=status_code&access_token=${pageToken}`);
          const statusData = await statusRes.json();
          const statusCode = statusData.status_code || '';
          console.log(`[META INSTA] Processing status (attempt ${attempts}): ${statusCode}`);

          if (statusCode === 'FINISHED') {
            isReady = true;
          } else if (statusCode === 'ERROR') {
            throw new Error(`Meta processing error on container ${creationId}`);
          }
        }

        if (isReady) {
          console.log(`[META] Step 2: Publishing Instagram Reel ${creationId}...`);
          const publishRes = await fetch(`${GRAPH_API_BASE}/${instaId}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creation_id: creationId,
              access_token: pageToken
            })
          });

          const publishData = await publishRes.json();
          if (publishData.error) {
            console.warn(`[META INSTA WARN] Publish failed: ${publishData.error.message}`);
            results.errors.push({ platform: 'instagram', error: publishData.error.message });
          } else {
            console.log(`[META INSTA SUCCESS] Instagram Reel Published! Media ID: ${publishData.id}`);
            results.instagram = publishData;
          }
        }
      }
    } catch (err) {
      console.warn(`[META INSTA ERROR] ${err.message}`);
      results.errors.push({ platform: 'instagram', error: err.message });
    }
  }

  return results;
}
