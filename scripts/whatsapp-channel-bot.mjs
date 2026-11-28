// scripts/whatsapp-channel-bot.mjs
/**
 * VizhiTN Autonomous WhatsApp Channel Growth Dispatcher
 *
 * Strictly enforces 4 clean, high-value native slots (Zero YouTube link spam):
 * 1. Morning (07:30 AM IST): "Top 5 Headlines in 60s" Capsule + Statewide Consolidated Power Cut / Holiday Card
 * 2. Midday  (12:00 PM IST): Live Verified TN Govt & Fresher Job Radar Card (or Welfare Scheme fallback)
 * 3. Poll    (03:00 PM IST): Native 1-Tap WhatsApp Poll (Exam 1-Mark Quiz / Civic Pulse)
 * 4. Evening (07:00 PM IST): Tomorrow Advance Power Cut Card + Verified Civic/Cyber Safety Alert (1930)
 *
 * Strict Rules:
 * - Zero-Hallucination Policy: If no real verified data exists for a slot, cleanly exits without uploading.
 * - 100% Anti-Duplication: Every broadcast is checked against Cloudflare R2 dispatch-ledger.mjs.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import pino from 'pino';

import { generateVerifiedWhatsAppPost } from './whatsapp/engine/whatsapp-formatter.mjs';
import { isAlreadyDispatched, recordDispatch, isEventStale } from './lib/dispatch-ledger.mjs';
import { VIZHITN_CHANNEL_JID } from '../src/lib/whatsappChannel.js';
import {
  getIstClock,
  fetchMorningTop5Headlines,
  fetchConsolidatedPowerCuts,
  fetchVerifiedJobRadar,
  fetchInteractiveDailyPoll,
} from './whatsapp/engine/whatsapp-growth-fetcher.mjs';
import { renderPowerCutDigestCard, renderJobRadarCard } from './whatsapp/engine/whatsapp-card-renderer.mjs';

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

function resolveActiveSlot(cliSlot) {
  if (cliSlot && cliSlot !== 'auto') return cliSlot;
  const now = getIstClock();
  if (now.hours >= 6 && now.hours < 11) return 'morning';
  if (now.hours >= 11 && now.hours < 14) return 'midday';
  if (now.hours >= 14 && now.hours < 18) return 'poll';
  return 'evening';
}

/**
 * Opens one Baileys session, dispatches one or more payloads (text, image+caption, or native poll),
 * with automatic text fallback if newsletter media/poll upload fails.
 */
async function sendPayloadsToChannel(payloads = []) {
  if (!Array.isArray(payloads) || payloads.length === 0) return [];

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
    console.warn('[WhatsAppChannel] No Baileys credentials found (creds.json / WHATSAPP_SESSION). Skipping live send.');
    return [];
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
        browser: ['Chrome (Linux)', 'Chrome', '128.0.0.0'],
      });

      sock.ev.on('creds.update', saveCreds);

      const timeout = setTimeout(() => {
        try { sock.end(); } catch (_) {}
        resolve([]);
      }, 45000);

      sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
          const sentResults = [];
          try {
            console.log(`[WhatsAppChannel] Connected! Sending ${payloads.length} message(s) to ${VIZHITN_CHANNEL_JID}...`);
            for (const item of payloads) {
              try {
                const sent = await sock.sendMessage(VIZHITN_CHANNEL_JID, item.primary);
                console.log(`[WhatsAppChannel ✓] Sent "${item.label}" ID: ${sent?.key?.id}`);
                sentResults.push({ label: item.label, slug: item.slug, meta: item.meta, sent });
              } catch (sendErr) {
                console.warn(`[WhatsAppChannel WARN] Primary send failed for "${item.label}" (${sendErr.message}).`);
                if (item.fallbackText) {
                  try {
                    const fallbackSent = await sock.sendMessage(VIZHITN_CHANNEL_JID, { text: item.fallbackText });
                    console.log(`[WhatsAppChannel ✓] Fallback text delivered for "${item.label}" ID: ${fallbackSent?.key?.id}`);
                    sentResults.push({ label: item.label, slug: item.slug, meta: item.meta, sent: fallbackSent });
                  } catch (fbErr) {
                    console.error(`[WhatsAppChannel ❌] Fallback failed for "${item.label}": ${fbErr.message}`);
                  }
                }
              }
              await new Promise(r => setTimeout(r, 1500));
            }
          } finally {
            clearTimeout(timeout);
            setTimeout(() => {
              try { sock.end(); } catch (_) {}
              resolve(sentResults);
            }, 1200);
          }
        }
      });
    } catch (err) {
      console.error('[WhatsAppChannel ❌] Socket error:', err.message);
      resolve([]);
    }
  });
}

