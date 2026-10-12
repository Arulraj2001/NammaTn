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
import { uploadToYouTube } from '../engine/youtube-client.mjs';

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
  console.log('VizhiTN YouTube Automation — Conversational In-Depth Long Video');
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

  // 3. Define 4 Narrative Chapters in Conversational Spoken Tamil
  const chapterDefinitions = [
    {
      num: '01 / 04',
      titleTa: `அறிமுகம்: ${articleTitleTa}`,
      titleEn: `Overview: ${articleTitleEn}`,
      narration: [
        `ஹலோ மக்களே! விழி தமிழ்நாடு சிறப்பு திட்ட பார்வைக்கு உங்களை வரவேற்கிறோம்.`,
        `இன்னைக்கு நம்ம பார்க்க போற மிக முக்கியமான தலைப்பு: ${articleTitleTa}.`,
        `இந்த திட்டம் ஏன் தொடங்கப்பட்டுச்சு, இதனால தமிழ்நாட்டு மக்களுக்கு என்னென்ன நன்மைகள் கிடைக்க போகுதுன்னு விரிவா பார்க்கலாம்.`
      ],
      facts: [
        'தமிழ்நாட்டின் முன்னணி உள்கட்டமைப்பு மற்றும் வளர்ச்சி முன்னெடுப்பு',
        'பொதுமக்களின் அன்றாட வாழ்க்கை மற்றும் பயண நேரத்தில் ஏற்படும் மாற்றம்',
        'அரசு நிர்ணயித்துள்ள அதிகாரப்பூர்வ காலக்கெடு மற்றும் இலக்குகள்'
      ]
    },
    {
      num: '02 / 04',
      titleTa: 'திட்ட சிறப்பம்சங்கள் & கள விவரங்கள்',
      titleEn: 'Key Specifications, Budget & Timeline',
      narration: [
        `இரண்டாவது பகுதி: இந்த திட்டத்தின் முக்கிய சிறப்பம்சங்கள் மற்றும் நிதி ஒதுக்கீடு.`,
        `கள நிலவரப்படி, நவீன தொழில்நுட்ப வசதிகளோட பணிகள் தீவிரமா நடந்துட்டு வருது.`,
        `மக்கள் வரிப்பணம் சரியா பயன்படுத்தப்பட்டு, குறித்த நேரத்துக்குள்ள பணிகள் முடிக்கப்பட வேண்டும் என்பதே அனைவரின் எதிர்பார்ப்பு.`
      ],
      facts: [
        `திட்ட சுருக்கம்: ${(article.summary_en || article.summary_ta || '').slice(0, 90)}...`,
        'நவீன தரக்கட்டுப்பாடு மற்றும் பாதுகாப்பு வசதிகள் உறுதி',
        'துறைசார் பொறியாளர்களின் நேரடி கள ஆய்வு மற்றும் மேற்பார்வை'
      ]
    },
    {
      num: '03 / 04',
      titleTa: 'கள நிலவரம் & துறைசார் பொறுப்பு',
      titleEn: 'Ground Reality & Department Accountability',
      narration: [
        `மூன்றாவது பகுதி: துறைசார் பொறுப்பு மற்றும் மக்கள் கண்காணிப்பு.`,
        `இந்த திட்டத்தை முன்னெடுத்து செயல்படுத்தும் பொறுப்பு ${deptName} வசம் இருக்கு.`,
        `திட்ட பணிகள்ல ஏதேனும் குறைபாடுகள் இருந்தா, பொதுமக்கள் அதிகாரப்பூர்வ உதவி எண் ${helplineNum} மூலம் புகார் தெரிவிக்கலாம்.`
      ],
      facts: [
        `பொறுப்புத் துறை: ${deptName}`,
        `அரசு உதவி எண் மற்றும் நேரடி தொடர்பு: ${helplineNum}`,
        'பொதுமக்கள் கண்காணிப்பு மற்றும் வெளிப்படைத்தன்மை மிக அவசியம்'
      ]
    },
    {
      num: '04 / 04',
      titleTa: 'மக்கள் உரிமைகள் & முடிவுரை',
      titleEn: 'Citizen Rights & Next Steps',
      narration: [
        `இறுதி பகுதி: மக்கள் உரிமைகள் மற்றும் முடிவுரை.`,
        `அரசு திட்டங்கள் அனைத்து தரப்பு மக்களுக்கும் முழுமையா சென்றடைவதை உறுதி செய்வோம்.`,
        `இந்த முழுமையான அறிக்கையை படிக்க விழி டிஎன் டாட் இன் வலைத்தளத்தை பார்வையிடுங்க.`,
        `உங்கள் பகுதி பிரச்சனைகளை எங்களிடம் பகிருங்கள். விழி தமிழ்நாடு சேனலை மறக்காம சப்ஸ்கிரைப் பண்ணுங்க மக்களே!`
      ],
      facts: [
        'மக்கள் நலன் மற்றும் பொது வெளிப்படைத்தன்மை காப்போம்',
        'உங்கள் பகுதி பிரச்சனைகளை பதிவு செய்ய: vizhitn.in',
        'விழி தமிழ்நாடு சேனலை சப்ஸ்கிரைப் செய்து தொடர்ந்து இணையுங்கள்'
      ]
    }
  ];

  const templatePath = path.resolve('scripts/youtube/templates/long-form/chapter-slide.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');

  // 4. Generate Chapter Slides & Micro-TTS Audio
  const processedChapters = [];
  let totalVideoDuration = 0;
  const chapterTimestamps = [];

  for (let i = 0; i < chapterDefinitions.length; i++) {
    const ch = chapterDefinitions[i];
    console.log(`\n[CHAPTER ${i + 1}] Processing "${ch.titleEn}" in Spoken Tamil...`);

    let factsHtml = ch.facts.map(f => `
      <div class="fact-item">
        <span class="fact-icon">✦</span>
        <span>${f}</span>
      </div>
    `).join('');

    let slideHtml = templateHtml
      .replace('{{HERO_IMAGE_SRC}}', heroImageSrc)
      .replace('{{CHAPTER_NUM}}', ch.num)
      .replace('{{CATEGORY_NAME}}', (article.category_slug || 'DEVELOPMENT').toUpperCase())
      .replace('{{HEADLINE_TA}}', ch.titleTa)
      .replace('{{HEADLINE_EN}}', ch.titleEn)
      .replace('{{FACTS_HTML}}', factsHtml)
      .replace('{{DEPT_NAME}}', deptName)
      .replace('{{HELPLINE_NUM}}', helplineNum)
      .replace('{{LOCATION_TEXT}}', locationText);

    const slidePngPath = path.join(outDir, `long_slide_${i}_${Date.now()}.png`);
    renderHtmlToImage(slideHtml, slidePngPath, { width: 1920, height: 1080 });

    const audioPath = path.join(outDir, `long_audio_${i}_${Date.now()}.mp3`);
    await synthesizeSpeech(ch.narration, audioPath, {
      voice: YOUTUBE_CONFIG.voices.tamilMale,
      rate: '+3%'
    });

    const dur = getAudioDuration(audioPath);
    console.log(`[CHAPTER ${i + 1}] Slide: ${slidePngPath}, Audio: ${dur.toFixed(1)}s`);

    const mins = Math.floor(totalVideoDuration / 60);
    const secs = Math.floor(totalVideoDuration % 60).toString().padStart(2, '0');
    chapterTimestamps.push(`${mins}:${secs} - ${ch.titleEn}`);

    totalVideoDuration += dur;

    processedChapters.push({
      slidePath: slidePngPath,
      audioPath,
      durationSec: dur
    });
  }

  console.log(`\n[INFO] Total estimated feature length: ${(totalVideoDuration / 60).toFixed(1)} minutes`);

  // 5. Assemble Final 16:9 Long-Form MP4
  const videoOutputPath = path.join(outDir, `vizhitn_feature_${article.slug || Date.now()}.mp4`);
  console.log('[COMPOSER] Assembling full 16:9 feature video with FFmpeg...');
  assembleLongFormVideo({
    chapters: processedChapters,
    outputPath: videoOutputPath
  });
  console.log(`[COMPOSER] Feature video created: ${videoOutputPath}`);

  // 6. YouTube Upload Metadata with 2026 AI disclosure
  const ytTitle = `${articleTitleTa} | Full Explainer | VizhiTN Tamil Nadu`;
  const ytDesc = `${articleTitleTa}\n\n${article.summary_ta || article.summary_en || ''}\n\n` +
    `📌 Chapters:\n${chapterTimestamps.join('\n')}\n\n` +
    `🏛️ Responsible Department: ${deptName}\n` +
    `📞 Helpline: ${helplineNum}\n\n` +
    `🌐 Read the complete investigative report:\nhttps://vizhitn.in/tn-today/${article.slug}\n\n` +
    `#TamilNadu #VizhiTN #Infrastructure #Governance #TamilNaduNews #SpokenTamil`;

  const tags = ['Tamil Nadu', 'VizhiTN', 'TN Today', deptName, 'Tamil Nadu Governance', 'Infra TN', 'Citizen Rights'];

  const uploadResult = await uploadToYouTube({
    videoFilePath: videoOutputPath,
    title: ytTitle,
    description: ytDesc,
    tags,
    privacyStatus: isDryRun ? 'unlisted' : 'public',
    isShort: false
  });

  console.log('====================================================');
  console.log('CONVERSATIONAL FEATURE VIDEO GENERATED SUCCESSFULLY!');
  console.log('Video URL:', uploadResult.videoUrl);
  console.log('====================================================');

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
