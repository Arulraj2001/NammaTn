// scripts/lib/meta-social-poster.mjs
/**
 * VizhiTN Universal Meta Social Media Publisher (Facebook & Instagram)
 * Automates cross-posting with 1080x1080 dynamic cards and engaging Tanglish/Tamil captions.
 *
 * Integrated Pipeline:
 * 1. Cloudflare Workers AI FLUX.1 Schnell photo generator (dynamic, non-repetitive)
 * 2. Headless Chrome HarfBuzz editorial card renderer (flawless Tamil ligatures + official TN logo)
 * 3. Sharp WebP compression (~58 KB, 87% smaller to protect Supabase free tier)
 * 4. Supabase Storage uploader ('media' bucket)
 * 5. Meta Graph API publisher for Facebook Page & Instagram Feed
 * 6. Batch queue processor with sequential rate-limit protection
 */

import path from 'path';
import fs from 'fs';
import { renderEditorialCard } from './card-renderer.mjs';
import { generateStoryPhoto, createCivicPhotoPrompt } from './cloudflare-image.mjs';
import { uploadCardToStorage } from './supabase-storage.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

const VIRAL_HASHTAG_MAP = {
  electricity: ['#TANGEDCO', '#PowerCut', '#EBPowerCut', '#Minnalagam', '#ElectricityBoard', '#TamilNaduPowerCut'],
  'water-sanitation': ['#MetroWater', '#TWAD', '#WaterSupply', '#ChennaiWater', '#DrinkingWater', '#TamilNaduWater'],
  transport: ['#CMRL', '#ChennaiMetro', '#MTCBus', '#SETC', '#SouthernRailway', '#TrafficAlert', '#TNTransport'],
  'government-schemes': ['#KalaignarMagalirUrimai', '#SmartRationCard', '#ESevai', '#AadhaarCamp', '#TNGovtSchemes', '#TNWelfare'],
  'public-safety': ['#CyberCrime1930', '#TamilNaduPolice', '#ScamAlert', '#CyberSecurity', '#TNSafety'],
  'road-infrastructure': ['#TNRoads', '#SmartCity', '#Highways', '#CivicIssue', '#RoadSafety'],
  'tn-politics': ['#TNPolitics', '#TNElection', '#TamilNewsLive', '#DMK', '#AIADMK', '#TVK', '#Vijay', '#Stalin'],
  education: ['#TNSchools', '#SchoolHoliday', '#ExamAlert', '#TamilNaduEducation', '#CollegeUpdate'],
  environment: ['#TNRain', '#ChennaiRains', '#IMDWeather', '#LakeRestoration', '#TamilNaduClimate'],
  healthcare: ['#TNHealth', '#GovtHospital', '#BloodDonation', '#HealthAlert', '#TamilNaduHealthcare'],
  general: ['#TamilNaduUpdates', '#HyperlocalNews', '#TamilNews', '#TNAlerts']
};

function getCategoryHashtags(categorySlug = '') {
  const cat = (categorySlug || '').toLowerCase();
  for (const [key, tags] of Object.entries(VIRAL_HASHTAG_MAP)) {
    if (cat.includes(key) || key.includes(cat)) {
      return tags;
    }
  }
  return VIRAL_HASHTAG_MAP.general;
}

/**
 * Format post content into high-converting Instagram & Facebook caption.
 * Incorporates 2026 first-line search anchor, Instagram Save/Share signals,
 * Facebook discussion hooks, and 3-tier viral hashtag clusters.
 */
