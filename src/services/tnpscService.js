import { supabase } from "@/api/supabaseClient";

export const TNPSC_SUBJECTS = [
  { slug: "all", name_en: "All Subjects", name_ta: "அனைத்து பாடங்கள்", icon: "📚", color: "bg-blue-600" },
  { slug: "general-tamil", name_en: "General Tamil", name_ta: "பொதுத் தமிழ்", icon: "📜", color: "bg-emerald-600" },
  { slug: "unit-8", name_en: "Unit 8: TN History & Culture", name_ta: "அலகு 8: தமிழக வரலாறு & பண்பாடு", icon: "🏛️", color: "bg-red-600" },
  { slug: "polity", name_en: "Indian Polity", name_ta: "இந்திய ஆட்சியியல்", icon: "⚖️", color: "bg-purple-600" },
  { slug: "aptitude", name_en: "Aptitude & Mental Ability", name_ta: "கணிதம் & நுண்ணறிவு (25 Marks)", icon: "🧮", color: "bg-amber-600" },
  { slug: "current-affairs", name_en: "TN Current Affairs", name_ta: "நடப்பு நிகழ்வுகள்", icon: "📰", color: "bg-cyan-600" },
  { slug: "geography", name_en: "Geography", name_ta: "புவியியல்", icon: "🌍", color: "bg-teal-600" },
  { slug: "science", name_en: "General Science", name_ta: "பொது அறிவியல்", icon: "🔬", color: "bg-indigo-600" },
];

export function getSubjectBySlug(slug) {
  return TNPSC_SUBJECTS.find((s) => s.slug === slug) || TNPSC_SUBJECTS[0];
}

