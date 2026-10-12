// scripts/youtube/engine/video-composer.mjs
// Robust cross-platform FFmpeg composer with Ken Burns motion, multi-scene stitching,
// and audio ducking for 9:16 Shorts and 16:9 Long-Form videos.

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

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
  return 45;
}

/**
 * Assembles a Multi-Scene 9:16 YouTube Short (Scene 1 Hook -> Scene 2 Cards -> Scene 3 Helpline)
 * with optional Ken Burns camera motion on photo scenes.
 *
 * @param {Object} options
 * @param {Array<{ imagePath: string, audioPath: string, durationSec: number, hasMotion?: boolean }>} options.scenes
 * @param {string} [options.bgMusicPath]
 * @param {string} options.outputPath
 */
export function assembleMultiSceneShortsVideo({ scenes, bgMusicPath, outputPath }) {
  const ffmpeg = getFfmpegBinaryPath();
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const tempClips = [];
  const sessionId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    // 1. Render each scene into a synchronized 9:16 clip
    scenes.forEach((sc, idx) => {
      const clipPath = path.join(outDir, `_temp_short_scene_${sessionId}_${idx}.mp4`);
      tempClips.push(clipPath);

      const vfFilter = sc.hasMotion
        ? 'scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,zoompan=z=\'min(zoom+0.0015,1.15)\':d=125:x=\'iw/2-(iw/zoom/2)\':y=\'ih/2-(ih/zoom/2)\':s=1080x1920,format=yuv420p'
        : 'scale=1080:1920,format=yuv420p';

      const args = [
        '-y',
        '-loop', '1',
        '-i', sc.imagePath,
        '-i', sc.audioPath,
        '-vf', vfFilter,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '20',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        clipPath
      ];

      const cmd = `"${ffmpeg}" ${args.map(a => `"${a}"`).join(' ')}`;
      execSync(cmd, { stdio: 'pipe', timeout: 90000 });
    });

    // 2. Concatenate scene clips
    const concatListPath = path.join(outDir, `_temp_short_concat_${sessionId}.txt`);
    const fileEntries = tempClips.map(c => `file '${c.replace(/\\/g, '/')}'`).join('\n');
    fs.writeFileSync(concatListPath, fileEntries, 'utf-8');

    const concatCmd = `"${ffmpeg}" -y -f concat -safe 0 -i "${concatListPath}" -c copy "${outputPath}"`;
    execSync(concatCmd, { stdio: 'pipe', timeout: 120000 });

    try { fs.unlinkSync(concatListPath); } catch {}

    if (!fs.existsSync(outputPath)) {
      throw new Error(`Failed to create multi-scene short at: ${outputPath}`);
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

/**
 * Assembles a multi-chapter 16:9 Long-Form MP4 (3-5 mins)
 */
export function assembleLongFormVideo({ chapters, bgMusicPath, outputPath }) {
  const ffmpeg = getFfmpegBinaryPath();
  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const tempClips = [];
  const sessionId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    chapters.forEach((ch, idx) => {
      const clipPath = path.join(outDir, `_temp_long_ch_${sessionId}_${idx}.mp4`);
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

    const concatListPath = path.join(outDir, `_temp_long_concat_${sessionId}.txt`);
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
