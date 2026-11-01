// scripts/youtube/engine/whatsapp-youtube-sharer.mjs
/**
 * VizhiTN Autonomous YouTube -> WhatsApp Channel Auto-Sharer
 *
 * Automatically broadcasts newly uploaded YouTube videos, Current Affairs Bulletins,
 * Viral Shorts, and Scheme Explainers to the official VizhiTN WhatsApp Channel.
 *
 * Enforces:
 * - 100% Anti-Duplication via dispatch-ledger.mjs
 * - High-CTR bilingual formatting tailored for WhatsApp readership
 * - Direct click-to-watch links (https://youtu.be/... or https://youtube.com/shorts/...)
 * - Zero crashing / non-blocking: Never interrupts the YouTube pipeline if WhatsApp is unavailable
 */

import fs from 'fs';
import path from 'path';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';

import { isAlreadyDispatched, recordDispatch } from '../../lib/dispatch-ledger.mjs';
import { VIZHITN_CHANNEL_JID } from '../../../src/lib/whatsappChannel.js';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

/**
 * Clean and format title for WhatsApp card
 */
function cleanTitle(title = '') {
  return title
    .replace(/[<>]/g, '')
    .replace(/\s*\|\s*VizhiTN.*$/i, '')
    .replace(/#\w+/g, '')
    .trim();
}

/**
 * Builds high-converting Tamil WhatsApp update text for YouTube content
 */
export function buildYouTubeWhatsAppMessage({
  title,
  description = '',
  videoUrl,
  videoId,
  isShort = false,
  category = 'video'
}) {
  const cTitle = cleanTitle(title);

  // Extract first 2-3 lines of description as key highlights
  const lines = (description || '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 10 && !l.startsWith('http') && !l.startsWith('#') && !l.includes('வாட்ஸ்அப்'));

  let hookText = lines.slice(0, 2).join('\n\n');
  if (!hookText || hookText.length < 20) {
    hookText = isShort
      ? '⚡ 60 நொடிகளில் தெரிந்துகொள்ள வேண்டிய முக்கியத் தகவல்! முழுமையாகப் பார்த்து பயன் பெறுங்கள்.'
      : '📢 இன்றைய முக்கிய நடப்பு நிகழ்வுகள் மற்றும் தமிழக அரசின் முக்கிய அறிவிப்புகள் குறித்த விரிவான காணொளி!';
  }

  const headerIcon = isShort ? '📱' : '🎬';
  const headerTag = isShort ? 'VizhiTN YouTube Shorts' : 'விழி தமிழ்நாடு — புதிய காணொளி';

  const actionText = isShort
    ? '👉 இந்த Shorts காணொளியை உடனே பார்க்க:'
    : '👉 முழு காணொளியைக் காண இங்கே கிளிக் செய்யவும்:';

  return `${headerIcon} *${headerTag}* \n\n` +
    `📌 *${cTitle}*\n\n` +
    `${hookText}\n\n` +
    `▶️ *${actionText}*\n` +
    `🔗 ${videoUrl}\n\n` +
    `──────────────────────────────\n` +
    `📲 *தினசரி முக்கிய தமிழ்நாடு செய்திகள் & உடனடி எச்சரிக்கைகளுக்கு:* \n` +
    `👉 https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228`;
}

/**
 * Dispatches a formatted message directly to WhatsApp Channel via Baileys socket.
 */
async function sendToChannelDirectly(messageText) {
  const authDir = path.resolve('scripts/baileys_auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const sessionB64 = process.env.WHATSAPP_SESSION;
  const credsPath = path.join(authDir, 'creds.json');
  if (sessionB64 && !fs.existsSync(credsPath)) {
    try {
      fs.writeFileSync(credsPath, Buffer.from(sessionB64, 'base64').toString('utf-8'));
    } catch (_) {}
  }

  if (!fs.existsSync(credsPath)) {
    console.warn('[WhatsAppShare] No Baileys credentials found (creds.json / WHATSAPP_SESSION). Skipping broadcast.');
    return null;
  }

  return new Promise(async (resolve) => {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(authDir);
      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['Chrome (Linux)', 'Chrome', '128.0.0.0']
      });

      sock.ev.on('creds.update', saveCreds);

      const timeout = setTimeout(() => {
        try { sock.end(); } catch (_) {}
        resolve(null);
      }, 25000);

      sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
          try {
            console.log(`[WhatsAppShare] Socket open! Broadcasting YouTube content to ${VIZHITN_CHANNEL_JID}...`);
            const sent = await sock.sendMessage(VIZHITN_CHANNEL_JID, { text: messageText });
            console.log(`[WhatsAppShare ✓] YouTube broadcast successfully delivered! ID: ${sent?.key?.id}`);
            clearTimeout(timeout);
            setTimeout(() => {
              try { sock.end(); } catch (_) {}
              resolve(sent);
            }, 1000);
          } catch (err) {
            console.error('[WhatsAppShare ❌] Dispatch error:', err.message);
            clearTimeout(timeout);
            try { sock.end(); } catch (_) {}
            resolve(null);
          }
        }
      });
    } catch (err) {
      console.error('[WhatsAppShare ❌] Socket initialization error:', err.message);
      resolve(null);
    }
  });
}

