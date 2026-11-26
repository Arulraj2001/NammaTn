// scripts/youtube/engine/maths-shortcut-catalog.mjs
/**
 * VizhiTN 5-Second TNPSC Maths & Aptitude Shortcut Bank
 * Verified against 6th-10th Std Samacheer Kalvi Maths & TNPSC Group 4 / 2 PYQs.
 */

export const MATHS_SHORTCUT_CATALOG = [
  {
    id: 'maths-01-ci-si-2yr',
    topicTa: 'கூட்டு வட்டி vs தனி வட்டி (2 ஆண்டுகள்)',
    pyqRef: 'TNPSC Group 4 (2019, 2022) Repeat Question',
    questionTa: '₹5,000-க்கு 10% வட்டி வீதத்தில் 2 ஆண்டுகளில் தனி வட்டிக்கும் கூட்டு வட்டிக்கும் உள்ள வித்தியாசம் என்ன?',
    longMethodTa: 'SI = PNR/100 + CI = P(1+R/100)^2 - P போட்டு கழிக்க 2 நிமிடம் ஆகும்!',
    shortcutFormulaTa: 'வித்தியாசம் (D) = P × (R / 100)²',
    solvedStepTa: '5000 × (10/100)² = 5000 × (1/100) = ₹50 மட்டுமே!',
    answerTa: '₹50',
    spokenHookTa: '2 ஆண்டு தனி வட்டி கூட்டு வட்டி வித்தியாசம் கேட்டா இனி 2 நிமிஷம் போடாதீங்க! இந்த 5 செகண்ட் ஷார்ட்கட் பாருங்க!',
    spokenSolveTa: 'ஃபார்முலா ரொம்ப சிம்பிள்: P இன்டு R பை 100 ஹோல் ஸ்கொயர்! அதாவது 5000 இன்டு 1 பை 100 — ஒரே நொடியில் விடை 50 ரூபாய்! மறக்காம இந்த ரீல்ஸை Save பண்ணி வச்சுக்கோங்க!',
    tags: ['#TNPSCMaths', '#AptitudeTricks', '#SimpleInterest', '#CompoundInterest', '#TNPSCGroup4', '#Shorts']
  },
  {
    id: 'maths-02-lcm-hcf-product',
    topicTa: 'மீ.பொ.ம & மீ.பொ.வ (LCM × HCF)',
    pyqRef: 'TNPSC Group 4 (2022, 2024) Direct PYQ',
    questionTa: 'இரு எண்களின் மீ.பொ.ம 48, மீ.பொ.வ 8. ஓர் எண் 16 எனில் மற்றோர் எண் என்ன?',
    longMethodTa: 'காரணிப்படுத்தி ஒவ்வொரு எண்ணாக சோதனை செய்ய நேரமாகும்!',
    shortcutFormulaTa: 'மற்றோர் எண் = (LCM × HCF) ÷ முதல் எண்',
    solvedStepTa: '(48 × 8) ÷ 16 → 48 ÷ 2 = 24!',
    answerTa: '24',
    spokenHookTa: 'LCM HCF கணக்குல முதல் எண் கொடுத்து ரெண்டாவது எண் கேட்டா 3 நொடியில் விடை போடலாம்!',
    spokenSolveTa: 'இரு எண்களின் பெருக்கல் பலன் = LCM இன்டு HCF! அதாவது 48 பெருக்கல் 8 வகுத்தல் 16 — சுருக்கினால் ஒரே நொடியில் விடை 24! எக்ஸாம் ரிவிஷனுக்கு சேவ் பண்ணிக்கோங்க!',
    tags: ['#LCMHCF', '#TNPSCMaths', '#TNPSCGroup4', '#MathsShortcut', '#SamacheerKalvi', '#Shorts']
  },
  {
    id: 'maths-03-time-work-ab',
    topicTa: 'நேரம் மற்றும் வேலை (A & B இணைந்து)',
    pyqRef: 'TNPSC Group 2 & Group 4 Frequently Repeated',
    questionTa: 'A ஒரு வேலையை 10 நாளிலும், B அதே வேலையை 15 நாளிலும் முடிப்பார். இருவரும் சேர்ந்து முடிக்க எத்தனை நாட்கள்?',
    longMethodTa: '1/10 + 1/15 எடுத்து பின்ன கூட்டல் போடத் தேவையில்லை!',
    shortcutFormulaTa: 'இருவரும் சேர்ந்து = (A × B) ÷ (A + B)',
    solvedStepTa: '(10 × 15) ÷ (10 + 15) = 150 ÷ 25 = 6 நாட்கள்!',
    answerTa: '6 நாட்கள்',
    spokenHookTa: 'நேரம் மற்றும் வேலை கணக்கில் பின்ன கூட்டல் போட்டு குழப்பிக்காதீங்க! இந்த 5 செகண்ட் டிரிக் போதும்!',
    spokenSolveTa: 'மேலே ரெண்டு நம்பரையும் பெருக்குங்க: 10 பெருக்கல் 15 = 150. கீழே ரெண்டையும் கூட்டுங்க: 10 கூட்டல் 15 = 25. வகுத்தால் 6 நாட்கள்! இப்பவே சேவ் பண்ணுங்க!',
    tags: ['#TimeAndWork', '#TNPSCShortcut', '#TNPSCGroup4', '#AptitudeTamil', '#Shorts']
  },
  {
    id: 'maths-04-percentage-change',
    topicTa: 'சதவீதம் உயர்வு & குறைவு (Successive %)',
    pyqRef: 'TNPSC Police SI & Group 4 PYQ',
    questionTa: 'ஒரு பொருளின் விலை 20% உயர்த்தப்பட்டு, பின் 20% குறைக்கப்பட்டால் மொத்த மாற்றம் எத்தனை சதவீதம்?',
    longMethodTa: '100-ஐ எடுத்துக்கொண்டு 120, பிறகு 20% கழித்து 96 என இரண்டு ஸ்டெப் போட வேண்டாம்!',
    shortcutFormulaTa: 'சம உயர்வு & குறைவு (x%) = எப்போதும் (x² / 100)% நஷ்டம்!',
    solvedStepTa: '(20 × 20) ÷ 100 = 400 ÷ 100 = 4% குறைவு (Loss)!',
    answerTa: '4% குறைவு',
    spokenHookTa: 'ஒரு விலை 20% ஏறி 20% இறங்கினா மாற்றம் 0% நினைச்சீங்களா? தப்பு! இந்த ஷார்ட்கட் பாருங்க!',
    spokenSolveTa: 'ஒரே சதவீதம் உயர்ந்து குறைந்தால் எப்போதும் நஷ்டம்தான்! ஃபார்முலா: x ஸ்கொயர் பை 100! 20 பெருக்கல் 20 வகுத்தல் 100 = 4% குறைவு! 90% பேர் தப்பு பண்ற கேள்வி இது — சேவ் பண்ணுங்க!',
    tags: ['#PercentageTricks', '#TNPSCMaths', '#PoliceSI', '#TNPSCGroup4', '#Shorts']
  },
  {
    id: 'maths-05-sum-natural-numbers',
    topicTa: 'தொடர் இயல் எண்களின் கூடுதல்',
    pyqRef: '10th Samacheer Maths Ch-2 & TNPSC PYQ',
    questionTa: '1 + 2 + 3 + ... + 50 வரையிலான இயல் எண்களின் கூடுதல் என்ன?',
    longMethodTa: 'ஒவ்வொரு எண்ணாக கூட்டுவது சாத்தியமே இல்லை!',
    shortcutFormulaTa: 'கூடுதல் = n(n + 1) ÷ 2 (பாதி ஆக்கி அடுத்த நம்பரால் பெருக்கு!)',
    solvedStepTa: '50-ல் பாதி = 25 → 25 × 51 = 1,275!',
    answerTa: '1,275',
    spokenHookTa: '1 முதல் 50 வரை கூடுதல் கேட்டா பேனா இல்லாம 3 நொடியில் விடை சொல்லலாம்! எப்படி தெரியுமா?',
    spokenSolveTa: 'கடைசி நம்பர் 50-ஐ பாதியாக்குங்க 25. அதை அடுத்த நம்பர் 51-ஆல் பெருக்குங்க — விடை 1275! TNPSC-ல் அடிக்கடி கேட்கும் கேள்வி — மறக்காம Save பண்ணுங்க!',
    tags: ['#NumberSeries', '#SamacheerMaths', '#TNPSCGroup4', '#MentalMath', '#Shorts']
  },
  {
    id: 'maths-06-ratio-abc',
    topicTa: 'விகிதம் இணைப்பு (A:B:C Shortcut)',
    pyqRef: 'TNPSC Group 4 Ratio & Proportion PYQ',
    questionTa: 'A:B = 2:3 மற்றும் B:C = 4:5 எனில் A:B:C விகிதம் என்ன?',
    longMethodTa: 'LCM எடுத்து B-ஐ சமப்படுத்தி குழப்பிக்கொள்ளத் தேவையில்லை!',
    shortcutFormulaTa: 'தலைகீழ் N (Reverse N) முறை: நேராக → குறுக்காக → நேராக பெருக்கு!',
    solvedStepTa: '(2×4) : (4×3) : (3×5) = 8 : 12 : 15!',
    answerTa: '8 : 12 : 15',
    spokenHookTa: 'A:B மற்றும் B:C கொடுத்து A:B:C கேட்டா LCM எடுக்காதீங்க! இந்த "N" ஷார்ட்கட் 3 நொடியில் விடை தரும்!',
    spokenSolveTa: 'முதலில் நேராக 2×4 = 8. அடுத்து குறுக்காக 4×3 = 12. கடைசியில் நேராக 3×5 = 15. ஆக A:B:C = 8:12:15! இதை உடனே Save பண்ணி வச்சுக்கோங்க!',
    tags: ['#RatioAndProportion', '#TNPSCMaths', '#TNPSCGroup4', '#AptitudeTricks', '#Shorts']
  }
];

export function getMathsShortcutForRun(recentlyUsedIds = new Set()) {
  const pool = MATHS_SHORTCUT_CATALOG.filter(item => !recentlyUsedIds.has(item.id));
  const candidates = pool.length > 0 ? pool : MATHS_SHORTCUT_CATALOG;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return candidates[dayOfYear % candidates.length];
}
