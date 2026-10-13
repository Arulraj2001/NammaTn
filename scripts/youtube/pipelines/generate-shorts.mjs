// scripts/youtube/pipelines/generate-shorts.mjs
// Daily Civic Lifeline Alert Short — Hook → Truth → Power structure
// Narrator persona: "Kavitha" | Category-specific visuals | SEO metadata engine

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { normalizeAcronymsToSpokenTamil } from '../engine/tamil-phonetics.mjs';
import { generateVideoMetadata, getCategoryFluxPrompt } from '../engine/script-writer.mjs';
import { synthesizeSpeech } from '../engine/tts-engine.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { generateYouTubeSceneVisual, toImageSource } from '../engine/cloudflare-visuals.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';
import { generateShortsThumbnail } from '../engine/thumbnail-engine.mjs';
import { chunkSentenceForCaptions, generateCaptionsFromClauses, generateAssSubtitleFile } from '../engine/captions-engine.mjs';

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

  // 1. Fetch top 3 active alerts from Supabase (most recent)
  console.log('[DATABASE] Fetching latest active civic alerts...');
  const { data: posts, error } = await supabase
    .from('post')
    .select('*')
    .eq('status', 'active')
    .order('created_date', { ascending: false })
    .limit(3);

  if (error || !posts || posts.length === 0) {
    console.error('[ERROR] Could not fetch active posts from Supabase:', error);
    process.exit(1);
  }

  console.log(`[INFO] Sourced ${posts.length} alerts for today's civic short.`);

  const leadPost = posts[0];
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

  // ─── 2. SCRIPT — Hook → Truth → Power structure ──────────────────────────
  // TARGET BUDGET: S1≈8s | S2≈30s | S3≈14s = ~52s total (well under 60s Shorts limit)

  // SCENE 1 — THE HOOK (0:00–0:08): One sharp sentence, no intro filler
  const firstTitle = normalizeAcronymsToSpokenTamil(leadPost.title_ta || leadPost.title_en || '');

  const hookOpener = leadPost.urgency_level === 'critical' || leadPost.urgency_level === 'high'
    ? `${area} பகுதியில இன்னைக்கு ${theme.icon} ${firstTitle}`
    : `${area} பகுதியில ${theme.icon} ${firstTitle}`;

  // Keep hook to ~120 chars so TTS stays ≈7-8 seconds
  const scene1Script = [ hookOpener.slice(0, 120) ];

  // SCENE 2 — THE TRUTH (0:08–0:38): ONE punchy sentence per alert — no body content
  // Each entry ≈10s of speech at natural Tamil pace
  const scene2Script = [];
  posts.forEach((p, idx) => {
    const pArea = p.area_name || p.district_slug || 'பகுதி';
    const pTitle = normalizeAcronymsToSpokenTamil(p.title_ta || p.title_en).slice(0, 80);

    // Category-specific punchy opener (natural spoken flow, no robotic numbering)
    const connector = idx === 0 ? '' : 'அடுத்ததா, ';
    if (p.category_slug === 'electricity') {
      scene2Script.push(`${connector}${pArea} power cut: ${pTitle}`);
    } else if (p.category_slug === 'water-sanitation') {
      scene2Script.push(`${connector}${pArea} குடிநீர் பிரச்சனை: ${pTitle}`);
    } else if (p.category_slug === 'road-infrastructure') {
      scene2Script.push(`${connector}${pArea} road issue: ${pTitle}`);
    } else if (p.category_slug === 'transport') {
      scene2Script.push(`${connector}${pArea} traffic: ${pTitle}`);
    } else {
      scene2Script.push(`${connector}${pArea} — ${pTitle}`);
    }
  });

  // SCENE 3 — THE POWER (0:38–0:52): Helpline + vizhitn.in call-to-action
  const scene3Script = [
    `complaint பதிவு செய்ய ${helpline} helpline எண்ணை call பண்ணுங்க.`,
    `முழு details-க்கு vizhitn.in பாருங்க.`
  ];

  // ─── 3. Synthesize Audio ─────────────────────────────────────────────────
  console.log('[TTS] Synthesizing Scene 1 — The Hook...');
  const s1AudioPath = path.join(outDir, `short_s1_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene1Script, s1AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+5%' });
  const s1Dur = getAudioDuration(s1AudioPath);

  console.log('[TTS] Synthesizing Scene 2 — The Truth...');
  const s2AudioPath = path.join(outDir, `short_s2_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene2Script, s2AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
  const s2Dur = getAudioDuration(s2AudioPath);

  console.log('[TTS] Synthesizing Scene 3 — The Power...');
  const s3AudioPath = path.join(outDir, `short_s3_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene3Script, s3AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+4%' });
  const s3Dur = getAudioDuration(s3AudioPath);

  const totalDur = s1Dur + s2Dur + s3Dur;
  console.log(`[AUDIO] S1: ${s1Dur.toFixed(1)}s | S2: ${s2Dur.toFixed(1)}s | S3: ${s3Dur.toFixed(1)}s | Total: ${totalDur.toFixed(1)}s`);

  // ─── 4. Generate Visuals — Category-Specific FLUX Photo ─────────────────
  const fluxPrompt = getCategoryFluxPrompt(category);
  const heroPhotoPath = path.join(outDir, `short_flux_hero_${Date.now()}.webp`);
  let heroPhotoUrl = await generateYouTubeSceneVisual(fluxPrompt, heroPhotoPath, '9:16');
  if (!heroPhotoUrl) {
    // Official VizhiTN Category Graphic Card fallback (zero external stock photos)
    const categoryCardPath = path.resolve(`public/images/categories/${category}.webp`);
    if (fs.existsSync(categoryCardPath)) {
      heroPhotoUrl = categoryCardPath;
    } else {
      heroPhotoUrl = path.resolve('public/images/categories/general.webp');
    }
  }

  const brandLogoDataUri = getBrandLogoDataUri();

  // ─── 5. Render Scene 1 — Hook Frame with category-aware urgency styling ──
  const tplS1Path = path.resolve('scripts/youtube/templates/shorts/scene-1-hook.html');
  let tplS1 = fs.readFileSync(tplS1Path, 'utf-8');
  tplS1 = tplS1
    .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
    .replace('{{SCENE_PHOTO_SRC}}', toImageSource(heroPhotoUrl))
    .replace('{{HOOK_HEADLINE_TA}}', leadPost.title_ta || leadPost.title_en || 'இன்றைய முக்கிய செய்தி')
    .replace('{{DATE_TEXT}}', dateStr)
    .replace('{{CATEGORY_COLOR}}', theme.color)
    .replace('{{CATEGORY_ICON}}', theme.icon)
    .replace('{{CATEGORY_LABEL}}', theme.label)
    .replace('{{DISTRICT_NAME}}', (leadPost.district_slug || 'TN').toUpperCase())
    .replace(/\{\{URGENCY_CLASS\}\}/g, leadPost.urgency_level === 'critical' ? 'pill-critical' :
              leadPost.urgency_level === 'high' ? 'pill-high' : 'pill-alert');

  const s1FramePath = path.join(outDir, `short_s1_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS1, s1FramePath, { width: 1080, height: 1920 });

  // ─── 6. Render Scene 2 — Truth / Breakdown Frame ─────────────────────────
  let cardsHtml = '';
  posts.forEach((p) => {
    const pTheme = getCategoryTheme(p.category_slug);
    const isDanger = p.urgency_level === 'critical';
    const isWarn = p.urgency_level === 'high' || p.urgency_level === 'medium';
    const cardClass = isDanger ? 'alert-card danger' : (isWarn ? 'alert-card warn' : 'alert-card');
    const timeText = p.location_text || 'விவரங்களுக்கு vizhitn.in பார்க்கவும்';

    cardsHtml += `
      <div class="${cardClass}" style="border-left: 6px solid ${pTheme.color};">
        <div class="card-top">
          <span class="cat-name" style="color:${pTheme.color}">${pTheme.icon} ${(p.category_slug || 'ALERT').toUpperCase()}</span>
          <span class="dist-name">📍 ${(p.district_slug || 'TN').toUpperCase()}</span>
        </div>
        <div class="card-title">${p.title_ta || p.title_en}</div>
        <div class="card-timing">${timeText}</div>
      </div>
    `;
  });

  const tplS2Path = path.resolve('scripts/youtube/templates/shorts/scene-2-breakdown.html');
  let tplS2 = fs.readFileSync(tplS2Path, 'utf-8');
  tplS2 = tplS2
    .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
    .replace('{{DIGEST_TITLE_TA}}', `இன்றைய முக்கிய நிர்வாக அறிவிப்புகள் (${timeStr})`)
    .replace('{{ALERTS_CARDS_HTML}}', cardsHtml);

  const s2FramePath = path.join(outDir, `short_s2_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS2, s2FramePath, { width: 1080, height: 1920 });

  // ─── 7. Render Scene 3 — Power / vizhitn.in CTA Frame ───────────────────
  const tplS3Path = path.resolve('scripts/youtube/templates/shorts/scene-3-helpline.html');
  let tplS3 = fs.readFileSync(tplS3Path, 'utf-8');
  tplS3 = tplS3.replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri);

  const s3FramePath = path.join(outDir, `short_s3_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS3, s3FramePath, { width: 1080, height: 1920 });

  // ─── 8. Generate Kinetic Subtitles for Mobile Retention ─────────────────
  const s1SubPath = path.join(outDir, `short_s1_sub_${Date.now()}.ass`);
  const s2SubPath = path.join(outDir, `short_s2_sub_${Date.now()}.ass`);
  const s3SubPath = path.join(outDir, `short_s3_sub_${Date.now()}.ass`);

  try {
    generateAssSubtitleFile(generateCaptionsFromClauses(scene1Script, s1Dur), s1SubPath, '9:16');
    generateAssSubtitleFile(generateCaptionsFromClauses(scene2Script, s2Dur), s2SubPath, '9:16');
    generateAssSubtitleFile(generateCaptionsFromClauses(scene3Script, s3Dur), s3SubPath, '9:16');
  } catch (subErr) {
    console.log('[CAPTIONS WARN] Could not generate subtitles:', subErr.message);
  }

  // ─── 9. Assemble Multi-Scene Short with Dynamic Motion & Captions ─────────
  const videoOutputPath = path.join(outDir, `vizhitn_short_${Date.now()}.mp4`);
  console.log('[COMPOSER] Assembling 3-Scene Civic Short with dynamic motion & kinetic captions...');

  const scenes = [
    { imagePath: s1FramePath, audioPath: s1AudioPath, durationSec: s1Dur, hasMotion: true, isLastScene: false, subtitlePath: s1SubPath },
    { imagePath: s2FramePath, audioPath: s2AudioPath, durationSec: s2Dur, hasMotion: true, isLastScene: false, subtitlePath: s2SubPath },
    { imagePath: s3FramePath, audioPath: s3AudioPath, durationSec: s3Dur, hasMotion: true, isLastScene: true, subtitlePath: s3SubPath }
  ];

  assembleMultiSceneShortsVideo({ scenes, outputPath: videoOutputPath });
  console.log(`[COMPOSER] Short generated: ${videoOutputPath}`);

  // ─── 9. Generate Custom Thumbnail (1280×720) ─────────────────────────────
  const thumbnailPath = path.join(outDir, `vizhitn_thumb_short_${Date.now()}.png`);
  try {
    await generateShortsThumbnail({
      titleTa:       (leadPost.title_ta || leadPost.title_en || '').slice(0, 40),
      heroImageUrl:   heroPhotoUrl,
      categoryLabel:  theme.label,
      categoryIcon:   theme.icon,
      categoryColor:  theme.color,
      districtName:   (leadPost.district_slug || 'TN').toUpperCase(),
      urgencyClass:   leadPost.urgency_level === 'critical' ? 'pill-critical' :
                      leadPost.urgency_level === 'high'     ? 'pill-high'     :
                      leadPost.urgency_level === 'medium'   ? 'pill-medium'   : 'pill-low',
      outputPath:     thumbnailPath
    });
  } catch (e) {
    console.warn('[THUMBNAIL] Generation failed, skipping custom thumbnail:', e.message);
  }

  // ─── 10. Build SEO Metadata ───────────────────────────────────────────────
  const { title, description, tags } = generateVideoMetadata({
    article: leadPost,
    script: null,
    isShort: true,
    chapterTimestamps: []
  });

  // ─── 11. Upload to YouTube ────────────────────────────────────────────────
  const uploadResult = await uploadToYouTube({
    videoFilePath: videoOutputPath,
    title,
    description,
    tags,
    privacyStatus: isDryRun ? 'unlisted' : 'public',
    isShort: true
  });

  if (uploadResult.videoId && !uploadResult.dryRun) {
    // Upload custom thumbnail
    if (fs.existsSync(thumbnailPath)) {
      await setYouTubeThumbnail(uploadResult.videoId, thumbnailPath);
    }
    // Auto-post pinned comment to drive vizhitn.in traffic
    await postPinnedComment(uploadResult.videoId,
      `📍 உங்க ஏரியால இது நடக்குதா? vizhitn.in-ல report பண்ணுங்க 👇\nஉங்க ஒரு post உங்க பக்கத்துல இருக்கிற 1000 பேரை protect பண்ணும். 🔴 vizhitn.in`
    );
  }

  console.log('====================================================');
  console.log('CIVIC ALERT SHORT GENERATED & PUBLISHED!');
  console.log('Video URL:', uploadResult.videoUrl);
  console.log('Title:', title);
  console.log('====================================================');

  // ─── 12. Cross-Post to Meta Socials ──────────────────────────────────────
  const facebookCaption = `${theme.icon} ${(leadPost.district_slug || 'TN').toUpperCase()} நேரடி நிலவரம்:\n\n${leadPost.title_ta || leadPost.title_en}\n\n📞 புகார்: ${helpline}\n🌐 விவரங்கள்: https://vizhitn.in\n\n${description.split('\n').pop()}`;

  await crossPostVideoToMetaSocials({
    videoFilePath: videoOutputPath,
    title,
    caption: facebookCaption,
    isReel: true,
    isDryRun
  });

  // Cleanup temp files
  const temps = [s1FramePath, s2FramePath, s3FramePath, s1AudioPath, s2AudioPath, s3AudioPath, heroPhotoPath, s1SubPath, s2SubPath, s3SubPath];
  for (const t of temps) {
    try { if (fs.existsSync(t)) fs.unlinkSync(t); } catch {}
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN CIVIC SHORTS PIPELINE]:', err);
  process.exit(1);
});
