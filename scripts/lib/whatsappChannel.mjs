import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";

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
 * Broadcasts an article or civic update directly to the VizhiTN WhatsApp Channel.
 *
 * @param {Object} options
 * @param {string} options.title - Article or Alert Title
 * @param {string} [options.summary] - Short description/highlights
 * @param {string} options.url - Full URL to vizhitn.in
 * @param {string} [options.category] - Category slug or label
 * @param {string} [options.urgency] - Urgency level (e.g. critical, high)
 */
export async function postToWhatsAppChannel({ title, summary = "", url, category = "news", urgency = "normal" }) {
  const authDir = path.resolve("scripts/baileys_auth");
  prepareAuthDir(authDir);

  const credsPath = path.join(authDir, "creds.json");
  if (!fs.existsSync(credsPath)) {
    console.warn("[WhatsAppChannel] No WhatsApp session found (creds.json or WHATSAPP_SESSION). Skipping channel post.");
    return null;
  }

  const urgencyIcon = urgency === "critical" ? "🚨" : (urgency === "high" ? "⚠️" : "📢");

  // Format professional broadcast text
  let messageText = `${urgencyIcon} *${title.trim()}*\n\n`;
  if (summary && summary.trim()) {
    messageText += `${summary.trim().slice(0, 280)}...\n\n`;
  }
  messageText += `👉 *முழு செய்தி & விவரங்களுக்கு:* ${url}\n\n`;
  messageText += `🌐 *VizhiTN* | தமிழ்நாடு உண்மை செய்திகள் & மக்கள் களம்`;

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
        sock.end();
        resolve(null);
      }, 15000);

      sock.ev.on("connection.update", async (update) => {
        const { connection } = update;

        if (connection === "open") {
          try {
            console.log(`[WhatsAppChannel] Broadcasting to ${VIZHITN_CHANNEL_JID}...`);
            const sent = await sock.sendMessage(VIZHITN_CHANNEL_JID, { text: messageText });
            console.log(`[WhatsAppChannel] ✅ Broadcast successful! Message ID: ${sent?.key?.id}`);
            clearTimeout(timeout);
            setTimeout(() => {
              sock.end();
              resolve(sent);
            }, 1000);
          } catch (postErr) {
            console.error("[WhatsAppChannel] ❌ Failed to send:", postErr.message);
            clearTimeout(timeout);
            sock.end();
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