export function formatSocialCaption(post = {}) {
  const titleTa = post.title_ta || post.title_en || 'முக்கிய அறிவிப்பு | VizhiTN';
  const category = (post.category_slug || 'general').toLowerCase();
  const district = post.district_slug || 'tamil-nadu';
  const area = post.area_name || '';
  const helpline = post.assigned_department?.match(/\d{4,}/)?.[0] || '';

  let emojiHeader = '📢';
  if (category.includes('electric') || category.includes('power')) emojiHeader = '⚡';
  else if (category.includes('educat') || category.includes('scheme')) emojiHeader = '💻';
  else if (category.includes('water')) emojiHeader = '💧';
  else if (category.includes('road') || category.includes('infra')) emojiHeader = '🛣️';
  else if (category.includes('safe') || category.includes('scam')) emojiHeader = '🚨';
  else if (category.includes('politic')) emojiHeader = '🗳️';

  const bullets = [];
  if (post.bullet1) bullets.push(post.bullet1);
  if (post.bullet2) bullets.push(post.bullet2);
  if (post.bullet3) bullets.push(post.bullet3);

  // If no manual bullets, construct from content
  if (bullets.length === 0 && post.content_ta) {
    const sentences = post.content_ta.split('. ').filter(Boolean).slice(0, 3);
    sentences.forEach((s) => bullets.push(`➔ ${s.trim()}`));
  }

  // 1. Search anchor (first line, indexed by Instagram & Meta search algorithms in 2026)
  const areaPrefix = area ? `${area} | ` : '';
  const searchAnchor = `vizhi_tn ${emojiHeader} ${areaPrefix}${titleTa}`;

  // 2. High-converting CTAs
  const saveShareHook = '📌 உங்கள் பகுதி உள்ளதா என்பதைச் சரிபார்க்க சேமித்து (Save) வைத்துக் கொள்ளுங்கள்! நண்பர்களுக்கும் குடும்பத்தினருக்கும் பகிருங்கள் (Share) ↗️';
  const discussionHook = '💬 உங்கள் பகுதியில் தற்போதைய நிலை என்ன? கமெண்டில் சொல்லுங்கள் 👇';

  // 3. Multi-tier hashtags
  const tier1Tags = ['#VizhiTN', '#TamilNadu', '#TamilNaduNews', '#TNGovt'];
  const tier2Tags = getCategoryHashtags(category);
  const districtTag = `#${district.replace(/[^a-zA-Z0-9]/g, '')}`;
  const areaTag = area ? `#${area.replace(/[^a-zA-Z0-9]/g, '')}` : '';
  const tier3Tags = [districtTag, areaTag].filter(Boolean);

  const allHashtags = Array.from(new Set([...tier1Tags, ...tier2Tags, ...tier3Tags])).join(' ');

  const targetUrl = `https://www.vizhitn.in/${post.slug ? (category === 'tn-politics' ? `tn-politics/${post.slug}` : `post/${post.slug}`) : ''}`;

  const lines = [
    searchAnchor,
    '',
    post.content_ta || post.content_en || '',
    '',
    bullets.length > 0 ? 'முக்கிய விவரங்கள் 👇' : '',
    ...bullets,
    '',
    helpline ? `📞 அவசர உதவி எண்: ${helpline}` : '',
    '',
    saveShareHook,
    discussionHook,
    '',
    'மேலும் முழு விவரங்களை அறிய 👇',
    `🔗 ${targetUrl}`,
    '',
    allHashtags
  ].filter((line, idx, arr) => line !== '' || (arr[idx - 1] !== '' && idx > 0));

  return lines.join('\n');
}

/**
 * Post to Facebook Page.
 */
