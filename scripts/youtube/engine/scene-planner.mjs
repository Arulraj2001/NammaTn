// scripts/youtube/engine/scene-planner.mjs
// Structured Scene-Planning & Visual Beat Engine for VizhiTN Video Pipelines
// Converts raw narrative into structured, semantic visual scene specifications.

export const SCENE_TYPES = {
  HOOK: 'HOOK',                             // High-contrast opening visual beat with headline
  BROLL_OVERLAY: 'BROLL_OVERLAY',           // Real footage / dynamic photo with lower-third commentary
  STAT_CARD: 'STAT_CARD',                   // Infographic data card highlighting key numbers & metrics
  DOCUMENT_EVIDENCE: 'DOCUMENT_EVIDENCE',   // Official government/legal order, circular or RTI excerpt
  STEP_GUIDE: 'STEP_GUIDE',                 // Actionable step-by-step citizen procedure
  QUOTE_CALLOUT: 'QUOTE_CALLOUT',           // Direct quote from an official authority or victim
  CHAPTER_TITLE: 'CHAPTER_TITLE',           // Full-screen chapter introduction
  ACTION_OUTRO: 'ACTION_OUTRO'              // Official helpline and vizhitn.in citizen reporting CTA
};

/**
 * Plans a multi-beat Shorts sequence (4 to 5 distinct visual scenes)
 * Eliminates single-slide repetition and ensures visual cuts every 6-12 seconds.
 *
 * @param {Object} params
 * @param {Array} params.posts - Sourced posts (1 lead + 2 secondary)
 * @param {Object} params.theme - Category theme { color, icon, label }
 * @param {string} params.area - Focus locality/district
 * @param {string} params.helpline - Official helpline number
 * @returns {Array<Object>} Structured scene specifications
 */
export function planShortsScenes({ posts, theme, area, helpline, leadPost }) {
  const p = leadPost || posts[0] || {};
  const isUrgent = p.urgency_level === 'critical' || p.urgency_level === 'high';
  const category = p.category_slug || 'general';

  // 1. Scene 1: The Urgent Hook (0-8s)
  const scene1 = {
    index: 0,
    sceneType: SCENE_TYPES.HOOK,
    purpose: 'Immediate mobile viewer hook within 3 seconds',
    visualType: 'cinematic_photo_overlay',
    template: 'shorts/scene-1-hook.html',
    aspectRatio: '9:16',
    suggestedDurationSec: 8,
    transition: 'fade',
    headlineTa: p.title_ta || p.title_en || 'இன்றைய முக்கிய அவசர அறிவிப்பு',
    urgencyBadge: isUrgent ? 'அவசர அறிவிப்பு' : 'நேரடி தகவல்',
    urgencyClass: isUrgent ? 'pill-critical' : 'pill-alert',
    locationText: `${area} | தமிழ்நாடு`,
    assetSearchQuery: `${category} infrastructure public service Tamil Nadu`,
    attribution: p.assigned_department || 'Tamil Nadu Government',
    elements: ['headline', 'category_pill', 'live_badge', 'district_pin']
  };

  // 2. Scene 2: Ground Reality / Context B-Roll (8-18s)
  const scene2 = {
    index: 1,
    sceneType: SCENE_TYPES.BROLL_OVERLAY,
    purpose: 'Show contextual footage or high-motion photographic plate of the location',
    visualType: 'broll_video_or_motion_plate',
    template: 'shorts/scene-broll-overlay.html',
    aspectRatio: '9:16',
    suggestedDurationSec: 10,
    transition: 'wipe',
    headlineTa: `${area} கள நிலவரம்`,
    subHeadlineTa: p.location_text || 'பாதிக்கப்பட்ட முக்கிய பகுதிகள் மற்றும் விவரங்கள்',
    assetSearchQuery: `${category} road city traffic Tamil Nadu`,
    attribution: `Source: ${p.source || p.assigned_department || 'District Administration'}`,
    elements: ['lower_third', 'department_tag', 'motion_broll']
  };

  // 3. Scene 3: Data & Breakdown / Stat Card (18-32s)
  const statMetric = p.category_slug === 'electricity' ? '1912' :
                     p.category_slug === 'water-sanitation' ? '1913' :
                     p.urgency_level === 'critical' ? 'ALERT' : 'VERIFIED';
  const statLabel = p.category_slug === 'electricity' ? 'மின் தடை நேரம் & பகுதிகள்' :
                    p.category_slug === 'water-sanitation' ? 'குடிநீர் விநியோக அறிவிப்பு' :
                    'நிர்வாக சரிபார்ப்பு நிலை';

  const scene3 = {
    index: 2,
    sceneType: SCENE_TYPES.STAT_CARD,
    purpose: 'Data breakdown of multiple affected areas and metrics',
    visualType: 'infographic_stat_card',
    template: 'shorts/scene-stat-card.html',
    aspectRatio: '9:16',
    suggestedDurationSec: 14,
    transition: 'slide_up',
    headlineTa: 'முக்கிய புள்ளிவிவரங்கள் & பகுதிகள்',
    statMetric,
    statLabel,
    postsList: posts,
    elements: ['metric_badge', 'affected_areas_list', 'civic_status_pill']
  };

  // 4. Scene 4: Rights & Action Helpline Outro (32-48s)
  const scene4 = {
    index: 3,
    sceneType: SCENE_TYPES.ACTION_OUTRO,
    purpose: 'Official helpline action step and vizhitn.in citizen reporting call to action',
    visualType: 'branded_action_card',
    template: 'shorts/scene-3-helpline.html',
    aspectRatio: '9:16',
    suggestedDurationSec: 14,
    transition: 'fade',
    headlineTa: 'உங்கள் பகுதியில் புகார் செய்ய',
    helplineNumber: helpline,
    portalUrl: 'vizhitn.in',
    elements: ['helpline_box', 'qr_link', 'portal_button', 'civic_mission_notice']
  };

  return [scene1, scene2, scene3, scene4];
}

