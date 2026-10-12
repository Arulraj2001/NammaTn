// scripts/youtube/pipelines/generate-rights-shorts.mjs
// Daily 1:30 PM IST Citizen Legal & Practical Dispute Solution Engine (9:16 Shorts / Reels)
// Covers everyday tenant, neighbor, police, bribery, consumer, and cyber disputes.

import fs from 'fs';
import path from 'path';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { CITIZEN_DISPUTE_TOPICS } from '../engine/tamil-phonetics.mjs';
import { synthesizeSpeech } from '../engine/tts-engine.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { assembleMultiSceneShortsVideo, getAudioDuration } from '../engine/video-composer.mjs';
import { generateYouTubeSceneVisual } from '../engine/cloudflare-visuals.mjs';
import { uploadToYouTube } from '../engine/youtube-client.mjs';

// Load .env.local if running in local environment
try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

async function main() {
  console.log('====================================================');
  console.log('VizhiTN YouTube Automation — Citizen Rights & Dispute Guide');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const outDir = path.resolve('public/youtube_renders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // 1. Pick a dispute topic based on day of year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const topicIndex = dayOfYear % CITIZEN_DISPUTE_TOPICS.length;
  const topic = CITIZEN_DISPUTE_TOPICS[topicIndex];

  console.log(`[TOPIC] Selected dispute guide: "${topic.titleEn}"`);

  // 2. Draft Spoken Conversational 3-Scene Script
  const scene1Script = [
    `ஹலோ மக்களே! இன்னைக்கு நீங்க தெரிஞ்சுக்க வேண்டிய ஒரு மிக முக்கியமான நடைமுறை சட்ட தீர்வு!`,
    topic.hookTa
  ];

  const scene2Script = [
    `ஸ்டெப் 1: ${topic.step1Behave}`,
    `ஸ்டெப் 2: ${topic.step2Evidence}`
  ];

  const scene3Script = [
    `ஸ்டெப் 3: ${topic.step3Legal}`,
    `அதிகாரப்பூர்வ உதவிக்கு ${topic.helplineText}.`,
    `இந்த சட்ட விழிப்புணர்வை உங்க பிரண்ட்ஸ் மற்றும் குடும்பத்தினருக்கு மறக்காம ஷேர் பண்ணுங்க, விழி தமிழ்நாடு சேனலை சப்ஸ்கிரைப் பண்ணிக்கோங்க!`
  ];

  // 3. Synthesize Audio for each scene with micro-chunk engine
  console.log('[TTS] Synthesizing Scene 1 audio (Problem Hook)...');
  const s1AudioPath = path.join(outDir, `rights_s1_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene1Script, s1AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+3%' });
  const s1Dur = getAudioDuration(s1AudioPath);

  console.log('[TTS] Synthesizing Scene 2 audio (Behavior & Evidence)...');
  const s2AudioPath = path.join(outDir, `rights_s2_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene2Script, s2AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+3%' });
  const s2Dur = getAudioDuration(s2AudioPath);

  console.log('[TTS] Synthesizing Scene 3 audio (Legal Sections & Helplines)...');
  const s3AudioPath = path.join(outDir, `rights_s3_audio_${Date.now()}.mp3`);
  await synthesizeSpeech(scene3Script, s3AudioPath, { voice: YOUTUBE_CONFIG.voices.tamilFemale, rate: '+3%' });
  const s3Dur = getAudioDuration(s3AudioPath);

  console.log(`[AUDIO STATS] S1: ${s1Dur.toFixed(1)}s, S2: ${s2Dur.toFixed(1)}s, S3: ${s3Dur.toFixed(1)}s | Total: ${(s1Dur + s2Dur + s3Dur).toFixed(1)}s`);

  // 4. Generate Visuals: Scene 1 Photo
  const fluxPrompt = `Indian citizen discussing rights at legal advisory desk in Tamil Nadu Chennai, modern documentary style, natural dramatic lighting`;
  const heroPhotoPath = path.join(outDir, `rights_flux_hero_${Date.now()}.webp`);
  let heroPhotoUrl = await generateYouTubeSceneVisual(fluxPrompt, heroPhotoPath, '9:16');
  if (!heroPhotoUrl) {
    heroPhotoUrl = 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1080&q=80';
  }

  // 5. Render Scene 1 Hook Frame
  const tplS1Path = path.resolve('scripts/youtube/templates/shorts/scene-1-hook.html');
  let tplS1 = fs.readFileSync(tplS1Path, 'utf-8');
  tplS1 = tplS1.replace('{{SCENE_PHOTO_SRC}}', heroPhotoUrl);
  tplS1 = tplS1.replace('{{HOOK_HEADLINE_TA}}', topic.titleTa);
  tplS1 = tplS1.replace('{{DATE_TEXT}}', 'விழி சட்டம் & உரிமைகள்');

  const s1FramePath = path.join(outDir, `rights_s1_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS1, s1FramePath, { width: 1080, height: 1920 });

  // 6. Render Scene 2 Breakdown Frame
  const tplS2Path = path.resolve('scripts/youtube/templates/shorts/scene-2-breakdown.html');
  let tplS2 = fs.readFileSync(tplS2Path, 'utf-8');
  tplS2 = tplS2.replace('{{DIGEST_TITLE_TA}}', topic.titleTa);

  const stepsCardsHtml = `
    <div class="alert-card warn">
      <div class="card-top">
        <span class="cat-name">STEP 1</span>
        <span class="dist-name">முதற்கட்ட அணுகுமுறை</span>
      </div>
      <div class="card-title">${topic.step1Behave.slice(0, 90)}...</div>
      <div class="card-timing">நிதானமாக பேசுங்கள் | சண்டை போடாதீர்கள்</div>
    </div>
    <div class="alert-card">
      <div class="card-top">
        <span class="cat-name">STEP 2</span>
        <span class="dist-name">ஆதாரங்களை திரட்டுங்கள்</span>
      </div>
      <div class="card-title">${topic.step2Evidence.slice(0, 90)}...</div>
      <div class="card-timing">WhatsApp / Bank / Video ஆதாரம் முக்கியம்</div>
    </div>
  `;
  tplS2 = tplS2.replace('{{ALERTS_CARDS_HTML}}', stepsCardsHtml);

  const s2FramePath = path.join(outDir, `rights_s2_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS2, s2FramePath, { width: 1080, height: 1920 });

  // 7. Render Scene 3 Helpline Frame
  const tplS3Path = path.resolve('scripts/youtube/templates/shorts/scene-3-helpline.html');
  const tplS3 = fs.readFileSync(tplS3Path, 'utf-8');
  const s3FramePath = path.join(outDir, `rights_s3_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS3, s3FramePath, { width: 1080, height: 1920 });

  // 8. Assemble Multi-Scene Video with Ken Burns Motion
  const videoOutputPath = path.join(outDir, `vizhitn_rights_${topic.id}_${Date.now()}.mp4`);
  console.log('[COMPOSER] Assembling 3-Scene Citizen Rights Video...');

  const scenes = [
    { imagePath: s1FramePath, audioPath: s1AudioPath, durationSec: s1Dur, hasMotion: true },
    { imagePath: s2FramePath, audioPath: s2AudioPath, durationSec: s2Dur, hasMotion: false },
    { imagePath: s3FramePath, audioPath: s3AudioPath, durationSec: s3Dur, hasMotion: false }
  ];

  assembleMultiSceneShortsVideo({
    scenes,
    outputPath: videoOutputPath
  });

  console.log(`[COMPOSER] Video generated: ${videoOutputPath}`);

  // 9. Upload with 2026 AI Disclosure Flag
  const ytTitle = `${topic.titleTa} | Practical Citizen Guide #Shorts`;
  const ytDesc = `${topic.titleTa}\n\n` +
    `📌 Step 1: ${topic.step1Behave}\n` +
    `📌 Step 2: ${topic.step2Evidence}\n` +
    `📌 Step 3: ${topic.step3Legal}\n\n` +
    `📞 Helplines: ${topic.helplineText}\n\n` +
    `🌐 Read the complete citizen rights legal guide at:\nhttps://vizhitn.in\n\n` +
    `#TamilNadu #CitizenRights #TamilLaw #VizhiTN #Shorts #LegalAdvice`;

  const tags = ['Tamil Nadu', 'Citizen Rights', 'Tamil Law', 'Legal Advice', 'Police Rules', topic.category, 'VizhiTN', 'Shorts'];

  const uploadResult = await uploadToYouTube({
    videoFilePath: videoOutputPath,
    title: ytTitle,
    description: ytDesc,
    tags,
    privacyStatus: isDryRun ? 'unlisted' : 'public',
    isShort: true
  });

  console.log('====================================================');
  console.log('CITIZEN RIGHTS SHORT GENERATED & PUBLISHED SUCCESSFULLY!');
  console.log('Video URL:', uploadResult.videoUrl);
  console.log('====================================================');

  // Cleanup temporary files
  const temps = [s1FramePath, s2FramePath, s3FramePath, s1AudioPath, s2AudioPath, s3AudioPath, heroPhotoPath];
  for (const t of temps) {
    try { if (fs.existsSync(t)) fs.unlinkSync(t); } catch {}
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN RIGHTS SHORTS PIPELINE]:', err);
  process.exit(1);
});
