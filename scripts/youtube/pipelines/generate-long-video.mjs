// scripts/youtube/pipelines/generate-long-video.mjs
// Weekly 3x Long-Form In-Depth Video Generator (1920x1080, 16:9, 3-5 Mins)

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { YOUTUBE_CONFIG } from '../config.mjs';
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
  console.log('VizhiTN YouTube Automation — Weekly In-Depth Long Video');
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
  console.log(`[INFO] Loaded article: "${articleTitleEn}"`);

  // 2. Prepare visual assets & hero image
  let heroImageSrc = article.hero_image_url;
  if (!heroImageSrc || !heroImageSrc.startsWith('http')) {
    heroImageSrc = 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80';
  }

  const deptName = article.department_name || 'Government of Tamil Nadu';
  const helplineNum = article.helpline || '1100 / 1912';
  const locationText = `${article.district_focus || 'Tamil Nadu'} | தமிழ்நாடு`;

  // 3. Define 4 Narrative Chapters
  const chapterDefinitions = [
    {
      num: '01 / 04',
      titleTa: `அறிமுகம்: ${articleTitleTa}`,
      titleEn: `Overview: ${articleTitleEn}`,
      narration: `வணக்கம். விழி தமிழ்நாடு சிறப்பு புலனாய்வு மற்றும் திட்ட பார்வை. இன்றைய முக்கிய தலைப்பு: ${articleTitleTa}. இந்த திட்டத்தின் பின்னணி மற்றும் தமிழ்நாடு அரசின் தற்போதைய நிலை குறித்த முழுமையான அலசல் இதோ.`,
      facts: [
        'தமிழ்நாட்டின் முன்னணி உள்கட்டமைப்பு மற்றும் நிர்வாக முன்னெடுப்பு',
        'பொதுமக்களின் அன்றாட வாழ்க்கை மற்றும் பொருளாதாரத்தில் ஏற்படும் மாற்றங்கள்',
        'திட்ட இலக்கு மற்றும் அதிகாரப்பூர்வ காலக்கெடு விவரங்கள்'
      ]
    },
    {
      num: '02 / 04',
      titleTa: 'திட்ட சிறப்பம்சங்கள் & நிதி ஒதுக்கீடு',
      titleEn: 'Key Specifications, Budget & Timeline',
      narration: `இரண்டாவது பகுதி: திட்டத்தின் நிதி ஒதுக்கீடு மற்றும் கள விவரங்கள். ${(article.summary_ta || article.summary_en || '').slice(0, 200)}. அரசு திட்ட மதிப்பீட்டின்படி உரிய காலத்திற்குள் பணிகளை முடிக்க திட்டமிடப்பட்டுள்ளது.`,
      facts: [
        `திட்ட சுருக்கம்: ${(article.summary_en || '').slice(0, 80)}...`,
        'நவீன தொழில்நுட்ப பயன்பாடு மற்றும் தரக் கட்டுப்பாடு உறுதி',
        'மாவட்ட நிர்வாகம் மற்றும் துறைசார் பொறியாளர்களின் நேரடி கண்காணிப்பு'
      ]
    },
    {
      num: '03 / 04',
      titleTa: 'கள நிலவரம் & துறைசார் பொறுப்புக்கூறல்',
      titleEn: 'Ground Reality & Department Accountability',
      narration: `மூன்றாவது பகுதி: துறைசார் பொறுப்பு மற்றும் கள ஆய்வு. இந்த திட்டத்தை செயல்படுத்தும் பொறுப்பு ${deptName} வசம் உள்ளது. ஏதேனும் குறைகள் அல்லது புகார்கள் இருந்தால் அதிகாரப்பூர்வ உதவி எண் ${helplineNum} மூலம் பொது மக்கள் தொடர்பு கொள்ளலாம்.`,
      facts: [
        `பொறுப்புத் துறை: ${deptName}`,
        `அரசு உதவி எண் மற்றும் நேரடி கட்டுப்பாட்டு அறை: ${helplineNum}`,
        'பொதுமக்கள் கண்காணிப்பு மற்றும் வெளிப்படைத்தன்மை அவசியம்'
      ]
    },
    {
      num: '04 / 04',
      titleTa: 'மக்கள் உரிமை & முடிவுரை',
      titleEn: 'Citizen Rights & Strategic Outlook',
      narration: `இறுதி பகுதி: மக்கள் உரிமை மற்றும் முடிவுரை. அரசு திட்டங்களின் பயன் ஒவ்வொரு குடிமகனுக்கும் முழுமையாக சென்றடைய வேண்டும். இந்த விரிவான கட்டுரையை முழுமையாக படிக்க விழி டிஎன் டாட் இன் வலைத்தளத்தைப் பாருங்கள். உங்கள் மாவட்ட பிரச்சனைகளை உடனுக்குடன் பதிவு செய்யுங்கள். நன்றி, வணக்கம்.`,
      facts: [
        'அரசு திட்டங்களில் வெளிப்படைத்தன்மை பெற மக்கள் களம்',
        'உங்கள் பகுதி பிரச்சனைகளை பதிவு செய்ய: vizhitn.in',
        'விழி தமிழ்நாடு சேனலை சப்ஸ்கிரைப் செய்து தொடர்ந்து இணையுங்கள்'
      ]
    }
  ];

  const templatePath = path.resolve('scripts/youtube/templates/long-form/chapter-slide.html');
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');

  // 4. Generate Chapter Slides & Audio
  const processedChapters = [];
  let totalVideoDuration = 0;
  const chapterTimestamps = [];

  for (let i = 0; i < chapterDefinitions.length; i++) {
    const ch = chapterDefinitions[i];
    console.log(`\n[CHAPTER ${i + 1}] Processing "${ch.titleEn}"...`);

    // Render HTML Slide to PNG
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

    // Synthesize Audio
    const audioPath = path.join(outDir, `long_audio_${i}_${Date.now()}.mp3`);
    await synthesizeSpeech(ch.narration, audioPath, {
      voice: YOUTUBE_CONFIG.voices.tamilMale,
      rate: '+2%'
    });

    const dur = getAudioDuration(audioPath);
    console.log(`[CHAPTER ${i + 1}] Slide: ${slidePngPath}, Audio duration: ${dur.toFixed(1)}s`);

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

  console.log(`\n[INFO] Total estimated video length: ${(totalVideoDuration / 60).toFixed(1)} minutes`);

  // 5. Assemble Final 16:9 Long-Form MP4
  const videoOutputPath = path.join(outDir, `vizhitn_feature_${article.slug || Date.now()}.mp4`);
  console.log('[COMPOSER] Assembling full 16:9 feature video with FFmpeg...');
  assembleLongFormVideo({
    chapters: processedChapters,
    outputPath: videoOutputPath
  });
  console.log(`[COMPOSER] Feature video created: ${videoOutputPath}`);

  // 6. YouTube Upload Metadata
  const ytTitle = `${article.title_ta || article.title_en} | Full Explainer | VizhiTN Tamil Nadu`;
  const ytDesc = `${article.title_ta || article.title_en}\n\n${article.summary_ta || article.summary_en || ''}\n\n` +
    `📌 Chapters:\n${chapterTimestamps.join('\n')}\n\n` +
    `🏛️ Responsible Department: ${deptName}\n` +
    `📞 Helpline: ${helplineNum}\n\n` +
    `🌐 Read the complete investigative report with official documents:\nhttps://vizhitn.in/tn-today/${article.slug}\n\n` +
    `#TamilNadu #VizhiTN #Infrastructure #Governance #TamilNaduNews`;

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
  console.log('LONG-FORM VIDEO PIPELINE COMPLETED SUCCESSFULLY!');
  console.log('Video URL:', uploadResult.videoUrl);
  console.log('====================================================');

  // Cleanup temporary chapter files
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
