// scripts/youtube/engine/video-composer.mjs
// Robust cross-platform FFmpeg composer with Ken Burns motion, multi-scene stitching,
// 6-track sound design (amix), and audio ducking for 9:16 Shorts and 16:9 Long-Form.

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { ensureSfxAssetsExist } from './sfx-generator.mjs';

// ─── Sound Asset Registry ──────────────────────────────────────────────────
// Download these once from freesound.org / BBC Sound Effects Library and place
// in scripts/youtube/assets/sfx/. All royalty-free CC0 or Attribution.
const SFX_DIR = path.resolve('scripts/youtube/assets/sfx');

const SFX = {
  hum: path.join(SFX_DIR, 'newsroom-hum.mp3'),          // low ambient newsroom hum
  bed: path.join(SFX_DIR, 'broadcast-bed.mp3'),         // subtle documentary score bed
  whoosh: path.join(SFX_DIR, 'scene-whoosh.mp3'),        // bass whoosh for transitions
  click: path.join(SFX_DIR, 'text-click.mp3'),           // subtle click on text appear
  chime: path.join(SFX_DIR, 'helpline-chime.mp3'),       // bell when helpline spoken
  outro: path.join(SFX_DIR, 'civic-outro-beat.mp3')      // closing drum, 2s
};

/**
 * Returns true if an SFX file exists and is usable
 */
function sfxExists(filePath) {
  return fs.existsSync(filePath) && fs.statSync(filePath).size > 0;
}

/**
 * Discovers working ffmpeg executable across Windows & Linux environments
 */
export function getFfmpegBinaryPath() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }

  if (ffmpegInstaller && ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
    return ffmpegInstaller.path;
  }

  try {
    const probe = execSync('ffmpeg -version', { stdio: 'pipe' });
    if (probe && probe.length > 0) return 'ffmpeg';
  } catch {}

  const platform = os.platform();
  if (platform === 'linux') {
    const candidates = ['/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg'];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  return 'ffmpeg';
}

/**
 * Gets exact duration in seconds of an audio file via ffmpeg
 */
export function getAudioDuration(audioFilePath) {
  const ffmpeg = getFfmpegBinaryPath();
  try {
    const cmd = `"${ffmpeg}" -i "${audioFilePath}" 2>&1`;
    const output = execSync(cmd).toString();
    const match = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      return parseFloat(match[1]) * 3600 + parseFloat(match[2]) * 60 + parseFloat(match[3]);
    }
  } catch (err) {
    if (err.stdout || err.stderr) {
      const text = (err.stdout || '').toString() + (err.stderr || '').toString();
      const match = text.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
      if (match) {
        return parseFloat(match[1]) * 3600 + parseFloat(match[2]) * 60 + parseFloat(match[3]);
      }
    }
  }
  return 45;
}

/**
 * Builds an FFmpeg audio filter that layers voiceover + ambient music with sidechain ducking.
 * When the narrator speaks, the background bed is smoothly ducked by -16dB.
 * During vocal pauses, the music bed rises gently to maintain documentary momentum.
 *
 * @param {string} voicePath - Path to the main TTS voiceover audio file
 * @param {string} outputPath - Final mixed audio output path
 * @param {Object} options
 * @param {boolean} [options.isLastScene=false] - Whether to add the outro beat
 * @param {boolean} [options.includeBed=true] - Whether to add background music/hum
 * @returns {string} outputPath if mixing succeeded, voicePath if SFX unavailable
 */
