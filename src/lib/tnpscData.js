// src/lib/tnpscData.js
// Pure Static Constants & Seed Data for the VizhiTN TNPSC Portal.
// Zero dependencies on @supabase/supabase-js, zero network latency, zero build-time connection failures.

export const TNPSC_EXAMS = [
  {
    slug: "group-4",
    name_en: "TNPSC Group 4 & VAO",
    name_ta: "டிஎன்பிஎஸ்சி குரூப் 4 & வி.ஏ.ஓ",
    badge: "Most Popular",
    color: "from-blue-600 to-indigo-700",
    description_ta: "கிராம நிர்வாக அலுவலர் (VAO), இளநிலை உதவியாளர், தட்டச்சர், வரி வசூலிப்பாளர் பணியிடங்களுக்கான நேரடித் தேர்வு. 300 மதிப்பெண்கள் (பொதுத்தமிழ் 100 + பொது அறிவு 75 + கணிதம் 25).",
    target_posts: ["VAO", "Junior Assistant", "Typist", "Bill Collector"],
    total_marks: 300,
    total_questions: 200,
    duration_hours: 3.0,
    is_active: true
  },
  {
    slug: "group-2",
    name_en: "TNPSC Group 2 & 2A",
    name_ta: "டிஎன்பிஎஸ்சி குரூப் 2 & 2A",
    badge: "Gazetted / Executive",
    color: "from-purple-600 to-pink-700",
    description_ta: "துணை வணிகவரி அலுவலர், சார்பதிவாளர், நகராட்சி ஆணையர், தலைமைச் செயலக உதவியாளர் உள்ளிட்ட உயர் பதவிகளுக்கான முதல்நிலை மற்றும் முதன்மைத் தேர்வு.",
    target_posts: ["Sub-Registrar", "Municipal Commissioner", "Secretariat Assistant"],
    total_marks: 300,
    total_questions: 200,
    duration_hours: 3.0,
    is_active: true
  },
  {
    slug: "police-si",
    name_en: "TNUSRB Police SI & Constable",
    name_ta: "தமிழ்நாடு சீருடைப் பணியாளர் (SI & காவலர்)",
    badge: "Uniform Service",
    color: "from-amber-600 to-orange-700",
    description_ta: "காவல் சார்பு ஆய்வாளர் (Sub-Inspector) மற்றும் இரண்டாம் நிலை காவலர் பணியிடங்களுக்கான எழுத்துத் தேர்வு மற்றும் உடற்தகுதித் தேர்வு.",
    target_posts: ["Sub-Inspector", "Police Constable", "Jail Warder"],
    total_marks: 140,
    total_questions: 140,
    duration_hours: 2.5,
    is_active: true
  }
];

export const TNPSC_SUBJECTS = [
  { slug: "all", name_en: "All Subjects", name_ta: "அனைத்து பாடங்கள்", icon: "📚", color: "bg-blue-600", exam_slugs: ["group-4", "group-2", "police-si"] },
  { slug: "general-tamil", name_en: "General Tamil", name_ta: "பொதுத் தமிழ் (பகுதி அ, ஆ, இ)", icon: "📜", color: "bg-emerald-600", exam_slugs: ["group-4", "group-2"], syllabus_weightage_marks: 100 },
  { slug: "unit-8", name_en: "Unit 8: TN History & Culture", name_ta: "அலகு 8: தமிழக வரலாறு & பண்பாடு", icon: "🏛️", color: "bg-red-600", exam_slugs: ["group-4", "group-2"], syllabus_weightage_marks: 40 },
  { slug: "polity", name_en: "Indian Polity", name_ta: "இந்திய ஆட்சியியல் & அரசியலமைப்பு", icon: "⚖️", color: "bg-purple-600", exam_slugs: ["group-4", "group-2", "police-si"], syllabus_weightage_marks: 20 },
  { slug: "aptitude", name_en: "Aptitude & Mental Ability", name_ta: "கணிதம் & நுண்ணறிவு (25 Marks)", icon: "🧮", color: "bg-amber-600", exam_slugs: ["group-4", "group-2", "police-si"], syllabus_weightage_marks: 25 },
  { slug: "unit-9", name_en: "Unit 9: TN Administration", name_ta: "அலகு 9: தமிழகத்தில் வளர்ச்சி நிர்வாகம்", icon: "🏢", color: "bg-blue-600", exam_slugs: ["group-4", "group-2"], syllabus_weightage_marks: 30 },
  { slug: "current-affairs", name_en: "TN Current Affairs", name_ta: "நடப்பு நிகழ்வுகள்", icon: "📰", color: "bg-cyan-600", exam_slugs: ["group-4", "group-2", "police-si"], syllabus_weightage_marks: 15 },
  { slug: "geography", name_en: "Geography of India & TN", name_ta: "புவியியல் & இயற்கை வளங்கள்", icon: "🌍", color: "bg-teal-600", exam_slugs: ["group-4", "group-2"], syllabus_weightage_marks: 15 },
  { slug: "science", name_en: "General Science", name_ta: "பொது அறிவியல்", icon: "🔬", color: "bg-indigo-600", exam_slugs: ["group-4", "group-2", "police-si"], syllabus_weightage_marks: 15 },
];

