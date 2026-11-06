// scripts/youtube/engine/meta-video-poster.mjs
// Unified Social Video Cross-Poster for Facebook Page Videos & Instagram Reels
// Uses Meta Graph API v21.0 & Supabase Storage CDN hosting

import fs from 'fs';
import path from 'path';
import { uploadCardToStorage, deleteFromStorage } from '../../lib/supabase-storage.mjs';

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';
const GRAPH_VIDEO_API_BASE = 'https://graph-video.facebook.com/v21.0';

/**
 * Robust HTML tag and entity stripper for clean social captions.
 */
function stripHtml(str = '') {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Format Instagram-optimized Reel caption:
 * - Strictly <850 characters to prevent Meta Graph API container rejection
 * - Strip raw URLs (Instagram captions do NOT have clickable hyperlinks)
 * - Retain 5-6 viral hashtags
 * - Add Bio / YouTube call-to-action
 */
export function formatSafeInstaCaption(rawCaption = '', title = '') {
  let clean = stripHtml(rawCaption);

  // Extract up to 6 hashtags
  const hashtags = (clean.match(/#[\w\u0B80-\u0BFF]+/g) || []).slice(0, 6);

  // Remove existing URLs and hashtags from body
  clean = clean.replace(/https?:\/\/\S+/gi, '').replace(/#[\w\u0B80-\u0BFF]+/g, '').trim();

  // Clamp body if needed
  if (clean.length > 350) {
    clean = clean.slice(0, 340).trim() + '...';
  }

  const parts = [
    clean || title,
    '',
    '💬 உங்கள் கருத்து என்ன? கமெண்டில் சொல்லுங்கள் 👇',
    '📌 தொடர் வீடியோக்கள் & முழு விவரங்களுக்கு Bio லிங்கை பார்க்கவும் ↗️',
    '👉 தமிழ்நாடு முக்கிய தகவல்களுக்கு @vizhi_tn பக்கத்தை Follow செய்யுங்கள்!',
    '',
    hashtags.length > 0 ? hashtags.join(' ') : '#VizhiTN #TamilNadu #TamilReels #ReelsIndia #Shorts'
  ].filter(Boolean);

  const res = parts.join('\n');
  return res.length > 850 ? res.slice(0, 840) + '...' : res;
}

/**
 * Cross-posts a rendered MP4 video to Facebook Page & Instagram Reels
 *
 * @param {Object} params
 * @param {string} params.videoFilePath - Absolute or relative path to MP4
 * @param {string} [params.thumbnailFilePath=null] - Absolute or relative path to 9:16 or 16:9 Thumbnail Cover
 * @param {string} params.title - Video Title
 * @param {string} params.caption - Rich social caption with hooks and hashtags
 * @param {boolean} [params.isReel=true] - True for 9:16 Shorts/Reels, False for 16:9 Long videos
 * @param {boolean} [params.isDryRun=false] - If true, logs without calling network
 * @returns {Promise<{ facebook: Object|null, instagram: Object|null, videoUrl: string|null }>}
 */
export async function crossPostVideoToMetaSocials({
  videoFilePath,
  thumbnailFilePath = null,
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

  const hasMetaCreds = Boolean(pageToken && (pageId || instaId));

  if (isDryRun || !hasMetaCreds) {
    const safeInsta = formatSafeInstaCaption(caption, title);
    console.log(`[META DRY-RUN] Video ready for social broadcast (${fileSizeMb} MB)`);
    console.log(`Title: ${title}`);
    console.log(`Format: ${isReel ? 'Instagram Reel & FB Video (9:16)' : 'Facebook Watch Video (16:9)'}`);
    console.log(`[META DRY-RUN] Instagram Reel Caption Preview (${safeInsta.length} chars):\n${safeInsta}\n`);
    console.log(`[META DRY-RUN] Facebook Video Description Preview:\n${stripHtml(caption).slice(0, 180)}...\n`);
    if (!hasMetaCreds) {
      console.log('[META NOTICE] Missing META_PAGE_ACCESS_TOKEN and (META_PAGE_ID or META_INSTA_ACCOUNT_ID).');
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

  // Optional: Upload High-CTR Thumbnail Cover for Instagram Reel & Facebook Poster
  let publicCoverUrl = null;
  if (thumbnailFilePath && fs.existsSync(thumbnailFilePath)) {
    try {
      const thumbBuffer = fs.readFileSync(thumbnailFilePath);
      const thumbExt = path.extname(thumbnailFilePath).toLowerCase() || '.jpg';
      const contentType = thumbExt === '.png' ? 'image/png' : 'image/jpeg';
      const thumbFileName = `thumbnails/${path.basename(thumbnailFilePath)}`;
      console.log(`[META] Uploading thumbnail cover to Supabase CDN...`);
      publicCoverUrl = await uploadCardToStorage(thumbBuffer, thumbFileName, contentType);
      console.log(`[META] Cover URL ready: ${publicCoverUrl}`);
    } catch (thumbErr) {
      console.warn(`[META THUMB WARN] Failed to upload cover image: ${thumbErr.message}`);
    }
  }

  const results = {
    videoUrl: publicVideoUrl,
    coverUrl: publicCoverUrl,
    facebook: null,
    instagram: null,
    errors: []
  };

  try {
    // 2. Publish to Facebook Page Video (Uses graph-video.facebook.com endpoint)
    if (pageId && pageToken) {
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

    const fbPayload = {
      file_url: publicVideoUrl,
      title: title,
      description: stripHtml(caption),
      access_token: activePageToken
    };
    if (publicCoverUrl) {
      fbPayload.thumb_url = publicCoverUrl;
    }

    const fbRes = await fetch(`${GRAPH_VIDEO_API_BASE}/${pageId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fbPayload)
    });

    const fbData = await fbRes.json();
    if (fbData.error) {
      console.warn(`[META FB WARN] ${fbData.error.message}`);
      results.errors.push({ platform: 'facebook', error: fbData.error.message });
    } else {
      console.log(`[META FB SUCCESS] Facebook Video Published! Video ID: ${fbData.id}`);
      results.facebook = fbData;

      // Post YouTube subscription link in first comment to protect video organic reach from external link penalty
      if (fbData.id && activePageToken) {
        const ytMatch = caption.match(/https?:\/\/(?:youtu\.be|www\.youtube\.com)\/\S+/i);
        const ytLink = ytMatch ? ytMatch[0] : 'https://youtube.com/@VizhiTn';
        try {
          await fetch(`${GRAPH_API_BASE}/${fbData.id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `▶️ YouTube-ல் காண & சப்ஸ்கிரைப் செய்ய:\n🔗 ${ytLink}`,
              access_token: activePageToken
            })
          });
          console.log('[META FB FIRST COMMENT ✓] Added YouTube link in Facebook first comment.');
        } catch (_) {}
      }
    }
  } catch (err) {
    console.warn(`[META FB ERROR] ${err.message}`);
    results.errors.push({ platform: 'facebook', error: err.message });
  }
}

  // 3. Publish to Instagram Reels (if 9:16 format)
  if (isReel && instaId) {
    try {
      const safeInstaCaption = formatSafeInstaCaption(caption, title);
      console.log(`[META] Step 1: Creating Instagram Reel Container for account ${instaId}...`);
      const reelPayload = {
        media_type: 'REELS',
        video_url: publicVideoUrl,
        caption: safeInstaCaption,
        share_to_feed: true,
        access_token: pageToken
      };
      if (publicCoverUrl) {
        reelPayload.cover_url = publicCoverUrl;
      }

      const containerRes = await fetch(`${GRAPH_API_BASE}/${instaId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reelPayload)
      });

      const containerData = await containerRes.json();
      if (containerData.error) {
        console.warn(`[META INSTA WARN] Container creation failed: ${containerData.error.message}`);
        results.errors.push({ platform: 'instagram', error: containerData.error.message });
      } else {
        const creationId = containerData.id;
        console.log(`[META INSTA] Container ID: ${creationId}. Polling Meta processing status...`);

        // Poll container status until FINISHED (up to 180s with progressive interval)
        let isReady = false;
        let attempts = 0;
        const maxAttempts = 25;
        while (!isReady && attempts < maxAttempts) {
          attempts++;
          const waitMs = attempts <= 5 ? 5000 : attempts <= 15 ? 7000 : 10000;
          await new Promise((r) => setTimeout(r, waitMs));
          const statusRes = await fetch(`${GRAPH_API_BASE}/${creationId}?fields=status_code&access_token=${pageToken}`);
          const statusData = await statusRes.json();
          const statusCode = statusData.status_code || '';
          console.log(`[META INSTA] Processing status (attempt ${attempts}/${maxAttempts}): ${statusCode}`);

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
  } finally {
    // Clean up transit storage objects immediately once Meta ingestion is complete
    const transitFiles = [videoFileName, thumbFileName].filter(Boolean);
    if (transitFiles.length > 0) {
      console.log(`[META TRANSIT CLEANUP] Purging transit storage files: ${transitFiles.join(', ')}...`);
      await deleteFromStorage(transitFiles);
    }
  }

  return results;
}
