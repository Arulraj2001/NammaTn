// scripts/youtube/pipelines/generate-shorts.mjs
// Daily Civic Lifeline Alert Short — Hook → Truth → Power structure
// Narrator persona: "Kavitha" | Category-specific visuals | SEO metadata engine

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { normalizeAcronymsToSpokenTamil } from '../engine/tamil-phonetics.mjs';
import { generateVideoMetadata, getCategoryFluxPrompt, generateArtDirectedVisualPrompt } from '../engine/script-writer.mjs';
import { synthesizeSpeech } from '../engine/tts-engine.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { generateYouTubeSceneVisual, toImageSource } from '../engine/cloudflare-visuals.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';
import { generateShortsThumbnail, generateShortsThumbnailPair } from '../engine/thumbnail-shorts-engine.mjs';
import { generateSeoVideoFilename } from '../engine/seo-filename.mjs';
import { fetchFreeBrollClip } from '../engine/broll-fetcher.mjs';
import { chunkSentenceForCaptions, generateCaptionsFromClauses, generateAssSubtitleFile } from '../engine/captions-engine.mjs';
import { runQualityControl } from '../engine/qc-engine.mjs';
import { checkQuotaAvailable, recordQuotaUsage } from '../engine/quota-tracker.mjs';
import { getScheduledUploadForSlot, getTodayIst } from '../engine/calendar-reader.mjs';
import { recordBroadcastSuccess, isBroadcastCompletedToday } from '../engine/broadcast-logger.mjs';

// Load .env.local if running locally
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[FATAL] Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Category → Visual Identity Map ─────────────────────────────────────────
const CATEGORY_THEME = {
  'electricity':        { color: '#FFD600', icon: '⚡', label: 'TANGEDCO மின்வாரியம்' },
  'water-sanitation':   { color: '#00B4D8', icon: '💧', label: 'குடிநீர் / மெட்ரோ வாட்டர்' },
  'road-infrastructure':{ color: '#FF6B35', icon: '🚧', label: 'சாலை உள்கட்டமைப்பு' },
  'transport':          { color: '#6A0DAD', icon: '🚇', label: 'போக்குவரத்து' },
  'public-safety':      { color: '#DC143C', icon: '🚨', label: 'பொது பாதுகாப்பு' },
  'healthcare':         { color: '#2ECC71', icon: '🏥', label: 'சுகாதாரம்' },
  'education':          { color: '#3498DB', icon: '🎓', label: 'கல்வி' },
  'agriculture':        { color: '#8B6914', icon: '🌾', label: 'விவசாயம்' },
  'environment':        { color: '#27AE60', icon: '🌿', label: 'சுற்றுச்சூழல்' },
  'government-schemes': { color: '#9B59B6', icon: '📋', label: 'அரசு திட்டங்கள்' },
  'local-development':  { color: '#E67E22', icon: '🏗️', label: 'உள்ளூர் வளர்ச்சி' },
  'general':            { color: '#38BDF8', icon: '📢', label: 'முக்கிய அறிவிப்பு' }
};

