import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables missing');
  }
  return createClient(url, key);
}

/**
 * Recursively list all files in Supabase Storage bucket
 */
async function listAllBucketFiles(supabase, bucketName = 'media', prefix = '') {
  const { data, error } = await supabase.storage.from(bucketName).list(prefix, {
    limit: 1000,
    sortBy: { column: 'created_at', order: 'desc' }
  });

  if (error) {
    console.error(`[Storage Cleaner] Error listing ${prefix}:`, error);
    return [];
  }

  const allFiles = [];
  for (const item of (data || [])) {
    const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
    // In Supabase Storage, folder items have id === null or metadata === null
    if (item.id === null) {
      const subFiles = await listAllBucketFiles(supabase, bucketName, itemPath);
      allFiles.push(...subFiles);
    } else {
      const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(itemPath);
      let publicUrl = publicData?.publicUrl || '';
      if (publicUrl && !publicUrl.includes('/storage/v1/object/public/')) {
        publicUrl = publicUrl.replace('/storage/v1/object/media/', '/storage/v1/object/public/media/');
      }

      allFiles.push({
        path: itemPath,
        name: item.name,
        size: item.metadata?.size || 0,
        mimetype: item.metadata?.mimetype || '',
        created_at: item.created_at,
        url: publicUrl
      });
    }
  }

  return allFiles;
}

/**
 * GET: Scan Supabase Storage and Audit against DB records
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    // 1. Fetch all storage files
    const storageFiles = await listAllBucketFiles(supabase, 'media', '');

    // 2. Fetch database records from 'post' and 'tn_today'
    const [postsRes, tnRes] = await Promise.all([
      supabase.from('post').select('id, title_en, media_urls, before_photos, final_resolution_photos, complaint_screenshot_url').limit(3000),
      supabase.from('tn_today').select('id, title, featured_image, social_image').limit(1000)
    ]);

    const posts = postsRes.data || [];
    const tnArticles = tnRes.data || [];

    // 3. Build fast lookup index of URLs referenced in database
    const references = new Map(); // path -> Array<{ type, id, title }>

    function addRef(url, ref) {
      if (!url || typeof url !== 'string') return;
      const cleanUrl = url.trim();
      for (const file of storageFiles) {
        if (cleanUrl.includes(file.name) || cleanUrl.includes(file.path)) {
          if (!references.has(file.path)) references.set(file.path, []);
          references.get(file.path).push(ref);
        }
      }
    }

    posts.forEach(p => {
      (p.media_urls || []).forEach(u => addRef(u, { type: 'post', id: p.id, title: p.title_en || 'Post #' + p.id }));
      (p.before_photos || []).forEach(u => addRef(u, { type: 'post_before', id: p.id, title: p.title_en || 'Post #' + p.id }));
      (p.final_resolution_photos || []).forEach(u => addRef(u, { type: 'post_final', id: p.id, title: p.title_en || 'Post #' + p.id }));
      if (p.complaint_screenshot_url) addRef(p.complaint_screenshot_url, { type: 'post_screenshot', id: p.id, title: p.title_en || 'Post #' + p.id });
    });

    tnArticles.forEach(a => {
      if (a.featured_image) addRef(a.featured_image, { type: 'tn_today_featured', id: a.id, title: a.title || 'Article #' + a.id });
      if (a.social_image) addRef(a.social_image, { type: 'tn_today_social', id: a.id, title: a.title || 'Article #' + a.id });
    });

    // 4. Group files and calculate stats
    let totalBytes = 0;
    let usedBytes = 0;
    let unusedBytes = 0;
    let videoCount = 0;
    let videoBytes = 0;
    let unusedVideoCount = 0;
    let unusedVideoBytes = 0;

    const auditedFiles = storageFiles.map(file => {
      const refs = references.get(file.path) || [];
      const isUsed = refs.length > 0;
      const isVideo = file.name.endsWith('.mp4') || file.path.endsWith('.mp4');

      totalBytes += file.size;
      if (isUsed) {
        usedBytes += file.size;
      } else {
        unusedBytes += file.size;
        if (isVideo) {
          unusedVideoCount++;
          unusedVideoBytes += file.size;
        }
      }

      if (isVideo) {
        videoCount++;
        videoBytes += file.size;
      }

      return {
        ...file,
        isUsed,
        references: refs,
        isVideo
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalFiles: storageFiles.length,
        totalBytes,
        usedFiles: auditedFiles.filter(f => f.isUsed).length,
        usedBytes,
        unusedFiles: auditedFiles.filter(f => !f.isUsed).length,
        unusedBytes,
        videoCount,
        videoBytes,
        unusedVideoCount,
        unusedVideoBytes
      },
      files: auditedFiles
    });
  } catch (err) {
    console.error('[Storage Cleaner GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST: Permanently delete files from Storage and optionally clean DB records
 * Body: { paths: string[], deleteFromDb?: boolean }
 */