export const TNPSC_CHAPTERS = [
  {
    slug: "tamil-grammar-part-a",
    subject_slug: "general-tamil",
    title_en: "Part A: Tamil Grammar",
    title_ta: "பகுதி (அ) - இலக்கணம்",
    description_ta: "பொருத்துதல், பிரித்தெழுதுதல், எதிர்ச்சொல், வல்லினம் மிகும்-மிகா இடங்கள், வேற்றுமை உருபுகள்.",
    samacheer_standard: "6-ஆம் வகுப்பு முதல் 10-ஆம் வகுப்பு வரை"
  },
  {
    slug: "unit-8-freedom-struggle",
    subject_slug: "unit-8",
    title_en: "Early Uprisings against British Rule",
    title_ta: "ஆங்கிலேயருக்கு எதிரான தொடக்க கால கிளர்ச்சிகள்",
    description_ta: "பாளையக்காரர்கள், பூலித்தேவன், வேலு நாச்சியார், மருது சகோதரர்கள் மற்றும் வேலூர் புரட்சி 1806.",
    samacheer_standard: "10-ஆம் வகுப்பு வரலாறு அலகு 6"
  },
  {
    slug: "polity-fundamental-rights",
    subject_slug: "polity",
    title_en: "Fundamental Rights & Writs",
    title_ta: "அடிப்படை உரிமைகள் & நீதிப்பேராணைகள்",
    description_ta: "இந்திய அரசியலமைப்பு பகுதி 3 (சரத்து 12 முதல் 35 வரை) மற்றும் 5 வகையான நீதிப்பேராணைகள்.",
    samacheer_standard: "10-ஆம் வகுப்பு குடிமையியல் அலகு 1"
  },
  {
    slug: "aptitude-lcm-hcf-numbers",
    subject_slug: "aptitude",
    title_en: "HCF, LCM & Numerical Ratios",
    title_ta: "மீ.பொ.வ (HCF), மீ.சி.ம (LCM) & விகிதங்கள்",
    description_ta: "மீப்பெரு பொது காரணி, மீச்சிறு பொது மடங்கு, விகிதம் மற்றும் விகிதாச்சாரம் (25 மதிப்பெண்களுக்கான முக்கிய பகுதி).",
    samacheer_standard: "6, 7, 8-ஆம் வகுப்பு சமச்சீர் கணிதம்"
  }
];

