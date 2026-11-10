// scripts/youtube/pipelines/generate-mindset-shorts.mjs
/**
 * VizhiTN Autonomous Student Discipline & Psychological Consistency Shorts Engine (9:16 Portrait)
 * Multi-Platform Production for YouTube Shorts, Instagram Reels, and Facebook Reels.
 * 
 * Key Features:
 * - Direct, authentic, anti-slop psychological triggers (Active Recall, Loss Aversion, Identity Shift)
 * - Pixabay API high-resolution vertical B-roll image integration
 * - Calm, commanding Edge-TTS voiceover via ta-IN-ValluvarNeural
 * - Atmospheric background focus drone sound design (-22dB)
 * - Safe-zone compliance (Instagram captions fold rule & YouTube bottom UI clearance)
 * - Unified cross-platform distribution (YouTube + Meta Graph API v21.0)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

import { getMindsetTopicForSlot, STUDENT_PSYCHOLOGY_TOPICS } from '../engine/student-psychology-catalog.mjs';
import { fetchPixabayMindsetImages } from '../engine/pixabay-mindset-fetcher.mjs';
import { generateMindsetHookSlideHtml, generateMindsetActionSlideHtml } from '../templates/mindset/mindset-slides.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube, postPinnedComment } from '../engine/youtube-client.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';
import { synthesizeGeminiSpeech } from '../engine/gemini-tts.mjs';
import { fetchJamendoMusicTrack } from '../engine/jamendo-music-fetcher.mjs';

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

/**
 * Synthesizes calm, commanding speech in spoken Tamil using Gemini Lifelike Voice
 * with Edge-TTS (ta-IN-ValluvarNeural) as a high-fidelity fallback.
 */
async function synthesizeMindsetSpeech(text, outputPath, voice = 'ta-IN-ValluvarNeural') {
  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Google Gemini Lifelike Neural Voice (Fenrir / Puck / karthik)
  const geminiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      console.log(`[MINDSET TTS] Synthesizing via Google Gemini Voice (Fenrir)...`);
      await synthesizeGeminiSpeech(cleanText, outputPath, { voice: 'Fenrir' });
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 2000) {
        console.log(`[MINDSET TTS ✓] Lifelike Gemini audio generated: ${path.basename(outputPath)}`);
        return outputPath;
      }
    } catch (geminiErr) {
      console.warn(`[MINDSET TTS WARN] Gemini TTS fallback to Edge-TTS: ${geminiErr.message}`);
    }
  }

  // 2. Microsoft Edge-TTS with humanized prosody & dramatic pauses
  const python = getPythonBinary();
  const tempTextFile = path.join(dir, `tts-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.txt`);
  fs.writeFileSync(tempTextFile, cleanText, 'utf-8');

  try {
    // Natural rate +0% (not rushed), pitch -1Hz for grounded resonance
    const edgeCmd = `${python} -m edge_tts --voice "${voice}" --rate="+0%" --pitch="-1Hz" --file "${tempTextFile}" --write-media "${outputPath}"`;
    execSync(edgeCmd, { stdio: 'pipe', timeout: 35000 });
    return outputPath;
  } finally {
    if (fs.existsSync(tempTextFile)) {
      try { fs.unlinkSync(tempTextFile); } catch {}
    }
  }
}

/**
 * Format Instagram-optimized Caption following the 125-character hook fold rule
 */
function buildInstaMindsetCaption(topic) {
  const firstLine = `🧠 ${topic.titleTa} | TNPSC Group 4 & Competitive Exams`;
  
  const body = [
    firstLine,
    '',
    `❌ தவறு: ${topic.hookTa}`,
    '',
    `💡 அறிவியல் உண்மை: ${topic.scriptTa.slice(0, 180)}...`,
    '',
    `⚡ இன்றே நீங்கள் செய்ய வேண்டியது:`,
    `👉 ${topic.actionStepTa}`,
    '',
    '📌 உங்கள் நண்பர்களுடன் பகிருங்கள்! அரசு வேலைக்கு தயாராகும் ஒவ்வொரு மாணவருக்கும் இது பயன்படும்.',
    '👉 தொடர் வெற்றி குறிப்புகளுக்கு @vizhi_tn பக்கத்தை Follow செய்யுங்கள்!',
    '',
    (topic.tags || []).join(' ')
  ].join('\n');

  return body;
}

/**
 * Main Pipeline Runner
 */
