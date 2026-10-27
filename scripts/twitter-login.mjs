#!/usr/bin/env node
/**
 * scripts/twitter-login.mjs
 * VizhiTN Autonomous Twitter (X) Browser Login Pairing
 * Opens Chrome, allows the user to log into @Vizhitn once, and saves the session.
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const AUTH_DIR = path.resolve('scripts/twitter_auth');
const USER_DATA_DIR = path.join(AUTH_DIR, 'user_data');
const COOKIES_FILE = path.join(AUTH_DIR, 'cookies.json');

function findChromePath() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser'
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  throw new Error('Chrome / Edge browser not found on this system');
}

async function main() {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const chromePath = findChromePath();
  console.log('\n=======================================================');
  console.log('   VizhiTN Twitter (X) Autonomous Pairing Setup');
  console.log('=======================================================\n');
  console.log('Launching browser window...');
  console.log('👉 Please log into your @Vizhitn account in the browser window.\n');

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false,
    userDataDir: USER_DATA_DIR,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--start-maximized',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = (await browser.pages())[0] || (await browser.newPage());
  await page.goto('https://x.com/login', { waitUntil: 'domcontentloaded' });

  console.log('Waiting for login to complete (monitoring session)...');

  // Poll until login is detected
  let isLoggedIn = false;
  let attempts = 0;
  const maxAttempts = 120; // 4 minutes

  while (!isLoggedIn && attempts < maxAttempts) {
    await new Promise(r => setTimeout(r, 2000));
    attempts++;

    try {
      const currentUrl = page.url();
      const cookies = await page.cookies();
      const authToken = cookies.find(c => c.name === 'auth_token')?.value;
      const ct0 = cookies.find(c => c.name === 'ct0')?.value;

      if (authToken && ct0 && (currentUrl.includes('/home') || !currentUrl.includes('/login'))) {
        isLoggedIn = true;
        fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2), 'utf-8');
        console.log('\n🎉 SUCCESS! Logged into Twitter successfully.');
        console.log(`✅ Session cookies saved to: ${COOKIES_FILE}`);
        console.log('You can now close the browser window.');
        break;
      }
    } catch (_) {}
  }

  if (!isLoggedIn) {
    console.warn('\n⚠️ Login timed out or window was closed. Run this script again when ready.');
  }

  await browser.close().catch(() => {});
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error during Twitter login:', err);
  process.exit(1);
});