/**
 * Plans a Rights & Dispute Guide Shorts sequence (5 distinct visual beats)
 * Step-by-step actionable guide for citizens facing corrupt officials or service denials.
 */
export function planRightsShortsScenes({ guide, helpline }) {
  return [
    {
      index: 0,
      sceneType: SCENE_TYPES.HOOK,
      purpose: 'Citizen grievance hook — "Can they deny you this?"',
      template: 'shorts/scene-1-hook.html',
      headlineTa: guide.hookTa,
      urgencyBadge: 'சட்ட உரிமை வழிகாட்டி',
      urgencyClass: 'pill-alert',
      suggestedDurationSec: 8
    },
    {
      index: 1,
      sceneType: SCENE_TYPES.DOCUMENT_EVIDENCE,
      purpose: 'The Official Government Rule / GO clause',
      template: 'shorts/scene-stat-card.html',
      headlineTa: guide.ruleTitleTa || 'அரசாணை மற்றும் விதிமுறை',
      statMetric: guide.goNumber || 'G.O.',
      statLabel: 'அதிகாரப்பூர்வ அரசாணை எண்',
      suggestedDurationSec: 12
    },
    {
      index: 2,
      sceneType: SCENE_TYPES.STEP_GUIDE,
      purpose: 'Step 1 & Step 2 for citizen counter-action',
      template: 'shorts/scene-2-breakdown.html',
      headlineTa: 'நீங்கள் செய்ய வேண்டிய 3 படிகள்',
      steps: guide.actionStepsTa || [],
      suggestedDurationSec: 16
    },
    {
      index: 3,
      sceneType: SCENE_TYPES.ACTION_OUTRO,
      purpose: 'Helpline escalation and portal reporting',
      template: 'shorts/scene-3-helpline.html',
      headlineTa: 'உடனடி புகார் எண்கள்',
      helplineNumber: helpline,
      suggestedDurationSec: 14
    }
  ];
}

/**
 * Plans a Long-Form Documentary into 15–20 granular visual beats (~8–14 seconds each)
 * Replaces the 5-static-slide paradigm with true cinematic documentary pacing.
 *
 * @param {Object} params
 * @param {Object} params.article - tn_today article metadata
 * @param {Array} params.chapters - The 5 documentary acts from script-writer
 * @returns {Array<Object>} Sequence of visual scene specifications
 */
