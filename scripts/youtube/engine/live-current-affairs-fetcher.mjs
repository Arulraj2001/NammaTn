// scripts/youtube/engine/live-current-affairs-fetcher.mjs
/**
 * VizhiTN Autonomous Live Current Affairs & Exam Intelligence Engine
 * Sourced 100% LIVE using real-time Tamil news RSS streams + Gemini AI synthesis.
 * Gathers verified happenings in Tamil Nadu across the last 24 hours
 * categorized strictly according to the TNPSC / Competitive Exam Syllabus.
 */

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const API_KEYS = [
  process.env.NEW_GEMINI_API_KEY,
  process.env.YOUTUBE_GEMINI_API_KEY,
  process.env.GEMINI_API_KEY
].filter(Boolean);

export const TNPSC_CATEGORIES = [
  { id: 'government_schemes', label: 'தமிழ்நாடு அரசுத் திட்டங்கள் & அமைச்சரவை முடிவுகள்', icon: '🏛️' },
  { id: 'judiciary_acts', label: 'சட்டம், நீதித்துறை & உயர்நீதிமன்ற முக்கியத் தீர்ப்புகள்', icon: '⚖️' },
  { id: 'economy_industry', label: 'பொருளாதாரம், நிதி & தொழில் முதலீடுகள்', icon: '📈' },
  { id: 'appointments_persons', label: 'முக்கிய நியமனங்கள் & செய்திகளில் இடம்பிடித்த நபர்கள்', icon: '👤' },
  { id: 'environment_science', label: 'சுற்றுச்சூழல், வனவிலங்கு சரணாலயம் & அறிவியல்', icon: '🌿' },
  { id: 'sports_awards', label: 'விளையாட்டு சாதனையாளர்கள் & விருதுகள்', icon: '🏆' }
];

export function getNowIst() {
  const now = new Date();
  const istDate = new Date(now.getTime() + 5.5 * 3600 * 1000);
  const dateStr = istDate.toISOString().slice(0, 10);
  const [year, month, day] = dateStr.split('-');

  const tamilMonths = [
    'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
    'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'
  ];
  const tamilDateFormatted = `${parseInt(day, 10)} ${tamilMonths[parseInt(month, 10) - 1]} ${year}`;

  return {
    raw: istDate,
    dateStr,
    dayOfWeek: istDate.getUTCDay(),
    tamilDateFormatted,
    hours: istDate.getUTCHours(),
    minutes: istDate.getUTCMinutes()
  };
}

/**
 * Fetches real-time Tamil Nadu news items from Google News Tamil RSS
 */
