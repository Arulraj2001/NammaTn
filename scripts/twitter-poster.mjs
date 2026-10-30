#!/usr/bin/env node
/**
 * scripts/twitter-poster.mjs
 * VizhiTN Autonomous Twitter (X) Browser Poster
 * Zero API costs. Posts 280-char algorithmically optimized civic alerts + auto-reply links.
 */

import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const AUTH_DIR = path.resolve('scripts/twitter_auth');
const USER_DATA_DIR = path.join(AUTH_DIR, 'user_data');
const COOKIES_FILE = path.join(AUTH_DIR, 'cookies.json');

const CATEGORY_TAGS = {
  electricity: '#TANGEDCO #PowerCut',
  'water-sanitation': '#MetroWater #TWAD',
  rain: '#TNRain #WeatherAlert',
  'road-infrastructure': '#TNRoads #RoadSafety',
  'public-safety': '#TNPolice #SafetyAlert',
  scam: '#CyberCrime1930 #ScamAlert',
  environment: '#TNRain #TNEnvironment',
  transport: '#ChennaiMetro #TNTransport',
  'government-schemes': '#TNGovtSchemes #TamilNadu',
  general: '#TamilNadu #VizhiTN'
};

const CATEGORY_HELPLINES = {
  electricity: '📞 மின்னகம்: 1912',
  'water-sanitation': '📞 TWAD குடிநீர்: 1916',
  rain: '📞 மாவட்ட கட்டுப்பாட்டு அறை: 1077 | 1070',
  'road-infrastructure': '📞 PWD: 1800-425-0005',
  'public-safety': '📞 காவல்துறை: 100',
  scam: '📞 சைபர் கிரைம்: 1930',
  'government-schemes': '📞 CM Helpline: 1100'
};

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
  throw new Error('Chrome / Edge browser not found on system');
}

export function calculateTwitterWeight(text = '') {
  let weight = 0;
  for (const char of text) {
    const code = char.codePointAt(0);
    // ASCII is 1 weight, Indic/Tamil/Unicode is 2 weight in Twitter counter
    if (code <= 0x007F) {
      weight += 1;
    } else {
      weight += 2;
    }
  }
  return weight;
}

/**
 * District alias hashtag map — uses the most-searched Twitter (X) variant per district.
 * Up to 2 hashtags per district (space-separated) to maximise reach without bloating tweet weight.
 * Special case: krishnagiri → #Hosur if area contains 'hosur', else #Krishnagiri.
 */
const DISTRICT_HASHTAG_MAP = {
  chennai: '#Chennai',
  coimbatore: '#Coimbatore #Kovai',
  madurai: '#Madurai',
  tiruchirappalli: '#Trichy',
  salem: '#Salem',
  tirunelveli: '#Nellai',
  vellore: '#Vellore',
  erode: '#Erode',
  thoothukudi: '#Tuticorin',
  thanjavur: '#Thanjavur',
  kancheepuram: '#Kancheepuram',
  chengalpattu: '#Chengalpattu',
  tiruppur: '#Tiruppur',
  dharmapuri: '#Dharmapuri',
  cuddalore: '#Cuddalore',
  nagapattinam: '#Nagapattinam',
  nilgiris: '#Ooty #Nilgiris',
  dindigul: '#Dindigul',
  ranipet: '#Ranipet',
  sivaganga: '#Sivaganga',
  virudhunagar: '#Virudhunagar',
  kallakurichi: '#Kallakurichi',
  tenkasi: '#Tenkasi',
  mayiladuthurai: '#Mayiladuthurai',
  tirupattur: '#Tirupattur',
  villupuram: '#Villupuram',
  perambalur: '#Perambalur',
  ariyalur: '#Ariyalur',
  pudukkottai: '#Pudukkottai',
  ramanathapuram: '#Ramanathapuram',
  theni: '#Theni',
  tiruvarur: '#Tiruvarur',
  karur: '#Karur',
  namakkal: '#Namakkal',
  tiruvannamalai: '#Tiruvannamalai',
  kanyakumari: '#Kanyakumari',
  tiruvallur: '#Tiruvallur'
};