export const TNPSC_TOPICS = [
  {
    slug: "vallinam-migum-idangal",
    chapter_slug: "tamil-grammar-part-a",
    subject_slug: "general-tamil",
    title_en: "Vallinam Migum Idangal (Grammar Rules)",
    title_ta: "வல்லினம் மிகும் இடங்கள் & புணர்ச்சி விதிகள்",
    samacheer_book_ref: "10-ஆம் வகுப்பு தமிழ், இயல் 4, பக்க எண் 82 - 84",
    summary_overview_ta: "தமிழில் க, ச, த, ப ஆகிய நான்கு வல்லின மெய் எழுத்துகளும் சொல்லின் முதலில் வரும்போது சில குறிப்பிட்ட இடங்களில் ஒற்று மிகுந்து வரும். TNPSC Group 4 தேர்வில் ஆண்டுதோறும் கட்டாயம் 2 முதல் 3 வினாக்கள் இப்பகுதியிலிருந்து கேட்கப்படுகின்றன.",
    key_facts_bullet_points: [
      "‘அந்த, இந்த’ என்னும் சுட்டுத் திரிபுகளின் பின் வல்லினம் மிகும் (எ.கா: அந்தப் பையன், இந்தச் சட்டை).",
      "‘எந்த’ என்னும் வினாத் திரிபின் பின் வல்லினம் மிகும் (எ.கா: எந்தக் கல்லூரி?).",
      "இரண்டாம் வேற்றுமை உருபாகிய ‘ஐ’ வெளிப்படையாக வரும் தொடரில் வல்லினம் மிகும் (எ.கா: கதவைத் திற).",
      "நான்காம் வேற்றுமை உருபாகிய ‘கு’ வெளிப்படையாக வரும் தொடரில் வல்லினம் மிகும் (எ.கா: அவருக்குக் கொடு).",
      "ஈறுகெட்ட எதிர்மறைப் பெயரெச்சத்தின் பின் வல்லினம் மிகும் (எ.கா: பாடாப் பாட்டு, ஓடாக் குதிரை).",
      "உவமைத் தொகையில் வல்லினம் மிகும் (எ.கா: மலர்க்கை, தாமரைப்பாதம்)."
    ],
    pyq_frequency_count: 8,
    difficulty_level: "medium",
    seo_title: "வல்லினம் மிகும் இடங்கள் TNPSC Group 4 பொதுத்தமிழ் இலக்கணம் | Samacheer Kalvi Notes",
    seo_description: "TNPSC பொதுத்தமிழ் பகுதி அ இலக்கணத்தில் வல்லினம் மிகும் இடங்கள் விதிகள், 10-ஆம் வகுப்பு சமச்சீர் குறிப்புகள் மற்றும் மாதிரி வினாக்கள்.",
    seo_keywords: ["வல்லினம் மிகும் இடங்கள்", "tnpsc general tamil grammar", "samacheer kalvi tamil notes", "group 4 tamil 2026"]
  },
  {
    slug: "south-indian-rebellion-1801",
    chapter_slug: "unit-8-freedom-struggle",
    subject_slug: "unit-8",
    title_en: "South Indian Rebellion 1800-1801 & Maruthu Pandiyar",
    title_ta: "தென்னிந்திய புரட்சி (1800 - 1801) & மருது சகோதரர்கள்",
    samacheer_book_ref: "10-ஆம் வகுப்பு சமூக அறிவியல் (வரலாறு), அலகு 6, பக்க எண் 82 - 86",
    summary_overview_ta: "ஆங்கிலேய கிழக்கிந்திய கம்பெனியின் அடக்குமுறைக்கு எதிராக சிவகங்கையின் மருது சகோதரர்கள் தலைமையில் தென்னிந்திய கூட்டமைப்பு உருவாக்கப்பட்டு வீரப்போர் புரியப்பட்டது. இது தென்னிந்தியாவின் முதல் விடுதலைப் போராகும்.",
    key_facts_bullet_points: [
      "திருச்சிராப்பள்ளி பிரகடனம்: 1801 ஜூன் மாதம் மருது சகோதரர்களால் நவாப் அரண்மனை சுவரிலும் ஸ்ரீரங்கம் கோவில் சுவரிலும் ஒட்டப்பட்டது.",
      "கூட்டமைப்பின் முக்கிய தலைவர்கள்: சிவகங்கை மருது சகோதரர்கள், திண்டுக்கல் கோபால நாயக்கர், மலபார் கேரள வர்மா, மைசூர் கிருஷ்ணப்ப நாயக்கர்.",
      "தூக்கிலிடப்பட்ட நாள் & இடம்: 1801 அக்டோபர் 24 அன்று ராமநாதபுரம் திருப்பத்தூர் கோட்டையில் மருது சகோதரர்கள் தூக்கிலிடப்பட்டனர்.",
      "பாஞ்சாலங்குறிச்சி வீழ்ச்சி: ஊமைத்துரையும் செவத்தையாவும் 1801 நவம்பர் 16 அன்று தூக்கிலிடப்பட்டனர்.",
      "கர்நாடக உடன்படிக்கை (1801 ஜூலை 31): இதன் மூலம் பிரிட்டிஷார் தமிழகத்தின் மீது நேரடி கட்டுப்பாட்டை செலுத்தினர்."
    ],
    pyq_frequency_count: 6,
    difficulty_level: "medium",
    seo_title: "தென்னிந்திய புரட்சி 1801 & மருது சகோதரர்கள் | TNPSC Unit 8 Notes",
    seo_description: "TNPSC அலகு 8 தென்னிந்திய புரட்சி 1800-1801, திருச்சிராப்பள்ளி பிரகடனம், 10-ஆம் வகுப்பு வரலாறு சமச்சீர் கல்வி குறிப்புகள்.",
    seo_keywords: ["தென்னிந்திய புரட்சி 1801", "மருது சகோதரர்கள்", "tnpsc unit 8 notes", "group 4 history tamil"]
  },
  {
    slug: "article-32-writs",
    chapter_slug: "polity-fundamental-rights",
    subject_slug: "polity",
    title_en: "Article 32 & Writs (Constitutional Remedies)",
    title_ta: "சரத்து 32: அரசியலமைப்புக்குட்பட்டு தீர்வு காணும் உரிமை & 5 நீதிப்பேராணைகள்",
    samacheer_book_ref: "10-ஆம் வகுப்பு குடிமையியல், அலகு 1, பக்க எண் 174",
    summary_overview_ta: "டாக்டர் பி.ஆர். அம்பேத்கர் அவர்களால் இந்திய அரசியலமைப்பின் 'இதயம் மற்றும் ஆன்மா' (Heart and Soul of the Constitution) என்று வர்ணிக்கப்பட்ட சட்டப்பிரிவு சரத்து 32 ஆகும். உச்சநீதிமன்றம் மற்றும் உயர்நீதிமன்றங்கள் அடிப்படை உரிமைகளை பாதுகாக்க 5 வகையான நீதிப்பேராணைகளை வெளியிடுகின்றன.",
    key_facts_bullet_points: [
      "சரத்து 32: உச்சநீதிமன்றம் நீதிப்பேராணைகள் வெளியிட அதிகாரம் அளிக்கிறது.",
      "சரத்து 226: உயர்நீதிமன்றங்கள் நீதிப்பேராணைகள் வெளியிட அதிகாரம் அளிக்கிறது.",
      "ஆட்கொணர்வு நீதிப்பேராணை (Habeas Corpus): சட்டவிரோதமாக ஒருவர் அடைத்து வைக்கப்படுவதிலிருந்து பாதுகாத்தல்.",
      "செயலுறுத்தும் நீதிப்பேராணை (Mandamus): அரசு அலுவலர் தனது பொதுக்கடமையை செய்ய உத்தரவிடுதல்.",
      "தடை நீதிப்பேராணை (Prohibition): கீழ் நீதிமன்றங்கள் தங்களின் அதிகார வரம்பை மீறி செயல்படுவதை தடுத்தல்.",
      "ஆவணக்கேட்பு நீதிப்பேராணை (Certiorari): கீழ் நீதிமன்றங்களின் வழக்குகளை மேல் நீதிமன்றம் ஆய்வு செய்ய வரவழைத்தல்.",
      "தகுதிமுறை வினவும் நீதிப்பேராணை (Quo-Warranto): சட்டத்திற்கு புறம்பாக பொது பதவியை ஆக்கிரமிப்பதை தடுத்தல்."
    ],
    pyq_frequency_count: 7,
    difficulty_level: "medium",
    seo_title: "சரத்து 32 நீதிப்பேராணைகள் TNPSC இந்திய அரசியலமைப்பு | Polity Notes",
    seo_description: "சரத்து 32 மற்றும் 226 கீழ் வரும் 5 நீதிப்பேராணைகள், உச்சநீதிமன்ற உரிமைகள், TNPSC Group 4 & Group 2 பாலிட்டி குறிப்புகள்.",
    seo_keywords: ["சரத்து 32 நீதிப்பேராணைகள்", "habeas corpus tamil", "tnpsc indian polity notes", "group 4 polity 2026"]
  }
];

