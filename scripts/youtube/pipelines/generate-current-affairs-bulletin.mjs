// scripts/youtube/pipelines/generate-current-affairs-bulletin.mjs
/**
 * VizhiTN Autonomous Daily 8 PM Current Affairs Long-Form Bulletin Pipeline
 * 100% Automated, Live Sourced via RSS & Gemini, Voice via Neural Tamil Speech.
 * Composes 1080p 16:9 Long-Form Video with Chapter Timestamps & Thumbnails.
 */

import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

import { getDailyCurrentAffairsPackage, getNowIst } from '../engine/live-current-affairs-fetcher.mjs';
import { buildLongFormBulletinScript } from '../engine/bulletin-script-builder.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleLongFormVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { generateCurrentAffairsThumbnail } from '../engine/thumbnail-engine.mjs';
import { uploadToYouTube, setYouTubeThumbnail } from '../engine/youtube-client.mjs';
import { synthesizeGeminiSpeech } from '../engine/gemini-tts.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

function getPythonBinary() {
  for (const bin of ['python', 'python3']) {
    try {
      const ver = execSync(`${bin} --version`, { stdio: 'pipe', timeout: 5000 }).toString().trim();
      if (ver.startsWith('Python')) return bin;
    } catch {}
  }
  return 'python';
}

