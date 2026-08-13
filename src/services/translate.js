/**
 * Ultra-reliable dual-engine translation utility for English -> Tamil.
 * Combines Google Translate, MyMemory, Lingva API, and AllOrigins CORS Proxy.
 * TreeWalker translates EVERY text node regardless of nested HTML elements (p, strong, a, etc.).
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

export async function translateSingleLine(text) {
  if (!text || !text.trim()) return text;
  const q = encodeURIComponent(text.trim());

  // 1. Direct Google Translate GTX
  try {
    const res = await fetchWithTimeout(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${q}`);
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
    const res = await fetchWithTimeout(`https://api.mymemory.translated.net/get?q=${q}&langpair=en|ta`);
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
    const res = await fetchWithTimeout(`https://lingva.ml/api/v1/en/ta/${q}`);
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
    const targetUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${q}`;
    const res = await fetchWithTimeout(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
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
 * Translates multi-line English text into Tamil.
 */
export async function translateTextToTamil(text) {
  if (!text || typeof text !== "string" || !text.trim()) return text || "";

  const lines = text.split(/\n+/).filter(Boolean);
  const translatedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const translated = await translateSingleLine(trimmed);
    translatedLines.push(translated);
  }

  return translatedLines.join("\n\n");
}

/**
 * Translates rich HTML content safely using browser TreeWalker.
 * Preserves all HTML tags (p, h1-h6, li, strong, em, a, img, blockquote)
 * while translating all inner text nodes into Tamil regardless of nesting.
 */
export async function translateHtmlToTamil(htmlContent) {
  if (!htmlContent || typeof htmlContent !== "string" || !htmlContent.trim()) return htmlContent || "";

  try {
    if (typeof window === "undefined" || !window.DOMParser) {
      return await translateTextToTamil(htmlContent);
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
        const translated = await translateSingleLine(original);
        if (translated && translated !== original) {
          tNode.nodeValue = tNode.nodeValue.replace(original, translated);
        }
      }
    }

    return doc.body.innerHTML;
  } catch (err) {
    console.warn("HTML translation error, falling back to text:", err);
    return await translateTextToTamil(htmlContent);
  }
}
