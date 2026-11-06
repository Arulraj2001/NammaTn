import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment.');
  process.exit(1);
}

const sb = createClient(supabaseUrl, supabaseKey);

function stripHtmlFromPostContent(text) {
  if (!text) return text;
  return text
    .replace(/<h2>(?:Official sources|அதிகாரப்பூர்வ ஆதாரங்கள்)<\/h2>[\s\S]*$/gi, '')
    .replace(/<p[^>]*class=["']official-ref-badge["'][^>]*>[\s\S]*?<\/p>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

async function runCleanup() {
  console.log('=== STEP 1: MIGRATING TN_TODAY FAKE AUTHORS ===');
  
  const authorMappings = [
    { from: 'S. Soundarapandian', to: 'Sivakumar' },
    { from: 'K. Meenakshi Sundaram', to: 'Arulmozhli' },
    { from: 'Dr. M. Sangeetha', to: 'Vigneshwaran' }
  ];

  for (const { from, to } of authorMappings) {
    const { data, error } = await sb
      .from('tn_today')
      .update({ author_name: to })
      .eq('author_name', from)
      .select('id');
    
    if (error) {
      console.error(`Error updating author "${from}" -> "${to}":`, error.message);
    } else {
      console.log(`Updated ${data?.length || 0} articles: "${from}" -> "${to}"`);
    }
  }

  // Also check if any remaining authors are not Arulraj, Sivakumar, Arulmozhli, Vigneshwaran
  const { data: allArticles } = await sb.from('tn_today').select('id, author_name');
  const distinctAuthors = {};
  for (const a of allArticles || []) {
    distinctAuthors[a.author_name] = (distinctAuthors[a.author_name] || 0) + 1;
  }
  console.log('Final tn_today Authors Distribution:', distinctAuthors);

  console.log('\n=== STEP 2: STRIPPING RAW HTML FROM POST CONTENT ===');
  let hasMore = true;
  let totalCleaned = 0;

  while (hasMore) {
    const { data: posts, error } = await sb
      .from('post')
      .select('id, content_ta, content_en')
      .or('content_ta.ilike.%<h2>%,content_en.ilike.%<h2>%')
      .limit(100);

    if (error) {
      console.error('Error querying contaminated posts:', error.message);
      break;
    }

    if (!posts || posts.length === 0) {
      console.log('No more posts with raw <h2> tags found.');
      hasMore = false;
      break;
    }

    console.log(`Found batch of ${posts.length} posts to clean...`);

    for (const post of posts) {
      const cleanTa = stripHtmlFromPostContent(post.content_ta);
      const cleanEn = stripHtmlFromPostContent(post.content_en);

      const { error: updateErr } = await sb
        .from('post')
        .update({
          content_ta: cleanTa,
          content_en: cleanEn
        })
        .eq('id', post.id);

      if (updateErr) {
        console.error(`Failed to clean post ${post.id}:`, updateErr.message);
      } else {
        totalCleaned++;
      }
    }
    console.log(`Progress: Cleaned ${totalCleaned} posts so far.`);
  }

  console.log(`\n🎉 CLEANUP COMPLETE! Total posts stripped of raw HTML: ${totalCleaned}`);
}

runCleanup().catch(console.error);
