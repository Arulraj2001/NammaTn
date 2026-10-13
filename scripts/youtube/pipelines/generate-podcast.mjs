// scripts/youtube/pipelines/generate-podcast.mjs
// Vizhi Uncut (விழி பாட்காஸ்ட்) — Alternate-Day 16:9 Dual-Host Podcast Broadcast Pipeline
// Hosts: Karthik (ta-IN-ValluvarNeural) & Kavitha (ta-IN-PallaviNeural)
// 3 Rotating Series: Scam & Cyber, Citizen vs System, Hidden Tamil Nadu

import fs from 'fs';
import path from 'path';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { getPodcastTopicForSchedule, PODCAST_CATALOG } from '../engine/podcast-topics.mjs';
import { generatePodcastScript } from '../engine/podcast-writer.mjs';
import { synthesizePodcastTurn } from '../engine/podcast-tts.mjs';
import { assemblePodcastVideo, generatePodcastThumbnail } from '../engine/podcast-composer.mjs';
import { generateYouTubeSceneVisual, toImageSource } from '../engine/cloudflare-visuals.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { getBrandLogoDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

async function main() {
  console.log('====================================================');
  console.log('VIZHI UNCUT (விழி பாட்காஸ்ட்) — Autonomous Broadcast Engine');
  console.log('====================================================');

  const isDryRun = process.argv.includes('--dry-run');
  const seriesFlag = process.argv.find(a => a.startsWith('--series='))?.split('=')[1];
  const topicIdFlag = process.argv.find(a => a.startsWith('--topic='))?.split('=')[1];

  const outDir = path.resolve('public/youtube_renders');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const brandLogoDataUri = getBrandLogoDataUri();

  // 1. Select Episode Topic
  let topic;
  if (topicIdFlag) {
    topic = PODCAST_CATALOG.find(t => t.id === topicIdFlag);
  }
  if (!topic) {
    const dayOfWeek = new Date().getDay();
    topic = getPodcastTopicForSchedule(dayOfWeek, seriesFlag);
  }

  console.log(`[SERIES] ${topic.seriesNameEn} (${topic.seriesNameTa})`);
  console.log(`[EPISODE TOPIC] "${topic.episodeTitleEn}"`);
  console.log(`[LOCATION] ${topic.district} | Category Color: ${topic.categoryColor}`);

  // 2. Synthesize 5-Act Duo Conversational Script via Gemini (Target: 8–12 mins)
  console.log('\n[RESEARCH] Synthesizing 5-Act Karthik & Kavitha dialogue script via Gemini...');
  const scriptData = await generatePodcastScript(topic);
  const acts = scriptData.acts || [];
  console.log(`[SCRIPT READY] Total Acts: ${acts.length}`);

  // 3. Prepare Visuals Plate via Cloudflare FLUX
  console.log('\n[VISUALS] Generating 16:9 documentary evidence visual...');
  const heroVisualPath = path.join(outDir, `podcast_flux_hero_${Date.now()}.webp`);
  let heroVisualUrl = await generateYouTubeSceneVisual(topic.fluxPrompt, heroVisualPath, '16:9');
  if (!heroVisualUrl) {
    // Official Category Graphic Card fallback (zero stock photos)
    const categoryCard = path.resolve('public/images/categories/public-safety.webp');
    heroVisualUrl = fs.existsSync(categoryCard) ? categoryCard : path.resolve('public/images/categories/general.webp');
  }

  // 4. Process Each Act with Turn-by-Turn Dynamic Camera & Speaker Lighting Switching
  const studioTplPath = path.resolve('scripts/youtube/templates/podcast/studio-frame.html');
  const studioTplHtml = fs.readFileSync(studioTplPath, 'utf-8');

  const processedSegments = [];
  let totalDurationSec = 0;
  const chapterTimestamps = [];

  for (let i = 0; i < acts.length; i++) {
    const act = acts[i];
    const actNum = act.actNum || (i + 1);
    const actTitleTa = act.actTitleTa || `பகுதி ${actNum}`;
    const actTitleEn = act.actTitleEn || `Act ${actNum}`;
    const turns = act.turns || [];

    const mins = Math.floor(totalDurationSec / 60);
    const secs = Math.floor(totalDurationSec % 60).toString().padStart(2, '0');
    chapterTimestamps.push(`${mins}:${secs} - ${actTitleEn}`);

    console.log(`\n[ACT ${actNum}/5] Processing "${actTitleEn}" (${turns.length} dialogue turns)...`);

    for (let j = 0; j < turns.length; j++) {
      const turn = turns[j];
      const speaker = (turn.speaker || 'karthik').toLowerCase();
      const isKarthik = speaker === 'karthik';

      // A. Synthesize Turn Audio with 30ms Micro-Fade & Turn-Locked Subtitles
      const turnResult = await synthesizePodcastTurn({
        turn,
        actNum,
        turnIndex: j,
        outputDir: outDir
      });

      // B. Render Dynamic Turn Studio Frame: Active Speaker Glowing + Inactive Dimmed
      const karthikClass = isKarthik ? 'karthik-active' : 'host-dimmed';
      const kavithaClass = isKarthik ? 'host-dimmed' : 'kavitha-active';

      // Equalizer bars: High-energy varied heights when active, flat 4px when idle
      const eqK = isKarthik ? [26, 38, 18, 42, 30, 22, 36, 20] : [4, 4, 4, 4, 4, 4, 4, 4];
      const eqV = isKarthik ? [4, 4, 4, 4, 4, 4, 4, 4] : [24, 40, 20, 36, 42, 18, 30, 26];

      let frameHtml = studioTplHtml
        .replace(/\{\{BRAND_LOGO_DATA_URI\}\}/g, brandLogoDataUri)
        .replace(/\{\{CATEGORY_COLOR\}\}/g, topic.categoryColor || '#38bdf8')
        .replace(/\{\{SERIES_ICON\}\}/g, topic.categoryIcon || '🎙️')
        .replace(/\{\{SERIES_NAME_TA\}\}/g, topic.seriesNameTa)
        .replace(/\{\{KARTHIK_ACTIVE_CLASS\}\}/g, karthikClass)
        .replace(/\{\{KAVITHA_ACTIVE_CLASS\}\}/g, kavithaClass)
        .replace(/\{\{EQ_K1\}\}/g, eqK[0]).replace(/\{\{EQ_K2\}\}/g, eqK[1])
        .replace(/\{\{EQ_K3\}\}/g, eqK[2]).replace(/\{\{EQ_K4\}\}/g, eqK[3])
        .replace(/\{\{EQ_K5\}\}/g, eqK[4]).replace(/\{\{EQ_K6\}\}/g, eqK[5])
        .replace(/\{\{EQ_K7\}\}/g, eqK[6]).replace(/\{\{EQ_K8\}\}/g, eqK[7])
        .replace(/\{\{EQ_V1\}\}/g, eqV[0]).replace(/\{\{EQ_V2\}\}/g, eqV[1])
        .replace(/\{\{EQ_V3\}\}/g, eqV[2]).replace(/\{\{EQ_V4\}\}/g, eqV[3])
        .replace(/\{\{EQ_V5\}\}/g, eqV[4]).replace(/\{\{EQ_V6\}\}/g, eqV[5])
        .replace(/\{\{EQ_V7\}\}/g, eqV[6]).replace(/\{\{EQ_V8\}\}/g, eqV[7])
        .replace(/\{\{ACT_BADGE_TEXT\}\}/g, `ACT 0${actNum} / 05`)
        .replace(/\{\{ACT_TITLE_EN\}\}/g, actTitleEn)
        .replace(/\{\{SCENE_IMAGE_SRC\}\}/g, toImageSource(heroVisualUrl))
        .replace(/\{\{EVIDENCE_TAG_TEXT\}\}/g, `${topic.seriesNameEn.toUpperCase()} EVIDENCE`)
        .replace(/\{\{HEADLINE_TA\}\}/g, actTitleTa)
        .replace(/\{\{HELPLINE_TEXT\}\}/g, topic.helplineText);

      const turnFramePng = path.join(outDir, `podcast_frame_act_${actNum}_turn_${j}_${Date.now()}.png`);
      renderHtmlToImage(frameHtml, turnFramePng, { width: 1920, height: 1080 });

      processedSegments.push({
        actNum,
        turnIndex: j,
        speaker,
        slidePath: turnFramePng,
        audioPath: turnResult.audioPath,
        durationSec: turnResult.durationSec,
        subPath: turnResult.subPath
      });

      totalDurationSec += turnResult.durationSec;
    }
  }

  console.log(`\n[PODCAST STATS] Total episode length: ${(totalDurationSec / 60).toFixed(1)} mins (${totalDurationSec.toFixed(0)} seconds) across ${processedSegments.length} dynamic speaker cuts`);

  // 5. Assemble Master 16:9 Video
  const videoOutputPath = path.join(outDir, `vizhitn_podcast_${topic.id}_${Date.now()}.mp4`);
  assemblePodcastVideo({
    segments: processedSegments,
    outputPath: videoOutputPath
  });

  // 6. Render Custom 16:9 High-CTR Thumbnail
  const thumbnailPath = path.join(outDir, `vizhitn_podcast_thumb_${topic.id}_${Date.now()}.png`);
  console.log('\n[THUMBNAIL] Rendering custom 1280x720 high-CTR podcast thumbnail...');
  try {
    await generatePodcastThumbnail({
      titleTa: scriptData.thumbnailHookTa || topic.episodeTitleTa,
      seriesNameTa: topic.seriesNameTa,
      episodeBadge: 'VIZHI UNCUT',
      heroImageUrl: heroVisualUrl,
      outputPath: thumbnailPath
    });
  } catch (tErr) {
    console.warn('[THUMBNAIL WARN] Could not render thumbnail:', tErr.message);
  }

  // 7. Format YouTube SEO Metadata
  const ytTitle = `${scriptData.youtubeTitle || topic.episodeTitleTa} | Vizhi Uncut #Podcast`.slice(0, 95);

  const chaptersBlock = `\n📌 அத்தியாயங்கள் / Chapters:\n${chapterTimestamps.join('\n')}\n`;

  const ytDesc = `🎙️ Vizhi Uncut — Tamil Nadu's #1 Investigative Duo Podcast\n` +
    `வழங்குபவர்கள்: கார்த்திக் & கவிதா | தலைப்பு: ${topic.episodeTitleTa}\n\n` +
    `${scriptData.summaryTa || topic.caseBrief}\n` +
    chaptersBlock +
    `\n🏛️ தொடர்புடைய சட்டம் / தீர்வு: ${topic.legalSectionOrTool}\n` +
    `📞 அதிகாரப்பூர்வ உதவி எண்: ${topic.helplineText}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔴 உங்கள் பகுதியிலும் இந்த மாதிரி மோசடி அல்லது அநீதி நடந்தால்:\n` +
    `vizhitn.in இணையதளத்தில் நீங்களே நேரடியாக பதிவு பண்ணுங்க!\n` +
    `💬 இந்த விவாதம் பற்றிய உங்கள் கருத்து என்ன? கமெண்டில் சொல்லுங்கள் 👇\n` +
    `━━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🌐 VizhiTN Community: https://vizhitn.in\n\n` +
    `#TamilPodcast #VizhiTN #VizhiUncut #TamilNadu #ScamAlertTamil #CitizenRights`;

  const tags = Array.from(new Set([
    'Tamil Podcast', 'VizhiTN', 'Vizhi Uncut', 'Karthik Kavitha Podcast',
    'Tamil News', 'Investigative Podcast', topic.seriesNameEn,
    ...(topic.tags || []),
    'Tamil Documentary'
  ])).slice(0, 15);

  // 8. Upload to YouTube
  const uploadResult = await uploadToYouTube({
    videoFilePath: videoOutputPath,
    title: ytTitle,
    description: ytDesc,
    tags,
    privacyStatus: isDryRun ? 'unlisted' : 'public',
    isShort: false
  });

  if (uploadResult.videoId && !uploadResult.dryRun) {
    if (fs.existsSync(thumbnailPath)) {
      await setYouTubeThumbnail(uploadResult.videoId, thumbnailPath);
    }

    await postPinnedComment(
      uploadResult.videoId,
      `🎙️ இந்த எபிசோடை உங்கள் குடும்பத்தினருக்கு பகிருங்கள் (Share) ↗️\nஉங்க ஏரியாவில இந்த மாதிரி பிரச்சனை இருந்தா vizhitn.in-ல் நேரடியா report பண்ணுங்க 👇\n🔴 vizhitn.in`
    );
  }

  console.log('\n====================================================');
  console.log('VIZHI UNCUT PODCAST EPISODE BROADCASTED SUCCESSFULLY!');
  console.log('Video URL:', uploadResult.videoUrl);
  console.log('Thumbnail:', thumbnailPath);
  console.log('====================================================');

  // 9. Cross-Post Full Video to Meta Socials (Facebook Page)
  await crossPostVideoToMetaSocials({
    videoFilePath: videoOutputPath,
    title: ytTitle,
    caption: ytDesc,
    isReel: false,
    isDryRun
  });

  // Cleanup temporary turn slides, audio, and subtitles
  for (const seg of processedSegments) {
    try {
      if (fs.existsSync(seg.slidePath)) fs.unlinkSync(seg.slidePath);
      if (fs.existsSync(seg.audioPath)) fs.unlinkSync(seg.audioPath);
      if (fs.existsSync(seg.subPath)) fs.unlinkSync(seg.subPath);
    } catch {}
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN PODCAST PIPELINE]:', err);
  process.exit(1);
});
