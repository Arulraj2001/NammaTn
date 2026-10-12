// scripts/youtube/engine/thumbnail-engine.mjs
// Automated High-CTR 16:9 Custom Thumbnail Generator for YouTube Long-Form Videos

import fs from 'fs';
import path from 'path';
import { renderHtmlToImage } from './frame-renderer.mjs';

/**
 * Generates an ultra-high CTR 1280x720 YouTube Thumbnail PNG
 * @param {Object} params
 * @param {string} params.titleTa - Short 3 to 5-word bold Tamil curiosity hook
 * @param {string} [params.subtitleTa] - Supporting short text
 * @param {string} [params.category='EXPLORER'] - Category pill
 * @param {string} params.heroImageUrl - Background hero image URL or local path
 * @param {string} params.outputPath - Destination PNG file
 * @returns {Promise<string>} output path
 */
export async function generateLongVideoThumbnail({
  titleTa,
  subtitleTa = 'முழு கள ஆய்வு & அரசு ஆவணங்கள்',
  category = 'SPECIAL REPORT',
  heroImageUrl,
  outputPath
}) {
  const htmlContent = `<!DOCTYPE html>
<html lang="ta">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@800;900&family=Plus+Jakarta+Sans:wght@800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1280px;
      height: 720px;
      overflow: hidden;
      background: #071224;
      font-family: 'Noto Sans Tamil', 'Plus Jakarta Sans', system-ui, sans-serif;
      position: relative;
      color: #ffffff;
    }

    /* Right Half Hero Visual */
    .bg-image {
      position: absolute;
      right: 0;
      top: 0;
      width: 780px;
      height: 720px;
      object-fit: cover;
    }
    .gradient-overlay {
      position: absolute;
      left: 0;
      top: 0;
      width: 1280px;
      height: 720px;
      background: linear-gradient(90deg, #071224 0%, #071224 45%, rgba(7, 18, 36, 0.95) 58%, rgba(7, 18, 36, 0.3) 80%, transparent 100%);
    }

    /* Left Half Content Box */
    .content-box {
      position: relative;
      z-index: 10;
      width: 750px;
      height: 720px;
      padding: 60px 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .top-badge-row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-pill {
      background: #2563eb;
      color: #ffffff;
      font-size: 18px;
      font-weight: 900;
      padding: 6px 18px;
      border-radius: 10px;
      letter-spacing: 0.5px;
    }
    .cat-pill {
      background: rgba(245, 158, 11, 0.2);
      border: 1.5px solid #f59e0b;
      color: #fbbf24;
      font-size: 16px;
      font-weight: 900;
      padding: 6px 16px;
      border-radius: 9999px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }

    .headline-main {
      font-size: 58px;
      font-weight: 900;
      line-height: 1.25;
      color: #ffffff;
      text-shadow: 0 6px 24px rgba(0, 0, 0, 0.8);
      margin-bottom: 16px;
    }
    .headline-main span {
      color: #fbbf24;
    }

    .sub-text {
      font-size: 24px;
      font-weight: 800;
      color: #38bdf8;
      text-shadow: 0 4px 16px rgba(0, 0, 0, 0.8);
    }

    .bottom-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1.5px solid rgba(255, 255, 255, 0.15);
      padding-top: 16px;
    }
    .verified-tag {
      font-size: 18px;
      font-weight: 800;
      color: #94a3b8;
    }
    .cta-badge {
      background: #dc2626;
      color: #ffffff;
      font-size: 18px;
      font-weight: 900;
      padding: 6px 18px;
      border-radius: 8px;
      letter-spacing: 1px;
    }
  </style>
</head>
<body>
  <img class="bg-image" src="${heroImageUrl}" alt="Hero" />
  <div class="gradient-overlay"></div>

  <div class="content-box">
    <div class="top-badge-row">
      <div class="brand-pill">✓ VizhiTN</div>
      <div class="cat-pill">${category}</div>
    </div>

    <div>
      <h1 class="headline-main">${titleTa}</h1>
      <p class="sub-text">${subtitleTa}</p>
    </div>

    <div class="bottom-bar">
      <div class="verified-tag">38 மாவட்ட கள நிலவரம் | vizhitn.in</div>
      <div class="cta-badge">WATCH NOW</div>
    </div>
  </div>
</body>
</html>`;

  renderHtmlToImage(htmlContent, outputPath, { width: 1280, height: 720 });
  return outputPath;
}
