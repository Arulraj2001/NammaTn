import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export const VIZHITN_CHANNEL_JID = "120363431698818549@newsletter";

/**
 * Ensures the Baileys auth directory is initialized from process.env.WHATSAPP_SESSION if present.
 */
function prepareAuthDir(authDir) {
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  const sessionB64 = process.env.WHATSAPP_SESSION;
  const credsPath = path.join(authDir, "creds.json");

  if (sessionB64 && !fs.existsSync(credsPath)) {
    try {
      const decoded = Buffer.from(sessionB64, "base64").toString("utf-8");
      fs.writeFileSync(credsPath, decoded);
    } catch (err) {
      console.warn("[WhatsAppChannel] Failed to decode WHATSAPP_SESSION:", err.message);
    }
  }
}

/**
 * Resolves a thumbnail JPEG buffer for WhatsApp rich link card preview.
 * Prioritizes crisp photographs over text-heavy graphic cards to prevent blurry previews.
 */
async function resolveThumbnail(imageInput) {
  try {
    if (Buffer.isBuffer(imageInput)) {
      return await sharp(imageInput)
        .resize(600, 400, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();
    }

    if (typeof imageInput === "string") {
      // If it's a remote URL
      if (imageInput.startsWith("http://") || imageInput.startsWith("https://")) {
        try {
          const res = await fetch(imageInput);
          if (res.ok) {
            const arrBuf = await res.arrayBuffer();
            return await sharp(Buffer.from(arrBuf))
              .resize(600, 400, { fit: 'cover', position: 'center' })
              .jpeg({ quality: 80, mozjpeg: true })
              .toBuffer();
          }
        } catch (_) {}
      }

      // If it's a local file path
      if (fs.existsSync(imageInput)) {
        return await sharp(imageInput)
          .resize(600, 400, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 80, mozjpeg: true })
          .toBuffer();
      }
    }

    // Fallback: Pick latest photo (cf-photo-*) first, which is clean and sharp.
    const postsDir = path.resolve(process.cwd(), "public/images/posts");
    if (fs.existsSync(postsDir)) {
      const allFiles = fs.readdirSync(postsDir);

      // 1. Look for clean story photos first
      const photoFiles = allFiles
        .filter(f => f.startsWith("cf-photo-") && (f.endsWith(".jpg") || f.endsWith(".jpeg") || f.endsWith(".png")))
        .sort((a, b) => fs.statSync(path.join(postsDir, b)).mtimeMs - fs.statSync(path.join(postsDir, a)).mtimeMs);

      if (photoFiles.length > 0) {
        const latestPhoto = path.join(postsDir, photoFiles[0]);
        return await sharp(latestPhoto)
          .resize(600, 400, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 80, mozjpeg: true })
          .toBuffer();
      }

      // 2. Fallback to latest card if no photos available
      const cardFiles = allFiles
        .filter(f => f.startsWith("card-") && (f.endsWith(".webp") || f.endsWith(".jpg")))
        .sort((a, b) => fs.statSync(path.join(postsDir, b)).mtimeMs - fs.statSync(path.join(postsDir, a)).mtimeMs);

      if (cardFiles.length > 0) {
        const latestCard = path.join(postsDir, cardFiles[0]);
        return await sharp(latestCard)
          .resize(600, 400, { fit: 'cover', position: 'center' })
          .jpeg({ quality: 80, mozjpeg: true })
          .toBuffer();
      }
    }

    // 3. Fallback to site logo
    const logoPath = path.resolve(process.cwd(), "public/logo.png");
    if (fs.existsSync(logoPath)) {
      return await sharp(logoPath)
        .resize(400, 400, { fit: 'contain', background: { r: 15, g: 23, b: 42, alpha: 1 } })
        .jpeg({ quality: 85 })
        .toBuffer();
    }
  } catch (err) {
    console.warn("[WhatsAppChannel] Thumbnail resolution notice:", err.message);
  }
  return null;
}

/**
 * Intelligently cleans and formats post content for WhatsApp broadcast.
 * Strips HTML tags, removes duplicate source lists, extracts timing and street details,
 * and ensures sentences terminate cleanly without awkward mid-word cutoffs.
 */
