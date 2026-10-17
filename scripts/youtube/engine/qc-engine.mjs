// scripts/youtube/engine/qc-engine.mjs
// Automated Audiovisual Quality-Control (QC) Gate & Contact Sheet Generator
// Validates rendered videos against resolution, frame rate, audio presence,
// silence, black frames, and generates 3x3 contact sheets.

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getFfmpegBinaryPath } from './video-composer.mjs';

/**
 * Parses FFmpeg stream and duration information from a video file
 */
export function probeVideo(videoPath) {
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file does not exist: ${videoPath}`);
  }

  const ffmpeg = getFfmpegBinaryPath();
  const fileSizeBytes = fs.statSync(videoPath).size;

  let stderr = '';
  try {
    // Calling ffmpeg with -i without output outputs file info to stderr and exits with error code 1
    execSync(`"${ffmpeg}" -i "${videoPath}"`, { stdio: ['pipe', 'pipe', 'pipe'] });
  } catch (err) {
    stderr = (err.stderr ? err.stderr.toString('utf-8') : '') +
             (err.stdout ? err.stdout.toString('utf-8') : '');
  }

  // Parse Duration: 00:00:52.48
  let durationSec = 0;
  const durMatch = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
  if (durMatch) {
    const hours = parseFloat(durMatch[1]);
    const mins = parseFloat(durMatch[2]);
    const secs = parseFloat(durMatch[3]);
    durationSec = hours * 3600 + mins * 60 + secs;
  }

  // Parse Video Stream: Stream #0:0[0x1](und): Video: h264 (High) ... 1080x1920, 30 fps
  let width = 0;
  let height = 0;
  let fps = 0;
  let videoCodec = 'unknown';

  const videoMatch = stderr.match(/Stream #\d+:\d+.*?: Video: ([^,\s]+).*?,\s*(\d{3,4})x(\d{3,4}).*?,\s*(\d+(?:\.\d+)?)\s*(?:fps|tbr)/);
  if (videoMatch) {
    videoCodec = videoMatch[1];
    width = parseInt(videoMatch[2], 10);
    height = parseInt(videoMatch[3], 10);
    fps = parseFloat(videoMatch[4]);
  } else {
    // Fallback dimension parser
    const dimMatch = stderr.match(/(\d{3,4})x(\d{3,4})/);
    if (dimMatch) {
      width = parseInt(dimMatch[1], 10);
      height = parseInt(dimMatch[2], 10);
    }
    const fpsMatch = stderr.match(/(\d+(?:\.\d+)?)\s*fps/);
    if (fpsMatch) fps = parseFloat(fpsMatch[1]);
  }

  // Parse Audio Stream: Stream #0:1[0x2](und): Audio: aac
  let audioCodec = 'none';
  let hasAudio = false;
  let audioSampleRate = 0;

  const audioMatch = stderr.match(/Stream #\d+:\d+.*?: Audio: ([^,\s]+).*?,\s*(\d+)\s*Hz/);
  if (audioMatch) {
    hasAudio = true;
    audioCodec = audioMatch[1];
    audioSampleRate = parseInt(audioMatch[2], 10);
  } else if (stderr.includes('Audio:')) {
    hasAudio = true;
    audioCodec = 'detected';
  }

  return {
    videoPath,
    fileSizeBytes,
    durationSec,
    width,
    height,
    fps,
    videoCodec,
    hasAudio,
    audioCodec,
    audioSampleRate,
    rawStderr: stderr
  };
}

/**
 * Checks for unintended full-black frames (> 1.5s) using FFmpeg blackdetect
 */
export function detectBlackFrames(videoPath, maxBlackSec = 1.5) {
  const ffmpeg = getFfmpegBinaryPath();
  try {
    const cmd = `"${ffmpeg}" -i "${videoPath}" -vf "blackdetect=d=${maxBlackSec}:pix_th=0.10" -an -f null -`;
    const output = execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString('utf-8');
    const blackEvents = [];
    const regex = /black_start:([0-9.]+)\s+black_end:([0-9.]+)\s+black_duration:([0-9.]+)/g;
    let match;
    while ((match = regex.exec(output)) !== null) {
      blackEvents.push({
        start: parseFloat(match[1]),
        end: parseFloat(match[2]),
        duration: parseFloat(match[3])
      });
    }
    return blackEvents;
  } catch (err) {
    const out = (err.stderr ? err.stderr.toString() : '') + (err.stdout ? err.stdout.toString() : '');
    const blackEvents = [];
    const regex = /black_start:([0-9.]+)\s+black_end:([0-9.]+)\s+black_duration:([0-9.]+)/g;
    let match;
    while ((match = regex.exec(out)) !== null) {
      blackEvents.push({
        start: parseFloat(match[1]),
        end: parseFloat(match[2]),
        duration: parseFloat(match[3])
      });
    }
    return blackEvents;
  }
}

/**
 * Checks for accidental dead silence (> 3s) using FFmpeg silencedetect
 */
export function detectAudioSilence(videoPath, maxSilenceSec = 3.0) {
  const ffmpeg = getFfmpegBinaryPath();
  try {
    const cmd = `"${ffmpeg}" -i "${videoPath}" -af "silencedetect=noise=-35dB:d=${maxSilenceSec}" -vn -f null -`;
    const output = execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] }).toString('utf-8');
    const silenceEvents = [];
    const regex = /silence_start:\s*([0-9.]+)/g;
    let match;
    while ((match = regex.exec(output)) !== null) {
      silenceEvents.push(parseFloat(match[1]));
    }
    return silenceEvents;
  } catch (err) {
    const out = (err.stderr ? err.stderr.toString() : '') + (err.stdout ? err.stdout.toString() : '');
    const silenceEvents = [];
    const regex = /silence_start:\s*([0-9.]+)/g;
    let match;
    while ((match = regex.exec(out)) !== null) {
      silenceEvents.push(parseFloat(match[1]));
    }
    return silenceEvents;
  }
}

/**
 * Generates a 3x3 contact sheet representing 9 distinct scenes across the video
 */
export function generateContactSheet(videoPath, outputPath) {
  const ffmpeg = getFfmpegBinaryPath();
  try {
    const outDir = path.dirname(outputPath);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    // Extract 9 tiles spaced throughout the video
    // tile=3x3, downscaled for compact audit preview
    const cmd = `"${ffmpeg}" -ss 00:00:01 -i "${videoPath}" -vf "thumbnail=90,scale=360:640:force_original_aspect_ratio=decrease,pad=360:640:(ow-iw)/2:(oh-ih)/2,tile=3x3" -frames:v 1 -y "${outputPath}"`;
    execSync(cmd, { stdio: ['pipe', 'pipe', 'pipe'] });

    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size > 0) {
      return outputPath;
    }
  } catch (err) {
    // Fallback simpler contact sheet if thumbnail filter fails
    try {
      const fallbackCmd = `"${ffmpeg}" -i "${videoPath}" -vf "scale=360:-1,tile=3x3" -frames:v 1 -y "${outputPath}"`;
      execSync(fallbackCmd, { stdio: ['pipe', 'pipe', 'pipe'] });
      if (fs.existsSync(outputPath)) return outputPath;
    } catch (_) {}
    console.warn('[QC WARN] Could not generate contact sheet:', err.message);
  }
  return null;
}

/**
 * Master Quality Control Gate
 * Verifies the video passes all editorial, technical, and broadcast requirements.
 *
 * @param {Object} options
 * @param {string} options.videoPath - Path to the rendered MP4 file
 * @param {boolean} options.isShort - True for 9:16 Shorts, false for 16:9 Long-Form
 * @param {boolean} options.generateSheet - Whether to render a contact sheet
 * @returns {Object} Full QC Audit Report
 */
export function runQualityControl({ videoPath, isShort = false, generateSheet = true }) {
  console.log('\n[QC AUDIT] ========================================');
  console.log(`[QC AUDIT] Inspecting: ${path.basename(videoPath)}`);

  const criticalErrors = [];
  const warnings = [];

  // 1. Basic File Integrity
  if (!fs.existsSync(videoPath)) {
    criticalErrors.push(`File does not exist: ${videoPath}`);
    return { passed: false, criticalErrors, warnings };
  }

  const probe = probeVideo(videoPath);

  if (probe.fileSizeBytes < 100 * 1024) {
    criticalErrors.push(`File size is suspiciously small (${(probe.fileSizeBytes / 1024).toFixed(1)} KB)`);
  }

  // 2. Aspect Ratio & Resolution Validation
  const expectedWidth = isShort ? 1080 : 1920;
  const expectedHeight = isShort ? 1920 : 1080;

  if (probe.width !== expectedWidth || probe.height !== expectedHeight) {
    criticalErrors.push(`Resolution mismatch: Got ${probe.width}x${probe.height}, expected ${expectedWidth}x${expectedHeight}`);
  }

  // 3. Frame Rate Validation (Target: 30 fps)
  if (probe.fps < 25 || probe.fps > 35) {
    warnings.push(`Frame rate deviated from 30 fps: detected ${probe.fps} fps`);
  }

  // 4. Duration Validation
  if (isShort) {
    if (probe.durationSec > 60.5) {
      criticalErrors.push(`Short exceeded YouTube Shorts 60s hard ceiling: ${probe.durationSec.toFixed(1)}s`);
    } else if (probe.durationSec < 15.0) {
      warnings.push(`Short is unusually brief: ${probe.durationSec.toFixed(1)}s`);
    }
  } else {
    if (probe.durationSec < 45.0) {
      warnings.push(`Long-form feature is shorter than expected: ${probe.durationSec.toFixed(1)}s`);
    }
  }

  // 5. Audio Presence Validation
  if (!probe.hasAudio) {
    criticalErrors.push('Missing audio stream in rendered video file');
  }

  // 6. Deep Inspections (Black Frames & Dead Silence)
  const blackFrames = detectBlackFrames(videoPath, 2.0);
  if (blackFrames.length > 0) {
    // Allow brief intro/outro fade, flag if intermediate black frames > 2s
    const midBlacks = blackFrames.filter(b => b.start > 1.5 && b.end < (probe.durationSec - 1.5));
    if (midBlacks.length > 0) {
      warnings.push(`Detected ${midBlacks.length} unexpected dark/black scene gaps (> 2s)`);
    }
  }

  const silences = detectAudioSilence(videoPath, 3.5);
  if (silences.length > 0) {
    warnings.push(`Detected ${silences.length} audio silence drops exceeding 3.5 seconds`);
  }

  // 7. Contact Sheet Generation
  let contactSheetPath = null;
  if (generateSheet) {
    const sheetOutput = videoPath.replace(/\.mp4$/i, '_contact_sheet.png');
    contactSheetPath = generateContactSheet(videoPath, sheetOutput);
  }

  const passed = criticalErrors.length === 0;

  console.log(`[QC AUDIT] Resolution: ${probe.width}x${probe.height} | FPS: ${probe.fps} | Audio: ${probe.hasAudio ? probe.audioCodec : 'NONE'}`);
  console.log(`[QC AUDIT] Duration: ${probe.durationSec.toFixed(1)}s | Size: ${(probe.fileSizeBytes / (1024 * 1024)).toFixed(2)} MB`);
  if (contactSheetPath) {
    console.log(`[QC AUDIT] Contact Sheet: ${contactSheetPath}`);
  }

  if (passed) {
    console.log('[QC AUDIT] ✅ PASSED: Video meets production broadcast standards.');
  } else {
    console.error(`[QC AUDIT] ❌ BLOCKED: Found ${criticalErrors.length} critical issues:`);
    criticalErrors.forEach(e => console.error(`   - ${e}`));
  }

  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`   ⚠️ Warning: ${w}`));
  }
  console.log('[QC AUDIT] ========================================\n');

  return {
    passed,
    criticalErrors,
    warnings,
    metrics: {
      durationSec: probe.durationSec,
      width: probe.width,
      height: probe.height,
      fps: probe.fps,
      videoCodec: probe.videoCodec,
      hasAudio: probe.hasAudio,
      audioCodec: probe.audioCodec,
      fileSizeBytes: probe.fileSizeBytes
    },
    contactSheetPath
  };
}
