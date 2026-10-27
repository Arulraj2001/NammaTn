// scripts/youtube/tests/test-shorts-validation.mjs
/**
 * Test Suite for VizhiTN Shorts Script Validation Gates
 * Validates Gates A through G including deliberate failure cases:
 * - Tiruchirappalli vs Thirunelveli mismatch
 * - "3 messages promised but 2 listed" count mismatch
 * - Banned overclaim "போன் ஹேக் ஆகும்" or "பல லட்சம்"
 * - Incomplete CTA trailing dash "வேணுமா—"
 * - Missing required facts
 * - Over-length overlay text (>8 words)
 * - Complete passing cases
 */

import { validateShortsScript, BANNED_OVERCLAIM_PHRASES } from '../engine/script-validator.mjs';

function runTests() {
  console.log('====================================================');
  console.log('VIZHITN SHORTS VALIDATION GATES — AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(testName, condition, detail = '') {
    totalTests++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ [FAIL] ${testName} - ${detail}`);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 1: City Mismatch (Gate B)
  // Title / source says Tiruchirappalli, but script mentions Thirunelveli
  // ──────────────────────────────────────────────────────────────────────────
  const test1Script = {
    scene1_hook: 'திருச்சியில் இன்று முக்கியமான மின் தடை அறிவிப்பு வந்துள்ளது!',
    scene1_overlay: 'திருச்சி இன்று பவர் கட் அறிவிப்பு!',
    scene2_facts: 'இன்று காலை 9 முதல் மதியம் 2 வரை திருநெல்வேலி மற்றும் அதை சுற்றியுள்ள பகுதிகளில் பராமரிப்பு பணி நடக்கிறது.',
    scene2_overlay: 'காலை 9 முதல் 2 வரை',
    scene3_actions: 'போன் இன்வெர்ட்டரை உடனே சார்ஜ் பண்ணுங்க. தண்ணீரை சேமித்து வையுங்கள்.',
    scene3_overlay: 'போன் இன்வெர்ட்டர் சார்ஜ் பண்ணுங்க',
    scene4_help_cta: 'மின்தடை புகார்களுக்கு 1912-ஐ அழையுங்க. தினசரி உண்மை எச்சரிக்கைகளுக்கு VizhiTN-ஐ Subscribe பண்ணுங்க!',
    scene4_overlay: 'உதவி எண்: 1912 | Subscribe'
  };
  const test1Source = {
    title_ta: 'Tiruchirappalli பகுதியில் இன்று Power Cut அறிவிப்பு!',
    district_slug: 'tiruchirappalli',
    area_name: 'Tiruchirappalli'
  };
  const test1Result = validateShortsScript(test1Script, test1Source, 'power_cut', 34);
  assert(
    'Gate B: City Mismatch Detection (Tiruchirappalli vs Thirunelveli)',
    test1Result.gates.gate_b_place_name_consistency.pass === false &&
    test1Result.gates.gate_b_place_name_consistency.reason.includes('City mismatch detected'),
    JSON.stringify(test1Result.gates.gate_b_place_name_consistency)
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 2: Item Count Mismatch (Gate A)
  // Title promises "3 மெசேஜ்கள்" (3 messages), but facts lists only 2
  // ──────────────────────────────────────────────────────────────────────────
  const test2Script = {
    scene1_hook: 'உங்கள் வங்கி கணக்கு காலியாகும் 3 ஆபத்தான மெசேஜ்கள் இதோ!',
    scene1_overlay: 'வங்கி கணக்கு பணம் காலி உஷார்!',
    scene2_facts: 'முதலாவது மெசேஜ்: மின் கட்டணம் கட்டவில்லை என வரும் போலி எஸ்எம்எஸ். இரண்டாவது மெசேஜ்: பகுதி நேர வேலை மோசடி லிங்க்.',
    scene2_overlay: 'போலி SMS லிங்க் தொடாதீர்கள்!',
    scene3_actions: 'அறிமுகமில்லாத லிங்குகளை தொடாதீர்கள். ஓடிபி மற்றும் பின்னை பகிராதீர்கள். எண்ணை பிளாக் செய்யுங்கள்.',
    scene3_overlay: 'OTP பகிராதீர்கள் | Block செய்யவும்',
    scene4_help_cta: 'சைபர் புகாருக்கு 1930 எண்ணை அழையுங்கள். விழிப்புணர்வுக்கு VizhiTN-ஐ Subscribe பண்ணுங்க!',
    scene4_overlay: 'சைபர் உதவி: 1930 | Subscribe'
  };
  const test2Source = {
    title_ta: 'உங்கள் வங்கி கணக்கு காலி! இந்த 3 மெசேஜ்களை நம்பாதீர்கள்!',
    district_slug: 'chennai'
  };
  const test2Result = validateShortsScript(test2Script, test2Source, 'cyber_scam', 35);
  assert(
    'Gate A: Promised Item Count Mismatch (Promised 3, Listed 2)',
    test2Result.gates.gate_a_title_script_match.pass === false &&
    test2Result.gates.gate_a_title_script_match.reason.includes('promised 3 items'),
    JSON.stringify(test2Result.gates.gate_a_title_script_match)
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 3: Banned Overclaim & Unsourced Stats (Gate F)
  // Script contains "போன் ஹேக் ஆகிவிடும்" and "பல லட்சம்"
  // ──────────────────────────────────────────────────────────────────────────
  const test3Script = {
    scene1_hook: 'போனுக்கு வரும் லிங்குகளை தொட்டால் பல லட்சம் ரூபாய் பறிபோகும் ஆபத்து!',
    scene1_overlay: 'வங்கி கணக்கு பணம் காலி உஷார்!',
    scene2_facts: 'இந்த லிங்கை கிளிக் செய்தால் உங்கள் போன் ஹேக் ஆகிவிடும் என எச்சரிக்கை விடுக்கப்பட்டுள்ளது.',
    scene2_overlay: 'போலி SMS தொடாதீர்கள்',
    scene3_actions: 'லிங்குகளை தொடாதீர்கள். ஓடிபி பகிராதீர்கள். எண்ணை பிளாக் செய்யுங்கள்.',
    scene3_overlay: 'OTP பகிராதீர்கள் Block செய்யுங்கள்',
    scene4_help_cta: 'புகாருக்கு 1930 எண்ணை அழையுங்கள். VizhiTN-ஐ Subscribe பண்ணுங்க!',
    scene4_overlay: 'உதவி எண்: 1930 | Subscribe'
  };
  const test3Result = validateShortsScript(test3Script, { title: 'மோசடி எச்சரிக்கை' }, 'cyber_scam', 33);
  assert(
    'Gate F: Banned Overclaim Detection ("போன் ஹேக் ஆகிவிடும்" & "பல லட்சம்")',
    test3Result.gates.gate_f_no_overclaims.pass === false &&
    test3Result.gates.gate_f_no_overclaims.reason.includes('Banned overclaim phrase detected'),
    JSON.stringify(test3Result.gates.gate_f_no_overclaims)
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 4: Trailing Dash / Incomplete Sentence (Gate D)
  // Scene 4 ends with trailing dash "வேணுமா—"
  // ──────────────────────────────────────────────────────────────────────────
  const test4Script = {
    scene1_hook: 'சென்னை தாம்பரம் பகுதியில் இன்று மின் தடை அறிவிப்பு வந்துள்ளது!',
    scene1_overlay: 'தாம்பரம் இன்று பவர் கட்!',
    scene2_facts: 'இன்று காலை 9:00 முதல் மதியம் 2:00 மணி வரை பராமரிப்பு பணி காரணமாக மின்சாரம் நிறுத்தப்படுகிறது.',
    scene2_overlay: 'காலை 9:00 முதல் 2:00 வரை',
    scene3_actions: 'போன் இன்வெர்ட்டரை உடனே சார்ஜ் பண்ணுங்க. தண்ணீரை சேமித்து வையுங்கள்.',
    scene3_overlay: 'போன் இன்வெர்ட்டர் சார்ஜ் பண்ணுங்க',
    scene4_help_cta: 'புகாருக்கு 1912-ஐ அழையுங்கள். தினசரி எச்சரிக்கைகளுக்கு VizhiTN-ஐ Subscribe பண்ணுங்க! அடுத்த செய்தி தெரிஞ்சுக்க வேணுமா—',
    scene4_overlay: 'உதவி: 1912 | Subscribe'
  };
  const test4Result = validateShortsScript(test4Script, { district_slug: 'chennai', area_name: 'தாம்பரம்' }, 'power_cut', 33);
  assert(
    'Gate D: Trailing Dash / Incomplete Sentence Detection ("வேணுமா—")',
    test4Result.gates.gate_d_single_cta_complete_sentence.pass === false &&
    test4Result.gates.gate_d_single_cta_complete_sentence.reason.includes('incomplete sentence'),
    JSON.stringify(test4Result.gates.gate_d_single_cta_complete_sentence)
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 5: Over-length On-Screen Text (Gate G)
  // Scene 1 overlay has 10 words (max allowed is 8 words)
  // ──────────────────────────────────────────────────────────────────────────
  const test5Script = {
    scene1_hook: 'மதுரை பகுதியில் இன்று மிக முக்கியமான குடிநீர் குழாய் சீரமைப்பு பணி நடக்கிறது!',
    scene1_overlay: 'மதுரை பகுதியில் இன்று மிக முக்கியமான குடிநீர் குழாய் சீரமைப்பு பணி நடக்கிறது உஷார்', // 10 words
    scene2_facts: 'இன்று காலை 10 மணி முதல் குடிநீர் விநியோகம் நிறுத்தம் என அறிவிக்கப்பட்டுள்ளது.',
    scene2_overlay: 'காலை 10 மணி முதல் நிறுத்தம்',
    scene3_actions: 'முன்கூட்டியே தண்ணீரை பிடித்து சேமித்து வையுங்கள்.',
    scene3_overlay: 'தண்ணீரை சேமித்து வையுங்கள்',
    scene4_help_cta: 'உதவிக்கு 1100-ஐ அழையுங்கள். உண்மை தகவல்களுக்கு VizhiTN-ஐ Subscribe பண்ணுங்க!',
    scene4_overlay: 'உதவி: 1100 | Subscribe'
  };
  const test5Result = validateShortsScript(test5Script, { district_slug: 'madurai' }, 'civic', 32);
  assert(
    'Gate G: Over-length On-screen Text (10 words > 8 words limit)',
    test5Result.gates.gate_g_timing_and_overlays.pass === false &&
    test5Result.gates.gate_g_timing_and_overlays.reason.includes('exceeds 8 words'),
    JSON.stringify(test5Result.gates.gate_g_timing_and_overlays)
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 6: Valid Power Cut Full Script (MUST PASS ALL GATES)
  // ──────────────────────────────────────────────────────────────────────────
  const test6Script = {
    scene1_hook: 'சென்னை தாம்பரம் பகுதியில் இன்று முக்கியமான மின் தடை அறிவிப்பு வந்துள்ளது, கவனியுங்கள்!',
    scene1_overlay: 'தாம்பரம் இன்று மின் தடை!',
    scene2_facts: 'இன்று காலை 9:00 முதல் மதியம் 2:00 மணி வரை துணை மின்நிலைய பராமரிப்பு பணி காரணமாக காமராஜர் நகர் மற்றும் சுற்றுவட்டார பகுதிகளில் மின்சாரம் நிறுத்தப்படுகிறது.',
    scene2_overlay: 'காலை 9:00 முதல் 2:00 வரை',
    scene3_actions: 'மின் தடைக்கு முன் போன் மற்றும் இன்வெர்ட்டரை சார்ஜ் பண்ணுங்க. குடிநீர் மோட்டார் பணிகளை முன்கூட்டியே முடித்து தண்ணீரை சேமித்து வையுங்கள்.',
    scene3_overlay: 'போன், இன்வெர்ட்டர் சார்ஜ் பண்ணுங்க',
    scene4_help_cta: 'மின்தடை புகார்களுக்கு மின்னகம் உதவி எண் 1912-ஐ அழையுங்கள். இது போன்ற உண்மை எச்சரிக்கைகளுக்கு VizhiTN-ஐ Subscribe பண்ணுங்க!',
    scene4_overlay: 'உதவி: 1912 | Subscribe'
  };
  const test6Source = {
    title_ta: 'தாம்பரம் பகுதியில் இன்று மின்தடை அறிவிப்பு',
    district_slug: 'chennai',
    area_name: 'தாம்பரம்',
    content_ta: 'காலை 9:00 மணி முதல் மதியம் 2:00 வரை பராமரிப்பு பணி'
  };
  const test6Result = validateShortsScript(test6Script, test6Source, 'power_cut', 35);
  assert(
    'Valid Power Cut Script: Passes All 7 Gates',
    test6Result.passed === true,
    test6Result.errors.join(', ')
  );

  // ──────────────────────────────────────────────────────────────────────────
  // TEST 7: Valid Cyber Scam Full Script (MUST PASS ALL GATES)
  // ──────────────────────────────────────────────────────────────────────────
  const test7Script = {
    scene1_hook: 'உங்கள் வங்கி கணக்கில் இருந்து பணம் பறிபோகும் புதிய மெசேஜ் மோசடி, உஷாரா இருங்க!',
    scene1_overlay: 'வங்கி கணக்கு பணம் காலி உஷார்!',
    scene2_facts: 'மின் கட்டணம் நிலுவை என வரும் போலி எஸ்எம்எஸ் லிங்குகளை கிளிக் செய்தால் பணம் திருடப்படலாம் என காவல்துறை எச்சரித்துள்ளது.',
    scene2_overlay: 'போலி SMS லிங்க் தொடாதீர்கள்!',
    scene3_actions: 'அறிமுகமில்லாத எண்களில் இருந்து வரும் சந்தேகத்திற்குரிய லிங்குகளை தொடாதீர்கள். உங்கள் ஓடிபி அல்லது ஏடிஎம் பின்னை ஒருபோதும் பகிராதீர்கள். அந்த எண்ணை உடனே பிளாக் செய்யுங்கள்.',
    scene3_overlay: 'OTP பகிராதீர்கள் | Block செய்யவும்',
    scene4_help_cta: 'பணம் போனால் உடனடியாக தேசிய சைபர் கிரைம் உதவி எண் 1930-ஐ அழையுங்கள். புதிய மோசடி எச்சரிக்கைகளுக்கு VizhiTN-ஐ Subscribe பண்ணுங்க!',
    scene4_overlay: 'சைபர் உதவி: 1930 | Subscribe'
  };
  const test7Source = {
    title_ta: 'வங்கி கணக்கு பணம் காலி! போலி மெசேஜ் உஷார்!',
    district_slug: 'chennai',
    content_ta: 'சைபர் கிரைம் எச்சரிக்கை எஸ்எம்எஸ் லிங்க் மோசடி'
  };
  const test7Result = validateShortsScript(test7Script, test7Source, 'cyber_scam', 34);
  assert(
    'Valid Cyber Scam Script: Passes All 7 Gates',
    test7Result.passed === true,
    test7Result.errors.join(', ')
  );

  console.log(`\n====================================================`);
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

runTests();
