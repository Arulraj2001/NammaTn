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
import { generateYouTubeSceneVisual, toImageSource } from '../engine/cloudflare-visuals.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { chunkSentenceForCaptions, generateCaptionsFromClauses, generateAssSubtitleFile } from '../engine/captions-engine.mjs';
import { fetchFreeBrollClip } from '../engine/broll-fetcher.mjs';

import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';
import { generateShortsThumbnail, generateShortsThumbnailPair } from '../engine/thumbnail-shorts-engine.mjs';
import { generateSeoVideoFilename } from '../engine/seo-filename.mjs';
import { runQualityControl } from '../engine/qc-engine.mjs';
import { checkQuotaAvailable, recordQuotaUsage } from '../engine/quota-tracker.mjs';
import { getTodayIst } from '../engine/calendar-reader.mjs';
import { recordBroadcastSuccess } from '../engine/broadcast-logger.mjs';

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

  const brandLogoDataUri = getBrandLogoDataUri();

  // 1. Pick a dispute topic based on day of year
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const topicIndex = dayOfYear % CITIZEN_DISPUTE_TOPICS.length;
  const topic = CITIZEN_DISPUTE_TOPICS[topicIndex];

  console.log(`[TOPIC] Selected dispute guide: "${topic.titleEn}"`);

  // 2. Draft Spoken Conversational 3-Scene Script — PROBLEM FIRST, never "ஹலோ மக்களே"
  const scene1Script = [
    topic.hookTa   // opens with the problem in the viewer's face
  ];

  const scene2Script = [
    `Step 1: ${topic.step1Behave}`,
    `Step 2: ${topic.step2Evidence}`
  ];

  const scene3Script = [
    `Step 3: ${topic.step3Legal}`,
    `Official உதவிக்கு ${topic.helplineText}-ஐ call பண்ணுங்க.`,
    `இதே போன்ற மக்கள் உரிமை தகவல்கள் மற்றும் அரசு எச்சரிக்கைகளை உடனே பெற — இப்பவே VizhiTN-ஐ Follow பண்ணிக்கோங்க!`
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

  const totalDur = s1Dur + s2Dur + s3Dur;
  console.log(`[AUDIO STATS] S1: ${s1Dur.toFixed(1)}s, S2: ${s2Dur.toFixed(1)}s, S3: ${s3Dur.toFixed(1)}s | Total: ${totalDur.toFixed(1)}s`);

  // 4. Generate Visuals: Scene 1 Photo
  const fluxPrompt = `Indian citizen discussing rights at legal advisory desk in Tamil Nadu Chennai, modern documentary style, natural dramatic lighting`;
  const heroPhotoPath = path.join(outDir, `rights_flux_hero_${Date.now()}.webp`);
  let heroPhotoUrl = await generateYouTubeSceneVisual(fluxPrompt, heroPhotoPath, '9:16');
  if (!heroPhotoUrl) {
    // Official VizhiTN Graphic Card fallback (zero external stock photos)
    const localCard = path.resolve('public/images/categories/government-schemes.webp');
    heroPhotoUrl = fs.existsSync(localCard) ? localCard : path.resolve('public/images/categories/general.webp');
  }

  // 5. Generate High-CTR A/B Vertical Thumbnails (1080x1920)
  const thumbBase = `thumb_rights_${topic.id}_${Date.now()}`;
  let thumbPath = path.join(outDir, `${thumbBase}_variantA.png`);
  let thumbnailBPath = path.join(outDir, `${thumbBase}_variantB.png`);
  try {
    const pair = await generateShortsThumbnailPair({
      titleTa: topic.titleTa,
      category: topic.category || 'சட்ட உரிமைகள்',
      heroImageUrl: heroPhotoUrl,
      outputDir: outDir,
      baseName: thumbBase
    });
    thumbPath = pair.variantA;
    thumbnailBPath = pair.variantB;
  } catch (thumbErr) {
    console.warn('[THUMBNAIL WARN] Could not generate rights short thumbnail:', thumbErr.message);
  }

  // 6. Render Scene 1 Hook Frame (with Official Brand Logo)
  const tplS1Path = path.resolve('scripts/youtube/templates/shorts/scene-1-hook.html');
  let tplS1 = fs.readFileSync(tplS1Path, 'utf-8');
  tplS1 = tplS1.replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri);
  tplS1 = tplS1.replace('{{SCENE_PHOTO_SRC}}', toImageSource(heroPhotoUrl));
  tplS1 = tplS1.replaceAll('{{HOOK_HEADLINE_TA}}', topic.titleTa);
  tplS1 = tplS1.replace('{{DATE_TEXT}}', 'விழி சட்டம் & உரிமைகள்');
  tplS1 = tplS1.replace('{{CATEGORY_COLOR}}', '#8B5CF6');
  tplS1 = tplS1.replace('{{CATEGORY_ICON}}', '⚖️');
  tplS1 = tplS1.replace('{{CATEGORY_LABEL}}', topic.category || 'சட்ட உரிமைகள்');
  tplS1 = tplS1.replace('{{DISTRICT_NAME}}', 'TN | CITIZEN LAW');
  tplS1 = tplS1.replace(/\{\{URGENCY_CLASS\}\}/g, 'pill-high');

  const s1FramePath = path.join(outDir, `rights_s1_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS1, s1FramePath, { width: 1080, height: 1920 });

  // 7. Render Scene 2 Breakdown Frame (with Official Brand Logo)
  const tplS2Path = path.resolve('scripts/youtube/templates/shorts/scene-2-breakdown.html');
  let tplS2 = fs.readFileSync(tplS2Path, 'utf-8');
  tplS2 = tplS2.replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri);
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

  // 7. Render Scene 3 Helpline Frame (with Official Brand Logo)
  const tplS3Path = path.resolve('scripts/youtube/templates/shorts/scene-3-helpline.html');
  let tplS3 = fs.readFileSync(tplS3Path, 'utf-8');
  tplS3 = tplS3.replace('{{BRAND_LOGO_DATA_URI}}', brandLogoDataUri);
  const s3FramePath = path.join(outDir, `rights_s3_frame_${Date.now()}.png`);
  renderHtmlToImage(tplS3, s3FramePath, { width: 1080, height: 1920 });

  // 8. Generate Kinetic Subtitles for Mobile Retention (Hormozi / Vox style)
  const s1SubPath = path.join(outDir, `rights_s1_sub_${Date.now()}.ass`);
  const s2SubPath = path.join(outDir, `rights_s2_sub_${Date.now()}.ass`);
  const s3SubPath = path.join(outDir, `rights_s3_sub_${Date.now()}.ass`);

  try {
    generateAssSubtitleFile(generateCaptionsFromClauses(scene1Script, s1Dur), s1SubPath, '9:16');
    generateAssSubtitleFile(generateCaptionsFromClauses(scene2Script, s2Dur), s2SubPath, '9:16');
    generateAssSubtitleFile(generateCaptionsFromClauses(scene3Script, s3Dur), s3SubPath, '9:16');
  } catch (subErr) {
    console.log('[CAPTIONS WARN] Could not generate subtitles:', subErr.message);
  }

  // Fetch free B-roll video clip for continuous background motion
  console.log(`[B-ROLL] Fetching moving B-roll clip for dispute guide...`);
  const brollClip = await fetchFreeBrollClip({
    category: 'public-safety',
    aspectRatio: '9:16',
    durationSec: totalDur
  });

  // 9. Assemble Multi-Scene Video with Ken Burns Motion + Kinetic Subtitles
  const seoFilename = generateSeoVideoFilename({
    title: topic.titleEn || topic.titleTa,
    category: 'government-schemes',
    format: 'rights-short'
  });
  const videoOutputPath = path.join(outDir, seoFilename);
  console.log(`[COMPOSER] Target SEO Video Filename: ${seoFilename}`);

  const scenes = [
    { imagePath: s1FramePath, videoPath: brollClip, audioPath: s1AudioPath, durationSec: s1Dur, hasMotion: true, subtitlePath: s1SubPath },
    { imagePath: s2FramePath, videoPath: brollClip, audioPath: s2AudioPath, durationSec: s2Dur, hasMotion: true, subtitlePath: s2SubPath },
    { imagePath: s3FramePath, videoPath: brollClip, audioPath: s3AudioPath, durationSec: s3Dur, hasMotion: true, subtitlePath: s3SubPath }
  ];

  assembleMultiSceneShortsVideo({
    scenes,
    outputPath: videoOutputPath,
    thumbnailPath: fs.existsSync(thumbPath) ? thumbPath : undefined
  });

  console.log(`[COMPOSER] Video generated: ${videoOutputPath}`);

  // Automated Quality Control (QC) Gate
  const qcReport = runQualityControl({ videoPath: videoOutputPath, isShort: true, generateSheet: true });
  if (!qcReport.passed) {
    console.error('[QC BLOCKED] Rendered video failed broadcast quality checks. Aborting publishing.');
    process.exit(1);
  }

  // Quota safety check
  const quota = checkQuotaAvailable('VIDEO_UPLOAD');
  if (!quota.allowed) {
    console.warn(`[QUOTA BLOCKED] ${quota.reason}`);
    process.exit(0);
  }

  // 9. High-Ranking 2026 SEO Metadata (Bilingual Search Hook + First 125-Char Retention Formula)
  const ytTitle = topic.seoTitleBilingual || `${topic.titleTa} | Practical Citizen Guide #Shorts #VizhiTN`;

  const socialCaption = `📢 ${topic.titleTa} — சட்டப்படி தீர்வு என்ன? 👇\n\n` +
    `📌 Step 1: ${topic.step1Behave}\n` +
    `📌 Step 2: ${topic.step2Evidence}\n` +
    `📌 Step 3: ${topic.step3Legal}\n\n` +
    `📞 அதிகாரப்பூர்வ உதவி: ${topic.helplineText}\n\n` +
    `👉 தமிழ்நாட்டின் சட்ட விழிப்புணர்வு & மக்கள் உரிமை தகவல்களுக்கு @vizhitn பக்கத்தை Follow செய்யுங்கள்!\n` +
    `📌 உங்கள் பாதுகாப்பிற்கு சேமித்து (Save) வைத்துக் கொள்ளுங்கள்! நண்பர்களுக்கும் குடும்பத்தினருக்கும் பகிருங்கள் (Share) ↗️\n` +
    `💬 உங்களுக்கும் இந்த மாதிரி பிரச்சனை ஏற்பட்டிருக்கா? உங்கள் அனுபவத்தை கமெண்டில் சொல்லுங்கள் 👇\n\n` +
    `🌐 முழு சட்ட வழிகாட்டியை படிக்க: https://vizhitn.in\n\n` +
    `#VizhiTN #TamilNadu #CitizenRightsTamil #TamilLaw #TamilReels #ReelsInstagram #ReelsViral #Shorts`;

  const tags = Array.from(new Set([
    ...(topic.keywords || []),
    'VizhiTN',
    'Tamil Nadu',
    'Citizen Rights',
    'Tamil Law',
    'Legal Advice',
    topic.category,
    'Shorts'
  ]));

  let uploadResult = null;
  try {
    uploadResult = await uploadToYouTube({
      videoFilePath: videoOutputPath,
      title: ytTitle,
      description: socialCaption,
      tags,
      privacyStatus: isDryRun ? 'unlisted' : 'public',
      isShort: true
    });

    if (uploadResult?.videoId && !uploadResult.dryRun) {
      recordQuotaUsage('VIDEO_UPLOAD', { videoId: uploadResult.videoId, title: ytTitle });
      await recordBroadcastSuccess({
        broadcastDate: getTodayIst(),
        format: 'rights-shorts',
        timeIst: '01:30 PM',
        title: ytTitle,
        youtubeVideoId: uploadResult.videoId,
        youtubeUrl: uploadResult.videoUrl,
        metadata: {
          topicId: topic.id,
          thumbnail_b_path: fs.existsSync(thumbnailBPath) ? thumbnailBPath : null,
          ab_swapped: false
        }
      });

      // 10. Attach High-CTR Custom Thumbnail
      if (fs.existsSync(thumbPath)) {
        await setYouTubeThumbnail(uploadResult.videoId, thumbPath);
      }
      await postPinnedComment(
        uploadResult.videoId,
        `⚖️ உங்களுக்கும் இந்த மாதிரி பிரச்சனை ஏற்பட்டிருக்கா? உங்கள் அனுபவத்தை கீழே சொல்லுங்கள் 👇\n📌 பிறருக்கு உதவ உடனே Share செய்யுங்கள் ↗️\n🔴 நேரடி கள புகார் பதிவு: vizhitn.in`
      );
    }

    console.log('====================================================');
    console.log('CITIZEN RIGHTS SHORT GENERATED & PUBLISHED TO YOUTUBE!');
    console.log('Video URL:', uploadResult?.videoUrl || 'N/A');
    console.log('====================================================');
  } catch (ytErr) {
    console.warn('[YOUTUBE WARN] YouTube upload encountered an issue:', ytErr.message);
  }

  // 11. Cross-Post to Meta Socials (Instagram Reels & Facebook Videos) - ALWAYS EXECUTED
  try {
    await crossPostVideoToMetaSocials({
      videoFilePath: videoOutputPath,
      thumbnailFilePath: thumbPath,
      title: ytTitle,
      caption: socialCaption,
      isReel: true,
      isDryRun
    });
  } catch (metaErr) {
    console.warn('[META SOCIAL WARN] Meta cross-post error:', metaErr.message);
  } finally {
    // Cleanup temporary frames, audio, and subtitles
    const temps = [s1FramePath, s2FramePath, s3FramePath, s1AudioPath, s2AudioPath, s3AudioPath, heroPhotoPath, thumbPath, s1SubPath, s2SubPath, s3SubPath];
    for (const t of temps) {
      try { if (fs.existsSync(t)) fs.unlinkSync(t); } catch {}
    }
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN RIGHTS SHORTS PIPELINE]:', err);
  process.exit(1);
});
