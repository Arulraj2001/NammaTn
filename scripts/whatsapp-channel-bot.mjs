// scripts/whatsapp-channel-bot.mjs
/**
 * VizhiTN Autonomous Scheduled WhatsApp Channel Dispatcher
 * Strictly adheres to 4 scheduled windows (Morning, Midday, Poll, Evening).
 * 100% Anti-Duplication: Every broadcast is checked against dispatch-ledger.mjs.
 * Zero-Fallback Policy: If no fresh unbroadcasted event exists for the slot, safely exits without spamming.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';

import { generateVerifiedWhatsAppPost } from './whatsapp/engine/whatsapp-formatter.mjs';
import { isAlreadyDispatched, recordDispatch, isEventStale } from './lib/dispatch-ledger.mjs';
import { VIZHITN_CHANNEL_JID } from '../src/lib/whatsappChannel.js';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

export async function generateWhatsAppBulletin(post, options = {}) {
  const result = await generateVerifiedWhatsAppPost({ post, isForwardVariant: options.isForwardVariant });
  return result.message;
}

// ── Daily Engagement Polls (Scheduled for 02:00 PM IST) ─────────────────────
const DAILY_COMMUNITY_POLLS = [
  {
    dayOfWeek: 1, // Monday
    question: "⚡ இன்று உங்கள் பகுதியில் மின்தடை அல்லது மின் விநியோக குறைபாடு ஏற்பட்டதா?",
    callout: "👇 உங்கள் நிலவரத்தை கீழே ரியாக்ட் செய்யவும்: \n👍 = ஆம், மின்தடை இருந்தது \n❌ = இல்லை, தடையின்றி வந்தது"
  },
  {
    dayOfWeek: 2, // Tuesday
    question: "💧 உங்கள் வார்டு / பகுதியில் குடிநீர் விநியோகம் சரியான அழுத்தத்தில் வருகிறதா?",
    callout: "👇 உங்கள் நிலவரத்தை கீழே ரியாக்ட் செய்யவும்: \n👍 = ஆம், சீராக வருகிறது \n❌ = இல்லை, தட்டுப்பாடு உள்ளது"
  },
  {
    dayOfWeek: 3, // Wednesday
    question: "⚠️ இந்த வாரம் உங்கள் மொபைலுக்கு சந்தேகத்திற்கிடமான மின் கட்டண அல்லது வங்கி SMS வந்ததா?",
    callout: "👇 கீழே ரியாக்ட் செய்யவும்: \n🚨 = ஆம், போலி SMS வந்தது (1930 புகார்) \n✅ = இல்லை, வரவில்லை"
  },
  {
    dayOfWeek: 4, // Thursday
    question: "🚌 உங்கள் பகுதியில் அரசு நகரப் பேருந்துகள் (MTC / TNSTC) குறிப்பிட்ட நேரத்திற்கு வருகிறதா?",
    callout: "👇 கீழே ரியாக்ட் செய்யவும்: \n👍 = குறிப்பிட்ட நேரத்தில் வருகிறது \n❌ = தாமதமாக வருகிறது"
  },
  {
    dayOfWeek: 5, // Friday
    question: "🌾 இந்த மாதம் ரேஷன் கடையில் உங்கள் குடும்ப அட்டைக்கான முழு பொருட்கள் தடையின்றி கிடைத்ததா?",
    callout: "👇 கீழே ரியாக்ட் செய்யவும்: \n👍 = முழுமையாக கிடைத்தது \n❌ = சில பொருட்கள் கிடைக்கவில்லை"
  },
  {
    dayOfWeek: 6, // Saturday
    question: "🚧 உங்கள் ஏரியா முக்கிய சாலையில் மழைநீர் வடிகால் அல்லது தார் சாலை சீரமைப்பு பணிகள் நடந்துள்ளதா?",
    callout: "👇 கீழே ரியாக்ட் செய்யவும்: \n👍 = சீரமைக்கப்பட்டுள்ளது \n❌ = இன்னும் குண்டும் குழியுமாக உள்ளது"
  },
  {
    dayOfWeek: 0, // Sunday
    question: "📋 மகளிர் உரிமைத் தொகை அல்லது அரசு நலத்திட்டங்கள் பெறுவதில் ஏதேனும் சிக்கல் உள்ளதா?",
    callout: "👇 கீழே ரியாக்ட் செய்யவும்: \n👍 = பிரச்சனை ஏதுமில்லை \n❌ = உதவி மையம் நாட வேண்டியுள்ளது"
  }
];

function getNowIst() {
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 3600 * 1000);
  return {
    date: ist.toISOString().slice(0, 10),
    hours: ist.getUTCHours(),
    minutes: ist.getUTCMinutes(),
    dayOfWeek: ist.getUTCDay()
  };
}

function resolveActiveSlot(cliSlot) {
  if (cliSlot && cliSlot !== 'auto') return cliSlot;
  const now = getNowIst();
  if (now.hours >= 6 && now.hours < 11) return 'morning';
  if (now.hours >= 11 && now.hours < 14) return 'midday';
  if (now.hours >= 14 && now.hours < 17) return 'poll';
  return 'evening';
}

/**
 * Dispatches a single formatted text message to WhatsApp Channel via Baileys.
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
    console.warn('[WhatsAppChannel] No Baileys credentials found (creds.json / WHATSAPP_SESSION). Exiting cleanly.');
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
            console.log(`[WhatsAppChannel] Connected! Broadcasting to ${VIZHITN_CHANNEL_JID}...`);
            const sent = await sock.sendMessage(VIZHITN_CHANNEL_JID, { text: messageText });
            console.log(`[WhatsAppChannel ✓] Message successfully delivered! ID: ${sent?.key?.id}`);
            clearTimeout(timeout);
            setTimeout(() => {
              try { sock.end(); } catch (_) {}
              resolve(sent);
            }, 1000);
          } catch (err) {
            console.error('[WhatsAppChannel ❌] Send failed:', err.message);
            clearTimeout(timeout);
            try { sock.end(); } catch (_) {}
            resolve(null);
          }
        }
      });
    } catch (err) {
      console.error('[WhatsAppChannel ❌] Socket error:', err.message);
      resolve(null);
    }
  });
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const slotArg = process.argv.find(a => a.startsWith('--slot='))?.split('=')[1];
  const activeSlot = resolveActiveSlot(slotArg);
  const now = getNowIst();

  console.log('====================================================');
  console.log('VizhiTN Scheduled WhatsApp Channel Dispatcher');
  console.log(`Current IST: ${now.date} ${now.hours.toString().padStart(2, '0')}:${now.minutes.toString().padStart(2, '0')}`);
  console.log(`Active Slot: ${activeSlot.toUpperCase()} ${isDryRun ? '(DRY RUN)' : ''}`);
  console.log('====================================================');

  // --- SLOT: POLL (02:00 PM IST) ---
  if (activeSlot === 'poll') {
    const pollToday = DAILY_COMMUNITY_POLLS.find(p => p.dayOfWeek === now.dayOfWeek) || DAILY_COMMUNITY_POLLS[0];
    const pollSlug = `poll-engagement-${now.date}`;

    if (isAlreadyDispatched('whatsapp', pollSlug)) {
      console.log(`[ANTI-DUP ✓] Today's interactive community poll was already broadcasted. Safe clean exit.`);
      return;
    }

    const pollMessage = `📊 *விழி தமிழ்நாடு — இன்றைய மக்கள் கருத்துக்கணிப்பு* \n(${now.date})\n\n` +
      `❓ *${pollToday.question}*\n\n` +
      `${pollToday.callout}\n\n` +
      `──────────────────────────────\n` +
      `📲 *VizhiTN உடனடி எச்சரிக்கைகள் & உண்மை செய்திகளுக்கு:* \n` +
      `👉 https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228`;

    console.log('\n--- [SCHEDULED POLL BROADCAST] ---');
    console.log(pollMessage);

    if (!isDryRun) {
      const res = await sendToChannelDirectly(pollMessage);
      if (res) {
        await recordDispatch('whatsapp', pollSlug, { title: pollToday.question, category: 'poll' });
      }
    }
    return;
  }

  // --- SLOTS: MORNING / MIDDAY / EVENING ---
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Determine query parameters based on scheduled window
  let catFilter = [];
  let urgencyOrder = true;

  if (activeSlot === 'morning') {
    // High-priority utility & shutdown alerts
    catFilter = ['electricity', 'water-sanitation', 'environment', 'road-infrastructure'];
  } else if (activeSlot === 'midday') {
    // Government schemes, public safety, transit progress
    catFilter = ['government-schemes', 'public-safety', 'transport', 'healthcare', 'education'];
  } else {
    // Evening: tomorrow's advance notices, transport line blocks
    catFilter = ['electricity', 'transport', 'road-infrastructure', 'government-schemes'];
  }

  // Fetch candidate posts from last 36 hours (status = 'active')
  const sinceTime = new Date(Date.now() - 36 * 3600 * 1000).toISOString();
  const { data: candidates, error: fetchErr } = await supabase
    .from('post')
    .select('*')
    .eq('status', 'active')
    .in('category_slug', catFilter)
    .gte('created_date', sinceTime)
    .order('created_date', { ascending: false })
    .limit(30);

  if (fetchErr || !candidates || candidates.length === 0) {
    console.log(`[INFO] No active posts found in Supabase for slot "${activeSlot}". Safe clean exit.`);
    return;
  }

  // Filter out any post already broadcasted or stale
  const eligiblePosts = candidates.filter(p => {
    if (!p.slug) return false;
    // Check if already dispatched to WhatsApp
    if (isAlreadyDispatched('whatsapp', p.slug)) {
      return false;
    }
    // Check if event is stale (older than today)
    if (isEventStale(p.created_date)) {
      return false;
    }
    return true;
  });

  if (eligiblePosts.length === 0) {
    console.log(`[ANTI-DUP ✓] All ${candidates.length} candidate posts have already been broadcasted to WhatsApp. Safe clean exit — zero duplicates.`);
    return;
  }

  // Priority ranking per slot
  if (activeSlot === 'midday') {
    // Prioritize Welfare Schemes, Job Alerts, and Education
    eligiblePosts.sort((a, b) => {
      const getPriorityScore = (p) => {
        const text = `${p.title_en || ''} ${p.title_ta || ''} ${p.content_en || ''}`.toLowerCase();
        let score = 0;
        if (p.category_slug === 'government-schemes') score += 10;
        if (p.category_slug === 'education') score += 8;
        if (text.includes('scheme') || text.includes('உரிமை') || text.includes('kmut') || text.includes('மகளிர்')) score += 5;
        if (text.includes('job') || text.includes('recruitment') || text.includes('வேலை') || text.includes('பணியிடம்') || text.includes('தேர்வு')) score += 5;
        return score;
      };
      const scoreDiff = getPriorityScore(b) - getPriorityScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      const rank = { critical: 4, high: 3, medium: 2, low: 1 };
      return (rank[b.urgency_level] || 1) - (rank[a.urgency_level] || 1);
    });
  } else {
    // Sort by urgency: critical > high > medium > low
    eligiblePosts.sort((a, b) => {
      const rank = { critical: 4, high: 3, medium: 2, low: 1 };
      return (rank[b.urgency_level] || 1) - (rank[a.urgency_level] || 1);
    });
  }

  const selectedPost = eligiblePosts[0];
  console.log(`[SLOT SELECTION] Selected fresh unbroadcasted post: "${selectedPost.title_ta || selectedPost.title_en}"`);
  console.log(`District: ${selectedPost.district_slug} | Category: ${selectedPost.category_slug} | Urgency: ${selectedPost.urgency_level}`);

  const formatted = await generateVerifiedWhatsAppPost({ post: selectedPost, isForwardVariant: false });
  console.log('\n--- [VERIFIED WHATSAPP BULLETIN] ---');
  console.log(formatted.message);

  if (isDryRun) {
    console.log('\n[DRY RUN] Skipping live WhatsApp channel dispatch.');
    return;
  }

  // Live broadcast
  const sendResult = await sendToChannelDirectly(formatted.message);
  if (sendResult) {
    await recordDispatch('whatsapp', selectedPost.slug, {
      title: selectedPost.title_ta || selectedPost.title_en,
      district: selectedPost.district_slug,
      category: selectedPost.category_slug
    });
    console.log(`[DISPATCH COMPLETE ✓] Successfully posted to WhatsApp Channel!`);
  }
}

main().catch(err => {
  console.error('[FATAL WHATSAPP DISPATCH ERROR]:', err.message);
  process.exit(1);
});