async function fetchLiveNewsStream() {
  const queries = [
    'Tamil Nadu அரசு திட்டம் when:24h',
    'சென்னை உயர்நீதிமன்றம் தீர்ப்பு when:24h',
    'தமிழ்நாடு முதலீடு வேலைவாய்ப்பு when:24h',
    'தமிழ்நாடு நியமனம் விருது விளையாட்டு when:24h',
    'DIPR Tamil Nadu செய்திக்குறிப்பு when:24h'
  ];

  const allItems = [];
  const seenTitles = new Set();

  for (const q of queries) {
    try {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=ta&gl=IN&ceid=IN:ta`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;

      const xml = await res.text();
      const blocks = xml.split('<item>').slice(1);

      for (const block of blocks) {
        const titleMatch = block.match(/<title>([^<]+)<\/title>/);
        const linkMatch = block.match(/<link>([^<]+)<\/link>/);
        const sourceMatch = block.match(/<source[^>]*>([^<]+)<\/source>/);
        const pubDateMatch = block.match(/<pubDate>([^<]+)<\/pubDate>/);

        if (titleMatch) {
          const rawTitle = titleMatch[1].replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim();
          const cleanTitle = rawTitle.replace(/\s*-\s*[^-]+$/, '').trim();
          const source = sourceMatch ? sourceMatch[1].trim() : 'Tamil Nadu Press';
          const link = linkMatch ? linkMatch[1].trim() : '';
          const pubDate = pubDateMatch ? pubDateMatch[1].trim() : '';

          if (!seenTitles.has(cleanTitle.toLowerCase()) && cleanTitle.length > 15) {
            seenTitles.add(cleanTitle.toLowerCase());
            allItems.push({ title: cleanTitle, link, pubDate, source });
          }
        }
      }
    } catch (err) {
      console.warn(`[RSS FETCH WARN] Query "${q}" failed: ${err.message}`);
    }
  }

  return allItems.slice(0, 45);
}

function safeJsonParse(raw) {
  try {
    return JSON.parse(raw);
  } catch (err) {
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (_) {
      // Find the last complete object in the array if truncated
      const lastCloseBracket = cleaned.lastIndexOf('}');
      if (lastCloseBracket !== -1) {
        const candidate = cleaned.slice(0, lastCloseBracket + 1);
        const fixed = candidate.endsWith(']}') ? candidate : candidate + ']}';
        try { return JSON.parse(fixed); } catch (_) {}
      }
    }
    throw err;
  }
}

/**
 * Calls Gemini to synthesize structured TNPSC Current Affairs
 */
async function synthesizeWithGemini(liveItems, ist) {
  const prompt = `
You are the Chief Current Affairs Editor for VizhiTN and a Senior Faculty Researcher for TNPSC & Tamil Nadu Competitive Exams.
Today's Date: ${ist.dateStr} (${ist.tamilDateFormatted}).

Below are 25-40 real, verified news items that happened in Tamil Nadu in the LAST 24 HOURS:
${JSON.stringify(liveItems.map(i => `${i.title} (${i.source})`), null, 2)}

TASK:
Filter out cinema gossip, political rhetoric, and unverified rumors.
Select exactly 8 to 10 of the most significant, fact-checked news events that are highly relevant for competitive exam aspirants (TNPSC Group 1, Group 2, Group 4, Police SI, SSC, Banking) and general citizens.

CRITICAL JSON RULE:
Never use internal double quotes (\") inside Tamil text strings. If you need quotes around scheme names or titles, always use single quotes ('...').

Distribute them across these 6 syllabus categories:
1. "government_schemes" (Tamil Nadu Govt Schemes, Cabinet Orders, Subsidies, Welfare)
2. "judiciary_acts" (Madras High Court judgments, Supreme Court orders on TN, Assembly Bills)
3. "economy_industry" (SIPCOT/TIDCO developments, Investments, MoUs, MSME, Budget updates)
4. "appointments_persons" (Key appointments: DGP, Chief Secretary, Commission heads, Person in News)
5. "environment_science" (Wetlands, Ramsar sites, wildlife, dams, science/ISRO milestones in TN)
6. "sports_awards" (Tamil Nadu athletes, medals, literary or State honours)

For each event, construct:
- "id": short-slug
- "category": one of the 6 category IDs above
- "category_label": Tamil label of category
- "headline_ta": Crisp, bold Tamil headline (under 60 characters)
- "headline_en": English headline
- "core_facts_ta": 2 formal yet accessible sentences in Tamil explaining the news factually.
- "exam_pointer_ta": 1 sentence of exact TNPSC study points (G.O. number if any, Department name, Ministry, Constitutional Article or Year).
- "recall_question_ta": A punchy 1-line quiz question for students to answer in the comments.
- "source_name": Real source name from the items.

Output format MUST be valid JSON:
{
  "events": [
    {
      "id": "slug-id",
      "category": "government_schemes",
      "category_label": "தமிழ்நாடு அரசுத் திட்டங்கள்",
      "headline_ta": "...",
      "headline_en": "...",
      "core_facts_ta": "...",
      "exam_pointer_ta": "...",
      "recall_question_ta": "...",
      "source_name": "..."
    }
  ]
}
`;

  const CANDIDATES = ['gemini-flash-lite-latest', 'gemini-flash-latest'];

  for (const apiKey of API_KEYS) {
    for (const model of CANDIDATES) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(20000),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 4000,
              responseMimeType: 'application/json'
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (raw) {
            const parsed = safeJsonParse(raw);
            if (Array.isArray(parsed?.events) && parsed.events.length >= 6) {
              console.log(`[SYNTHESIS ✓] Successfully synthesized ${parsed.events.length} TNPSC current affairs events using ${model}.`);
              return parsed.events;
            }
          }
        } else {
          console.warn(`[GEMINI WARN] ${model} HTTP ${res.status}`);
        }
      } catch (err) {
        console.warn(`[GEMINI WARN] ${model} fetch failed: ${err.message}`);
      }
    }
  }

  throw new Error('All candidate Gemini models failed to synthesize current affairs.');
}

/**
 * Main export to get the complete 24h current affairs package
 */
export async function getDailyCurrentAffairsPackage(targetDate = null) {
  const ist = targetDate ? { dateStr: targetDate, tamilDateFormatted: targetDate } : getNowIst();

  console.log(`[LIVE CURRENT AFFAIRS] Fetching live 24h news stream for ${ist.dateStr}...`);
  const liveItems = await fetchLiveNewsStream();

  if (liveItems.length === 0) {
    throw new Error('No live news items could be retrieved from RSS feeds.');
  }

  console.log(`[LIVE CURRENT AFFAIRS] Fetched ${liveItems.length} verified news articles from last 24h.`);
  const events = await synthesizeWithGemini(liveItems, ist);

  return {
    date: ist.dateStr,
    tamilDate: ist.tamilDateFormatted,
    eventCount: events.length,
    events
  };
}
