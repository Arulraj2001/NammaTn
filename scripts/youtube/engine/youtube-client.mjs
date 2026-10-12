// scripts/youtube/engine/youtube-client.mjs
// Resumable YouTube Data API v3 uploader with OAuth2 auto-refresh & 2026 Synthetic Media disclosure

import fs from 'fs';

/**
 * Exchanges a persistent OAuth2 refresh token for a fresh access token
 */
async function getFreshAccessToken() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing YouTube OAuth2 credentials (YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN)');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  });

  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Failed to refresh YouTube access token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

/**
 * Uploads a video to YouTube using the official Resumable Upload protocol
 * Compliant with 2026 AI disclosure standards (containsSyntheticMedia: true)
 *
 * @param {Object} params
 * @param {string} params.videoFilePath
 * @param {string} params.title
 * @param {string} params.description
 * @param {Array<string>} params.tags
 * @param {string} [params.categoryId='25']
 * @param {'public'|'unlisted'|'private'} [params.privacyStatus='public']
 * @param {boolean} [params.isShort=false]
 * @returns {Promise<{ videoId: string, videoUrl: string, dryRun: boolean }>}
 */
export async function uploadToYouTube({
  videoFilePath,
  title,
  description,
  tags = [],
  categoryId = '25',
  privacyStatus = 'public',
  isShort = false
}) {
  if (!fs.existsSync(videoFilePath)) {
    throw new Error(`Video file does not exist: ${videoFilePath}`);
  }

  const stats = fs.statSync(videoFilePath);
  const fileSize = stats.size;

  const hasCreds = process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_REFRESH_TOKEN;

  if (!hasCreds) {
    console.log('\n[YOUTUBE DRY-RUN / NO CREDENTIALS CONFIGURED]');
    console.log(`Video ready: ${videoFilePath} (${(fileSize / (1024 * 1024)).toFixed(2)} MB)`);
    console.log(`Title: ${title}`);
    console.log(`Tags: ${tags.join(', ')}`);
    console.log(`Privacy: ${privacyStatus}`);
    console.log(`AI Disclosure: Synthetic Voice & Visuals Tagged (2026 Policy Compliant)`);
    console.log('\nTo enable automated upload, set the following repository secrets:');
    console.log('- YOUTUBE_CLIENT_ID');
    console.log('- YOUTUBE_CLIENT_SECRET');
    console.log('- YOUTUBE_REFRESH_TOKEN\n');
    return {
      videoId: 'DRY_RUN_MOCK_ID',
      videoUrl: isShort ? 'https://youtube.com/shorts/DRY_RUN' : 'https://youtube.com/watch?v=DRY_RUN',
      dryRun: true
    };
  }

  console.log('[YOUTUBE] Requesting fresh OAuth2 token...');
  const accessToken = await getFreshAccessToken();

  // 1. Initialize Resumable Upload Session with 2026 Synthetic Media Tag
  const metadata = {
    snippet: {
      title,
      description,
      tags,
      categoryId,
      defaultLanguage: 'ta',
      defaultAudioLanguage: 'ta'
    },
    status: {
      privacyStatus,
      selfDeclaredMadeForKids: false,
      containsSyntheticMedia: true // 2026 YouTube Mandatory Disclosure for Realistic AI Media
    }
  };

  console.log('[YOUTUBE] Initializing resumable session with 2026 AI disclosure tag...');
  const initRes = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': fileSize.toString(),
      'X-Upload-Content-Type': 'video/mp4'
    },
    body: JSON.stringify(metadata)
  });

  if (!initRes.ok) {
    const errText = await initRes.text();
    throw new Error(`Failed to initialize upload session: ${initRes.status} ${errText}`);
  }

  const uploadUrl = initRes.headers.get('location');
  if (!uploadUrl) {
    throw new Error('YouTube did not return a session upload location header.');
  }

  // 2. Stream video file buffer
  console.log(`[YOUTUBE] Uploading ${(fileSize / (1024 * 1024)).toFixed(2)} MB to YouTube...`);
  const fileBuffer = fs.readFileSync(videoFilePath);

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Length': fileSize.toString(),
      'Content-Type': 'video/mp4'
    },
    body: fileBuffer
  });

  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.id) {
    throw new Error(`Upload failed: ${JSON.stringify(uploadData)}`);
  }

  const videoId = uploadData.id;
  const videoUrl = isShort ? `https://youtube.com/shorts/${videoId}` : `https://youtube.com/watch?v=${videoId}`;

  console.log(`[YOUTUBE SUCCESS] Video uploaded successfully: ${videoUrl}`);
  return { videoId, videoUrl, dryRun: false };
}