export async function POST(request) {
  try {
    const supabase = getSupabaseAdmin();
    const body = await request.json().catch(() => ({}));
    const { paths = [], deleteFromDb = false } = body;

    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: 'No paths provided for deletion' }, { status: 400 });
    }

    console.log(`[Storage Cleaner POST] Deleting ${paths.length} files from storage. deleteFromDb: ${deleteFromDb}`);

    // 1. Delete from Supabase Storage 'media' bucket
    // Supabase remove takes array of file paths
    const { data: removedData, error: removeError } = await supabase.storage
      .from('media')
      .remove(paths);

    if (removeError) {
      console.error('[Storage Cleaner POST] Supabase remove error:', removeError);
      return NextResponse.json({ error: removeError.message }, { status: 500 });
    }

    let dbUpdatedCount = 0;

    // 2. If deleteFromDb is requested, scrub matching references from post and tn_today
    if (deleteFromDb) {
      const [postsRes, tnRes] = await Promise.all([
        supabase.from('post').select('id, media_urls, before_photos, final_resolution_photos, complaint_screenshot_url').limit(3000),
        supabase.from('tn_today').select('id, featured_image, social_image').limit(1000)
      ]);

      const posts = postsRes.data || [];
      const tnArticles = tnRes.data || [];

      // Check posts
      for (const p of posts) {
        let changed = false;
        const updates = {};

        // Helper to filter out any URL matching deleted paths
        const filterUrls = (arr) => {
          if (!Array.isArray(arr)) return arr;
          const filtered = arr.filter(url => !paths.some(path => url.includes(path) || url.includes(path.split('/').pop())));
          if (filtered.length !== arr.length) {
            changed = true;
            return filtered;
          }
          return arr;
        };

        const newMedia = filterUrls(p.media_urls);
        if (changed) updates.media_urls = newMedia;

        const newBefore = filterUrls(p.before_photos);
        if (newBefore !== p.before_photos) updates.before_photos = newBefore;

        const newFinal = filterUrls(p.final_resolution_photos);
        if (newFinal !== p.final_resolution_photos) updates.final_resolution_photos = newFinal;

        if (p.complaint_screenshot_url && paths.some(path => p.complaint_screenshot_url.includes(path) || p.complaint_screenshot_url.includes(path.split('/').pop()))) {
          updates.complaint_screenshot_url = null;
          changed = true;
        }

        if (changed) {
          await supabase.from('post').update(updates).eq('id', p.id);
          dbUpdatedCount++;
        }
      }

      // Check tn_today articles
      for (const a of tnArticles) {
        let changed = false;
        const updates = {};

        if (a.featured_image && paths.some(path => a.featured_image.includes(path) || a.featured_image.includes(path.split('/').pop()))) {
          updates.featured_image = null;
          changed = true;
        }

        if (a.social_image && paths.some(path => a.social_image.includes(path) || a.social_image.includes(path.split('/').pop()))) {
          updates.social_image = null;
          changed = true;
        }

        if (changed) {
          await supabase.from('tn_today').update(updates).eq('id', a.id);
          dbUpdatedCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: paths.length,
      removedFiles: removedData,
      dbUpdatedCount
    });
  } catch (err) {
    console.error('[Storage Cleaner POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
