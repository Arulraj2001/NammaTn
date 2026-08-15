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

/**
 * Dynamic Category Color Palettes for TNToday Poster Generator
 */
const CATEGORY_THEMES = {
  infrastructure: {
    bgGrad: ["#0B132B", "#1C2541", "#1E3A8A", "#2563EB"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#3B82F6",
    badgeBg: "rgba(59, 130, 246, 0.2)",
    badgeBorder: "rgba(147, 197, 253, 0.4)",
    subheadColor: "#F59E0B", // Gold
    stampColor: "#F59E0B",
    verifiedColor: "#10B981",
  },
  education: {
    bgGrad: ["#022C22", "#064E3B", "#047857", "#10B981"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#10B981",
    badgeBg: "rgba(16, 185, 129, 0.2)",
    badgeBorder: "rgba(110, 231, 183, 0.4)",
    subheadColor: "#6EE7B7", // Mint Green
    stampColor: "#6EE7B7",
    verifiedColor: "#10B981",
  },
  healthcare: {
    bgGrad: ["#4C0519", "#881337", "#BE123C", "#F43F5E"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#F43F5E",
    badgeBg: "rgba(244, 63, 94, 0.2)",
    badgeBorder: "rgba(253, 164, 175, 0.4)",
    subheadColor: "#FECDD3", // Soft Rose
    stampColor: "#F59E0B",
    verifiedColor: "#10B981",
  },
  environment: {
    bgGrad: ["#064E3B", "#14532D", "#15803D", "#22C55E"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#22C55E",
    badgeBg: "rgba(34, 197, 94, 0.2)",
    badgeBorder: "rgba(134, 239, 172, 0.4)",
    subheadColor: "#A3E635", // Lime
    stampColor: "#A3E635",
    verifiedColor: "#10B981",
  },
  economy: {
    bgGrad: ["#451A03", "#78350F", "#B45309", "#F59E0B"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#B45309",
    badgeBg: "rgba(245, 158, 11, 0.2)",
    badgeBorder: "rgba(252, 211, 77, 0.4)",
    subheadColor: "#FDE047", // Yellow
    stampColor: "#F59E0B",
    verifiedColor: "#10B981",
  },
  governance: {
    bgGrad: ["#2E1065", "#3B0764", "#6B21A8", "#A855F7"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#E11D48",
    badgeBg: "rgba(168, 85, 247, 0.2)",
    badgeBorder: "rgba(216, 180, 254, 0.4)",
    subheadColor: "#FDE047", // Bright Yellow
    stampColor: "#FDE047",
    verifiedColor: "#10B981",
  },
  transport: {
    bgGrad: ["#431407", "#7C2D12", "#C2410C", "#EA580C"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#EA580C",
    badgeBg: "rgba(234, 88, 12, 0.2)",
    badgeBorder: "rgba(253, 186, 116, 0.4)",
    subheadColor: "#FDE047", // Gold Yellow
    stampColor: "#F59E0B",
    verifiedColor: "#10B981",
  },
  agriculture: {
    bgGrad: ["#14532D", "#166534", "#15803D", "#84CC16"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#84CC16",
    badgeBg: "rgba(132, 204, 22, 0.2)",
    badgeBorder: "rgba(190, 242, 100, 0.4)",
    subheadColor: "#FDE047", // Harvest Gold
    stampColor: "#BEF264",
    verifiedColor: "#10B981",
  },
  technology: {
    bgGrad: ["#083344", "#164E63", "#0E7490", "#06B6D4"],
    ribbonGold: "#38BDF8",
    ribbonAccent: "#06B6D4",
    badgeBg: "rgba(6, 182, 212, 0.2)",
    badgeBorder: "rgba(103, 232, 249, 0.4)",
    subheadColor: "#38BDF8", // Neon Cyan
    stampColor: "#38BDF8",
    verifiedColor: "#10B981",
  },
  social: {
    bgGrad: ["#500724", "#831843", "#BE185D", "#EC4899"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#EC4899",
    badgeBg: "rgba(236, 72, 153, 0.2)",
    badgeBorder: "rgba(249, 168, 212, 0.4)",
    subheadColor: "#FBCFE8", // Light Pink
    stampColor: "#F59E0B",
    verifiedColor: "#10B981",
  },
  india: {
    bgGrad: ["#1E1B4B", "#312E81", "#4338CA", "#6366F1"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#6366F1",
    badgeBg: "rgba(99, 102, 241, 0.2)",
    badgeBorder: "rgba(165, 180, 252, 0.4)",
    subheadColor: "#F59E0B",
    stampColor: "#F59E0B",
    verifiedColor: "#10B981",
  },
  world: {
    bgGrad: ["#134E4A", "#115E59", "#0F766E", "#14B8A6"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#14B8A6",
    badgeBg: "rgba(20, 184, 166, 0.2)",
    badgeBorder: "rgba(153, 246, 228, 0.4)",
    subheadColor: "#5EEAD4", // Teal Mint
    stampColor: "#5EEAD4",
    verifiedColor: "#10B981",
  },
  general: {
    bgGrad: ["#0F172A", "#1E293B", "#334155", "#64748B"],
    ribbonGold: "#F59E0B",
    ribbonAccent: "#3B82F6",
    badgeBg: "rgba(255, 255, 255, 0.12)",
    badgeBorder: "rgba(255, 255, 255, 0.35)",
    subheadColor: "#F59E0B",
    stampColor: "#F59E0B",
    verifiedColor: "#10B981",
  },
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
 * Generates a high-definition 1200x630 TNToday Full-Banner Branded News Poster JPEG Data URL
 * Dynamically themed according to category
 * @param {Object} opts
 * @param {string} opts.title Article title
 * @param {string} [opts.category] Article category
 * @param {string} [opts.subtitle] Optional subtitle/summary snippet
 * @param {HTMLImageElement} [opts.bgImage] Optional loaded background image
 * @param {"square_box" | "full_bg" | "auto"} [opts.layoutStyle] Poster layout style
 * @returns {string} JPEG Data URL (~90 KB)
 */
export function generateTnTodayPoster({ title = "TNToday News Update", category = "general", subtitle = "", bgImage = null, layoutStyle = "banner" }) {
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
  const theme = CATEGORY_THEMES[catKey] || CATEGORY_THEMES.general;

  const hasPhoto = bgImage && bgImage.complete && bgImage.naturalWidth > 0;
  const isPhotoBg = (layoutStyle === "banner" || layoutStyle === "full_bg") && hasPhoto;

  // 1. Draw Background
  if (isPhotoBg) {
    // Cover-fit full background photo
    const imgRatio = bgImage.naturalWidth / bgImage.naturalHeight;
    const canvasRatio = width / height;
    let drawW, drawH, drawX, drawY;

    if (imgRatio > canvasRatio) {
      drawH = height;
      drawW = height * imgRatio;
      drawX = -(drawW - width) / 2;
      drawY = 0;
    } else {
      drawW = width;
      drawH = width / imgRatio;
      drawX = 0;
      drawY = -(drawH - height) / 2;
    }
    ctx.drawImage(bgImage, drawX, drawY, drawW, drawH);

    // Apply 75% Dark Linear Vignette
    const darkOverlay = ctx.createLinearGradient(0, 0, width, 0);
    darkOverlay.addColorStop(0, "rgba(15, 23, 42, 0.95)");
    darkOverlay.addColorStop(0.6, "rgba(15, 23, 42, 0.85)");
    darkOverlay.addColorStop(1, "rgba(15, 23, 42, 0.65)");
    ctx.fillStyle = darkOverlay;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Rich 4-Stop Deep Category Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, theme.bgGrad[0]);
    bgGrad.addColorStop(0.4, theme.bgGrad[1]);
    bgGrad.addColorStop(0.8, theme.bgGrad[2]);
    bgGrad.addColorStop(1, theme.bgGrad[3]);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  }

  // 2. Draw Decorative Ambient Glow Circles
  ctx.save();
  ctx.globalAlpha = 0.35;
  const glow1 = ctx.createRadialGradient(width - 150, 100, 10, width - 150, 100, 400);
  glow1.addColorStop(0, theme.bgGrad[3]);
  glow1.addColorStop(1, "transparent");
  ctx.fillStyle = glow1;
  ctx.beginPath(); ctx.arc(width - 150, 100, 400, 0, Math.PI * 2); ctx.fill();

  const glow2 = ctx.createRadialGradient(200, height - 100, 10, 200, height - 100, 300);
  glow2.addColorStop(0, theme.ribbonGold);
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

  // 4. Draw Dynamic Double Ribbon Border Bar on Left
  ctx.fillStyle = theme.ribbonGold;
  ctx.fillRect(0, 0, 10, height);
  ctx.fillStyle = theme.ribbonAccent;
  ctx.fillRect(10, 0, 8, height);

  // 5. Draw Header Bar: Category Pill Badge (Left) & Brand Stamp (Right)
  const badgeX = 70;
  const badgeY = 60;

  const badgeText = `${catObj.emoji}  ${catObj.label.toUpperCase()}`;
  ctx.font = "bold 19px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  const badgeWidth = ctx.measureText(badgeText).width + 36;
  const badgeHeight = 44;

  ctx.save();
  ctx.fillStyle = theme.badgeBg;
  ctx.strokeStyle = theme.badgeBorder;
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
  ctx.fillStyle = theme.stampColor;
  ctx.fillText("● " + stampText, width - 70, badgeY + 28);
  ctx.restore();

  // 6. IF SQUARE BOX MODE: Draw Right-Bottom Square Topic Photo Inset Box
  const isSquareMode = layoutStyle === "square_box";
  const boxX = 810;
  const boxY = 220;
  const boxW = 320;
  const boxH = 300;
  const boxRadius = 20;

  if (isSquareMode) {
    ctx.save();
    // Drop shadow
    ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;

    // Box Background Fill
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxW, boxH, boxRadius);
    } else {
      ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.fill();
    ctx.shadowColor = "transparent";

    // Inset Image Clipping Mask
    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxW, boxH, boxRadius);
    } else {
      ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.clip();

    if (hasPhoto) {
      // Cover-fit image inside box
      const imgRatio = bgImage.naturalWidth / bgImage.naturalHeight;
      const boxRatio = boxW / boxH;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > boxRatio) {
        drawH = boxH;
        drawW = boxH * imgRatio;
        drawX = boxX - (drawW - boxW) / 2;
        drawY = boxY;
      } else {
        drawW = boxW;
        drawH = boxW / imgRatio;
        drawX = boxX;
        drawY = boxY - (drawH - boxH) / 2;
      }
      ctx.drawImage(bgImage, drawX, drawY, drawW, drawH);

      // Dark bottom vignette on photo
      const photoGrad = ctx.createLinearGradient(0, boxY + boxH - 80, 0, boxY + boxH);
      photoGrad.addColorStop(0, "transparent");
      photoGrad.addColorStop(1, "rgba(15, 23, 42, 0.6)");
      ctx.fillStyle = photoGrad;
      ctx.fillRect(boxX, boxY, boxW, boxH);
    } else {
      // Ultra-Modern 3D Glassmorphic Graphic Container inside Square Box
      const boxGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
      boxGrad.addColorStop(0, theme.bgGrad[1]);
      boxGrad.addColorStop(0.5, theme.bgGrad[2]);
      boxGrad.addColorStop(1, theme.bgGrad[3]);
      ctx.fillStyle = boxGrad;
      ctx.fillRect(boxX, boxY, boxW, boxH);

      // Volumetric 3D Radiant Glow Orb
      ctx.save();
      const glowGrad = ctx.createRadialGradient(boxX + boxW / 2, boxY + boxH / 2, 10, boxX + boxW / 2, boxY + boxH / 2, 130);
      glowGrad.addColorStop(0, theme.ribbonGold);
      glowGrad.addColorStop(0.5, theme.ribbonAccent);
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(boxX + boxW / 2, boxY + boxH / 2, 130, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Frosted Glass Layer Tile
      ctx.save();
      ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(boxX + 20, boxY + 20, boxW - 40, boxH - 40, 16);
      } else {
        ctx.rect(boxX + 20, boxY + 20, boxW - 40, boxH - 40);
      }
      ctx.fill();
      ctx.stroke();

      // 45° Metallic Light Reflection Sweep Streak
      const sheenGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
      sheenGrad.addColorStop(0, "rgba(255, 255, 255, 0.2)");
      sheenGrad.addColorStop(0.4, "rgba(255, 255, 255, 0.02)");
      sheenGrad.addColorStop(1, "transparent");
      ctx.fillStyle = sheenGrad;
      ctx.fill();
      ctx.restore();

      // Large 150px 3D Graphic Emblem centered with deep 3D drop shadow
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 12;
      ctx.font = "150px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(catObj.emoji, boxX + boxW / 2, boxY + boxH / 2 + 10);
      ctx.restore();
    }
    ctx.restore();

    // Outer Gold Border Stroke around Square Box
    const boxGoldGrad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
    boxGoldGrad.addColorStop(0, "#F59E0B");
    boxGoldGrad.addColorStop(0.5, "#D4AF37");
    boxGoldGrad.addColorStop(1, "#9A7B1C");
    ctx.strokeStyle = boxGoldGrad;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxW, boxH, boxRadius);
    } else {
      ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.stroke();
    ctx.restore();
  }

  // 7. Draw Headline Title (Auto-wrapped with Left Margin Protection)
  ctx.save();
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 6;

  const maxTextWidth = isSquareMode ? 700 : width - 160;

  let fontSize = isSquareMode ? 46 : 52;
  ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  let titleLines = wrapText(ctx, title, maxTextWidth);

  if (titleLines.length > 3) {
    fontSize = isSquareMode ? 38 : 42;
    ctx.font = `800 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
    titleLines = wrapText(ctx, title, maxTextWidth);
  }
  if (titleLines.length > 4) {
    titleLines = titleLines.slice(0, 4);
    titleLines[3] = titleLines[3].replace(/\s+\S*$/, "...");
  }

  const startY = 185;
  const lineHeight = fontSize * 1.22;
  titleLines.forEach((line, idx) => {
    ctx.fillText(line, 70, startY + idx * lineHeight);
  });
  ctx.restore();

  // 8. Draw Subtitle / Key Quote Context (Dynamic Subhead Color)
  if (subtitle && subtitle.trim()) {
    ctx.save();
    ctx.fillStyle = theme.subheadColor;
    ctx.font = "700 22px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    const subY = startY + titleLines.length * lineHeight + 18;
    const subLines = wrapText(ctx, subtitle.trim(), maxTextWidth);
    if (subLines.length > 0 && subY < height - 110) {
      ctx.fillText(subLines[0] + (subLines.length > 1 ? "..." : ""), 70, subY);
    }
    ctx.restore();
  }

  // 9. Signature TNToday Footer Brand Bar
  ctx.save();
  const footerY = height - 55;

  // Divider Line with Theme Highlight
  const divGrad = ctx.createLinearGradient(70, 0, width - 70, 0);
  divGrad.addColorStop(0, theme.ribbonGold);
  divGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.3)");
  divGrad.addColorStop(1, "rgba(255, 255, 255, 0.05)");
  ctx.strokeStyle = divGrad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(70, footerY - 22);
  ctx.lineTo(width - 70, footerY - 22);
  ctx.stroke();

  // Brand Name & Network Tag
  ctx.fillStyle = theme.ribbonGold;
  ctx.font = "900 25px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("TN TODAY", 70, footerY);

  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.font = "600 19px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.fillText("• VizhiTN Digital Media", 205, footerY);

  // Right Side Verified Stamp
  ctx.fillStyle = theme.verifiedColor;
  ctx.font = "700 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText("✓ OFFICIAL VERIFIED REPORT", width - 70, footerY);

  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.85);
}

/**
 * Async version of generateTnTodayPoster that automatically fetches a thematic background photo and blends it into the poster
 */
export async function generateTnTodayPosterAsync({ title = "", category = "general", subtitle = "", promptText = "", imageUrl = "", layoutStyle = "banner" }) {
  if (typeof window === "undefined") return "";

  let targetUrl = imageUrl;

  // Auto-fetch AI photo from prompt or title if no explicit imageUrl provided or if prompt text
  if (!targetUrl || isImagePrompt(targetUrl)) {
    try {
      const promptToUse = (isImagePrompt(targetUrl) ? targetUrl : promptText) || title;
      targetUrl = await fetchAiPhotoFromPrompt(promptToUse);
    } catch {
      // ignore error
    }
  }

  if (targetUrl) {
    try {
      const img = new Image();
      if (!targetUrl.startsWith("data:") && !targetUrl.startsWith("blob:")) {
        img.crossOrigin = "anonymous";
      }
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timeout loading background image")), 4500);
        img.onload = () => { clearTimeout(timer); resolve(); };
        img.onerror = () => { clearTimeout(timer); reject(); };
        img.src = targetUrl;
      });
      return generateTnTodayPoster({ title, category, subtitle, bgImage: img, layoutStyle });
    } catch {
      // Safe fallback to pure canvas poster without error
    }
  }

  return generateTnTodayPoster({ title, category, subtitle, layoutStyle });
}

/**
 * Fetches an AI photographic image URL from a prompt text using Pollinations AI (free)
 * Converts to Base64 Data URL to prevent CORS canvas tainting
 * @param {string} promptText 
 * @returns {Promise<string>} Image Data URL
 */
export async function fetchAiPhotoFromPrompt(promptText) {
  if (!promptText) return "";
  const cleanPrompt = promptText.trim().slice(0, 250);
  const encoded = encodeURIComponent(`Tamil Nadu news photography: ${cleanPrompt}, realistic photo`);
  const seed = Math.floor(Math.random() * 100000);
  const primaryUrl = `https://image.pollinations.ai/prompt/${encoded}?width=600&height=600&seed=${seed}&nologo=true`;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(primaryUrl, { signal: controller.signal }).catch(() => null);
    clearTimeout(timer);

    if (res && res.ok) {
      const blob = await res.blob();
      if (blob.size > 1000) {
        return await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(primaryUrl);
          reader.readAsDataURL(blob);
        });
      }
    }
  } catch {
    // fallback
  }

  return primaryUrl;
}
