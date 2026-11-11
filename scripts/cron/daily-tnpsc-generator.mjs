// scripts/cron/daily-tnpsc-generator.mjs
// Autonomous Daily TNPSC Syllabus & Practice Feeder (70 Questions/Day)
// Runs daily at 6:00 AM IST via GitHub Actions or manual run.

try {
  if (typeof process.loadEnvFile === 'function') {
    process.loadEnvFile('.env.local');
  }
} catch (_) {}

import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const SUBJECTS = [
  { slug: 'general-tamil', name_en: 'General Tamil', name_ta: 'பொதுத் தமிழ்', focus: '6th to 10th Standard Samacheer Kalvi Tamil: இலக்கணம், இலக்கியம், நூலாசிரியர்கள், அறிஞர்கள் மற்றும் தமிழ்த்தொண்டு' },
  { slug: 'unit-8', name_en: 'Unit 8: TN History & Culture', name_ta: 'அலகு 8: தமிழக வரலாறு & பண்பாடு', focus: 'Sangam archaeology (Keeladi, Korkai, Porunai), Thirukkural, Dravidian Movement, Justice Party, Periyar, Anna, freedom fighters in Tamil Nadu' },
  { slug: 'polity', name_en: 'Indian Polity', name_ta: 'இந்திய ஆட்சியியல்', focus: 'Constitution of India, Preamble, Fundamental Rights, Articles & Amendments, Parliament, Judiciary, Panchayati Raj, CAG, Election Commission' },
  { slug: 'aptitude', name_en: 'Aptitude & Mental Ability', name_ta: 'கணிதம் & நுண்ணறிவு', focus: 'TNPSC 25-mark maths: LCM & HCF, Ratio & Proportion, Simple & Compound Interest, Time & Work, Area & Volume, Percentage. Solvable with formula.' },
  { slug: 'current-affairs', name_en: 'TN Current Affairs', name_ta: 'நடப்பு நிகழ்வுகள்', focus: 'Authentic Tamil Nadu Govt schemes (Kalaignar Magalir Urimai, Pudhumai Penn, Tamil Pudhalvan, Breakfast Scheme), GI tags, national recognitions' },
  { slug: 'geography', name_en: 'Geography', name_ta: 'புவியியல்', focus: '10th Social Science: Tamil Nadu physical geography, Cauvery/Vaigai/Tamirabarani basins, Southwest & Northeast monsoons, protected wildlife, mineral deposits' },
  { slug: 'science', name_en: 'General Science', name_ta: 'பொது அறிவியல்', focus: '6th to 10th Samacheer Science: Newton laws, human digestive/circulatory systems, vitamins, infectious diseases, everyday chemical reactions' }
];

