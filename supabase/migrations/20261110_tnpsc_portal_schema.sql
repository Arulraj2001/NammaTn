-- Migration: TNPSC Exam Portal Schema (Exams, Subjects, Chapters, Topics, PYQ Papers & Question Bank)
-- Date: 2026-11-10

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Exams Table
CREATE TABLE IF NOT EXISTS public.tnpsc_exam (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  description_ta TEXT,
  target_posts TEXT[] DEFAULT '{}',
  total_marks INTEGER DEFAULT 300,
  duration_hours NUMERIC(3,1) DEFAULT 3.0,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects Table
CREATE TABLE IF NOT EXISTS public.tnpsc_subject (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  exam_slugs TEXT[] DEFAULT '{"group-4", "group-2"}',
  name_en TEXT NOT NULL,
  name_ta TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  color_theme TEXT DEFAULT 'bg-blue-600',
  syllabus_weightage_marks INTEGER DEFAULT 100,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Chapters / Units Table
CREATE TABLE IF NOT EXISTS public.tnpsc_chapter (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  subject_slug TEXT REFERENCES public.tnpsc_subject(slug) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ta TEXT NOT NULL,
  description_ta TEXT,
  samacheer_standard TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Topics Table (With High-Yield Editorial Summary)
CREATE TABLE IF NOT EXISTS public.tnpsc_topic (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  chapter_slug TEXT REFERENCES public.tnpsc_chapter(slug) ON DELETE CASCADE,
  subject_slug TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title_en TEXT NOT NULL,
  title_ta TEXT NOT NULL,
  samacheer_book_ref TEXT NOT NULL,
  summary_overview_ta TEXT NOT NULL,
  key_facts_bullet_points JSONB DEFAULT '[]'::jsonb,
  pyq_frequency_count INTEGER DEFAULT 0,
  difficulty_level TEXT DEFAULT 'medium',
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Previous Year Question Papers Table
CREATE TABLE IF NOT EXISTS public.tnpsc_pyq_paper (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug TEXT UNIQUE NOT NULL,
  exam_slug TEXT REFERENCES public.tnpsc_exam(slug) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  title_en TEXT NOT NULL,
  title_ta TEXT NOT NULL,
  exam_date DATE,
  total_questions INTEGER DEFAULT 200,
  official_pdf_url TEXT,
  official_key_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enhance Existing Question Bank Table with Topic & PYQ Columns
ALTER TABLE public.tnpsc_question
  ADD COLUMN IF NOT EXISTS topic_slug TEXT,
  ADD COLUMN IF NOT EXISTS exam_slugs TEXT[] DEFAULT '{"group-4"}',
  ADD COLUMN IF NOT EXISTS pyq_year INTEGER;

-- Indexes for lightning fast lookups & ISR queries
CREATE INDEX IF NOT EXISTS idx_tnpsc_chapter_subject ON public.tnpsc_chapter(subject_slug);
CREATE INDEX IF NOT EXISTS idx_tnpsc_topic_chapter ON public.tnpsc_topic(chapter_slug);
CREATE INDEX IF NOT EXISTS idx_tnpsc_topic_subject ON public.tnpsc_topic(subject_slug);
CREATE INDEX IF NOT EXISTS idx_tnpsc_question_topic ON public.tnpsc_question(topic_slug);
CREATE INDEX IF NOT EXISTS idx_tnpsc_question_subject ON public.tnpsc_question(subject_slug);
CREATE INDEX IF NOT EXISTS idx_tnpsc_pyq_exam ON public.tnpsc_pyq_paper(exam_slug);

-- Enable RLS on all tables
ALTER TABLE public.tnpsc_exam ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tnpsc_subject ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tnpsc_chapter ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tnpsc_topic ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tnpsc_pyq_paper ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tnpsc_question ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public can view active exams" ON public.tnpsc_exam;
CREATE POLICY "Public can view active exams" ON public.tnpsc_exam FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Public can view subjects" ON public.tnpsc_subject;
CREATE POLICY "Public can view subjects" ON public.tnpsc_subject FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view chapters" ON public.tnpsc_chapter;
CREATE POLICY "Public can view chapters" ON public.tnpsc_chapter FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view published topics" ON public.tnpsc_topic;
CREATE POLICY "Public can view published topics" ON public.tnpsc_topic FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Public can view pyq papers" ON public.tnpsc_pyq_paper;
CREATE POLICY "Public can view pyq papers" ON public.tnpsc_pyq_paper FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public can view questions" ON public.tnpsc_question;
CREATE POLICY "Public can view questions" ON public.tnpsc_question FOR SELECT USING (true);

-- Authenticated Full Access Policies
CREATE POLICY "Authenticated full access to exams" ON public.tnpsc_exam FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access to subjects" ON public.tnpsc_subject FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access to chapters" ON public.tnpsc_chapter FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access to topics" ON public.tnpsc_topic FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access to pyq papers" ON public.tnpsc_pyq_paper FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated full access to questions" ON public.tnpsc_question FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT ALL ON public.tnpsc_exam TO authenticated, service_role;
GRANT ALL ON public.tnpsc_subject TO authenticated, service_role;
GRANT ALL ON public.tnpsc_chapter TO authenticated, service_role;
GRANT ALL ON public.tnpsc_topic TO authenticated, service_role;
GRANT ALL ON public.tnpsc_pyq_paper TO authenticated, service_role;
GRANT ALL ON public.tnpsc_question TO authenticated, service_role;

GRANT SELECT ON public.tnpsc_exam TO anon;
GRANT SELECT ON public.tnpsc_subject TO anon;
GRANT SELECT ON public.tnpsc_chapter TO anon;
GRANT SELECT ON public.tnpsc_topic TO anon;
GRANT SELECT ON public.tnpsc_pyq_paper TO anon;
GRANT SELECT ON public.tnpsc_question TO anon;

-- =========================================================================
-- SEED DATA: Core TNPSC Exams
-- =========================================================================
INSERT INTO public.tnpsc_exam (slug, name_en, name_ta, description_ta, target_posts, total_marks, duration_hours, order_index)
VALUES 
  ('group-4', 'TNPSC Group 4 & VAO', 'டிஎன்பிஎஸ்சி குரூப் 4 & வி.ஏ.ஓ', 'கிராம நிர்வாக அலுவலர் (VAO), இளநிலை உதவியாளர், தட்டச்சர், வரி வசூலிப்பாளர் பணியிடங்களுக்கான நேரடித் தேர்வு.', '{"VAO", "Junior Assistant", "Typist", "Bill Collector"}', 300, 3.0, 1),
  ('group-2', 'TNPSC Group 2 & 2A', 'டிஎன்பிஎஸ்சி குரூப் 2 & 2A', 'துணை வணிகவரி அலுவலர், சார்பதிவாளர், நகராட்சி ஆணையர் மற்றும் தலைமைச் செயலக உதவியாளர் பணியிடங்கள்.', '{"Sub-Registrar", "Municipal Commissioner", "Secretariat Assistant"}', 300, 3.0, 2),
  ('police-si', 'TNUSRB Police SI & Constable', 'தமிழ்நாடு சீருடைப் பணியாளர் (SI & காவலர்)', 'காவல் சார்பு ஆய்வாளர் (Sub-Inspector) மற்றும் இரண்டாம் நிலை காவலர் பணியிடங்களுக்கான தேர்வு.', '{"Sub-Inspector", "Police Constable"}', 140, 2.5, 3)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================================
-- SEED DATA: Core Subjects
-- =========================================================================
INSERT INTO public.tnpsc_subject (slug, exam_slugs, name_en, name_ta, icon, color_theme, syllabus_weightage_marks, order_index)
VALUES
  ('general-tamil', '{"group-4", "group-2"}', 'General Tamil', 'பொதுத் தமிழ் (பகுதி அ, ஆ, இ)', '📜', 'bg-emerald-600', 100, 1),
  ('unit-8', '{"group-4", "group-2"}', 'Unit 8: TN History & Culture', 'அலகு 8: தமிழ்நாட்டின் வரலாறு & பண்பாடு', '🏛️', 'bg-red-600', 40, 2),
  ('polity', '{"group-4", "group-2", "police-si"}', 'Indian Polity', 'இந்திய ஆட்சியியல் & அரசியலமைப்பு', '⚖️', 'bg-purple-600', 20, 3),
  ('aptitude', '{"group-4", "group-2", "police-si"}', 'Aptitude & Mental Ability', 'கணிதம் & நுண்ணறிவுத் திறன் (25 வினாக்கள்)', '🧮', 'bg-amber-600', 25, 4),
  ('unit-9', '{"group-4", "group-2"}', 'Unit 9: TN Administration', 'அலகு 9: தமிழகத்தில் வளர்ச்சி நிர்வாகம்', '🏢', 'bg-blue-600', 30, 5),
  ('current-affairs', '{"group-4", "group-2", "police-si"}', 'Current Affairs', 'தமிழ்நாடு & தேசிய நடப்பு நிகழ்வுகள்', '📰', 'bg-cyan-600', 15, 6),
  ('geography', '{"group-4", "group-2"}', 'Geography of India & TN', 'புவியியல் & இயற்கை வளங்கள்', '🌍', 'bg-teal-600', 15, 7),
  ('science', '{"group-4", "group-2", "police-si"}', 'General Science', 'பொது அறிவியல் (இயற்பியல், வேதியியல், உயிரியல்)', '🔬', 'bg-indigo-600', 15, 8)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================================
-- SEED DATA: Essential Chapters
-- =========================================================================
INSERT INTO public.tnpsc_chapter (slug, subject_slug, title_en, title_ta, description_ta, samacheer_standard, order_index)
VALUES
  ('tamil-grammar-part-a', 'general-tamil', 'Part A: Tamil Grammar', 'பகுதி (அ) - இலக்கணம்', 'பொருத்துதல், பிரித்தெழுதுதல், எதிர்ச்சொல், வல்லினம் மிகும்-மிகா இடங்கள்.', '6-ஆம் வகுப்பு முதல் 10-ஆம் வகுப்பு வரை', 1),
  ('unit-8-freedom-struggle', 'unit-8', 'Early Uprisings against British Rule', 'ஆங்கிலேயருக்கு எதிரான தொடக்க கால கிளர்ச்சிகள்', 'பாளையக்காரர்கள், பூலித்தேவன், வேலு நாச்சியார், மருது சகோதரர்கள் மற்றும் வேலூர் புரட்சி 1806.', '10-ஆம் வகுப்பு வரலாறு அலகு 6', 1),
  ('polity-fundamental-rights', 'polity', 'Fundamental Rights & Duties', 'அடிப்படை உரிமைகள் & கடமைகள்', 'இந்திய அரசியலமைப்பு பகுதி 3 (சரத்து 12 முதல் 35 வரை) மற்றும் நீதிப்பேராணைகள்.', '10-ஆம் வகுப்பு குடிமையியல் அலகு 1', 1)
ON CONFLICT (slug) DO NOTHING;

-- =========================================================================
-- SEED DATA: High-Yield Topics with Editorial Summaries
-- =========================================================================
INSERT INTO public.tnpsc_topic (
  slug, chapter_slug, subject_slug, title_en, title_ta, 
  samacheer_book_ref, summary_overview_ta, key_facts_bullet_points, 
  pyq_frequency_count, difficulty_level, seo_title, seo_description, seo_keywords, order_index
)
VALUES
  (
    'vallinam-migum-idangal',
    'tamil-grammar-part-a',
    'general-tamil',
    'Vallinam Migum Idangal (Tamil Grammar Rules)',
    'வல்லினம் மிகும் இடங்கள் & புணர்ச்சி விதிகள்',
    '10-ஆம் வகுப்பு தமிழ், இயல் 4, பக்க எண் 82 - 84',
    'தமிழில் க, ச, த, ப ஆகிய நான்கு வல்லின மெய் எழுத்துகளும் சொல்லின் முதலில் வரும்போது சில குறிப்பிட்ட இடங்களில் ஒற்று மிகுந்து வரும். TNPSC Group 4 தேர்வில் ஆண்டுதோறும் கட்டாயம் 2 முதல் 3 வினாக்கள் இப்பகுதியிலிருந்து கேட்கப்படுகின்றன.',
    '[
      "அந்த, இந்த என்னும் சுட்டுத் திரிபுகளின் பின் வல்லினம் மிகும் (எ.கா: அந்தப் பையன், இந்தச் சட்டை)",
      "எந்த என்னும் வினாத் திரிபின் பின் வல்லினம் மிகும் (எ.கா: எந்தக் கல்லூரி?)",
      "இரண்டாம் வேற்றுமை உருபாகிய ஐ வெளிப்படையாக வரும் தொடரில் வல்லினம் மிகும் (எ.கா: கதவைத் திற)",
      "நான்காம் வேற்றுமை உருபாகிய கு வெளிப்படையாக வரும் தொடரில் வல்லினம் மிகும் (எ.கா: அவருக்குக் கொடு)",
      "ஈறுகெட்ட எதிர்மறைப் பெயரெச்சத்தின் பின் வல்லினம் மிகும் (எ.கா: பாடாப் பாட்டு, ஓடாக் குதிரை)",
      "உவமைத் தொகையில் வல்லினம் மிகும் (எ.கா: மலர்க்கை, தாமரைப்பாதம்)"
    ]'::jsonb,
    8,
    'medium',
    'வல்லினம் மிகும் இடங்கள் TNPSC Group 4 இலக்கணம் | Samacheer Kalvi Notes',
    'TNPSC பொதுத்தமிழ் பகுதி அ இலக்கணத்தில் வல்லினம் மிகும் இடங்கள் விதிகள், 10-ஆம் வகுப்பு சமச்சீர் குறிப்புகள் மற்றும் மாதிரி வினாக்கள்.',
    '{"வல்லினம் மிகும் இடங்கள்", "tnpsc general tamil grammar", "samacheer kalvi tamil notes", "group 4 tamil 2026"}',
    1
  ),
  (
    'south-indian-rebellion-1801',
    'unit-8-freedom-struggle',
    'unit-8',
    'South Indian Rebellion 1800-1801 & Maruthu Pandiyar',
    'தென்னிந்திய புரட்சி (1800 - 1801) & மருது சகோதரர்கள்',
    '10-ஆம் வகுப்பு சமூக அறிவியல் (வரலாறு), அலகு 6, பக்க எண் 82 - 86',
    'ஆங்கிலேய கிழக்கிந்திய கம்பெனியின் அடக்குமுறைக்கு எதிராக சிவகங்கையின் மருது சகோதரர்கள் தலைமையில் தென்னிந்திய கூட்டமைப்பு உருவாக்கப்பட்டு வீரப்போர் புரியப்பட்டது. இது தென்னிந்தியாவின் முதல் விடுதலைப் போராகும்.',
    '[
      "திருச்சிராப்பள்ளி பிரகடனம்: 1801 ஜூன் மாதம் மருது சகோதரர்களால் நவாப் அரண்மனை சுவரிலும் ஸ்ரீரங்கம் கோவில் சுவரிலும் ஒட்டப்பட்டது.",
      "கூட்டமைப்பின் முக்கிய தலைவர்கள்: சிவகங்கை மருது சகோதரர்கள், திண்டுக்கல் கோபால நாயக்கர், மலபார் கேரள வர்மா, மைசூர் கிருஷ்ணப்ப நாயக்கர்.",
      "தூக்கிலிடப்பட்ட நாள்: 1801 அக்டோபர் 24 அன்று திருப்பத்தூர் கோட்டையில் மருது சகோதரர்கள் தூக்கிலிடப்பட்டனர்.",
      "பாஞ்சாலங்குறிச்சி வீழ்ச்சி: ஊமைத்துரையும் செவத்தையாவும் 1801 நவம்பர் 16 அன்று தூக்கிலிடப்பட்டனர்.",
      "கர்நாடக உடன்படிக்கை (1801 ஜூலை 31): இதன் மூலம் பிரிட்டிஷார் தமிழகத்தின் மீது நேரடி கட்டுப்பாட்டை செலுத்தினர்."
    ]'::jsonb,
    6,
    'medium',
    'தென்னிந்திய புரட்சி 1801 & மருது சகோதரர்கள் | TNPSC Unit 8 Notes',
    'TNPSC அலகு 8 தென்னிந்திய புரட்சி 1800-1801, திருச்சிராப்பள்ளி பிரகடனம், 10-ஆம் வகுப்பு வரலாறு சமச்சீர் கல்வி குறிப்புகள்.',
    '{"தென்னிந்திய புரட்சி 1801", "மருது சகோதரர்கள்", "tnpsc unit 8 notes", "group 4 history tamil"}',
    2
  ),
  (
    'article-32-writs',
    'polity-fundamental-rights',
    'polity',
    'Article 32 & Writs (Constitutional Remedies)',
    'சரத்து 32: அரசியலமைப்புக்குட்பட்டு தீர்வு காணும் உரிமை & நீதிப்பேராணைகள்',
    '10-ஆம் வகுப்பு குடிமையியல், அலகு 1, பக்க எண் 174',
    'டாக்டர் பி.ஆர். அம்பேத்கர் அவர்களால் இந்திய அரசியலமைப்பின் "இதயம் மற்றும் ஆன்மா" (Heart and Soul of the Constitution) என்று வர்ணிக்கப்பட்ட சட்டப்பிரிவு சரத்து 32 ஆகும். உச்சநீதிமன்றம் மற்றும் உயர்நீதிமன்றங்கள் குடிமக்களின் அடிப்படை உரிமைகளை பாதுகாக்க 5 வகையான நீதிப்பேராணைகளை வெளியிடுகின்றன.',
    '[
      "சரத்து 32: உச்சநீதிமன்றம் நீதிப்பேராணைகள் வெளியிட அதிகாரம் அளிக்கிறது.",
      "சரத்து 226: உயர்நீதிமன்றங்கள் நீதிப்பேராணைகள் வெளியிட அதிகாரம் அளிக்கிறது.",
      "ஆட்கொணர்வு நீதிப்பேராணை (Habeas Corpus): சட்டவிரோதமாக கைது செய்யப்படுவதில் இருந்து பாதுகாத்தல்.",
      "செயலுறுத்தும் நீதிப்பேராணை (Mandamus): அரசு அலுவலர் தனது கடமையை செய்ய உத்தரவிடுதல்.",
      "தடை நீதிப்பேராணை (Prohibition): கீழ் நீதிமன்றங்கள் தங்களின் அதிகார வரம்பை மீறி செயல்படுவதை தடுத்தல்.",
      "ஆவணக்கேட்பு நீதிப்பேராணை (Certiorari): கீழ் நீதிமன்றங்களின் தீர்ப்புகளை உயர்நீதிமன்றம் மறுஆய்வு செய்தல்.",
      "தகுதிமுறை வினவும் நீதிப்பேராணை (Quo-Warranto): சட்டத்திற்கு புறம்பாக அரசு பதவியை ஆக்கிரமிப்பதை தடுத்தல்."
    ]'::jsonb,
    7,
    'medium',
    'சரத்து 32 நீதிப்பேராணைகள் TNPSC இந்திய அரசியலமைப்பு | Polity Notes',
    'சரத்து 32 மற்றும் 226 கீழ் வரும் 5 நீதிப்பேராணைகள், உச்சநீதிமன்ற உரிமைகள், TNPSC Group 4 & Group 2 பாலிட்டி குறிப்புகள்.',
    '{"சரத்து 32 நீதிப்பேராணைகள்", "habeas corpus tamil", "tnpsc indian polity notes", "group 4 polity 2026"}',
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- =========================================================================
-- SEED DATA: Core PYQ Papers
-- =========================================================================
INSERT INTO public.tnpsc_pyq_paper (slug, exam_slug, year, title_en, title_ta, exam_date, total_questions, official_pdf_url, official_key_url, order_index)
VALUES
  ('group-4-2024', 'group-4', 2024, 'TNPSC Group 4 & VAO Question Paper 2024', 'டிஎன்பிஎஸ்சி குரூப் 4 & வி.ஏ.ஓ வினாத்தாள் 2024 (நேரடி வினாக்கள் & விடைக் குறிப்புகள்)', '2024-06-09', 200, 'https://www.tnpsc.gov.in', 'https://www.tnpsc.gov.in', 1),
  ('group-4-2022', 'group-4', 2022, 'TNPSC Group 4 & VAO Question Paper 2022', 'டிஎன்பிஎஸ்சி குரூப் 4 & வி.ஏ.ஓ வினாத்தாள் 2022', '2022-07-24', 200, 'https://www.tnpsc.gov.in', 'https://www.tnpsc.gov.in', 2),
  ('group-2-2022', 'group-2', 2022, 'TNPSC Group 2 & 2A Preliminary Paper 2022', 'டிஎன்பிஎஸ்சி குரூப் 2 & 2A முதல்நிலை வினாத்தாள் 2022', '2022-05-21', 200, 'https://www.tnpsc.gov.in', 'https://www.tnpsc.gov.in', 3)
ON CONFLICT (slug) DO NOTHING;

