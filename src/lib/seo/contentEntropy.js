// src/lib/seo/contentEntropy.js
// Deterministic content entropy system to prevent doorway page or duplicate template penalties.
// FIX 5: Weighted selection — higher-value blocks appear more often on Tier 1 city pages.
// FIX 6: geoBreakdownBlock now uses real city neighborhoods, not adjacent district slugs.

function getHashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Seeded LCG — stable across all ISR cycles for same city+issue pair
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateContentEntropy(cityData, issueData, stats, reports) {
  const seed = getHashCode(`${cityData.slug}-${issueData.slug}`);
  const rand = seededRandom(seed);

  // Total report count used in content copy
  const total = stats?.totalReports ?? reports?.length ?? 0;

  // Real locality names — never adjacent districts
  const localities = (cityData.neighborhoods || []).slice(0, 4);
  const localityText = localities.length > 0
    ? localities.join(', ')
    : `${cityData.name} central area`;

  // Issue-specific technical detail (avoids generic cross-category duplication)
  const issueTechnicalDetail = issueData.technicalDetail ||
    `${issueData.name} incidents in Tamil Nadu are classified by severity and assigned to the ${issueData.authority || 'respective municipal department'} for resolution. Each case type has a distinct escalation path.`;

  // All blocks with weights (higher weight = more likely to be selected first)
  const allBlocks = [
    {
      id: 'authorityBlock',
      weight: 3, // High — most unique per city+issue
      render: () => ({
        title: `${cityData.name} ${issueData.name} Complaint Channels`,
        content: `Civic ${issueData.plural.toLowerCase()} in ${cityData.name} fall under the jurisdiction of ${issueData.authority || 'the local urban body'}. Formal complaints can be filed at the helpline ${issueData.helpline || '1912'}. Online grievances may also be submitted via the Tamil Nadu e-Grievance portal at grievance.tn.gov.in.`,
      }),
    },
    {
      id: 'geoBreakdownBlock',
      weight: 3, // High — uses real locality names unique per city
      render: () => ({
        title: `Active Reporting Zones in ${cityData.name}`,
        content: `Citizen reports from ${cityData.name} are tracked across localities including ${localityText}. Organizing reports by area helps local RWA networks coordinate with municipal officers and monitor resolution timelines in each zone.`,
      }),
    },
    {
      id: 'technicalExplanationBlock',
      weight: 2, // Medium — issue-specific
      render: () => ({
        title: `${issueData.name} Incident Classification`,
        content: issueTechnicalDetail,
      }),
    },
    {
      id: 'trendHistoryBlock',
      weight: 2, // Medium — uses live report count
      render: () => ({
        title: `${cityData.name} ${issueData.name} Activity Summary`,
        content: `${total > 0
          ? `${total} active ${issueData.plural.toLowerCase()} have been documented in ${cityData.name} on VizhiTN.`
          : `${cityData.name} currently has no pending ${issueData.plural.toLowerCase()} reports.`
        } Activity data is updated every hour through community submissions and helps local authorities prioritize service restoration.`,
      }),
    },
    {
      id: 'userInsightsBlock',
      weight: 1,
      render: () => ({
        title: `Community Feedback in ${cityData.name}`,
        content: `VizhiTN users in ${cityData.name} share live status updates on ${issueData.plural.toLowerCase()}. Community upvotes help surface the most critical incidents and track which reports have received official acknowledgement.`,
      }),
    },
    {
      id: 'fallbackGuideBlock',
      weight: 1,
      render: () => ({
        title: `How to Report ${issueData.name} Issues on VizhiTN`,
        content: `To report an active ${issueData.name.toLowerCase()} in ${cityData.name}, tap the Report button, select "${issueData.name}" as the category, pin your location, and add a brief description. Verified reports are visible to neighbors immediately and are monitored by local RWAs.`,
      }),
    },
  ];

  // Weighted pool: each block appears in the pool proportional to its weight
  const weightedPool = [];
  allBlocks.forEach(block => {
    for (let w = 0; w < block.weight; w++) weightedPool.push(block);
  });

  // Deterministic weighted shuffle
  const picked = [];
  const pickedIds = new Set();
  const poolCopy = [...weightedPool];

  // Select 3–5 unique blocks using seeded random
  const targetCount = Math.floor(rand() * 3) + 3;

  while (picked.length < targetCount && poolCopy.length > 0) {
    const idx = Math.floor(rand() * poolCopy.length);
    const block = poolCopy[idx];
    if (!pickedIds.has(block.id)) {
      pickedIds.add(block.id);
      picked.push(block);
    }
    poolCopy.splice(idx, 1);
  }

  return picked.map(b => b.render());
}