function buildTop5Message(top5) {
  const bullets = top5.headlines.map((h, i) => `${i + 1}️⃣ ${h.emoji} ${h.textTa}`).join('\n\n');
  return `📰 *விழி தமிழ்நாடு — இன்றைய டாப் 5 முக்கிய செய்திகள்*\n📅 ${top5.tamilDate} | ⏱️ 60 வினாடிச் சுருக்கம்\n\n${bullets}\n\n🔁 *தினசரி காலை சுருக்கத்தை உங்கள் நண்பர்கள் & குடும்ப குரூப்பில் பகிரவும்!*\n📲 https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228`;
}

function buildPowerCutCaption(digest) {
  const listText = digest.items
    .map(i => `📍 *${i.districtTa}:* ${i.areasTa} *(⏰ ${i.timingTa})*`)
    .join('\n');

  return `${digest.headlineTa} (${digest.tamilDate})\n\n${listText}\n\n📞 அவசர உதவி எண்: *${digest.helpline || '1912'}*\n🔁 உங்கள் ஏரியா நண்பர்களுக்கு மறக்காமல் பகிருங்கள்!\n📲 https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228`;
}

function buildJobRadarCaption(job) {
  const badge = job.isGovt ? '🚨 *TN அரசு வேலைவாய்ப்பு அறிவிப்பு*' : '💼 *தமிழ்நாடு வேலைவாய்ப்பு அறிவிப்பு*';
  return `${badge}\n\n📌 *பதவி:* ${job.roleTa}\n🏢 *நிறுவனம்:* ${job.orgTa}\n🎓 *கல்வித் தகுதி:* ${job.qualificationTa}\n💰 *ஊதியம்:* ${job.salaryTa}\n👥 *பணியிடங்கள்:* ${job.vacanciesTa || 'அதிகாரப்பூர்வ அறிவிப்புப்படி'}\n⏳ *கடைசி தேதி:* ${job.lastDateTa}\n\n🔗 *நேரடியாக விண்ணப்பிக்க:*\n${job.applyUrl}\n\n👉 *வேலை தேடும் உங்கள் நண்பர்கள் & கல்லூரி குரூப்பில் உடனே பகிரவும்!*\n📲 https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228`;
}

