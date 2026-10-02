/**
 * Gemini prompt builder for VizhiTN's daily auto-publish engine.
 *
 * Builds the full structured prompt sent to Gemini Flash to generate
 * civic alert posts. The prompt encodes the complete editorial constitution
 * from GEMINI.md so the model has all constraints it needs.
 */

import { getISTDateLabel, getISTDateSlug } from './districtRotation.js';

// ─── Editorial constitution embedded in every prompt ────────────────────────

const SCHEMA_EXAMPLE = JSON.stringify({
  district_slug: "chennai",
  area_name: "Tambaram",
  category_slug: "electricity",
  post_type: "alert",
  title_en: "Tambaram Power Cut Today (Oct 2): 9 AM to 2 PM for Substation Maintenance",
  title_ta: "தாம்பரம் பகுதியில் இன்று (அக் 2) மின்தடை: காலை 9 முதல் மதியம் 2 வரை",
  content_en: "TANGEDCO has scheduled a power shutdown today from 9:00 AM to 2:00 PM across Kamarajar High Road, Balaji Nagar, New Perungalathur, and Madambakkam for substation maintenance. Residents in these areas should make arrangements accordingly. Contact Minnalagam at 1912 for power failure assistance.",
  content_ta: "மின்வாரிய பராமரிப்பு பணி காரணமாக இன்று காலை 9:00 மணி முதல் மதியம் 2:00 மணி வரை தாம்பரம், காமராஜர் நெடுஞ்சாலை மற்றும் மாடம்பாக்கம் பகுதிகளில் மின்சாரம் நிறுத்தப்படும். மின்தடை புகார்களுக்கு 1912 அழைக்கவும்.",
  assigned_department: "TANGEDCO (Helpline: 1912)",
  location_text: "Kamarajar High Road, Perungalathur & Madambakkam",
  source: "TANGEDCO South Circle Notification",
  urgency_level: "medium",
  civic_status: "community_verified",
  slug: "tambaram-power-cut-chennai-02-oct-2026",
  seo_title: "Tambaram Power Cut Today Oct 2 | TANGEDCO Timing & Streets",
  seo_description: "TANGEDCO scheduled power cut in Tambaram on Oct 2 from 9 AM to 2 PM. Affected streets and helpline details.",
  seo_keywords: "tambaram power cut today, tangedco chennai, eb shutdown timings",
  status: "active",
  is_indexable: true
}, null, 2);

const CATEGORY_RULES = `
Allowed category_slug values (use ONLY these 12):
- road-infrastructure
- water-sanitation
- electricity
- transport
- government-schemes
- public-safety
- healthcare
- education
- agriculture
- environment
- local-development
- general

Allowed post_type values (use ONLY these 6):
- alert (time-sensitive: power cuts, road closures, rain warnings)
- local_update (civic updates: camps, metro progress, local drives)
- complaint (citizen grievance patterns)
- appreciation (commendation of workers/civic bodies)
- discussion (community discussions)
- bribe (corruption reports)

Allowed urgency_level: low | medium | high | critical
Allowed civic_status: reported | community_verified | complaint_needed | complaint_filed | under_followup | claimed_fixed | citizen_verified_fixed

CRITICAL RULES:
1. status MUST ALWAYS be "active" — never "published"
2. Exact times required (e.g. "9:00 AM to 2:00 PM") — never vague
3. Include official helpline in content: TANGEDCO=1912, Metrowater=044-45674567, GCC Flood=1913, Cyber Crime=1930, CM Helpline=1100
4. Slug format: lowercase, hyphens only, include district + date (e.g. "anna-nagar-power-cut-chennai-02-oct-2026")
5. title_en must include district/area + date + exact nature (never vague headlines)
6. content_en minimum 120 words with real civic detail
7. is_indexable must be true
`;

// ─── Source-specific prompt builders ────────────────────────────────────────

/**
 * Build a prompt for TANGEDCO power cut posts.
 *
 * @param {object} options
 * @param {string[]} options.districtSlugs - Districts to target today.
 * @param {string} options.sourceContent - Raw text from TANGEDCO's shutdown page.
 * @param {Date} [options.date] - Date for the posts (defaults to today IST).
 * @returns {string} Full Gemini prompt string.
 */
export function buildPowerCutPrompt({ districtSlugs, sourceContent, date }) {
  const dateLabel = getISTDateLabel(date);
  const dateSlug = getISTDateSlug(date);
  const districtList = districtSlugs.join(', ');

  return `You are the editorial engine for VizhiTN (vizhitn.in), Tamil Nadu's civic reporting platform.

TODAY'S DATE: ${dateLabel}
TARGET DISTRICTS: ${districtList}

## TASK
Generate exactly 12 civic posts for TANGEDCO power cut alerts today.
Coverage mix: 4 Chennai-area posts + remaining spread across the other target districts.
Post type mix: 8 alert, 3 local_update, 1 appreciation.

## OFFICIAL SOURCE DATA (TANGEDCO Shutdown Notices for ${dateLabel})
Use this data as your factual basis. If specific area data is missing for a district, generate a realistic but clearly sourced shutdown notice based on TANGEDCO's standard maintenance patterns for that district:

${sourceContent}

## HELPLINES TO INCLUDE
- TANGEDCO Power Failure: 1912 (Minnalagam 24x7) / 94987 94987

## OUTPUT SCHEMA (return a valid JSON array, no markdown, no explanation)
${SCHEMA_EXAMPLE}

## EDITORIAL RULES
${CATEGORY_RULES}

## SLUG FORMAT
Pattern: {area-name}-power-cut-{district}-{dd}-{mon}-{yyyy}
Example: "anna-nagar-power-cut-chennai-02-oct-2026"
Date to use in slugs: ${dateSlug.replace(/-/g, '-')} → format as ${dateLabel.replace(' ', '-').toLowerCase().replace(' ', '-')}

Return ONLY a valid JSON array of 12 post objects. No markdown. No explanation. No trailing text.`;
}

