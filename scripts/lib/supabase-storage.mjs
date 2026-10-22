// scripts/lib/supabase-storage.mjs
/**
 * VizhiTN Supabase Storage Client for Social Media Graphics
 * Uploads compressed (~58 KB) cards to the 'media' bucket.
 */

import { createClient } from '@supabase/supabase-js';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const SUPABASE_URL = process.env.NEXT_PUBLIC_VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_VITE_SUPABASE_ANON_KEY;

let supabaseInstance = null;

function getSupabaseClient() {
  if (!supabaseInstance && SUPABASE_URL && SUPABASE_KEY) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseInstance;
}

/**
 * Upload a card or photo buffer to Supabase Storage 'media' bucket.
 *
 * @param {Buffer} buffer - Compressed image buffer (WebP or JPEG)
 * @param {string} fileName - File name to store under 'social-cards/'
 * @param {string} contentType - 'image/webp' or 'image/jpeg'
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export async function uploadCardToStorage(buffer, fileName, contentType = 'image/webp') {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check NEXT_PUBLIC_VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const cleanName = fileName.replace(/^\/+/, '');
  const storagePath = cleanName.includes('/') ? cleanName : `social-cards/${cleanName}`;

  console.log(`[Storage] Uploading ${fileName} (${(buffer.length / 1024).toFixed(1)} KB) to Supabase 'media' bucket...`);

  const { data, error } = await supabase.storage.from('media').upload(storagePath, buffer, {
    contentType,
    upsert: true
  });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  const { data: publicData } = supabase.storage.from('media').getPublicUrl(storagePath);
  let publicUrl = publicData.publicUrl;

  // Ensure public URL has proper path format
  if (publicUrl && !publicUrl.includes('/storage/v1/object/public/')) {
    publicUrl = publicUrl.replace('/storage/v1/object/media/', '/storage/v1/object/public/media/');
  }

  console.log(`[Storage] Successfully uploaded! Public URL:\n${publicUrl}`);
  return publicUrl;
}

/**
 * Deletes transit objects from Supabase Storage 'media' bucket to ensure zero-accumulation
 * @param {string|string[]} filePaths - relative path(s) inside media bucket
 */
export async function deleteFromStorage(filePaths) {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const paths = Array.isArray(filePaths) ? filePaths : [filePaths];
  const cleanPaths = paths.map(p => p.replace(/^\/+/, ''));
  try {
    const { error } = await supabase.storage.from('media').remove(cleanPaths);
    if (error) {
      console.warn(`[Storage] Failed to remove transit files: ${error.message}`);
    } else {
      console.log(`[Storage ✓] Removed ${cleanPaths.length} transit files from Supabase (Zero-Accumulation).`);
    }
  } catch (err) {
    console.warn(`[Storage] Cleanup warning: ${err.message}`);
  }
}
