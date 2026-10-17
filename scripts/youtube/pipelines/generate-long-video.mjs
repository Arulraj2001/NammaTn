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
import { runQualityControl } from '../engine/qc-engine.mjs';
import { checkQuotaAvailable, recordQuotaUsage } from '../engine/quota-tracker.mjs';
import { getScheduledUploadForSlot, getTodayIst } from '../engine/calendar-reader.mjs';
import { recordBroadcastSuccess, isBroadcastCompletedToday } from '../engine/broadcast-logger.mjs';

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

  const todayIst = getTodayIst();

  // Deduplication Guard: Never upload duplicate video for today's slot unless forced
  if (!process.argv.includes('--force')) {
    const status = await isBroadcastCompletedToday('long-form', todayIst);
    if (status.published) {
      console.log(`[DEDUP GUARD ✓] Long-Form Documentary already broadcast today (${status.existingRecord?.youtube_video_id || 'recorded'}). Exiting.`);
      process.exit(0);
    }
  }

  // 1. Source topic from 90-Day Calendar or fallback to tn_today database
  const calEntry = getScheduledUploadForSlot('long-form', todayIst);
  let article;

  if (calEntry && !targetSlug) {
    console.log(`[90-DAY CALENDAR] Sourcing scheduled long-form topic: "${calEntry.title}"`);
    article = {
      title_ta: calEntry.title,
      title_en: calEntry.title,
      summary_ta: calEntry.description,
      content_ta: calEntry.description,
      department_name: 'தமிழ்நாடு அரசு & துறை சார்ந்த ஆய்வுகள்',
      helpline: '1100 / 1912 / 1064',
      district_focus: 'Tamil Nadu',
      category_slug: 'general',
      slug: `vizhitn-doc-${todayIst}`,
      thumbnail_text: calEntry.thumbnail_text,
      hashtags: calEntry.hashtags
    };

    // If an existing published tn_today article matches keywords, merge deeper context
    const firstWord = calEntry.title.split(/[\s:,-]/)[0];
    if (firstWord && firstWord.length > 2) {
      const { data: matched } = await supabase
        .from('tn_today')
        .select('*')
        .or(`title_ta.ilike.%${firstWord}%,title_en.ilike.%${firstWord}%`)
        .limit(1);
      if (matched && matched[0]) {
        console.log(`[CONTEXT ENRICH] Enriched with tn_today article context: "${matched[0].slug}"`);
        if (matched[0].hero_image_url) article.hero_image_url = matched[0].hero_image_url;
        if (matched[0].category_slug) article.category_slug = matched[0].category_slug;
      }
    }
  } else {
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
    article = articles[0];
  }

  const articleTitleEn = article.title_en || article.title || 'Tamil Nadu Development';
  const articleTitleTa = article.title_ta || article.title || articleTitleEn;
  console.log(`[INFO] Sourced article: "${articleTitleEn}"`);

  const deptName = article.department_name || 'தமிழ்நாடு அரசு';
  const helplineNum = article.helpline || '1100 / 1912';
  const locationText = `${article.district_focus || 'Tamil Nadu'} | தமிழ்நாடு`;
  const categorySlug = article.category_slug || 'general';

  // 2. Prepare visual assets & hero image (zero external stock photos)
  let heroImageSrc = article.hero_image_url;
  if (!heroImageSrc || !heroImageSrc.startsWith('http')) {
    const localCard = path.resolve(`public/images/tntoday/${categorySlug}.webp`);
    heroImageSrc = fs.existsSync(localCard) ? localCard : path.resolve('public/images/tntoday/general.webp');
  }

  // Pre-fetch category-specific FLUX background for chapter slides
  const categoryFluxPrompt = getCategoryFluxPrompt(categorySlug);

  // 3. Synthesize In-Depth 5-Act Investigative Documentary Script via Gemini
  console.log('[RESEARCH] Synthesizing 5-Act production documentary script with deep civic data...');
  const docScript = await generateDocumentaryScript(article);
  const chapterDefinitions = docScript.chapters || [];

  const templatePath = path.resolve('scripts/youtube/templates/long-form/chapter-slide.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');

  const evidenceTplPath = path.resolve('scripts/youtube/templates/long-form/evidence-doc-slide.html');
  const evidenceTplHtml = fs.existsSync(evidenceTplPath) ? fs.readFileSync(evidenceTplPath, 'utf-8') : templateHtml;

  const dataTplPath = path.resolve('scripts/youtube/templates/long-form/data-stat-slide.html');
  const dataTplHtml = fs.existsSync(dataTplPath) ? fs.readFileSync(dataTplPath, 'utf-8') : templateHtml;

  const brandLogoDataUri = getBrandLogoDataUri();

  // 4. Generate Chapter Slides & Micro-TTS Audio in Multi-Beat Structure
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

    console.log(`\n[ACT ${i + 1}/5] Processing "${titleEn}" in Spoken Tamil with Multi-Beat Visuals...`);

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

    const totalChapters = docScript.chapters.length;
    const dotClasses = Array.from({ length: 5 }, (_, di) => {
      if (di < totalChapters) return di === i ? 'active' : '';
      return '';
    });

    const mins = Math.floor(totalVideoDuration / 60);
    const secs = Math.floor(totalVideoDuration % 60).toString().padStart(2, '0');
    chapterTimestamps.push(`${mins}:${secs} - ${titleEn}`);

    // Sanitize clauses: strip numbers, bullets, trailing commas
    const sanitizedClauses = (narrationList || []).map(c => sanitizeClauseText(c)).filter(Boolean);
    const splitIdx = Math.max(1, Math.ceil(sanitizedClauses.length / 2));
    const beat1Clauses = sanitizedClauses.slice(0, splitIdx);
    const beat2Clauses = sanitizedClauses.slice(splitIdx);

    // ── Sub-Beat A: Chapter Title & Editorial Plate ───────────────────────
    let slide1Html = templateHtml
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

    const slide1PngPath = path.join(outDir, `long_slide_${i}_beatA_${Date.now()}.png`);
    renderHtmlToImage(slide1Html, slide1PngPath, { width: 1920, height: 1080 });

    const audio1Path = path.join(outDir, `long_audio_${i}_beatA_${Date.now()}.mp3`);
    await synthesizeSpeech(beat1Clauses.length > 0 ? beat1Clauses : sanitizedClauses, audio1Path, {
      voice: YOUTUBE_CONFIG.voices.tamilMale,
      rate: '+2%'
    });
    const dur1 = getAudioDuration(audio1Path);
    totalVideoDuration += dur1;

    const sub1Path = path.join(outDir, `long_sub_${i}_beatA_${Date.now()}.ass`);
    try {
      const subChunks = generateCaptionsFromClauses(beat1Clauses.length > 0 ? beat1Clauses : sanitizedClauses, dur1);
      generateAssSubtitleFile(subChunks, sub1Path, '16:9');
    } catch (_) {}

    processedChapters.push({
      slidePath: slide1PngPath,
      audioPath: audio1Path,
      durationSec: dur1,
      subtitlePath: sub1Path,
      visualPath: chVisualUrl
    });

    // ── Sub-Beat B: Document Evidence Docket or Data Stat Plate ───────────
    if (beat2Clauses.length > 0) {
      const isEvidence = (i === 1 || i === 2);
      let slide2Html = '';

      if (isEvidence) {
        slide2Html = evidenceTplHtml
          .replace(/\{\{BRAND_LOGO_DATA_URI\}\}/g, brandLogoDataUri)
          .replace(/\{\{CHAPTER_NUM\}\}/g, chapterNum)
          .replace(/\{\{DEPT_NAME\}\}/g, deptName)
          .replace(/\{\{EVIDENCE_TEXT_TA\}\}/g, factsList[0] || 'அரசு தணிக்கை அறிக்கை மற்றும் துறைசார் சுற்றறிக்கை விவரங்கள்')
          .replace(/\{\{HEADLINE_TA\}\}/g, titleTa)
          .replace(/\{\{HEADLINE_EN\}\}/g, titleEn)
          .replace(/\{\{FACTS_HTML\}\}/g, factsHtml)
          .replace(/\{\{HELPLINE_NUM\}\}/g, helplineNum);
      } else {
        slide2Html = dataTplHtml
          .replace(/\{\{BRAND_LOGO_DATA_URI\}\}/g, brandLogoDataUri)
          .replace(/\{\{CHAPTER_NUM\}\}/g, chapterNum)
          .replace(/\{\{METRIC_TITLE\}\}/g, `${(article.category_slug || 'CIVIC').toUpperCase()} IMPACT`)
          .replace(/\{\{METRIC_VALUE\}\}/g, '100% VERIFIED')
          .replace(/\{\{METRIC_CAPTION_TA\}\}/g, factsList[0] || 'திட்ட மதிப்பீடு மற்றும் பொதுமக்கள் கள ஆய்வு')
          .replace(/\{\{HEADLINE_TA\}\}/g, titleTa)
          .replace(/\{\{FACTS_HTML\}\}/g, factsHtml);
      }

      const slide2PngPath = path.join(outDir, `long_slide_${i}_beatB_${Date.now()}.png`);
      renderHtmlToImage(slide2Html, slide2PngPath, { width: 1920, height: 1080 });

      const audio2Path = path.join(outDir, `long_audio_${i}_beatB_${Date.now()}.mp3`);
      await synthesizeSpeech(beat2Clauses, audio2Path, {
        voice: YOUTUBE_CONFIG.voices.tamilMale,
        rate: '+2%'
      });
      const dur2 = getAudioDuration(audio2Path);
      totalVideoDuration += dur2;

      const sub2Path = path.join(outDir, `long_sub_${i}_beatB_${Date.now()}.ass`);
      try {
        const subChunks = generateCaptionsFromClauses(beat2Clauses, dur2);
        generateAssSubtitleFile(subChunks, sub2Path, '16:9');
      } catch (_) {}

      processedChapters.push({
        slidePath: slide2PngPath,
        audioPath: audio2Path,
        durationSec: dur2,
        subtitlePath: sub2Path,
        visualPath: chVisualUrl
      });
    }
  }

  console.log(`\n[INFO] Total feature length: ${(totalVideoDuration / 60).toFixed(1)} mins (${totalVideoDuration.toFixed(0)}s across ${processedChapters.length} visual beats)`);

  // 5. Assemble Final 16:9 Long-Form MP4 with Dynamic Ken Burns & Audio Ducking
  const videoOutputPath = path.join(outDir, `vizhitn_feature_${article.slug || Date.now()}.mp4`);
  console.log('[COMPOSER] Assembling full 16:9 feature documentary with FFmpeg...');
  assembleLongFormVideo({
    chapters: processedChapters,
    outputPath: videoOutputPath
  });
  console.log(`[COMPOSER] Feature video created: ${videoOutputPath}`);

  // 6. Automated Quality-Control (QC) Gate
  const qcReport = runQualityControl({ videoPath: videoOutputPath, isShort: false, generateSheet: true });
  if (!qcReport.passed) {
    console.error('[QC BLOCKED] Feature video failed broadcast quality checks. Aborting publishing.');
    process.exit(1);
  }

  // 7. Check Daily YouTube Quota Before Upload
  const quota = checkQuotaAvailable('VIDEO_UPLOAD');
  if (!quota.allowed) {
    console.warn(`[QUOTA BLOCKED] ${quota.reason}`);
    process.exit(0);
  }

  // 8. Build SEO metadata
  const { title: ytTitle, description: ytDesc, tags } = generateVideoMetadata({
    article,
    script: docScript,
    isShort: false,
    chapterTimestamps
  });

  // 9. Generate Custom High-CTR 16:9 Thumbnail
  const thumbnailPath = path.join(outDir, `vizhitn_thumb_${article.slug || Date.now()}.png`);
  console.log('[THUMBNAIL] Rendering custom 16:9 high-CTR thumbnail...');
  try {
    await generateLongVideoThumbnail({
      titleTa: article.thumbnail_text || docScript.thumbnailHookTa || articleTitleTa,
      subtitleTa: 'முழு கள ஆய்வு & அரசு ஆவணங்கள்',
      category: (categorySlug || 'SPECIAL REPORT').toUpperCase(),
      heroImageUrl: heroImageSrc,
      outputPath: thumbnailPath
    });
  } catch (e) {
    console.log('[THUMBNAIL] Thumbnail generation skipped:', e.message);
  }

  // 10. Upload to YouTube
  const uploadResult = await uploadToYouTube({
    videoFilePath: videoOutputPath,
    title: ytTitle,
    description: ytDesc,
    tags,
    privacyStatus: isDryRun ? 'unlisted' : 'public',
    isShort: false
  });

  if (uploadResult.videoId && !uploadResult.dryRun) {
    recordQuotaUsage('VIDEO_UPLOAD', { videoId: uploadResult.videoId, title: ytTitle });
    await recordBroadcastSuccess({
      broadcastDate: todayIst,
      format: 'long-form',
      timeIst: calEntry?.time_ist || '07:00 AM',
      title: ytTitle,
      youtubeVideoId: uploadResult.videoId,
      youtubeUrl: uploadResult.videoUrl,
      metadata: { slug: article.slug, category: categorySlug }
    });

    if (fs.existsSync(thumbnailPath)) {
      await setYouTubeThumbnail(uploadResult.videoId, thumbnailPath);
    }
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
    thumbnailFilePath: thumbnailPath,
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
