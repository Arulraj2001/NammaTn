// scripts/lib/cloudflare-r2-storage.mjs
/**
 * VizhiTN Cloudflare R2 Storage Client
 * S3-compatible, Zero-Egress Storage for Transit Videos & Social Assets
 */

import { S3Client, PutObjectCommand, DeleteObjectsCommand, GetObjectCommand } from '@aws-sdk/client-s3';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

function cleanEnvVal(val = '') {
  return String(val || '').trim().replace(/^["']|["']$/g, '');
}

const rawAccountId = cleanEnvVal(process.env.YOUTUBE_CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID);
const R2_ACCESS_KEY_ID = cleanEnvVal(process.env.R2_ACCESS_KEY_ID);
const R2_SECRET_ACCESS_KEY = cleanEnvVal(process.env.R2_SECRET_ACCESS_KEY);
const R2_ENDPOINT = cleanEnvVal(process.env.R2_ENDPOINT) || (rawAccountId ? `https://${rawAccountId}.r2.cloudflarestorage.com` : null);
const R2_BUCKET = cleanEnvVal(process.env.R2_BUCKET) || 'vizhitn-media';
let R2_PUBLIC_DOMAIN = cleanEnvVal(process.env.R2_PUBLIC_DOMAIN);

if (R2_PUBLIC_DOMAIN && !R2_PUBLIC_DOMAIN.startsWith('http://') && !R2_PUBLIC_DOMAIN.startsWith('https://')) {
  R2_PUBLIC_DOMAIN = `https://${R2_PUBLIC_DOMAIN}`;
}
R2_PUBLIC_DOMAIN = R2_PUBLIC_DOMAIN.replace(/\/+$/, '');

let s3ClientInstance = null;

export function isR2Configured() {
  return Boolean(R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_ENDPOINT && R2_PUBLIC_DOMAIN);
}

function getR2Client() {
  if (!s3ClientInstance && isR2Configured()) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3ClientInstance;
}

/**
 * Uploads a video or image buffer to Cloudflare R2
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Destination key in R2 (e.g. 'videos/test.mp4')
 * @param {string} contentType - e.g. 'video/mp4' or 'image/png'
 * @returns {Promise<string>} Public HTTPS URL
 */
export async function uploadToR2(buffer, fileName, contentType = 'video/mp4') {
  const client = getR2Client();
  if (!client) {
    throw new Error('Cloudflare R2 is not configured. Check R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_ENDPOINT, and R2_PUBLIC_DOMAIN.');
  }

  const cleanKey = fileName.replace(/^\/+/, '');
  console.log(`[R2 Storage] Uploading ${cleanKey} (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) to Cloudflare R2 (${R2_BUCKET})...`);

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: cleanKey,
    Body: buffer,
    ContentType: contentType,
  });

  await client.send(command);

  const publicUrl = `${R2_PUBLIC_DOMAIN}/${cleanKey}`;
  console.log(`[R2 Storage ✓] Public Zero-Egress URL ready:\n${publicUrl}`);
  return publicUrl;
}

/**
 * Deletes transit files from Cloudflare R2
 * @param {string|string[]} fileKeys - Keys to delete (e.g. ['videos/test.mp4'])
 */
export async function deleteFromR2(fileKeys) {
  const client = getR2Client();
  if (!client) return;

  const keys = (Array.isArray(fileKeys) ? fileKeys : [fileKeys]).filter(Boolean);
  if (keys.length === 0) return;

  const objects = keys.map(k => ({ Key: k.replace(/^\/+/, '') }));

  try {
    const command = new DeleteObjectsCommand({
      Bucket: R2_BUCKET,
      Delete: { Objects: objects },
    });
    await client.send(command);
    console.log(`[R2 Storage ✓] Purged ${objects.length} transit file(s) from R2 (Zero Storage Accumulation).`);
  } catch (err) {
    console.warn(`[R2 Storage WARN] Failed to purge transit file(s): ${err.message}`);
  }
}

/**
 * Reads a JSON file from Cloudflare R2
 * @param {string} fileName - Destination key in R2 (e.g. 'logs/broadcast-ledger.json')
 * @returns {Promise<any|null>}
 */
export async function getJsonFromR2(fileName) {
  const client = getR2Client();
  if (!client) return null;

  const cleanKey = fileName.replace(/^\/+/, '');
  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: cleanKey,
    });
    const response = await client.send(command);
    const str = await response.Body.transformToString();
    return JSON.parse(str);
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.code === 'NoSuchKey') {
      return null;
    }
    return null;
  }
}

/**
 * Saves a JSON file to Cloudflare R2
 * @param {string} fileName - Destination key in R2
 * @param {any} data - Object or array to save
 * @returns {Promise<boolean>}
 */
export async function saveJsonToR2(fileName, data) {
  const client = getR2Client();
  if (!client) return false;

  const cleanKey = fileName.replace(/^\/+/, '');
  try {
    const buffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: cleanKey,
      Body: buffer,
      ContentType: 'application/json',
    });
    await client.send(command);
    return true;
  } catch (err) {
    console.warn(`[R2 Storage WARN] Failed to save JSON ${cleanKey}:`, err.message);
    return false;
  }
}