export const TNPSC_PYQ_PAPERS = [
  {
    slug: "group-4-2024",
    exam_slug: "group-4",
    year: 2024,
    title_en: "TNPSC Group 4 & VAO Question Paper 2024",
    title_ta: "டிஎன்பிஎஸ்சி குரூப் 4 & வி.ஏ.ஓ வினாத்தாள் 2024",
    exam_date: "2024-06-09",
    total_questions: 200,
    official_pdf_url: "https://www.tnpsc.gov.in",
    official_key_url: "https://www.tnpsc.gov.in",
    is_hot: true
  },
  {
    slug: "group-4-2022",
    exam_slug: "group-4",
    year: 2022,
    title_en: "TNPSC Group 4 & VAO Question Paper 2022",
    title_ta: "டிஎன்பிஎஸ்சி குரூப் 4 & வி.ஏ.ஓ வினாத்தாள் 2022",
    exam_date: "2022-07-24",
    total_questions: 200,
    official_pdf_url: "https://www.tnpsc.gov.in",
    official_key_url: "https://www.tnpsc.gov.in",
    is_hot: false
  },
  {
    slug: "group-2-2022",
    exam_slug: "group-2",
    year: 2022,
    title_en: "TNPSC Group 2 & 2A Preliminary Paper 2022",
    title_ta: "டிஎன்பிஎஸ்சி குரூப் 2 & 2A முதல்நிலை வினாத்தாள் 2022",
    exam_date: "2022-05-21",
    total_questions: 200,
    official_pdf_url: "https://www.tnpsc.gov.in",
    official_key_url: "https://www.tnpsc.gov.in",
    is_hot: false
  }
];

