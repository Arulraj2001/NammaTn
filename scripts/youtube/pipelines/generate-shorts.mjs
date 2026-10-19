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
  const rawTitle = leadPost.title_ta || leadPost.title_en || 'முக்கிய அறிவிப்பு';
  const spokenTitle = normalizeAcronymsToSpokenTamil(rawTitle);

  const extractedNum = (leadPost.assigned_department || '').match(/(\d{4,6}[-\s]?\d*|\b1\d{3}\b)/)?.[0];
  const helplineNumber = extractedNum ||
                         ((leadPost.assigned_department || '').includes('TANGEDCO') ? '1912' :
                          (leadPost.assigned_department || '').includes('Metrowater') ? '1913' :
                          (leadPost.assigned_department || '').includes('Police') ? '103' :
                          (leadPost.assigned_department || '').includes('Civil') ? '1967' :
                          '1100');

  const deptLower = (leadPost.assigned_department || '').toLowerCase();
  const helplineVoice = extractedNum ? `உதவி எண் ${extractedNum}` :
                        deptLower.includes('tangedco') ? 'மின்வாரியம் 1912' :
                        deptLower.includes('metrowater') ? 'மெட்ரோவாட்டர் 1913' :
                        deptLower.includes('cyber') ? 'சைபர் கிரைம் 1930' :
                        deptLower.includes('police') ? 'காவல்துறை 103' :
                        'அரசு உதவி மையம் 1100';

  const now = new Date();
  const dateStr = now.toLocaleDateString('ta-IN', { day: 'numeric', month: 'short' });

  // ─── 2. SCRIPT — 3-Beat Dynamic Visual Progression ────────────────────────
  let curiosityHook = '';
  if (category === 'electricity') {
    curiosityHook = `உங்க ஏரியாவில இன்னைக்கு திடீர்னு கரண்ட் கட் ஆக போகுதா? இந்த லிஸ்ட்ல உங்க தெரு இருக்கான்னு உடனே செக் பண்ணுங்க:`;
  } else if (category === 'water-sanitation') {
    curiosityHook = `குடிநீர் விநியோகத்தில் அவசர மாற்றம்! மக்கள் கவனத்திற்கு:`;
  } else if (category === 'transport') {
    curiosityHook = `இன்னைக்கு இந்த வழித்தடத்தில் கிளம்புறவங்க உடனே கவனியுங்கள்!`;
  } else if (category === 'public-safety') {
    curiosityHook = `இந்த புது விதமான மோசடியில் பணம் போயிடாம உடனே உஷாரா இருங்க!`;
  } else if (category === 'government-schemes') {
    curiosityHook = `ரேஷன் கார்டு மற்றும் அரசு திட்டங்களில் இந்த புது ரூல்ஸ் உங்களுக்கு தெரியுமா?`;
  } else {
    curiosityHook = `${area} மக்கள் உடனே கவனியுங்கள்! உங்கள் பகுதியில் நேரடி கள அறிவிப்பு:`;
  }

  const scene1Script = [
    `${curiosityHook} ${spokenTitle}.`
  ];

  const groundDetails = leadPost.location_text ? `பாதிக்கப்பட்ட பகுதிகள்: ${leadPost.location_text}.` : '';
  const scene2Script = [
    `${area} கள நிலவரம்: ${spokenTitle}. ${groundDetails} அதிகாரிகள் துரித ஆய்வு மேற்கொண்டு வருகிறார்கள்.`
  ];

  const scene3Script = [
    `உடனடி உதவி மற்றும் புகார்களுக்கு ${helplineVoice}-ஐ அழைக்கவும்.`,
    `தமிழ்நாட்டின் அன்றாட அரசு எச்சரிக்கைகள் மற்றும் கள நிலவரங்களை உடனே பெற — இப்பவே VizhiTN-ஐ Follow பண்ணுங்க!`
  ];

  const isPublishLatest = process.argv.includes('--publish-latest');
  const seoFilename = generateSeoVideoFilename({
    title: leadPost.title_en || leadPost.title_ta || spokenTitle,
    district: leadPost.district_slug,
    area: leadPost.area_name,
    category,
    format: 'short',
    dateStr: todayIst
  });
  const videoOutputPath = path.join(outDir, seoFilename);

  const thumbBase = `thumb_short_${leadPost.slug || Date.now()}`;
  let thumbnailPath = path.join(outDir, `${thumbBase}_variantA.png`);
  let thumbnailBPath = path.join(outDir, `${thumbBase}_variantB.png`);

  let s1FramePath, s2FramePath, s3FramePath, s1AudioPath, s2AudioPath, s3AudioPath;
  let photoS1Path, photoS2Path, s1SubPath, s2SubPath, s3SubPath;

  if (isPublishLatest && fs.existsSync(videoOutputPath)) {
    console.log(`[PUBLISH LATEST ✓] Found existing verified video: ${videoOutputPath}`);
    console.log('[PUBLISH LATEST ✓] Skipping re-render and publishing directly...');
  } else {
    // ─── 3. Synthesize Audio for 3 beats ─────────────────────────────────
    console.log('[TTS] Synthesizing Beat 1 — The Hook...');
    s1AudioPath = path.join(outDir, `short_s1_audio_${Date.now()}.mp3`);
    await synthesizeSpeech(scene1Script, s1AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+5%' });
    const s1Dur = getAudioDuration(s1AudioPath);

    console.log('[TTS] Synthesizing Beat 2 — Ground Reality...');
    s2AudioPath = path.join(outDir, `short_s2_audio_${Date.now()}.mp3`);
    await synthesizeSpeech(scene2Script, s2AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
    const s2Dur = getAudioDuration(s2AudioPath);

    console.log('[TTS] Synthesizing Beat 3 — Helpline Action...');
    s3AudioPath = path.join(outDir, `short_s3_audio_${Date.now()}.mp3`);
    await synthesizeSpeech(scene3Script, s3AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
    const s3Dur = getAudioDuration(s3AudioPath);

    const totalDur = s1Dur + s2Dur + s3Dur;
    console.log(`[AUDIO] S1: ${s1Dur.toFixed(1)}s | S2: ${s2Dur.toFixed(1)}s | S3: ${s3Dur.toFixed(1)}s | Total: ${totalDur.toFixed(1)}s`);

    // ─── 4. Generate Visuals: Beat 1 Wide Scene (FLUX Variant A) & Beat 2 Forensic Proof (FLUX Variant B) ────
    const promptS1 = await generateArtDirectedVisualPrompt({
      title: rawTitle,
      category,
      aspectRatio: '9:16',
      variant: 'A'
    });
    photoS1Path = path.join(outDir, `short_s1_photo_${Date.now()}.webp`);
    let photoS1Url = await generateYouTubeSceneVisual(promptS1, photoS1Path, '9:16');
    if (!photoS1Url) {
      const localCard = path.resolve(`public/images/categories/${category}.webp`);
      photoS1Url = fs.existsSync(localCard) ? localCard : path.resolve('public/images/categories/general.webp');
    }

    const promptS2 = await generateArtDirectedVisualPrompt({
      title: rawTitle,
      category,
      aspectRatio: '9:16',
      variant: 'B'
    });
    photoS2Path = path.join(outDir, `short_s2_photo_${Date.now()}.webp`);
    let photoS2Url = await generateYouTubeSceneVisual(promptS2, photoS2Path, '9:16');
    if (!photoS2Url) {
      photoS2Url = photoS1Url;
    }

    // ─── 5. Generate High-CTR A/B Vertical Thumbnails ───────────────────────
    try {
      const pair = await generateShortsThumbnailPair({
        titleTa: leadPost.thumbnail_text || rawTitle,
        category: `${theme.icon} ${area} நேரடி நிலவரம்`,
        heroImageUrl: photoS1Url,
        outputDir: outDir,
        baseName: thumbBase
      });
      thumbnailPath = pair.variantA;
      thumbnailBPath = pair.variantB;
    } catch (e) {
      console.warn('[THUMBNAIL WARN]:', e.message);
    }

    // ─── 6. Render HTML Frames ─────────────────────────────────────────────
    const brandLogoDataUri = getBrandLogoDataUri();

    // Beat 1: Hook Frame (Wide Ground Reality with Obsidian Breaking News Card)
    const tplS1Path = path.resolve('scripts/youtube/templates/shorts/scene-1-hook.html');
    let tplS1 = fs.readFileSync(tplS1Path, 'utf-8');
    tplS1 = tplS1
      .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
      .replace('{{SCENE_PHOTO_SRC}}', toImageSource(photoS1Url))
      .replaceAll('{{HOOK_HEADLINE_TA}}', rawTitle)
      .replace('{{DATE_TEXT}}', dateStr)
      .replaceAll('{{CATEGORY_COLOR}}', theme.color)
      .replaceAll('{{CATEGORY_ICON}}', theme.icon)
      .replaceAll('{{CATEGORY_LABEL}}', theme.label)
      .replaceAll('{{DISTRICT_NAME}}', area.toUpperCase())
      .replace(/\{\{URGENCY_CLASS\}\}/g, leadPost.urgency_level === 'critical' ? 'pill-critical' :
                leadPost.urgency_level === 'high' ? 'pill-high' : 'pill-alert');

    s1FramePath = path.join(outDir, `short_s1_frame_${Date.now()}.png`);
    renderHtmlToImage(tplS1, s1FramePath, { width: 1080, height: 1920 });

    // Beat 2: Ground Reality Close-Up Evidence Plate
    const tplS2Path = path.resolve('scripts/youtube/templates/shorts/scene-broll-overlay.html');
    let tplS2 = fs.readFileSync(tplS2Path, 'utf-8');
    tplS2 = tplS2
      .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
      .replace('{{SCENE_PHOTO_SRC}}', toImageSource(photoS2Url))
      .replaceAll('{{LOCATION_TEXT}}', `${area} | தமிழ்நாடு`)
      .replaceAll('{{CATEGORY_COLOR}}', theme.color)
      .replaceAll('{{CATEGORY_ICON}}', theme.icon)
      .replaceAll('{{CATEGORY_LABEL}}', theme.label)
      .replaceAll('{{HEADLINE_TA}}', rawTitle)
      .replaceAll('{{SUBHEADLINE_TA}}', leadPost.content_ta || leadPost.content_en || groundDetails)
      .replaceAll('{{SOURCE_ATTRIBUTION}}', `துறை: ${leadPost.assigned_department || 'தமிழ்நாடு அரசு'}`);

    s2FramePath = path.join(outDir, `short_s2_frame_${Date.now()}.png`);
    renderHtmlToImage(tplS2, s2FramePath, { width: 1080, height: 1920 });

    // Beat 3: Helpline Action Card
    const tplS3Path = path.resolve('scripts/youtube/templates/shorts/scene-3-helpline.html');
    let tplS3 = fs.readFileSync(tplS3Path, 'utf-8');
    const assignedDept = (leadPost.assigned_department || 'அரசு துறை அவசர மையம்')
      .replace(/\(Helpline:.*?\)/i, '')
      .trim();

    tplS3 = tplS3
      .replaceAll('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
      .replaceAll('{{ASSIGNED_DEPT}}', assignedDept)
      .replaceAll('{{HELPLINE_NUMBER}}', helplineNumber)
      .replaceAll('{{DISTRICT_NAME}}', area.toUpperCase())
      .replaceAll('{{CATEGORY_COLOR}}', theme.color)
      .replaceAll('{{CATEGORY_ICON}}', theme.icon);

    s3FramePath = path.join(outDir, `short_s3_frame_${Date.now()}.png`);
    renderHtmlToImage(tplS3, s3FramePath, { width: 1080, height: 1920 });

    // ─── 7. Generate Millisecond-Accurate Subtitles ──────────────────────────
    s1SubPath = path.join(outDir, `short_s1_sub_${Date.now()}.ass`);
    s2SubPath = path.join(outDir, `short_s2_sub_${Date.now()}.ass`);
    s3SubPath = path.join(outDir, `short_s3_sub_${Date.now()}.ass`);

    try {
      generateAssSubtitleFile(generateCaptionsFromClauses(scene1Script, s1Dur), s1SubPath, '9:16');
      generateAssSubtitleFile(generateCaptionsFromClauses(scene2Script, s2Dur), s2SubPath, '9:16');
      generateAssSubtitleFile(generateCaptionsFromClauses(scene3Script, s3Dur), s3SubPath, '9:16');
    } catch (subErr) {
      console.log('[CAPTIONS WARN] Subtitle generation error:', subErr.message);
    }

    // ─── 8. Assemble 3-Beat Multi-Scene Short with Dynamic Motion ────────────
    const brollClip = await fetchFreeBrollClip({
      category,
      aspectRatio: '9:16',
      durationSec: totalDur
    });
    console.log(`[COMPOSER] Target SEO Video Filename: ${seoFilename}`);
    console.log('[COMPOSER] Assembling 3-Beat Civic Short with Ken Burns 30 FPS motion...');

    const isRealVideoBroll = brollClip && !brollClip.includes('procedural') && fs.existsSync(brollClip) && fs.statSync(brollClip).size > 100000;
    const scenes = [
      { imagePath: s1FramePath, videoPath: isRealVideoBroll ? brollClip : null, audioPath: s1AudioPath, durationSec: s1Dur, hasMotion: true, isLastScene: false, subtitlePath: s1SubPath },
      { imagePath: s2FramePath, videoPath: isRealVideoBroll ? brollClip : null, audioPath: s2AudioPath, durationSec: s2Dur, hasMotion: true, isLastScene: false, subtitlePath: s2SubPath },
      { imagePath: s3FramePath, videoPath: isRealVideoBroll ? brollClip : null, audioPath: s3AudioPath, durationSec: s3Dur, hasMotion: true, isLastScene: true, subtitlePath: s3SubPath }
    ];

    assembleMultiSceneShortsVideo({
      scenes,
      outputPath: videoOutputPath,
      thumbnailPath: fs.existsSync(thumbnailPath) ? thumbnailPath : undefined
    });
    console.log(`[COMPOSER] Short generated: ${videoOutputPath}`);

    // ─── 9. Automated Quality-Control (QC) Gate ─────────────────────────────
    const qcReport = runQualityControl({ videoPath: videoOutputPath, isShort: true, generateSheet: true });
    if (!qcReport.passed) {
      console.error('[QC BLOCKED] Rendered video failed broadcast quality checks. Aborting publishing.');
      process.exit(1);
    }
  }

  // ─── 10. YouTube API Quota Safety Guard ──────────────────────────────────
  const quota = checkQuotaAvailable('VIDEO_UPLOAD');
  if (!quota.allowed) {
    console.warn(`[QUOTA BLOCKED] ${quota.reason}`);
    process.exit(0);
  }

  // ─── 11. Build SEO Metadata ───────────────────────────────────────────────
  const { title: autoTitle, description: autoDesc, tags, pinnedComment: autoComment } = generateVideoMetadata({
    article: leadPost,
    script: null,
    isShort: true,
    chapterTimestamps: []
  });

  const finalTitle = (leadPost.title_ta || autoTitle).slice(0, 95);
  const finalDesc = leadPost.custom_description
    ? `🚨 ${leadPost.title_ta}\n\n${leadPost.custom_description}\n\n📞 புகார் உதவி மையம்: ${helplineNumber}\n🌐 முழு விவரங்கள்: https://vizhitn.in\n\n${(leadPost.hashtags || ['#Shorts', '#VizhiTN', '#TamilNaduNews']).join(' ')}`
    : autoDesc;

  if (isDryRun) {
    console.log('====================================================');
    console.log('[DRY RUN] Local generation completed successfully!');
    console.log(`Video output: ${videoOutputPath}`);
    console.log('[DRY RUN] Skipped YouTube upload & Meta cross-post.');
    console.log('====================================================');
    return;
  }

  // ─── 12. Upload to YouTube ────────────────────────────────────────────────
  let uploadResult = null;
  try {
    uploadResult = await uploadToYouTube({
      videoFilePath: videoOutputPath,
      title: finalTitle,
      description: finalDesc,
      tags,
      privacyStatus: 'public',
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

  // ─── 13. Cross-Post to Meta Socials (Instagram Reels & Facebook Video) ─────
  try {
    const metaCaption = `${theme.icon} ${(leadPost.district_slug || 'TN').toUpperCase()} நேரடி நிலவரம்:\n\n${leadPost.title_ta || leadPost.title_en}\n\n` +
      `📞 அதிகாரப்பூர்வ உதவி / புகார்: ${helplineNumber}\n\n` +
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
    const temps = [s1FramePath, s2FramePath, s3FramePath, s1AudioPath, s2AudioPath, s3AudioPath, photoS1Path, photoS2Path, s1SubPath, s2SubPath, s3SubPath];
    for (const t of temps) {
      try { if (t && fs.existsSync(t)) fs.unlinkSync(t); } catch {}
    }
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN CIVIC SHORTS PIPELINE]:', err);
  process.exit(1);
});