export const DEFAULT_TNPSC_QUESTIONS = [
  {
    id: "tnpsc-tamil-ulaginil-naagarigam",
    subject_slug: "general-tamil",
    question_ta: "“உலகினில் நாகரிகம் முற்றும் அழிந்து விட்டாலும் திருக்குறளும் கம்பன் காவியமும் இருந்தால் போதும்; மீண்டும் அதனைப் புதுப்பித்து விடலாம்” என்று கூறியவர் யார்?",
    question_en: "Who stated that even if global civilization is completely destroyed, Thirukkural and Kamba Ramayanam alone are sufficient to rebuild it?",
    options: [
      { key: "A", text: "ஜி.யு.போப் (G.U. Pope)" },
      { key: "B", text: "கால்டுவெல் (Robert Caldwell)" },
      { key: "C", text: "மாக்ஸ் முல்லர் (Max Muller)" },
      { key: "D", text: "பாரதியார் (Bharathiyar)" }
    ],
    correct_key: "B",
    explanation_ta: "மொழிஞாயிறு தேவநேயப் பாவாணர் மற்றும் வரலாற்று நூல்களில் மேற்கோள் காட்டப்பட்டுள்ளபடி, இதனை உரைத்தவர் டாக்டர் கால்டுவெல் ஆவார்.",
    book_citation: "10-ஆம் வகுப்பு தமிழ் - இயல் 2, பக்க எண் 38 (சமச்சீர் கல்வி)",
    pyq_reference: "TNPSC Group 4 (2019) மற்றும் Group 2 (2022) வினாத்தாளில் கேட்கப்பட்ட நேரடி வினா!",
    difficulty: "medium",
    is_daily_challenge: true,
  },
  {
    id: "tnpsc-unit8-south-indian-rebellion",
    subject_slug: "unit-8",
    question_ta: "தென்னிந்திய புரட்சி (South Indian Rebellion) நடைபெற்ற ஆண்டு எது?",
    question_en: "In which year did the South Indian Rebellion take place?",
    options: [
      { key: "A", text: "1800 - 1801" },
      { key: "B", text: "1806" },
      { key: "C", text: "1857" },
      { key: "D", text: "1799" }
    ],
    correct_key: "A",
    explanation_ta: "மருது சகோதரர்கள் மற்றும் விருப்பாச்சி கோபால நாயக்கர் தலைமையில் 1800-1801 ஆம் ஆண்டுகளில் தென்னிந்திய புரட்சி ஒருங்கிணைக்கப்பட்டது.",
    book_citation: "10-ஆம் வகுப்பு சமூக அறிவியல் (வரலாறு), அலகு 6, பக்கம் 82",
    pyq_reference: "TNPSC Group 4 (2024) வினா எண் 78",
    difficulty: "medium",
    is_daily_challenge: true,
  },
  {
    id: "tnpsc-polity-first-woman-chief-justice",
    subject_slug: "polity",
    question_ta: "சென்னை உயர்நீதிமன்றத்தின் முதல் பெண் தலைமை நீதிபதியாகப் பணியாற்றியவர் யார்?",
    question_en: "Who served as the first female Chief Justice of the Madras High Court?",
    options: [
      { key: "A", text: "நீதிபதி பானுமதி" },
      { key: "B", text: "நீதிபதி காந்தா குமாரி பட்நாகர்" },
      { key: "C", text: "நீதிபதி இந்திரா பானர்ஜி" },
      { key: "D", text: "நீதிபதி பாத்திமா பீவி" }
    ],
    correct_key: "B",
    explanation_ta: "1992-ல் சென்னை உயர்நீதிமன்றத்தின் முதல் பெண் தலைமை நீதிபதியாக காந்தா குமாரி பட்நாகர் பொறுப்பேற்றார்.",
    book_citation: "8 மற்றும் 10-ஆம் வகுப்பு சமூக அறிவியல் (நீதித்துறை அலகு)",
    pyq_reference: "TNPSC Group 2 (2018) & High Court Assistant Exam",
    difficulty: "hard",
    is_daily_challenge: true,
  },
  {
    id: "tnpsc-unit8-thillaiyadi-valliammai",
    subject_slug: "unit-8",
    question_ta: "தென்னாப்பிரிக்காவில் காந்தியடிகள் நடத்திய சத்தியாகிரகப் போராட்டத்தில் கலந்து கொண்டு 16 வயதில் உயிர்த்தியாகம் செய்த தமிழக வீராங்கனை யார்?",
    question_en: "Which Tamil heroine participated in Mahatma Gandhi's Satyagraha in South Africa and sacrificed her life at age 16?",
    options: [
      { key: "A", text: "அஞ்சலை அம்மாள்" },
      { key: "B", text: "தில்லையாடி வள்ளியம்மை" },
      { key: "C", text: "வேலு நாச்சியார்" },
      { key: "D", text: "அம்புஜத்தம்மாள்" }
    ],
    correct_key: "B",
    explanation_ta: "காந்தியடிகள் தனது 'தென்னாப்பிரிக்க சத்தியாகிரகம்' நூலில் வள்ளியம்மையின் தியாகத்தைப் பாராட்டி எழுதியுள்ளார்.",
    book_citation: "9-ஆம் வகுப்பு தமிழ் - இயல் 3 (தமிழர் வீரம் & தியாகம்)",
    pyq_reference: "TNPSC Group 4 (2022) & Group 2 (2018)",
    difficulty: "medium",
    is_daily_challenge: true,
  },
  {
    id: "tnpsc-aptitude-lcm-hcf",
    subject_slug: "aptitude",
    question_ta: "இரு எண்களின் மீ.பொ.வ (HCF) 12 மற்றும் அவற்றின் மீ.சி.ம (LCM) 144. அவ்விரு எண்களில் ஒன்று 36 எனில், மற்றொரு எண் எது?",
    question_en: "The HCF of two numbers is 12 and their LCM is 144. If one of the numbers is 36, what is the other number?",
    options: [
      { key: "A", text: "48" },
      { key: "B", text: "24" },
      { key: "C", text: "72" },
      { key: "D", text: "96" }
    ],
    correct_key: "A",
    explanation_ta: "சூத்திரம்: முதல் எண் × இரண்டாம் எண் = LCM × HCF. எனவே, 36 × x = 144 × 12. x = (144 × 12) / 36 = 48.",
    book_citation: "6-ஆம் வகுப்பு கணிதம் - பருவம் 2 (எண்ணியல் அலகு)",
    pyq_reference: "TNPSC Group 4 (2022) Aptitude Section",
    difficulty: "easy",
    is_daily_challenge: true,
  },
  {
    id: "tnpsc-current-affairs-magalir-urimai",
    subject_slug: "current-affairs",
    question_ta: "தமிழ்நாடு அரசு கலைஞர் மகளிர் உரிமைத் திட்டத்தை எந்த தலைவரின் பிறந்தநாளில் தொடங்கியது?",
    question_en: "On whose birth anniversary did the Tamil Nadu Government launch the Kalaignar Magalir Urimai Thittam?",
    options: [
      { key: "A", text: "பெரியார் ஈ.வெ.ரா (செப் 17)" },
      { key: "B", text: "பேரறிஞர் அண்ணா (செப் 15)" },
      { key: "C", text: "முத்தமிழறிஞர் கலைஞர் (ஜூன் 3)" },
      { key: "D", text: "காமராஜர் (ஜூலை 15)" }
    ],
    correct_key: "B",
    explanation_ta: "2023 செப்டம்பர் 15 அன்று பேரறிஞர் அண்ணாவின் பிறந்தநாளில் காஞ்சிபுரத்தில் முதலமைச்சர் மு.க.ஸ்டாலின் அவர்களால் தொடங்கப்பட்டது.",
    book_citation: "தமிழக அரசின் அதிகாரப்பூர்வ கொள்கை விளக்கக் குறிப்பு & நடப்பு நிகழ்வுகள்",
    pyq_reference: "TNPSC Group 4 (2024) எதிர்பார்க்கப்பட்ட நடப்பு நிகழ்வு",
    difficulty: "easy",
    is_daily_challenge: false,
  }
];

