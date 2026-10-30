// scripts/youtube/pipelines/generate-shorts.mjs
// Daily Civic Lifeline Alert Short — Hook → Truth → Power structure
// Narrator persona: "Kavitha" | Category-specific visuals | SEO metadata engine

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { normalizeAcronymsToSpokenTamil, splitIntoSpokenClauses } from '../engine/tamil-phonetics.mjs';
import { generateVideoMetadata, getCategoryFluxPrompt, generateArtDirectedVisualPrompt } from '../engine/script-writer.mjs';
import { synthesizeSpeech } from '../engine/tts-engine.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { generateYouTubeSceneVisual, generateProceduralBackdrop, toImageSource } from '../engine/cloudflare-visuals.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';
import { generateShortsThumbnail, generateShortsThumbnailPair } from '../engine/thumbnail-shorts-engine.mjs';
import { generateSeoVideoFilename } from '../engine/seo-filename.mjs';
import { fetchFreeBrollClip } from '../engine/broll-fetcher.mjs';
import { chunkSentenceForCaptions, generateCaptionsFromClauses, generateAssSubtitleFile, generateKaraokeCaptions } from '../engine/captions-engine.mjs';
import { runQualityControl } from '../engine/qc-engine.mjs';
import { checkQuotaAvailable, recordQuotaUsage } from '../engine/quota-tracker.mjs';
import { getScheduledUploadForSlot, getTodayIst, getEpisodeFromDatabase, updateEpisodeStatusInDb } from '../engine/calendar-reader.mjs';
import { recordBroadcastSuccess, isBroadcastCompletedToday } from '../engine/broadcast-logger.mjs';
import { resolveTrendingPillarTopic } from '../engine/trend-search-engine.mjs';
import { generateVerifiedFourSceneScript } from '../engine/four-scene-writer.mjs';

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

/**
 * Generates unique AI-written 3-beat Tamil script for each Short via Gemini.
 * Falls back to hardcoded template strings if API is unavailable.
 */