export async function postToFacebookPage({ imageUrl, caption, link }) {
  const pageId = process.env.META_PAGE_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;

  if (!pageId || !token) {
    throw new Error('Missing META_PAGE_ID or META_PAGE_ACCESS_TOKEN');
  }

  // Get Page-specific access token (required by Facebook Page API)
  let activePageToken = token;
  try {
    const pageTokenRes = await fetch(`${GRAPH_API_BASE}/${pageId}?fields=access_token&access_token=${token}`);
    const pageTokenData = await pageTokenRes.json();
    if (pageTokenData.access_token) {
      activePageToken = pageTokenData.access_token;
    }
  } catch (_) {}

  console.log(`[MetaPoster] Publishing to Facebook Page (${pageId})...`);

  const res = await fetch(`${GRAPH_API_BASE}/${pageId}/photos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: imageUrl,
      caption: link ? `${caption}\n\nRead more: ${link}` : caption,
      access_token: activePageToken
    })
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`Facebook API Error: ${data.error.message}`);
  }

  console.log(`[MetaPoster] Facebook Post Success! Post ID: ${data.id || data.post_id}`);
  return data;
}

/**
 * Post to Instagram Feed (2-Step Media Container flow).
 */
export async function postToInstagramFeed({ imageUrl, caption }) {
  const instaId = process.env.META_INSTA_ACCOUNT_ID;
  const token = process.env.META_PAGE_ACCESS_TOKEN;

  if (!instaId || !token) {
    throw new Error('Missing META_INSTA_ACCOUNT_ID or META_PAGE_ACCESS_TOKEN');
  }

  console.log(`[MetaPoster] Step 1: Creating Instagram Media Container for account ${instaId}...`);

  const containerRes = await fetch(`${GRAPH_API_BASE}/${instaId}/media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imageUrl,
      caption: caption,
      access_token: token
    })
  });

  const containerData = await containerRes.json();
  if (containerData.error) {
    throw new Error(`Instagram Container Error: ${containerData.error.message}`);
  }

  const creationId = containerData.id;
  console.log(`[MetaPoster] Media Container Created. ID: ${creationId}`);

  // Wait 3 seconds for Meta CDN to process the image container
  await new Promise((r) => setTimeout(r, 3000));

  console.log(`[MetaPoster] Step 2: Publishing Media Container ${creationId}...`);

  const publishRes = await fetch(`${GRAPH_API_BASE}/${instaId}/media_publish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: creationId,
      access_token: token
    })
  });

  const publishData = await publishRes.json();
  if (publishData.error) {
    throw new Error(`Instagram Publish Error: ${publishData.error.message}`);
  }

  console.log(`[MetaPoster] Instagram Post Published Successfully! Media ID: ${publishData.id}`);
  return publishData;
}

/**
 * Broadcast a single post to both Facebook and Instagram simultaneously.
 * Automatically generates AI photo + renders branded 1080x1080 card + compresses to ~58 KB WebP.
 *
 * @param {object} post - The civic/news post object
 * @param {object} options - Options { isDryRun, skipAiPhoto, customPhotoPath }
 */
export async function broadcastToSocials(post = {}, options = {}) {
  const {
    isDryRun = false,
    skipAiPhoto = false,
    customPhotoPath = null
  } = options;

  console.log('====================================================');
  console.log(`[MetaPoster] Processing Post: "${post.title_ta || post.title_en}"`);
  console.log('====================================================');

  const slug = post.slug || `post-${Date.now()}`;
  const timestamp = Date.now();

  // 1. Photo resolution: Cloudflare AI or provided photo
  let photoPath = customPhotoPath;
  if (!photoPath && !skipAiPhoto) {
    try {
      const prompt = post.photo_prompt || createCivicPhotoPrompt(post);
      const photoResult = await generateStoryPhoto(prompt, {
        outputFilename: `cf-photo-${slug}-${timestamp}.jpg`
      });
      photoPath = photoResult.filePath;
    } catch (pErr) {
      console.warn('[MetaPoster] Cloudflare photo generation fallback:', pErr.message);
      photoPath = path.resolve('public/images/test-cf-flux.jpg');
    }
  }

  // Fallback to local default if still not set
  if (!photoPath || !fs.existsSync(photoPath)) {
    photoPath = path.resolve('public/images/test-cf-flux.jpg');
  }

  // 2. Render Flawless 1080x1080 Editorial Card (HarfBuzz + Sharp 58 KB WebP)
  const cardFilename = `card-${slug}-${timestamp}.webp`;
  const locationText = post.district_slug
    ? `${post.district_slug.toUpperCase().replace(/-/g, ' ')} | District`
    : 'தமிழ்நாடு | Statewide';

  const cardResult = await renderEditorialCard({
    title_ta: post.title_ta || post.title_en,
    subtitle: post.subtitle || (post.content_ta ? post.content_ta.slice(0, 75) + '...' : ''),
    category: post.category_slug || 'general',
    bullet1: post.bullet1 || '',
    bullet2: post.bullet2 || '',
    bullet3: post.bullet3 || '',
    location: locationText,
    ribbon: post.urgency_level === 'critical' ? '⚡ LIVE ALERT' : '★ FEATURED',
    photoPath: photoPath,
    outputFilename: cardFilename
  });

  const caption = formatSocialCaption(post);
  const link = post.slug
    ? (post.category_slug === 'tn-politics'
        ? `https://www.vizhitn.in/tn-politics/${post.slug}`
        : `https://www.vizhitn.in/post/${post.slug}`)
    : 'https://www.vizhitn.in';

  console.log(`[MetaPoster] Editorial Card Ready: ${cardResult.filePath} (${cardResult.sizeKb} KB)`);
  console.log(`\n[MetaPoster] Generated Caption:\n${caption}\n`);

  if (isDryRun) {
    console.log('[MetaPoster] Dry run mode enabled. Skipping live social network broadcast.');
    return {
      dryRun: true,
      cardPath: cardResult.filePath,
      sizeKb: cardResult.sizeKb,
      caption,
      link
    };
  }

  // 3. Upload to Supabase Storage ('media' bucket) to get public URL for Meta
  let publicImageUrl = post.direct_image_url;
  if (!publicImageUrl) {
    publicImageUrl = await uploadCardToStorage(cardResult.buffer, cardFilename, 'image/webp');
  }

  const results = {
    cardUrl: publicImageUrl,
    cardPath: cardResult.filePath,
    sizeKb: cardResult.sizeKb,
    facebook: null,
    instagram: null,
    errors: []
  };

  // 4. Post to Facebook
  try {
    results.facebook = await postToFacebookPage({
      imageUrl: publicImageUrl,
      caption,
      link
    });
  } catch (err) {
    console.error('[MetaPoster] Facebook failed:', err.message);
    results.errors.push({ platform: 'facebook', error: err.message });
  }

  // 5. Post to Instagram
  try {
    results.instagram = await postToInstagramFeed({
      imageUrl: publicImageUrl,
      caption
    });
  } catch (err) {
    console.error('[MetaPoster] Instagram failed:', err.message);
    results.errors.push({ platform: 'instagram', error: err.message });
  }

  return results;
}

