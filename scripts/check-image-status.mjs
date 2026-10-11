import { createClient } from '@supabase/supabase-js';
try {
  process.loadEnvFile('.env.local');
} catch (_) {}

const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecords() {
  const { data: posts, error: postErr } = await supabase
    .from('post')
    .select('id, title_en, title_ta, category_slug, media_urls')
    .eq('status', 'active')
    .limit(50);

  const { data: articles, error: artErr } = await supabase
    .from('tn_today')
    .select('id, title, category, featured_image')
    .eq('status', 'published')
    .limit(20);

  console.log('Active Posts sample:', posts?.length, 'Error:', postErr?.message);
  console.log('Published TN Today sample:', articles?.length, 'Error:', artErr?.message);

  if (posts) {
    const needPhotos = posts.filter(p => !p.media_urls || p.media_urls.length === 0 || p.media_urls[0].includes('/api/og'));
    console.log(`Posts needing real photos: ${needPhotos.length} / ${posts.length}`);
  }

  if (articles) {
    const needPhotos = articles.filter(a => !a.featured_image || a.featured_image.includes('/images/tntoday/'));
    console.log(`Articles needing real photos: ${needPhotos.length} / ${articles.length}`);
  }
}

checkRecords();