async function generateAIShortScript({ title, area, category, helplineVoice, assigned_department, location_text, content_ta }) {
  const apiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `நீ VizhiTN என்ற தமிழ்நாடு மக்கள் புலனாய்வு மற்றும் உண்மை செய்தி ஊடகத்தின் தலைமை Shorts scriptwriter.
தமிழ்நாடு மக்கள் சட்டென நின்று பார்க்கக்கூடிய அதிவேக 15-18 வினாடி Viral Civic Alert Script எழுது.

தகவல்கள்:
தலைப்பு: "${title}"
பகுதி: ${area}
வகை: ${category}
துறை: ${assigned_department || 'தமிழ்நாடு அரசு'}
ஸ்தலம்: ${location_text || area}
உள்ளடக்கம்: ${content_ta || title}
ஹெல்ப்லைன்: ${helplineVoice}

★ Viral Retention Constitution (Strict Enforcement):
1. Beat 1 Hook (0-2s): முதல் 2 வினாடிகளில் பார்வையாளரை திடுக்கிட வைக்கும் நேரடி உள்ளூர் எச்சரிக்கை. (எ.கா: "${area}-ல இருக்கிறவங்க கவனத்திற்கு!", "நாளைக்கு காலைல இந்த ரோட்ல போறவங்க ஜாக்கிரதை!", "உங்க ஏரியாவில இன்னைக்கு கரண்ட் கட் இருக்கான்னு செக் பண்ணுங்க!"). போலி முழக்கங்கள் அல்லது 'ஏன்னு தெரியுமா' போன்ற பழைய வாக்கியங்கள் வேண்டாம்.
2. Beat 2 Ground Reality (2-10s): எங்கு, என்ன பிரச்சனை, என்ன நேரம் என்பதை மிகத் தெளிவாக, ஒரு மூச்சில் சொல்லக்கூடிய எளிய பேச்சுத் தமிழில் (Colloquial Tamil) விவரி. (7-12 வார்த்தைகள்).
3. Beat 3 Immediate Action & Follow/Subscribe Command (10-18s): உதவி எண்ணை தெளிவாகச் சொல்லி, பின் 'இது போன்ற தினசரி தமிழ்நாடு எச்சரிக்கைகளுக்கு இப்போதே VizhiTN-ஐ Follow மற்றும் Subscribe பண்ணுங்க!' என்று அதிகாரப்பூர்வமாக கூறி, பின் 'உங்க ஏரியாவிலும் இந்த பிரச்சனையா? கமெண்ட்ல சொல்லுங்க!' என்ற கேள்வியோடு முடி. (கட்டாயம்: 'VizhiTN-ஐ Follow மற்றும் Subscribe பண்ணுங்க' என்ற வார்த்தைகள் விடுபடவே கூடாது!).

JSON மட்டும் திரும்ப அனுப்பு:
{"beat1": "...", "beat2": "...", "beat3": "..."}`.trim();

    // Try candidate models in reliability order
    const CANDIDATES = [
      'gemini-flash-latest',
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite-preview',
      'gemini-3-flash-preview',
      'gemini-pro-latest'
    ];
    let raw = '';

    for (const model of CANDIDATES) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          generationConfig: { responseMimeType: 'application/json', temperature: 0.6, maxOutputTokens: 512 }
        });
        raw = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (raw) break;
      } catch (modelErr) {
        console.warn(`[AI SCRIPT] Model ${model} failed: ${modelErr.message.slice(0, 60)}`);
      }
    }
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    if (parsed.beat1 && parsed.beat2 && parsed.beat3) {
      console.log('[AI SCRIPT] Unique Gemini-written 3-beat script generated.');
      return parsed;
    }
  } catch (err) {
    console.warn(`[AI SCRIPT WARN] Gemini script failed — using template fallback: ${err.message}`);
  }
  return null;
}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN — Daily Civic Alert Short (Hook → Truth → Power)');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const outDir = path.resolve('public/youtube_renders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const todayIst = getTodayIst();

  // Deduplication Guard: Never upload duplicate short for today's slot unless forced (bypassed in dry-run)
  if (!process.argv.includes('--force') && !isDryRun) {
    const status = await isBroadcastCompletedToday('civic-shorts', todayIst);
    if (status.published) {
      console.log(`[DEDUP GUARD ✓] Daily Civic Short already broadcast today (${status.existingRecord?.youtube_video_id || 'recorded'}). Exiting.`);
      process.exit(0);
    }
  }

  // 1. Source topic from Slot Argument, Pillar Argument, 90-Day Calendar, or fallback to active posts in Supabase
  const slotArg = process.argv.find(a => a.startsWith('--slot='))?.split('=')[1];
  const pillarArg = process.argv.find(a => a.startsWith('--pillar='))?.split('=')[1];
  const calEntry = getScheduledUploadForSlot('civic-shorts', todayIst);
  let leadPost;
  let posts = [];

  if (slotArg === 'power-cut') {
    console.log('[DATABASE] Sourcing real active power cut report from Supabase...');
    const { data: powerPosts, error } = await supabase
      .from('post')
      .select('*')
      .eq('category_slug', 'electricity')
      .eq('status', 'active')
      .order('created_date', { ascending: false })
      .limit(5);

    if (!error && powerPosts && powerPosts.length > 0) {
      leadPost = powerPosts[0];
      posts = powerPosts;
      console.log(`[DATABASE ✓] Selected verified power cut: "${leadPost.title_ta}" (${leadPost.district_slug})`);
    }
  } else if (slotArg === 'cyber-scam') {
    console.log('[DATABASE] Sourcing real active scam advisory from Supabase...');
    const { data: scamPosts, error } = await supabase
      .from('post')
      .select('*')
      .eq('category_slug', 'public-safety')
      .eq('status', 'active')
      .ilike('title_ta', '%மோசடி%')
      .order('created_date', { ascending: false })
      .limit(5);

    if (!error && scamPosts && scamPosts.length > 0) {
      leadPost = scamPosts[0];
      posts = scamPosts;
      console.log(`[DATABASE ✓] Selected verified scam advisory: "${leadPost.title_ta}" (${leadPost.district_slug})`);
    } else {
      // Fallback to any public-safety alert
      const { data: anySafety } = await supabase
        .from('post')
        .select('*')
        .eq('category_slug', 'public-safety')
        .eq('status', 'active')
        .order('created_date', { ascending: false })
        .limit(1);
      if (anySafety && anySafety.length > 0) {
        leadPost = anySafety[0];
        posts = anySafety;
      }
    }
  }

  if (!leadPost && pillarArg) {
    console.log(`[TREND ENGINE] Sourcing live trending topic for high-retention pillar: "${pillarArg}"...`);
    const trendingTopic = await resolveTrendingPillarTopic(pillarArg);
    console.log(`[TREND ENGINE ✓] Selected topic: "${trendingTopic.titleTa}" (Live Grounding: ${trendingTopic.isLiveGrounding})`);

    leadPost = {
      title_ta: trendingTopic.titleTa,
      title_en: trendingTopic.titleEn,
      content_ta: trendingTopic.realityBeat,
      content_en: trendingTopic.realityBeat,
      area_name: 'தமிழ்நாடு முழுவதும்',
      district_slug: 'tamil-nadu',
      category_slug: pillarArg === 'utility' ? 'electricity' : pillarArg === 'scam' ? 'public-safety' : pillarArg === 'scheme' ? 'government-schemes' : 'general',
      assigned_department: trendingTopic.helpline,
      custom_tags: trendingTopic.tags,
      spoken_hook: trendingTopic.spokenHook,
      reality_beat: trendingTopic.realityBeat,
      solution_beat: trendingTopic.solutionBeat,
      cta_url: trendingTopic.ctaUrl,
      slug: trendingTopic.id
    };
    posts = [leadPost];
  } else if (!leadPost && calEntry) {
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
  } else if (!leadPost) {
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

  // ─── 2. SCRIPT — Verified 4-Scene Script Generator with 7 Validation Gates ──
  const detectedSlotType = (category === 'electricity' || (leadPost.title_en || leadPost.title_ta || '').toLowerCase().includes('power cut')) ? 'power_cut' :
                           (category === 'public-safety' || (leadPost.title_en || leadPost.title_ta || '').toLowerCase().includes('scam') || (leadPost.title_en || leadPost.title_ta || '').toLowerCase().includes('மோசடி')) ? 'cyber_scam' : 'civic';

  console.log(`[4-SCENE ENGINE] Generating verified 4-scene script for slot: "${detectedSlotType}"...`);
  const fourSceneResult = await generateVerifiedFourSceneScript({
    sourceData: leadPost,
    slotType: detectedSlotType,
    outDir
  });

  if (!fourSceneResult) {
    console.warn(`[SHORTS ENGINE] Video generation skipped due to fact check failure or validation errors.`);
    return;
  }

  const { script: script4, validation: validationReport, auditPath } = fourSceneResult;
  console.log(`[4-SCENE ENGINE ✓] Script validated against 7 gates. Audit: ${auditPath}`);

  const scene1Script = script4.scene1_hook;
  const scene2Script = script4.scene2_facts;
  const scene3Script = script4.scene3_actions;
  const scene4Script = script4.scene4_help_cta;

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

  let s1FramePath, s2FramePath, s3FramePath, s4FramePath;
  let s1AudioPath, s2AudioPath, s3AudioPath, s4AudioPath;
  let photoS1Path, photoS2Path, photoS3Path, photoS4Path;
  let s1SubPath, s2SubPath, s3SubPath, s4SubPath;

  if (isPublishLatest && fs.existsSync(videoOutputPath)) {
    console.log(`[PUBLISH LATEST ✓] Found existing verified video: ${videoOutputPath}`);
    console.log('[PUBLISH LATEST ✓] Skipping re-render and publishing directly...');
  } else {
    // ─── 3. Synthesize Audio for 4 scenes ────────────────────────────────
    console.log('[TTS] Synthesizing Scene 1 — The Hook (0-4s)...');
    s1AudioPath = path.join(outDir, `short_s1_audio_${Date.now()}.mp3`);
    const s1Tts = await synthesizeSpeech(scene1Script, s1AudioPath, {
      voice: YOUTUBE_CONFIG.voices.tamilFemale,
      rate: YOUTUBE_CONFIG.voices.shortsRate,
      pitch: YOUTUBE_CONFIG.voices.shortsPitch,
      mode: 'short'
    });
    const s1Dur = getAudioDuration(s1AudioPath);
    const s1TimedSegs = s1Tts.timedSegments || [];

    console.log('[TTS] Synthesizing Scene 2 — Facts (4-18s)...');
    s2AudioPath = path.join(outDir, `short_s2_audio_${Date.now()}.mp3`);
    const s2Tts = await synthesizeSpeech(scene2Script, s2AudioPath, {
      voice: YOUTUBE_CONFIG.voices.tamilFemale,
      rate: YOUTUBE_CONFIG.voices.shortsRate,
      pitch: YOUTUBE_CONFIG.voices.shortsPitch,
      mode: 'short'
    });
    const s2Dur = getAudioDuration(s2AudioPath);
    const s2TimedSegs = s2Tts.timedSegments || [];

    console.log('[TTS] Synthesizing Scene 3 — What To Do (18-29s)...');
    s3AudioPath = path.join(outDir, `short_s3_audio_${Date.now()}.mp3`);
    const s3Tts = await synthesizeSpeech(scene3Script, s3AudioPath, {
      voice: YOUTUBE_CONFIG.voices.tamilFemale,
      rate: YOUTUBE_CONFIG.voices.shortsRate,
      pitch: YOUTUBE_CONFIG.voices.shortsPitch,
      mode: 'short'
    });
    const s3Dur = getAudioDuration(s3AudioPath);
    const s3TimedSegs = s3Tts.timedSegments || [];

    console.log('[TTS] Synthesizing Scene 4 — Helpline + CTA (29-37s)...');
    s4AudioPath = path.join(outDir, `short_s4_audio_${Date.now()}.mp3`);
    const s4Tts = await synthesizeSpeech(scene4Script, s4AudioPath, {
      voice: YOUTUBE_CONFIG.voices.tamilFemale,
      rate: YOUTUBE_CONFIG.voices.shortsRate,
      pitch: YOUTUBE_CONFIG.voices.shortsPitch,
      mode: 'short'
    });
    const s4Dur = getAudioDuration(s4AudioPath);
    const s4TimedSegs = s4Tts.timedSegments || [];

    const totalDur = s1Dur + s2Dur + s3Dur + s4Dur;
    console.log(`[AUDIO 4-SCENE] S1: ${s1Dur.toFixed(1)}s | S2: ${s2Dur.toFixed(1)}s | S3: ${s3Dur.toFixed(1)}s | S4: ${s4Dur.toFixed(1)}s | Total: ${totalDur.toFixed(1)}s`);

    // ─── 4. Generate Visuals: Variant A (Hook) & Variant B (Evidence) ────
    const promptS1 = await generateArtDirectedVisualPrompt({
      title: rawTitle,
      category,
      aspectRatio: '9:16',
      variant: 'A'
    });
    photoS1Path = path.join(outDir, `short_s1_photo_${Date.now()}.webp`);
    let photoS1Url = await generateYouTubeSceneVisual(promptS1, photoS1Path, '9:16');
    if (!photoS1Url) {
      photoS1Url = generateProceduralBackdrop(path.join(outDir, `short_s1_proc_${Date.now()}.png`));
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
      photoS2Url = generateProceduralBackdrop(path.join(outDir, `short_s2_proc_${Date.now()}.png`));
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

    // ─── 6. Render HTML Frames for all 4 Scenes ────────────────────────────
    const brandLogoDataUri = getBrandLogoDataUri();
    const fontsDir = path.resolve('public/fonts').replace(/\\/g, '/');

    // Scene 1: Hook Frame
    const tplS1Path = path.resolve('scripts/youtube/templates/shorts/scene-1-hook.html');
    let tplS1 = fs.readFileSync(tplS1Path, 'utf-8');
    const onScreenBannerHtml = script4.scene1_overlay
      ? `<div style="background:#eab308;color:#000;font-size:28px;font-weight:900;padding:12px 24px;border-radius:14px;display:inline-block;margin-bottom:14px;letter-spacing:-0.5px;">${script4.scene1_overlay}</div>`
      : '';
    tplS1 = tplS1
      .replace('{{FONTS_DIR}}', fontsDir)
      .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
      .replace('{{SCENE_PHOTO_SRC}}', toImageSource(photoS1Url))
      .replace('{{ON_SCREEN_BANNER_HTML}}', onScreenBannerHtml)
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

    // Scene 2: Facts Frame
    const tplS2Path = path.resolve('scripts/youtube/templates/shorts/scene-2-facts.html');
    let tplS2 = fs.readFileSync(tplS2Path, 'utf-8');
    const timingMatch = (leadPost.content_ta || leadPost.title_ta || '').match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM|காலை|மதியம்|முதல்)?\s*[-–toமுதல்]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|மணி)?)/i);
    const timingText = timingMatch ? timingMatch[0] : (detectedSlotType === 'power_cut' ? 'காலை 9:00 முதல் மதியம் 2:00 வரை' : 'இன்றைய உடனடி கள நிலவரம்');

    tplS2 = tplS2
      .replaceAll('{{FONTS_DIR}}', fontsDir)
      .replaceAll('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
      .replaceAll('{{SCENE_PHOTO_SRC}}', toImageSource(photoS2Url))
      .replaceAll('{{ON_SCREEN_TEXT}}', script4.scene2_overlay || 'முக்கிய விவரங்கள்')
      .replaceAll('{{FACT_TIMING_OR_BADGE}}', timingText)
      .replaceAll('{{FACT_LEAD_SUMMARY}}', rawTitle)
      .replaceAll('{{FACT_DETAILS}}', (leadPost.location_text || leadPost.area_name || area) + ' — ' + (leadPost.content_ta || leadPost.content_en || 'அதிகாரப்பூர்வ துறை தகவல்'));

    s2FramePath = path.join(outDir, `short_s2_frame_${Date.now()}.png`);
    renderHtmlToImage(tplS2, s2FramePath, { width: 1080, height: 1920 });

    // Scene 3: What To Do Action Frame
    const tplS3Path = path.resolve('scripts/youtube/templates/shorts/scene-3-actions.html');
    let tplS3 = fs.readFileSync(tplS3Path, 'utf-8');
    const actionSentences = script4.scene3_actions.split(/[.!]\s+/).filter(Boolean);
    const step1 = actionSentences[0] || (detectedSlotType === 'power_cut' ? 'மொபைல் மற்றும் இன்வெர்ட்டரை உடனே சார்ஜ் செய்யவும்' : 'போலி SMS லிங்குகளை ஒருபோதும் தொடாதீர்கள்');
    const step2 = actionSentences[1] || (detectedSlotType === 'power_cut' ? 'தேவையான குடிநீரை முன்கூட்டியே சேமித்து வைக்கவும்' : 'OTP அல்லது ஏடிஎம் PIN எண்ணை யாரிடமும் பகிராதீர்கள்');
    const step3 = actionSentences[2] || (detectedSlotType === 'power_cut' ? 'மின் தடைக்கு முன் முக்கியமான பணிகளை முடிக்கவும்' : 'அந்த சந்தேகத்திற்குரிய எண்ணை உடனே Block செய்யவும்');

    tplS3 = tplS3
      .replaceAll('{{FONTS_DIR}}', fontsDir)
      .replaceAll('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
      .replaceAll('{{SCENE_PHOTO_SRC}}', toImageSource(photoS2Url))
      .replaceAll('{{ON_SCREEN_TEXT}}', script4.scene3_overlay || 'செய்ய வேண்டிய முக்கிய படிகள்')
      .replaceAll('{{ACTION_STEP_1}}', step1)
      .replaceAll('{{ACTION_STEP_2}}', step2)
      .replaceAll('{{ACTION_STEP_3}}', step3);

    s3FramePath = path.join(outDir, `short_s3_frame_${Date.now()}.png`);
    renderHtmlToImage(tplS3, s3FramePath, { width: 1080, height: 1920 });

    // Scene 4: Helpline + Single CTA Subscribe Frame
    const tplS4Path = path.resolve('scripts/youtube/templates/shorts/scene-4-helpline.html');
    let tplS4 = fs.readFileSync(tplS4Path, 'utf-8');
    const assignedDept = (leadPost.assigned_department || 'அரசு துறை அவசர மையம்')
      .replace(/\(Helpline:.*?\)/i, '')
      .trim();

    tplS4 = tplS4
      .replaceAll('{{FONTS_DIR}}', fontsDir)
      .replaceAll('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
      .replaceAll('{{ON_SCREEN_TEXT}}', script4.scene4_overlay || `ஹெல்ப்லைன்: ${helplineNumber} | Subscribe`)
      .replaceAll('{{ASSIGNED_DEPT}}', assignedDept)
      .replaceAll('{{HELPLINE_NUMBER}}', helplineNumber)
      .replaceAll('{{DISTRICT_NAME}}', area.toUpperCase())
      .replaceAll('{{CATEGORY_COLOR}}', theme.color)
      .replaceAll('{{CATEGORY_ICON}}', theme.icon);

    s4FramePath = path.join(outDir, `short_s4_frame_${Date.now()}.png`);
    renderHtmlToImage(tplS4, s4FramePath, { width: 1080, height: 1920 });

    // ─── 7. Kinetic Karaoke Subtitles for All 4 Scenes ─────────────────────
    s1SubPath = path.join(outDir, `short_s1_sub_${Date.now()}.ass`);
    s2SubPath = path.join(outDir, `short_s2_sub_${Date.now()}.ass`);
    s3SubPath = path.join(outDir, `short_s3_sub_${Date.now()}.ass`);
    s4SubPath = path.join(outDir, `short_s4_sub_${Date.now()}.ass`);

    if (s1TimedSegs && s1TimedSegs.length > 0) {
      generateKaraokeCaptions(s1TimedSegs, s1SubPath, '9:16');
    } else {
      generateAssSubtitleFile(generateCaptionsFromClauses(scene1Script, s1Dur), s1SubPath, '9:16');
    }

    if (s2TimedSegs && s2TimedSegs.length > 0) {
      generateKaraokeCaptions(s2TimedSegs, s2SubPath, '9:16');
    } else {
      generateAssSubtitleFile(generateCaptionsFromClauses(scene2Script, s2Dur), s2SubPath, '9:16');
    }

    if (s3TimedSegs && s3TimedSegs.length > 0) {
      generateKaraokeCaptions(s3TimedSegs, s3SubPath, '9:16');
    } else {
      generateAssSubtitleFile(generateCaptionsFromClauses(scene3Script, s3Dur), s3SubPath, '9:16');
    }

    if (s4TimedSegs && s4TimedSegs.length > 0) {
      generateKaraokeCaptions(s4TimedSegs, s4SubPath, '9:16');
    } else {
      generateAssSubtitleFile(generateCaptionsFromClauses(scene4Script, s4Dur), s4SubPath, '9:16');
    }

    // ─── 8. Assemble 4-Scene Multi-Scene Short with Dynamic Motion ─────────
    const categoryKws = {
      'electricity': ['power lines transmission tower', 'electrician substation work', 'emergency phone helpline call', 'subscribe button phone notification'],
      'water-sanitation': ['water pipe street repair', 'drinking water tap flow', 'person calling helpline phone', 'phone notification bell alert'],
      'road-infrastructure': ['highway traffic india aerial', 'road pothole repair work', 'emergency phone call help', 'phone notification alert'],
      'transport': ['metro train station platform', 'city bus traffic street', 'person calling phone help', 'phone notification bell'],
      'public-safety': ['police car emergency lights', 'cyber security computer screen', 'emergency helpline phone', 'phone screen notification bell'],
      'healthcare': ['hospital corridor doctor', 'medicine pharmacy clinic', 'ambulance emergency phone', 'phone alert bell'],
      'education': ['school classroom students', 'college exam writing', 'phone helpline guidance', 'phone notification'],
      'agriculture': ['paddy field farmer india', 'irrigation canal water', 'farmer phone helpline', 'phone notification bell'],
      'environment': ['river lake nature clean', 'tree plantation workers', 'environmental phone report', 'phone alert'],
      'government-schemes': ['government office documents', 'ration card distribution queue', 'helpline phone call', 'phone notification bell'],
      'local-development': ['building construction crane', 'urban road infrastructure', 'municipal phone helpline', 'phone alert'],
      'general': ['indian city street crowd', 'government office public', 'emergency helpline phone call', 'phone notification bell']
    };
    const kwSet = categoryKws[category] || categoryKws['general'];

    const [brollS1, brollS2, brollS3, brollS4] = await Promise.all([
      fetchFreeBrollClip({ category, aspectRatio: '9:16', durationSec: s1Dur, query: kwSet[0] }),
      fetchFreeBrollClip({ category, aspectRatio: '9:16', durationSec: s2Dur, query: kwSet[1] }),
      fetchFreeBrollClip({ category, aspectRatio: '9:16', durationSec: s3Dur, query: kwSet[2] }),
      fetchFreeBrollClip({ category, aspectRatio: '9:16', durationSec: s4Dur, query: kwSet[3] || kwSet[2] })
    ]);

    const isValidBroll = (p) => p && !p.includes('procedural') && fs.existsSync(p) && fs.statSync(p).size > 100000;
    console.log(`[COMPOSER] Target SEO Video Filename: ${seoFilename}`);
    console.log('[COMPOSER] Assembling Verified 4-Scene Civic Short with Dynamic Karaoke Subtitles...');

    const scenes = [
      { imagePath: s1FramePath, videoPath: isValidBroll(brollS1) ? brollS1 : null, audioPath: s1AudioPath, durationSec: s1Dur, hasMotion: true, isLastScene: false, subtitlePath: s1SubPath },
      { imagePath: s2FramePath, videoPath: isValidBroll(brollS2) ? brollS2 : null, audioPath: s2AudioPath, durationSec: s2Dur, hasMotion: true, isLastScene: false, subtitlePath: s2SubPath },
      { imagePath: s3FramePath, videoPath: isValidBroll(brollS3) ? brollS3 : null, audioPath: s3AudioPath, durationSec: s3Dur, hasMotion: true, isLastScene: false, subtitlePath: s3SubPath },
      { imagePath: s4FramePath, videoPath: isValidBroll(brollS4) ? brollS4 : null, audioPath: s4AudioPath, durationSec: s4Dur, hasMotion: true, isLastScene: true, subtitlePath: s4SubPath }
    ];

    assembleMultiSceneShortsVideo({
      scenes,
      outputPath: videoOutputPath,
      thumbnailPath: fs.existsSync(thumbnailPath) ? thumbnailPath : undefined
    });
    console.log(`[COMPOSER] 4-Scene Short generated: ${videoOutputPath}`);

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
    const contactSheet = videoOutputPath.replace(/\.mp4$/i, '_contact_sheet.png');
    if (fs.existsSync(contactSheet)) console.log(`Contact sheet: ${contactSheet}`);
    if (fs.existsSync(thumbnailPath)) console.log(`Thumbnail A: ${thumbnailPath}`);
    if (fs.existsSync(thumbnailBPath)) console.log(`Thumbnail B: ${thumbnailBPath}`);
    console.log('[DRY RUN] Skipped YouTube upload & Meta cross-post.');
    console.log('====================================================');
    return;
  }

  // ─── 12. Upload to YouTube & Cross-Post to Meta Socials ────────────────────
  let uploadResult = null;
  let metaResult = null;

  try {
    const districtTag = (leadPost.district_slug || 'tamilnadu').replace(/[^a-zA-Z0-9]/g, '');
    const areaTag = (leadPost.area_name || '').replace(/[^a-zA-Z0-9]/g, '');
    const metaHashtags = [
      '#Reels', '#ReelsIndia', '#TamilReels', '#TrendingReels', '#ExplorePage',
      '#TamilNews', '#TamilNaduNews', '#TNNews', '#BreakingNews', '#Shorts',
      `#${districtTag}`, areaTag ? `#${areaTag}` : null, '#TamilNadu',
      '#CivicAlert', '#PublicSafety', '#GovernmentUpdate', '#VizhiTN',
      '#TamilTrending', '#NewsUpdate', '#ViralVideo', '#ViralReels',
      '#DailyAlert', '#TamilNaduToday', '#HyperlocalNews'
    ].filter(Boolean).join(' ');

    const metaCaption = `${theme.icon} ${(leadPost.district_slug || 'TN').toUpperCase()} நேரடி நிலவரம்:\n\n` +
      `${leadPost.title_ta || leadPost.title_en}\n\n` +
      `📞 அதிகாரப்பூர்வ உதவி / புகார் எண்: ${helplineNumber}\n\n` +
      `👉 தினசரி தமிழ்நாடு அரசு எச்சரிக்கைகள் & நேரடி மக்கள் செய்திகளுக்கு @vizhitn பக்கத்தை Follow & Subscribe செய்யுங்கள்!\n` +
      `📌 உங்கள் பகுதி மக்கள் எச்சரிக்கையாக இருக்க உடனே Save & Share செய்யுங்கள் ↗️\n\n` +
      `🌐 முழு அதிகாரப்பூர்வ விவரம்: https://vizhitn.in\n\n` +
      `🔍 Searches: ${(leadPost.area_name || leadPost.district_slug)} news today, Tamil Nadu civic alert, ${helplineNumber} helpline, VizhiTN\n\n` +
      `${metaHashtags}`;

    metaResult = await crossPostVideoToMetaSocials({
      videoFilePath: videoOutputPath,
      thumbnailFilePath: thumbnailPath,
      title: finalTitle,
      caption: metaCaption,
      isReel: true,
      isDryRun
    });
  } catch (metaErr) {
    console.warn('[META SOCIAL WARN] Meta social cross-post error:', metaErr.message);
  }

  // Upload to YouTube (Skipped in dry-run mode)
  try {
    if (isDryRun) {
      console.log('[YOUTUBE DRY-RUN] Video rendered successfully. Skipping YouTube upload because --dry-run is active.');
      uploadResult = { videoId: 'DRY_RUN_LOCAL_VIDEO', videoUrl: 'https://youtube.com/shorts/DRY_RUN_LOCAL_VIDEO', dryRun: true };
    } else {
      uploadResult = await uploadToYouTube({
        videoFilePath: videoOutputPath,
        title: finalTitle,
        description: finalDesc,
        tags,
        privacyStatus: 'public',
        isShort: true
      });
    }

    if (uploadResult?.videoId && !uploadResult.dryRun) {
      recordQuotaUsage('VIDEO_UPLOAD', { videoId: uploadResult.videoId, title: finalTitle });
      await recordBroadcastSuccess({
        broadcastDate: todayIst,
        format: 'civic-shorts',
        timeIst: calEntry?.time_ist || '07:30 PM',
        title: finalTitle,
        youtubeVideoId: uploadResult.videoId,
        youtubeUrl: uploadResult.videoUrl,
        metaVideoId: metaResult?.facebook?.id || null,
        metaReelId: metaResult?.instagram?.id || null,
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

      try {
        const dbEpisode = await getEpisodeFromDatabase(todayIst);
        if (dbEpisode?.episode_number) {
          await updateEpisodeStatusInDb(dbEpisode.episode_number, {
            shorts_youtube_video_id: uploadResult.videoId,
            shorts_youtube_url: uploadResult.videoUrl
          });
          console.log(`[SUPABASE DB ✓] Linked companion short to Day #${dbEpisode.episode_number}`);
        }
      } catch (err) {
        console.warn('[SUPABASE DB WARN] Could not link companion short to content_episodes:', err.message);
      }
    }

    console.log('====================================================');
    console.log('CIVIC ALERT SHORT GENERATED & PUBLISHED!');
    console.log('Video URL:', uploadResult?.videoUrl || 'N/A');
    console.log('Title:', finalTitle);
    console.log('====================================================');
  } catch (ytErr) {
    console.warn('[YOUTUBE WARN] YouTube upload encountered an issue:', ytErr.message);
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
