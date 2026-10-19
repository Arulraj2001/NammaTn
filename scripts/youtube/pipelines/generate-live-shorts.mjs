// scripts/youtube/pipelines/generate-live-shorts.mjs
// Daily 01:30 PM IST Live Civic Pulse Short — Real-time ground reports from Tamil Nadu
// Dynamically pulls today's active power cuts, municipal notices, Metrowater & traffic alerts from Supabase.

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { normalizeAcronymsToSpokenTamil } from '../engine/tamil-phonetics.mjs';
import { synthesizeSpeech } from '../engine/tts-engine.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { generateYouTubeSceneVisual } from '../engine/cloudflare-visuals.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { chunkSentenceForCaptions, generateCaptionsFromClauses, generateAssSubtitleFile } from '../engine/captions-engine.mjs';
import { fetchFreeBrollClip } from '../engine/broll-fetcher.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';
import { generateShortsThumbnail } from '../engine/thumbnail-shorts-engine.mjs';
import { runQualityControl } from '../engine/qc-engine.mjs';
import { checkQuotaAvailable, recordQuotaUsage } from '../engine/quota-tracker.mjs';
import { getTodayIst } from '../engine/calendar-reader.mjs';
import { recordBroadcastSuccess, isBroadcastCompletedToday } from '../engine/broadcast-logger.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[FATAL] Missing SUPABASE environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

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

