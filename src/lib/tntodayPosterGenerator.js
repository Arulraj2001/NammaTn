import { TN_TODAY_CATEGORY_MAP } from "./tnTodayCategories";

/**
 * Checks if a featured_image value is a text description prompt rather than an actual image URL
 * @param {string} val 
 * @returns {boolean}
 */
export function isImagePrompt(val) {
  if (!val || typeof val !== "string") return false;
  const trimmed = val.trim();
  if (trimmed.length === 0) return false;

  // Real image URLs start with http://, https://, or data:image/
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:image/")) {
    return false;
  }

  // Relative filepaths
  if (trimmed.startsWith("/") && (trimmed.endsWith(".jpg") || trimmed.endsWith(".png") || trimmed.endsWith(".webp") || trimmed.endsWith(".svg"))) {
    return false;
  }

  return true;
}

const CATEGORY_GRADIENTS = {
  infrastructure: ["#0F172A", "#1E3A8A", "#2563EB", "#3B82F6"],
  education:      ["#022C22", "#047857", "#059669", "#10B981"],
  healthcare:     ["#4C0519", "#881337", "#BE123C", "#F43F5E"],
  environment:    ["#064E3B", "#14532D", "#15803D", "#22C55E"],
  economy:        ["#451A03", "#78350F", "#B45309", "#F59E0B"],
  governance:     ["#2E1065", "#3B0764", "#6B21A8", "#A855F7"],
  transport:      ["#431407", "#7C2D12", "#C2410C", "#EA580C"],
  agriculture:    ["#14532D", "#166534", "#15803D", "#84CC16"],
  technology:     ["#083344", "#164E63", "#0E7490", "#06B6D4"],
  social:         ["#500724", "#831843", "#BE185D", "#EC4899"],
  india:          ["#1E1B4B", "#312E81", "#4338CA", "#6366F1"],
  world:          ["#134E4A", "#115E59", "#0F766E", "#14B8A6"],
  general:        ["#0F172A", "#1E293B", "#334155", "#64748B"],
};

/**
 * Text word wrap helper for Canvas context
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let currentLine = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Generates a high-definition 1200x630 TNToday Full-Banner Branded News Poster PNG Data URL
 * @param {Object} opts
 * @param {string} opts.title Article title
 * @param {string} [opts.category] Article category
 * @param {string} [opts.subtitle] Optional subtitle/summary snippet
 * @param {HTMLImageElement} [opts.bgImage] Optional loaded background image
 * @returns {string} PNG Data URL
 */
