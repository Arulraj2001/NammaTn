import makeWASocket, { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";
import readline from "readline";
import fs from "fs";
import path from "path";

const AUTH_DIR = path.resolve("scripts/baileys_auth");

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function startLogin() {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Ubuntu", "Chrome", "20.0.04"],
  });

  sock.ev.on("creds.update", saveCreds);

  if (!sock.authState.creds.registered) {
    console.log("\n=======================================================");
    console.log("   VizhiTN WhatsApp Autonomous Channel Pairing");
    console.log("=======================================================\n");

    let phone = process.argv[2];
    if (!phone) {
      phone = await prompt("Enter your WhatsApp phone number with country code (e.g. 919876543210): ");
    }
    phone = phone.replace(/[^0-9]/g, "");

    if (!phone) {
      console.error("Phone number is required!");
      process.exit(1);
    }

    console.log(`\nConnecting to WhatsApp servers before requesting pairing code for +${phone}...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
    try {
      const code = await sock.requestPairingCode(phone);
      console.log("\n-------------------------------------------------------");
      console.log(`👉 YOUR PAIRING CODE:  \x1b[1m\x1b[32m${code}\x1b[0m`);
      console.log("-------------------------------------------------------");
      console.log("On your phone right now:");
      console.log("1. Open WhatsApp -> Settings (or 3 dots)");
      console.log("2. Tap 'Linked Devices'");
      console.log("3. Tap 'Link a Device'");
      console.log("4. Tap 'Link with phone number instead' at the bottom");
      console.log(`5. Enter this 8-digit code: ${code}\n`);
      console.log("Waiting for pairing approval on phone...");
    } catch (err) {
      console.error("Failed to request pairing code:", err);
      process.exit(1);
    }
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      console.log("\n=======================================================");
      console.log("🎉 SUCCESS! WhatsApp connected successfully!");
      console.log("=======================================================\n");

      // Resolve VizhiTN Channel metadata
      const inviteCode = "0029VbDod36IiRoyGK7qD228";
      let channelJid = null;
      try {
        console.log(`Resolving Channel JID for invite code: ${inviteCode}...`);
        const meta = await sock.newsletterMetadata("invite", inviteCode);
        if (meta && meta.id) {
          channelJid = meta.id;
          console.log(`✅ FOUND CHANNEL JID: \x1b[1m\x1b[36m${channelJid}\x1b[0m`);
          console.log(`Channel Name: "${meta.name}"`);
        }
      } catch (e) {
        console.log("Could not auto-fetch metadata via invite code:", e?.message);
      }

      // Read creds.json and encode to Base64
      const credsPath = path.join(AUTH_DIR, "creds.json");
      if (fs.existsSync(credsPath)) {
        const credsRaw = fs.readFileSync(credsPath, "utf-8");
        const base64Session = Buffer.from(credsRaw).toString("base64");

        const sessionOutPath = path.join(AUTH_DIR, "session.txt");
        fs.writeFileSync(sessionOutPath, base64Session);

        console.log("\n-------------------------------------------------------");
        console.log("📋 YOUR WHATSAPP_SESSION SECRET (Copy this):");
        console.log("-------------------------------------------------------");
        console.log(base64Session);
        console.log("-------------------------------------------------------");
        console.log(`Saved session backup to: ${sessionOutPath}\n`);
      }

      console.log("Closing pairing session cleanly. You are ready to automate!");
      setTimeout(() => {
        sock.end();
        process.exit(0);
      }, 3000);
    }

    if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;
      if (!isLoggedOut && !sock.authState.creds.registered) {
        // Continue waiting for user to enter code
      } else if (isLoggedOut) {
        console.log("Connection closed: Session logged out.");
        process.exit(0);
      }
    }
  });
}

startLogin();
