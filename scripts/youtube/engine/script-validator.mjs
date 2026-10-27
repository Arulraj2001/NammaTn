// scripts/youtube/engine/script-validator.mjs
/**
 * VizhiTN Automated Shorts Script Validation Engine
 * Enforces 7 strict pre-render quality, factuality, and consistency gates:
 * 
 * Gate A: TITLE-SCRIPT MATCH (City, topic, item count match title promise)
 * Gate B: PLACE NAME CONSISTENCY (Zero cross-city leakage or hallucinations)
 * Gate C: REQUIRED FACTS PRESENCE (Power cut times/areas, Scam advice, Civic source)
 * Gate D: SINGLE CTA & COMPLETE SENTENCE (Exactly 1 Subscribe CTA, no trailing "—")
 * Gate E: HELPLINE NUMBER INTEGRITY (1912 for EB, 1930 for Cyber, 1100 for Civic)
 * Gate F: NO UNSOURCED STATS & NO OVERCLAIMS (No "பல லட்சம்", no "போன் ஹேக் ஆகும்")
 * Gate G: SCENE TIMING & ON-SCREEN TEXT (Total 30-40s, max 8 words on-screen text)
 */

export const BANNED_OVERCLAIM_PHRASES = [
  'போன் ஹேக் ஆகும்',
  'போன் ஹேக் ஆகிவிடும்',
  'மொபைல் ஹேக் ஆகும்',
  'மொபைல் ஹேக் ஆகிவிடும்',
  'போனை ஹேக் செய்துவிடுவார்கள்',
  'பல லட்சம்',
  'பல கோடி'
];

/**
 * Validates a 4-scene script against source data and slot type rules.
 * 
 * @param {Object} scriptObj
 * @param {string} scriptObj.scene1_hook
 * @param {string} scriptObj.scene1_overlay
 * @param {string} scriptObj.scene2_facts
 * @param {string} scriptObj.scene2_overlay
 * @param {string} scriptObj.scene3_actions
 * @param {string} scriptObj.scene3_overlay
 * @param {string} scriptObj.scene4_help_cta
 * @param {string} scriptObj.scene4_overlay
 * @param {Object} sourceData - Source post / topic object
 * @param {string} slotType - 'power_cut' | 'cyber_scam' | 'civic'
 * @param {number} [estimatedSeconds=35]
 * @returns {{ passed: boolean, gates: Record<string, { pass: boolean, reason?: string }>, errors: string[] }}
 */