/**
 * Sequential Batch Processor for Multiple Posts.
 * Prevents concurrent Cloudflare Workers AI overload and Meta rate limits.
 *
 * @param {Array<object>} posts - List of posts to broadcast
 * @param {object} options - Options { delayMs, isDryRun }
 * @returns {Promise<{ total: number, successful: Array, failed: Array }>}
 */
export async function broadcastBatchToSocials(posts = [], options = {}) {
  const { delayMs = 3000, isDryRun = false } = options;

  console.log('====================================================');
  console.log(`[MetaPoster Batch] Starting batch processing for ${posts.length} posts...`);
  console.log(`[MetaPoster Batch] Cooldown delay between posts: ${delayMs}ms`);
  console.log('====================================================');

  const summary = {
    total: posts.length,
    successful: [],
    failed: []
  };

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`\n[MetaPoster Batch] [${i + 1}/${posts.length}] Broadcasting: "${post.title_ta || post.title_en}"`);

    try {
      const res = await broadcastToSocials(post, { isDryRun });
      summary.successful.push({
        postSlug: post.slug,
        title: post.title_ta || post.title_en,
        result: res
      });
    } catch (err) {
      console.error(`[MetaPoster Batch] Post failed: ${post.title_ta || post.title_en}`, err.message);
      summary.failed.push({
        postSlug: post.slug,
        title: post.title_ta || post.title_en,
        error: err.message
      });
    }

    // Cooldown pause between posts to respect rate limits
    if (i < posts.length - 1) {
      console.log(`[MetaPoster Batch] Cooling down for ${delayMs}ms before next post...`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  console.log('\n====================================================');
  console.log(`[MetaPoster Batch] Completed! Success: ${summary.successful.length}, Failed: ${summary.failed.length}`);
  console.log('====================================================\n');

  return summary;
}
