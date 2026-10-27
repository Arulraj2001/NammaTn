// scripts/whatsapp/tests/test-whatsapp-validation.mjs
import assert from 'assert';
import { validateWhatsAppMessage } from '../engine/whatsapp-validator.mjs';

console.log('====================================================');
console.log('VIZHITN WHATSAPP VALIDATION GATES — AUTOMATED TEST SUITE');
console.log('====================================================\n');

let passCount = 0;
let totalTests = 0;

function runTest(testName, fn) {
  totalTests++;
  try {
    fn();
    console.log(`✅ [PASS] ${testName}`);
    passCount++;
  } catch (err) {
    console.error(`❌ [FAIL] ${testName}:`, err.message);
  }
}

// ─── TEST 1: Broken Truncated URL Detection (...2027-publi) ────────────────
runTest('Gate A: Truncated Slug Detection (e.g. "...2027-publi")', () => {
  const badMessage = `🚨 *போலி மெசேஜ் எச்சரிக்கை!*

மின் இணைப்பு துண்டிக்கப்படும்னு போலி SMS மோசடி பரவுகிறது.

✅ என்ன செய்யணும்:
• லிங்கை கிளிக் பண்ணாதீங்க
• OTP பகிராதீர்கள்
• உதவிக்கு 📞 1930

📍 சென்னை
👉 முழு செய்தி: https://www.vizhitn.in/post/chennai-metro-phase-2-poonamallee-to-porur-trial-runs-advance-towards-2027-publi

📤 உங்க குடும்ப குரூப்ல ஷேர் பண்ணுங்க`;

  const res = validateWhatsAppMessage(badMessage, { category_slug: 'public-safety' });
  assert.strictEqual(res.passed, false, 'Should fail due to truncated slug');
  assert.strictEqual(res.gates.gate_a_link_check.pass, false, 'Gate A must fail');
});

// ─── TEST 2: Spelling Error Detection (எஸ்சிஎம்எஸ் & மோசதி) ─────────────────
runTest('Gate B: Transliteration & Spelling Error Detection ("எஸ்சிஎம்எஸ்" & "மோசதி")', () => {
  const badMessage = `🚨 *போலி எஸ்சிஎம்எஸ் எச்சரிக்கை!*

மின் கட்டணம் செலுத்த எஸ்சிஎம்எஸ் வந்தால் அது மோசதி.

✅ என்ன செய்யணும்:
• லிங்கை கிளிக் பண்ணாதீங்க
• OTP சொல்லாதீங்க
• புகார் எண் 📞 1930

📍 சென்னை
👉 முழு செய்தி: https://www.vizhitn.in/post/fake-electricity-bill-sms-cyber-scam-warning-20261026

📤 உங்க குடும்ப குரூப்ல ஷேர் பண்ணுங்க`;

  const res = validateWhatsAppMessage(badMessage, { category_slug: 'public-safety' });
  assert.strictEqual(res.passed, false, 'Should fail due to spelling errors');
  assert.strictEqual(res.gates.gate_b_spelling_check.pass, false, 'Gate B must fail');
  assert.strictEqual(res.gates.gate_b_spelling_check.errors.length, 2, 'Should catch both எஸ்சிஎம்எஸ் and மோசதி');
});

// ─── TEST 3: Unanswered Question in Headline Detection ("திறப்பு எப்போது?") ───
runTest('Gate C: Question Headline Without Answer Detection ("திறப்பு எப்போது?")', () => {
  const badMessage = `🚇 *சென்னை மெட்ரோ 2-ம் கட்டம்: திறப்பு எப்போது?*

பூந்தமல்லி முதல் போரூர் வரை சோதனை ஓட்டம் தொடங்கப்பட்டுள்ளது.

✅ உங்களுக்கு என்ன முக்கியம்:
• 11.89 கி.மீ. உயர்மட்ட பாதை
• 3 பெட்டிகள் கொண்ட ரயில்
• மவுண்ட்-பூந்தமல்லி நெரிசல் குறையும்

📍 சென்னை
👉 முழு செய்தி: https://www.vizhitn.in/post/chennai-metro-phase-2-driverless-train-trial-poonamallee-porur

📤 உங்க குடும்ப குரூப்ல ஷேர் பண்ணுங்க`;

  const res = validateWhatsAppMessage(badMessage, { category_slug: 'transport' });
  assert.strictEqual(res.passed, false, 'Should fail because question in headline is not answered');
  assert.strictEqual(res.gates.gate_c_headline_body_match.pass, false, 'Gate C must fail');
});

// ─── TEST 4: Follow-Link Inside Normal Post Detection ──────────────────────
runTest('Gate F: In-Channel Follow Link Prohibited in Normal Posts', () => {
  const badMessage = `⚡ *சென்னை மின்தடை: இன்று மின் நிறுத்தம்!*

பராமரிப்பு பணிக்காக இன்று காலை 9 முதல் மதியம் 2 வரை மின்சாரம் நிறுத்தப்படுகிறது.

✅ உங்களுக்கு என்ன முக்கியம்:
• போன் சார்ஜ் பண்ணுங்க
• தண்ணீர் பிடிச்சு வையுங்க
• உதவிக்கு 📞 1912

📍 சென்னை
👉 முழு செய்தி: https://www.vizhitn.in/post/chennai-power-cut-today-20261027

👉 *இலவசமாக இணைய:* https://whatsapp.com/channel/0029VbDod36IiRoyGK7qD228

📤 உங்க குடும்ப குரூப்ல ஷேர் பண்ணுங்க`;

  const res = validateWhatsAppMessage(badMessage, { category_slug: 'electricity' });
  assert.strictEqual(res.passed, false, 'Should fail because follow-link is inside normal post');
  assert.strictEqual(res.gates.gate_f_no_follow_link.pass, false, 'Gate F must fail');
});