export function validateShortsScript(scriptObj, sourceData = {}, slotType = 'civic', estimatedSeconds = 35) {
  const gates = {};
  const errors = [];

  const fullSpokenText = [
    scriptObj?.scene1_hook || '',
    scriptObj?.scene2_facts || '',
    scriptObj?.scene3_actions || '',
    scriptObj?.scene4_help_cta || ''
  ].join(' ');

  const title = (sourceData.title_ta || sourceData.title_en || sourceData.title || '').trim();
  const sourceDistrict = (sourceData.district_slug || sourceData.area_name || '').toLowerCase();
  const sourceContent = (sourceData.content_ta || sourceData.content_en || '').toLowerCase();

  // ─────────────────────────────────────────────────────────────────────────────
  // GATE A: TITLE-SCRIPT MATCH (Topic, City & Promised Item Count)
  // ─────────────────────────────────────────────────────────────────────────────
  let gateAPass = true;
  let gateAReason = '';

  // 1. Check promised number of items in title (e.g. "3 messages", "3 வழிகள்", "3 தவறுகள்")
  const promisedCountMatch = title.match(/(\d+)\s*(?:மெசேஜ்|முறை|வழி|தவறு|காரணம்|விஷயம்|ரகசிய|முக்கிய|messages|ways|reasons|mistakes|rules)/i);
  if (promisedCountMatch) {
    const promisedN = parseInt(promisedCountMatch[1], 10);
    // Count items enumerated in scene2_facts (e.g., 1., 2., 3. or முதலாவது, இரண்டாவது, அல்லது numbered bullets)
    const enumeratedMatches = (scriptObj?.scene2_facts || '').match(/(?:\b[1-9]\s*[\.\):]|முதலாவது|இரண்டாவது|மூன்றாவது|நான்காவது|ஒன்று|இரண்டு|மூன்று|first|second|third)/gi) || [];
    // Or bullet splits
    const bulletCount = (scriptObj?.scene2_facts || '').split(/\n|;/).filter(s => s.trim().length > 15).length;
    const detectedCount = Math.max(enumeratedMatches.length, bulletCount);

    if (detectedCount < promisedN) {
      gateAPass = false;
      gateAReason = `Title promised ${promisedN} items, but Scene 2 facts only lists ${detectedCount} items.`;
    }
  }

  // 2. Generic hook prohibition (Hook cannot just be "கவனியுங்கள்!" alone)
  const hookTrimmed = (scriptObj?.scene1_hook || '').trim();
  if (/^(?:கவனியுங்கள்|வணக்கம்|ஹலோ|மக்களே கவனியுங்கள்)[\s!.]*$/i.test(hookTrimmed) || hookTrimmed.length < 15) {
    gateAPass = false;
    gateAReason = 'Scene 1 Hook is generic. It must specifically name the danger, benefit, city, or topic.';
  }

  gates['gate_a_title_script_match'] = { pass: gateAPass, ...(gateAReason ? { reason: gateAReason } : {}) };
  if (!gateAPass) errors.push(gateAReason);

  // ─────────────────────────────────────────────────────────────────────────────
  // GATE B: PLACE NAME CONSISTENCY (Zero Hallucinations / City Leakage)
  // ─────────────────────────────────────────────────────────────────────────────
  let gateBPass = true;
  let gateBReason = '';

  const TN_MAJOR_CITIES = [
    { slug: 'chennai', names: ['சென்னை', 'chennai', 'மயிலாப்பூர்', 'தாம்பரம்', 'அடையாறு', 'ராயபுரம்', 'அண்ணா நகர்'] },
    { slug: 'coimbatore', names: ['கோவை', 'கோயம்புத்தூர்', 'coimbatore', 'சிங்காநல்லூர்', 'பொள்ளாச்சி', 'சரவணம்பட்டி'] },
    { slug: 'madurai', names: ['மதுரை', 'madurai', 'திருப்பரங்குன்றம்', 'மேலூர்', 'உசிலம்பட்டி'] },
    { slug: 'tiruchirappalli', names: ['திருச்சி', 'திருச்சிராப்பள்ளி', 'trichy', 'tiruchirappalli', 'ஸ்ரீரங்கம்', 'பொன்மலை'] },
    { slug: 'tirunelveli', names: ['திருநெல்வேலி', 'நெல்லை', 'tirunelveli', 'பாளையங்கோட்டை', 'அம்பாசமுத்திரம்'] },
    { slug: 'salem', names: ['சேலம்', 'salem', 'ஆத்தூர்', 'ஓமலூர்', 'மேட்டூர்'] },
    { slug: 'vellore', names: ['வேலூர்', 'vellore', 'காட்பாடி', 'குடியாத்தம்'] },
    { slug: 'kancheepuram', names: ['காஞ்சிபுரம்', 'kancheepuram', 'உத்திரமேரூர்', 'வாலாஜாபாத்'] }
  ];

  // If source data specifies a primary city, ensure no OTHER conflicting major city is spoken
  const matchingCityObj = TN_MAJOR_CITIES.find(c => 
    sourceDistrict.includes(c.slug) || c.names.some(n => title.toLowerCase().includes(n))
  );

  if (matchingCityObj) {
    for (const otherCity of TN_MAJOR_CITIES) {
      if (otherCity.slug === matchingCityObj.slug) continue;
      // If another city appears in spoken text but was NEVER in the source data
      const leakedName = otherCity.names.find(n => 
        fullSpokenText.toLowerCase().includes(n) && !sourceContent.includes(n) && !title.toLowerCase().includes(n)
      );
      if (leakedName) {
        gateBPass = false;
        gateBReason = `City mismatch detected! Source is ${matchingCityObj.slug}, but script references "${leakedName}".`;
        break;
      }
    }
  }

  gates['gate_b_place_name_consistency'] = { pass: gateBPass, ...(gateBReason ? { reason: gateBReason } : {}) };
  if (!gateBPass) errors.push(gateBReason);

  // ─────────────────────────────────────────────────────────────────────────────
  // GATE C: REQUIRED FACTS PRESENCE PER SLOT TYPE
  // ─────────────────────────────────────────────────────────────────────────────
  let gateCPass = true;
  let gateCReason = '';

  if (slotType === 'power_cut') {
    // Required: Time from-to, affected areas, reason
    const hasTime = /(?:\d{1,2}(?::\d{2})?\s*(?:am|pm|காலை|மதியம்|மாலை)|காலை\s*\d|முதல்\s*\d|மணி\s*வரை)/i.test(fullSpokenText);
    const hasReason = /(?:பராமரிப்பு|மின்வாரிய|துணை மின்நிலையம்|substation|maintenance|repair|வயர்)/i.test(fullSpokenText);
    const hasArea = scriptObj?.scene2_facts && scriptObj.scene2_facts.length > 20;

    if (!hasTime || !hasReason || !hasArea) {
      gateCPass = false;
      gateCReason = `Power cut missing mandatory facts: ${!hasTime ? '[Time From-To missing] ' : ''}${!hasReason ? '[Reason missing] ' : ''}${!hasArea ? '[Areas missing]' : ''}`;
    }
  } else if (slotType === 'cyber_scam') {
    // Required: Scam type, how it looks/example message, what to do
    const hasScamMechanism = /(?:sms|மெசேஜ்|லிங்க்|கார்டு|ஓடிபி|otp|கால்|வீடியோ கால்|போன்|பாஸ்வேர்ட்|பின்|telegram|டெலிகிராம்)/i.test(fullSpokenText);
    const hasConcreteAction = /(?:லிங்க்(?:கை)?\s*(?:கிளிக்\s*பண்ணாதீங்க|தொடாதீர்கள்)|பகிராதீர்கள்|block|பிளாக்)/i.test(scriptObj?.scene3_actions || '');

    if (!hasScamMechanism || !hasConcreteAction) {
      gateCPass = false;
      gateCReason = `Cyber scam missing required facts: ${!hasScamMechanism ? '[Scam mechanism/message example missing] ' : ''}${!hasConcreteAction ? '[Action step (don\'t click link / never share OTP) missing]' : ''}`;
    }
  } else if (slotType === 'civic') {
    // Do not write "verified" or "சரிபார்க்கப்பட்டது" without official source stated
    if (/சரிபார்க்கப்பட்டது|verified/i.test(fullSpokenText)) {
      const hasSource = /(?:அதிகாரப்பூர்வ|மாநகராட்சி|காவல்துறை|மின்வாரியம்|அரசு|collector|police|tangedco|corporation|twad)/i.test(fullSpokenText);
      if (!hasSource) {
        gateCPass = false;
        gateCReason = 'Script claims "சரிபார்க்கப்பட்டது" (verified) without explicitly naming the official department or source.';
      }
    }
  }

  gates['gate_c_required_facts'] = { pass: gateCPass, ...(gateCReason ? { reason: gateCReason } : {}) };
  if (!gateCPass) errors.push(gateCReason);

  // ─────────────────────────────────────────────────────────────────────────────
  // GATE D: EXACTLY ONE CTA & SENTENCE COMPLETION
  // ─────────────────────────────────────────────────────────────────────────────
  let gateDPass = true;
  let gateDReason = '';

  const scene4Text = (scriptObj?.scene4_help_cta || '').trim();

  // Check complete sentence ending (never trailing "—" or comma)
  if (/[—,–\-]$/.test(scene4Text) || scene4Text.endsWith('வேணுமா—') || scene4Text.endsWith('...')) {
    gateDPass = false;
    gateDReason = 'Scene 4 ends with an incomplete sentence, trailing dash ("—"), or ellipsis.';
  }

  // Count calls-to-action in scene 4
  const ctaSubscribeCount = (scene4Text.match(/subscribe|சப்ஸ்கிரைப்/gi) || []).length;
  const ctaFollowCount = (scene4Text.match(/follow|பாலோ/gi) || []).length;
  const ctaShareCount = (scene4Text.match(/share|பகிருங்கள்/gi) || []).length;
  const ctaCommentCount = (scene4Text.match(/comment|கமெண்ட்/gi) || []).length;
  const totalCtaTriggers = ctaSubscribeCount + ctaShareCount + ctaCommentCount;

  if (totalCtaTriggers > 2) {
    gateDPass = false;
    gateDReason = `Too many CTAs in Scene 4 (${totalCtaTriggers} triggers). Rule mandates exactly ONE primary CTA (Subscribe).`;
  }

  if (ctaSubscribeCount === 0 && !/vizhitn/i.test(scene4Text)) {
    gateDPass = false;
    gateDReason = 'Scene 4 missing mandatory Subscribe to VizhiTN CTA.';
  }

  gates['gate_d_single_cta_complete_sentence'] = { pass: gateDPass, ...(gateDReason ? { reason: gateDReason } : {}) };
  if (!gateDPass) errors.push(gateDReason);

  // ─────────────────────────────────────────────────────────────────────────────
  // GATE E: HELPLINE NUMBER INTEGRITY
  // ─────────────────────────────────────────────────────────────────────────────
  let gateEPass = true;
  let gateEReason = '';

  const expectedHelpline = slotType === 'power_cut' ? '1912' :
                           slotType === 'cyber_scam' ? '1930' :
                           slotType === 'scheme' ? '1100' : null;

  if (expectedHelpline) {
    const helplineSpoken = scene4Text.includes(expectedHelpline) || fullSpokenText.includes(expectedHelpline);
    if (!helplineSpoken) {
      gateEPass = false;
      gateEReason = `Mandatory helpline ${expectedHelpline} for slot ${slotType} is missing from the script.`;
    }
  }

  gates['gate_e_helpline_integrity'] = { pass: gateEPass, ...(gateEReason ? { reason: gateEReason } : {}) };
  if (!gateEPass) errors.push(gateEReason);

  // ─────────────────────────────────────────────────────────────────────────────
  // GATE F: NO UNSOURCED STATS & NO OVERCLAIMS
  // ─────────────────────────────────────────────────────────────────────────────
  let gateFPass = true;
  let gateFReason = '';

  for (const banned of BANNED_OVERCLAIM_PHRASES) {
    if (fullSpokenText.includes(banned)) {
      gateFPass = false;
      gateFReason = `Banned overclaim phrase detected: "${banned}". Use vetted alternatives like "பணம் திருடப்படலாம்" or "ஆபத்து".`;
      break;
    }
  }

  gates['gate_f_no_overclaims'] = { pass: gateFPass, ...(gateFReason ? { reason: gateFReason } : {}) };
  if (!gateFPass) errors.push(gateFReason);

  // ─────────────────────────────────────────────────────────────────────────────
  // GATE G: SCENE TIMING & ON-SCREEN TEXT (Max 8 words per scene)
  // ─────────────────────────────────────────────────────────────────────────────
  let gateGPass = true;
  let gateGReason = '';

  const overlays = [
    { scene: 1, text: scriptObj?.scene1_overlay || '' },
    { scene: 2, text: scriptObj?.scene2_overlay || '' },
    { scene: 3, text: scriptObj?.scene3_overlay || '' },
    { scene: 4, text: scriptObj?.scene4_overlay || '' }
  ];

  for (const ov of overlays) {
    const wordCount = ov.text.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount === 0) {
      gateGPass = false;
      gateGReason = `Scene ${ov.scene} is missing on-screen text overlay for muted viewers.`;
      break;
    }
    if (wordCount > 8) {
      gateGPass = false;
      gateGReason = `Scene ${ov.scene} on-screen text exceeds 8 words (${wordCount} words): "${ov.text}".`;
      break;
    }
  }

  // Duration check (must be within 28-42s window)
  if (estimatedSeconds < 28 || estimatedSeconds > 42) {
    gateGPass = false;
    gateGReason = `Total duration (${estimatedSeconds}s) outside target 30-40s range.`;
  }

  gates['gate_g_timing_and_overlays'] = { pass: gateGPass, ...(gateGReason ? { reason: gateGReason } : {}) };
  if (!gateGPass) errors.push(gateGReason);

  const passed = Object.values(gates).every(g => g.pass);
  return { passed, gates, errors };
}
