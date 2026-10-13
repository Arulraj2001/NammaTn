// scripts/youtube/pipelines/generate-long-video.mjs
// Weekly 3x Long-Form In-Depth Investigative Documentary (Spoken Tamil, 16:9, 6–8 mins)
// Uses Kavitha persona script, category-specific visuals, SEO metadata engine, auto-pinned comment

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { normalizeAcronymsToSpokenTamil, sanitizeClauseText } from '../engine/tamil-phonetics.mjs';
import { synthesizeSpeech } from '../engine/tts-engine.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleLongFormVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { generateLongVideoThumbnail } from '../engine/thumbnail-engine.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';

import { generateDocumentaryScript, generateVideoMetadata, getCategoryFluxPrompt } from '../engine/script-writer.mjs';
import { generateYouTubeSceneVisual, toImageSource } from '../engine/cloudflare-visuals.mjs';
import { chunkSentenceForCaptions, generateCaptionsFromClauses, generateAssSubtitleFile } from '../engine/captions-engine.mjs';

// Load .env.local if running in local environment
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

async function main() {
  console.log('====================================================');
  console.log('VizhiTN YouTube Automation — Production-Grade Long Documentary');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const targetSlug = process.argv.find(a => a.startsWith('--slug='))?.split('=')[1];

  const outDir = path.resolve('public/youtube_renders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. Fetch targeted or latest tn_today article
  console.log('[DATABASE] Fetching TN Today feature article...');
  let query = supabase.from('tn_today').select('*').eq('status', 'published');
  if (targetSlug) {
    query = query.eq('slug', targetSlug);
  } else {
    query = query.order('publish_date', { ascending: false }).limit(1);
  }

  const { data: articles, error } = await query;
  if (error || !articles || articles.length === 0) {
    console.error('[ERROR] Could not fetch tn_today article:', error);
    process.exit(1);
  }

  const article = articles[0];
  const articleTitleEn = article.title_en || article.title || 'Tamil Nadu Development';
  const articleTitleTa = article.title_ta || article.title || articleTitleEn;
  console.log(`[INFO] Sourced article: "${articleTitleEn}"`);

  // 2. Prepare visual assets & hero image
  let heroImageSrc = article.hero_image_url;
  if (!heroImageSrc || !heroImageSrc.startsWith('http')) {
    heroImageSrc = 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80';
  }

  const deptName = article.department_name || 'தமிழ்நாடு அரசு';
  const helplineNum = article.helpline || '1100 / 1912';
  const locationText = `${article.district_focus || 'Tamil Nadu'} | தமிழ்நாடு`;
  const categorySlug = article.category_slug || 'general';

  // Pre-fetch category-specific FLUX background for chapter slides
  const categoryFluxPrompt = getCategoryFluxPrompt(categorySlug);

  // 3. Synthesize In-Depth 5-Act Investigative Documentary Script via Gemini
  console.log('[RESEARCH] Synthesizing 5-Act production documentary script with deep civic data...');
  const docScript = await generateDocumentaryScript(article);
  const chapterDefinitions = docScript.chapters || [];

  const templatePath = path.resolve('scripts/youtube/templates/long-form/chapter-slide.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');

  const brandLogoDataUri = getBrandLogoDataUri();

  // 4. Generate Chapter Slides & Micro-TTS Audio
  const processedChapters = [];
  let totalVideoDuration = 0;
  const chapterTimestamps = [];

  for (let i = 0; i < chapterDefinitions.length; i++) {
    const ch = chapterDefinitions[i];
    const chapterNum = ch.chapterNum || `0${i + 1} / 05`;
    const titleTa = ch.headlineTa || ch.titleTa || `பகுதி ${i + 1}`;
    const titleEn = ch.headlineEn || ch.titleEn || `Part ${i + 1}`;
    const narrationList = ch.narrationClauses || ch.narration || [];
    const factsList = ch.facts || [];

    console.log(`\n[CHAPTER ${i + 1}] Processing "${titleEn}" in Spoken Tamil...`);

    // Generate chapter-tailored 16:9 FLUX visual plate
    const chVisualPrompt = `${categoryFluxPrompt}, ${ch.headlineEn || articleTitleEn}, realistic documentary photography representing ${ch.headlineEn || 'infrastructure in Tamil Nadu'}`;
    const chVisualPath = path.join(outDir, `long_ch_flux_${i}_${Date.now()}.webp`);
    let chVisualUrl = await generateYouTubeSceneVisual(chVisualPrompt, chVisualPath, '16:9');
    if (!chVisualUrl) {
      chVisualUrl = heroImageSrc;
    }

    let factsHtml = factsList.map(f => `
      <div class="fact-item">
        <span class="fact-icon">✦</span>
        <span>${f}</span>
      </div>
    `).join('');

    // Build 5-dot chapter progress indicators (active = current chapter)
    const totalChapters = docScript.chapters.length;
    const dotClasses = Array.from({ length: 5 }, (_, di) => {
      if (di < totalChapters) return di === i ? 'active' : '';
      return ''; // hide unused dots by leaving them inactive
    });

    let slideHtml = templateHtml
      .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
      .replace('{{HERO_IMAGE_SRC}}', toImageSource(chVisualUrl))
      .replace('{{CHAPTER_NUM}}', chapterNum)
      .replace('{{CATEGORY_NAME}}', (article.category_slug || 'DEVELOPMENT').toUpperCase())
      .replace('{{HEADLINE_TA}}', titleTa)
      .replace('{{HEADLINE_EN}}', titleEn)
      .replace('{{FACTS_HTML}}', factsHtml)
      .replace('{{DEPT_NAME}}', deptName)
      .replace('{{HELPLINE_NUM}}', helplineNum)
      .replace('{{LOCATION_TEXT}}', locationText)
      .replace('{{DOT_1_CLASS}}', dotClasses[0])
      .replace('{{DOT_2_CLASS}}', dotClasses[1])
      .replace('{{DOT_3_CLASS}}', dotClasses[2])
      .replace('{{DOT_4_CLASS}}', dotClasses[3])
      .replace('{{DOT_5_CLASS}}', dotClasses[4]);

    const slidePngPath = path.join(outDir, `long_slide_${i}_${Date.now()}.png`);
    renderHtmlToImage(slideHtml, slidePngPath, { width: 1920, height: 1080 });

    // Sanitize clauses: strip list numbers ("1. ", "2. "), bullets, trailing commas, and correct typos
    const sanitizedClauses = (narrationList || []).map(c => sanitizeClauseText(c)).filter(Boolean);

    const audioPath = path.join(outDir, `long_audio_${i}_${Date.now()}.mp3`);
    await synthesizeSpeech(sanitizedClauses, audioPath, {
      voice: YOUTUBE_CONFIG.voices.tamilMale,
      rate: '+2%'
    });

    const dur = getAudioDuration(audioPath);
    console.log(`[CHAPTER ${i + 1}] Slide: ${slidePngPath}, Audio: ${dur.toFixed(1)}s`);

    // Generate kinetic captions for chapter using clause-locked timing
    const chSubPath = path.join(outDir, `long_ch_sub_${i}_${Date.now()}.ass`);
    try {
      const subChunks = generateCaptionsFromClauses(sanitizedClauses, dur);
      generateAssSubtitleFile(subChunks, chSubPath, '16:9');
    } catch (subErr) {
      console.log(`[CAPTIONS WARN] Subtitle generation failed for chapter ${i + 1}:`, subErr.message);
    }

    const mins = Math.floor(totalVideoDuration / 60);
    const secs = Math.floor(totalVideoDuration % 60).toString().padStart(2, '0');
    chapterTimestamps.push(`${mins}:${secs} - ${titleEn}`);

    totalVideoDuration += dur;

    processedChapters.push({
      slidePath: slidePngPath,
      audioPath,
      durationSec: dur,
      subtitlePath: chSubPath,
      visualPath: chVisualUrl
    });
  }

  console.log(`\n[INFO] Total estimated feature length: ${(totalVideoDuration / 60).toFixed(1)} minutes (${totalVideoDuration.toFixed(0)} seconds)`);

  // 5. Assemble Final 16:9 Long-Form MP4
  const videoOutputPath = path.join(outDir, `vizhitn_feature_${article.slug || Date.now()}.mp4`);
  console.log('[COMPOSER] Assembling full 16:9 feature video with FFmpeg...');
  assembleLongFormVideo({
    chapters: processedChapters,
    outputPath: videoOutputPath
  });
  console.log(`[COMPOSER] Feature video created: ${videoOutputPath}`);

  // 6. Build SEO metadata with the centralized engine
  const { title: ytTitle, description: ytDesc, tags } = generateVideoMetadata({
    article,
    script: docScript,
    isShort: false,
    chapterTimestamps
  });

  console.log(`[SEO] Title (${ytTitle.length} chars): ${ytTitle}`);
  console.log(`[SEO] Tags: ${tags.join(', ')}`);
  console.log(`[SEO] Chapter timestamps:\n${chapterTimestamps.join('\n')}`);

  // 6. Generate Custom High-CTR 16:9 Thumbnail
  const thumbnailPath = path.join(outDir, `vizhitn_thumb_${article.slug || Date.now()}.png`);
  console.log('[THUMBNAIL] Rendering custom 16:9 high-CTR thumbnail...');
  try {
    await generateLongVideoThumbnail({
      titleTa: docScript.thumbnailHookTa || articleTitleTa,
      subtitleTa: 'முழு கள ஆய்வு & அரசு ஆவணங்கள்',
      category: (categorySlug || 'SPECIAL REPORT').toUpperCase(),
      heroImageUrl: heroImageSrc,
      outputPath: thumbnailPath
    });
  } catch (e) {
    console.log('[THUMBNAIL] Thumbnail generation failed, skipping custom thumbnail:', e.message);
  }

  // 7. Upload to YouTube
  const uploadResult = await uploadToYouTube({
    videoFilePath: videoOutputPath,
    title: ytTitle,
    description: ytDesc,
    tags,
    privacyStatus: isDryRun ? 'unlisted' : 'public',
    isShort: false
  });

  if (uploadResult.videoId && !uploadResult.dryRun) {
    // Attach custom thumbnail
    if (fs.existsSync(thumbnailPath)) {
      await setYouTubeThumbnail(uploadResult.videoId, thumbnailPath);
    }

    // Auto-post civic CTA as pinned comment to drive engagement + vizhitn.in traffic
    await postPinnedComment(
      uploadResult.videoId,
      `📍 இந்த பிரச்சனை உங்க ஏரியாலயும் இருக்கா? vizhitn.in-ல நேரடியா report பண்ணுங்க 👇\nஉங்க ஒரு post உங்க பக்கத்துல இருக்கிற ஆயிரம் பேரை protect பண்ணும். 🔴 vizhitn.in`
    );
  }

  console.log('====================================================');
  console.log('CONVERSATIONAL FEATURE VIDEO GENERATED SUCCESSFULLY!');
  console.log('Video URL:', uploadResult.videoUrl);
  console.log('Thumbnail:', thumbnailPath);
  console.log('====================================================');

  // 8. Cross-Post to Meta Socials (Facebook Page Video)
  await crossPostVideoToMetaSocials({
    videoFilePath: videoOutputPath,
    title: ytTitle,
    caption: ytDesc,
    isReel: false,
    isDryRun
  });

  for (const ch of processedChapters) {
    try {
      if (fs.existsSync(ch.slidePath)) fs.unlinkSync(ch.slidePath);
      if (fs.existsSync(ch.audioPath)) fs.unlinkSync(ch.audioPath);
      if (ch.subtitlePath && fs.existsSync(ch.subtitlePath)) fs.unlinkSync(ch.subtitlePath);
      if (ch.visualPath && ch.visualPath.startsWith(outDir) && fs.existsSync(ch.visualPath)) fs.unlinkSync(ch.visualPath);
    } catch {}
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN LONG-FORM PIPELINE]:', err);
  process.exit(1);
});