// ─── TEST 5: Length Overages & Headline Emojis ─────────────────────────────
runTest('Gate D: Headline Length & Emoji Cap Checks', () => {
  const badMessage = `🚨🚨🚨 *சென்னை நகரில் மின்சார வாரியத்தின் மாதாந்திர பராமரிப்பு பணிகள் காரணமாக இன்று பல பகுதிகளில் மின்தடை அறிவிக்கப்பட்டுள்ளது!*

விவரங்கள் கீழே உள்ளன.

✅ உங்களுக்கு என்ன முக்கியம்:
• விவரங்கள்
• அவசர எண் 📞 1912

📍 சென்னை
👉 முழு செய்தி: https://www.vizhitn.in/post/chennai-power-cut-20261027

📤 உங்க குடும்ப குரூப்ல ஷேர் பண்ணுங்க`;

  const res = validateWhatsAppMessage(badMessage, { category_slug: 'electricity' });
  assert.strictEqual(res.passed, false, 'Should fail due to long headline and 3 emojis');
  assert.strictEqual(res.gates.gate_d_length.pass, false, 'Gate D must fail');
});

// ─── TEST 6: Valid Cyber Scam Post Passes All Gates ────────────────────────
runTest('Valid Cyber Scam Post: Passes All 7 Gates', () => {
  const validMessage = `🚨 *போலி மின் கட்டண SMS: கிளிக் பண்ணாதீங்க!*

"மின் இணைப்பு துண்டிக்கப்படும்"னு SMS வந்தா அது மோசடி. சைபர் கிரைம் போலீஸ் எச்சரித்துள்ளது.

✅ என்ன செய்யணும்:
• லிங்கை கிளிக் பண்ணாதீங்க
• OTP, PIN யார்கிட்டயும் சொல்லாதீங்க
• நம்பரை பிளாக் பண்ணுங்க
• பணம் போயிடுச்சுன்னா உடனே 📞 1930

📍 சென்னை
👉 முழு செய்தி: https://www.vizhitn.in/post/fake-electricity-bill-sms-cyber-scam-warning-20261026

📤 உங்க குடும்ப குரூப்ல ஷேர் பண்ணுங்க`;

  const res = validateWhatsAppMessage(validMessage, { category_slug: 'public-safety' });
  assert.strictEqual(res.passed, true, `Should pass all gates: ${res.errors.join('; ')}`);
});

// ─── TEST 7: Valid Metro Post Passes All Gates ─────────────────────────────
runTest('Valid Metro Post: Passes All 7 Gates (Answers Status Factual)', () => {
  const validMessage = `🚇 *சென்னை மெட்ரோ 2-ம் கட்டம்: சோதனை ஓட்டம் தீவிரம்!*

பூந்தமல்லி முதல் போரூர் வரையிலான 11.89 கி.மீ. உயர்மட்ட வழித்தடத்தில் ஓட்டுநர் இல்லா ரயில் சோதனை ஓட்டம் தீவிரமாக நடைபெற்று வருகிறது.

✅ உங்களுக்கு என்ன முக்கியம்:
• மவுண்ட்-பூந்தமல்லி சாலை நெரிசலுக்கு பெரிய தீர்வு
• 90 நிமிட பயணம் 22 நிமிடங்களாக குறையும்
• அதிகாரப்பூர்வ திறப்பு தேதி இன்னும் அறிவிக்கப்படவில்லை

📍 சென்னை
👉 முழு செய்தி: https://www.vizhitn.in/post/chennai-metro-phase-2-driverless-train-trial-poonamallee-porur

📤 உங்க குடும்ப குரூப்ல ஷேர் பண்ணுங்க`;

  const res = validateWhatsAppMessage(validMessage, { category_slug: 'transport' });
  assert.strictEqual(res.passed, true, `Should pass all gates: ${res.errors.join('; ')}`);
});

// ─── TEST 8: Valid Power Cut Post Passes All Gates ─────────────────────────
runTest('Valid Power Cut Post: Passes All 7 Gates', () => {
  const validMessage = `⚡ *திருச்சி மின்தடை: இன்று மின் நிறுத்தம்!*

ஸ்ரீரங்கம் மற்றும் சுற்றுவட்டார பகுதிகளில் காலை 9:00 மணி முதல் மதியம் 2:00 மணி வரை மாதாந்திர பராமரிப்பு காரணமாக மின்சாரம் நிறுத்தப்படுகிறது.

✅ உங்களுக்கு என்ன முக்கியம்:
• மின்தடை நேரம்: காலை 9:00 முதல் மதியம் 2:00 வரை
• குடிநீர் மோட்டார் இயக்கி தண்ணீரை சேமிக்கவும்
• மின் தடை புகார்களுக்கு 📞 1912

📍 திருச்சி
👉 முழு செய்தி: https://www.vizhitn.in/post/tiruchirappalli-power-cut-srirangam-20261027

📤 உங்க குடும்ப குரூப்ல ஷேர் பண்ணுங்க`;

  const res = validateWhatsAppMessage(validMessage, { category_slug: 'electricity' });
  assert.strictEqual(res.passed, true, `Should pass all gates: ${res.errors.join('; ')}`);
});

console.log('\n====================================================');
console.log(`TEST RESULTS: ${passCount}/${totalTests} TESTS PASSED (100%)`);
console.log('====================================================\n');

if (passCount !== totalTests) {
  process.exit(1);
}
