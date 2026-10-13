// scripts/youtube/engine/podcast-composer.mjs
// Assembly engine for Vizhi Uncut 16:9 Podcast Videos & High-CTR Thumbnails
// Layers multi-act dual-voice audio, room ambience, and dual-color kinetic subtitles

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getFfmpegBinaryPath, mixAudioWithSoundDesign, getAudioDuration } from './video-composer.mjs';
import { renderHtmlToImage } from './frame-renderer.mjs';
import { getBrandLogoDataUri } from './brand-assets.mjs';
import { toImageSource } from './cloudflare-visuals.mjs';

/**
 * Escapes file path for FFmpeg subtitles filter
 */
function escapeFfmpegSubFilterPath(p) {
  return p
    .replace(/\\/g, '/')
    .replace(/:/g, '\\:')
    .replace(/'/g, "'\\\\\\''")
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]');
}

/**
 * Assembles multi-segment podcast video into final 16:9 master MP4
 * Supports turn-by-turn dynamic camera & speaker lighting cuts
 *
 * @param {Object} params
 * @param {Array} params.segments - Array of { segmentIndex, slidePath, audioPath, durationSec, subPath, isLastSegment }
 * @param {Array} [params.acts] - Fallback acts array
 * @param {string} params.outputPath - Destination MP4 path
 * @returns {string} outputPath
 */
export function assemblePodcastVideo({ segments, acts, outputPath }) {
  const items = segments || acts || [];
  const ffmpeg = getFfmpegBinaryPath();
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const segmentMp4s = [];

  console.log(`[PODCAST COMPOSER] Assembling ${items.length} dynamic speaker segments into 16:9 master video...`);

  for (let i = 0; i < items.length; i++) {
    const seg = items[i];
    const isLast = (i === items.length - 1);
    const segMp4Path = path.join(outDir, `_temp_seg_${i}_${Date.now()}.mp4`);

    console.log(`[PODCAST COMPOSER] Encoding Segment ${i + 1}/${items.length} (${seg.durationSec.toFixed(1)}s)...`);

    // Mix turn audio with sound design (studio room hum, transition whoosh, outro beat)
    const mixedAudioPath = path.join(outDir, `_temp_mixed_seg_${i}_${Date.now()}.mp3`);
    mixAudioWithSoundDesign(seg.audioPath, mixedAudioPath, { isLastScene: isLast });

    // Build FFmpeg command with ASS subtitle burn-in
    let vfFilter = 'fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p';

    if (seg.subPath && fs.existsSync(seg.subPath)) {
      const escapedSub = escapeFfmpegSubFilterPath(seg.subPath);
      vfFilter += `,ass='${escapedSub}'`;
    }

    const cmd = `"${ffmpeg}" -y -loop 1 -framerate 30 -i "${seg.slidePath}" -i "${mixedAudioPath}" -vf "${vfFilter}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${segMp4Path}"`;

    try {
      execSync(cmd, { stdio: 'pipe', timeout: 180000, windowsHide: true });
      segmentMp4s.push(segMp4Path);
    } catch (err) {
      console.warn(`[PODCAST COMPOSER WARN] Subtitle burn-in failed for segment ${i + 1}: ${err.message}. Retrying without subtitle filter...`);
      const fallbackVf = 'fps=30,scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,format=yuv420p';
      const fallbackCmd = `"${ffmpeg}" -y -loop 1 -framerate 30 -i "${seg.slidePath}" -i "${mixedAudioPath}" -vf "${fallbackVf}" -c:v libx264 -preset fast -crf 22 -c:a aac -b:a 192k -shortest "${segMp4Path}"`;
      execSync(fallbackCmd, { stdio: 'pipe', timeout: 180000, windowsHide: true });
      segmentMp4s.push(segMp4Path);
    }

    // Cleanup mixed audio
    try { if (fs.existsSync(mixedAudioPath)) fs.unlinkSync(mixedAudioPath); } catch {}
  }

  // Concatenate Segment MP4s
  console.log('[PODCAST COMPOSER] Merging dynamic speaker segments into master podcast video...');
  const concatListPath = path.join(outDir, `concat_segs_${Date.now()}.txt`);
  const concatContent = segmentMp4s
    .map(p => `file '${p.replace(/\\/g, '/').replace(/'/g, "'\\''")}'`)
    .join('\n');
  fs.writeFileSync(concatListPath, concatContent, 'utf-8');

  try {
    execSync(`"${ffmpeg}" -y -f concat -safe 0 -i "${concatListPath}" -c copy "${outputPath}"`, {
      stdio: 'pipe',
      timeout: 180000,
      windowsHide: true
    });
  } catch {
    execSync(`"${ffmpeg}" -y -f concat -safe 0 -i "${concatListPath}" -c:v libx264 -c:a aac "${outputPath}"`, {
      stdio: 'pipe',
      timeout: 300000,
      windowsHide: true
    });
  }

  // Cleanup temporary Segment MP4s and concat file
  try {
    if (fs.existsSync(concatListPath)) fs.unlinkSync(concatListPath);
    for (const p of segmentMp4s) {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    }
  } catch {}

  const finalSizeMb = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
  console.log(`[PODCAST COMPOSER ✓] Master video assembled: ${outputPath} (${finalSizeMb} MB)`);

  return outputPath;
}

