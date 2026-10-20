// scripts/youtube/pipelines/generate-podcast.mjs
// Vizhi Uncut (விழி பாட்காஸ்ட்) — Alternate-Day 16:9 Dual-Host Podcast Broadcast Pipeline
// Hosts: Karthik (ta-IN-ValluvarNeural) & Kavitha (ta-IN-PallaviNeural)
// 3 Rotating Series: Scam & Cyber, Citizen vs System, Hidden Tamil Nadu

import fs from 'fs';
import path from 'path';
import { YOUTUBE_CONFIG } from '../config.mjs';
import { getPodcastTopicForSchedule, PODCAST_CATALOG } from '../engine/podcast-topics.mjs';
import { generatePodcastScript } from '../engine/podcast-writer.mjs';
import { generateArtDirectedVisualPrompt } from '../engine/script-writer.mjs';
import { synthesizePodcastTurn } from '../engine/podcast-tts.mjs';
import { assemblePodcastVideo, generatePodcastThumbnail } from '../engine/podcast-composer.mjs';
import { generateYouTubeSceneVisual, toImageSource } from '../engine/cloudflare-visuals.mjs';
import { renderHtmlToImage } from '../engine/frame-renderer.mjs';
import { getBrandLogoDataUri, getHostAvatarDataUri } from '../engine/brand-assets.mjs';
import { uploadToYouTube, setYouTubeThumbnail, postPinnedComment } from '../engine/youtube-client.mjs';
import { generateLongThumbnailPair } from '../engine/thumbnail-engine.mjs';
import { generateSeoVideoFilename } from '../engine/seo-filename.mjs';
import { crossPostVideoToMetaSocials } from '../engine/meta-video-poster.mjs';
import { runQualityControl } from '../engine/qc-engine.mjs';
import { checkQuotaAvailable, recordQuotaUsage } from '../engine/quota-tracker.mjs';
import { getScheduledUploadForSlot, getTodayIst } from '../engine/calendar-reader.mjs';
import { recordBroadcastSuccess, isBroadcastCompletedToday } from '../engine/broadcast-logger.mjs';

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
  const todayIst = getTodayIst();

  // Deduplication Guard: Never upload duplicate podcast for today's slot unless forced
  if (!process.argv.includes('--force')) {
    const status = await isBroadcastCompletedToday('podcast', todayIst);
    if (status.published) {
      console.log(`[DEDUP GUARD ✓] Vizhi Uncut Podcast already broadcast today (${status.existingRecord?.youtube_video_id || 'recorded'}). Exiting.`);
      process.exit(0);
    }
  }

  // 1. Select Episode Topic from 90-Day Calendar or fallback to rotating catalog
  const calEntry = getScheduledUploadForSlot('podcast', todayIst);
  let topic;

  if (calEntry && !topicIdFlag) {
    console.log(`[90-DAY CALENDAR] Sourcing scheduled podcast topic: "${calEntry.title}"`);
    topic = {
      id: `cal-podcast-${todayIst}`,
      seriesId: 'vizhi-uncut',
      seriesNameTa: 'விழி அன்கட் பாட்காஸ்ட்',
      seriesNameEn: 'Vizhi Uncut Duo Podcast',
      episodeTitleTa: calEntry.title,
      episodeTitleEn: calEntry.title,
      caseBrief: calEntry.description,
      legalSectionOrTool: 'Citizen vigilance, verified public RTI data, official helpline numbers and community action.',
      helplineText: 'முதல்வர் உதவி மையம் 1100 | மின்வாரிய உதவி 1912 | சைபர் கிரைம் 1930',
      categoryColor: '#EF4444',
      categoryIcon: '🎙️',
      district: 'தமிழ்நாடு (Tamil Nadu)',
      fluxPrompt: 'Two professional Indian journalists Karthik and Kavitha in modern news podcast studio in Chennai Tamil Nadu discussing investigative citizen issues, cinematic warm studio lights',
      thumbnailText: calEntry.thumbnail_text,
      hashtags: calEntry.hashtags,
      tags: calEntry.hashtags.map(h => h.replace('#', ''))
    };
  } else if (topicIdFlag) {
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
  let visualPrompt = topic.fluxPrompt;
  try {
    const artDirected = await generateArtDirectedVisualPrompt({
      title: topic.episodeTitleEn || topic.episodeTitleTa,
      category: topic.seriesNameEn || 'Investigation',
      aspectRatio: '16:9',
      variant: 'A'
    });
    if (artDirected) {
      visualPrompt = artDirected;
      console.log(`[AI ART DIRECTOR] Enhanced podcast visual prompt: "${visualPrompt.slice(0, 90)}..."`);
    }
  } catch (err) {
    console.warn('[AI ART DIRECTOR] Using fallback topic fluxPrompt:', err.message);
  }

  let heroVisualUrl = await generateYouTubeSceneVisual(visualPrompt, heroVisualPath, '16:9');
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

      // Dynamic equalizer bars based on active turn rhythm
      const activeEq = [
        20 + Math.round(Math.random() * 22),
        26 + Math.round(Math.random() * 20),
        16 + Math.round(Math.random() * 24),
        32 + Math.round(Math.random() * 16),
        24 + Math.round(Math.random() * 22),
        18 + Math.round(Math.random() * 26),
        28 + Math.round(Math.random() * 18),
        20 + Math.round(Math.random() * 18)
      ];
      const idleEq = [4, 4, 4, 4, 4, 4, 4, 4];
      const eqK = isKarthik ? activeEq : idleEq;
      const eqV = isKarthik ? idleEq : activeEq;

      const karthikAvatarUri = getHostAvatarDataUri('karthik');
      const kavithaAvatarUri = getHostAvatarDataUri('kavitha');

      let frameHtml = studioTplHtml
        .replace(/\{\{BRAND_LOGO_DATA_URI\}\}/g, brandLogoDataUri)
        .replace(/\{\{KARTHIK_AVATAR_URI\}\}/g, karthikAvatarUri)
        .replace(/\{\{KAVITHA_AVATAR_URI\}\}/g, kavithaAvatarUri)
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

  // 5. Assemble Master 16:9 Video with Dynamic SEO Filename
  const seoFilename = generateSeoVideoFilename({
    title: topic.seriesNameEn || topic.id,
    category: 'public-safety',
    format: 'podcast',
    dateStr: todayIst
  });
  const videoOutputPath = path.join(outDir, seoFilename);
  console.log(`[COMPOSER] Target SEO Video Filename: ${seoFilename}`);
  assemblePodcastVideo({
    segments: processedSegments,
    outputPath: videoOutputPath
  });

  // Automated Quality Control (QC) Gate
  const qcReport = runQualityControl({ videoPath: videoOutputPath, isShort: false, generateSheet: true });
  if (!qcReport.passed) {
    console.error('[QC BLOCKED] Podcast episode failed broadcast quality checks. Aborting publishing.');
    process.exit(1);
  }

  // Quota safety check
  const quota = checkQuotaAvailable('VIDEO_UPLOAD');
  if (!quota.allowed) {
    console.warn(`[QUOTA BLOCKED] ${quota.reason}`);
    process.exit(0);
  }

  // 6. Render Custom 16:9 High-CTR A/B Thumbnails
  const thumbBase = `thumb_podcast_${topic.id}_${Date.now()}`;
  let thumbnailPath = path.join(outDir, `${thumbBase}_variantA.png`);
  let thumbnailBPath = path.join(outDir, `${thumbBase}_variantB.png`);
  console.log('\n[THUMBNAIL] Rendering custom 1280x720 high-CTR A/B podcast thumbnails...');
  try {
    const pair = await generateLongThumbnailPair({
      titleTa: topic.thumbnailText || scriptData.thumbnailHookTa || topic.episodeTitleTa,
      subtitleTa: 'விழி தமிழ்நாடு சிறப்பு புலனாய்வு விவாதம்',
      category: 'VIZHI UNCUT PODCAST',
      heroImageUrl: heroVisualUrl,
      outputDir: outDir,
      baseName: thumbBase
    });
    thumbnailPath = pair.variantA;
    thumbnailBPath = pair.variantB;
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
    `${(topic.hashtags || ['#TamilPodcast', '#VizhiTN', '#VizhiUncut', '#TamilNadu', '#ScamAlertTamil', '#CitizenRights']).join(' ')}`;

  const tags = Array.from(new Set([
    'Tamil Podcast', 'VizhiTN', 'Vizhi Uncut', 'Karthik Kavitha Podcast',
    'Tamil News', 'Investigative Podcast', topic.seriesNameEn,
    ...(topic.tags || []),
    'Tamil Documentary'
  ])).slice(0, 15);

  if (isDryRun) {
    console.log('====================================================');
    console.log('[DRY RUN] Podcast local generation completed successfully!');
    console.log(`Video output: ${videoOutputPath}`);
    console.log('[DRY RUN] Skipped YouTube upload & Meta cross-post.');
    console.log('====================================================');
    return;
  }

  // 8. Upload to YouTube
  let uploadResult = null;
  try {
    uploadResult = await uploadToYouTube({
      videoFilePath: videoOutputPath,
      title: ytTitle,
      description: ytDesc,
      tags,
      privacyStatus: isDryRun ? 'unlisted' : 'public',
      isShort: false
    });

    if (uploadResult?.videoId && !uploadResult.dryRun) {
      recordQuotaUsage('VIDEO_UPLOAD', { videoId: uploadResult.videoId, title: ytTitle });
      await recordBroadcastSuccess({
        broadcastDate: todayIst,
        format: 'podcast',
        timeIst: calEntry?.time_ist || '06:00 PM',
        title: ytTitle,
        youtubeVideoId: uploadResult.videoId,
        youtubeUrl: uploadResult.videoUrl,
        metadata: {
          topicId: topic.id,
          thumbnail_b_path: fs.existsSync(thumbnailBPath) ? thumbnailBPath : null,
          ab_swapped: false
        }
      });

      if (fs.existsSync(thumbnailPath)) {
        await setYouTubeThumbnail(uploadResult.videoId, thumbnailPath);
      }

      await postPinnedComment(
        uploadResult.videoId,
        `🎙️ இந்த விவாதம் பற்றிய உங்கள் கருத்து என்ன? உங்கள் பகுதியிலும் இந்த மாதிரி சம்பவம் நடந்திருக்கிறதா? கீழே கமெண்ட் செய்யுங்கள் 👇\n📌 பிறருக்கு உதவ உடனே Share செய்யுங்கள் ↗️\n🔴 நேரடி கள புகார் பதிவு: vizhitn.in`
      );
    }

    console.log('\n====================================================');
    console.log('VIZHI UNCUT PODCAST EPISODE BROADCASTED SUCCESSFULLY!');
    console.log('Video URL:', uploadResult?.videoUrl || 'N/A');
    console.log('Thumbnail:', thumbnailPath);
    console.log('====================================================');
  } catch (ytErr) {
    console.warn('[YOUTUBE WARN] YouTube upload encountered an issue:', ytErr.message);
  }

  // 9. Cross-Post Full Video to Meta Socials (Facebook Page) - ALWAYS EXECUTED
  try {
    await crossPostVideoToMetaSocials({
      videoFilePath: videoOutputPath,
      thumbnailFilePath: thumbnailPath,
      title: ytTitle,
      caption: ytDesc,
      isReel: false,
      isDryRun
    });
  } catch (metaErr) {
    console.warn('[META SOCIAL WARN] Meta cross-post error:', metaErr.message);
  } finally {
    // Cleanup temporary turn slides, audio, and subtitles
    for (const seg of processedSegments) {
      try {
        if (fs.existsSync(seg.slidePath)) fs.unlinkSync(seg.slidePath);
        if (fs.existsSync(seg.audioPath)) fs.unlinkSync(seg.audioPath);
        if (fs.existsSync(seg.subPath)) fs.unlinkSync(seg.subPath);
      } catch {}
    }
  }
}

main().catch(err => {
  console.error('[FATAL ERROR IN PODCAST PIPELINE]:', err);
  process.exit(1);
});