export const TAMIL_DISTRICT_MAP = {
  chennai: "சென்னை",
  coimbatore: "கோவை",
  madurai: "மதுரை",
  tiruchirappalli: "திருச்சி",
  salem: "சேலம்",
  tirunelveli: "திருநெல்வேலி",
  vellore: "வேலூர்",
  erode: "ஈரோடு",
  thoothukudi: "தூத்துக்குடி",
  dindigul: "திண்டுக்கல்",
  thanjavur: "தஞ்சாவூர்",
  ranipet: "ராணிப்பேட்டை",
  sivaganga: "சிவகங்கை",
  virudhunagar: "விருதுநகர்",
  nagapattinam: "நாகப்பட்டினம்",
  kallakurichi: "கள்ளக்குறிச்சி",
  chengalpattu: "செங்கல்பட்டு",
  tiruppur: "திருப்பூர்",
  tenkasi: "தென்காசி",
  mayiladuthurai: "மயிலாடுதுறை",
  tirupattur: "திருப்பத்தூர்",
  nilgiris: "நீலகிரி",
  krishnagiri: "கிருஷ்ணகிரி",
  dharmapuri: "தர்மபுரி",
  cuddalore: "கடலூர்",
  villupuram: "விழுப்புரம்",
  perambalur: "பெரம்பலூர்",
  ariyalur: "அரியலூர்",
  pudukkottai: "புதுக்கோட்டை",
  ramanathapuram: "ராமநாதபுரம்",
  theni: "தேனி",
  kancheepuram: "காஞ்சிபுரம்",
  tiruvarur: "திருவாரூர்",
  karur: "கரூர்",
  namakkal: "நாமக்கல்",
  tiruvannamalai: "திருவண்ணாமலை",
  kanyakumari: "கன்னியாகுமரி",
  tiruvallur: "திருவள்ளூர்",
  hosur: "ஓசூர்",
  tambaram: "தாம்பரம்"
};

export function formatDistrictTamil(slug = '') {
  if (!slug) return 'தமிழ்நாடு';
  const clean = slug.toLowerCase().trim();
  return TAMIL_DISTRICT_MAP[clean] || slug;
}

