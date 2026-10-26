// scripts/youtube/engine/gemini-tts.mjs
/**
 * Lifelike Neural Speech Synthesis via Google Gemini Speech Engine
 * Models: gemini-3.1-flash-tts-preview / gemini-3.8-flash-tts
 * Provides natural human breathing, authentic inflection, and conversational pacing.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getFfmpegBinaryPath } from './video-composer.mjs';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const GEMINI_TTS_MODELS = [
  'gemini-3.1-flash-tts-preview',
  'gemini-3.8-flash-tts',
  'gemini-3.8-flash-lite-tts'
];

// Prebuilt voices mapping
export const VOICE_PROFILES = {
  karthik: {
    voiceName: 'Puck', // Energetic, curious, grounded male tone
    description: 'Investigative male reporter'
  },
  kavitha: {
    voiceName: 'Aoede', // Authoritative, clear, professional female tone
    description: 'Legal & systems researcher'
  },
  alert: {
    voiceName: 'Kore', // High urgency, crisp news announcer tone
    description: 'Civic alert narrator'
  }
};

/**
 * Synthesizes spoken Tamil text to a high-fidelity audio file using Gemini TTS
 *
 * @param {string} text - Spoken text in Tamil
 * @param {string} outputPath - Output file path (.mp3 or .wav)
 * @param {Object} options - { voice: 'karthik'|'kavitha'|'alert'|'Puck'|'Aoede', model: string }
 * @returns {Promise<string>} Path to generated audio file
 */
export async function synthesizeGeminiSpeech(text, outputPath, options = {}) {
  const apiKey = process.env.NEW_GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('[GeminiTTS] No GEMINI API key configured in environment.');
  }

  const voiceKey = options.voice || 'alert';
  let voiceName = VOICE_PROFILES[voiceKey]?.voiceName;
  if (!voiceName) {
    if (typeof voiceKey === 'string' && voiceKey.toLowerCase().includes('valluvar')) {
      voiceName = 'Puck';
    } else if (typeof voiceKey === 'string' && (voiceKey.toLowerCase().includes('pallavi') || voiceKey.toLowerCase().includes('female'))) {
      voiceName = 'Aoede';
    } else if (['Puck', 'Aoede', 'Charon', 'Fenrir', 'Kore'].includes(voiceKey)) {
      voiceName = voiceKey;
    } else {
      voiceName = 'Aoede';
    }
  }

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let audioBuffer = null;
  let receivedMimeType = 'audio/wav';

  for (const model of GEMINI_TTS_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text }] }],
          generationConfig: {
            responseModalities: ['audio'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceName
                }
              }
            }
          }
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[GeminiTTS] Model ${model} returned HTTP ${res.status}: ${errText.slice(0, 100)}`);
        continue;
      }

      const data = await res.json();
      const inlineData = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData;

      if (inlineData && inlineData.data) {
        audioBuffer = Buffer.from(inlineData.data, 'base64');
        receivedMimeType = inlineData.mimeType || 'audio/wav';
        break;
      }
    } catch (fetchErr) {
      console.warn(`[GeminiTTS] Attempt with ${model} failed: ${fetchErr.message}`);
    }
  }

  if (!audioBuffer) {
    throw new Error('[GeminiTTS] Failed to synthesize audio from all Gemini TTS candidate models.');
  }

  // Write temporary raw audio file
  const tempRawFile = path.join(dir, `_temp_gemini_raw_${Date.now()}_${Math.random().toString(36).substring(7)}.raw`);
  fs.writeFileSync(tempRawFile, audioBuffer);

  try {
    const ffmpeg = getFfmpegBinaryPath();
    // Gemini returns raw PCM (audio/l16; rate=24000; channels=1)
    const cmd = `"${ffmpeg}" -y -f s16le -ar 24000 -ac 1 -i "${tempRawFile}" -af "volume=1.2" -ar 44100 -ac 2 -b:a 192k "${outputPath}"`;
    execSync(cmd, { stdio: 'pipe', timeout: 30000 });
  } catch (ffmpegErr) {
    throw new Error(`[GeminiTTS] FFmpeg PCM conversion failed: ${ffmpegErr.message}`);
  } finally {
    if (fs.existsSync(tempRawFile)) {
      try { fs.unlinkSync(tempRawFile); } catch {}
    }
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size === 0) {
    throw new Error(`[GeminiTTS] Output audio file was not written to: ${outputPath}`);
  }

  return outputPath;
}
