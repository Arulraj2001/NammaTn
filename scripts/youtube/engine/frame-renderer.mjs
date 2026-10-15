// scripts/youtube/engine/frame-renderer.mjs
// Headless browser screenshot renderer for 9:16 Shorts and 16:9 Long-Form slides

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { getBrowserExecutablePath } from './browser-detector.mjs';

/**
 * Renders an HTML string or file to a PNG image with exact dimensions
 * @param {string} htmlContent - Full HTML markup
 * @param {string} outputPngPath - Absolute destination PNG file
 * @param {Object} options - { width: 1080, height: 1920 }
 */
export function renderHtmlToImage(htmlContent, outputPngPath, options = {}) {
  const width = options.width || 1080;
  const height = options.height || 1920;

  const browserPath = getBrowserExecutablePath();

  // Ensure output directory exists
  const outDir = path.dirname(outputPngPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Create temporary HTML file
  const tempHtmlPath = path.join(outDir, `_temp_slide_${Date.now()}_${Math.random().toString(36).substring(7)}.html`);
  fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

  try {
    const fileUrl = `file:///${tempHtmlPath.replace(/\\/g, '/')}`;
    const cmd = `"${browserPath}" --headless=new --no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=${width},${height} --screenshot="${outputPngPath}" "${fileUrl}"`;

    execSync(cmd, { stdio: 'pipe', timeout: 30000 });

    if (!fs.existsSync(outputPngPath)) {
      throw new Error(`Screenshot failed to create file at: ${outputPngPath}`);
    }

    return outputPngPath;
  } finally {
    // Cleanup temporary HTML file
    if (fs.existsSync(tempHtmlPath)) {
      try { fs.unlinkSync(tempHtmlPath); } catch {}
    }
  }
}
