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
function cleanAndFormatWhatsAppBody(rawText = "") {
  if (!rawText) return "";

  // 1. Remove HTML tags, links, and official sources section
  let text = String(rawText)
    .replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '') // Remove headers like <h2>Official sources</h2>
    .replace(/<ul[^>]*>[\s\S]*?<\/ul>/gi, '')   // Remove lists
    .replace(/<[^>]+>/g, ' ')                   // Strip remaining HTML tags
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return "";

  // 2. Identify sections if structured (e.g., Section 1 overview and Section 2 streets)
  const streetMarkers = [
    /(?:affected streets & areas|affected areas|streets affected|locations affected):?\s*(.*?)(?=(?:according to|for unresolved|residents are advised|$))/i,
    /(?:பாதிக்கப்படும் பகுதிகள்|மின்தடை பகுதிகள்|தெருக்கள் விவரம்):?\s*(.*?)(?=(?:மின்வாரிய|புகார்களுக்கு|பொதுமக்கள்|$))/i
  ];

  let streetSnippet = "";
  for (const regex of streetMarkers) {
    const match = text.match(regex);
    if (match && match[1] && match[1].trim().length > 10) {
      streetSnippet = match[1].trim();
      break;
    }
  }

  // 3. Extract core lead text (first 1-2 sentences)
  const sentences = text.split(/(?<=[.!?।])\s+/).filter(Boolean);
  let lead = sentences.slice(0, 2).join(' ').trim();

  if (lead.length > 280) {
    const punctIdx = lead.lastIndexOf('.', 270);
    if (punctIdx > 120) {
      lead = lead.slice(0, punctIdx + 1);
    } else {
      lead = lead.slice(0, 270).replace(/\s+\S*$/, '') + '...';
    }
  }

  let formatted = `📋 *முக்கிய விவரங்கள் / Key Details:*\n${lead}\n`;

  if (streetSnippet) {
    if (streetSnippet.length > 180) {
      streetSnippet = streetSnippet.slice(0, 180).replace(/[,;]\s*[^,;]*$/, '') + '...';
    }
    formatted += `\n🏘️ *பாதிக்கப்படும் முக்கிய பகுதிகள் / Streets:*\n${streetSnippet}\n`;
  }

  return formatted;
}

/**
 * Broadcasts an article or civic update directly to the VizhiTN WhatsApp Channel.
 * Automatically attaches rich link preview card metadata and large thumbnail.
 *
 * @param {Object} options
 * @param {string} options.title - Article or Alert Title
 * @param {string} [options.summary] - Short description/highlights
 * @param {string} options.url - Full URL to vizhitn.in
 * @param {string} [options.category] - Category slug or label
 * @param {string} [options.urgency] - Urgency level (e.g. critical, high)
 * @param {string} [options.district] - District name or slug
 * @param {string} [options.helpline] - Department / Helpline contact info
 * @param {Buffer|string} [options.image] - Optional custom image buffer or file path
 */
export async function postToWhatsAppChannel({
  title,
  summary = "",
  url,
  category = "news",
  urgency = "normal",
  district = "",
  helpline = "",
  image = null
}) {
  const authDir = path.resolve(process.cwd(), "scripts/baileys_auth");
  prepareAuthDir(authDir);

  const credsPath = path.join(authDir, "creds.json");
  if (!fs.existsSync(credsPath)) {
    console.warn("[WhatsAppChannel] No WhatsApp session found (creds.json or WHATSAPP_SESSION). Skipping channel post.");
    return null;
  }

  const urgencyIcon = urgency === "critical" ? "🚨" : (urgency === "high" ? "⚠️" : "📢");

  // Format broadcast caption text
  let messageText = `${urgencyIcon} *${title.trim()}*\n\n`;
  if (district && district.trim()) {
    messageText += `📍 *மாவட்டம் / District:* ${district.toUpperCase()}\n`;
  }
  if (helpline && helpline.trim()) {
    messageText += `📞 *துறை & உதவி எண் / Helpline:* ${helpline.trim()}\n`;
  }
  if (district || helpline) {
    messageText += `\n`;
  }

  const formattedBody = cleanAndFormatWhatsAppBody(summary);
  if (formattedBody) {
    messageText += `${formattedBody}\n`;
  }

  messageText += `👉 *முழு விவரங்களுக்கு / Full List:* ${url}\n\n`;
  messageText += `📢 *பிறருக்கு உதவ இந்த தகவலை உங்கள் குடியிருப்போர் மற்றும் குடும்ப வாட்ஸ்அப் குழுக்களில் பகிருங்கள் (Forward)!*\n\n`;
  messageText += `🔗 *வாட்ஸ்அப் சேனலை பின்தொடர:* https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228\n\n`;
  messageText += `🌐 *VizhiTN* | தமிழ்நாடு உண்மை செய்திகள் & மக்கள் களம்`;

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