export function generateTnTodayPoster({ title = "TNToday News Update", category = "general", subtitle = "", bgImage = null }) {
  if (typeof window === "undefined") return "";

  const width = 1200;
  const height = 630;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const catKey = (category || "general").toLowerCase();
  const catObj = TN_TODAY_CATEGORY_MAP[catKey] || TN_TODAY_CATEGORY_MAP.general;
  const colors = CATEGORY_GRADIENTS[catKey] || CATEGORY_GRADIENTS.general;

  // 1. Draw Deep Gradient or Image Background
  if (bgImage && bgImage.complete && bgImage.naturalWidth > 0) {
    // Draw background photo
    ctx.drawImage(bgImage, 0, 0, width, height);

    // Apply 75% Dark Linear & Radial Vignette for 100% text contrast
    const darkOverlay = ctx.createLinearGradient(0, 0, width, 0);
    darkOverlay.addColorStop(0, "rgba(15, 23, 42, 0.95)");
    darkOverlay.addColorStop(0.6, "rgba(15, 23, 42, 0.85)");
    darkOverlay.addColorStop(1, "rgba(15, 23, 42, 0.65)");
    ctx.fillStyle = darkOverlay;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Rich 4-Stop Deep Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, colors[0]);
    bgGrad.addColorStop(0.4, colors[1]);
    bgGrad.addColorStop(0.8, colors[2]);
    bgGrad.addColorStop(1, colors[3]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw Decorative Ambient Glow Circles (Top-Right & Bottom-Right)
  ctx.save();
  ctx.globalAlpha = 0.35;
  const glow1 = ctx.createRadialGradient(width - 150, 100, 10, width - 150, 100, 400);
  glow1.addColorStop(0, colors[3]);
  glow1.addColorStop(1, "transparent");
  ctx.fillStyle = glow1;
  ctx.beginPath(); ctx.arc(width - 150, 100, 400, 0, Math.PI * 2); ctx.fill();

  const glow2 = ctx.createRadialGradient(200, height - 100, 10, 200, height - 100, 300);
  glow2.addColorStop(0, "#F59E0B");
  glow2.addColorStop(1, "transparent");
  ctx.fillStyle = glow2;
  ctx.beginPath(); ctx.arc(200, height - 100, 300, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // 3. Draw Digital Dot-Grid Texture
  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  const dotSpacing = 32;
  for (let x = 40; x < width - 40; x += dotSpacing) {
    for (let y = 40; y < height - 40; y += dotSpacing) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // 4. Draw Double Ribbon Border Bar on Left
  // Outer Gold Ribbon
  ctx.fillStyle = "#F59E0B";
  ctx.fillRect(0, 0, 10, height);
  // Inner Category Color Ribbon
  ctx.fillStyle = colors[3];
  ctx.fillRect(10, 0, 8, height);

  // 5. Draw Header Bar: Category Badge (Left) & Brand Stamp (Right)
  const badgeX = 70;
  const badgeY = 60;

  // Category Pill Badge
  const badgeText = `${catObj.emoji}  ${catObj.label.toUpperCase()}`;
  ctx.font = "bold 19px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const badgeWidth = ctx.measureText(badgeText).width + 36;
  const badgeHeight = 44;

  ctx.save();
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 22);
  } else {
    ctx.rect(badgeX, badgeY, badgeWidth, badgeHeight);
  }
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(badgeText, badgeX + 18, badgeY + 28);
  ctx.restore();

  // Top-Right "TNToday Digital Bulletin" Badge
  ctx.save();
  const stampText = "NEWS BULLETIN • TAMIL NADU";
  ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(245, 158, 11, 0.9)"; // Gold
  ctx.fillText("● " + stampText, width - 70, badgeY + 28);
  ctx.restore();

  // 6. Draw Headline Title (Auto-wrapped with High-Contrast Typography)
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;

  let fontSize = 52;
  ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  let titleLines = wrapText(ctx, title, width - 160);

  if (titleLines.length > 3) {
    fontSize = 42;
    ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    titleLines = wrapText(ctx, title, width - 160);
  }
  if (titleLines.length > 4) {
    titleLines = titleLines.slice(0, 4);
    titleLines[3] = titleLines[3].replace(/\s+\S*$/, "...");
  }

  const startY = 185;
  const lineHeight = fontSize * 1.24;
  titleLines.forEach((line, idx) => {
    ctx.fillText(line, 70, startY + idx * lineHeight);
  });
  ctx.restore();

  // 7. Draw Subtitle / Key Quote Context
  if (subtitle && subtitle.trim()) {
    ctx.save();
    ctx.fillStyle = "rgba(226, 232, 240, 0.92)";
    ctx.font = "500 23px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const subY = startY + titleLines.length * lineHeight + 18;
    const subLines = wrapText(ctx, subtitle.trim(), width - 160);
    if (subLines.length > 0 && subY < height - 110) {
      ctx.fillText(subLines[0] + (subLines.length > 1 ? "..." : ""), 70, subY);
    }
    ctx.restore();
  }

  // 8. Signature TNToday Footer Brand Bar
  ctx.save();
  const footerY = height - 55;

  // Divider Line with Gold Highlight
  const divGrad = ctx.createLinearGradient(70, 0, width - 70, 0);
  divGrad.addColorStop(0, "#F59E0B");
  divGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.3)");
  divGrad.addColorStop(1, "rgba(255, 255, 255, 0.05)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(70, footerY - 22);
  ctx.lineTo(width - 70, footerY - 22);
  ctx.stroke();

  // Brand Name & Network Tag
  ctx.fillStyle = "#F59E0B"; // Gold
  ctx.font = "900 25px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("TN TODAY", 70, footerY);

  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = "600 19px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("• VizhiTN Digital Media", 205, footerY);

  // Right Side Verified Stamp
  ctx.fillStyle = "#10B981"; // Emerald
  ctx.font = "700 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("✓ OFFICIAL VERIFIED REPORT", width - 70, footerY);

  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.85);
}

/**
 * Async version of generateTnTodayPoster that automatically fetches a thematic background photo and blends it under TNToday poster graphics
 */
export async function generateTnTodayPosterAsync({ title = "", category = "general", subtitle = "", promptText = "", imageUrl = "" }) {
  if (typeof window === "undefined") return "";

  let targetUrl = imageUrl;

  // Auto-fetch AI photo from prompt or title if no explicit imageUrl provided
  if (!targetUrl && (promptText || title)) {
    try {
      targetUrl = await fetchAiPhotoFromPrompt(promptText || title);
    } catch {
      // ignore error
    }
  }

  if (targetUrl && (targetUrl.startsWith("http://") || targetUrl.startsWith("https://") || targetUrl.startsWith("data:image/"))) {
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timeout loading background image")), 3500);
        img.onload = () => { clearTimeout(timer); resolve(); };
        img.onerror = () => { clearTimeout(timer); reject(); };
        img.src = targetUrl;
      });
      return generateTnTodayPoster({ title, category, subtitle, bgImage: img });
    } catch {
      // Safe fallback to pure canvas gradient poster without error
    }
  }

  return generateTnTodayPoster({ title, category, subtitle });
}

/**
 * Fetches an AI photographic image URL from a prompt text using Pollinations AI (free)
 * @param {string} promptText 
 * @returns {Promise<string>} Image URL or data URL
 */
export async function fetchAiPhotoFromPrompt(promptText) {
  if (!promptText) return "";
  const cleanPrompt = promptText.trim().slice(0, 300);
  const encoded = encodeURIComponent(`Tamil Nadu news photography: ${cleanPrompt}, realistic, 8k editorial photo`);
  const seed = Math.floor(Math.random() * 100000);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=1200&height=630&seed=${seed}&nologo=true`;
  
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(url);
    img.onerror = () => resolve(url);
    img.src = url;
  });
}
