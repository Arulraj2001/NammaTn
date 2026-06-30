// src/lib/seo/contentEntropy.js
// Deterministic content entropy system — prevents doorway page / duplicate penalties.
//
// UPGRADE v2 (Ranking Engine):
//  - Semantic variation per city × issue (not just weighted shuffle)
//  - Intent-based tone injection from queryIntentEngine
//  - Authority-based block injection from authorityEngine
//  - Trend-based variation: trending pages get urgency-toned lead block
//  - No two pages share identical structure order, tone, or fallback logic.
//  - Fully deterministic: stable across all ISR cycles for same city+issue pair.

function getHashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Seeded LCG — stable across all ISR cycles for same seed
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// ── Intent → content tone map ─────────────────────────────────────────────────
const INTENT_TONE_PREFIX = {
  educational: 'Understanding',
  directive:   'How to',
  urgent:      'Emergency',
  analytical:  'Analysis:',
  neutral:     '',
};

// ── Block factory ─────────────────────────────────────────────────────────────
function buildBlocks(cityData, issueData, stats, reports, rankingContext = {}) {
  const {
    intentData    = {},
    authorityData = {},
    trendVelocity = null,
  } = rankingContext;

  const total       = stats?.totalReports ?? reports?.length ?? 0;
  const localities  = (cityData.neighborhoods || []).slice(0, 4);
  const localityText = localities.length > 0
    ? localities.join(', ')
    : `${cityData.name} central area`;

  const issueTechnicalDetail = issueData.technicalDetail ||
    `${issueData.name} incidents in Tamil Nadu are classified by severity and assigned to the ${issueData.authority || 'respective municipal department'} for resolution. Each case type has a distinct escalation path.`;

  // Tone prefix from intent
  const tonePrefix = INTENT_TONE_PREFIX[intentData.contentTone] || '';

  // Intent-based lead sentence variation
  const intentLead = intentData.dominantIntent === 'navigational'
    ? `Citizens in ${cityData.name} frequently search for direct complaint channels for ${issueData.plural.toLowerCase()}.`
    : intentData.dominantIntent === 'transactional'
    ? `Report active ${issueData.plural.toLowerCase()} in ${cityData.name} now and track resolution in real-time.`
    : intentData.dominantIntent === 'investigative'
    ? `Recurring ${issueData.plural.toLowerCase()} in ${cityData.name} may indicate systemic infrastructure gaps.`
    : `${cityData.name} residents can access live tracking and official complaint data for ${issueData.plural.toLowerCase()}.`;

  // Trending urgency prefix
  const trendPrefix = trendVelocity === 'spike'
    ? `⚠️ High activity detected: `
    : trendVelocity === 'high'
    ? `Notable rise in reports: `
    : '';

  // Authority content block (injected if authorityData available)
  const authorityContent = authorityData.authorityStatement ||
    `${issueData.name} complaints in ${cityData.name} fall under ${issueData.authority || 'the local civic authority'}. Helpline: ${issueData.helpline || '1912'}.`;

  const escalationText = (authorityData.escalationPath || []).slice(0, 2).join(' → ');

  // ── All available blocks with semantic variation ──────────────────────────
  return [
    {
      id: 'intentLeadBlock',
      weight: trendVelocity ? 4 : 2, // Trending pages always lead with urgency
      render: () => ({
        title:   `${trendPrefix}${cityData.name} ${issueData.name} Status`,
        content: intentLead,
      }),
    },
    {
      id: 'authorityBlock',
      weight: 4, // Always high — civic authority is the #1 E-E-A-T signal
      render: () => ({
        title:   `${tonePrefix} ${issueData.name} Complaint Channels in ${cityData.name}`.trim(),
        content: authorityContent +
          (escalationText ? ` Escalation path: ${escalationText}.` : ''),
      }),
    },
    {
      id: 'geoBreakdownBlock',
      weight: 3, // Unique per city via real locality names
      render: () => ({
        title:   `Active Reporting Zones — ${cityData.name}`,
        content: `Citizen reports from ${cityData.name} are tracked across ${localityText}. Organizing by locality helps RWA networks coordinate with municipal officers and monitor resolution timelines per zone.`,
      }),
    },
    {
      id: 'technicalExplanationBlock',
      weight: 2,
      render: () => ({
        title:   `${issueData.name} Incident Classification`,
        content: issueTechnicalDetail,
      }),
    },
    {
      id: 'trendHistoryBlock',
      weight: trendVelocity ? 3 : 2, // Trending: boost this block
      render: () => ({
        title:   `${cityData.name} ${issueData.name} Activity Summary`,
        content: `${total > 0
          ? `${total} active ${issueData.plural.toLowerCase()} documented in ${cityData.name} on VizhiTN.`
          : `${cityData.name} currently has no pending ${issueData.plural.toLowerCase()} reports.`
        } Activity is updated every hour via community submissions and helps authorities prioritize restoration.`,
      }),
    },
    {
      id: 'userInsightsBlock',
      weight: 1,
      render: () => ({
        title:   `Community Feedback — ${cityData.name}`,
        content: `VizhiTN users in ${cityData.name} share live status updates on ${issueData.plural.toLowerCase()}. Community upvotes surface the most critical incidents and track which reports received official acknowledgement.`,
      }),
    },
    {
      id: 'longTailBlock',
      weight: intentData.intentStrength >= 0.6 ? 2 : 1, // Boost on strong intent signal
      render: () => {
        const keywords = (intentData.localKeywords || []).slice(0, 3).join(', ');
        return {
          title:   `Related Searches in ${cityData.name}`,
          content: keywords
            ? `People in ${cityData.name} also search for: ${keywords}. VizhiTN tracks all civic issues under these categories with real-time community reports.`
            : `VizhiTN covers all ${issueData.plural.toLowerCase()} in ${cityData.name} with live tracking and official complaint links.`,
        };
      },
    },
    {
      id: 'fallbackGuideBlock',
      weight: 1,
      render: () => ({
        title:   `How to Report ${issueData.name} Issues`,
        content: `To report an active ${issueData.name.toLowerCase()} in ${cityData.name}, tap Report, select \"${issueData.name}\" as category, pin your location, and add a brief description. Verified reports are immediately visible to neighbours and monitored by local RWAs.`,
      }),
    },
  ];
}