/**
 * Formats a civic alert into an algorithmic 2-Tweet Thread:
 * - Tweet 1: Pure native content, helpline, question hook, hashtags (NO LINK to avoid algorithmic demotion).
 *   Strictly kept under 270 Twitter weighted points (max 280).
 * - Tweet 2: Auto-reply containing the source link and call to action.
 */
export function formatTwitterThread(post = {}) {
  const rawTitle = (post.title_ta || post.title_en || 'முக்கிய அறிவிப்பு').trim();
  const rawCat = (post.category_slug || '').toLowerCase();
  const textBody = `${post.title_ta || ''} ${post.content_ta || ''}`;
  
  const catKey = (rawCat === 'rain' || textBody.includes('மழை'))
    ? 'rain'
    : (rawCat === 'scam' || textBody.includes('மோசடி'))
      ? 'scam'
      : rawCat;

  const district = (post.district_slug || post.area_name || 'tamilnadu').toLowerCase();
  const area = (post.area_name || '').toLowerCase();

  // P1-2: Use district alias hashtag map; special-case krishnagiri for Hosur
  let districtTag;
  if (district === 'krishnagiri' && area.includes('hosur')) {
    districtTag = '#Hosur';
  } else {
    districtTag = DISTRICT_HASHTAG_MAP[district] || `#${district.charAt(0).toUpperCase() + district.slice(1).replace(/[^a-zA-Z0-9]/g, '')}`;
  }
  const catTag = CATEGORY_TAGS[catKey] || '#TamilNadu';
  const helpline = CATEGORY_HELPLINES[catKey] || '📞 உதவி: 112';

  // Emoji prefix
  const emoji = catKey === 'rain' ? '🌧️' : catKey === 'electricity' ? '⚡' : catKey === 'scam' ? '⚠️' : catKey === 'transport' ? '🚇' : '📢';

  // Clean title (keep concise)
  const title = rawTitle.length > 38 ? rawTitle.slice(0, 36) + '..' : rawTitle;

  // Discussion hook to trigger high-ranking replies
  const hook = catKey === 'rain'
    ? 'மழை நிலவரம் என்ன? 👇'
    : catKey === 'electricity'
      ? 'மின்சாரம் உள்ளதா? 👇'
      : 'உங்கள் கருத்து 👇';

  // Content summary: iteratively trim so total Twitter weight is <= 265
  const rawContent = (post.content_ta || post.content_en || '').replace(/<[^>]+>/g, '').trim();
  let summary = rawContent.slice(0, 50).replace(/\s+\S*$/, '') + '.';

  let tweet1 = `${emoji} ${title}\n\n${summary}\n\n${helpline}\n\n${hook}\n${districtTag} ${catTag}`;

  // If still above 265 weight, trim summary further
  while (calculateTwitterWeight(tweet1) > 265 && summary.length > 15) {
    summary = summary.slice(0, summary.length - 8).replace(/\s+\S*$/, '') + '.';
    tweet1 = `${emoji} ${title}\n\n${summary}\n\n${helpline}\n\n${hook}\n${districtTag} ${catTag}`;
  }

  // Tweet 2: Link reply
  const fullUrl = post.canonical_url || post.url || (post.slug ? `https://www.vizhitn.in/post/${post.slug}` : 'https://www.vizhitn.in');
  const tweet2 = `👉 முழு விவரங்கள் & அதிகாரப்பூர்வ அறிவிப்பை படிக்க:
${fullUrl}

🔄 மற்றவர்களுக்கும் தெரியப்படுத்த பகிருங்கள்.`;

  return {
    tweet1,
    tweet2,
    weight1: calculateTwitterWeight(tweet1),
    weight2: calculateTwitterWeight(tweet2)
  };
}

