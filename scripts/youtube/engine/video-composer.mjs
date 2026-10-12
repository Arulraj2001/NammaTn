// scripts/youtube/engine/video-composer.mjs
// Robust cross-platform FFmpeg composer for 9:16 Shorts and 16:9 Long-Form videos

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

/**
 * Discovers the working ffmpeg executable across Windows & Linux environments
 */
export function getFfmpegBinaryPath() {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }

  // 1. Check bundled ffmpeg-installer binary
  if (ffmpegInstaller && ffmpegInstaller.path && fs.existsSync(ffmpegInstaller.path)) {
    return ffmpegInstaller.path;
  }

  // 2. Check system PATH
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
 * @param {string} audioFilePath
 * @returns {number} duration in seconds
 */
export function getAudioDuration(audioFilePath) {
  const ffmpeg = getFfmpegBinaryPath();
  try {
    const cmd = `"${ffmpeg}" -i "${audioFilePath}" 2>&1`;
    const output = execSync(cmd).toString();
    const match = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      const hours = parseFloat(match[1]);
      const mins = parseFloat(match[2]);
      const secs = parseFloat(match[3]);
      return hours * 3600 + mins * 60 + secs;
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
  return 45; // Safe default estimate
}

/**
 * Assembles a vertical 1080x1920 YouTube Short MP4
 * @param {Object} options
 * @param {string} options.slideImagePath - Path to 1080x1920 PNG
 * @param {string} options.audioPath - Path to voiceover MP3
 * @param {string} [options.bgMusicPath] - Optional subtle background music MP3
 * @param {string} [options.srtPath] - Optional SRT subtitle file
 * @param {string} options.outputPath - Destination MP4
 */
export function assembleShortsVideo({ slideImagePath, audioPath, bgMusicPath, srtPath, outputPath }) {
  const ffmpeg = getFfmpegBinaryPath();
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const hasSubs = srtPath && fs.existsSync(srtPath);
  const normalizedSrt = hasSubs ? srtPath.replace(/\\/g, '/').replace(/:/g, '\\:') : null;

  let filterComplex = '';
  const args = [
    '-y',
    '-loop', '1',
    '-i', slideImagePath,
    '-i', audioPath
  ];

  if (bgMusicPath && fs.existsSync(bgMusicPath)) {
    args.push('-i', bgMusicPath);
    filterComplex += '[1:a]volume=1.0[v];[2:a]volume=0.12[m];[v][m]amix=inputs=2:duration=first[aout]';
  }

  let vfFilter = 'scale=1080:1920,format=yuv420p';
  if (normalizedSrt) {
    vfFilter += `,subtitles='${normalizedSrt}':force_style='FontSize=22,FontName=Noto Sans Tamil,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=2,Shadow=0,MarginV=180'`;
  }

  args.push('-vf', vfFilter);

  if (filterComplex) {
    args.push('-filter_complex', filterComplex, '-map', '0:v', '-map', '[aout]');
  } else {
    args.push('-map', '0:v', '-map', '1:a');
  }

  args.push(
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    outputPath
  );

  const cmd = `"${ffmpeg}" ${args.map(a => `"${a}"`).join(' ')}`;
  execSync(cmd, { stdio: 'pipe', timeout: 120000 });

  if (!fs.existsSync(outputPath)) {
    throw new Error(`Failed to generate Shorts video at: ${outputPath}`);
  }

  return outputPath;
}

/**
 * Assembles a multi-chapter 16:9 Long-Form MP4 (3-5 mins)
 * @param {Object} options
 * @param {Array<{ slidePath: string, audioPath: string, durationSec: number }>} options.chapters
 * @param {string} [options.bgMusicPath]
 * @param {string} options.outputPath
 */
export function assembleLongFormVideo({ chapters, bgMusicPath, outputPath }) {
  const ffmpeg = getFfmpegBinaryPath();
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const tempClips = [];

  try {
    // 1. Render each chapter into a short synchronized clip
    chapters.forEach((ch, idx) => {
      const clipPath = path.join(outDir, `_temp_chapter_${idx}_${Date.now()}.mp4`);
      tempClips.push(clipPath);

      const args = [
        '-y',
        '-loop', '1',
        '-i', ch.slidePath,
        '-i', ch.audioPath,
        '-vf', 'scale=1920:1080,format=yuv420p',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '20',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        clipPath
      ];

      const cmd = `"${ffmpeg}" ${args.map(a => `"${a}"`).join(' ')}`;
      execSync(cmd, { stdio: 'pipe', timeout: 120000 });
    });

    // 2. Concatenate all chapter clips into the final video
    const concatListPath = path.join(outDir, `_temp_concat_list_${Date.now()}.txt`);
    const fileEntries = tempClips.map(c => `file '${c.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(concatListPath, fileEntries, 'utf-8');

    const concatCmd = `"${ffmpeg}" -y -f concat -safe 0 -i "${concatListPath}" -c copy "${outputPath}"`;
    execSync(concatCmd, { stdio: 'pipe', timeout: 180000 });

    try { fs.unlinkSync(concatListPath); } catch {}

    if (!fs.existsSync(outputPath)) {
      throw new Error(`Failed to concatenate long-form video at: ${outputPath}`);
    }

    return outputPath;
  } finally {
    for (const c of tempClips) {
      if (fs.existsSync(c)) {
        try { fs.unlinkSync(c); } catch {}
      }
    }
  }
}