export function getSubjectBySlug(slug) {
  return TNPSC_SUBJECTS.find((s) => s.slug === slug) || TNPSC_SUBJECTS[0];
}

export function getExamBySlug(slug) {
  return TNPSC_EXAMS.find((e) => e.slug === slug) || TNPSC_EXAMS[0];
}

export const DEFAULT_TNPSC_QUESTIONS = [
  {
    id: "tnpsc-tamil-vallinam-01",
    subject_slug: "general-tamil",
    topic_slug: "vallinam-migum-idangal",
    exam_slugs: ["group-4", "group-2"],
    question_ta: "கீழ்க்கண்டவற்றுள் வல்லினம் மிகும் சரியான தொடர் எது?",
    question_en: "Which of the following is the correct phrase where the consonant doubles?",
    options: [
      { key: "A", text: "அந்த பையன்" },
      { key: "B", text: "அந்தப் பையன்" },
      { key: "C", text: "அந்த பயன்" },
      { key: "D", text: "அந்தப் பயன் இல்லை" }
    ],
    correct_key: "B",
    explanation_ta: "‘அந்த, இந்த’ என்னும் சுட்டுத் திரிபுகளின் பின் வல்லினம் மிகும் என்பது இலக்கண விதி. (எ.கா: அந்த + பையன் = அந்தப் பையன்).",
    book_citation: "10-ஆம் வகுப்பு தமிழ் - இயல் 4, பக்கம் 82",
    pyq_reference: "TNPSC Group 4 (2024 & 2019)",
    pyq_year: 2024,
    difficulty: "easy",
    is_daily_challenge: true,
  },
  {
    id: "tnpsc-unit8-trichy-proclamation",
    subject_slug: "unit-8",
    topic_slug: "south-indian-rebellion-1801",
    exam_slugs: ["group-4", "group-2"],
    question_ta: "ஆங்கிலேய கிழக்கிந்திய கம்பெனிக்கு எதிராக மருது சகோதரர்களால் 'திருச்சிராப்பள்ளி சுதந்திர பிரகடனம்' எப்போது வெளியிடப்பட்டது?",
    question_en: "When was the 'Tiruchirappalli Proclamation of Independence' issued by the Maruthu brothers?",
    options: [
      { key: "A", text: "1801 ஜூன்" },
      { key: "B", text: "1800 மே" },
      { key: "C", text: "1806 ஜூலை" },
      { key: "D", text: "1799 அக்டோபர்" }
    ],
    correct_key: "A",
    explanation_ta: "ஆங்கிலேயருக்கு எதிரான முதல் தேசிய அழைப்பாக கருதப்படும் திருச்சிராப்பள்ளி பிரகடனத்தை மருது சகோதரர்கள் 1801 ஜூன் மாதம் வெளியிட்டனர். இது நவாப் அரண்மனை சுவரிலும் ஸ்ரீரங்கம் கோவில் சுவரிலும் ஒட்டப்பட்டது.",
    book_citation: "10-ஆம் வகுப்பு சமூக அறிவியல் (வரலாறு), அலகு 6, பக்கம் 84",
    pyq_reference: "TNPSC Group 2 (2022) & Group 4 (2018)",
    pyq_year: 2022,
    difficulty: "hard",
    is_daily_challenge: true,
  },
  {
    id: "tnpsc-polity-heart-soul",
    subject_slug: "polity",
    topic_slug: "article-32-writs",
    exam_slugs: ["group-4", "group-2", "police-si"],
    question_ta: "டாக்டர் பி.ஆர். அம்பேத்கரால் இந்திய அரசியலமைப்பின் 'இதயம் மற்றும் ஆன்மா' என்று வர்ணிக்கப்பட்ட சட்டப்பிரிவு எது?",
    question_en: "Which article was described as the 'Heart and Soul of the Constitution' by Dr. B.R. Ambedkar?",
    options: [
      { key: "A", text: "சரத்து 14" },
      { key: "B", text: "சரத்து 19" },
      { key: "C", text: "சரத்து 21" },
      { key: "D", text: "சரத்து 32" }
    ],
    correct_key: "D",
    explanation_ta: "அடிப்படை உரிமைகள் மீறப்படும்போது உச்சநீதிமன்றத்தை நேரடியாக அணுகி நீதிப்பேராணைகள் மூலம் தீர்வு பெறும் உரிமையை வழங்கும் சரத்து 32-ஐ அம்பேத்கர் அவர்கள் அரசியலமைப்பின் இதயம் மற்றும் ஆன்மா என்றார்.",
    book_citation: "10-ஆம் வகுப்பு குடிமையியல், அலகு 1, பக்க எண் 174",
    pyq_reference: "TNPSC Group 4 (2022) & Group 1 (2021)",
    pyq_year: 2022,
    difficulty: "easy",
    is_daily_challenge: true,
  },
  {
    id: "tnpsc-polity-habeas-corpus",
    subject_slug: "polity",
    topic_slug: "article-32-writs",
    exam_slugs: ["group-4", "group-2", "police-si"],
    question_ta: "சட்டத்திற்கு புறம்பாக ஒருவர் அடைத்து வைக்கப்படுவதிலிருந்து பாதுகாக்கும் நீதிப்பேராணை எது?",
    question_en: "Which writ protects an individual from unlawful detention?",
    options: [
      { key: "A", text: "ஆட்கொணர்வு நீதிப்பேராணை (Habeas Corpus)" },
      { key: "B", text: "செயலுறுத்தும் நீதிப்பேராணை (Mandamus)" },
      { key: "C", text: "தடை நீதிப்பேராணை (Prohibition)" },
      { key: "D", text: "தகுதிமுறை வினவும் நீதிப்பேராணை (Quo-Warranto)" }
    ],
    correct_key: "A",
    explanation_ta: "ஆட்கொணர்வு நீதிப்பேராணை (Habeas Corpus) என்பது சட்டத்திற்குப் புறம்பாக ஒருவர் கைது செய்யப்படுவதை தடுத்து, கைது செய்யப்பட்டவரை 24 மணி நேரத்திற்குள் நீதிமன்றத்தின் முன் முன்னிலைப்படுத்த உத்தரவிடும் பேராணையாகும்.",
    book_citation: "10-ஆம் வகுப்பு குடிமையியல் அலகு 1",
    pyq_reference: "TNPSC Police SI (2023) & Group 4 (2018)",
    pyq_year: 2023,
    difficulty: "easy",
    is_daily_challenge: true,
  },
  {
    id: "tnpsc-aptitude-lcm-hcf",
    subject_slug: "aptitude",
    topic_slug: "aptitude-lcm-hcf-numbers",
    exam_slugs: ["group-4", "group-2", "police-si"],
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
    pyq_year: 2022,
    difficulty: "easy",
    is_daily_challenge: true,
  }
];

