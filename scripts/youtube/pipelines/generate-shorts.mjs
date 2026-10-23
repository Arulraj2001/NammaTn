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
  const apiKey = process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const { GoogleGenAI } = await import('@google/genai');
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `நீ VizhiTN என்ற தமிழ்நாடு குடிமை செய்தி ஊடகத்திற்கான YouTube Shorts scriptwriter.
தமிழ்நாடு மக்களுக்கான அதிவேக 16-18 வினாடி Viral Civic Short script எழுது.

தகவல்கள்:
தலைப்பு: "${title}"
பகுதி: ${area}
வகை: ${category}
துறை: ${assigned_department || 'தமிழ்நாடு அரசு'}
ஸ்தலம்: ${location_text || area}
உள்ளடக்கம்: ${content_ta || title}
ஹெல்ப்லைன்: ${helplineVoice}

★ VizhiTN 8-Rule Script Constitution (Strict Enforcement):
1. Immediate Citizen Pain Command (Beat 1 Hook): முதல் 3-4 வார்த்தைகளில் குடிமக்களின் நேரடி அவசர கட்டளை (எ.கா: "போன், மோட்டாரை இப்பவே சார்ஜ் பண்ணுங்க!", "நாளைக்கு தண்ணி வராது, பிடிச்சு வையுங்க!", "இந்த ரோட்ல போகாதீங்க, டிராபிக் ஜாம்!") என்று அதிவேகமாக தொடங்கி "— ஏன்னு தெரியுமா?" என்று கேள்வியோடு முடி. அரசு அறிக்கை போன்ற மந்தமான தொடக்கங்கள் முற்றிலும் தடை!
2. One Fact Per Beat (Beat 2 Ground Reality): எங்கு (பகுதி) என்று மட்டும் சொல். நேரம்/மணியை வாயால் பேசாதே (நேரம் திரையில் கார்டில் காண்பிக்கப்படும்). 1 மூச்சில் சொல்லக்கூடிய 1 சிறிய வாக்கியம் மட்டுமே.
3. Brand CTA & Helpline (Beat 3 Ending): உதவி எண்ணை சொல்லி, 'தினசரி அரசு எச்சரிக்கைகளுக்கு இப்பவே VizhiTN-ஐ Follow & Subscribe பண்ணுங்க!' என்று கட்டாயமாக சொல்லி, பின் 'அடுத்த செய்தி உங்க ஏரியாவான்னு தெரிஞ்சுக்க வேணுமா—' என்ற கேள்வியோடு முடி. (முக்கியம்: 'VizhiTN-ஐ Follow பண்ணுங்க மற்றும் Subscribe' என்ற வார்த்தைகள் விடுபடவே கூடாது!)
4. Write for the Ear: குறுகிய, எளிய பேச்சுத் தமிழ் (Colloquial Tamil).
5. நீளம்: Beat 1 (7-9 வார்த்தைகள்), Beat 2 (8-10 வார்த்தைகள்), Beat 3 (12-16 வார்த்தைகள்: உதவி எண் + VizhiTN Follow & Subscribe + கேள்வி).

JSON மட்டும் திரும்ப அனுப்பு:
{"beat1": "...", "beat2": "...", "beat3": "..."}`.trim();

    // Try candidate models in reliability order
    const CANDIDATES = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];
    let raw = '';

    for (const model of CANDIDATES) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: prompt,
          generationConfig: { responseMimeType: 'application/json', temperature: 0.7, maxOutputTokens: 512 }
        });
        raw = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (raw) break;
      } catch (modelErr) {
        console.warn(`[AI SCRIPT] Model ${model} failed: ${modelErr.message.slice(0, 60)}`);
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

  // ─── 2. SCRIPT — AI-written unique 3-beat (Gemini-first, template-fallback) ──
  const aiScript = await generateAIShortScript({
    title: rawTitle,
    area,
    category,
    helplineVoice,
    assigned_department: leadPost.assigned_department,
    location_text: leadPost.location_text,
    content_ta: leadPost.content_ta
  });

  // Fallback template hooks — used only when Gemini API is unavailable
  // Rotating CTA loop bank (Ambiguous, stands alone if swiped, loops cleanly if replayed)
  const ROTATING_LOOP_CTAS = [
    `உங்க ஏரியாவிலும் இது மாதிரி நடக்குதான்னு உடனே தெரிஞ்சுக்க வேணுமா—`,
    `பக்கத்து வீட்டுக்காரங்களுக்கு முன்னாடியே இந்த தகவல் தெரியணுமா—`,
    `அடுத்த முக்கியமான கள நிலவரத்தை மிஸ் பண்ணாம தெரிஞ்சுக்க வேணுமா—`,
    `தமிழ்நாட்டின் உண்மை கள நிலவரங்களை உடனே தெரிஞ்சுக்க ஆசையா—`
  ];
  const chosenLoopCTA = ROTATING_LOOP_CTAS[Math.floor(Date.now() / 86400000) % ROTATING_LOOP_CTAS.length];

  // Specific tangible stake per category (Rule 1: Specificity beats generic urgency)
  let stakeHook = '';
  if (category === 'electricity') {
    stakeHook = `இன்னைக்கு ${area}-ல தண்ணி மோட்டார் ஓடாது — ஏன்னு தெரியுமா?`;
  } else if (category === 'water-sanitation') {
    stakeHook = `நாளைக்கு காலைல உங்க வீட்டு ஓவர்ஹெட் டேங்க் காலியாகிடும் — ஏன் தெரியுமா?`;
  } else if (category === 'transport') {
    stakeHook = `இன்னைக்கு இந்த ரூட்ல போனா அரை மணி நேரம் டிராபிக்ல மாட்டுவீங்க — ஏன்னு தெரியுமா?`;
  } else if (category === 'public-safety') {
    stakeHook = `போனுக்கு வர்ற இந்த போலி மெசேஜை நம்பி பணத்தை விட்றாதீங்க — ஏன்னா...`;
  } else {
    stakeHook = `இன்னைக்கு ${area}-ல ஒரு முக்கியமான சேவை முடங்கப்போகுது — ஏன்னு தெரியுமா?`;
  }

  const fallbackGround = leadPost.location_text
    ? `பராமரிப்பு பணி காரணமா ${leadPost.location_text} பகுதியில மின்சாரம் நிறுத்தப்படுது.`
    : `பராமரிப்பு பணி காரணமா ${area} சுற்றுவட்டார பகுதியில மின்சாரம் நிறுத்தப்படுது.`;

  const fallbackCTA = `${helplineVoice}-ஐ அழையுங்க. தினசரி அரசு எச்சரிக்கைகளுக்கு இப்பவே VizhiTN-ஐ Follow & Subscribe பண்ணுங்க! ${chosenLoopCTA}`;

  const scene1Script = splitIntoSpokenClauses(aiScript?.beat1 || stakeHook, 4);
  const scene2Script = splitIntoSpokenClauses(aiScript?.beat2 || fallbackGround, 4);
  const scene3Script = splitIntoSpokenClauses(aiScript?.beat3 || fallbackCTA, 4);

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
    const s1Tts = await synthesizeSpeech(scene1Script, s1AudioPath, {
      voice: YOUTUBE_CONFIG.voices.tamilFemale,
      rate: YOUTUBE_CONFIG.voices.shortsRate,
      pitch: YOUTUBE_CONFIG.voices.shortsPitch,
      mode: 'short'
    });
    const s1Dur = getAudioDuration(s1AudioPath);
    const s1TimedSegs = s1Tts.timedSegments || [];

    console.log('[TTS] Synthesizing Beat 2 — Ground Reality...');
    s2AudioPath = path.join(outDir, `short_s2_audio_${Date.now()}.mp3`);
    const s2Tts = await synthesizeSpeech(scene2Script, s2AudioPath, {
      voice: YOUTUBE_CONFIG.voices.tamilFemale,
      rate: YOUTUBE_CONFIG.voices.shortsRate,
      pitch: YOUTUBE_CONFIG.voices.shortsPitch,
      mode: 'short'
    });
    const s2Dur = getAudioDuration(s2AudioPath);
    const s2TimedSegs = s2Tts.timedSegments || [];

    console.log('[TTS] Synthesizing Beat 3 — Helpline Action...');
    s3AudioPath = path.join(outDir, `short_s3_audio_${Date.now()}.mp3`);
    const s3Tts = await synthesizeSpeech(scene3Script, s3AudioPath, {
      voice: YOUTUBE_CONFIG.voices.tamilFemale,
      rate: YOUTUBE_CONFIG.voices.shortsRate,
      pitch: YOUTUBE_CONFIG.voices.shortsPitch,
      mode: 'short'
    });
    const s3Dur = getAudioDuration(s3AudioPath);
    const s3TimedSegs = s3Tts.timedSegments || [];

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

    // ─── 6. Render HTML Frames ─────────────────────────────────────────────
    const brandLogoDataUri = getBrandLogoDataUri();

    // Beat 1: Hook Frame (Wide Ground Reality with Obsidian Breaking News Card)
    const fontsDir = path.resolve('public/fonts').replace(/\\/g, '/');
    const tplS1Path = path.resolve('scripts/youtube/templates/shorts/scene-1-hook.html');
    let tplS1 = fs.readFileSync(tplS1Path, 'utf-8');
    tplS1 = tplS1
      .replace('{{FONTS_DIR}}', fontsDir)
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
    // Extract visual timing text (hours strictly shown on card, not spoken twice)
    const timingMatch = (leadPost.content_ta || leadPost.title_ta || '').match(/(\d{1,2}(?::\d{2})?\s*(?:AM|PM|காலை|மதியம்|முதல்)?\s*[-–toமுதல்]\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM|மணி)?)/i);
    const timingText = timingMatch ? timingMatch[0] : 'காலை 9:00 முதல் மதியம் 2:00 வரை';

    tplS2 = tplS2
      .replace('{{FONTS_DIR}}', fontsDir)
      .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
      .replace('{{SCENE_PHOTO_SRC}}', toImageSource(photoS2Url))
      .replaceAll('{{LOCATION_TEXT}}', `${area} | தமிழ்நாடு`)
      .replaceAll('{{CATEGORY_COLOR}}', theme.color)
      .replaceAll('{{CATEGORY_ICON}}', theme.icon)
      .replaceAll('{{CATEGORY_LABEL}}', theme.label)
      .replaceAll('{{HEADLINE_TA}}', rawTitle)
      .replaceAll('{{TIMING_TEXT}}', timingText)
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
      .replaceAll('{{FONTS_DIR}}', fontsDir)
      .replaceAll('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
      .replaceAll('{{ASSIGNED_DEPT}}', assignedDept)
      .replaceAll('{{HELPLINE_NUMBER}}', helplineNumber)
      .replaceAll('{{DISTRICT_NAME}}', area.toUpperCase())
      .replaceAll('{{CATEGORY_COLOR}}', theme.color)
      .replaceAll('{{CATEGORY_ICON}}', theme.icon);

    s3FramePath = path.join(outDir, `short_s3_frame_${Date.now()}.png`);
    renderHtmlToImage(tplS3, s3FramePath, { width: 1080, height: 1920 });

    // ─── 7. Kinetic Karaoke Subtitles (Crucial for 75%+ Muted Mobile Viewers) ──
    s1SubPath = path.join(outDir, `short_s1_sub_${Date.now()}.ass`);
    s2SubPath = path.join(outDir, `short_s2_sub_${Date.now()}.ass`);
    s3SubPath = path.join(outDir, `short_s3_sub_${Date.now()}.ass`);

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

    // ─── 8. Assemble 3-Beat Multi-Scene Short with Dynamic Motion ────────────
    // Fetch 3 DIFFERENT B-roll clips — one per scene (no repeating background)
    const categoryKws = {
      'electricity': ['power lines transmission tower', 'electrician substation work', 'emergency phone helpline call'],
      'water-sanitation': ['water pipe street repair', 'drinking water tap flow', 'person calling helpline phone'],
      'road-infrastructure': ['highway traffic india aerial', 'road pothole repair work', 'emergency phone call help'],
      'transport': ['metro train station platform', 'city bus traffic street', 'person calling phone help'],
      'public-safety': ['police car emergency lights', 'cyber security computer screen', 'emergency helpline phone'],
      'healthcare': ['hospital corridor doctor', 'medicine pharmacy clinic', 'ambulance emergency phone'],
      'education': ['school classroom students', 'college exam writing', 'phone helpline guidance'],
      'agriculture': ['paddy field farmer india', 'irrigation canal water', 'farmer phone helpline'],
      'environment': ['river lake nature clean', 'tree plantation workers', 'environmental phone report'],
      'government-schemes': ['government office documents', 'ration card distribution queue', 'helpline phone call'],
      'local-development': ['building construction crane', 'urban road infrastructure', 'municipal phone helpline'],
      'general': ['indian city street crowd', 'government office public', 'emergency helpline phone call']
    };
    const kwSet = categoryKws[category] || categoryKws['general'];

    const [brollS1, brollS2, brollS3] = await Promise.all([
      fetchFreeBrollClip({ category, aspectRatio: '9:16', durationSec: s1Dur, query: kwSet[0] }),
      fetchFreeBrollClip({ category, aspectRatio: '9:16', durationSec: s2Dur, query: kwSet[1] }),
      fetchFreeBrollClip({ category, aspectRatio: '9:16', durationSec: s3Dur, query: kwSet[2] })
    ]);

    const isValidBroll = (p) => p && !p.includes('procedural') && fs.existsSync(p) && fs.statSync(p).size > 100000;
    console.log(`[COMPOSER] Target SEO Video Filename: ${seoFilename}`);
    console.log('[COMPOSER] Assembling 3-Beat Civic Short with Dynamic Karaoke Subtitles...');

    const scenes = [
      { imagePath: s1FramePath, videoPath: isValidBroll(brollS1) ? brollS1 : null, audioPath: s1AudioPath, durationSec: s1Dur, hasMotion: true, isLastScene: false, subtitlePath: s1SubPath },
      { imagePath: s2FramePath, videoPath: isValidBroll(brollS2) ? brollS2 : null, audioPath: s2AudioPath, durationSec: s2Dur, hasMotion: true, isLastScene: false, subtitlePath: s2SubPath },
      { imagePath: s3FramePath, videoPath: isValidBroll(brollS3) ? brollS3 : null, audioPath: s3AudioPath, durationSec: s3Dur, hasMotion: true, isLastScene: true, subtitlePath: s3SubPath }
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

  // Cross-Post to Meta Socials (Instagram Reels & Facebook Video)
  try {
    const metaCaption = `${theme.icon} ${(leadPost.district_slug || 'TN').toUpperCase()} நேரடி நிலவரம்:\n\n${leadPost.title_ta || leadPost.title_en}\n\n` +
      `📞 அதிகாரப்பூர்வ உதவி / புகார்: ${helplineNumber}\n\n` +
      `👉 தினசரி தமிழ்நாடு அரசு எச்சரிக்கைகள் & மக்கள் விழிப்புணர்வுகளுக்கு @vizhitn பக்கத்தை Follow செய்யுங்கள்!\n` +
      `📌 உங்கள் பகுதி மக்களுக்கு உதவ உடனே Save & Share செய்யுங்கள் ↗️\n\n` +
      `🌐 முழு விவரங்கள் & நேரடி அறிக்கை: https://vizhitn.in\n\n` +
      `#Shorts #${(leadPost.district_slug || 'TN').replace(/[^a-zA-Z0-9]/g, '')} #TamilNadu`;

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

  // Upload to YouTube
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