export function mixAudioWithSoundDesign(voicePath, outputPath, options = {}) {
  const ffmpeg = getFfmpegBinaryPath();
  const { isLastScene = false, includeBed = true } = options;

  try { ensureSfxAssetsExist(); } catch {}

  const hasBed = includeBed && sfxExists(SFX.bed);
  const hasHum = sfxExists(SFX.hum);
  const hasWhoosh = sfxExists(SFX.whoosh);
  const hasOutro = isLastScene && sfxExists(SFX.outro);

  if (!hasBed && !hasHum && !hasWhoosh && !hasOutro) {
    return voicePath;
  }

  const inputs = [`-i "${voicePath}"`];
  let inputIdx = 1;

  // Background stem (music bed preferred, hum fallback)
  let bgInputIdx = -1;
  if (hasBed) {
    inputs.push(`-stream_loop -1 -i "${SFX.bed}"`);
    bgInputIdx = inputIdx++;
  } else if (hasHum) {
    inputs.push(`-stream_loop -1 -i "${SFX.hum}"`);
    bgInputIdx = inputIdx++;
  }

  let whooshIdx = -1;
  if (hasWhoosh) {
    inputs.push(`-i "${SFX.whoosh}"`);
    whooshIdx = inputIdx++;
  }

  let outroIdx = -1;
  if (hasOutro) {
    inputs.push(`-i "${SFX.outro}"`);
    outroIdx = inputIdx++;
  }

  let filterComplex = '';
  if (bgInputIdx !== -1) {
    // Dynamic sidechain ducking: background is attenuated when voice speaks
    const duckingParts = [
      `[0:a]volume=1.0,asplit=2[voice_main][voice_side]`,
      `[${bgInputIdx}:a]volume=0.22[bg_pre]`,
      `[bg_pre][voice_side]sidechaincompress=threshold=0.07:ratio=9:attack=35:release=320[bg_ducked]`
    ];

    const mixParts = ['[voice_main]', '[bg_ducked]'];
    if (whooshIdx !== -1) {
      duckingParts.push(`[${whooshIdx}:a]volume=0.28[whoosh]`);
      mixParts.push('[whoosh]');
    }
    if (outroIdx !== -1) {
      duckingParts.push(`[${outroIdx}:a]volume=0.45[outro]`);
      mixParts.push('[outro]');
    }

    duckingParts.push(
      `${mixParts.join('')}amix=inputs=${mixParts.length}:duration=first:dropout_transition=2[amixed]`,
      `[amixed]alimiter=limit=0.96[aout]`
    );

    filterComplex = duckingParts.join('; ');
  } else {
    // Basic summation without ducking
    const amixParts = ['[0:a]volume=1.0[main]'];
    const mixInputs = ['[main]'];
    if (whooshIdx !== -1) {
      amixParts.push(`[${whooshIdx}:a]volume=0.30[whoosh]`);
      mixInputs.push('[whoosh]');
    }
    if (outroIdx !== -1) {
      amixParts.push(`[${outroIdx}:a]volume=0.50[outro]`);
      mixInputs.push('[outro]');
    }
    amixParts.push(
      `${mixInputs.join('')}amix=inputs=${mixInputs.length}:duration=first:dropout_transition=2[amixed]`,
      `[amixed]alimiter=limit=0.96[aout]`
    );
    filterComplex = amixParts.join('; ');
  }

  const cmd = [
    `"${ffmpeg}"`,
    '-y',
    inputs.join(' '),
    `-filter_complex "${filterComplex}"`,
    '-map [aout]',
    '-c:a libmp3lame',
    '-b:a 192k',
    `"${outputPath}"`
  ].join(' ');

  try {
    execSync(cmd, { stdio: 'pipe', timeout: 60000 });
    return outputPath;
  } catch (err) {
    console.warn(`[AUDIO MIXER WARN] Ducking filter failed — falling back to direct voiceover: ${err.message}`);
    return voicePath;
  }
}

/**
 * Assembles a Multi-Scene 9:16 YouTube Short with Ken Burns motion + sound design.
 * Features 30fps smooth camera moves, dynamic frame calculation, and B-roll blending.
 *
 * @param {Object} options
 * @param {Array<{ imagePath: string, videoPath?: string, audioPath: string, durationSec: number, hasMotion?: boolean, isLastScene?: boolean, subtitlePath?: string }>} options.scenes
 * @param {string} options.outputPath
 * @param {string} [options.thumbnailPath] - Optional thumbnail image to prepend as Frame 0:00 (0.35s)
 */