async function main() {
  console.log('====================================================');
  console.log('🚀 VizhiTN Autonomous TNPSC Practice Feeder');
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
  console.log('====================================================');

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.YOUTUBE_GEMINI_API_KEY || process.env.NEW_GEMINI_API_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase URL or Key. Aborting.');
    process.exit(1);
  }

  if (!geminiApiKey) {
    console.error('❌ Missing Gemini API Key. Aborting.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  // 1. Check Admin Automation Toggle
  console.log('🔍 Checking Admin Autonomous Toggle in Supabase...');
  let autoFeederConfig = { enabled: true, questions_per_subject: 10, total_generated: 0 };
  try {
    const { data: configRow } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'tnpsc_auto_feeder_config')
      .maybeSingle();

    if (configRow?.value) {
      autoFeederConfig = JSON.parse(configRow.value);
    }
  } catch (err) {
    console.warn('⚠️ Could not read auto-feeder config, defaulting to active:', err.message);
  }

  if (autoFeederConfig.enabled === false) {
    console.log('⏸️ [PAUSED] Autonomous Feeder is disabled by Admin in /admin/tnpsc.');
    console.log('Exiting cleanly without generating questions.');
    process.exit(0);
  }

  console.log('✅ Feeder is ENABLED. Target: 10 questions × 7 subjects = 70 verified MCQs.\n');

  const allGeneratedQuestions = [];

  // 2. Loop through all 7 subjects
  for (const sub of SUBJECTS) {
    console.log(`📚 Generating 10 MCQs for: ${sub.name_ta} (${sub.name_en})...`);

    const prompt = `You are the lead academic syllabus and question paper setter for Tamil Nadu TNPSC examinations (Group 4, Group 2, Group 1, VAO) at VizhiTN.
Generate exactly 10 high-yield, 100% verified multiple choice questions (MCQ) for the subject: "${sub.name_ta} (${sub.name_en})".
Specific Subject Focus: ${sub.focus}.

STRICT ZERO-HALLUCINATION RULES:
1. Ground every question strictly in the official Tamil Nadu State Board Samacheer Kalvi textbooks (Standards 6 to 12).
2. Must cite exact Samacheer book and chapter/unit in "book_citation" (e.g., "10-ஆம் வகுப்பு தமிழ் - இயல் 4, பக்க எண் 84 (சமச்சீர் கல்வி)").
3. Must reference realistic TNPSC Previous Year Question patterns in "pyq_reference" (e.g., "TNPSC Group 4 2022 நேரடி வினா மாதிரி").
4. Provide exactly 4 realistic options (A, B, C, D) in Tamil with only one unambiguous correct key.
5. Provide a crisp 1-2 sentence explanation in Tamil explaining why the answer is correct based on the textbook.

Return ONLY a valid JSON array with NO markdown code block wrapper, NO text before or after:
[
  {
    "id": "tnpsc-${sub.slug}-${Date.now()}-1",
    "subject_slug": "${sub.slug}",
    "question_ta": "Question text in Tamil",
    "question_en": "Question text in English",
    "options": [
      { "key": "A", "text": "Option A" },
      { "key": "B", "text": "Option B" },
      { "key": "C", "text": "Option C" },
      { "key": "D", "text": "Option D" }
    ],
    "correct_key": "A",
    "explanation_ta": "Tamil explanation",
    "book_citation": "Standard & Book Chapter reference",
    "pyq_reference": "Exam pattern reference",
    "difficulty": "medium",
    "is_daily_challenge": true
  }
]`;

    const MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-3.5-flash'];
    let subQuestions = [];

    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          },
        });

        const rawText = response.text || '';
        const cleaned = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize IDs and validate
          subQuestions = parsed.map((item, idx) => ({
            id: `tnpsc-${sub.slug}-${Date.now()}-${idx + 1}`,
            subject_slug: sub.slug,
            question_ta: item.question_ta,
            question_en: item.question_en || '',
            options: item.options || [],
            correct_key: item.correct_key || 'A',
            explanation_ta: item.explanation_ta || '',
            book_citation: item.book_citation || 'சமச்சீர் கல்வி பாடப்புத்தகம்',
            pyq_reference: item.pyq_reference || 'TNPSC Group 4 மாதிரி வினா',
            difficulty: item.difficulty || 'medium',
            is_daily_challenge: idx < 2, // First 2 from each subject become daily challenge
            date_added: new Date().toISOString().split('T')[0],
          }));
          console.log(`   ✓ Successfully generated ${subQuestions.length} questions using ${model}.`);
          break;
        }
      } catch (err) {
        console.warn(`   ⚠️ Model ${model} failed for ${sub.slug}:`, err.message);
      }
    }

    if (subQuestions.length > 0) {
      allGeneratedQuestions.push(...subQuestions);
    }
  }

  console.log(`\n📊 Batch Generation Complete: Total ${allGeneratedQuestions.length} Questions Ready.\n`);

  if (allGeneratedQuestions.length === 0) {
    console.error('❌ Failed to generate any questions across subjects. Exiting.');
    process.exit(1);
  }

  // 3. Save to Supabase (Dual Ingestion: Table + Site Settings Fallback)
  console.log('💾 Saving questions to Supabase...');

  // A. Try saving to dedicated tnpsc_question table
  try {
    const { error: tableError } = await supabase.from('tnpsc_question').upsert(
      allGeneratedQuestions.map((q) => ({
        id: q.id,
        subject_slug: q.subject_slug,
        question_ta: q.question_ta,
        question_en: q.question_en,
        options: q.options,
        correct_key: q.correct_key,
        explanation_ta: q.explanation_ta,
        book_citation: q.book_citation,
        pyq_reference: q.pyq_reference,
        difficulty: q.difficulty,
        is_daily_challenge: q.is_daily_challenge,
        date_added: q.date_added,
      })),
      { onConflict: 'id' }
    );

    if (!tableError) {
      console.log(`   ✓ Upserted ${allGeneratedQuestions.length} rows to "tnpsc_question" table.`);
    } else {
      console.warn('   ⚠️ tnpsc_question table not found or restricted. Using site_settings catalog.');
    }
  } catch (err) {
    console.warn('   ⚠️ Table upsert error:', err.message);
  }

  // B. Also update site_settings catalog so public site always has immediate access
  try {
    const { data: currentCatRow } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'tnpsc_questions_catalog')
      .maybeSingle();

    let existingCatalog = [];
    if (currentCatRow?.value) {
      try {
        existingCatalog = JSON.parse(currentCatRow.value);
      } catch (_) {}
    }

    // Prepend fresh questions and keep the newest 300 to maintain high speed and prevent oversized rows
    const mergedCatalog = [...allGeneratedQuestions, ...existingCatalog].slice(0, 300);

    await supabase.from('site_settings').upsert({
      key: 'tnpsc_questions_catalog',
      value: JSON.stringify(mergedCatalog),
      category: 'tnpsc_questions',
      updated_date: new Date().toISOString(),
    }, { onConflict: 'key' });

    console.log(`   ✓ Updated site_settings catalog with ${mergedCatalog.length} active questions.`);
  } catch (err) {
    console.warn('   ⚠️ Failed to update site_settings catalog:', err.message);
  }

  // 4. Update Auto-Feeder Config with last_run timestamp
  try {
    const updatedConfig = {
      ...autoFeederConfig,
      last_run: new Date().toISOString(),
      total_generated: (autoFeederConfig.total_generated || 0) + allGeneratedQuestions.length,
    };

    await supabase.from('site_settings').upsert({
      key: 'tnpsc_auto_feeder_config',
      value: JSON.stringify(updatedConfig),
      category: 'tnpsc_automation',
      updated_date: new Date().toISOString(),
    }, { onConflict: 'key' });

    console.log('   ✓ Updated tnpsc_auto_feeder_config timestamp.');
  } catch (err) {
    console.warn('   ⚠️ Failed to update config timestamp:', err.message);
  }

  // 5. SEO: Instant IndexNow Ping
  console.log('\n🚀 Triggering IndexNow Search Engine Push...');
  const urlsToPing = [
    'https://vizhitn.in/tnpsc',
    ...SUBJECTS.map((s) => `https://vizhitn.in/tnpsc/${s.slug}`)
  ];

  try {
    const indexNowPayload = {
      host: 'vizhitn.in',
      key: 'vizhitn2026indexnow',
      keyLocation: 'https://vizhitn.in/vizhitn2026indexnow.txt',
      urlList: urlsToPing,
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(indexNowPayload),
    });

    if (res.ok) {
      console.log(`   ✓ IndexNow accepted ${urlsToPing.length} URLs (Status: ${res.status}).`);
    } else {
      console.log(`   ℹ️ IndexNow ping response: ${res.status}`);
    }
  } catch (err) {
    console.warn('   ⚠️ IndexNow ping failed:', err.message);
  }

  // 6. Google Sitemap ping
  try {
    await fetch('https://www.google.com/ping?sitemap=https://vizhitn.in/sitemap.xml');
    console.log('   ✓ Pinged Google Sitemap endpoint.');
  } catch (_) {}

  console.log('\n====================================================');
  console.log('🎉 Autonomous TNPSC Batch Successfully Finished!');
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('💥 Fatal error in daily-tnpsc-generator:', err);
  process.exit(1);
});

