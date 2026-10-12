// scripts/youtube/pipelines/generate-long-video.mjs
// Weekly 3x Long-Form In-Depth Explainer (Spoken Tamil, 16:9, Multi-Chapter, 3-5 Mins)

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { normalizeAcronymsToSpokenTamil } from '../engine/tamil-phonetics.mjs';
import { synthesizeSpeech } from '../engine/tts-engine.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleLongFormVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { generateLongVideoThumbnail } from '../engine/thumbnail-engine.mjs';
import { uploadToYouTube, setYouTubeThumbnail } from '../engine/youtube-client.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';

import { generateDocumentaryScript } from '../engine/script-writer.mjs';

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

  const deptName = normalizeAcronymsToSpokenTamil(article.department_name || 'தமிழ்நாடு அரசு');
  const helplineNum = normalizeAcronymsToSpokenTamil(article.helpline || '1100 / 1912');
  const locationText = `${article.district_focus || 'Tamil Nadu'} | தமிழ்நாடு`;

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

    let factsHtml = factsList.map(f => `
      <div class="fact-item">
        <span class="fact-icon">✦</span>
        <span>${f}</span>
      </div>
    `).join('');

    let slideHtml = templateHtml
      .replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri)
      .replace('{{HERO_IMAGE_SRC}}', heroImageSrc)
      .replace('{{CHAPTER_NUM}}', chapterNum)
      .replace('{{CATEGORY_NAME}}', (article.category_slug || 'DEVELOPMENT').toUpperCase())
      .replace('{{HEADLINE_TA}}', titleTa)
      .replace('{{HEADLINE_EN}}', titleEn)
      .replace('{{FACTS_HTML}}', factsHtml)
      .replace('{{DEPT_NAME}}', deptName)
      .replace('{{HELPLINE_NUM}}', helplineNum)
      .replace('{{LOCATION_TEXT}}', locationText);

    const slidePngPath = path.join(outDir, `long_slide_${i}_${Date.now()}.png`);
    renderHtmlToImage(slideHtml, slidePngPath, { width: 1920, height: 1080 });

    const audioPath = path.join(outDir, `long_audio_${i}_${Date.now()}.mp3`);
    await synthesizeSpeech(narrationList, audioPath, {
      voice: YOUTUBE_CONFIG.voices.tamilMale,
      rate: '+2%'
    });

    const dur = getAudioDuration(audioPath);
    console.log(`[CHAPTER ${i + 1}] Slide: ${slidePngPath}, Audio: ${dur.toFixed(1)}s`);

    const mins = Math.floor(totalVideoDuration / 60);
    const secs = Math.floor(totalVideoDuration % 60).toString().padStart(2, '0');
    chapterTimestamps.push(`${mins}:${secs} - ${titleEn}`);

    totalVideoDuration += dur;

    processedChapters.push({
      slidePath: slidePngPath,
      audioPath,
      durationSec: dur
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

  // 6. High-Ranking 2026 YouTube SEO Metadata (<95 chars for YouTube API)
  const shortTa = articleTitleTa.length > 50 ? articleTitleTa.slice(0, 48) + '...' : articleTitleTa;
  const ytTitle = (docScript.youtubeTitle || `${shortTa} | Ground Reality Explainer | VizhiTN`).slice(0, 95);
  const ytDesc = `🔍 ${articleTitleTa} — முழு கள ஆய்வு மற்றும் அரசு ஆவணங்கள் விவரம்! 👇\n\n` +
    `${article.summary_ta || article.summary_en || ''}\n\n` +
    `📌 அத்தியாயங்கள் / Chapters:\n${chapterTimestamps.join('\n')}\n\n` +
    `🏛️ பொறுப்புத் துறை / Department: ${deptName}\n` +
    `📞 அரசு உதவி எண் / Helpline: ${helplineNum}\n\n` +
    `📌 உங்கள் பாதுகாப்பிற்கு சேமித்து (Save) வைத்துக் கொள்ளுங்கள்! நண்பர்களுக்கும் பகிருங்கள் ↗️\n` +
    `💬 இந்த திட்டம் பற்றி உங்கள் கருத்து என்ன? கமெண்டில் சொல்லுங்கள் 👇\n\n` +
    `🌐 முழுமையான புலனாய்வு கட்டுரையை படிக்க: https://vizhitn.in/tn-today/${article.slug}\n\n` +
    `#TamilNadu #VizhiTN #TNToday #TamilNaduGovernance #InfrastructureTN #GroundReality #SpokenTamil #TNNews`;

  const tags = [
    'Tamil Nadu',
    'VizhiTN',
    'TN Today',
    deptName,
    'Tamil Nadu Governance',
    'Infra TN',
    'Ground Reality Tamil',
    'Citizen Rights'
  ];

  const uploadResult = await uploadToYouTube({
    videoFilePath: videoOutputPath,
    title: ytTitle,
    description: ytDesc,
    tags,
    privacyStatus: isDryRun ? 'unlisted' : 'public',
    isShort: false
  });

  // 7. Generate & Upload Custom High-CTR 16:9 Thumbnail
  const thumbnailPath = path.join(outDir, `vizhitn_thumb_${article.slug || Date.now()}.png`);
  console.log('[THUMBNAIL] Rendering custom 16:9 high-CTR thumbnail...');
  await generateLongVideoThumbnail({
    titleTa: docScript.thumbnailHookTa || articleTitleTa,
    subtitleTa: 'முழு கள ஆய்வு & அரசு ஆவணங்கள்',
    category: (article.category_slug || 'SPECIAL REPORT').toUpperCase(),
    heroImageUrl: heroImageSrc,
    outputPath: thumbnailPath
  });

  if (uploadResult.videoId) {
    await setYouTubeThumbnail(uploadResult.videoId, thumbnailPath);
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
    } catch {}
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN LONG-FORM PIPELINE]:', err);
  process.exit(1);
});
