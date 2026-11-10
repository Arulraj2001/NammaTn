// scripts/db/seed-tnpsc-portal.mjs
/**
 * Seeder script for TNPSC Portal
 * Populates tnpsc_question table with Samacheer Kalvi verified questions
 * and seeds site_settings catalogs as fallback.
 */

import { createClient } from '@supabase/supabase-js';

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hzgrzcablefquddisqkf.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!key) {
  console.error('No Supabase key found in environment.');
  process.exit(1);
}

const supabase = createClient(url, key);

const SEED_QUESTIONS = [
  // 1. Vallinam Migum Idangal (General Tamil)
  {
    id: 'tnpsc-tamil-vallinam-01',
    subject_slug: 'general-tamil',
    topic_slug: 'vallinam-migum-idangal',
    exam_slugs: ['group-4', 'group-2'],
    question_ta: 'கீழ்க்கண்டவற்றுள் வல்லினம் மிகும் இடத்தைக் கண்டறிக:',
    question_en: 'Identify the option where Vallinam (consonant hardening) must occur:',
    options: [
      { key: 'A', text: 'அந்தப் பையன்' },
      { key: 'B', text: 'அந்த பையன்' },
      { key: 'C', text: 'அவை பறந்தன' },
      { key: 'D', text: 'வாழ்க தமிழ்' }
    ],
    correct_key: 'A',
    explanation_ta: '‘அந்த, இந்த’ என்னும் சுட்டுத் திரிபுகளின் பின் வல்லினம் மிகும். எனவே ‘அந்த + பையன் = அந்தப் பையன்’ என்பது சரியான புணர்ச்சி ஆகும்.',
    book_citation: '10-ஆம் வகுப்பு தமிழ் - இயல் 4, பக்க எண் 82 (சமச்சீர் கல்வி)',
    pyq_reference: 'TNPSC Group 4 (2022) வினா எண் 12',
    pyq_year: 2022,
    difficulty: 'medium',
    is_daily_challenge: true
  },
  {
    id: 'tnpsc-tamil-vallinam-02',
    subject_slug: 'general-tamil',
    topic_slug: 'vallinam-migum-idangal',
    exam_slugs: ['group-4'],
    question_ta: 'இரண்டாம் வேற்றுமை உருபு (ஐ) வெளிப்படையாக வரும் தொடரில் வல்லினம் என்னவாகும்?',
    question_en: 'What happens to Vallinam when the 2nd case marker (Ai) appears overtly?',
    options: [
      { key: 'A', text: 'வல்லினம் மிகாது' },
      { key: 'B', text: 'வல்லினம் மிகும்' },
      { key: 'C', text: 'மெல்லினம் மிகும்' },
      { key: 'D', text: 'இடையினம் மிகும்' }
    ],
    correct_key: 'B',
    explanation_ta: 'இரண்டாம் வேற்றுமை உருபாகிய ‘ஐ’ வெளிப்படையாக வரும் தொடர்களில் வல்லினம் மிகும். (எ.கா: கதவைத் திற, பாடத்தைப் படி).',
    book_citation: '9 மற்றும் 10-ஆம் வகுப்பு தமிழ் இலக்கணப் பகுதி',
    pyq_reference: 'TNPSC Group 4 (2019) நேரடி வினா',
    pyq_year: 2019,
    difficulty: 'easy',
    is_daily_challenge: true
  },
  {
    id: 'tnpsc-tamil-vallinam-03',
    subject_slug: 'general-tamil',
    topic_slug: 'vallinam-migum-idangal',
    exam_slugs: ['group-4', 'group-2'],
    question_ta: '‘ஓடாக் குதிரை’ — இதில் வல்லினம் மிகுந்துள்ளதன் இலக்கண விதி என்ன?',
    question_en: 'In "Odak Kuthirai", which grammatical rule applies for consonant hardening?',
    options: [
      { key: 'A', text: 'வினைத்தொகை' },
      { key: 'B', text: 'ஈறுகெட்ட எதிர்மறைப் பெயரெச்சம்' },
      { key: 'C', text: 'உரிச்சொல் தொடர்' },
      { key: 'D', text: 'இரண்டாம் வேற்றுமைத் தொகை' }
    ],
    correct_key: 'B',
    explanation_ta: '‘ஓடாத குதிரை’ என்ற எதிர்மறைப் பெயரெச்சத்தில் ஈற்றுத் தகரம் கெட்டு ‘ஓடா’ என நின்றதால் இது ‘ஈறுகெட்ட எதிர்மறைப் பெயரெச்சம்’ ஆகும். இதன் பின் வல்லினம் மிகும் (ஓடாக் குதிரை).',
    book_citation: '10-ஆம் வகுப்பு தமிழ், பக்க எண் 83',
    pyq_reference: 'TNPSC Group 4 (2024) வினா எண் 45',
    pyq_year: 2024,
    difficulty: 'medium',
    is_daily_challenge: false
  },

  // 2. South Indian Rebellion 1801 (Unit 8)
  {
    id: 'tnpsc-unit8-south-indian-rebellion',
    subject_slug: 'unit-8',
    topic_slug: 'south-indian-rebellion-1801',
    exam_slugs: ['group-4', 'group-2'],
    question_ta: 'தென்னிந்திய புரட்சி (South Indian Rebellion) நடைபெற்ற ஆண்டு எது?',
    question_en: 'In which year did the South Indian Rebellion take place?',
    options: [
      { key: 'A', text: '1800 - 1801' },
      { key: 'B', text: '1806' },
      { key: 'C', text: '1857' },
      { key: 'D', text: '1799' }
    ],
    correct_key: 'A',
    explanation_ta: 'மருது சகோதரர்கள் மற்றும் விருப்பாச்சி கோபால நாயக்கர் தலைமையில் 1800-1801 ஆம் ஆண்டுகளில் தென்னிந்திய புரட்சி ஒருங்கிணைக்கப்பட்டது.',
    book_citation: '10-ஆம் வகுப்பு சமூக அறிவியல் (வரலாறு), அலகு 6, பக்கம் 82',
    pyq_reference: 'TNPSC Group 4 (2024) வினா எண் 78',
    pyq_year: 2024,
    difficulty: 'medium',
    is_daily_challenge: true
  },
  {
    id: 'tnpsc-unit8-trichy-proclamation',
    subject_slug: 'unit-8',
    topic_slug: 'south-indian-rebellion-1801',
    exam_slugs: ['group-4', 'group-2'],
    question_ta: 'மருது சகோதரர்களால் வெளியிடப்பட்ட புகழ்பெற்ற ‘திருச்சிராப்பள்ளி பிரகடனம்’ எந்த ஆண்டு வெளியிடப்பட்டது?',
    question_en: 'In which year was the famous Tiruchirappalli Proclamation issued by the Maruthu brothers?',
    options: [
      { key: 'A', text: '1801 ஜூன்' },
      { key: 'B', text: '1800 மே' },
      { key: 'C', text: '1806 ஜூலை' },
      { key: 'D', text: '1799 அக்டோபர்' }
    ],
    correct_key: 'A',
    explanation_ta: 'ஆங்கிலேயருக்கு எதிரான முதல் தேசிய அழைப்பாக கருதப்படும் திருச்சிராப்பள்ளி பிரகடனத்தை மருது சகோதரர்கள் 1801 ஜூன் மாதம் வெளியிட்டனர். இது நவாப் அரண்மனை சுவரிலும் ஸ்ரீரங்கம் கோவில் சுவரிலும் ஒட்டப்பட்டது.',
    book_citation: '10-ஆம் வகுப்பு சமூக அறிவியல் (வரலாறு), அலகு 6, பக்கம் 84',
    pyq_reference: 'TNPSC Group 2 (2022) & Group 4 (2018)',
    pyq_year: 2022,
    difficulty: 'hard',
    is_daily_challenge: true
  },
  {
    id: 'tnpsc-unit8-maruthu-martyrdom',
    subject_slug: 'unit-8',
    topic_slug: 'south-indian-rebellion-1801',
    exam_slugs: ['group-4', 'group-2'],
    question_ta: 'மருது சகோதரர்கள் ஆங்கிலேயர்களால் எந்த கோட்டையில் தூக்கிலிடப்பட்டனர்?',
    question_en: 'In which fort were the Maruthu brothers executed by the British?',
    options: [
      { key: 'A', text: 'திருப்பத்தூர் கோட்டை' },
      { key: 'B', text: 'பாஞ்சாலங்குறிச்சி கோட்டை' },
      { key: 'C', text: 'வேலூர் கோட்டை' },
      { key: 'D', text: 'திண்டுக்கல் கோட்டை' }
    ],
    correct_key: 'A',
    explanation_ta: 'மருது சகோதரர்கள் (பெரிய மருது மற்றும் சின்ன மருது) 1801 அக்டோபர் 24 அன்று ராமநாதபுரம் மாவட்டம் திருப்பத்தூர் கோட்டையில் தூக்கிலிடப்பட்டனர்.',
    book_citation: '10-ஆம் வகுப்பு வரலாறு, அலகு 6',
    pyq_reference: 'TNPSC Group 4 (2019) வினா எண் 61',
    pyq_year: 2019,
    difficulty: 'medium',
    is_daily_challenge: false
  },

  // 3. Indian Polity - Article 32 & Writs
  {
    id: 'tnpsc-polity-heart-soul',
    subject_slug: 'polity',
    topic_slug: 'article-32-writs',
    exam_slugs: ['group-4', 'group-2', 'police-si'],
    question_ta: 'டாக்டர் பி.ஆர். அம்பேத்கரால் இந்திய அரசியலமைப்பின் "இதயம் மற்றும் ஆன்மா" என்று வர்ணிக்கப்பட்ட சட்டப்பிரிவு எது?',
    question_en: 'Which article was described as the "Heart and Soul of the Constitution" by Dr. B.R. Ambedkar?',
    options: [
      { key: 'A', text: 'சரத்து 14' },
      { key: 'B', text: 'சரத்து 19' },
      { key: 'C', text: 'சரத்து 21' },
      { key: 'D', text: 'சரத்து 32' }
    ],
    correct_key: 'D',
    explanation_ta: 'அடிப்படை உரிமைகள் மீறப்படும்போது உச்சநீதிமன்றத்தை நேரடியாக அணுகி நீதிப்பேராணைகள் மூலம் தீர்வு பெறும் உரிமையை வழங்கும் சரத்து 32-ஐ அம்பேத்கர் அவர்கள் அரசியலமைப்பின் இதயம் மற்றும் ஆன்மா என்றார்.',
    book_citation: '10-ஆம் வகுப்பு குடிமையியல், அலகு 1, பக்க எண் 174',
    pyq_reference: 'TNPSC Group 4 (2022) & Group 1 (2021)',
    pyq_year: 2022,
    difficulty: 'easy',
    is_daily_challenge: true
  },
  {
    id: 'tnpsc-polity-writs-high-court',
    subject_slug: 'polity',
    topic_slug: 'article-32-writs',
    exam_slugs: ['group-4', 'group-2'],
    question_ta: 'உயர்நீதிமன்றங்கள் நீதிப்பேராணைகளை (Writs) வெளியிட அதிகாரம் அளிக்கும் அரசியலமைப்புச் சட்டப்பிரிவு எது?',
    question_en: 'Which constitutional article empowers High Courts to issue writs?',
    options: [
      { key: 'A', text: 'சரத்து 32' },
      { key: 'B', text: 'சரத்து 226' },
      { key: 'C', text: 'சரத்து 143' },
      { key: 'D', text: 'சரத்து 356' }
    ],
    correct_key: 'B',
    explanation_ta: 'உச்சநீதிமன்றத்திற்கு சரத்து 32-ம், உயர்நீதிமன்றங்களுக்கு சரத்து 226-ம் நீதிப்பேராணைகளை பிறப்பிக்க அதிகாரம் வழங்குகின்றன. உயர்நீதிமன்றங்களின் நீதிப்பேராணை அதிகாரம் அடிப்படை உரிமைகளுடன் மற்ற சட்ட உரிமைகளுக்கும் பொருந்தும் என்பதால் உச்சநீதிமன்றத்தை விட பரந்தது.',
    book_citation: '10-ஆம் வகுப்பு குடிமையியல், அலகு 1 & 12-ஆம் வகுப்பு அரசியல் அறிவியல்',
    pyq_reference: 'TNPSC Group 2 (2022) வினா எண் 93',
    pyq_year: 2022,
    difficulty: 'medium',
    is_daily_challenge: false
  },
  {
    id: 'tnpsc-polity-habeas-corpus',
    subject_slug: 'polity',
    topic_slug: 'article-32-writs',
    exam_slugs: ['group-4', 'group-2', 'police-si'],
    question_ta: 'சட்டத்திற்கு புறம்பாக ஒருவர் அடைத்து வைக்கப்படுவதிலிருந்து பாதுகாக்கும் நீதிப்பேராணை எது?',
    question_en: 'Which writ protects an individual from unlawful detention?',
    options: [
      { key: 'A', text: 'ஆட்கொணர்வு நீதிப்பேராணை (Habeas Corpus)' },
      { key: 'B', text: 'செயலுறுத்தும் நீதிப்பேராணை (Mandamus)' },
      { key: 'C', text: 'தடை நீதிப்பேராணை (Prohibition)' },
      { key: 'D', text: 'தகுதிமுறை வினவும் நீதிப்பேராணை (Quo-Warranto)' }
    ],
    correct_key: 'A',
    explanation_ta: 'ஆட்கொணர்வு நீதிப்பேராணை (Habeas Corpus) என்பது சட்டத்திற்குப் புறம்பாக ஒருவர் கைது செய்யப்படுவதை தடுத்து, கைது செய்யப்பட்டவரை 24 மணி நேரத்திற்குள் நீதிமன்றத்தின் முன் முன்னிலைப்படுத்த உத்தரவிடும் பேராணையாகும்.',
    book_citation: '10-ஆம் வகுப்பு குடிமையியல் அலகு 1',
    pyq_reference: 'TNPSC Police SI (2023) & Group 4 (2018)',
    pyq_year: 2023,
    difficulty: 'easy',
    is_daily_challenge: true
  }
];

async function seed() {
  console.log('Seeding TNPSC Questions to Supabase...');
  const { data, error } = await supabase
    .from('tnpsc_question')
    .upsert(
      SEED_QUESTIONS.map(q => ({
        id: q.id,
        subject_slug: q.subject_slug,
        topic_slug: q.topic_slug,
        exam_slugs: q.exam_slugs,
        question_ta: q.question_ta,
        question_en: q.question_en,
        options: q.options,
        correct_key: q.correct_key,
        explanation_ta: q.explanation_ta,
        book_citation: q.book_citation,
        pyq_reference: q.pyq_reference,
        pyq_year: q.pyq_year,
        difficulty: q.difficulty,
        is_daily_challenge: q.is_daily_challenge
      })),
      { onConflict: 'id' }
    )
    .select();

  if (error) {
    console.error('Seeding error:', error.message);
  } else {
    console.log(`Successfully seeded ${data.length} TNPSC questions into tnpsc_question table!`);
  }
}

seed();