async function main() {
  console.log('====================================================');
  console.log('VizhiTN YouTube Automation — Live Civic Pulse Short (01:30 PM IST)');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const outDir = path.resolve('public/youtube_renders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const todayIst = getTodayIst();

  // Deduplication guard: Never repeat live short today unless forced
  if (!process.argv.includes('--force')) {
    const status = await isBroadcastCompletedToday('live-shorts', todayIst);
    if (status.published) {
      console.log(`[DEDUP GUARD ✓] Live Civic Short already broadcast today (${status.existingRecord?.youtube_video_id || 'recorded'}). Exiting.`);
      process.exit(0);
    }
  }

  // 1. Fetch Today's Most Urgent Live Alert from Supabase
  console.log('[DATABASE] Querying live active civic reports from Supabase...');
  const { data: posts, error } = await supabase
    .from('post')
    .select('*')
    .eq('status', 'active')
    .order('created_date', { ascending: false })
    .limit(5);

  if (error || !posts || posts.length === 0) {
    console.error('[DATABASE ERROR] No active posts found in Supabase:', error);
    process.exit(1);
  }

  // Prioritize critical/high alerts or take the freshest post
  const urgentPost = posts.find(p => p.urgency_level === 'critical' || p.urgency_level === 'high') || posts[0];

  const category = urgentPost.category_slug || 'general';
  const theme = CATEGORY_THEME[category] || CATEGORY_THEME['general'];
  const area = urgentPost.area_name || urgentPost.district_slug || 'தமிழ்நாடு';
  const district = (urgentPost.district_slug || 'chennai').toLowerCase();
  const rawTitle = urgentPost.title_ta || urgentPost.title_en || 'முக்கிய அறிவிப்பு';
  const spokenTitle = normalizeAcronymsToSpokenTamil(rawTitle);

  const helpline = (urgentPost.assigned_department || '').includes('TANGEDCO') ? 'மின்வாரியம்: 1912' :
                   (urgentPost.assigned_department || '').includes('Metrowater') ? 'மெட்ரோவாட்டர்: 1913' :
                   (urgentPost.assigned_department || '').includes('Police') ? 'காவல்துறை: 103 / 100' :
                   'உதவி மையம்: 1100 / 1912';

  console.log(`[LIVE POST] Area: "${area}" | Department: "${urgentPost.assigned_department || 'Govt'}" | Title: "${rawTitle}"`);

  // 2. Draft Spoken 3-Beat Live Script (Target: 35-45s)
  const scene1Script = [
    `${area} மக்களுக்கான நேரடி கள அறிவிப்பு! ${spokenTitle}.`
  ];

  const locInfo = urgentPost.location_text ? `பாதிக்கப்பட்ட பகுதிகள்: ${urgentPost.location_text}.` : '';
  const scene2Script = [
    `கள நிலவரம்: ${spokenTitle}. ${locInfo} அதிகாரிகள் துரித நடவடிக்கை எடுத்து வருகிறார்கள்.`
  ];

  const scene3Script = [
    `உடனடி உதவி மற்றும் புகார்களுக்கு ${helpline}-ஐ அழைக்கவும்.`,
    `தமிழ்நாட்டின் அன்றாட அரசு எச்சரிக்கைகள் மற்றும் கள நிலவரங்களை உடனே பெற — இப்பவே VizhiTN-ஐ Follow பண்ணிக்கோங்க!`
  ];

  // 3. Synthesize Speech
  console.log('[TTS] Synthesizing Scene 1 audio...');
  const s1AudioPath = path.join(outDir, `live_s1_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene1Script, s1AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
  const s1Dur = getAudioDuration(s1AudioPath);

  console.log('[TTS] Synthesizing Scene 2 audio...');
  const s2AudioPath = path.join(outDir, `live_s2_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene2Script, s2AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
  const s2Dur = getAudioDuration(s2AudioPath);

  console.log('[TTS] Synthesizing Scene 3 audio...');
  const s3AudioPath = path.join(outDir, `live_s3_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene3Script, s3AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
  const s3Dur = getAudioDuration(s3AudioPath);

  const totalDur = s1Dur + s2Dur + s3Dur;
  console.log(`[AUDIO STATS] S1: ${s1Dur.toFixed(1)}s, S2: ${s2Dur.toFixed(1)}s, S3: ${s3Dur.toFixed(1)}s | Total: ${totalDur.toFixed(1)}s`);

  // 4. Generate Visuals & Thumbnail
  const heroPhotoPath = path.join(outDir, `live_flux_hero_${Date.now()}.webp`);
  let heroPhotoUrl = await generateYouTubeSceneVisual(
    `Tamil Nadu public civic infrastructure alert in ${area}, realistic photojournalism style`,
    heroPhotoPath,
    '9:16'
  );

  if (!heroPhotoUrl) {
    const localCard = path.resolve(`public/images/categories/${category}.webp`);
    heroPhotoUrl = fs.existsSync(localCard) ? localCard : path.resolve('public/images/categories/general.webp');
  }

  const thumbPath = path.join(outDir, `live_thumb_${Date.now()}.png`);
  try {
    await generateShortsThumbnail({
      titleTa: rawTitle,
      category: `${theme.icon} ${area} நேரடி நிலவரம்`,
      heroImageUrl: heroPhotoUrl,
      outputPath: thumbPath
    });
  } catch (err) {
    console.warn('[THUMBNAIL WARN] Could not generate thumbnail:', err.message);
  }

  // 5. Render HTML Frames
  const brandLogoDataUri = getBrandLogoDataUri();
  const tplS1Path = path.resolve('scripts/youtube/templates/shorts/scene-1-hook.html');
  let tplS1 = fs.readFileSync(tplS1Path, 'utf-8');
  tplS1 = tplS1
    .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
    .replace('{{CATEGORY_COLOR}}', theme.color)
    .replace('{{CATEGORY_ICON}}', theme.icon)
    .replace('{{CATEGORY_LABEL}}', `${area.toUpperCase()} LIVE ALERT`)
    .replace('{{ALERT_HOOK_TA}}', rawTitle)
    .replace('{{HERO_IMAGE_SRC}}', heroPhotoUrl)
    .replace('{{DISTRICT_BADGE}}', area.toUpperCase())
    .replace('{{AREA_BADGE}}', 'LIVE UPDATE')
    .replace('{{DATE_TIME_STRING}}', new Date().toLocaleDateString('ta-IN', { day: 'numeric', month: 'short' }));

  const s1FramePath = path.join(outDir, `live_s1_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS1, s1FramePath, { width: 1080, height: 1920 });

  const tplS2Path = path.resolve('scripts/youtube/templates/shorts/scene-2-breakdown.html');
  let tplS2 = fs.readFileSync(tplS2Path, 'utf-8');
  tplS2 = tplS2
    .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
    .replace('{{CATEGORY_COLOR}}', theme.color)
    .replace('{{CATEGORY_ICON}}', theme.icon)
    .replace('{{CATEGORY_LABEL}}', theme.label)
    .replace('{{BREAKDOWN_HEADING_TA}}', 'பாதிக்கப்பட்ட பகுதிகள் & கள விவரங்கள்')
    .replace('{{BREAKDOWN_BODY_TA}}', urgentPost.content_ta || urgentPost.content_en || locInfo)
    .replace('{{MAP_LOCATION_LABEL}}', urgentPost.location_text || area)
    .replace('{{IMPACT_SEVERITY_BADGE}}', (urgentPost.urgency_level || 'HIGH').toUpperCase());

  const s2FramePath = path.join(outDir, `live_s2_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS2, s2FramePath, { width: 1080, height: 1920 });

  const tplS3Path = path.resolve('scripts/youtube/templates/shorts/scene-3-helpline.html');
  let tplS3 = fs.readFileSync(tplS3Path, 'utf-8');
  tplS3 = tplS3
    .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
    .replace('{{CATEGORY_COLOR}}', theme.color)
    .replace('{{CATEGORY_ICON}}', theme.icon)
    .replace('{{CATEGORY_LABEL}}', theme.label)
    .replace('{{HELPLINE_PHONE}}', helpline)
    .replace('{{OFFICIAL_PORTAL_URL}}', 'vizhitn.in')
    .replace('{{CTA_PUNCHLINE_TA}}', 'உங்க ஏரியாலயும் இது நடக்குதா? vizhitn.in-ல நேரடியா report பண்ணுங்க!')
    .replace('{{DEPARTMENT_NAME_EN}}', urgentPost.assigned_department || 'Tamil Nadu Civic Administration');

  const s3FramePath = path.join(outDir, `live_s3_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS3, s3FramePath, { width: 1080, height: 1920 });

  // 6. Subtitles
  const s1SubPath = path.join(outDir, `live_s1_sub_${Date.now()}.ass`);
  const s2SubPath = path.join(outDir, `live_s2_sub_${Date.now()}.ass`);
  const s3SubPath = path.join(outDir, `live_s3_sub_${Date.now()}.ass`);

  generateAssSubtitleFile(generateCaptionsFromClauses(scene1Script, s1Dur), s1SubPath, '9:16');
  generateAssSubtitleFile(generateCaptionsFromClauses(scene2Script, s2Dur), s2SubPath, '9:16');
  generateAssSubtitleFile(generateCaptionsFromClauses(scene3Script, s3Dur), s3SubPath, '9:16');

  // 7. Video Assembly
  const brollClip = await fetchFreeBrollClip(category, outDir, '9:16');
  const videoOutputPath = path.join(outDir, `vizhitn_live_short_${Date.now()}.mp4`);

  const scenes = [
    { imagePath: s1FramePath, videoPath: brollClip, audioPath: s1AudioPath, durationSec: s1Dur, hasMotion: true, isLastScene: false, subtitlePath: s1SubPath },
    { imagePath: s2FramePath, videoPath: brollClip, audioPath: s2AudioPath, durationSec: s2Dur, hasMotion: true, isLastScene: false, subtitlePath: s2SubPath },
    { imagePath: s3FramePath, videoPath: brollClip, audioPath: s3AudioPath, durationSec: s3Dur, hasMotion: true, isLastScene: true, subtitlePath: s3SubPath }
  ];

  assembleMultiSceneShortsVideo({
    scenes,
    outputPath: videoOutputPath,
    thumbnailPath: fs.existsSync(thumbPath) ? thumbPath : undefined
  });

  // 8. QC & Quota Checks
  const qcReport = runQualityControl({ videoPath: videoOutputPath, isShort: true, generateSheet: true });
  if (!qcReport.passed) {
    console.error('[QC BLOCKED] Video failed broadcast quality checks. Aborting publishing.');
    process.exit(1);
  }

  const quota = checkQuotaAvailable('VIDEO_UPLOAD');
  if (!quota.allowed) {
    console.warn(`[QUOTA BLOCKED] ${quota.reason}`);
    process.exit(0);
  }

  // 9. SEO Metadata & YouTube Upload
  const ytTitle = `🚨 ${area} Live: ${rawTitle}`.slice(0, 95);
  const ytDesc = `⚡ ${area} நேரடி கள நிலவரம் & அதிகாரப்பூர்வ அறிவிப்பு:\n\n${rawTitle}\n\n` +
    `📍 விவரங்கள்: ${urgentPost.content_ta || urgentPost.content_en}\n` +
    `📞 அதிகாரப்பூர்வ உதவி: ${helpline}\n\n` +
    `🔴 உங்கள் ஏரியாவிலும் இந்த பிரச்சனை உள்ளதா? vizhitn.in இணையதளத்தில் நேரடியாக பதிவு செய்யுங்கள்!\n\n` +
    `🌐 முழு விவரங்கள்: https://vizhitn.in\n\n` +
    `#TamilShorts #VizhiTN #${area.replace(/\s+/g, '')} #TamilNaduNews #CivicAlert #Shorts`;

  const tags = ['VizhiTN', area, district, 'Tamil Nadu Civic Alert', 'Breaking News Tamil', 'Shorts', theme.label];

  let uploadResult = null;
  try {
    uploadResult = await uploadToYouTube({
      videoFilePath: videoOutputPath,
      title: ytTitle,
      description: ytDesc,
      tags,
      privacyStatus: isDryRun ? 'unlisted' : 'public',
      isShort: true
    });

    if (uploadResult?.videoId && !uploadResult.dryRun) {
      recordQuotaUsage('VIDEO_UPLOAD', { videoId: uploadResult.videoId, title: ytTitle });
      await recordBroadcastSuccess({
        broadcastDate: todayIst,
        format: 'live-shorts',
        timeIst: '01:30 PM',
        title: ytTitle,
        youtubeVideoId: uploadResult.videoId,
        youtubeUrl: uploadResult.videoUrl,
        metadata: { district, category }
      });

      if (fs.existsSync(thumbPath)) {
        await setYouTubeThumbnail(uploadResult.videoId, thumbPath);
      }
      await postPinnedComment(
        uploadResult.videoId,
        `🚨 ${area} மக்கள் கவனத்திற்கு! இந்த பிரச்சனை உங்க ஏரியாலயும் இருந்தா vizhitn.in-ல report பண்ணுங்க 👇\n🔴 vizhitn.in`
      );
    }

    console.log('====================================================');
    console.log('LIVE CIVIC SHORT BROADCASTED SUCCESSFULLY!');
    console.log('Video URL:', uploadResult?.videoUrl || 'N/A');
    console.log('====================================================');
  } catch (ytErr) {
    console.warn('[YOUTUBE WARN] YouTube upload encountered an issue:', ytErr.message);
  }

  // 10. Cross-Post to Meta Socials (Instagram Reels & Facebook Video) - ALWAYS EXECUTED
  try {
    const metaCaption = `🚨 ${area} நேரடி எச்சரிக்கை: ${rawTitle}\n\n` +
      `📍 கள நிலவரம்: ${urgentPost.content_ta || urgentPost.content_en}\n` +
      `📞 உதவி மையம் / புகார்: ${helpline}\n\n` +
      `👉 தினசரி தமிழ்நாடு அரசு எச்சரிக்கைகள் & கள நிலவரங்களை உடனே தெரிந்து கொள்ள @vizhitn பக்கத்தை Follow செய்யுங்கள்!\n` +
      `📌 உங்கள் பகுதி மக்களுக்கு உதவ உடனே Save & Share செய்யுங்கள் ↗️\n\n` +
      `🌐 உங்கள் பகுதி பிரச்சனையை நீங்களே பதிவு செய்ய: https://vizhitn.in\n\n` +
      `#VizhiTN #TamilNadu #${area.replace(/\s+/g, '')} #TamilReels #ReelsInstagram #ReelsViral #TNNews #Chennai #CivicAlert`;

    await crossPostVideoToMetaSocials({
      videoFilePath: videoOutputPath,
      thumbnailFilePath: thumbPath,
      title: ytTitle,
      caption: metaCaption,
      isReel: true,
      isDryRun
    });
  } catch (metaErr) {
    console.warn('[META SOCIAL WARN] Meta social cross-post error:', metaErr.message);
  } finally {
    // Cleanup temp files
    const temps = [s1FramePath, s2FramePath, s3FramePath, s1AudioPath, s2AudioPath, s3AudioPath, heroPhotoPath, thumbPath, s1SubPath, s2SubPath, s3SubPath];
    for (const t of temps) {
      try { if (fs.existsSync(t)) fs.unlinkSync(t); } catch {}
    }
  }
}

main().catch(err => {
  console.error('[FATAL LIVE SHORTS ERROR]:', err);
  process.exit(1);
});