export function assembleMultiSceneShortsVideo({ scenes, outputPath, thumbnailPath }) {
  const ffmpeg = getFfmpegBinaryPath();
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const tempClips = [];
  const tempAudioMixes = [];
  const sessionId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    // If high-CTR thumbnail provided, prepend as Frame 0:00 (0.35s) so YouTube Shorts feeds catch it
    if (thumbnailPath && fs.existsSync(thumbnailPath)) {
      const thumbClipPath = path.join(outDir, `_temp_short_thumb_${sessionId}.mp4`);
      const thumbArgs = [
        '-y',
        '-loop', '1',
        '-i', thumbnailPath,
        '-f', 'lavfi',
        '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
        '-t', '0.35',
        '-vf', 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p',
        '-r', '30',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '20',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-ar', '44100',
        '-shortest',
        thumbClipPath
      ];
      try {
        const thumbCmd = `"${ffmpeg}" ${thumbArgs.map(a => `"${a}"`).join(' ')}`;
        execSync(thumbCmd, { stdio: 'pipe', timeout: 30000 });
        if (fs.existsSync(thumbClipPath)) {
          tempClips.push(thumbClipPath);
          console.log('[COMPOSER] High-CTR viral thumbnail prepended as Frame 0:00 (0.35s)');
        }
      } catch (thumbErr) {
        console.warn('[COMPOSER WARN] Could not prepend thumbnail clip:', thumbErr.message);
      }
    }

    for (let idx = 0; idx < scenes.length; idx++) {
      const sc = scenes[idx];
      const isLastScene = idx === scenes.length - 1;

      // Mix audio with dynamic sidechain ducking
      const mixedAudioPath = path.join(outDir, `_temp_short_audio_mix_${sessionId}_${idx}.mp3`);
      tempAudioMixes.push(mixedAudioPath);
      const finalAudioPath = mixAudioWithSoundDesign(sc.audioPath, mixedAudioPath, { isLastScene });

      const clipPath = path.join(outDir, `_temp_short_scene_${sessionId}_${idx}.mp4`);
      tempClips.push(clipPath);

      // Check if real video B-roll clip is provided
      const hasBgVideo = sc.videoPath && fs.existsSync(sc.videoPath) && fs.statSync(sc.videoPath).size > 10000;

      // Kinetic Subtitles filter if ASS file provided
      let subFilter = '';
      if (sc.subtitlePath && fs.existsSync(sc.subtitlePath)) {
        const relSub = path.relative(process.cwd(), sc.subtitlePath).replace(/\\/g, '/');
        const fontsDir = 'scripts/youtube/assets/fonts';
        subFilter = fs.existsSync(fontsDir)
          ? `,ass=filename='${relSub}':fontsdir='${fontsDir}'`
          : `,ass='${relSub}'`;
      }

      let args;
      if (hasBgVideo) {
        // Multi-Layer: Moving B-roll Video (bg) + HTML Card (overlay) + Kinetic Subtitles
        const fadeOut = isLastScene
          ? `,fade=t=out:st=${Math.max(0, sc.durationSec - 0.4)}:d=0.4`
          : '';
        const filter = `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg]; [bg][1:v]overlay=0:0:format=auto,fade=t=in:st=0:d=0.25${fadeOut}${subFilter},format=yuv420p[vout]`;

        args = [
          '-y',
          '-stream_loop', '-1',
          '-i', sc.videoPath,
          '-i', sc.imagePath,
          '-i', finalAudioPath,
          '-filter_complex', filter,
          '-map', '[vout]',
          '-map', '2:a',
          '-t', sc.durationSec.toString(),
          '-r', '30',
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '20',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-ar', '44100',
          clipPath
        ];
      } else {
        // Ken Burns dynamic camera motion with TRUE 30 FPS rate to eliminate micro-jitter
        const motionMode = sc.hasMotion !== false;
        const totalFrames = Math.max(30, Math.ceil(sc.durationSec * 30));
        const zoomDirections = [
          // Center push-in with 30fps smooth interpolation
          `zoompan=z='min(zoom+0.0008,1.15)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30`,
          // Top-focus push-in
          `zoompan=z='min(zoom+0.0006,1.12)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/3-(ih/zoom/3)':s=1080x1920:fps=30`,
          // Steady cinematic push
          `zoompan=z='min(zoom+0.0007,1.14)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30`,
          // Subtle lateral drift
          `zoompan=z='min(zoom+0.0005,1.10)':d=${totalFrames}:x='(iw/2-(iw/zoom/2))*(1-0.2*on/${totalFrames})':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30`
        ];
        const zoomFilter = zoomDirections[idx % zoomDirections.length];

        const vfFilter = motionMode
          ? `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,${zoomFilter},format=yuv420p`
          : `scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,format=yuv420p`;

        const fadeFilter = isLastScene
          ? `,fade=t=in:st=0:d=0.25,fade=t=out:st=${Math.max(0, sc.durationSec - 0.4)}:d=0.4`
          : `,fade=t=in:st=0:d=0.25`;

        const inputImage = sc.imagePath || sc.slidePath;
        args = [
          '-y',
          '-loop', '1',
          '-i', inputImage,
          '-i', finalAudioPath,
          '-vf', `${vfFilter}${fadeFilter}${subFilter}`,
          '-r', '30',
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '20',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-ar', '44100',
          '-shortest',
          clipPath
        ];
      }

      const cmd = `"${ffmpeg}" ${args.map(a => `"${a}"`).join(' ')}`;
      execSync(cmd, { stdio: 'pipe', timeout: 90000 });
      console.log(`[COMPOSER] Scene ${idx + 1}/${scenes.length} rendered (${hasBgVideo ? 'Video B-Roll' : 'Ken Burns Motion'}): ${(sc.durationSec).toFixed(1)}s`);
    }

    // Concatenate all scene clips into final Short
    const concatListPath = path.join(outDir, `_temp_short_concat_${sessionId}.txt`);
    const fileEntries = tempClips.map(c => `file '${c.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(concatListPath, fileEntries, 'utf-8');

    const concatCmd = `"${ffmpeg}" -y -f concat -safe 0 -i "${concatListPath}" -c:v libx264 -preset ultrafast -crf 20 -r 30 -c:a aac -b:a 192k -ar 44100 -movflags +faststart "${outputPath}"`;
    execSync(concatCmd, { stdio: 'pipe', timeout: 120000 });

    try { fs.unlinkSync(concatListPath); } catch {}

    if (!fs.existsSync(outputPath)) {
      throw new Error(`Failed to create multi-scene short at: ${outputPath}`);
    }

    const finalSize = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
    console.log(`[COMPOSER ✓] Short assembled: ${outputPath} (${finalSize} MB)`);
    return outputPath;
  } finally {
    for (const c of [...tempClips, ...tempAudioMixes]) {
      if (fs.existsSync(c)) {
        try { fs.unlinkSync(c); } catch {}
      }
    }
  }
}

/**
 * Assembles a multi-scene 16:9 Long-Form documentary MP4 with multi-beat visual variety,
 * B-roll video overlay capability, 30fps camera moves, and audio ducking.
 *
 * @param {Object} options
 * @param {Array<{ slidePath?: string, videoPath?: string, overlayPath?: string, audioPath: string, durationSec: number, subtitlePath?: string }>} options.chapters
 * @param {string} options.outputPath
 */
export function assembleLongFormVideo({ chapters, outputPath }) {
  const ffmpeg = getFfmpegBinaryPath();
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const tempClips = [];
  const tempAudioMixes = [];
  const sessionId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    for (let idx = 0; idx < chapters.length; idx++) {
      const ch = chapters[idx];
      const isLastChapter = idx === chapters.length - 1;
      const isFirstChapter = idx === 0;

      // Mix audio with dynamic sidechain ducking
      const mixedAudioPath = path.join(outDir, `_temp_long_audio_mix_${sessionId}_${idx}.mp3`);
      tempAudioMixes.push(mixedAudioPath);
      const finalAudioPath = mixAudioWithSoundDesign(ch.audioPath, mixedAudioPath, { isLastScene: isLastChapter });

      const clipPath = path.join(outDir, `_temp_long_ch_${sessionId}_${idx}.mp4`);
      tempClips.push(clipPath);

      // Check if moving video B-roll clip is provided
      const hasBgVideo = ch.videoPath && fs.existsSync(ch.videoPath) && fs.statSync(ch.videoPath).size > 10000;

      // Kinetic Subtitles filter if ASS file provided
      let subFilter = '';
      if (ch.subtitlePath && fs.existsSync(ch.subtitlePath)) {
        const relSub = path.relative(process.cwd(), ch.subtitlePath).replace(/\\/g, '/');
        subFilter = `,ass='${relSub}'`;
      }

      let args;
      if (hasBgVideo) {
        // Multi-Layer: 16:9 Video B-roll + optional slide/lower-third overlay + Subtitles
        const overlayInput = (ch.overlayPath && fs.existsSync(ch.overlayPath))
          ? ch.overlayPath
          : (ch.slidePath && fs.existsSync(ch.slidePath) ? ch.slidePath : null);

        let filter = '';
        if (overlayInput) {
          filter = `[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080[bg]; [bg][1:v]overlay=0:0:format=auto,fade=t=in:st=0:d=0.35${subFilter},format=yuv420p[vout]`;
          args = [
            '-y',
            '-stream_loop', '-1',
            '-i', ch.videoPath,
            '-i', overlayInput,
            '-i', finalAudioPath,
            '-filter_complex', filter,
            '-map', '[vout]',
            '-map', '2:a',
            '-t', ch.durationSec.toString(),
            '-r', '30',
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '20',
            '-c:a', 'aac',
            '-b:a', '192k',
            clipPath
          ];
        } else {
          filter = `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,fade=t=in:st=0:d=0.35${subFilter},format=yuv420p`;
          args = [
            '-y',
            '-stream_loop', '-1',
            '-i', ch.videoPath,
            '-i', finalAudioPath,
            '-vf', filter,
            '-t', ch.durationSec.toString(),
            '-r', '30',
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '20',
            '-c:a', 'aac',
            '-b:a', '192k',
            clipPath
          ];
        }
      } else {
        // 16:9 Cinematic Ken Burns with TRUE 30 FPS rate
        const totalFrames = Math.max(30, Math.ceil(ch.durationSec * 30));
        const longZoomDirections = [
          // 1. Subtle slow push-in
          `zoompan=z='min(zoom+0.0003,1.06)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30`,
          // 2. Subtle slow pan-right
          `zoompan=z='min(zoom+0.00025,1.05)':d=${totalFrames}:x='(iw/2-(iw/zoom/2))*(1+0.15*on/${totalFrames})':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30`,
          // 3. Subtle slow pull-back
          `zoompan=z='max(1.06-0.00025*on,1.0)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30`
        ];
        const zoomChoice = longZoomDirections[idx % longZoomDirections.length];
        const vfFilter = `scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,${zoomChoice},format=yuv420p`;

        let fadeFilter = '';
        if (isFirstChapter) {
          fadeFilter = `,fade=t=in:st=0:d=0.5`;
        }
        if (isLastChapter) {
          fadeFilter += `,fade=t=out:st=${Math.max(0, ch.durationSec - 1.0)}:d=1.0`;
        }

        args = [
          '-y',
          '-loop', '1',
          '-i', ch.slidePath,
          '-i', finalAudioPath,
          '-vf', `${vfFilter}${fadeFilter}${subFilter}`,
          '-r', '30',
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '20',
          '-c:a', 'aac',
          '-b:a', '192k',
          '-shortest',
          clipPath
        ];
      }

      const cmd = `"${ffmpeg}" ${args.map(a => `"${a}"`).join(' ')}`;
      execSync(cmd, { stdio: 'pipe', timeout: 180000 });
      console.log(`[COMPOSER] Scene beat ${idx + 1}/${chapters.length} rendered (${hasBgVideo ? 'B-Roll Video' : 'Cinematic Ken Burns'}): ${(ch.durationSec).toFixed(1)}s`);
    }

    const concatListPath = path.join(outDir, `_temp_long_concat_${sessionId}.txt`);
    const fileEntries = tempClips.map(c => `file '${c.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(concatListPath, fileEntries, 'utf-8');

    const concatCmd = `"${ffmpeg}" -y -f concat -safe 0 -i "${concatListPath}" -c:v libx264 -preset ultrafast -crf 20 -r 30 -c:a aac -b:a 192k -ar 44100 -movflags +faststart "${outputPath}"`;
    execSync(concatCmd, { stdio: 'pipe', timeout: 300000 });

    try { fs.unlinkSync(concatListPath); } catch {}

    if (!fs.existsSync(outputPath)) {
      throw new Error(`Failed to concatenate long-form video at: ${outputPath}`);
    }

    const finalSize = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
    console.log(`[COMPOSER ✓] Long-form assembled: ${outputPath} (${finalSize} MB)`);
    return outputPath;
  } finally {
    for (const c of [...tempClips, ...tempAudioMixes]) {
      if (fs.existsSync(c)) {
        try { fs.unlinkSync(c); } catch {}
      }
    }
  }
}