export async function runMindsetShortsPipeline({
  slot = 'auto',
  topicIndex = null,
  isDryRun = false,
  skipSocial = false
} = {}) {
  console.log('\n===============================================================');
  console.log('  VizhiTN Student Discipline & Psychological Shorts Engine     ');
  console.log('===============================================================\n');

  const topic = getMindsetTopicForSlot(slot, topicIndex);
  console.log(`[TOPIC SELECTED] ID: ${topic.id}`);
  console.log(`Title: ${topic.titleTa}`);
  console.log(`Category: ${topic.category} | Target: ${topic.targetExam}`);

  const sessionDir = path.resolve(`scripts/youtube/assets/mindset_${Date.now()}`);
  fs.mkdirSync(sessionDir, { recursive: true });

  try {
    // 1. Fetch Pixabay B-roll images
    console.log('\n[STEP 1] Fetching atmospheric study images from Pixabay...');
    const bgImages = await fetchPixabayMindsetImages(topic.pixabayQueries, 2);
    const bg1 = bgImages[0] || null;
    const bg2 = bgImages[1] || bgImages[0] || null;
    console.log(`[IMAGES READY] Scene 1: ${bg1 ? path.basename(bg1) : 'Default Gradient'}, Scene 2: ${bg2 ? path.basename(bg2) : 'Default Gradient'}`);

    // 1B. Fetch Studio-Recorded Cinematic Background Score from Jamendo
    console.log('\n[STEP 1B] Fetching studio-recorded cinematic background music from Jamendo...');
    const musicBedPath = await fetchJamendoMusicTrack(topic.category);
    if (musicBedPath) {
      console.log(`[MUSIC READY ✓] Background score: ${path.basename(musicBedPath)}`);
    }

    // 2. Synthesize Speech Audio (Scene 1: Hook, Scene 2: Insight & Action)
    console.log('\n[STEP 2] Synthesizing commanding Tamil speech with Edge-TTS (ta-IN-ValluvarNeural)...');
    
    // Scene 1 Audio: Hook
    const s1Text = `${topic.titleTa}. ${topic.hookTa}`;
    const s1Audio = path.join(sessionDir, 's1_hook.mp3');
    await synthesizeMindsetSpeech(s1Text, s1Audio);
    const s1Duration = getAudioDuration(s1Audio) || 6;
    console.log(`[AUDIO 1 OK] Scene 1 Hook Duration: ${s1Duration.toFixed(1)}s`);

    // Scene 2 Audio: The Deep Insight + Action Step
    const s2Text = `${topic.scriptTa} நினைவில் வையுங்கள்... ${topic.actionStepTa}`;
    const s2Audio = path.join(sessionDir, 's2_action.mp3');
    await synthesizeMindsetSpeech(s2Text, s2Audio);
    const s2Duration = getAudioDuration(s2Audio) || 24;
    console.log(`[AUDIO 2 OK] Scene 2 Insight Duration: ${s2Duration.toFixed(1)}s`);

    const totalDuration = s1Duration + s2Duration;
    console.log(`[TOTAL ESTIMATED DURATION] ~${totalDuration.toFixed(1)}s`);

    // 3. Render 1080x1920 PNG Slide Frames
    console.log('\n[STEP 3] Rendering 1080x1920 vertical canvas frames via Chrome headless...');
    const brandLogoUri = getBrandLogoDataUri();

    const s1Html = generateMindsetHookSlideHtml({ topic, bgImagePath: bg1, brandLogoDataUri: brandLogoUri });
    const s1FramePath = path.join(sessionDir, 'frame_scene_1.png');
    renderHtmlToImage(s1Html, s1FramePath, { width: 1080, height: 1920 });
    console.log(`[FRAME 1 OK] Rendered: ${path.basename(s1FramePath)}`);

    const s2Html = generateMindsetActionSlideHtml({ topic, bgImagePath: bg2, brandLogoDataUri: brandLogoUri });
    const s2FramePath = path.join(sessionDir, 'frame_scene_2.png');
    renderHtmlToImage(s2Html, s2FramePath, { width: 1080, height: 1920 });
    console.log(`[FRAME 2 OK] Rendered: ${path.basename(s2FramePath)}`);

    // 4. Assemble Multi-Scene Video via FFmpeg
    console.log('\n[STEP 4] Assembling 9:16 vertical Short with FFmpeg & Ken Burns zoom...');
    const scenes = [
      {
        imagePath: s1FramePath,
        slidePath: s1FramePath,
        audioPath: s1Audio,
        durationSec: Math.ceil(s1Duration) + 1
      },
      {
        imagePath: s2FramePath,
        slidePath: s2FramePath,
        audioPath: s2Audio,
        durationSec: Math.ceil(s2Duration) + 1
      }
    ];

    const outputVideoPath = path.join(sessionDir, `TNPSC_Mindset_${topic.id}.mp4`);
    assembleMultiSceneShortsVideo({ scenes, outputPath: outputVideoPath, musicBedPath });
    console.log(`[VIDEO ASSEMBLED ✓] Output: ${outputVideoPath} (${(fs.statSync(outputVideoPath).size / (1024*1024)).toFixed(2)} MB)`);

    // 5. Metadata Preparation
    const videoTitle = `TNPSC வெற்றி உத்தி: ${topic.titleTa} | Group 4 Mindset #Shorts`;
    const videoDescription = `${topic.titleTa} | TNPSC Group 4 & Competitive Exam Discipline\n\n🎯 ${topic.hookTa}\n\n🧠 உளவியல் உண்மை:\n${topic.scriptTa}\n\n⚡ செயல் திட்டம்:\n👉 ${topic.actionStepTa}\n\n🔔 அடுத்த சுய ஒழுக்க உத்தி பெற உடனே Subscribe செய்யுங்கள்!\n\n${(topic.tags || []).join(' ')}`;
    const videoTags = topic.tags?.map(t => t.replace('#', '')) || ['TNPSC', 'TNPSCGroup4', 'StudyDiscipline', 'TamilMotivation', 'Shorts'];
    const pinnedComment = `📌 *இன்றைய சுய ஒழுக்க சவால்:*\n\n👉 ${topic.actionStepTa}\n\nஇதை செய்து முடித்தவர்கள் "COMPLETED" என்று கமெண்ட் செய்யுங்கள்! 🔥 அடுத்த உத்திக்கு Subscribe செய்யுங்கள்! 🔔`;

    const instaCaption = buildInstaMindsetCaption(topic);

    // 6. Distribution Dispatch (YouTube, Instagram, Facebook)
    let ytResult = null;
    let metaResult = null;

    if (!skipSocial) {
      console.log('\n[STEP 5] Dispatching across YouTube Shorts, Instagram Reels & Facebook...');

      // 6A. YouTube Shorts
      try {
        console.log('[DISTRIBUTION] Uploading to YouTube Shorts...');
        ytResult = await uploadToYouTube({
          videoFilePath: outputVideoPath,
          title: videoTitle,
          description: videoDescription,
          tags: videoTags,
          isShort: true,
          isDryRun
        });

        if (ytResult && ytResult.id && !isDryRun) {
          console.log(`[YOUTUBE SUCCESS ✓] Published: https://youtube.com/shorts/${ytResult.id}`);
          try {
            await postPinnedComment(ytResult.id, pinnedComment);
            console.log('[YOUTUBE COMMENT ✓] Pinned action step comment posted!');
          } catch (cErr) {
            console.warn(`[COMMENT WARN] Could not pin comment: ${cErr.message}`);
          }
        }
      } catch (ytErr) {
        console.warn(`[YOUTUBE ERROR] Failed: ${ytErr.message}`);
      }

      // 6B. Meta Socials (Instagram Reels & Facebook Page Video)
      try {
        console.log('\n[DISTRIBUTION] Cross-posting to Instagram Reels & Facebook...');
        metaResult = await crossPostVideoToMetaSocials({
          videoFilePath: outputVideoPath,
          thumbnailFilePath: s1FramePath,
          title: videoTitle,
          caption: instaCaption,
          isReel: true,
          isDryRun
        });
        console.log('[META RESULT]', metaResult);
      } catch (metaErr) {
        console.warn(`[META ERROR] Failed: ${metaErr.message}`);
      }
    } else {
      console.log('[DISTRIBUTION SKIPPED] --skip-social or local preview mode');
    }

    console.log('\n===============================================================');
    console.log('  PIPELINE EXECUTION COMPLETE ✓                                ');
    console.log(`  Topic: ${topic.titleTa} (${topic.id})                       `);
    console.log(`  Video File: ${outputVideoPath}                               `);
    console.log('===============================================================\n');

    return {
      success: true,
      topic,
      outputVideoPath,
      s1FramePath,
      s2FramePath,
      ytResult,
      metaResult
    };

  } finally {
    // Keep video in sessionDir for preview or upload, but clean up temporary audio/html
    console.log(`[SESSION DIR] Render assets preserved at: ${sessionDir}`);
  }
}

// Direct CLI Invocation
const isMain = process.argv[1]?.endsWith('generate-mindset-shorts.mjs');
if (isMain) {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const skipSocial = args.includes('--skip-social');
  
  const slotArg = args.find(a => a.startsWith('--slot='))?.split('=')[1] || 'auto';
  const topicArg = args.find(a => a.startsWith('--topic='))?.split('=')[1];
  const topicIndex = topicArg !== undefined ? parseInt(topicArg, 10) : null;

  runMindsetShortsPipeline({ slot: slotArg, topicIndex, isDryRun, skipSocial })
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[FATAL PIPELINE ERROR]', err);
      process.exit(1);
    });
}