/**
 * Generates an ultra-high CTR 1280x720 YouTube Thumbnail PNG for Vizhi Uncut Podcast
 */
export async function generatePodcastThumbnail({
  titleTa,
  seriesNameTa = 'விழி பாட்காஸ்ட்',
  episodeBadge = 'NEW EPISODE',
  heroImageUrl,
  outputPath
}) {
  const brandLogo = getBrandLogoDataUri();
  const heroSrc = toImageSource(heroImageUrl);

  const html = `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@800;900&family=Plus+Jakarta+Sans:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1280px;
      height: 720px;
      overflow: hidden;
      background: #060a12;
      font-family: 'Noto Sans Tamil', 'Plus Jakarta Sans', sans-serif;
      position: relative;
      color: #ffffff;
    }

    .bg-image {
      position: absolute;
      right: 0;
      top: 0;
      width: 780px;
      height: 720px;
      object-fit: cover;
      filter: brightness(0.75);
    }

    .gradient-overlay {
      position: absolute;
      left: 0;
      top: 0;
      width: 1280px;
      height: 720px;
      background: linear-gradient(90deg, #060a12 0%, #060a12 50%, rgba(6, 10, 18, 0.95) 65%, rgba(6, 10, 18, 0.3) 85%, transparent 100%);
    }

    .accent-glow {
      position: absolute;
      left: -80px;
      top: -80px;
      width: 450px;
      height: 450px;
      background: radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, transparent 70%);
      pointer-events: none;
    }

    .content {
      position: relative;
      z-index: 10;
      width: 820px;
      height: 720px;
      padding: 55px 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .top-bar {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .logo {
      width: 48px;
      height: 48px;
      border-radius: 10px;
    }

    .podcast-pill {
      background: #ef4444;
      color: #ffffff;
      padding: 6px 18px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 1px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .live-dot {
      width: 8px;
      height: 8px;
      background: #ffffff;
      border-radius: 50%;
    }

    .series-name {
      font-size: 15px;
      font-weight: 800;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .main-hook {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .warning-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid #f59e0b;
      color: #fbbf24;
      padding: 6px 16px;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 900;
      width: fit-content;
    }

    .title-ta {
      font-size: 44px;
      font-weight: 900;
      line-height: 1.25;
      color: #ffffff;
      text-shadow: 0 4px 20px rgba(0, 0, 0, 0.9);
    }

    .title-ta span.highlight {
      color: #facc15;
      text-shadow: 0 0 25px rgba(250, 204, 21, 0.5);
    }

    .bottom-bar {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .host-duo-tag {
      font-size: 16px;
      font-weight: 800;
      color: #cbd5e1;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .cta-pill {
      background: #ffffff;
      color: #0f172a;
      padding: 8px 22px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 900;
    }
  </style>
</head>
<body>
  <img src="${heroSrc}" class="bg-image" alt="Visual">
  <div class="gradient-overlay"></div>
  <div class="accent-glow"></div>

  <div class="content">
    <div class="top-bar">
      <img src="${brandLogo}" class="logo" alt="VizhiTN">
      <div class="podcast-pill">
        <div class="live-dot"></div>
        VIZHI UNCUT
      </div>
      <div class="series-name">${seriesNameTa}</div>
    </div>

    <div class="main-hook">
      <div class="warning-badge">⚠️ உண்மை புலனாய்வு & தீர்வுகள்</div>
      <h1 class="title-ta">${titleTa}</h1>
    </div>

    <div class="bottom-bar">
      <div class="host-duo-tag">
        <span>🎙️ கார்த்திக் & கவிதா விவாதம்</span>
      </div>
      <div class="cta-pill">முழுமையான ஆய்வு ▶</div>
    </div>
  </div>
</body>
</html>`;

  await renderHtmlToImage(html, outputPath, { width: 1280, height: 720 });
  return outputPath;
}
