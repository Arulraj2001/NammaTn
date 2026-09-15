/**
 * Ultra-reliable dual-engine translation utility for English <-> Tamil.
 * Combines Google Translate, MyMemory, Lingva API, and AllOrigins CORS Proxy.
 * Supports bidirectional translation (English -> Tamil & Tamil -> English).
 */

async function fetchWithTimeout(url, options = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Detects if a given text contains Tamil Unicode characters.
 * Tamil Unicode range: U+0B80 - U+0BFF
 */
export function isTamilText(text) {
  if (!text || typeof text !== "string") return false;
  return /[\u0B80-\u0BFF]/.test(text);
}

/**
 * Translates a single line of text with multi-engine fallback.
 * @param {string} text - Input text
 * @param {string} from - Source language ('en', 'ta', or 'auto')
 * @param {string} to - Target language ('ta' or 'en')
 */
export async function translateSingleLine(text, from = "auto", to = "ta") {
  if (!text || !text.trim()) return text;
  const q = encodeURIComponent(text.trim());
  const resolvedFrom = from === "auto" ? (to === "ta" ? "en" : "ta") : from;

  // 1. Direct Google Translate GTX
  try {
    const res = await fetchWithTimeout(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${q}`
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const parts = data[0].map((item) => (Array.isArray(item) ? item[0] : "")).filter(Boolean);
        if (parts.length > 0) return parts.join("");
      }
    }
  } catch {
    // Proceed to Fallback 2
  }

  // 2. Direct MyMemory API (Native CORS enabled)
  try {
    const langpair = `${resolvedFrom}|${to}`;
    const res = await fetchWithTimeout(
      `https://api.mymemory.translated.net/get?q=${q}&langpair=${langpair}`
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    }
  } catch {
    // Proceed to Fallback 3
  }

  // 3. Lingva Open API
  try {
    const res = await fetchWithTimeout(`https://lingva.ml/api/v1/${resolvedFrom}/${to}/${q}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.translation) {
        return data.translation;
      }
    }
  } catch {
    // Proceed to Fallback 4
  }

  // 4. AllOrigins Proxy -> Google Translate
  try {
    const targetUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${q}`;
    const res = await fetchWithTimeout(
      `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`
    );
    if (res.ok) {
      const wrapper = await res.json();
      if (wrapper && wrapper.contents) {
        const data = JSON.parse(wrapper.contents);
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const parts = data[0].map((item) => (Array.isArray(item) ? item[0] : "")).filter(Boolean);
          if (parts.length > 0) return parts.join("");
        }
      }
    }
  } catch {
    // Exhausted
  }

  return text;
}

/**
 * Translates multi-line text with source and target languages.
 */
export async function translateMultiLine(text, from = "auto", to = "ta") {
  if (!text || typeof text !== "string" || !text.trim()) return text || "";

  const lines = text.split(/\n+/).filter(Boolean);
  const translatedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const translated = await translateSingleLine(trimmed, from, to);
    translatedLines.push(translated);
  }

  return translatedLines.join("\n\n");
}

/**
 * Translates English text into Tamil.
 */
export async function translateTextToTamil(text) {
  return translateMultiLine(text, "en", "ta");
}

/**
 * Translates Tamil text into English.
 */
export async function translateTextToEnglish(text) {
  return translateMultiLine(text, "ta", "en");
}

/**
 * Translates rich HTML content safely using browser TreeWalker.
 * Preserves all HTML tags (p, h1-h6, li, strong, em, a, img, blockquote)
 * while translating all inner text nodes regardless of nesting.
 */
export async function translateHtml(htmlContent, from = "auto", to = "ta") {
  if (!htmlContent || typeof htmlContent !== "string" || !htmlContent.trim()) return htmlContent || "";

  try {
    if (typeof window === "undefined" || !window.DOMParser) {
      return await translateMultiLine(htmlContent, from, to);
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Collect all text nodes
    const textNodes = [];
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.trim()) {
        textNodes.push(node);
      }
    }

    // Translate each text node
    for (const tNode of textNodes) {
      const original = tNode.nodeValue.trim();
      if (original) {
        const translated = await translateSingleLine(original, from, to);
        if (translated && translated !== original) {
          tNode.nodeValue = tNode.nodeValue.replace(original, translated);
        }
      }
    }

    return doc.body.innerHTML;
  } catch (err) {
    console.warn("HTML translation error, falling back to text:", err);
    return await translateMultiLine(htmlContent, from, to);
  }
}

export async function translateHtmlToTamil(htmlContent) {
  return translateHtml(htmlContent, "en", "ta");
}

export async function translateHtmlToEnglish(htmlContent) {
  return translateHtml(htmlContent, "ta", "en");
}

/**
 * Automatically inspects post payload and ensures both English and Tamil
 * fields are populated for maximum bilingual reach and clean SEO slugs.
 * - Detects language (English vs Tamil).
 * - Bidirectionally auto-translates missing fields.
 * - Ensures title_en contains English text so slug generation produces clean ASCII URLs.
 */
export async function ensureBilingualPost(rawPost = {}) {
  const result = { ...rawPost };

  let titleEn = (result.title_en || (!isTamilText(result.title) ? result.title : "") || "").trim();
  let titleTa = (result.title_ta || (isTamilText(result.title) ? result.title : "") || "").trim();

  let contentEn = (result.content_en || (!isTamilText(result.content) ? result.content : "") || "").trim();
  let contentTa = (result.content_ta || (isTamilText(result.content) ? result.content : "") || "").trim();

  // If user typed Tamil into the title_en / content_en field, re-route it
  if (titleEn && isTamilText(titleEn)) {
    if (!titleTa) titleTa = titleEn;
    titleEn = "";
  }
  if (contentEn && isTamilText(contentEn)) {
    if (!contentTa) contentTa = contentEn;
    contentEn = "";
  }

  // 1. English -> Tamil translation
  if (titleEn && !titleTa) {
    try {
      titleTa = await translateTextToTamil(titleEn);
    } catch (e) {
      console.warn("Failed to translate title to Tamil:", e);
    }
  }
  if (contentEn && !contentTa) {
    try {
      contentTa = await translateTextToTamil(contentEn);
    } catch (e) {
      console.warn("Failed to translate content to Tamil:", e);
    }
  }

  // 2. Tamil -> English translation
  if (titleTa && !titleEn) {
    try {
      titleEn = await translateTextToEnglish(titleTa);
    } catch (e) {
      console.warn("Failed to translate title to English:", e);
    }
  }
  if (contentTa && !contentEn) {
    try {
      contentEn = await translateTextToEnglish(contentTa);
    } catch (e) {
      console.warn("Failed to translate content to English:", e);
    }
  }

  result.title_en = titleEn || titleTa || "Civic Report";
  result.title_ta = titleTa || titleEn || "";
  result.content_en = contentEn || contentTa || "";
  result.content_ta = contentTa || contentEn || "";

  if (!result.title) result.title = result.title_en;
  if (!result.content) result.content = result.content_en;

  return result;
}
