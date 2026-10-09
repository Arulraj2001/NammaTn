import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";

const AUTH_DIR = path.resolve("scripts/baileys_auth");

async function main() {
  console.log("Loading registered credentials from", AUTH_DIR);
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Chrome (Linux)", "Chrome", "128.0.0.0"],
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection } = update;

    if (connection === "open") {
      console.log("\n=======================================================");
      console.log("🎉 WHATSAPP CONNECTION OPEN & AUTHENTICATED!");
      console.log("=======================================================\n");

      // 1. Resolve Channel
      const inviteCode = "0029VbDod36IiRoyGK7qD228";
      let channelJid = null;
      try {
        console.log(`Resolving Channel metadata for invite code: ${inviteCode}...`);
        const meta = await sock.newsletterMetadata("invite", inviteCode);
        if (meta && meta.id) {
          channelJid = meta.id;
          console.log(`✅ RESOLVED CHANNEL JID: ${channelJid}`);
          console.log(`Channel Name: "${meta.name}"`);
        }
      } catch (err) {
        console.error("Failed to resolve via newsletterMetadata:", err.message);
      }

      // If channelJid was resolved, send a test message!
      if (channelJid) {
        try {
          console.log(`Sending live test broadcast to ${channelJid}...`);
          const sent = await sock.sendMessage(channelJid, {
            text: `📢 *VizhiTN தானியங்கி அறிவிப்பு அமைப்பு (Autonomous Alert)*\n\nவாட்ஸ்அப் சேனல் இணைப்பு வெற்றிகரமாக முடிந்தது! இனி தமிழ்நாடு முக்கிய செய்திகள், மழை விடுமுறை மற்றும் மின்தடை அறிவிப்புகள் உடனுக்குடன் பகிரப்படும்.\n\n🌐 இணையதளம்: https://www.vizhitn.in`,
          });
          console.log("🚀 MESSAGE SENT SUCCESSFULLY TO CHANNEL! Result:", sent?.key?.id);
        } catch (postErr) {
          console.error("Failed to send message to channel:", postErr);
        }
      }

      // 2. Export full creds as base64 string
      const credsPath = path.join(AUTH_DIR, "creds.json");
      if (fs.existsSync(credsPath)) {
        const credsRaw = fs.readFileSync(credsPath, "utf-8");
        const base64Session = Buffer.from(credsRaw).toString("base64");
        fs.writeFileSync(path.join(AUTH_DIR, "session.txt"), base64Session);
        console.log("\n-------------------------------------------------------");
        console.log("📋 WHATSAPP_SESSION TOKEN (Base64) SAVED TO session.txt");
        console.log("-------------------------------------------------------");
      }

      setTimeout(() => {
        sock.end();
        process.exit(0);
      }, 4000);
    }
  });
}

main();
