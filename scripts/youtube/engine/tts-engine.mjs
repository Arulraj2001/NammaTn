// scripts/youtube/engine/tts-engine.mjs
// Neural Speech Synthesis engine using Microsoft Edge-TTS with SRT subtitle generation

import fs from 'fs';
import path from 'path';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { YOUTUBE_CONFIG } from '../config.mjs';

/**
 * Synthesizes text to an MP3 file using Edge-TTS
 * @param {string} text - Plain text or SSML in Tamil
 * @param {string} outputFilePath - Target MP3 file path
 * @param {Object} options - voice, rate, pitch
 * @returns {Promise<{ filePath: string, voice: string, textLength: number }>}
 */
export async function synthesizeSpeech(text, outputFilePath, options = {}) {
  const voice = options.voice || YOUTUBE_CONFIG.voices.tamilFemale;
  const rate = options.rate || YOUTUBE_CONFIG.voices.defaultRate;
  const pitch = options.pitch || YOUTUBE_CONFIG.voices.defaultPitch;

  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  // Ensure output directory exists
  const dir = path.dirname(outputFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Use toFile directly
  const { audioFilePath } = await tts.toFile(dir, text, { rate, pitch });

  // Rename generated temp file to requested outputFilePath
  if (fs.existsSync(audioFilePath)) {
    if (audioFilePath !== outputFilePath) {
      if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
      fs.renameSync(audioFilePath, outputFilePath);
    }
  }

  return {
    filePath: outputFilePath,
    voice,
    textLength: text.length
  };
}

/**
 * Generates an SRT subtitle file from narration segments
 * @param {Array<{ text: string, startSec: number, endSec: number }>} segments
 * @param {string} srtOutputPath
 */
export function generateSrtFile(segments, srtOutputPath) {
  function formatSrtTime(totalSec) {
    const hrs = Math.floor(totalSec / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const secs = Math.floor(totalSec % 60).toString().padStart(2, '0');
    const millis = Math.floor((totalSec % 1) * 1000).toString().padStart(3, '0');
    return `${hrs}:${mins}:${secs},${millis}`;
  }

  let srt = '';
  segments.forEach((seg, index) => {
    srt += `${index + 1}\n`;
    srt += `${formatSrtTime(seg.startSec)} --> ${formatSrtTime(seg.endSec)}\n`;
    srt += `${seg.text.trim()}\n\n`;
  });

  fs.writeFileSync(srtOutputPath, srt, 'utf-8');
  return srtOutputPath;
}