const SETTINGS_KEY = "tnpsc_questions_catalog";
const AUTO_FEEDER_KEY = "tnpsc_auto_feeder_config";

/**
 * Fetch all TNPSC questions with Hybrid Table + Site Settings Fallback
 */
export async function fetchTnpscQuestions(subjectSlug = "all") {
  try {
    // 1. Try dedicated tnpsc_question table first if available
    try {
      let query = supabase
        .from("tnpsc_question")
        .select("*")
        .order("created_at", { ascending: false });

      if (subjectSlug && subjectSlug !== "all") {
        query = query.eq("subject_slug", subjectSlug);
      }

      const { data: tableData, error: tableError } = await query;
      if (!tableError && Array.isArray(tableData) && tableData.length > 0) {
        return tableData;
      }
    } catch (_) {
      // Table may not exist yet, gracefully proceed to site_settings
    }

    // 2. Fallback to site_settings JSON catalog
    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    let list = DEFAULT_TNPSC_QUESTIONS;
    if (data?.value) {
      try {
        const parsed = JSON.parse(data.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch (_) {}
    }

    if (subjectSlug && subjectSlug !== "all") {
      return list.filter((q) => q.subject_slug === subjectSlug);
    }
    return list;
  } catch (err) {
    console.warn("[TNPSC Service] Fetch error:", err);
    if (subjectSlug && subjectSlug !== "all") {
      return DEFAULT_TNPSC_QUESTIONS.filter((q) => q.subject_slug === subjectSlug);
    }
    return DEFAULT_TNPSC_QUESTIONS;
  }
}

/**
 * Fetch today's Daily 5-Question Challenge
 */
export async function fetchDailyChallengeQuestions() {
  const all = await fetchTnpscQuestions("all");
  const daily = all.filter((q) => q.is_daily_challenge);
  return daily.length >= 5 ? daily.slice(0, 5) : all.slice(0, 5);
}

/**
 * Save / Update full questions catalog (Admin)
 */
export async function saveTnpscQuestionsCatalog(questions) {
  // Update site_settings
  const payload = {
    key: SETTINGS_KEY,
    value: JSON.stringify(questions),
    category: "tnpsc_questions",
    updated_date: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "key" })
    .select();

  if (error) throw error;

  // Best effort: Also attempt upserting to tnpsc_question table if it exists
  try {
    await supabase.from("tnpsc_question").upsert(
      questions.map((q) => ({
        id: q.id,
        subject_slug: q.subject_slug,
        question_ta: q.question_ta,
        question_en: q.question_en || null,
        options: q.options,
        correct_key: q.correct_key,
        explanation_ta: q.explanation_ta || null,
        book_citation: q.book_citation || null,
        pyq_reference: q.pyq_reference || null,
        difficulty: q.difficulty || "medium",
        is_daily_challenge: Boolean(q.is_daily_challenge),
      })),
      { onConflict: "id" }
    );
  } catch (_) {}

  return data;
}

/**
 * Fetch Autonomous Feeder Config
 */
export async function fetchAutoFeederConfig() {
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", AUTO_FEEDER_KEY)
      .maybeSingle();

    if (data?.value) {
      try {
        return JSON.parse(data.value);
      } catch (_) {}
    }
  } catch (err) {
    console.warn("[TNPSC Service] fetchAutoFeederConfig error:", err);
  }

  // Default config: Enabled = true, 10 questions per subject
  return {
    enabled: true,
    questions_per_subject: 10,
    last_run: null,
    total_generated: 0,
  };
}

/**
 * Save Autonomous Feeder Config (Toggle ON / OFF)
 */
export async function saveAutoFeederConfig(config) {
  const payload = {
    key: AUTO_FEEDER_KEY,
    value: JSON.stringify(config),
    category: "tnpsc_automation",
    updated_date: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("site_settings")
    .upsert(payload, { onConflict: "key" })
    .select();

  if (error) throw error;
  return data;
}