function getCategoryTheme(slug) {
  return CATEGORY_THEME[slug] || CATEGORY_THEME['general'];
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN — Daily Civic Alert Short (Hook → Truth → Power)');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const outDir = path.resolve('public/youtube_renders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const todayIst = getTodayIst();

  // Deduplication Guard: Never upload duplicate short for today's slot unless forced
  if (!process.argv.includes('--force')) {
    const status = await isBroadcastCompletedToday('civic-shorts', todayIst);
    if (status.published) {
      console.log(`[DEDUP GUARD ✓] Daily Civic Short already broadcast today (${status.existingRecord?.youtube_video_id || 'recorded'}). Exiting.`);
      process.exit(0);
    }
  }

  // 1. Source topic from 90-Day Calendar or fallback to active posts in Supabase
  const calEntry = getScheduledUploadForSlot('civic-shorts', todayIst);
  let leadPost;
  let posts = [];

  if (calEntry) {
    console.log(`[90-DAY CALENDAR] Sourcing scheduled civic short: "${calEntry.title}"`);
    const detectedCity = calEntry.title.match(/(Chennai|Coimbatore|Madurai|Salem|Tiruchirappalli|Trichy|Tirunelveli|Vellore|Erode|Thanjavur)/i)?.[0] || 'சென்னை';
    const detectedCategory = calEntry.title.toLowerCase().includes('power cut') || calEntry.title.toLowerCase().includes('tneb') ? 'electricity' :
                             calEntry.title.toLowerCase().includes('water') || calEntry.title.includes('குடிநீர்') ? 'water-sanitation' :
                             calEntry.title.includes('சாலை') || calEntry.title.includes('பள்ளம்') ? 'road-infrastructure' : 'general';

    leadPost = {
      title_ta: calEntry.title,
      title_en: calEntry.title,
      content_ta: calEntry.description,
      content_en: calEntry.description,
      area_name: detectedCity,
      district_slug: detectedCity.toLowerCase(),
      category_slug: detectedCategory,
      assigned_department: detectedCategory === 'electricity' ? 'TANGEDCO (Minnalagam: 1912)' :
                           detectedCategory === 'water-sanitation' ? 'Metrowater / TWAD (1913)' :
                           'Greater Chennai Corporation / Municipal Administration',
      thumbnail_text: calEntry.thumbnail_text,
      hashtags: calEntry.hashtags,
      custom_description: calEntry.description
    };
    posts = [leadPost];
  } else {
    console.log('[DATABASE] Fetching latest active civic alerts...');
    const { data: dbPosts, error } = await supabase
      .from('post')
      .select('*')
      .eq('status', 'active')
      .order('created_date', { ascending: false })
      .limit(3);

    if (error || !dbPosts || dbPosts.length === 0) {
      console.error('[ERROR] Could not fetch active posts from Supabase:', error);
      process.exit(1);
    }
    posts = dbPosts;
    leadPost = posts[0];
  }

  const category = leadPost.category_slug || 'general';
  const theme = getCategoryTheme(category);
  const area = leadPost.area_name || leadPost.district_slug || 'தமிழ்நாடு';
  const district = leadPost.district_slug || 'tamil-nadu';
  const department = leadPost.assigned_department || 'Tamil Nadu Government';
  const helpline = (leadPost.assigned_department || '').includes('TANGEDCO') ? '1912' :
                   (leadPost.assigned_department || '').includes('Metrowater') ? '1913' :
                   '1912';

  const now = new Date();
  const dateStr = now.toLocaleDateString('ta-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

  // ─── 2. SCRIPT — 4-Beat Dynamic Visual Progression ────────────────────────
  // TARGET BUDGET: S1≈7s | S2≈10s | S3≈16s | S4≈12s = ~45s total (under 60s Shorts ceiling)

  // BEAT 1 — THE HOOK (0:00–0:07): Urgent curiosity hook tailored by category
  const firstTitle = normalizeAcronymsToSpokenTamil(leadPost.title_ta || leadPost.title_en || '');
  let curiosityHook = '';
  if (category === 'electricity') {
    curiosityHook = `உங்க ஏரியாவில இன்னைக்கு திடீர்னு கரண்ட் கட் ஆக போகுதா? இந்த லிஸ்ட்ல உங்க தெரு இருக்கான்னு உடனே செக் பண்ணுங்க!`;
  } else if (category === 'water-sanitation') {
    curiosityHook = `குடிநீர் சப்ளைல திடீர் பிரச்சனை! உங்க பகுதியில இன்னைக்கு தண்ணி வராம போகுமா?`;
  } else if (category === 'transport') {
    curiosityHook = `இன்னைக்கு இந்த ரூட்ல கிளம்புறவங்க உடனே கவனியுங்கள்!`;
  } else if (category === 'public-safety') {
    curiosityHook = `இந்த புது விதமான மோசடியில் உங்கள் பணம் போயிடாம இருக்க உடனே உஷாரா இருங்க!`;
  } else if (category === 'government-schemes') {
    curiosityHook = `ரேஷன் கார்டு மற்றும் அரசு திட்டங்களில் இந்த புது ரூல்ஸ் உங்களுக்கு தெரியுமா?`;
  } else {
    curiosityHook = `${area} மக்கள் உடனே கவனியுங்கள்! உங்கள் பகுதியில் இன்று முக்கிய அறிவிப்பு:`;
  }

  const hookOpener = `${curiosityHook} ${firstTitle}`;
  const scene1Script = [ hookOpener.slice(0, 150) ];

  // BEAT 2 — GROUND REALITY & B-ROLL (0:07–0:17): Location and ground context
  const groundDetails = leadPost.location_text ? `பாதிக்கப்பட்ட பகுதிகள்: ${leadPost.location_text}.` : '';
  const scene2Script = [
    `${area} கள நிலவரம்: ${firstTitle}. ${groundDetails}`
  ];

  // BEAT 3 — DATA BREAKDOWN & MULTI-AREA IMPACT (0:17–0:33): Sourced data points
  const scene3Script = [];
  posts.slice(1).forEach((p) => {
    const pArea = p.area_name || p.district_slug || 'பகுதி';
    const pTitle = normalizeAcronymsToSpokenTamil(p.title_ta || p.title_en).slice(0, 80);
    scene3Script.push(`அடுத்ததா, ${pArea} பகுதியில ${pTitle}.`);
  });
  if (scene3Script.length === 0) {
    scene3Script.push(`இந்த விவகாரம் குறித்து துறைசார் அதிகாரிகள் நேரடி ஆய்வு மேற்கொண்டு வருகின்றனர்.`);
  }

  // BEAT 4 — THE POWER & HELPLINE ACTION (0:33–0:45): Verified helpline + Follow CTA
  const scene4Script = [
    `உடனடி புகார் பதிவு செய்ய ${helpline} உதவி எண்ணை தொடர்பு கொள்ளுங்கள்.`,
    `தமிழ்நாட்டின் அன்றாட முக்கிய எச்சரிக்கைகளை உடனே தெரிஞ்சுக்க — இப்பவே VizhiTN-ஐ Follow பண்ணிக்கோங்க!`
  ];

  // ─── 3. Synthesize Audio for all 4 beats ─────────────────────────────────
  console.log('[TTS] Synthesizing Beat 1 — The Hook...');
  const s1AudioPath = path.join(outDir, `short_s1_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene1Script, s1AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+5%' });
  const s1Dur = getAudioDuration(s1AudioPath);

  console.log('[TTS] Synthesizing Beat 2 — Ground Reality...');
  const s2AudioPath = path.join(outDir, `short_s2_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene2Script, s2AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
  const s2Dur = getAudioDuration(s2AudioPath);

  console.log('[TTS] Synthesizing Beat 3 — Data Breakdown...');
  const s3AudioPath = path.join(outDir, `short_s3_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene3Script, s3AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
  const s3Dur = getAudioDuration(s3AudioPath);

  console.log('[TTS] Synthesizing Beat 4 — Citizen Power...');
  const s4AudioPath = path.join(outDir, `short_s4_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene4Script, s4AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
  const s4Dur = getAudioDuration(s4AudioPath);

  const totalDur = s1Dur + s2Dur + s3Dur + s4Dur;
  console.log(`[AUDIO] S1: ${s1Dur.toFixed(1)}s | S2: ${s2Dur.toFixed(1)}s | S3: ${s3Dur.toFixed(1)}s | S4: ${s4Dur.toFixed(1)}s | Total: ${totalDur.toFixed(1)}s`);

  // ─── 4. Generate Visuals — AI Art-Directed Conflict Scene Visual (FLUX) ────
  const artDirectedPrompt = await generateArtDirectedVisualPrompt({
    title: leadPost.title_en || leadPost.title_ta || firstTitle,
    category,
    aspectRatio: '9:16',
    variant: 'A'
  });
  const heroPhotoPath = path.join(outDir, `short_flux_hero_${Date.now()}.webp`);
  let heroPhotoUrl = await generateYouTubeSceneVisual(artDirectedPrompt, heroPhotoPath, '9:16');
  if (!heroPhotoUrl) {
    const categoryCardPath = path.resolve(`public/images/categories/${category}.webp`);
    heroPhotoUrl = fs.existsSync(categoryCardPath) ? categoryCardPath : path.resolve('public/images/categories/general.webp');
  }

  console.log(`[B-ROLL] Fetching moving B-roll clip for category "${category}"...`);
  const brollClip = await fetchFreeBrollClip({
    category,
    aspectRatio: '9:16',
    durationSec: totalDur
  });

  const brandLogoDataUri = getBrandLogoDataUri();

  // ─── 5. Render Beat 1 — Hook Frame ───────────────────────────────────────
  const tplS1Path = path.resolve('scripts/youtube/templates/shorts/scene-1-hook.html');
  let tplS1 = fs.readFileSync(tplS1Path, 'utf-8');
  tplS1 = tplS1
    .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
    .replace('{{SCENE_PHOTO_SRC}}', toImageSource(heroPhotoUrl))
    .replaceAll('{{HOOK_HEADLINE_TA}}', leadPost.title_ta || leadPost.title_en || 'இன்றைய முக்கிய செய்தி')
    .replace('{{DATE_TEXT}}', dateStr)
    .replace('{{CATEGORY_COLOR}}', theme.color)
    .replace('{{CATEGORY_ICON}}', theme.icon)
    .replace('{{CATEGORY_LABEL}}', theme.label)
    .replace('{{DISTRICT_NAME}}', (leadPost.district_slug || 'TN').toUpperCase())
    .replace(/\{\{URGENCY_CLASS\}\}/g, leadPost.urgency_level === 'critical' ? 'pill-critical' :
              leadPost.urgency_level === 'high' ? 'pill-high' : 'pill-alert');

  const s1FramePath = path.join(outDir, `short_s1_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS1, s1FramePath, { width: 1080, height: 1920 });

  // ─── 6. Render Beat 2 — Ground Reality B-Roll Overlay ────────────────────
  const tplS2Path = path.resolve('scripts/youtube/templates/shorts/scene-broll-overlay.html');
  let tplS2 = fs.readFileSync(tplS2Path, 'utf-8');
  tplS2 = tplS2
    .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
    .replace('{{SCENE_PHOTO_SRC}}', toImageSource(heroPhotoUrl))
    .replace('{{LOCATION_TEXT}}', `${area} | தமிழ்நாடு`)
    .replace('{{CATEGORY_COLOR}}', theme.color)
    .replace('{{CATEGORY_ICON}}', theme.icon)
    .replace('{{CATEGORY_LABEL}}', theme.label)
    .replace('{{HEADLINE_TA}}', leadPost.title_ta || leadPost.title_en || 'கள ஆய்வு அறிக்கை')
    .replace('{{SUBHEADLINE_TA}}', leadPost.location_text || 'நிர்வாக மற்றும் துறைசார் விவரங்கள்')
    .replace('{{SOURCE_ATTRIBUTION}}', `துறை: ${leadPost.assigned_department || 'தமிழ்நாடு அரசு'}`);

  const s2FramePath = path.join(outDir, `short_s2_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS2, s2FramePath, { width: 1080, height: 1920 });

  // ─── 7. Render Beat 3 — Infographic Data Stat Card ───────────────────────
  const statMetric = leadPost.category_slug === 'electricity' ? '1912' :
                     leadPost.category_slug === 'water-sanitation' ? '1913' : 'VERIFIED';
  const statLabelTa = leadPost.category_slug === 'electricity' ? 'மின்தடை மற்றும் பராமரிப்பு பகுதிகள்' :
                      leadPost.category_slug === 'water-sanitation' ? 'குடிநீர் வாரிய அவசர அறிவிப்பு' : 'அரசு நிர்வாக அறிவிப்பு';

  let pointsHtml = '';
  posts.forEach(p => {
    const pArea = p.area_name || p.district_slug || 'பகுதி';
    pointsHtml += `
      <div class="point-item">
        <span class="point-bullet">✦</span>
        <span class="point-text"><strong>${pArea}:</strong> ${p.title_ta || p.title_en}</span>
      </div>
    `;
  });

  const tplS3Path = path.resolve('scripts/youtube/templates/shorts/scene-stat-card.html');
  let tplS3 = fs.readFileSync(tplS3Path, 'utf-8');
  tplS3 = tplS3
    .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
    .replace('{{CATEGORY_COLOR}}', theme.color)
    .replace('{{CATEGORY_ICON}}', theme.icon)
    .replace('{{CATEGORY_LABEL}}', theme.label)
    .replace('{{STAT_METRIC}}', statMetric)
    .replace('{{STAT_LABEL_TA}}', statLabelTa)
    .replace('{{STAT_DESC_EN}}', `${(leadPost.district_slug || 'TN').toUpperCase()} CIVIC DATA`)
    .replace('{{POINTS_HTML}}', pointsHtml)
    .replace('{{SOURCE_NAME}}', leadPost.assigned_department || 'Tamil Nadu Administration')
    .replace('{{HELPLINE_NUM}}', helpline);

  const s3FramePath = path.join(outDir, `short_s3_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS3, s3FramePath, { width: 1080, height: 1920 });

  // ─── 8. Render Beat 4 — Power & vizhitn.in CTA Frame ─────────────────────
  const tplS4Path = path.resolve('scripts/youtube/templates/shorts/scene-3-helpline.html');
  let tplS4 = fs.readFileSync(tplS4Path, 'utf-8');
  tplS4 = tplS4.replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri);

  const s4FramePath = path.join(outDir, `short_s4_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS4, s4FramePath, { width: 1080, height: 1920 });

  // ─── 9. Generate Millisecond-Accurate Subtitles ──────────────────────────
  const s1SubPath = path.join(outDir, `short_s1_sub_${Date.now()}.ass`);
  const s2SubPath = path.join(outDir, `short_s2_sub_${Date.now()}.ass`);
  const s3SubPath = path.join(outDir, `short_s3_sub_${Date.now()}.ass`);
  const s4SubPath = path.join(outDir, `short_s4_sub_${Date.now()}.ass`);

  try {
    generateAssSubtitleFile(generateCaptionsFromClauses(scene1Script, s1Dur), s1SubPath, '9:16');
    generateAssSubtitleFile(generateCaptionsFromClauses(scene2Script, s2Dur), s2SubPath, '9:16');
    generateAssSubtitleFile(generateCaptionsFromClauses(scene3Script, s3Dur), s3SubPath, '9:16');
    generateAssSubtitleFile(generateCaptionsFromClauses(scene4Script, s4Dur), s4SubPath, '9:16');
  } catch (subErr) {
    console.log('[CAPTIONS WARN] Subtitle generation error:', subErr.message);
  }

  // ─── 10. Generate High-CTR A/B Vertical Thumbnails ───────────────────────
  const thumbBase = `thumb_short_${leadPost.slug || Date.now()}`;
  let thumbnailPath = path.join(outDir, `${thumbBase}_variantA.png`);
  let thumbnailBPath = path.join(outDir, `${thumbBase}_variantB.png`);
  try {
    const pair = await generateShortsThumbnailPair({
      titleTa: leadPost.thumbnail_text || leadPost.title_ta || leadPost.title_en || firstTitle,
      category: theme.label,
      heroImageUrl: heroPhotoUrl || path.resolve('public/images/categories/general.webp'),
      outputDir: outDir,
      baseName: thumbBase
    });
    thumbnailPath = pair.variantA;
    thumbnailBPath = pair.variantB;
  } catch (e) {
    console.warn('[THUMBNAIL WARN]:', e.message);
  }

  // ─── 11. Assemble 4-Beat Multi-Scene Short with Dynamic Motion ────────────
  const seoFilename = generateSeoVideoFilename({
    title: leadPost.title_en || leadPost.title_ta || firstTitle,
    district: leadPost.district_slug,
    area: leadPost.area_name,
    category,
    format: 'short',
    dateStr: dateStr
  });
  const videoOutputPath = path.join(outDir, seoFilename);
  console.log(`[COMPOSER] Target SEO Video Filename: ${seoFilename}`);
  console.log('[COMPOSER] Assembling 4-Beat Civic Short with sidechain ducking & kinetic captions...');

  const scenes = [
    { imagePath: s1FramePath, videoPath: brollClip, audioPath: s1AudioPath, durationSec: s1Dur, hasMotion: true, isLastScene: false, subtitlePath: s1SubPath },
    { imagePath: s2FramePath, videoPath: brollClip, audioPath: s2AudioPath, durationSec: s2Dur, hasMotion: true, isLastScene: false, subtitlePath: s2SubPath },
    { imagePath: s3FramePath, videoPath: brollClip, audioPath: s3AudioPath, durationSec: s3Dur, hasMotion: true, isLastScene: false, subtitlePath: s3SubPath },
    { imagePath: s4FramePath, videoPath: brollClip, audioPath: s4AudioPath, durationSec: s4Dur, hasMotion: true, isLastScene: true, subtitlePath: s4SubPath }
  ];

  assembleMultiSceneShortsVideo({
    scenes,
    outputPath: videoOutputPath,
    thumbnailPath: fs.existsSync(thumbnailPath) ? thumbnailPath : undefined
  });
  console.log(`[COMPOSER] Short generated: ${videoOutputPath}`);

  // ─── 12. Automated Quality-Control (QC) Gate ─────────────────────────────
  const qcReport = runQualityControl({ videoPath: videoOutputPath, isShort: true, generateSheet: true });
  if (!qcReport.passed) {
    console.error('[QC BLOCKED] Rendered video failed broadcast quality checks. Aborting publishing.');
    process.exit(1);
  }

  // ─── 13. YouTube API Quota Safety Guard ──────────────────────────────────
  const quota = checkQuotaAvailable('VIDEO_UPLOAD');
  if (!quota.allowed) {
    console.warn(`[QUOTA BLOCKED] ${quota.reason}`);
    process.exit(0);
  }

  // ─── 14. Build SEO Metadata ───────────────────────────────────────────────
  const { title: autoTitle, description: autoDesc, tags, pinnedComment: autoComment } = generateVideoMetadata({
    article: leadPost,
    script: null,
    isShort: true,
    chapterTimestamps: []
  });

  const finalTitle = (leadPost.title_ta || autoTitle).slice(0, 95);
  const finalDesc = leadPost.custom_description
    ? `🚨 ${leadPost.title_ta}\n\n${leadPost.custom_description}\n\n📞 புகார் உதவி மையம்: ${helpline}\n🌐 முழு விவரங்கள்: https://vizhitn.in\n\n${(leadPost.hashtags || ['#Shorts', '#VizhiTN', '#TamilNaduNews']).join(' ')}`
    : autoDesc;

  // ─── 15. Upload to YouTube ────────────────────────────────────────────────
  let uploadResult = null;
  try {
    uploadResult = await uploadToYouTube({
      videoFilePath: videoOutputPath,
      title: finalTitle,
      description: finalDesc,
      tags,
      privacyStatus: isDryRun ? 'unlisted' : 'public',
      isShort: true
    });

    if (uploadResult?.videoId && !uploadResult.dryRun) {
      recordQuotaUsage('VIDEO_UPLOAD', { videoId: uploadResult.videoId, title: finalTitle });
      await recordBroadcastSuccess({
        broadcastDate: todayIst,
        format: 'civic-shorts',
        timeIst: calEntry?.time_ist || '07:30 PM',
        title: finalTitle,
        youtubeVideoId: uploadResult.videoId,
        youtubeUrl: uploadResult.videoUrl,
        metadata: {
          district: leadPost.district_slug,
          category: leadPost.category_slug,
          thumbnail_b_path: fs.existsSync(thumbnailBPath) ? thumbnailBPath : null,
          ab_swapped: false
        }
      });

      if (fs.existsSync(thumbnailPath)) {
        await setYouTubeThumbnail(uploadResult.videoId, thumbnailPath);
      }
      const discussionComment = autoComment ||
        `💬 உங்கள் ஏரியாவிலும் இந்த பிரச்சனை உள்ளதா? உங்க கருத்து என்ன? கீழே சொல்லுங்கள் 👇\n📌 பிறருக்கு உதவ உடனே Share செய்யுங்கள் ↗️\n🔴 vizhitn.in`;
      await postPinnedComment(uploadResult.videoId, discussionComment);
    }

    console.log('====================================================');
    console.log('CIVIC ALERT SHORT GENERATED & PUBLISHED!');
    console.log('Video URL:', uploadResult?.videoUrl || 'N/A');
    console.log('Title:', finalTitle);
    console.log('====================================================');
  } catch (ytErr) {
    console.warn('[YOUTUBE WARN] YouTube upload encountered an issue:', ytErr.message);
  }

  // ─── 16. Cross-Post to Meta Socials (Instagram Reels & Facebook Video) ─────
  try {
    const metaCaption = `${theme.icon} ${(leadPost.district_slug || 'TN').toUpperCase()} நேரடி நிலவரம்:\n\n${leadPost.title_ta || leadPost.title_en}\n\n` +
      `📞 அதிகாரப்பூர்வ உதவி / புகார்: ${helpline}\n\n` +
      `👉 தினசரி தமிழ்நாடு அரசு எச்சரிக்கைகள் & மக்கள் விழிப்புணர்வுகளுக்கு @vizhitn பக்கத்தை Follow செய்யுங்கள்!\n` +
      `📌 உங்கள் பகுதி மக்களுக்கு உதவ உடனே Save & Share செய்யுங்கள் ↗️\n\n` +
      `🌐 முழு விவரங்கள் & நேரடி அறிக்கை: https://vizhitn.in\n\n` +
      `#VizhiTN #TamilNadu #TamilReels #ReelsInstagram #ReelsViral #${(leadPost.district_slug || 'TN').replace(/[^a-zA-Z0-9]/g, '')} #TNNews`;

    await crossPostVideoToMetaSocials({
      videoFilePath: videoOutputPath,
      thumbnailFilePath: thumbnailPath,
      title: finalTitle,
      caption: metaCaption,
      isReel: true,
      isDryRun
    });
  } catch (metaErr) {
    console.warn('[META SOCIAL WARN] Meta social cross-post error:', metaErr.message);
  } finally {
    // Cleanup temp files
    const temps = [s1FramePath, s2FramePath, s3FramePath, s4FramePath, s1AudioPath, s2AudioPath, s3AudioPath, s4AudioPath, heroPhotoPath, thumbnailPath, s1SubPath, s2SubPath, s3SubPath, s4SubPath];
    for (const t of temps) {
      try { if (t && fs.existsSync(t)) fs.unlinkSync(t); } catch {}
    }
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN CIVIC SHORTS PIPELINE]:', err);
  process.exit(1);
});