async function fetchFallbackSupabasePost(categories, nowDate, prioritizeMidday = false) {
  if (!supabaseUrl || !supabaseKey) return null;
  const supabase = createClient(supabaseUrl, supabaseKey);
  const sinceTime = new Date(Date.now() - 36 * 3600 * 1000).toISOString();

  const { data: candidates, error } = await supabase
    .from('post')
    .select('id,slug,title_ta,title_en,content_ta,content_en,district_slug,area_name,location_text,category_slug,post_type,urgency_level,canonical_url,created_date')
    .eq('status', 'active')
    .in('category_slug', categories)
    .gte('created_date', sinceTime)
    .order('created_date', { ascending: false })
    .limit(20);

  if (error || !candidates || candidates.length === 0) return null;

  const eligible = candidates.filter(p => {
    if (!p.slug || isAlreadyDispatched('whatsapp', p.slug)) return false;
    if (p.post_type === 'alert' && isEventStale(p.created_date)) {
      const fullText = `${p.title_en || ''} ${p.title_ta || ''} ${p.content_en || ''}`;
      if (!fullText.includes('Tomorrow') && !fullText.includes('நாளை') && !fullText.includes(nowDate)) return false;
    }
    return true;
  });

  if (eligible.length === 0) return null;

  eligible.sort((a, b) => {
    const rank = { critical: 4, high: 3, medium: 2, low: 1 };
    if (prioritizeMidday) {
      const scoreA = (a.category_slug === 'government-schemes' ? 5 : 0) + (rank[a.urgency_level] || 1);
      const scoreB = (b.category_slug === 'government-schemes' ? 5 : 0) + (rank[b.urgency_level] || 1);
      return scoreB - scoreA;
    }
    return (rank[b.urgency_level] || 1) - (rank[a.urgency_level] || 1);
  });

  return eligible[0];
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const slotArg = process.argv.find(a => a.startsWith('--slot='))?.split('=')[1];
  const activeSlot = resolveActiveSlot(slotArg);
  const now = getIstClock();
  const tempFiles = [];
  const payloads = [];

  console.log('====================================================');
  console.log('VizhiTN WhatsApp Channel Growth Dispatcher');
  console.log(`Current IST: ${now.date} ${String(now.hours).padStart(2, '0')}:${String(now.minutes).padStart(2, '0')}`);
  console.log(`Active Slot: ${activeSlot.toUpperCase()} ${isDryRun ? '(DRY RUN)' : ''}`);
  console.log('====================================================');

  // ── SLOT 1: MORNING (Top 5 Headlines + Statewide Power Cut Card) ────────
  if (activeSlot === 'morning' || activeSlot === 'morning-top5') {
    const top5Slug = `top5-headlines-${now.date}`;
    if (!isAlreadyDispatched('whatsapp', top5Slug)) {
      const top5 = await fetchMorningTop5Headlines();
      if (top5) {
        const text = buildTop5Message(top5);
        payloads.push({
          label: 'Morning Top 5 Headlines',
          slug: top5Slug,
          meta: { title: 'Top 5 Headlines', category: 'top5' },
          primary: { text },
        });
      }
    }

    const pwrSlug = `power-digest-today-${now.date}`;
    if (!isAlreadyDispatched('whatsapp', pwrSlug)) {
      const digest = await fetchConsolidatedPowerCuts({ mode: 'today' });
      if (digest) {
        const caption = buildPowerCutCaption(digest);
        const cardPath = path.resolve(`scripts/youtube/assets/wa_power_${Date.now()}.png`);
        renderPowerCutDigestCard(digest, cardPath);
        tempFiles.push(cardPath);
        payloads.push({
          label: 'Statewide Power Cut / Holiday Card',
          slug: pwrSlug,
          meta: { title: digest.headlineTa, category: 'power_digest' },
          primary: { image: fs.readFileSync(cardPath), caption },
          fallbackText: caption,
        });
      }
    }
  }

  // ── SLOT 2: MIDDAY (Verified TN Govt & Fresher Job Radar Card) ──────────
  else if (activeSlot === 'midday' || activeSlot === 'job-radar') {
    const job = await fetchVerifiedJobRadar();
    if (job) {
      const caption = buildJobRadarCaption(job);
      const cardPath = path.resolve(`scripts/youtube/assets/wa_job_${Date.now()}.png`);
      renderJobRadarCard(job, cardPath);
      tempFiles.push(cardPath);
      payloads.push({
        label: 'Verified Job Radar Card',
        slug: job.slug,
        meta: { title: job.roleTa, category: 'job_radar' },
        primary: { image: fs.readFileSync(cardPath), caption },
        fallbackText: caption,
      });
    } else {
      // Fallback ONLY to verified unbroadcasted scheme/education DB post
      const post = await fetchFallbackSupabasePost(['government-schemes', 'education', 'healthcare'], now.date, true);
      if (post) {
        const formatted = await generateVerifiedWhatsAppPost({ post, isForwardVariant: false });
        payloads.push({
          label: 'Midday Scheme / Education Bulletin',
          slug: post.slug,
          meta: { title: post.title_ta || post.title_en, category: post.category_slug },
          primary: { text: formatted.message },
        });
      }
    }
  }

  // ── SLOT 3: AFTERNOON NATIVE POLL (Exam 1-Mark / Civic Pulse) ───────────
  else if (activeSlot === 'poll') {
    const poll = await fetchInteractiveDailyPoll();
    if (!isAlreadyDispatched('whatsapp', poll.id)) {
      const fallbackText =
        `📊 *விழி தமிழ்நாடு — இன்றைய மக்கள் கருத்துக்கணிப்பு*\n\n❓ *${poll.question}*\n\n` +
        poll.options.map((opt, idx) => `${idx + 1}️⃣ ${opt}`).join('\n') +
        `\n\n👇 உங்கள் கருத்தை ரியாக்ட் / கமெண்ட் செய்யுங்கள்!\n📲 https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228`;

      payloads.push({
        label: `Native Poll (${poll.kind})`,
        slug: poll.id,
        meta: { title: poll.question, category: 'poll' },
        primary: {
          poll: {
            name: poll.question,
            values: poll.options,
            selectableCount: 1,
          },
        },
        fallbackText,
      });
    }
  }

  // ── SLOT 4: EVENING (Tomorrow Advance Power Cut Card / Cyber Alert) ─────
  else {
    const effectiveEveningDate = now.hours < 6
      ? new Date(Date.now() + (5.5 - 24) * 3600 * 1000).toISOString().slice(0, 10)
      : now.date;
    const tmrSlug = `power-digest-tomorrow-${effectiveEveningDate}`;
    if (!isAlreadyDispatched('whatsapp', tmrSlug)) {
      const tmrDigest = await fetchConsolidatedPowerCuts({ mode: 'tomorrow' });
      if (tmrDigest) {
        const caption = buildPowerCutCaption(tmrDigest);
        const cardPath = path.resolve(`scripts/youtube/assets/wa_tmr_${Date.now()}.png`);
        renderPowerCutDigestCard(tmrDigest, cardPath);
        tempFiles.push(cardPath);
        payloads.push({
          label: 'Tomorrow Advance Power Cut Card',
          slug: tmrSlug,
          meta: { title: tmrDigest.headlineTa, category: 'power_advance' },
          primary: { image: fs.readFileSync(cardPath), caption },
          fallbackText: caption,
        });
      }
    }

    if (payloads.length === 0) {
      const post = await fetchFallbackSupabasePost(['public-safety', 'electricity', 'transport', 'road-infrastructure'], now.date);
      if (post) {
        const formatted = await generateVerifiedWhatsAppPost({ post, isForwardVariant: false });
        payloads.push({
          label: 'Evening Verified Civic/Scam Alert',
          slug: post.slug,
          meta: { title: post.title_ta || post.title_en, category: post.category_slug },
          primary: { text: formatted.message },
        });
      }
    }
  }

  if (payloads.length === 0) {
    console.log(`[SKIP ✓] No real unbroadcasted verified content available for slot "${activeSlot}". Exiting cleanly — zero spam.`);
    return;
  }

  console.log(`\n[QUEUE READY] ${payloads.length} verified broadcast(s) prepared:`);
  for (const p of payloads) {
    console.log(`\n--- [${p.label}] (${p.slug}) ---`);
    if (p.primary.poll) {
      console.log('NATIVE POLL:', p.primary.poll.name, 'Options:', p.primary.poll.values);
    } else if (p.primary.image) {
      console.log('IMAGE CARD + CAPTION:\n' + p.primary.caption);
    } else {
      console.log(p.primary.text);
    }
  }

  if (!isDryRun) {
    const delivered = await sendPayloadsToChannel(payloads);
    for (const d of delivered) {
      await recordDispatch('whatsapp', d.slug, d.meta);
    }
  } else {
    console.log('\n[DRY RUN ✓] Skipped live WhatsApp socket broadcast.');
  }

  for (const f of tempFiles) {
    try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch {}
  }
}

main().catch(err => {
  console.error('[FATAL WHATSAPP DISPATCH ERROR]:', err.message);
  process.exit(1);
});