async function synthesizeSpeech(text, outputPath, voice = 'ta-IN-PallaviNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Prioritize Google Gemini Lifelike Neural Voice (via NEW_GEMINI_API_KEY)
  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[TTS] Synthesizing via Google Gemini Lifelike Voice for: "${cleanText.slice(0, 40)}..."`);
      await synthesizeGeminiSpeech(cleanText, outputPath, { voice: 'kavitha' });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 1000) {
        console.log(`[TTS ✓] Gemini speech generated successfully: ${path.basename(outputPath)}`);
        return outputPath;
      }
    } catch (geminiErr) {
      console.warn(`[TTS WARN] Gemini TTS unavailable (${geminiErr.message}). Seamlessly falling back to Edge-TTS...`);
    }
  }

  // 2. Safe Fallback to Microsoft Edge-TTS
  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    const args = ['-m', 'edge_tts', '--voice', voice, '--rate=+4%', '--file', tempTextFile, '--write-media', outputPath];
    execFileSync(python, args, { stdio: 'pipe', timeout: 45000, windowsHide: true });
    console.log(`[TTS ✓] Edge-TTS speech generated: ${path.basename(outputPath)}`);
  } finally {
    try { if (fs.existsSync(tempTextFile)) fs.unlinkSync(tempTextFile); } catch (_) {}
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error(`TTS synthesis failed to write file: ${outputPath}`);
  }
  return outputPath;
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const skipUpload = args.includes('--skip-upload') || isDryRun;
  const dateArg = args.find(a => a.startsWith('--date='))?.split('=')[1] || null;

  const now = getNowIst();
  console.log('====================================================');
  console.log('VizhiTN Autonomous 8 PM Current Affairs Bulletin');
  console.log(`Current Time (IST): ${now.dateStr} ${now.hours.toString().padStart(2, '0')}:${now.minutes.toString().padStart(2, '0')}`);
  console.log(`Execution Mode: ${isDryRun ? 'DRY RUN' : 'PRODUCTION'}`);
  console.log('====================================================');

  // Step 1: Live News & Grounding Package
  console.log('\n[STEP 1/6] Sourcing live last 24h Tamil Nadu current affairs...');
  const pkg = await getDailyCurrentAffairsPackage(dateArg);
  console.log(`[DATA OK] Captured ${pkg.eventCount} verified events for ${pkg.tamilDate}.`);

  // Step 2: Script & Chapter Synthesis
  console.log('\n[STEP 2/6] Synthesizing TNPSC exam pointers and chapter timestamps...');
  const scriptPkg = buildLongFormBulletinScript(pkg);
  console.log(`[SCRIPT OK] Title: ${scriptPkg.title}`);
  console.log(`[SCRIPT OK] Estimated Duration: ~${Math.round(scriptPkg.totalDurationEstimated / 60)} minutes (${scriptPkg.segments.length} segments)`);

  const sessionDir = path.resolve(`scripts/youtube/assets/bulletin_${Date.now()}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const templateHtml = fs.readFileSync(path.resolve('scripts/youtube/templates/newsroom/current-affairs-slide.html'), 'utf8');

  // Step 3: Slide & Voice Generation for Chapters
  console.log('\n[STEP 3/6] Generating 1080p newsroom slides & neural Tamil speech...');
  const chapters = [];

  // Chapter 0: Intro
  const introSlideHtml = templateHtml
    .replace('{{CATEGORY_LABEL}}', 'தினசரி சிறப்புத் தொகுப்பு')
    .replace('{{SEGMENT_INDEX}}', '0')
    .replace('{{TOTAL_SEGMENTS}}', scriptPkg.segments.length.toString())
    .replace('{{TAMIL_DATE}}', scriptPkg.tamilDate)
    .replace('{{HEADLINE_TA}}', 'தமிழ்நாடு 24 மணி நேர நடப்பு நிகழ்வுகள்')
    .replace('{{CORE_FACTS_TA}}', 'இன்றைய முக்கிய அரசுத் திட்டங்கள், நீதிமன்றத் தீர்ப்புகள், மற்றும் டி.என்.பி.எஸ்.சி தேர்வுக்கான முக்கியக் குறிப்புகள்.')
    .replace('{{EXAM_POINTER_TA}}', 'TNPSC Group 1, 2, 4, Police SI & Banking தேர்வுகளுக்கான பிரத்யேக பாடத் தொகுப்பு.')
    .replace('{{RECALL_QUESTION_TA}}', 'முழு வீடியோவைப் பார்த்து குறிப்பெடுத்துக் கொள்ளுங்கள்.')
    .replace('{{SOURCE_NAME}}', 'DIPR / High Court / தமிழக அரசு');

  const introSlidePath = path.join(sessionDir, 'slide_0_intro.png');
  renderHtmlToImage(introSlideHtml, introSlidePath, { width: 1920, height: 1080 });

  const introAudioPath = path.join(sessionDir, 'audio_0_intro.mp3');
  await synthesizeSpeech(scriptPkg.intro.text, introAudioPath);
  const introDuration = getAudioDuration(introAudioPath);

  chapters.push({
    slidePath: introSlidePath,
    audioPath: introAudioPath,
    durationSec: Math.ceil(introDuration) + 1
  });
  console.log(`[CHAPTER 0] Intro ready (${Math.ceil(introDuration)}s)`);

  // Chapters 1..N: Segments
  for (let i = 0; i < scriptPkg.segments.length; i++) {
    const seg = scriptPkg.segments[i];
    console.log(`[CHAPTER ${i + 1}/${scriptPkg.segments.length}] Processing "${seg.headlineTa}"...`);

    const slideHtml = templateHtml
      .replace('{{CATEGORY_LABEL}}', seg.categoryLabel)
      .replace('{{SEGMENT_INDEX}}', seg.index.toString())
      .replace('{{TOTAL_SEGMENTS}}', scriptPkg.segments.length.toString())
      .replace('{{TAMIL_DATE}}', scriptPkg.tamilDate)
      .replace('{{HEADLINE_TA}}', seg.headlineTa)
      .replace('{{CORE_FACTS_TA}}', seg.coreFactsTa)
      .replace('{{EXAM_POINTER_TA}}', seg.examPointerTa)
      .replace('{{RECALL_QUESTION_TA}}', seg.recallQuestionTa)
      .replace('{{SOURCE_NAME}}', seg.sourceName || 'செய்தி குறிப்பு');

    const slidePath = path.join(sessionDir, `slide_${i + 1}.png`);
    renderHtmlToImage(slideHtml, slidePath, { width: 1920, height: 1080 });

    const audioPath = path.join(sessionDir, `audio_${i + 1}.mp3`);
    await synthesizeSpeech(seg.spokenText, audioPath);
    const duration = getAudioDuration(audioPath);

    chapters.push({
      slidePath,
      audioPath,
      durationSec: Math.ceil(duration) + 1
    });
  }

  // Chapter Outro
  const outroSlideHtml = templateHtml
    .replace('{{CATEGORY_LABEL}}', 'சுய மதிப்பீட்டு வினாடி-வினா')
    .replace('{{SEGMENT_INDEX}}', (scriptPkg.segments.length + 1).toString())
    .replace('{{TOTAL_SEGMENTS}}', (scriptPkg.segments.length + 1).toString())
    .replace('{{TAMIL_DATE}}', scriptPkg.tamilDate)
    .replace('{{HEADLINE_TA}}', 'இன்றைய மாதிரி வினா-விடை & நினைவுகூர்க!')
    .replace('{{CORE_FACTS_TA}}', 'இன்றைய பதிவில் கேட்கப்பட்ட வினாக்களுக்கான விடைகளை உடனே கமெண்ட் பகுதியில் பதிவிடுங்கள்.')
    .replace('{{EXAM_POINTER_TA}}', 'தொடர் பயிற்சி மட்டுமே தேர்வில் வெற்றியை உறுதி செய்யும்.')
    .replace('{{RECALL_QUESTION_TA}}', 'சரியான விடைகளை கமெண்ட் செய்யவும்! சேனலை சப்ஸ்கிரைப் செய்யவும்.')
    .replace('{{SOURCE_NAME}}', 'VizhiTN TNPSC Academy');

  const outroSlidePath = path.join(sessionDir, 'slide_outro.png');
  renderHtmlToImage(outroSlideHtml, outroSlidePath, { width: 1920, height: 1080 });

  const outroAudioPath = path.join(sessionDir, 'audio_outro.mp3');
  await synthesizeSpeech(scriptPkg.outro.text, outroAudioPath);
  const outroDuration = getAudioDuration(outroAudioPath);

  chapters.push({
    slidePath: outroSlidePath,
    audioPath: outroAudioPath,
    durationSec: Math.ceil(outroDuration) + 1
  });
  console.log(`[CHAPTER OUTRO] Outro ready (${Math.ceil(outroDuration)}s)`);

  // Step 4: Video Assembly
  console.log('\n[STEP 4/6] Assembling full 1080p Long-Form Bulletin Video with FFmpeg...');
  const outputVideoPath = path.join(sessionDir, `TNPSC_Current_Affairs_${now.dateStr}.mp4`);
  assembleLongFormVideo({ chapters, outputPath: outputVideoPath });
  console.log(`[VIDEO OK] Video assembled successfully at: ${outputVideoPath}`);

  // Step 5: High-CTR Thumbnail Generation
  console.log('\n[STEP 5/6] Generating 1280x720 High-CTR Thumbnail...');
  const thumbnailPath = path.join(sessionDir, `TNPSC_Current_Affairs_Thumb_${now.dateStr}.png`);
  await generateCurrentAffairsThumbnail({
    tamilDate: scriptPkg.tamilDate,
    topHeadline: scriptPkg.segments[0]?.headlineTa || 'இன்றைய டாப் 10 நடப்பு நிகழ்வுகள்',
    subHeadline: `${scriptPkg.segments.length} முக்கிய தலைப்புகள் • அரசுத் திட்டங்கள் • நீதிமன்றத் தீர்ப்புகள்`,
    outputPath: thumbnailPath
  });
  console.log(`[THUMBNAIL OK] Thumbnail saved at: ${thumbnailPath}`);

  // Step 6: YouTube Upload / Dry Run Summary
  console.log('\n[STEP 6/6] YouTube Dispatch...');
  if (skipUpload) {
    console.log('\n--- [DRY RUN / SKIP UPLOAD SUMMARY] ---');
    console.log(`Video File: ${outputVideoPath}`);
    console.log(`Thumbnail:  ${thumbnailPath}`);
    console.log(`Title:      ${scriptPkg.title}`);
    console.log(`Tags:       ${scriptPkg.tags.slice(0, 6).join(', ')}...`);
    console.log('\nDescription Preview:\n' + scriptPkg.description.slice(0, 450) + '\n...');
    console.log('\n[SUCCESS ✓] 8 PM Current Affairs Bulletin generation validated successfully!');
    return;
  }

  console.log('[YOUTUBE] Uploading video to YouTube Data API v3...');
  const result = await uploadToYouTube({
    videoFilePath: outputVideoPath,
    title: scriptPkg.title,
    description: scriptPkg.description,
    tags: scriptPkg.tags,
    categoryId: '27', // Education
    privacyStatus: 'public',
    isShort: false
  });

  console.log(`[YOUTUBE ✓] Published: ${result.videoUrl} (ID: ${result.videoId})`);

  if (fs.existsSync(thumbnailPath) && result.videoId) {
    console.log('[YOUTUBE] Setting high-CTR thumbnail...');
    await setYouTubeThumbnail(result.videoId, thumbnailPath);
    console.log('[YOUTUBE ✓] Custom thumbnail uploaded successfully.');
  }

  console.log('\n====================================================');
  console.log(`[BROADCAST COMPLETE ✓] Today's 8 PM Bulletin is LIVE!`);
  console.log(`URL: ${result.videoUrl}`);
  console.log('====================================================');
}

main().catch(err => {
  console.error('\n[FATAL BULLETIN PIPELINE ERROR]:', err);
  process.exit(1);
});