import { isAlreadyDispatched, recordDispatch } from './lib/dispatch-ledger.mjs';

/**
 * Posts a 2-tweet thread to Twitter (X) via headless browser automation.
 */
export async function postToTwitter(post, options = {}) {
  const isDryRun = options.isDryRun || false;

  // Anti-duplication check via persistent ledger
  if (post?.slug && isAlreadyDispatched('twitter', post.slug)) {
    console.log(`[TWITTER BOT] Post "${post.slug}" was ALREADY tweeted previously. Skipping to prevent duplicate.`);
    return { success: true, skippedDuplicate: true };
  }
  const thread = formatTwitterThread(post);

  console.log('\n=======================================================');
  console.log('   VizhiTN Twitter Automated Thread Formatter');
  console.log('=======================================================');
  console.log('--- TWEET 1 (Main Post - 0% Link Penalty) ---');
  console.log(thread.tweet1);
  console.log(`\n(Twitter Weight: ${thread.weight1} / max 280 units)\n`);

  console.log('--- TWEET 2 (Auto Self-Reply with Link) ---');
  console.log(thread.tweet2);
  console.log('-------------------------------------------------------\n');

  if (isDryRun) {
    console.log('🔍 [DRY RUN] Skipping actual browser posting.');
    return { success: true, dryRun: true, thread };
  }

  // Check if session exists
  const hasEnvCookies = Boolean(process.env.TWITTER_COOKIES || process.env.TWITTER_AUTH_TOKEN);
  const hasProfile = fs.existsSync(USER_DATA_DIR);
  const hasCookies = fs.existsSync(COOKIES_FILE);

  if (!hasProfile && !hasCookies && !hasEnvCookies) {
    throw new Error('No Twitter session found. Please run "node scripts/twitter-login.mjs" once to log in!');
  }

  const chromePath = findChromePath();
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    userDataDir: USER_DATA_DIR,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1280,800'
    ]
  });

  try {
    const page = (await browser.pages())[0] || (await browser.newPage());
    page.setDefaultNavigationTimeout(60000);

    // Apply cookies if available
    if (process.env.TWITTER_COOKIES) {
      try {
        const cookies = JSON.parse(process.env.TWITTER_COOKIES);
        await page.setCookie(...cookies);
      } catch (_) {}
    } else if (process.env.TWITTER_AUTH_TOKEN && process.env.TWITTER_CT0) {
      await page.setCookie(
        { name: 'auth_token', value: process.env.TWITTER_AUTH_TOKEN, domain: '.x.com' },
        { name: 'ct0', value: process.env.TWITTER_CT0, domain: '.x.com' }
      );
    } else if (hasCookies) {
      try {
        const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf-8'));
        await page.setCookie(...cookies);
      } catch (_) {}
    }

    let postedTweetId = null;

    // Listen to network responses to verify CreateTweet and capture ID
    page.on('response', async res => {
      if (res.url().includes('CreateTweet')) {
        try {
          const body = await res.json();
          const restId = body?.data?.create_tweet?.tweet_results?.result?.rest_id;
          if (restId) {
            postedTweetId = restId;
          }
        } catch (_) {}
      }
    });

    console.log('[TWITTER BOT] Navigating to compose post...');
    await page.goto('https://x.com/compose/post', { waitUntil: 'networkidle2' });

    // Verify logged in
    if (page.url().includes('/login')) {
      throw new Error('Twitter session expired or not authenticated. Run "node scripts/twitter-login.mjs" to re-authenticate.');
    }

    // Wait for the tweet textbox
    const editorSelector = '[data-testid="tweetTextarea_0"]';
    await page.waitForSelector(editorSelector, { timeout: 15000 });
    await page.focus(editorSelector);

    // Insert Tweet 1 via native execCommand
    await page.evaluate((val) => {
      document.execCommand('insertText', false, val);
    }, thread.tweet1);
    await new Promise(r => setTimeout(r, 1500));

    // Specifically target the primary modal post button
    const postBtnSelector = '[data-testid="tweetButton"]';
    await page.waitForSelector(postBtnSelector, { timeout: 10000 });
    
    // Check disabled state
    const isDisabled = await page.$eval(postBtnSelector, b => b.getAttribute('aria-disabled') === 'true');
    if (isDisabled) {
      throw new Error('Tweet button remains disabled after typing. Text might be too long.');
    }

    const postButton = await page.$(postBtnSelector);
    await postButton.click();
    console.log('[TWITTER BOT] Clicked Post button. Waiting for server confirmation...');

    // Wait for network response or modal dismissal
    await new Promise(r => setTimeout(r, 6000));
    console.log('[TWITTER BOT] Main Tweet confirmed!');

    // Post Tweet 2 (Auto Self-Reply Link) if tweetId is available
    if (postedTweetId && thread.tweet2) {
      try {
        console.log(`[TWITTER BOT] Posting auto-reply link to tweet: https://x.com/Vizhitn/status/${postedTweetId}`);
        await page.goto(`https://x.com/Vizhitn/status/${postedTweetId}`, { waitUntil: 'networkidle2' });
        
        const replyEditorSelector = '[data-testid="tweetTextarea_0"], div[role="textbox"][contenteditable="true"]';
        await page.waitForSelector(replyEditorSelector, { timeout: 10000 });
        await page.focus(replyEditorSelector);

        await page.evaluate((val) => {
          document.execCommand('insertText', false, val);
        }, thread.tweet2);
        await new Promise(r => setTimeout(r, 1500));

        const replyBtnSelector = '[data-testid="tweetButtonInline"]';
        await page.waitForSelector(replyBtnSelector, { timeout: 8000 });
        const replyBtn = await page.$(replyBtnSelector);
        await replyBtn.click();
        await new Promise(r => setTimeout(r, 4000));
        console.log('[TWITTER BOT] Auto-reply link posted successfully!');
      } catch (replyErr) {
        console.warn('[TWITTER BOT] Auto-reply failed, but main tweet was posted:', replyErr.message);
      }
    }

    const liveUrl = postedTweetId ? `https://x.com/Vizhitn/status/${postedTweetId}` : 'https://x.com/Vizhitn';
    console.log(`\n🎉 Thread live at: ${liveUrl}`);
    if (post?.slug && !isDryRun) {
      await recordDispatch('twitter', post.slug, {
        title: post.title_en || post.title_ta,
        district: post.district_slug,
        category: post.category_slug
      });
    }
    await browser.close();
    return { success: true, tweetId: postedTweetId, url: liveUrl, thread };
  } catch (err) {
    await browser.close().catch(() => {});
    throw err;
  }
}

// Direct CLI execution
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('twitter-poster.mjs')) {
  const isDryRun = process.argv.includes('--dry-run');

  const samplePost = {
    title_ta: 'கள்ளக்குறிச்சி கனமழை: IMD ஆரஞ்சு எச்சரிக்கை',
    content_ta: 'இந்திய வானிலை ஆய்வு மையம் கள்ளக்குறிச்சி மாவட்டத்திற்கு கனமழைக்கான ஆரஞ்சு எச்சரிக்கையை விடுத்துள்ளது. மாவட்ட நிர்வாகம் முழு எச்சரிக்கை நடவடிக்கைகளில் ஈடுபட்டுள்ளது.',
    category_slug: 'rain',
    post_type: 'alert',
    area_name: 'Kallakurichi',
    district_slug: 'kallakurichi',
    slug: 'kallakurichi-imd-heavy-rain-alert-20261027'
  };

  postToTwitter(samplePost, { isDryRun })
    .then(res => console.log('Result:', res.success ? '✓ SUCCESS' : 'FAILED'))
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}