export function planLongFormScenes({ article, chapters }) {
  const scenes = [];
  let sceneCounter = 0;

  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    const actNumber = i + 1;
    const headlineTa = ch.headlineTa || ch.titleTa || `பகுதி ${actNumber}`;
    const headlineEn = ch.headlineEn || ch.titleEn || `Act ${actNumber}`;
    const narrationClauses = ch.narrationClauses || ch.narration || [];
    const facts = ch.facts || [];

    // Sub-beat A: Chapter Introduction Title Card (~10-12s)
    scenes.push({
      id: `act_${actNumber}_intro`,
      sceneIndex: sceneCounter++,
      actNumber,
      beatType: SCENE_TYPES.CHAPTER_TITLE,
      template: 'long-form/chapter-slide.html',
      headlineTa,
      headlineEn,
      categorySlug: article.category_slug || 'general',
      narrationSegment: narrationClauses.slice(0, 2),
      facts: facts.slice(0, 3),
      visualPrompt: `${article.category_slug || 'general'} infrastructure project documentary in Tamil Nadu, cinematic lighting`,
      estimatedDurationSec: 12
    });

    // Sub-beat B: Document Evidence or Data Stat Plate (~10-14s)
    if (actNumber === 2 || actNumber === 3) {
      scenes.push({
        id: `act_${actNumber}_evidence`,
        sceneIndex: sceneCounter++,
        actNumber,
        beatType: SCENE_TYPES.DOCUMENT_EVIDENCE,
        template: 'long-form/evidence-doc-slide.html',
        headlineTa: `ஆவணச் சான்று: ${headlineTa}`,
        headlineEn: `Official Record / Evidence: ${headlineEn}`,
        categorySlug: article.category_slug || 'general',
        narrationSegment: narrationClauses.slice(2, 4),
        evidenceTextTa: facts[0] || 'அரசு தணிக்கை அறிக்கை மற்றும் துறைசார் தகவல்கள்',
        department: article.department_name || 'Tamil Nadu Administration',
        estimatedDurationSec: 14
      });
    } else {
      scenes.push({
        id: `act_${actNumber}_data_stat`,
        sceneIndex: sceneCounter++,
        actNumber,
        beatType: SCENE_TYPES.STAT_CARD,
        template: 'long-form/data-stat-slide.html',
        headlineTa: `முக்கிய புள்ளிவிவர ஆய்வு: ${headlineTa}`,
        headlineEn: `Data Analysis: ${headlineEn}`,
        categorySlug: article.category_slug || 'general',
        narrationSegment: narrationClauses.slice(2, 4),
        metricTitle: 'பொது நிதி & திட்ட மதிப்பீடு',
        facts: facts.slice(0, 3),
        estimatedDurationSec: 12
      });
    }

    // Sub-beat C: Contextual B-Roll / Photographic Narrative (~10-14s)
    scenes.push({
      id: `act_${actNumber}_broll`,
      sceneIndex: sceneCounter++,
      actNumber,
      beatType: SCENE_TYPES.BROLL_OVERLAY,
      template: 'long-form/chapter-slide.html',
      headlineTa: `கள ஆய்வு மற்றும் சான்றுகள்: ${headlineTa}`,
      headlineEn: `Field Investigation: ${headlineEn}`,
      categorySlug: article.category_slug || 'general',
      narrationSegment: narrationClauses.slice(4),
      facts: facts.slice(2),
      visualPrompt: `Tamil Nadu civic investigation, realistic documentary b-roll of ${headlineEn}`,
      estimatedDurationSec: 14
    });
  }

  // Final Sub-beat: Branded Outro & Citizen Resolution
  scenes.push({
    id: 'documentary_outro',
    sceneIndex: sceneCounter++,
    actNumber: chapters.length + 1,
    beatType: SCENE_TYPES.ACTION_OUTRO,
    template: 'long-form/chapter-slide.html',
    headlineTa: 'மக்கள் குரல் — விழி தமிழ்நாடு',
    headlineEn: 'Citizen Action & Editorial Resolution',
    categorySlug: article.category_slug || 'general',
    narrationSegment: ['உங்கள் பகுதியில் உள்ள பிரச்சனைகளை ஆவணப்படுத்த vizhitn.in இணையதளத்தை அணுகவும்.'],
    facts: [
      `அதிகாரப்பூர்வ உதவி எண்: ${article.helpline || '1100 / 1912'}`,
      'Citizen Grievance Documentation Portal: vizhitn.in'
    ],
    estimatedDurationSec: 10
  });

  return scenes;
}