export function cleanTamilText(raw = '') {
  return String(raw || '')
    .replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/gi, ' ')
    .replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, ' ')
    .replace(/<p class="official-ref-badge"[^>]*>[\s\S]*?<\/p>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatHeadline(title = '', defaultIcon = '📢') {
  let cleaned = String(title || '').replace(/^[\s🚨⚡🌧️🚧🚇💧⚠️📢]+/, '').replace(/[*_~`]/g, '').trim();
  cleaned = cleaned.replace(/\.{2,}$/, '').trim();
  return `${defaultIcon} *${cleaned}*`;
}

export function extractStreetSnippet(text = '') {
  const streetPatterns = [
    /(?:பாதிக்கப்படும் பகுதிகள்(?: & வீதிகள்)?|மின்தடை பகுதிகள்|தெருக்கள் விவரம்|பகுதிகள் விவரம்|மேற்கொள்ளப்பட்ட பணிகள்):\s*([^\n]+)/i,
    /(?:Affected Streets & Areas|Affected areas|Streets affected):\s*([^\n]+)/i
  ];
  for (const regex of streetPatterns) {
    const match = text.match(regex);
    if (match && match[1] && match[1].trim().length > 5) {
      let rawSnippet = match[1].trim().replace(/\.$/, '');
      const parts = rawSnippet.split(/[,;]/).map(s => s.trim()).filter(Boolean);
      let acc = [];
      let totalLen = 0;
      for (const p of parts) {
        if (totalLen + p.length > 140) break;
        acc.push(p);
        totalLen += p.length;
      }
      if (acc.length > 0) {
        return acc.length < parts.length ? acc.join(', ') + ' மற்றும் சுற்றியுள்ள பகுதிகள்' : acc.join(', ');
      }
      return rawSnippet.slice(0, 140);
    }
  }
  return '';
}

export function extractTimeSnippet(text = '') {
  const timeMatch = text.match(/(?:காலை|மதியம்|மாலை)?\s*\d{1,2}(?::\d{2})?\s*(?:மணி)?\s*முதல்\s*(?:காலை|மதியம்|மாலை)?\s*\d{1,2}(?::\d{2})?\s*(?:மணி)?\s*வரை/i);
  return timeMatch ? timeMatch[0].trim() : 'காலை 9:00 முதல் மதியம் 2:00 வரை';
}

export function extractHelpline(text = '', fallback = '1100') {
  const landlineMatch = text.match(/0\d{2,4}-\d{6,8}/);
  if (landlineMatch) return landlineMatch[0];
  const shortHelpline = text.match(/\b(1912|1913|1916|1930|1967|1077|1070|139|1100|108|100)\b/);
  if (shortHelpline) return shortHelpline[0];
  return fallback;
}

export function formatRealNewsWhatsAppBulletin(options) {
  const post = options.post || {};
  const title = (options.title || post.title_ta || post.title_en || '').trim();
  const rawBody = options.summary || post.content_ta || post.summary_ta || post.content_en || '';
  const cleanBody = cleanTamilText(rawBody);
  const districtTa = formatDistrictTamil(options.district || post.district_slug || '');
  const areaName = (post.area_name || '').trim();
  const fullLocation = areaName ? `${areaName}, ${districtTa}` : districtTa;
  const url = options.url || post.canonical_url || (post.slug ? `https://www.vizhitn.in/post/${post.slug}` : 'https://www.vizhitn.in');

  const cat = (options.category || post.category_slug || '').toLowerCase();
  const isElectricity = cat === 'electricity' || title.includes('மின்தடை') || cleanBody.includes('மின்தடை');
  const isRain = cat === 'rain' || title.includes('மழை') || title.includes('வானிலை') || title.includes('விடுமுறை');
  const isScam = cat === 'scam' || cat === 'public-safety' || title.includes('மோசடி') || title.includes('SMS');
  const isWater = cat === 'water-sanitation' || title.includes('குடிநீர்') || title.includes('சாக்கடை') || title.includes('குப்பை');
  const isTransport = cat === 'transport' || title.includes('மெட்ரோ') || title.includes('ரயில்') || title.includes('பேருந்து');

  const sentences = cleanBody.split(/(?<=[.!?।])\s+/).filter(Boolean);
  let lead = sentences[0] || title;
  if (lead.length < 50 && sentences[1]) {
    lead += ' ' + sentences[1];
  }

  // 1. Electricity Alert
  if (isElectricity) {
    const headline = formatHeadline(title, '⚡');
    const timeText = extractTimeSnippet(cleanBody);
    const streets = extractStreetSnippet(cleanBody) || (areaName ? `${areaName} மற்றும் சுற்றுவட்டார பகுதிகள்` : `${districtTa} முக்கிய பகுதிகள்`);

    return `${headline}\n\n${lead}\n\n⏰ *நேரம்:* ${timeText}\n📍 *பாதிக்கப்படும் பகுதிகள்:* ${streets}\n📞 *மின்தடை உதவி:* 1912 (மின்னகம்)\n\n🔗 *முழு தெரு பட்டியல் & விவரம்:*\n${url}`;
  }

  // 2. Rain / Weather / Holiday Alert
  if (isRain) {
    const headline = formatHeadline(title, '🌧️');
    return `${headline}\n\n${lead}\n\n📍 *மாவட்டம்:* ${districtTa}\n📞 *பேரிடர் கட்டுப்பாட்டு அறை:* 1077 | 1070\n\n🔗 *முழு விவரங்கள்:*\n${url}`;
  }

  // 3. Cyber Scam Advisory
  if (isScam) {
    const headline = formatHeadline(title, '🚨');
    return `${headline}\n\n${lead}\n\n⚠️ *முக்கிய எச்சரிக்கை:*\n• சந்தேகத்திற்குரிய லிங்க்குகளை கிளிக் செய்யாதீர்கள்\n• OTP, வங்கி ரகசிய எண்களை யாரிடமும் பகிராதீர்கள்\n📞 *சைபர் கிரைம் உதவி:* 1930\n\n🔗 *முழு எச்சரிக்கை விவரம்:*\n${url}`;
  }

  // 4. Water, Drainage & Sanitation
  if (isWater) {
    const icon = title.includes('குப்பை') || title.includes('தூய்மை') ? '🧹' : '💧';
    const headline = formatHeadline(title, icon);
    const helpline = extractHelpline(cleanBody, '1913');
    return `${headline}\n\n${lead}\n\n📍 *பகுதி:* ${fullLocation}\n📞 *மாநகராட்சி / புகார் உதவி:* ${helpline}\n\n🔗 *முழு செய்தி:*\n${url}`;
  }

  // 5. Metro & Transport
  if (isTransport) {
    const headline = formatHeadline(title, '🚇');
    return `${headline}\n\n${lead}\n\n📍 *பாதை / பகுதி:* ${fullLocation}\n${options.helpline ? `📞 *உதவி எண்:* ${options.helpline}\n` : ''}\n🔗 *முழு விவரம்:*\n${url}`;
  }

  // 6. General Civic & Schemes
  const headline = formatHeadline(title, '📢');
  const helpline = extractHelpline(cleanBody, options.helpline?.match(/\d{4,}/)?.[0] || '1100');
  return `${headline}\n\n${lead}\n\n📍 *பகுதி:* ${fullLocation}\n📞 *அரசு அவசர உதவி:* ${helpline}\n\n🔗 *முழு செய்தி:*\n${url}`;
}

/**
 * Broadcasts an article or civic update directly to the VizhiTN WhatsApp Channel.
 * Automatically attaches rich link preview card metadata and large thumbnail.
 */
export async function postToWhatsAppChannel({
  title,
  summary = "",
  url,
  category = "news",
  urgency = "normal",
  district = "",
  helpline = "",
  image = null,
  post = null
}) {
  const authDir = path.resolve(process.cwd(), "scripts/baileys_auth");
  prepareAuthDir(authDir);

  const credsPath = path.join(authDir, "creds.json");
  if (!fs.existsSync(credsPath)) {
    console.warn("[WhatsAppChannel] No WhatsApp session found (creds.json or WHATSAPP_SESSION). Skipping channel post.");
    return null;
  }

  const messageText = formatRealNewsWhatsAppBulletin({
    title,
    summary,
    url,
    category,
    urgency,
    district,
    helpline,
    image,
    post
  });

  const thumbBuf = await resolveThumbnail(image);

  return new Promise(async (resolve, reject) => {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(authDir);
      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: ["Chrome (Linux)", "Chrome", "128.0.0.0"],
      });

      sock.ev.on("creds.update", saveCreds);

      const timeout = setTimeout(() => {
        try { sock.end(); } catch (_) {}
        resolve(null);
      }, 25000);

      sock.ev.on("connection.update", async (update) => {
        const { connection } = update;

        if (connection === "open") {
          try {
            console.log(`[WhatsAppChannel] Broadcasting to ${VIZHITN_CHANNEL_JID}...`);

            // WhatsApp Channels (@newsletter) reliably deliver formatted text broadcasts
            // to all followers without the media CDN silent drops caused by raw binary payloads.
            console.log(`[WhatsAppChannel] Sending formatted text broadcast to newsletter...`);
            const sent = await sock.sendMessage(VIZHITN_CHANNEL_JID, {
              text: messageText
            });
            console.log(`[WhatsAppChannel] ✅ Text broadcast successful! Message ID: ${sent?.key?.id}`);

            clearTimeout(timeout);
            setTimeout(() => {
              try { sock.end(); } catch (_) {}
              resolve(sent);
            }, 1000);
          } catch (postErr) {
            console.error("[WhatsAppChannel] ❌ Failed to send:", postErr.message);
            clearTimeout(timeout);
            try { sock.end(); } catch (_) {}
            resolve(null);
          }
        }
      });
    } catch (err) {
      console.error("[WhatsAppChannel] Socket initialization error:", err.message);
      resolve(null);
    }
  });
}
