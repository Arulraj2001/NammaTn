import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import dotenv from 'dotenv';
dotenv.config();

const SITE_URL = 'https://www.vizhitn.in';

// ✅ Verified table names from your Supabase migrations
const TNTODAY_TABLE = 'tn_today';
const POST_TABLE = 'post';
const TNTODAY_URL_PATH = '/tn-today/';
const POST_URL_PATH = '/post/';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: { persistSession: false },
    realtime: { transport: ws }
  }
);

async function getIndexingClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './google-credentials.json',
    scopes: ['https://www.googleapis.com/auth/indexing']
  });
  const client = await auth.getClient();
  return google.indexing({ version: 'v3', auth: client });
}

async function getTodaysURLs() {
  // Get start of today in IST
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  istNow.setHours(0, 0, 0, 0);
  const todayStart = new Date(istNow.getTime() - istOffset).toISOString();

  console.log(`Fetching URLs published since: ${todayStart}`);

  const urls = [];

  // Fetch today's TN Today articles (published only)
  const { data: articles, error: articleError } = await supabase
    .from(TNTODAY_TABLE)
    .select('slug')
    .eq('status', 'published')
    .gte('publish_date', todayStart);

  if (articleError) {
    console.error('TN Today fetch error:', articleError.message);
  } else {
    articles.forEach(a => {
      urls.push(`${SITE_URL}${TNTODAY_URL_PATH}${a.slug}`);
    });
    console.log(`TN Today articles found: ${articles.length}`);
  }

  // Fetch today's civic posts (publicly visible only)
  const { data: posts, error: civicError } = await supabase
    .from(POST_TABLE)
    .select('id')
    .eq('is_publicly_visible', true)
    .eq('moderation_status', 'approved')
    .gte('created_date', todayStart);

  if (civicError) {
    console.error('Civic posts fetch error:', civicError.message);
  } else {
    posts.forEach(p => {
      urls.push(`${SITE_URL}${POST_URL_PATH}${p.id}`);
    });
    console.log(`Civic posts found: ${posts.length}`);
  }

  return urls;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('=== VizhiTN Google Indexing Started ===');
  console.log(`Time: ${new Date().toISOString()}`);

  try {
    const indexing = await getIndexingClient();
    const urls = await getTodaysURLs();

    if (urls.length === 0) {
      console.log('No URLs found for today. Exiting.');
      return;
    }

    console.log(`Total URLs to index: ${urls.length}`);

    let success = 0;
    let failed = 0;

    for (const url of urls) {
      try {
        await indexing.urlNotifications.publish({
          requestBody: {
            url: url,
            type: 'URL_UPDATED'
          }
        });
        console.log(`✅ Done: ${url}`);
        success++;
      } catch (err) {
        console.error(`❌ Failed: ${url} — ${err.message}`);
        failed++;
      }
      await sleep(1000);
    }

    console.log('=== Indexing Complete ===');
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Failed: ${failed}`);

  } catch (err) {
    console.error('=== FAILED ===', err.message);
    process.exit(1);
  }
}

run();