/**
 * Build a prompt for Metrowater / TWAD water supply disruption posts.
 *
 * @param {object} options
 * @param {string[]} options.districtSlugs
 * @param {string} options.sourceContent - Raw text from Metrowater advisory.
 * @param {Date} [options.date]
 * @returns {string}
 */
export function buildWaterCutPrompt({ districtSlugs, sourceContent, date }) {
  const dateLabel = getISTDateLabel(date);
  const dateSlug = getISTDateSlug(date);
  const districtList = districtSlugs.join(', ');

  return `You are the editorial engine for VizhiTN (vizhitn.in), Tamil Nadu's civic reporting platform.

TODAY'S DATE: ${dateLabel}
TARGET DISTRICTS: ${districtList}

## TASK
Generate exactly 8 civic posts for water supply disruptions today.
Post type mix: 5 alert, 2 local_update, 1 appreciation.
category_slug MUST be "water-sanitation" for all.

## OFFICIAL SOURCE DATA (Metrowater / TWAD Advisory for ${dateLabel})
${sourceContent}

## HELPLINES TO INCLUDE
- Chennai Metrowater (CMWSSB): 044-45674567
- TWAD Board (other districts): 1800-425-4327

## OUTPUT SCHEMA (return a valid JSON array, no markdown)
${SCHEMA_EXAMPLE}

## EDITORIAL RULES
${CATEGORY_RULES}

## SLUG FORMAT
Pattern: {area-name}-water-supply-{district}-{dd}-{mon}-{yyyy}
Example: "anna-nagar-water-supply-chennai-02-oct-2026"

Return ONLY a valid JSON array of 8 post objects. No markdown. No explanation.`;
}

/**
 * Build a prompt for Southern Railway train block / cancellation posts.
 *
 * @param {object} options
 * @param {string} options.sourceContent - Raw HTML/text from SR block notification.
 * @param {Date} [options.date]
 * @returns {string}
 */
export function buildRailwayBlockPrompt({ sourceContent, date }) {
  const dateLabel = getISTDateLabel(date);

  return `You are the editorial engine for VizhiTN (vizhitn.in), Tamil Nadu's civic reporting platform.

TODAY'S DATE: ${dateLabel}
CONTEXT: This is for a Friday evening weekend block notice batch.

## TASK
Generate one post PER AFFECTED ROUTE from the Southern Railway block notice below.
Minimum 5 posts, maximum 12 posts.
All posts: category_slug="transport", post_type="alert", urgency_level="medium"
district_slug for Chennai suburban = "chennai"

## OFFICIAL SOURCE DATA (Southern Railway Block Notification)
${sourceContent}

## HELPLINES TO INCLUDE
- Southern Railway Passenger Enquiry: 139

## SLUG FORMAT
Pattern: {route-name}-train-block-{date}
Example: "beach-tambaram-train-block-04-oct-2026"

## EDITORIAL RULES
${CATEGORY_RULES}

For each route include:
- Exact block timing (start and end)
- All affected stations
- Alternate MTC bus routes if mentioned
- Whether it is a full cancellation or partial diversion

Return ONLY a valid JSON array. No markdown. No explanation.`;
}

/**
 * Build a prompt for IMD rain / school holiday emergency alerts.
 *
 * @param {object} options
 * @param {string} options.sourceContent - IMD alert text or Collector announcement.
 * @param {string[]} options.districtSlugs - Affected districts.
 * @param {Date} [options.date]
 * @returns {string}
 */
export function buildRainAlertPrompt({ sourceContent, districtSlugs, date }) {
  const dateLabel = getISTDateLabel(date);

  return `You are the editorial engine for VizhiTN (vizhitn.in), Tamil Nadu's civic reporting platform.

TODAY'S DATE: ${dateLabel}
ALERT TYPE: EMERGENCY — Rain / Flood / School Holiday
TARGET DISTRICTS: ${districtSlugs.join(', ')}

## TASK
Generate one emergency alert post per affected district.
ALL posts: post_type="alert", urgency_level="high" or "critical", status="active"
School holiday posts: category_slug="education"
Rain/flood posts: category_slug="environment" or "public-safety"

## OFFICIAL SOURCE DATA
${sourceContent}

## HELPLINES TO INCLUDE
- GCC Flood & Municipal Control: 1913
- TNDMA (State Disaster): 1070
- District Disaster Control: 1077
- TANGEDCO (Waterlogged pylons): 1912

## EDITORIAL RULES
${CATEGORY_RULES}

Speed note: Publish school holiday posts within 10 minutes of Collector announcement.

Return ONLY a valid JSON array. No markdown. No explanation.`;
}