/**
 * Primary function to automatically share a published YouTube video or short to WhatsApp Channel.
 *
 * @param {Object} params
 * @param {string} params.videoId - YouTube video ID
 * @param {string} params.videoUrl - Full YouTube link
 * @param {string} params.title - Video title
 * @param {string} [params.description] - Video description
 * @param {boolean} [params.isShort=false] - Whether this is a short or longform bulletin
 * @param {string} [params.category='youtube'] - Category tag for ledger
 * @param {boolean} [params.dryRun=false] - If true, logs without sending
 */
export async function shareYouTubeBroadcastToWhatsApp({
  videoId,
  videoUrl,
  title,
  description = '',
  isShort = false,
  category = 'youtube',
  dryRun = false
}) {
  if (!videoId || !videoUrl) {
    console.warn('[WhatsAppShare WARN] Missing videoId or videoUrl. Cannot broadcast.');
    return false;
  }

  const dispatchSlug = `yt-${videoId}`;
  if (isAlreadyDispatched('whatsapp', dispatchSlug)) {
    console.log(`[WhatsAppShare ANTI-DUP] Video ${videoId} has already been shared to WhatsApp Channel. Skipping.`);
    return false;
  }

  const messageText = buildYouTubeWhatsAppMessage({
    title,
    description,
    videoUrl,
    videoId,
    isShort,
    category
  });

  const isDryRun = dryRun || process.argv.includes('--dry-run') || videoId === 'DRY_RUN_MOCK_ID';

  console.log('\n====================================================');
  console.log(`[WHATSAPP AUTO-SHARE] ${isShort ? 'SHORTS' : 'BULLETIN VIDEO'}: "${title}"`);
  console.log(`Target: ${VIZHITN_CHANNEL_JID}`);
  console.log('Preview:');
  console.log('----------------------------------------------------');
  console.log(messageText);
  console.log('====================================================\n');

  if (isDryRun) {
    console.log('[WhatsAppShare DRY-RUN] Message generated successfully. Skipping actual WhatsApp transmission.');
    return true;
  }

  try {
    const res = await sendToChannelDirectly(messageText);
    if (res) {
      await recordDispatch('whatsapp', dispatchSlug, {
        title,
        category: isShort ? 'youtube_shorts' : 'youtube_video'
      });
      console.log(`[WhatsAppShare ✓] Recorded "${dispatchSlug}" in dispatch ledger.`);
      return true;
    }
  } catch (err) {
    console.warn(`[WhatsAppShare WARN] Non-fatal sharing error: ${err.message}`);
  }

  return false;
}