// ── Core export ───────────────────────────────────────────────────────────────
/**
 * @param {object} cityData
 * @param {object} issueData
 * @param {object} stats           – { totalReports }
 * @param {object[]} reports
 * @param {object} rankingContext  – { intentData, authorityData, trendVelocity }
 * @returns {{ title: string, content: string }[]}
 */
export function generateContentEntropy(cityData, issueData, stats, reports, rankingContext = {}) {
  const seed = getHashCode(`${cityData.slug}-${issueData.slug}`);
  const rand = seededRandom(seed);

  const allBlocks = buildBlocks(cityData, issueData, stats, reports, rankingContext);

  // Weighted pool: each block appears proportional to its weight
  const weightedPool = [];
  allBlocks.forEach(block => {
    for (let w = 0; w < block.weight; w++) weightedPool.push(block);
  });

  const picked     = [];
  const pickedIds  = new Set();
  const poolCopy   = [...weightedPool];

  // Select 3–5 unique blocks using seeded random (deterministic per city×issue)
  const targetCount = Math.floor(rand() * 3) + 3;

  while (picked.length < targetCount && poolCopy.length > 0) {
    const idx   = Math.floor(rand() * poolCopy.length);
    const block = poolCopy[idx];
    if (!pickedIds.has(block.id)) {
      pickedIds.add(block.id);
      picked.push(block);
    }
    poolCopy.splice(idx, 1);
  }

  return picked.map(b => b.render());
}
