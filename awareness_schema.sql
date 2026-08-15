-- ============================================================
-- VizhiTN Citizen Awareness — Database Schema
-- Run in Supabase SQL Editor
-- ============================================================

-- 1. Awareness Categories
CREATE TABLE IF NOT EXISTS "awareness_category" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "name_en" TEXT NOT NULL,
  "name_ta" TEXT,
  "icon" TEXT DEFAULT 'Info',
  "color" TEXT DEFAULT '#3B82F6',
  "slug" TEXT UNIQUE,
  "sort_order" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true
);

-- 2. Quick Resources
CREATE TABLE IF NOT EXISTS "awareness_resource" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "title_en" TEXT NOT NULL,
  "title_ta" TEXT,
  "description_en" TEXT,
  "description_ta" TEXT,
  "icon" TEXT DEFAULT 'Info',
  "icon_color" TEXT DEFAULT '#3B82F6',
  "category_id" TEXT REFERENCES "awareness_category"("id") ON DELETE SET NULL,
  "items_en" JSONB DEFAULT '[]'::jsonb,
  "items_ta" JSONB DEFAULT '[]'::jsonb,
  "action_btn1_text_en" TEXT,
  "action_btn1_text_ta" TEXT,
  "action_btn1_url" TEXT,
  "action_btn1_variant" TEXT DEFAULT 'primary',
  "action_btn2_text_en" TEXT,
  "action_btn2_text_ta" TEXT,
  "action_btn2_url" TEXT,
  "action_btn2_variant" TEXT DEFAULT 'secondary',
  "sort_order" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true
);

-- 3. Government Schemes
CREATE TABLE IF NOT EXISTS "awareness_scheme" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "name_en" TEXT NOT NULL,
  "name_ta" TEXT,
  "category_en" TEXT,
  "category_ta" TEXT,
  "department_en" TEXT,
  "department_ta" TEXT,
  "description_en" TEXT,
  "description_ta" TEXT,
  "eligibility_en" TEXT,
  "eligibility_ta" TEXT,
  "documents_en" JSONB DEFAULT '[]'::jsonb,
  "documents_ta" JSONB DEFAULT '[]'::jsonb,
  "benefits_en" TEXT,
  "benefits_ta" TEXT,
  "apply_url" TEXT,
  "website_url" TEXT,
  "featured_image" TEXT,
  "icon" TEXT DEFAULT 'Award',
  "priority" INTEGER DEFAULT 0,
  "is_featured" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0
);

-- 4. Official Portals
CREATE TABLE IF NOT EXISTS "awareness_portal" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "name_en" TEXT NOT NULL,
  "name_ta" TEXT,
  "description_en" TEXT,
  "description_ta" TEXT,
  "url" TEXT,
  "category_en" TEXT,
  "category_ta" TEXT,
  "department_en" TEXT,
  "department_ta" TEXT,
  "icon" TEXT DEFAULT 'Globe',
  "is_featured" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0
);

-- 5. Citizen Rights
CREATE TABLE IF NOT EXISTS "awareness_right" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "name_en" TEXT NOT NULL,
  "name_ta" TEXT,
  "description_en" TEXT,
  "description_ta" TEXT,
  "content_en" TEXT,
  "content_ta" TEXT,
  "pdf_url" TEXT,
  "department_en" TEXT,
  "department_ta" TEXT,
  "resources_en" JSONB DEFAULT '[]'::jsonb,
  "resources_ta" JSONB DEFAULT '[]'::jsonb,
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0
);

-- 6. Awareness Guides ("What To Do If...")
CREATE TABLE IF NOT EXISTS "awareness_guide" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "title_en" TEXT NOT NULL,
  "title_ta" TEXT,
  "problem_type_en" TEXT,
  "problem_type_ta" TEXT,
  "steps_en" JSONB DEFAULT '[]'::jsonb,
  "steps_ta" JSONB DEFAULT '[]'::jsonb,
  "department_en" TEXT,
  "department_ta" TEXT,
  "helpline_numbers" JSONB DEFAULT '[]'::jsonb,
  "portal_url" TEXT,
  "documents_en" JSONB DEFAULT '[]'::jsonb,
  "documents_ta" JSONB DEFAULT '[]'::jsonb,
  "featured_image" TEXT,
  "icon" TEXT DEFAULT 'HelpCircle',
  "is_featured" BOOLEAN DEFAULT false,
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0
);

-- 7. FAQs
CREATE TABLE IF NOT EXISTS "awareness_faq" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "question_en" TEXT NOT NULL,
  "question_ta" TEXT,
  "answer_en" TEXT NOT NULL,
  "answer_ta" TEXT,
  "category_en" TEXT,
  "category_ta" TEXT,
  "sort_order" INTEGER DEFAULT 0,
  "is_active" BOOLEAN DEFAULT true
);

-- 8. Emergency Contacts
CREATE TABLE IF NOT EXISTS "awareness_emergency_contact" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "department_en" TEXT NOT NULL,
  "department_ta" TEXT,
  "number" TEXT NOT NULL,
  "description_en" TEXT,
  "description_ta" TEXT,
  "is_district_specific" BOOLEAN DEFAULT false,
  "district" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0
);

-- 9. Awareness Articles / Knowledge Base
CREATE TABLE IF NOT EXISTS "awareness_article" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "updated_date" TIMESTAMPTZ DEFAULT NOW(),
  "created_by_id" TEXT,
  "title_en" TEXT NOT NULL,
  "title_ta" TEXT,
  "slug" TEXT UNIQUE,
  "category_en" TEXT,
  "category_ta" TEXT,
  "featured_image" TEXT,
  "summary_en" TEXT,
  "summary_ta" TEXT,
  "content_en" TEXT,
  "content_ta" TEXT,
  "seo_title" TEXT,
  "seo_description" TEXT,
  "seo_keywords" TEXT,
  "status" TEXT DEFAULT 'draft',
  "is_active" BOOLEAN DEFAULT true,
  "sort_order" INTEGER DEFAULT 0
);

-- 10. Analytics Tracking
CREATE TABLE IF NOT EXISTS "awareness_analytics" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "created_date" TIMESTAMPTZ DEFAULT NOW(),
  "content_type" TEXT NOT NULL,
  "content_id" TEXT NOT NULL,
  "action" TEXT DEFAULT 'view',
  "search_query" TEXT,
  "user_id" TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_awareness_resource_category ON awareness_resource(category_id);
CREATE INDEX IF NOT EXISTS idx_awareness_resource_active ON awareness_resource(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_awareness_scheme_active ON awareness_scheme(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_awareness_scheme_featured ON awareness_scheme(is_featured, is_active);
CREATE INDEX IF NOT EXISTS idx_awareness_portal_active ON awareness_portal(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_awareness_right_active ON awareness_right(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_awareness_guide_active ON awareness_guide(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_awareness_faq_active ON awareness_faq(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_awareness_emergency_active ON awareness_emergency_contact(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_awareness_article_slug ON awareness_article(slug);
CREATE INDEX IF NOT EXISTS idx_awareness_article_active ON awareness_article(is_active, status);
CREATE INDEX IF NOT EXISTS idx_awareness_analytics_type ON awareness_analytics(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_awareness_analytics_date ON awareness_analytics(created_date);
CREATE INDEX IF NOT EXISTS idx_awareness_category_active ON awareness_category(is_active, sort_order);

-- ============================================================
-- RLS Policies — Public read, admin write
-- ============================================================

ALTER TABLE awareness_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE awareness_resource ENABLE ROW LEVEL SECURITY;
ALTER TABLE awareness_scheme ENABLE ROW LEVEL SECURITY;
ALTER TABLE awareness_portal ENABLE ROW LEVEL SECURITY;
ALTER TABLE awareness_right ENABLE ROW LEVEL SECURITY;
ALTER TABLE awareness_guide ENABLE ROW LEVEL SECURITY;
ALTER TABLE awareness_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE awareness_emergency_contact ENABLE ROW LEVEL SECURITY;
ALTER TABLE awareness_article ENABLE ROW LEVEL SECURITY;
ALTER TABLE awareness_analytics ENABLE ROW LEVEL SECURITY;

-- Secure RLS Policies: Public read, admin-only write
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'awareness_category','awareness_resource','awareness_scheme',
    'awareness_portal','awareness_right','awareness_guide',
    'awareness_faq','awareness_emergency_contact','awareness_article',
    'awareness_analytics'
  ] LOOP
    -- Drop existing policies if they exist
    EXECUTE format('DROP POLICY IF EXISTS "Allow public read %s" ON %I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated insert %s" ON %I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated update %s" ON %I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow authenticated delete %s" ON %I', tbl, tbl);

    -- Create secure policies
    EXECUTE format('CREATE POLICY "Allow public read %s" ON %I FOR SELECT USING (true)', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow admin insert %s" ON %I FOR INSERT WITH CHECK (auth.jwt() -> ''app_metadata'' ->> ''role'' = ''admin'')', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow admin update %s" ON %I FOR UPDATE USING (auth.jwt() -> ''app_metadata'' ->> ''role'' = ''admin'') WITH CHECK (auth.jwt() -> ''app_metadata'' ->> ''role'' = ''admin'')', tbl, tbl);
    EXECUTE format('CREATE POLICY "Allow admin delete %s" ON %I FOR DELETE USING (auth.jwt() -> ''app_metadata'' ->> ''role'' = ''admin'')', tbl, tbl);
  END LOOP;
END $$;

-- ============================================================
-- RPC for analytics tracking (bypass RLS for anonymous users)
-- ============================================================
CREATE OR REPLACE FUNCTION track_awareness_view(
  p_content_type TEXT,
  p_content_id TEXT,
  p_action TEXT DEFAULT 'view',
  p_search_query TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO awareness_analytics (content_type, content_id, action, search_query, user_id)
  VALUES (p_content_type, p_content_id, p_action, p_search_query, auth.uid()::text);
END;
$$;

-- ============================================================
-- Seed Data — Initial content
-- ============================================================

-- Categories (10 Essential Categories)
INSERT INTO awareness_category (id, name_en, name_ta, icon, color, slug, sort_order) VALUES
  ('cat-rights', 'Civil & Human Rights', 'குடிமக்கள் & மனித உரிமைகள்', 'Shield', '#3B82F6', 'rights', 1),
  ('cat-schemes', 'Welfare Schemes & Pensions', 'நலத்திட்டங்கள் & ஓய்வூதியம்', 'Award', '#F59E0B', 'schemes', 2),
  ('cat-civic', 'Municipal & Civic Services', 'மாநகராட்சி & உள்ளாட்சி சேவைகள்', 'Building2', '#8B5CF6', 'civic-services', 3),
  ('cat-health', 'Health & Medical Care', 'சுகாதாரம் & மருத்துவ வசதி', 'HeartPulse', '#EF4444', 'health', 4),
  ('cat-education', 'Education & Youth Skill', 'கல்வி & இளைஞர் திறன்', 'GraduationCap', '#10B981', 'education', 5),
  ('cat-revenue', 'Revenue & Land Records', 'வருவாய் & நில ஆவணங்கள்', 'FileText', '#059669', 'revenue-land', 6),
  ('cat-women', 'Women & Child Welfare', 'பெண்கள் & குழந்தை நலன்', 'Heart', '#EC4899', 'women-child', 7),
  ('cat-transport', 'Transport & RTO Services', 'போக்குவரத்து & RTO சேவைகள்', 'Car', '#6366F1', 'transport-rto', 8),
  ('cat-agriculture', 'Agriculture & Farmers', 'வேளாண்மை & விவசாயிகள்', 'Tractor', '#84CC16', 'agriculture', 9),
  ('cat-emergency', 'Emergency & Anti-Corruption', 'அவசரநிலை & லஞ்ச ஒழிப்பு', 'AlertTriangle', '#DC2626', 'emergency-help', 10)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en, name_ta = EXCLUDED.name_ta, icon = EXCLUDED.icon, color = EXCLUDED.color, slug = EXCLUDED.slug, sort_order = EXCLUDED.sort_order;

-- Quick Resources
INSERT INTO awareness_resource (id, title_en, title_ta, description_en, description_ta, icon, icon_color, category_id, items_en, items_ta, action_btn1_text_en, action_btn1_text_ta, action_btn1_url, action_btn1_variant, action_btn2_text_en, action_btn2_text_ta, action_btn2_url, action_btn2_variant, sort_order) VALUES
(
  'res-esevai', 'TNEGA e-Sevai Online Directory', 'தமிழ்நாடு இ-சேவை சான்றிதழ் சேவைகள்',
  'Apply online for Community, Income, Native Residence certificates, Patta Chitta, and ration card updates.',
  'சாதிச் சான்றிதழ், வருமானச் சான்றிதழ், இருப்பிட சான்றிதழ் மற்றும் பட்டா சிட்டா பெற இணையதள சேவை.',
  'Monitor', '#10B981', 'cat-revenue',
  '["Patta & Chitta Land Extracts", "Community & Income Certificate", "First Graduate Certificate", "Ration Card Address & Family Member Addition"]'::jsonb,
  '["பட்டா & சிட்டா நில ஆவணங்கள்", "சாதி மற்றும் வருமானச் சான்றிதழ்", "முதல் பட்டதாரி சான்றிதழ்", "ரேஷன் கார்டு முகவரி & உறுப்பினர் சேர்க்கை"]'::jsonb,
  'Open e-Sevai Portal', 'இ-சேவை தளம் திறக்க', 'https://www.tnesevai.tn.gov.in', 'primary',
  'Check Patta Online', 'பட்டா சரிபார்க்க', 'https://eservices.tn.gov.in/eservicesweb', 'secondary',
  1
),
(
  'res-cmhelpline', 'CM Helpline 1100 & Public Grievance', 'முதலமைச்சர் உதவி மையம் 1100',
  'Single-window grievance redressal portal to file grievances directly to Tamil Nadu government departments.',
  'தமிழ்நாடு அரசுத் துறைகளிடம் நேரடியாக குறைகளைப் பதிவு செய்ய ஒற்றைச் சாளர உதவி மையம்.',
  'Headphones', '#3B82F6', 'cat-civic',
  '["Call Toll-Free 1100 (24x7)", "Online Grievance Tracking", "Departmental SLA Resolution (3-15 Days)", "SMS Status Notifications"]'::jsonb,
  '["இலவச எண் 1100 (24x7)", "ஆன்லைன் குறை கண்காணிப்பு", "துறை சார்ந்த காலக்கெடு தீர்வு (3-15 நாட்கள்)", "எஸ்.எம்.எஸ் நிலை அறிவிப்புகள்"]'::jsonb,
  'File CM Complaint', 'முதல்வரிடம் புகார் செய்ய', 'https://cmhelpline.tn.gov.in', 'primary',
  'Track Status', 'நிலையைக் கண்காணிக்க', 'https://cmhelpline.tn.gov.in', 'secondary',
  2
),
(
  'res-rti', 'Right to Information (RTI Act 2005)', 'தகவல் அறியும் உரிமைச் சட்டம் 2005',
  'Know how to file RTI applications to inspect government records, tenders, and public authority files.',
  'அரசு கோப்புகள், திட்ட ஒப்பந்தங்கள் மற்றும் ஆவணங்களை ஆய்வு செய்ய தகவல் அறியும் உரிமை விண்ணப்பம்.',
  'FileSearch', '#6366F1', 'cat-rights',
  '["30-Day Mandatory Public Reply Window", "File Online via rti.tn.gov.in", "₹10 Court Fee / Postal Order Fee", "First Appeal to Head of Department"]'::jsonb,
  '["30 நாட்களில் கட்டாய அரசு பதில்", "ஆன்லைனில் விண்ணப்பிக்க rti.tn.gov.in", "₹10 நீதிமன்றக் கட்டணம் / போஸ்டல் ஆர்டர்", "முதல் மேல்முறையீடு அதிகாரி"]'::jsonb,
  'RTI Online Portal', 'தகவல் உரிமை தளம்', 'https://rtionline.tn.gov.in', 'primary',
  'Download Sample Format', 'மாதிரி படிவம் பதிவிறக்கு', 'https://rtionline.tn.gov.in', 'secondary',
  3
),
(
  'res-dvac', 'DVAC Anti-Corruption Helpline 1064', 'லஞ்ச ஒழிப்புத் துறை 1064',
  'Report bribery demands or corruption by government officials confidentially to the Directorate of Vigilance.',
  'அரசு ஊழியர்கள் லஞ்சம் கேட்டால் லஞ்ச ஒழிப்பு மற்றும் கண்காணிப்பு இயக்ககத்தில் ரகசியமாக புகார் அளிக்கவும்.',
  'ShieldAlert', '#DC2626', 'cat-emergency',
  '["Toll-Free Hotline 1064", "Confidential Trap Operations", "Online Complaint Submission", "Whistleblower Identity Protection"]'::jsonb,
  '["இலவச உதவி எண் 1064", "ரகசிய பொறி நடவடிக்கை", "ஆன்லைன் புகார் சமர்ப்பிப்பு", "புகாரளிப்பவர் ரகசிய பாதுகாப்பு"]'::jsonb,
  'Report Bribery 1064', 'லஞ்சம் புகார் செய்ய 1064', 'tel:1064', 'primary',
  'DVAC Official Site', 'DVAC இணையதளம்', 'https://www.dvac.tn.gov.in', 'secondary',
  4
),
(
  'res-tangedco', 'TANGEDCO Electricity Grievance 1912', 'மின்சார வாரிய குறைதீர் மையம் 1912',
  '24x7 electricity breakdown helpline, transformer failures, high voltage issues, and bill tariff disputes.',
  'மின்வெட்டு, டிரான்ஸ்பார்மர் பழுது, மின்சார கட்டணப் புகார்களுக்கு 24x7 உதவி எண்.',
  'Zap', '#F59E0B', 'cat-civic',
  '["Call 1912 for Immediate Line Worker Dispatch", "Pay Bills on tnebnet.org", "WhatsApp Fuse-Off Call Support", "Solar Rooftop Net-Metering Application"]'::jsonb,
  '["உடனடி ஊழியர் வருகைக்கு 1912", "மின் கட்டணம் செலுத்த tnebnet.org", "வாட்ஸ்அப் மின் பழுது பதிவு", "சோலார் கூரை இணைப்பு விண்ணப்பம்"]'::jsonb,
  'Pay TNEB Bill', 'மின் கட்டணம் செலுத்த', 'https://www.tnebnet.org', 'primary',
  'Call 1912 Help', '1912 அழைக்க', 'tel:1912', 'secondary',
  5
),
(
  'res-health', 'CMCHIS Health Insurance & 108', 'முதலமைச்சர் காப்பீடு & 108 ஆம்புலன்ஸ்',
  'Access cashless treatments up to ₹5 lakh/year across 1,150+ hospitals in Tamil Nadu.',
  '1,150க்கும் மேற்பட்ட மருத்துவமனைகளில் ஆண்டுக்கு ₹5 லட்சம் வரை கட்டணமில்லா சிகிச்சை பெறுங்கள்.',
  'HeartPulse', '#EF4444', 'cat-health',
  '["Call 108 for Emergency Ambulance Dispatch", "Cashless Coverage up to ₹5,000,000", "Includes 1,150+ Govt & Private Empanelled Hospitals", "CMCHIS Toll-Free Helpline 1800-425-3993"]'::jsonb,
  '["108 அவசர ஆம்புலன்ஸ் அழைப்பு", "₹5 லட்சம் வரை கட்டணமில்லா காப்பீடு", "1,150+ அரசு மற்றும் தனியார் மருத்துவமனைகள்", "இலவச உதவி எண் 1800-425-3993"]'::jsonb,
  'Find Empanelled Hospital', 'மருத்துவமனை கண்டறிய', 'https://www.cmchis.com', 'primary',
  'Call 108 Emergency', '108 அழைக்க', 'tel:108', 'secondary',
  6
)
ON CONFLICT (id) DO UPDATE SET
  title_en = EXCLUDED.title_en, title_ta = EXCLUDED.title_ta, description_en = EXCLUDED.description_en, description_ta = EXCLUDED.description_ta,
  icon = EXCLUDED.icon, icon_color = EXCLUDED.icon_color, items_en = EXCLUDED.items_en, items_ta = EXCLUDED.items_ta,
  action_btn1_text_en = EXCLUDED.action_btn1_text_en, action_btn1_text_ta = EXCLUDED.action_btn1_text_ta, action_btn1_url = EXCLUDED.action_btn1_url,
  action_btn2_text_en = EXCLUDED.action_btn2_text_en, action_btn2_text_ta = EXCLUDED.action_btn2_text_ta, action_btn2_url = EXCLUDED.action_btn2_url;

-- Government Schemes (10 Real TN Schemes)
INSERT INTO awareness_scheme (id, name_en, name_ta, category_en, category_ta, department_en, department_ta, description_en, description_ta, eligibility_en, eligibility_ta, benefits_en, benefits_ta, apply_url, website_url, icon, is_featured, is_active, sort_order) VALUES
(
  'sch-magalir-urimai',
  'Kalaignar Magalir Urimai Thogai Scheme', 'கலைஞர் மகளிர் உரிமைத் தொகை திட்டம்',
  'Women Welfare', 'பெண்கள் நலன்',
  'Social Welfare & Women Empowerment Department', 'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
  'Monthly cash assistance of ₹1,000 transferred directly to bank accounts of eligible female heads of families to recognize unpaid domestic labor and promote financial autonomy.',
  'குடும்பத் தலைவியாக உள்ள தகுதியான பெண்களுக்கு நிதி தன்னாட்சியை வழங்க மாதம் ₹1,000 நேரடியாக வங்கி கணக்கில் வரவு வைக்கும் திட்டம்.',
  'Female head of family, age 21+, annual family income below ₹2.5 lakh, electricity consumption below 3,600 units/year, no member paying income tax or owning a 4-wheeler car.',
  'குடும்பத் தலைவி (வயது 21+), குடும்ப ஆண்டு வருமானம் ₹2.5 லட்சத்திற்குள் இருக்க வேண்டும், ஆண்டு மின் நுகர்வு 3,600 யூனிட்டிற்குள் இருக்க வேண்டும், கார்/வருமான வரி செலுத்துவோர் இருக்கக்கூடாது.',
  'Direct Benefit Transfer (DBT) of ₹1,000 per month on the 15th of every month into beneficiary bank account.',
  'ஒவ்வொரு மாதமும் 15ஆம் தேதி பயனாளியின் வங்கி கணக்கில் நேரடியாக ₹1,000 வரவு வைக்கப்படும்.',
  'https://www.kmut.tn.gov.in', 'https://www.kmut.tn.gov.in', 'Users', true, true, 1
),
(
  'sch-pudhumai-penn',
  'Pudhumai Penn Scheme (Moovalur Ramamirtham Ammaiyar Higher Education)', 'புதுமைப் பெண் திட்டம் (மூவலூர் ராமாமிர்தம் அம்மையார் உயர்கல்வி)',
  'Education & Youth', 'கல்வி & இளைஞர் நலன்',
  'Higher Education Department', 'உயர்கல்வித் துறை',
  'Financial assistance of ₹1,000 per month for female students who completed Classes 6–12 in Tamil Nadu government schools and are pursuing higher education in degree/diploma courses.',
  'தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை படித்து கல்லூரி/டிப்ளமோ பயிலும் மாணவிகளுக்கு மாதம் ₹1,000 கல்வி உதவித்தொகை.',
  'Girl students who studied continuously from Classes 6 to 12 in Tamil Nadu government schools and enrolled in undergraduate degree, diploma, or ITI courses.',
  'தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12 வரை தொடர்ந்து படித்து, தற்போது கல்லூரி, டிப்ளமோ அல்லது ஐ.டி.ஐ பயிலும் மாணவிகள்.',
  '₹1,000 per month credited directly to the student bank account until completion of higher education course.',
  'உயர்கல்வி முடியும் வரை மாணவியின் வங்கி கணக்கில் மாதம் ₹1,000 கல்வி நிதியுதவி.',
  'https://pudhummaipenn.tn.gov.in', 'https://pudhummaipenn.tn.gov.in', 'GraduationCap', true, true, 2
),
(
  'sch-tamil-pudhalvan',
  'Tamil Pudhalvan Higher Education Scheme', 'தமிழ் புதல்வன் உயர்கல்வித் திட்டம்',
  'Education & Youth', 'கல்வி & இளைஞர் நலன்',
  'Higher Education Department', 'உயர்கல்வித் துறை',
  'Financial assistance of ₹1,000 per month for male students who studied in Tamil Nadu government schools from Classes 6–12 and are enrolled in degree, engineering, or diploma programs.',
  'தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12-ஆம் வகுப்பு வரை படித்து கல்லூரி/பொறியியல் பயிலும் மாணவர்களுக்கு மாதம் ₹1,000 கல்வி உதவித்தொகை.',
  'Boy students who completed Classes 6 to 12 in TN government schools and are currently pursuing higher education.',
  'தமிழ்நாடு அரசுப் பள்ளிகளில் 6 முதல் 12 வரை படித்த உயர்கல்வி பயிலும் மாணவர்கள்.',
  '₹1,000 per month transferred directly to student bank account to cover books, transport, and educational materials.',
  'மாணவர்களின் புத்தகம் மற்றும் கல்விச் செலவுகளுக்காக மாதம் ₹1,000 வங்கி கணக்கில் வரவு.',
  'https://tamilpudhalvan.tn.gov.in', 'https://tamilpudhalvan.tn.gov.in', 'BookOpen', true, true, 3
),
(
  'sch-cmchis',
  'Chief Minister''s Comprehensive Health Insurance Scheme (CMCHIS)', 'முதலமைச்சர் விரிவான சுகாதார காப்பீட்டுத் திட்டம் (CMCHIS)',
  'Health & Medical Care', 'சுகாதாரம் & மருத்துவம்',
  'Health & Family Welfare Department', 'சுகாதாரம் மற்றும் குடும்ப நலத் துறை',
  'Cashless healthcare coverage of up to ₹5 lakh per year per family for critical illness procedures across 1,150+ government and empanelled private hospitals in Tamil Nadu.',
  'தமிழ்நாட்டில் 1,150க்கும் மேற்பட்ட அரசு மற்றும் தனியார் மருத்துவமனைகளில் குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் வரை கட்டணமில்லா மருத்துவச் சிகிச்சை.',
  'Families listed on a valid Tamil Nadu Ration Card with annual income under ₹1,20,000 per annum.',
  'செல்லுபடியாகும் தமிழ்நாடு குடும்ப அட்டை வைத்திருக்கும் குடும்பங்கள் (ஆண்டு வருமானம் ₹1.20 லட்சத்திற்குள்).',
  '1,500+ medical procedures, surgical treatments, post-operative care, and diagnostic evaluations with zero out-of-pocket payment.',
  '1,500க்கும் மேற்பட்ட அறுவை சிகிச்சைகள், தீவிர சிகிச்சைகள் மற்றும் பரிசோதனைகள் முற்றிலும் இலவசம்.',
  'https://www.cmchis.com', 'https://www.cmchis.com', 'HeartPulse', true, true, 4
),
(
  'sch-breakfast',
  'Chief Minister''s Breakfast Scheme for Primary Schools', 'முதலமைச்சர் காலை உணவுத் திட்டம்',
  'Child Welfare & Education', 'குழந்தைகள் & கல்வி',
  'School Education Department & Social Welfare Dept', 'பள்ளிக் கல்வித் துறை & சமூக நலத் துறை',
  'Free hot nutritious breakfast served every school working day to students studying in Classes 1 to 5 across all Tamil Nadu government primary schools.',
  'தமிழ்நாட்டின் அனைத்து அரசு தொடக்கப் பள்ளிகளிலும் 1 முதல் 5-ஆம் வகுப்பு வரை பயிலும் குழந்தைகளுக்கு அனைத்து பள்ளி நாட்களிலும் இலவச சத்தான காலை உணவு.',
  'All children enrolled in Classes 1–5 in Tamil Nadu Government primary schools across urban and rural local bodies.',
  'தமிழ்நாடு அரசு தொடக்கப் பள்ளிகளில் 1 முதல் 5-ஆம் வகுப்பு வரை பயிலும் அனைத்து குழந்தைகள்.',
  'Nutritious cooked meals (Upma, Pongal, Kichadi, Idli) reducing malnutrition and improving classroom attendance.',
  'சத்தான சூடான காலை உணவு (உப்மா, பொங்கல், கிச்சடி, இட்லி) வழங்கப்பட்டு கற்றல் திறன் மேம்பாடு.',
  'https://tnschools.gov.in', 'https://tnschools.gov.in', 'UtensilsCrossed', true, true, 5
),
(
  'sch-naan-mudhalvan',
  'Naan Mudhalvan Skill Development & Placement Initiative', 'நான் முதல்வன் இளைஞர் திறன் மேம்பாட்டு திட்டம்',
  'Youth Skill & Employment', 'இளைஞர் திறன் & வேலைவாய்ப்பு',
  'Tamil Nadu Skill Development Corporation (TNSDC)', 'தமிழ்நாடு திறன் மேம்பாட்டுக் கழகம் (TNSDC)',
  'Statewide skill training program equipping college students and youth with cutting-edge industry skills, coding, AI, soft skills, and direct campus placement access.',
  'கல்லூரி மாணவர்கள் மற்றும் இளைஞர்களுக்கு தொழில்நுட்பம், செயற்கை நுண்ணறிவு மற்றும் வேலைவாய்ப்பு திறன் பயிற்சிகளை இலவசமாக வழங்கும் திட்டம்.',
  'College students studying in Arts, Science, Engineering, and Polytechnic colleges in Tamil Nadu.',
  'தமிழ்நாட்டில் உள்ள கலை, அறிவியல், பொறியியல் மற்றும் பாலிடெக்னிக் கல்லூரி மாணவர்கள்.',
  'Free industry certifications from Microsoft, Cambridge, Google, L&T, along with placement interview drives.',
  'மைக்ரோசாப்ட், கூகுள் நிறுவனங்களின் இலவச சர்வதேச சான்றிதழ்கள் மற்றும் வேலைவாய்ப்பு முகாம்கள்.',
  'https://naanmudhalvan.tn.gov.in', 'https://naanmudhalvan.tn.gov.in', 'Briefcase', false, true, 6
),
(
  'sch-makkalai-thedi',
  'Makkalai Thedi Maruthuvam (Doorstep Healthcare)', 'மக்களைத் தேடி மருத்துவம் திட்டம்',
  'Public Health', 'பொது சுகாதாரம்',
  'Health & Family Welfare Department', 'சுகாதாரம் மற்றும் குடும்ப நலத் துறை',
  'Public health outreach program delivering essential non-communicable disease (NCD) medications, hypertension/diabetes screening, and home dialysis support directly to citizens'' homes.',
  'இரத்த அழுத்தம், சர்க்கரை நோய் மற்றும் பிசியோதெரபி சிகிச்சைக்கான மருந்துகளை வீடுகளுக்கே சென்று நேரடியாக வழங்கும் முன்னோடி திட்டம்.',
  'Senior citizens, bedridden patients, chronic disease sufferers, and vulnerable rural residents across Tamil Nadu.',
  'முதியவர்கள், படுக்கையில் உள்ள நோயாளிகள், சர்க்கரை/இரத்த அழுத்த நோய் உள்ள பொதுமக்கள்.',
  'Free monthly door-delivery of prescribed medicines, nursing care, home physiotherapy, and CAPD dialysis kits.',
  'மாதாந்திர மருத்துவ சோதனைகள், மருந்துகள் இல்லத்திற்கே தேடி வந்து இலவசமாக வழக்கம்.',
  'https://tnhealth.tn.gov.in', 'https://tnhealth.tn.gov.in', 'Home', false, true, 7
),
(
  'sch-kanavu-illam',
  'Kalaignar Kanavu Illam Housing Subsidy', 'கலைஞர் கனவு இல்லம் திட்டம்',
  'Rural Housing', 'கிராமப்புற வீட்டு வசதி',
  'Rural Development & Panchayat Raj Department', 'ஊரக வளர்ச்சி மற்றும் ஊராட்சித் துறை',
  'Financial housing grant of ₹3.5 lakh to rural BPL families living in thatched or mud huts to build permanent concrete pucca houses.',
  'கிராமப்புறங்களில் கூரை வீடுகளில் வாழும் ஏழை குடும்பங்கள் பாதுகாப்பான சிமெண்ட் கான்கிரீட் வீடு கட்ட ₹3.50 லட்சம் அரசு மானியம்.',
  'Rural poor families registered as living in thatched/kutcha huts, owning land plot, identified under Panchayat BPL survey.',
  'ஊராட்சியில் கூரை வீடுகளில் வசிக்கும் ஏழை குடும்பங்கள் (சொந்த நிலம் வைத்திருப்போர்).',
  '₹3,50,000 subsidy paid in milestone instalments directly into beneficiary bank accounts.',
  'ரூ.3.50 லட்சம் மானியம் தவணை முறையில் பயனாளியின் வங்கி கணக்கில் செலுத்தப்படும்.',
  'https://tnrd.tn.gov.in', 'https://tnrd.tn.gov.in', 'Home', false, true, 8
),
(
  'sch-illam-thedi-kalvi',
  'Illam Thedi Kalvi (Education at Doorsteps)', 'இல்லம் தேடி கல்வித் திட்டம்',
  'Elementary Education', 'தொடக்கக் கல்வி',
  'School Education Department', 'பள்ளிக் கல்வித் துறை',
  'Community-based volunteer evening learning centers operating in neighborhoods across Tamil Nadu to bridge learning gaps created during school closures.',
  'மாணவர்களின் கற்றல் இடைவெளியைக் குறைக்க குடியிருப்புப் பகுதிகளில் தன்னார்வலர்கள் மூலம் மாலை நேர கற்றல் மையங்கள் இயங்கும் திட்டம்.',
  'Students studying in Classes 1 to 8 in government and government-aided schools.',
  '1 முதல் 8-ஆம் வகுப்பு வரை பயிலும் அரசுப் பள்ளி மாணவர்கள்.',
  'Free 1-1.5 hours daily evening activity-based remedial education by trained community volunteers.',
  'தன்னார்வலர்கள் மூலம் இலவச மாலைநேர விளையாட்டு வழி Remedial கல்வி கற்றல்.',
  'https://illamthedikalvi.tnschools.gov.in', 'https://illamthedikalvi.tnschools.gov.in', 'GraduationCap', false, true, 9
),
(
  'sch-uzhavan-welfare',
  'Uzhavan App & Farmer Welfare Subsidy Scheme', 'உழவன் செயலி & விவசாயிகள் நல மானியத் திட்டம்',
  'Agriculture & Farmer Welfare', 'வேளாண்மை & உழவர் நலன்',
  'Agriculture & Farmers Welfare Department', 'வேளாண்மை மற்றும் உழவர் நலத் துறை',
  'Comprehensive digital platform providing farmers with crop subsidies, drip irrigation grants, fertilizer availability, crop insurance claim assistance, and custom hiring center machinery booking.',
  'விவசாயிகளுக்கு விதைகளின் மானியம், சொட்டு நீர் பாசனக் கருவிகள், பயிர் காப்பீடு மற்றும் டிராக்டர் வாடகை சேவைகளை ஒருங்கிணைத்து வழங்கும் தளம்.',
  'Farmers owning agricultural land in Tamil Nadu registered under Agrisnet database.',
  'தமிழ்நாட்டில் விவசாய நிலம் வைத்துள்ள விவசாயிகள் (அக்ரிஸ்நெட் பதிவேடு வைத்திருப்போர்).',
  '50%-100% subsidy on drip irrigation, certified seeds, micro-nutrients, and subsidized tractor rentals.',
  'சொட்டுநீர் பாசனத்திற்கு 100% மானியம், சான்றளிக்கப்பட்ட விதைகள் மற்றும் பயிர் இழப்பீட்டுத் தொகை.',
  'https://tnagrisnet.tn.gov.in', 'https://tnagrisnet.tn.gov.in', 'Tractor', false, true, 10
)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en, name_ta = EXCLUDED.name_ta, category_en = EXCLUDED.category_en, category_ta = EXCLUDED.category_ta,
  department_en = EXCLUDED.department_en, department_ta = EXCLUDED.department_ta, description_en = EXCLUDED.description_en, description_ta = EXCLUDED.description_ta,
  eligibility_en = EXCLUDED.eligibility_en, eligibility_ta = EXCLUDED.eligibility_ta, benefits_en = EXCLUDED.benefits_en, benefits_ta = EXCLUDED.benefits_ta,
  apply_url = EXCLUDED.apply_url, website_url = EXCLUDED.website_url, is_featured = EXCLUDED.is_featured, sort_order = EXCLUDED.sort_order;

-- Official Portals (10 Real TN Portals)
INSERT INTO awareness_portal (id, name_en, name_ta, description_en, description_ta, url, category_en, category_ta, department_en, department_ta, icon, is_featured, is_active, sort_order) VALUES
('portal-tnesevai', 'Tamil Nadu e-Sevai Portal', 'தமிழ்நாடு இ-சேவை இணையதளம்', 'Official portal for citizen certificates (Community, Income, Native, Nativity) and Revenue department services.', 'சாதி, வருமானம், இருப்பிடம் போன்ற அரசு சான்றிதழ்களை ஆன்லைனில் விண்ணப்பிக்கும் தளம்.', 'https://www.tnesevai.tn.gov.in', 'Revenue & Certificates', 'வருவாய் & சான்றிதழ்கள்', 'TNEGA & Revenue Dept', 'TNEGA & வருவாய்த் துறை', 'Monitor', true, true, 1),
('portal-cmhelpline', 'CM Helpline Grievance Redressal (1100)', 'முதலமைச்சர் குறைதீர்க்கும் தளம்', 'Integrated public grievance portal to lodge complaints directly to Tamil Nadu government departments.', 'அனைத்து அரசுத் துறை புகார்களையும் ஒரே இடத்தில் ஆன்லைனில் பதிவு செய்ய உதவக்கூடிய முகப்பு.', 'https://cmhelpline.tn.gov.in', 'Public Grievance', 'பொது மக்கள் குறை', 'CM Special Cell', 'முதல்வர் தனிப்பிரிவு', 'Headphones', true, true, 2),
('portal-patta', 'Patta & Chitta Land Records Portal', 'பட்டா சிட்டா நில பதிவேடுகள் தளம்', 'View and download land Patta extracts, Chitta, FMB sketches, and TSLR land record documents online.', 'பட்டா, சிட்டா, வரைபடம் மற்றும் நில ஆவணங்களை ஆன்லைனில் பார்வையிட மற்றும் பதிவிறக்க.', 'https://eservices.tn.gov.in/eservicesweb', 'Land Records', 'நில பதிவேடுகள்', 'Survey and Land Records Dept', 'நில அளவை மற்றும் நில வரித்திட்டத் துறை', 'FileText', true, true, 3),
('portal-tnreginet', 'TN Registration Dept Portal (TNREGINET)', 'தமிழ்நாடு பதிவுத் துறை தளம்', 'Calculate stamp duty, apply for Encumbrance Certificate (EC), certified copies, and marriage registration.', 'வில்லங்கச் சான்றிதழ் (EC), வழிகாட்டி மதிப்பு, பத்திரப் பதிவு மற்றும் திருமணப் பதிவு.', 'https://tnreginet.gov.in', 'Property & Registration', 'சொத்து & பதிவுத்துறை', 'Registration Department', 'வணிக வரிகள் மற்றும் பதிவுத் துறை', 'Building', true, true, 4),
('portal-cmchis', 'CMCHIS Health Insurance Official Portal', 'முதலமைச்சர் சுகாதார காப்பீட்டு தளம்', 'Empanelled hospital finder, cashless claim status tracking, policy detail lookup, and e-card download.', 'அங்கீகரிக்கப்பட்ட மருத்துவமனைகள் பட்டியல் மற்றும் சுகாதாரக் காப்பீட்டு அட்டை விபரங்கள்.', 'https://www.cmchis.com', 'Health & Insurance', 'சுகாதாரம் & காப்பீடு', 'Health & Family Welfare Department', 'சுகாதாரத் துறை', 'HeartPulse', true, true, 5),
('portal-tangedco', 'TANGEDCO Electricity Online Services', 'தமிழ்நாடு மின்சார வாரிய தளம்', 'Pay electricity bills online, calculate power tariffs, register fuse-off complaints, and apply for new service connection.', 'மின் கட்டணம் செலுத்துதல், புதிய மின் இணைப்பு விண்ணப்பம் மற்றும் மின்தடை புகார்கள்.', 'https://www.tnebnet.org', 'Electricity & Utilities', 'மின்சாரம் & பொதுச் சேவை', 'Tamil Nadu Generation and Distribution Corp', 'டான்ஜெட்கோ மின்சார வாரியம்', 'Zap', true, true, 6),
('portal-tnpds', 'TN Civil Supplies & Smart Ration Card (TNPDS)', 'தமிழ்நாடு பொது விநியோகத் திட்டம்', 'Add/remove family members in Smart Ration Card, change address, change fair price shop, and check FPS stock.', 'ஸ்மார்ட் ரேஷன் கார்டில் பெயர் சேர்க்கை, நீக்கம், முகவரி மாற்றம் மற்றும் கடை பொருட்கள் இருப்பு.', 'https://www.tnpds.gov.in', 'Civil Supplies & Ration', 'உணவு & நுகர்வோர் பாதுகாப்பு', 'Civil Supplies and Consumer Protection Dept', 'உணவு மற்றும் நுகர்வோர் பாதுகாப்புத் துறை', 'ShoppingBag', true, true, 7),
('portal-tnpolice', 'TN Police e-Services Portal', 'தமிழ்நாடு காவல்துறை ஆன்லைன் சேவை', 'Lodge online complaints, check FIR status, report lost documents, view traffic challan payments, and apply for police verification.', 'ஆன்லைன் காவல் புகார், எஃப்.ஐ.ஆர் நகல் பதிவிறக்கம், காணாமல் போன ஆவண அறிக்கை.', 'https://eservices.tnpolice.gov.in', 'Police & Legal', 'காவல்துறை & சட்டம்', 'Tamil Nadu Police Department', 'தமிழ்நாடு காவல்துறை', 'ShieldAlert', true, true, 8),
('portal-naanmudhalvan', 'Naan Mudhalvan Skill & Mentorship Portal', 'நான் முதல்வன் இளைஞர் திறன் தளம்', 'Official platform for college students to enroll in free industry skill certification courses and placement mentorship.', 'மாணவர்களுக்கான இலவச சர்வதேச தொழில்நுட்பப் பயிற்சிகள் மற்றும் வேலைவாய்ப்பு முகாம்கள்.', 'https://naanmudhalvan.tn.gov.in', 'Education & Skill', 'கல்வி & இளைஞர் திறன்', 'TN Skill Development Corporation', 'தமிழ்நாடு திறன் மேம்பாட்டுக் கழகம்', 'GraduationCap', false, true, 9),
('portal-gcc', 'Greater Chennai Corporation (GCC) Services', 'பெருநகர சென்னை மாநகராட்சி தளம்', 'Pay property tax, professional tax, download birth and death certificates, and register civic complaints in Chennai.', 'சொத்து வரி செலுத்துதல், பிறப்பு/இறப்பு சான்றிதழ் மற்றும் சென்னை மாநகராட்சி சேவைகள்.', 'https://gcc.tn.gov.in', 'Civic & Corporation', 'மாநகராட்சி சேவைகள்', 'Greater Chennai Corporation', 'பெருநகர சென்னை மாநகராட்சி', 'Building2', false, true, 10)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en, name_ta = EXCLUDED.name_ta, description_en = EXCLUDED.description_en, description_ta = EXCLUDED.description_ta,
  url = EXCLUDED.url, category_en = EXCLUDED.category_en, category_ta = EXCLUDED.category_ta, department_en = EXCLUDED.department_en, department_ta = EXCLUDED.department_ta,
  icon = EXCLUDED.icon, is_featured = EXCLUDED.is_featured, sort_order = EXCLUDED.sort_order;

-- Citizen Rights (8 Verified Statutory Protections)
INSERT INTO awareness_right (id, name_en, name_ta, description_en, description_ta, content_en, content_ta, pdf_url, department_en, department_ta, resources_en, resources_ta, is_active, sort_order) VALUES
(
  'right-rti', 'Right to Information Act (RTI 2005)', 'தகவல் அறியும் உரிமைச் சட்டம் 2005',
  'Empowers Indian citizens to request information, inspect government files, and obtain certified copies of government records from any public authority.',
  'அரசுத் துறைகளின் செயல்பாடுகள், நிதிகள் மற்றும் கோப்புகளை மக்கள் பார்வையிடவும் நகல் பெறவும் வகைசெய்யும் சட்டம்.',
  'Under the RTI Act 2005, every citizen has the right to file an application with a Public Information Officer (PIO) of any state or central government department. The PIO must reply within 30 calendar days (or 48 hours if life and liberty are involved). Application fee is ₹10. If information is denied or delayed, citizens can file a First Appeal to the Appellate Authority.',
  'தகவல் அறியும் உரிமைச் சட்டத்தின்படி ஒவ்வொரு குடிமகனும் எந்தவொரு அரசுத் துறையிலும் ₹10 கட்டணத்துடன் விண்ணப்பித்து 30 நாட்களுக்குள் தகவல் பெற உரிமை உண்டு. பதில் கிடைக்காத பட்சத்தில் 30 நாட்களுக்குள் முதல் மேல்முறையீடு செய்யலாம்.',
  'https://rtionline.tn.gov.in', 'Personnel and Administrative Reforms Department', 'பணியாளர் மற்றும் நிர்வாக சீர்திருத்தத் துறை',
  '["RTI Online Portal: rtionline.tn.gov.in", "Fee: ₹10 Court Fee Stamp or Demand Draft", "Mandatory SLA: 30 Days"]'::jsonb,
  '["ஆன்லைன் தளம்: rtionline.tn.gov.in", "கட்டணம்: ₹10 நீதிமன்ற முத்திரை", "பதில் காலக்கெடு: 30 நாட்கள்"]'::jsonb,
  true, 1
),
(
  'right-consumer', 'Consumer Protection Rights (Act 2019)', 'நுகர்வோர் பாதுகாப்பு சட்ட உரிமைகள்',
  'Guarantees protection against defective goods, deficient services, overcharging, misleading advertisements, and unfair trade practices.',
  'குறைபாடுள்ள பொருட்கள், போலியான விளம்பரங்கள் மற்றும் ஏமாற்று வியாபாரத்திற்கு எதிராக இழப்பீடு பெறும் உரிமை.',
  'The Consumer Protection Act 2019 gives citizens 6 fundamental consumer rights: Right to Safety, Right to Information, Right to Choose, Right to be Heard, Right to Redressal, and Right to Consumer Education. Consumers can file complaints online through e-Daakhil without hiring a lawyer for claims up to ₹50 lakh at the District Commission.',
  'நுகர்வோர் பாதுகாப்பு சட்டம் 2019 படி பொருட்களின் தரம், விலை மற்றும் சேவைகளில் குறைபாடு இருந்தால் வக்கீல் இல்லாமல் இ-தாகீல் (e-Daakhil) தளம் வழியாக ஆன்லைனில் நுகர்வோர் நீதிமன்றத்தில் வழக்கு பதிவு செய்து இழப்பீடு பெறலாம்.',
  'https://edaakhil.nic.in', 'Civil Supplies and Consumer Protection Department', 'உணவு மற்றும் நுகர்வோர் பாதுகாப்புத் துறை',
  '["National Consumer Helpline: 1915", "Online Court Filing: edaakhil.nic.in", "District Forum Claim Limit: up to ₹50 Lakhs"]'::jsonb,
  '["தேசிய நுகர்வோர் உதவி எண்: 1915", "ஆன்லைன் நீதிமன்ற வழக்கு: edaakhil.nic.in", "மாவட்ட மன்ற வழக்கு வரம்பு: ₹50 லட்சம் வரை"]'::jsonb,
  true, 2
),
(
  'right-police-check', 'Citizen Rights During Police Vehicle Checks & Detention', 'வாகன சோதனை மற்றும் காவல் விசாரணையில் குடிமக்கள் உரிமைகள்',
  'Know your statutory legal rights when stopped by traffic police, during vehicle document inspection, or police questioning.',
  'வாகன சோதனையின் போதும் காவல் நிலைய விசாரணையின் போதும் குடிமக்களுக்கு உள்ள சட்டப்பூர்வ உரிமைகள்.',
  '1. Officers below Sub-Inspector (SI) rank cannot issue fine receipts for major offences. 2. Officers cannot forcefully seize your ignition key or physically assault driver. 3. Electronic copies of Driving License and RC shown on DigiLocker or mParivahan apps are legally valid under MV Act Rule 139. 4. Women cannot be arrested after sunset (6 PM) and before sunrise (6 AM) except in extraordinary circumstances with a female officer present.',
  '1. சப்-இன்ஸ்பெக்டர் (SI) நிலைக்குக் கீழ் உள்ள அதிகாரிகள் அபராதம் விதிக்க முடியாது. 2. வாகனச் சாவியைப் பிடுங்கவோ உடலளவில் தாக்கவோ அதிகாரம் இல்லை. 3. டிஜிலாக்கர் (DigiLocker) செயலியில் உள்ள உரிமம் மற்றும் ஆர்.சி புத்தகம் சட்டப்பூர்வமாக செல்லுபடியாகும். 4. பெண்களை மாலை 6 மணி முதல் காலை 6 மணி வரை பெண் காவலர் இன்றி கைது செய்ய முடியாது.',
  'https://eservices.tnpolice.gov.in', 'Home & Police Department', 'உள்துறை மற்றும் காவல்துறை',
  '["Motor Vehicles Act Rule 139 (DigiLocker Validity)", "Police Complaints Authority Hotline", "CrPC Section 46(4) Protection for Women"]'::jsonb,
  '["மோட்டார் வாகன சட்டம் விதி 139", "காவல் துறை புகார் ஆணையம்", "குற்றவியல் நடைமுறைச் சட்டம் பிரிவு 46(4)"]'::jsonb,
  true, 3
),
(
  'right-service', 'Right to Public Services (Time-Bound Delivery)', 'காலவரையறைக்கு உட்பட்ட அரசுச் சேவை உரிமை',
  'Guarantees statutory time limits for receiving civic certificates, electricity connections, water taps, and revenue documents.',
  'அரசுச் சான்றிதழ்கள், குடிநீர் மற்றும் மின்சார இணைப்புகளை குறிப்பிட்ட காலக்கெடுவுக்குள் பெறும் உரிமை.',
  'Under Tamil Nadu Citizen Charter guidelines, government departments must issue certificates within stipulated deadlines: Community/Income Certificate (15 days), Native Certificate (7 days), New Domestic Power Connection (7-15 days), Ration card modification (15 days). If delayed without cause, citizens can file an appeal with the District Collectorate Grievance Officer.',
  'அரசு குடிமக்கள் சாசனம் படி: சாதி/வருமான சான்றிதழ் (15 நாட்கள்), இருப்பிட சான்றிதழ் (7 நாட்கள்), புதிய மின் இணைப்பு (7-15 நாட்கள்) மற்றும் ரேஷன் கார்டு மாற்றம் (15 நாட்கள்) காலக்கெடுவுக்குள் வழங்கப்பட வேண்டும். தாமதமானால் ஆட்சியரிடம் மேல்முறையீடு செய்யலாம்.',
  'https://cmhelpline.tn.gov.in', 'Revenue and Disaster Management Department', 'வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை',
  '["Community Certificate SLA: 15 Days", "New Electricity Connection SLA: 7-15 Days", "District Collector Appeal Process"]'::jsonb,
  '["சாதி சான்றிதழ் காலக்கெடு: 15 நாட்கள்", "புதிய மின் இணைப்பு காலக்கெடு: 7-15 நாட்கள்", "மாவட்ட ஆட்சியர் மேல்முறையீட்டு முறை"]'::jsonb,
  true, 4
),
(
  'right-senior-citizen', 'Maintenance & Rights of Senior Citizens (Act 2007)', 'மூத்த குடிமக்கள் பராமரிப்பு & நல உரிமைகள்',
  'Protects elderly citizens from eviction, abandonment, or financial neglect by adult children or legal heirs.',
  'முதியோர்களை பிள்ளைகள் கைவிடுவதில் இருந்தும் சொத்துக்களில் இருந்து வெளியேற்றுவதில் இருந்தும் பாதுகாக்கும் சட்டம்.',
  'Under the Maintenance and Welfare of Parents and Senior Citizens Act 2007, children or legal heirs are legally obligated to provide a monthly maintenance allowance (up to ₹10,000/month) to elderly parents who cannot maintain themselves. Revenue Divisional Officers (RDO) act as Maintenance Tribunals to order swift eviction of abusive heirs from parent-owned property within 90 days.',
  'பெற்றோர்களைப் பராமரிக்காத பிள்ளைகளிடம் இருந்து மாதம் ₹10,000 வரை ஜீவனாம்சம் பெறவும், முதியோரின் சொத்தை ஆக்கிரமிக்கும் பிள்ளைகளை 90 நாட்களில் வெளியேற்றவும் RDO (வருவாய் கோட்டாட்சியர்) மன்றத்திற்கு முழு அதிகாரம் உண்டு.',
  'https://tnsocialwelfare.tn.gov.in', 'Social Welfare and Women Empowerment Department', 'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
  '["Senior Citizen Helpline: 14567 (Elderline)", "RDO Maintenance Tribunal Jurisdiction", "90-Day Summary Dispute Resolution"]'::jsonb,
  '["முதியோர் இலவச உதவி எண்: 14567", "RDO பராமரிப்பு தீர்ப்பாயம்", "90 நாள் விரைவுத் தீர்வு"]'::jsonb,
  true, 5
),
(
  'right-pwd', 'Rights of Persons with Disabilities (RPwD Act 2016)', 'மாற்றுத்திறனாளிகள் உரிமைகள் சட்டம் 2016',
  'Ensures non-discrimination, 4% public employment reservation, accessible public infrastructure, and monthly pension allowances for disabled citizens.',
  'மாற்றுத்திறனாளிகளுக்கு 4% அரசு வேலைவாய்ப்பு இடஒதுக்கீடு, கட்டணமில்லா பேருந்து பயணம் மற்றும் சம உரிமைக்கான சட்டம்.',
  'The RPwD Act 2016 recognizes 21 disabilities and guarantees full equality, barrier-free access in public buildings/transportation, 4% reservation in government jobs, 5% reservation in higher educational institutions, and statutory monthly maintenance allowance under Tamil Nadu Differently Abled Welfare Board.',
  'மாற்றுத்திறனாளிகள் நலச் சட்டம் 2016 படி 21 வகையான மாற்றுத்திறன்களுக்கு அரசுப் பணியிடங்களில் 4% இடஒதுக்கீடு, உயர்கல்வியில் 5% இடஒதுக்கீடு, கட்டணமில்லா அரசு பேருந்து பயணம் மற்றும் மாதாந்திர பராமரிப்பு உதவித்தொகை வழங்கப்படுகிறது.',
  'https://www.scda.tn.gov.in', 'Welfare of Differently Abled Persons Department', 'மாற்றுத்திறனாளிகள் நலத் துறை',
  '["State Commissionerate for Persons with Disabilities", "UDID Card Registration Portal", "4% Govt Employment Reservation"]'::jsonb,
  '["மாற்றுத்திறனாளிகள் நல ஆணையரகம்", "UDID சர்வதேச அடையாள அட்டை தளம்", "4% அரசு பணி இடஒதுக்கீடு"]'::jsonb,
  true, 6
),
(
  'right-domestic-violence', 'Protection of Women from Domestic Violence Act 2005', 'குடும்ப வன்முறை தடுப்புச் சட்ட உரிமைகள்',
  'Protects women from physical, verbal, emotional, economic, and sexual abuse within shared domestic households.',
  'பெண்களுக்கு எதிராக குடும்பத்தில் நடக்கும் உடலளவிலான, வார்த்தை மற்றும் பொருளாதார வன்முறைகளுக்கு எதிரான சட்டப் பாதுகாப்பு.',
  'Under PWDVA 2005, any woman suffering abuse from spouse or relatives in a shared household can file for instant Protection Orders, Residence Orders, Compensation Orders, and interim maintenance without paying court fees. Protection Officers and Social Welfare Officers in every district provide free legal representation and emergency shelter.',
  'குடும்ப வன்முறை தடுப்புச் சட்டம் 2005 படி பாதிக்கப்பட்ட பெண்கள் பாதுகாப்பு அதிகாரி மூலம் இலவசமாக நீதிமன்ற பாதுகாப்பு உத்தரவு, தங்குமிடம் மற்றும் இடைக்கால பராமரிப்புச் செலவு பெறலாம்.',
  'https://tnsocialwelfare.tn.gov.in', 'Social Welfare and Women Empowerment Department', 'சமூக நலன் மற்றும் மகளிர் உரிமைத் துறை',
  '["Women 24/7 Toll-Free Helpline: 181", "District Protection Officers in all 38 TN Districts", "Free Legal Aid Cell"]'::jsonb,
  '["பெண்கள் இலவச உதவி எண்: 181", "38 மாவட்ட பாதுகாப்பு அதிகாரிகள்", "இலவச சட்ட உதவி மையம்"]'::jsonb,
  true, 7
),
(
  'right-labor-minimum-wage', 'Right to Fair Wages & Working Conditions (TN Shops Act)', 'குறைந்தபட்ச கூலி & தொழிலாளர் பாதுகாப்பு உரிமைகள்',
  'Guarantees statutory minimum wages, mandatory weekly rest, double overtime pay, and safe working conditions for all private sector employees.',
  'தனியார் துறை ஊழியர்களுக்கான குறைந்தபட்ச கூலி, வாராந்திர விடுமுறை மற்றும் கூடுதல் வேலை நேரத்திற்கான இரட்டிப்பு ஊதிய உரிமை.',
  'Under the Tamil Nadu Shops and Establishments Act and Minimum Wages Act, no employer can demand working hours beyond 8 hours/day (48 hours/week) without paying double overtime wages. Employers must grant 1 mandatory weekly paid holiday, 12 casual leaves, 12 sick leaves, and equal remuneration for men and women doing equal work.',
  'தமிழ்நாடு கடைகள் மற்றும் நிறுவனங்கள் சட்டத்தின்படி தொழிலாளர்களுக்கு நாள் ஒன்றுக்கு 8 மணி நேர வேலை, கூடுதல் நேரத்திற்கு இரட்டிப்பு ஊதியம், வாரத்தில் ஒரு நாள் கட்டாய ஊதியத்துடன் கூடிய விடுமுறை மற்றும் மகப்பேறு கால விடுப்பு வழங்கப்பட வேண்டும்.',
  'https://labour.tn.gov.in', 'Labour Welfare and Skill Development Department', 'தொழிலாளர் நலன் மற்றும் திறன் மேம்பாட்டுத் துறை',
  '["Labour Helpline / Grievance Portal", "Minimum Wage Rate Calculator for TN", "Mandatory Maternity Leave Rules"]'::jsonb,
  '["தொழிலாளர் நல உதவி மையம்", "தமிழ்நாடு குறைந்தபட்ச கூலி பட்டியல்", "மகப்பேறு விடுப்பு விதிகள்"]'::jsonb,
  true, 8
)
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en, name_ta = EXCLUDED.name_ta, description_en = EXCLUDED.description_en, description_ta = EXCLUDED.description_ta,
  content_en = EXCLUDED.content_en, content_ta = EXCLUDED.content_ta, pdf_url = EXCLUDED.pdf_url, department_en = EXCLUDED.department_en, department_ta = EXCLUDED.department_ta,
  resources_en = EXCLUDED.resources_en, resources_ta = EXCLUDED.resources_ta, is_active = EXCLUDED.is_active, sort_order = EXCLUDED.sort_order;

-- Awareness Guides ("What To Do If..." - 8 Comprehensive Guides)
INSERT INTO awareness_guide (id, title_en, title_ta, problem_type_en, problem_type_ta, steps_en, steps_ta, department_en, department_ta, helpline_numbers, portal_url, documents_en, documents_ta, icon, is_featured, is_active, sort_order) VALUES
(
  'guide-potholes',
  'What to do if there are Severe Potholes or Road Damage in your Street',
  'உங்கள் தெருவில் பள்ளங்கள் அல்லது சாலை பழுது இருந்தால் என்ன செய்ய வேண்டும்?',
  'Road Infrastructure', 'சாலை உள்கட்டமைப்பு',
  '["Step 1: Take clear photos of the pothole with surrounding landmarks or street name.", "Step 2: Log a report on VizhiTN or use Namma Chennai / Namma Trichy municipal citizen apps.", "Step 3: Note down your Civic Receipt ID (e.g. TN-884120).", "Step 4: If unresolved in 7 days, escalate to Ward Assistant Engineer (AE) or dial Municipal Complaint Number (Chennai 1913 / Coimbatore 1784)."]'::jsonb,
  '["படி 1: தெருப் பெயர் அல்லது அடையாளத்துடன் பள்ளத்தின் புகைப்படத்தை தெளிவாக எடுக்கவும்.", "படி 2: VizhiTN தளத்திலோ அல்லது மாநகராட்சி செயலிகளிலோ புகார் பதிவு செய்யவும்.", "படி 3: உங்கள் குடிமை ரசீது எண்ணைக் குறித்துக் கொள்ளவும் (எ.கா. TN-884120).", "படி 4: 7 நாட்களில் தீர்வு கிடைக்கவில்லையெனில் வார்டு உதவி பொறியாளரிடம் மேல்முறையீடு செய்யவும்."]'::jsonb,
  'Municipal Corporation / Highways Department', 'மாநகராட்சி / நெடுஞ்சாலைத் துறை',
  '["GCC Chennai: 1913", "Coimbatore CCMC: 1784", "Madurai Corporation: 84284 25000", "State Highways Helpline: 1800-425-4444"]'::jsonb,
  'https://cmhelpline.tn.gov.in',
  '["Geo-tagged photo of road damage", "Exact street name & landmark", "Ward Number"]'::jsonb,
  '["பள்ளத்தின் புகைப்படம்", "தெரு பெயர் மற்றும் அடையாளம்", "வார்டு எண்"]'::jsonb,
  'AlertTriangle', true, true, 1
),
(
  'guide-water-supply',
  'What to do if Drinking Water Supply is Contaminated or Disrupted',
  'குடிநீர் விநியோகம் தடைபட்டால் அல்லது சாக்கடை நீர் கலந்தால் என்ன செய்ய வேண்டும்?',
  'Water & Sanitation', 'நீர் & சுகாதாரம்',
  '["Step 1: Stop drinking contaminated water immediately and inform neighbors.", "Step 2: Lodge a complaint on Metro Water Helpline (Chennai 044-45674567) or TWAD Board.", "Step 3: Request water sample collection by Sanitary Inspector for laboratory testing.", "Step 4: Request free emergency mobile water tanker supply if pipe repair takes more than 24 hours."]'::jsonb,
  '["படி 1: உடனடியாக குடிநீர் பயன்படுத்துவதை நிறுத்தி அக்கம் பக்கத்தினருக்கு தெரிவிக்கவும்.", "படி 2: குடிநீர் வாரிய உதவி எண்ணில் (சென்னை 044-45674567 / TWAD) புகார் அளிக்கவும்.", "படி 3: சுகாதார ஆய்வாளர் மூலம் குடிநீர் மாதிரியை பரிசோதனைக்கு அனுப்பக் கோரவும்.", "படி 4: பழுது நீடிக்கப்பட்டால் இலவச குடிநீர் லாரி விநியோகத்தைக் கேட்கவும்."]'::jsonb,
  'Chennai Metro Water / TWAD Board / Municipal Corp', 'சென்னைக் குடிநீர் வாரியம் / TWAD / மாநகராட்சி',
  '["Chennai Metro Water: 044-45674567", "TWAD Board Helpline: 1800-425-1555", "CM Helpline: 1100"]'::jsonb,
  'https://chennaimetrowater.tn.gov.in',
  '["Consumer CAN Number / Bill Copy", "Address details & Ward Number", "Photo/video proof of discoloration"]'::jsonb,
  '["குடிநீர் இணைப்பு நுகர்வோர் எண்", "தெரு முகவரி", "குடிநீர் நிறமாற்றத்தின் புகைப்படம்"]'::jsonb,
  'Droplets', true, true, 2
),
(
  'guide-power-outage',
  'What to do during Prolonged Power Cut or Transformer Failure',
  'உங்கள் பகுதியில் நீண்ட நேர மின்தடை அல்லது டிரான்ஸ்பார்மர் பழுதானால் என்ன செய்ய வேண்டும்?',
  'Electricity Supply', 'மின் விநியோகம்',
  '["Step 1: Dial TANGEDCO 24x7 Minnagam Helpline 1912 or send WhatsApp message.", "Step 2: Provide your 12-digit Electricity Consumer Service Number.", "Step 3: Note down the complaint ticket reference code.", "Step 4: If a transformer is smoking or sparking, stay 20 feet away and alert TNEB section office immediately."]'::jsonb,
  '["படி 1: டான்ஜெட்கோ மின்னகம் 1912 என்ற 24 மணிநேர எண்ணை அழைக்கவும் அல்லது வாட்ஸ்அப் அனுப்பவும்.", "படி 2: உங்கள் 12 இலக்க மின் நுகர்வோர் எண்ணைக் குறிப்பிடவும்.", "படி 3: புகார் பதிவு எண்ணைப் பெற்றுக்கொள்ளவும்.", "படி 4: டிரான்ஸ்பார்மரில் தீப்பொறி வந்தால் 20 அடி தள்ளி நின்று உடனடியாக பழுதுநீக்கும் ஊழியர்களை அழைக்கவும்."]'::jsonb,
  'TANGEDCO (Tamil Nadu Electricity Board)', 'டான்ஜெட்கோ மின்சார வாரியம்',
  '["TANGEDCO Minnagam Helpline: 1912", "TNEB WhatsApp Support: 94987 94987"]'::jsonb,
  'https://www.tnebnet.org',
  '["12-digit Electricity Service Connection Number", "Premises Address & Land Registry pole number"]'::jsonb,
  '["12 இலக்க மின் இணைப்பு எண்", "முகவரி மற்றும் கம்ப எண்"]'::jsonb,
  'Zap', true, true, 3
),
(
  'guide-bribe-demand',
  'What to do if a Government Official Demands a Bribe for a Public Service',
  'அரசு அலுவலகத்தில் சான்றிதழ் அல்லது சேவை பெற லஞ்சம் கேட்டால் என்ன செய்ய வேண்டும்?',
  'Anti-Corruption', 'லஞ்ச ஒழிப்பு',
  '["Step 1: Do NOT pay the bribe amount.", "Step 2: Discretely note officer name, designation, office room number, and exact demand amount.", "Step 3: Record audio, video, or save messaging evidence if safe to do so.", "Step 4: Call DVAC Anti-Corruption Helpline 1064 or visit District Vigilance Officer at Collectorate.", "Step 5: DVAC will lay a secret trap operation with phenolphthalein-marked currency notes to arrest corrupt officer red-handed."]'::jsonb,
  '["படி 1: எந்தக் காரணத்தைக் கொண்டும் லஞ்சப் பணம் கொடுக்காதீர்கள்.", "படி 2: அதிகாரி பெயர், பதவி, அறை எண் மற்றும் கேட்ட தொகையைக் குறித்துக் கொள்ளவும்.", "படி 3: சாத்தியமானால் ஆடியோ அல்லது வீடியோ ஆதாரங்களைப் பதிவு செய்யவும்.", "படி 4: லஞ்ச ஒழிப்புத் துறை 1064 என்ற எண்ணில் தொடர்பு கொள்ளவும்.", "படி 5: லஞ்ச ஒழிப்புத் துறையினர் ரகசியப் பொறி வைத்து லஞ்சம் வாங்கும் அதிகாரியை கையும் களவுமாக பிடிப்பார்கள்."]'::jsonb,
  'Directorate of Vigilance and Anti-Corruption (DVAC)', 'லஞ்ச ஒழிப்பு மற்றும் கண்காணிப்பு இயக்ககம் (DVAC)',
  '["DVAC Toll-Free Helpline: 1064", "DVAC Headquarters Chennai: 044-24615929", "VizhiTN Anonymous Bribe Tracker"]'::jsonb,
  '["https://www.dvac.tn.gov.in"]',
  '["e-Sevai Application Reference Number", "Officer designation details", "Audio/video or written proof"]'::jsonb,
  '["விண்ணப்ப பதிவு எண்", "அதிகாரியின் பதவி விபரம்", "ஆடியோ/வீடியோ ஆதாரம்"]'::jsonb,
  'ShieldAlert', true, true, 4
),
(
  'guide-cyber-fraud',
  'What to do if You Lose Money in Online Cyber Fraud or UPI Scam',
  'ஆன்லைன் ஆன்லைன் மோசடி அல்லது UPI மூலம் பணம் இழந்தால் என்ன செய்ய வேண்டும்?',
  'Cyber Crime & Finance', 'சைபர் குற்றம் & நிதி',
  '["Step 1: IMMEDIATELY dial National Cyber Crime Helpline 1930 within 1 HOUR (Golden Hour).", "Step 2: Provide transaction UTR number, bank account number, and fraudulent UPI VPA ID.", "Step 3: Cyber cell will freeze the recipient bank account instantly to prevent money withdrawal.", "Step 4: File formal complaint on cybercrime.gov.in and submit copy to your home bank branch within 24 hours."]'::jsonb,
  '["படி 1: பணம் இழந்த 1 மணி நேரத்திற்குள் (Golden Hour) உடனடியாக 1930 என்ற எண்ணை அழைக்கவும்.", "படி 2: வங்கிப் பரிவர்த்தனை UTR எண் மற்றும் கணக்கு விவரங்களை வழங்கவும்.", "படி 3: சைபர் காவல்துறை எதிராளியின் வங்கி கணக்கை உடனடியாக முடக்கி பணத்தை மீட்டெடுக்கும்.", "படி 4: cybercrime.gov.in தளத்தில் ஆன்லைன் புகார் பதிவு செய்து வங்கி கிளையில் சமர்ப்பிக்கவும்."]'::jsonb,
  'Tamil Nadu Police Cyber Crime Wing', 'தமிழ்நாடு காவல்துறை சைபர் கிரைம் பிரிவு',
  '["Cyber Crime National Hotline: 1930", "TN Police Cyber Wing: 044-28447700"]'::jsonb,
  'https://cybercrime.gov.in',
  '["Bank Account Statement / Debit SMS Screenshot", "Transaction UTR / RRN Reference Number", "Fraudster Phone Number / UPI ID"]'::jsonb,
  '["வங்கி கணக்கு அறிக்கை / குறுஞ்செய்தி", "பரிவர்த்தனை UTR எண்", "மோசடி நபரின் போன் எண் / UPI ஐடி"]'::jsonb,
  'Shield', true, true, 5
),
(
  'guide-patta-transfer',
  'What to do to Apply for Name Transfer in Land Patta (Name Transfer Workflow)',
  'நிலப் பட்டாவில் பெயர் மாற்றம் செய்ய என்ன செய்ய வேண்டும்?',
  'Revenue & Land', 'வருவாய் & நிலம்',
  '["Step 1: Purchase registered sale deed, parent deed, and encumbrance certificate (EC).", "Step 2: Apply online at e-Sevai center or eservices.tn.gov.in for Patta Name Transfer.", "Step 3: Pay prescribed application fee ₹60.", "Step 4: Village Administrative Officer (VAO) and Revenue Inspector (RI) will conduct field inspection.", "Step 5: Tahsildar issues digital Patta with QR code within 15 to 30 working days."]'::jsonb,
  '["படி 1: பத்திரப் பதிவு ஆவணம், தாய் பத்திரம் மற்றும் வில்லங்கச் சான்றிதழ் (EC) தயார் செய்யவும்.", "படி 2: இ-சேவை மையத்திலோ அல்லது eservices.tn.gov.in தளத்திலோ பட்டா பெயர் மாற்றத்திற்கு விண்ணப்பிக்கவும்.", "படி 3: விண்ணப்பக் கட்டணம் ₹60 செலுத்தவும்.", "படி 4: கிராம நிர்வாக அதிகாரி (VAO) மற்றும் வருவாய் ஆய்வாளர் (RI) நிலத்தை ஆய்வு செய்வார்கள்.", "படி 5: தாசில்தார் 15-30 நாட்களில் QR குறியீட்டுடன் கூடிய புதிய டிஜிட்டல் பட்டாவை வழங்குவார்."]'::jsonb,
  'Revenue Department (Tahsildar Office)', 'வருவாய்த் துறை (தாலுகா அலுவலகம்)',
  '["TNEGA Customer Support: 1800-425-1333", "Revenue e-Services Helpline: 044-28521915"]'::jsonb,
  'https://eservices.tn.gov.in/eservicesweb',
  '["Registered Sale Deed document", "Encumbrance Certificate (EC) from sub-registrar", "Aadhaar Card copy & Old Patta copy"]'::jsonb,
  '["கிரையப் பத்திர நகல்", "வில்லங்கச் சான்றிதழ் (EC)", "ஆதார் அட்டை & பழைய பட்டா நகல்"]'::jsonb,
  'FileCheck', false, true, 6
),
(
  'guide-birth-certificate',
  'What to do to Obtain or Correct a Birth/Death Certificate in Tamil Nadu',
  'பிறப்பு மற்றும் இறப்புச் சான்றிதழ் பெற அல்லது திருத்தம் செய்ய என்ன செய்ய வேண்டும்?',
  'Vital Statistics & Registration', 'பிறப்பு இறப்புப் பதிவு',
  '["Step 1: For institutional births/deaths within 21 days, hospital registers automatically on CRS portal.", "Step 2: Download official digital certificate with QR code for free from tnesevai.tn.gov.in or GCC portal.", "Step 3: For delayed registration beyond 21 days but within 1 year, apply with hospital discharge summary.", "Step 4: For corrections in spelling or child name addition, apply at local Corporation/Panchayat office with hospital birth card and parents'' Aadhaar."]'::jsonb,
  '["படி 1: மருத்துவமனையில் குழந்தை பிறந்த 21 நாட்களுக்குள் இலவசமாக ஆன்லைனில் தானாகவே பதிவாகும்.", "படி 2: tnesevai.tn.gov.in அல்லது மாநகராட்சி தளத்தில் QR குறியீட்டுடன் இலவசமாகப் பதிவிறக்கலாம்.", "படி 3: 21 நாட்களுக்குப் பின் தாமதமான பதிவுகளுக்கு தாலுகா அலுவலகத்தில் விண்ணப்பிக்க வேண்டும்.", "படி 4: பெயர் திருத்தங்களுக்கு குழந்தை பிறப்பு அட்டை மற்றும் பெற்றோர் ஆதாரை மாநகராட்சியில் சமர்ப்பிக்கவும்."]'::jsonb,
  'Public Health & Preventive Medicine Dept / GCC', 'பொது சுகாதாரத் துறை / சென்னை மாநகராட்சி',
  '["Chennai GCC Birth Cell: 044-25619200", "State CRS Portal Support: 1800-425-3993"]'::jsonb,
  'https://crsorgi.gov.in',
  '["Hospital Birth/Death Discharge Summary", "Parents'' Aadhaar Card copies", "Ration card copy"]'::jsonb,
  '["மருத்துவமனை பிறப்பு அட்டை", "பெற்றோரின் ஆதார் நகல்கள்", "குடும்ப அட்டை நகல்"]'::jsonb,
  'Award', false, true, 7
),
(
  'guide-ration-card-new',
  'What to do to Apply for a New Smart Ration Card or Modify Family Members',
  'புதிய ஸ்மார்ட் ரேஷன் கார்டு பெற அல்லது பெயர் சேர்க்க என்ன செய்ய வேண்டும்?',
  'Civil Supplies', 'உணவு & நுகர்வோர் பாதுகாப்பு',
  '["Step 1: Visit tnpds.gov.in or nearest e-Sevai center.", "Step 2: Select ''Apply New Smart Card'' or ''Add Family Member''.", "Step 3: Upload Aadhaar of all members, Marriage Certificate (if adding spouse), and surrender certificate/deletion certificate from old card.", "Step 4: TSO / TNEGA Inspector conducts physical verification at home.", "Step 5: Smart card approved within 15 days and printed for pickup at Fair Price Shop (Ration Shop)."]'::jsonb,
  '["படி 1: tnpds.gov.in தளம் அல்லது அருகிலுள்ள இ-சேவை மையத்திற்குச் செல்லவும்.", "படி 2: ''புதிய ஸ்மார்ட் கார்டு விண்ணப்பம்'' அல்லது ''உறுப்பினர் சேர்க்கை'' என்பதைத் தேர்ந்தெடுக்கவும்.", "படி 3: குடும்ப உறுப்பினர்களின் ஆதார், திருமண சான்றிதழ் மற்றும் பழைய கார்டு நீக்கல் சான்றிதழ் பதிவேற்றவும்.", "படி 4: வட்ட வழங்கல் அதிகாரி (TSO) கள ஆய்வு செய்வார்.", "படி 5: 15 நாட்களில் ஒப்புதல் அளிக்கப்பட்டு ரேஷன் கடையில் கார்டு வழங்கப்படும்."]'::jsonb,
  'Civil Supplies and Consumer Protection Department', 'உணவு மற்றும் நுகர்வோர் பாதுகாப்புத் துறை',
  '["TNPDS Toll-Free Helpline: 1967", "Alternate Consumer Helpline: 1800-425-5901"]'::jsonb,
  'https://www.tnpds.gov.in',
  '["Aadhaar Card copies of all members", "Rental agreement / Gas Connection bill for address proof", "Marriage Certificate & Deletion Certificate"]'::jsonb,
  '["அனைவரின் ஆதார் நகல்கள்", "முகவரி சான்று (வாடகை ஒப்பந்தம்/கேஸ் பில்)", "திருமண சான்றிதழ் & பெயர் நீக்கல் சான்றிதழ்"]'::jsonb,
  'CreditCard', false, true, 8
)
ON CONFLICT (id) DO UPDATE SET
  title_en = EXCLUDED.title_en, title_ta = EXCLUDED.title_ta, problem_type_en = EXCLUDED.problem_type_en, problem_type_ta = EXCLUDED.problem_type_ta,
  steps_en = EXCLUDED.steps_en, steps_ta = EXCLUDED.steps_ta, department_en = EXCLUDED.department_en, department_ta = EXCLUDED.department_ta,
  helpline_numbers = EXCLUDED.helpline_numbers, portal_url = EXCLUDED.portal_url, documents_en = EXCLUDED.documents_en, documents_ta = EXCLUDED.documents_ta,
  is_featured = EXCLUDED.is_featured, sort_order = EXCLUDED.sort_order;

-- FAQs (8 Real Q&As)
INSERT INTO awareness_faq (id, question_en, question_ta, answer_en, answer_ta, category_en, category_ta, sort_order, is_active) VALUES
(
  'faq-1',
  'How do I file a civic complaint or road issue on VizhiTN?',
  'VizhiTN தளத்தில் சாலை அல்லது குடிமைப் புகாரை எப்படி பதிவு செய்வது?',
  'Go to the Create Post page, select your District (e.g. Chennai, Coimbatore) and Category (e.g. Road & Infrastructure), enter location details, attach clear photos, and submit. VizhiTN automatically generates a trackable Civic Receipt ID (e.g. TN-884120) and routes it to the relevant government department.',
  'பதிவு உருவாக்கு பக்கத்திற்குச் சென்று, உங்கள் மாவட்டம் மற்றும் வகையைத் தேர்வு செய்து, இட விவரங்கள் மற்றும் புகைப்படங்களை இணைத்து சமர்ப்பிக்கவும். VizhiTN தானாகவே கண்காணிக்கக்கூடிய குடிமை ரசீது எண்ணை (எ.கா. TN-884120) உருவாக்கி சம்பந்தப்பட்ட அரசுத் துறைக்கு அனுப்பும்.',
  'VizhiTN Platform', 'VizhiTN தளம்', 1, true
),
(
  'faq-2',
  'What is a Civic Receipt ID and how does it hold officials accountable?',
  'குடிமை ரசீது (Civic Receipt ID) என்றால் என்ன? அது அதிகாரிகளை எவ்வாறு பொறுப்பேற்க வைக்கிறது?',
  'A Civic Receipt ID is a unique public tracking number (e.g. TN-718669) generated when a citizen logs an issue. It records exact timestamps, location coordinates, department routing, and community verification votes. It creates an immutable public record that search engines index, preventing officials from ignoring reported civic problems.',
  'குடிமை ரசீது என்பது குடிமக்கள் அளிக்கும் புகார்களுக்கு வழங்கப்படும் தனித்துவமான பொது கண்காணிப்பு எண். இது புகாரின் நேரம், இருப்பிடம் மற்றும் துறை விவரங்களை பொது ஆவணமாகப் பதிவு செய்து தேடு பொறிகளில் காட்டி அதிகாரிகளை பொறுப்பேற்க வைக்கிறது.',
  'Civic Accountability', 'குடிமை பொறுப்புக்கூறல்', 2, true
),
(
  'faq-3',
  'How long does it take for a complaint on CM Helpline 1100 to be resolved?',
  'முதலமைச்சர் உதவி மையம் 1100 புகார்களுக்கு எத்தனை நாட்களில் தீர்வு கிடைக்கும்?',
  'Under Tamil Nadu Government Service Level Agreements (SLAs), urgent civic issues (street light, power cut, minor drainage leak) are assigned a 3 to 7 working day SLA window. Complex infrastructure issues (road relaying, water main replacement) are assigned 15 to 30 working days with progress updates sent via SMS.',
  'அரசு சேவை காலக்கெடுவின்படி: அவசரக் குடிமைப் பிரச்சினைகளுக்கு (தெருவிளக்கு, மின்தடை, கழிவுநீர் அடைப்பு) 3 முதல் 7 வேலை நாட்கள். சாலை அமைப்பு போன்ற பெரிய பணிகளுக்கு 15 முதல் 30 வேலை நாட்களுக்குள் எஸ்.எம்.எஸ் மூலம் நிலைமை தெரிவிக்கப்படும்.',
  'Government SLAs', 'அரசு காலக்கெடு', 3, true
),
(
  'faq-4',
  'How do I report bribery or corrupt officers without facing harassment?',
  'அச்சுறுத்தல் இன்றி அரசு லஞ்ச அதிகாரிகளை எப்படி பாதுகாப்பாக புகார் செய்வது?',
  'You can report bribery 100% anonymously. Call the Directorate of Vigilance and Anti-Corruption (DVAC) toll-free hotline 1064 or post anonymously on VizhiTN. Never pay cash bribes. DVAC officers conduct confidential trap operations using marked currency to catch corrupt officials red-handed while protecting whistleblower identities under law.',
  'லஞ்ச ஒழிப்புத் துறையின் (DVAC) இலவச எண் 1064 மூலம் அல்லது VizhiTN தளத்தில் அநாமதேயமாக புகார் செய்யலாம். லஞ்சப் பணம் கொடுக்காமல் ரகசியமாக புகார் அளித்தால் லஞ்ச ஒழிப்புத் துறையினர் ரகசியமாகச் செயல்பட்டு லஞ்சம் வாங்கும் அதிகாரியைக் கையும் களவுமாகப் பிடிப்பார்கள்.',
  'Anti-Corruption', 'லஞ்ச ஒழிப்பு', 4, true
),
(
  'faq-5',
  'Can I download Patta Chitta online for free in Tamil Nadu?',
  'தமிழ்நாட்டில் பட்டா சிட்டாவை ஆன்லைனில் இலவசமாகப் பதிவிறக்க முடியுமா?',
  'Yes. Visit eservices.tn.gov.in/eservicesweb, click "View Patta / Chitta Extract", select your District, Taluk, Village, and enter Survey Number and Sub-division Number. You can instantly view and download the official digital Patta with QR code verification at zero cost.',
  'ஆம். eservices.tn.gov.in/eservicesweb என்ற தளத்தில் மாவட்டம், வட்டம், கிராமம் மற்றும் சர்வே எண்ணை உள்ளிட்டு QR குறியீட்டுடன் கூடிய டிஜிட்டல் பட்டா சிட்டா நகலை கட்டணமின்றி இலவசமாகவே பதிவிறக்கம் செய்யலாம்.',
  'Land Records', 'நில பதிவேடுகள்', 5, true
),
(
  'faq-6',
  'What should I do if a hospital refuses CMCHIS cashless treatment?',
  'காப்பீட்டு அட்டை இருந்தும் மருத்துவமனை கட்டணமில்லா சிகிச்சை மறுத்தால் என்ன செய்ய வேண்டும்?',
  'If any empanelled government or private hospital refuses cashless treatment to a valid CMCHIS card holder or demands cash payment, immediately call the 24x7 CMCHIS Toll-Free Helpline at 1800-425-3993. State health officers will intervene immediately to enforce cashless admission or penalize the hospital.',
  'அங்கீகரிக்கப்பட்ட மருத்துவமனை கட்டணமில்லா சிகிச்சை வழங்க மறுத்தாலோ அல்லது பணம் கேட்டாலோ உடனடியாக 1800-425-3993 என்ற 24 மணி நேர இலவச உதவி எண்ணை அழைக்கவும். அதிகாரிகள் உடனடியாகத் தலையிட்டு சிகிச்சைக்கு ஏற்பாடு செய்வார்கள்.',
  'Health Insurance', 'சுகாதாரக் காப்பீடு', 6, true
),
(
  'faq-7',
  'What is the 1930 Cyber Crime Golden Hour rule for online money theft?',
  'ஆன்லைன் பண மோசடிக்கு 1930 சைபர் கிரைம் "Golden Hour" விதி என்றால் என்ன?',
  'If you fall victim to UPI scams, fake bank call frauds, or phishing link money debits, dial 1930 IMMEDIATELY within 1 hour. This 1-hour window is called the "Golden Hour" because Cyber Crime police can directly lock and freeze the fraudster recipient bank account before they withdraw or transfer your stolen funds.',
  'ஆன்லைன் மூலம் ஏமாந்து பணம் இழந்தால் 1 மணி நேரத்திற்குள் 1930 என்ற எண்ணிற்கு அழைப்பது "Golden Hour" எனப்படும். 1 மணி நேரத்திற்குள் புகாரளித்தால் சைபர் காவல்துறை குற்றவாளியின் வங்கி கணக்கை முடக்கி பணத்தை உடனடியாக மீட்டெடுக்க முடியும்.',
  'Cyber Crime', 'சைபர் குற்றம்', 7, true
),
(
  'faq-8',
  'Are electronic documents on DigiLocker valid during police vehicle checks?',
  'காவல்துறை வாகன சோதனையின் போது டிஜிலாக்கர் (DigiLocker) சான்றிதழ்கள் செல்லுபடியாகுமா?',
  'Yes. Under Rule 139 of the Central Motor Vehicles Rules 1989 and Union Ministry of Road Transport directives, electronic Driving Licenses, RC Books, Insurance Policies, and Pollution Certificates presented via DigiLocker or mParivahan mobile apps are 100% legally equivalent to original physical documents.',
  'ஆம். மத்திய மோட்டார் வாகன விதிகள் விதி 139ன்படி DigiLocker அல்லது mParivahan செயலியில் உள்ள ஓட்டுநர் உரிமம், ஆர்.சி புத்தகம் மற்றும் காப்பீட்டுச் சான்றுகள் அசல் ஆவணங்களுக்குச் சமமாக சட்டப்பூர்வமாகச் செல்லுபடியாகும்.',
  'Traffic Rules & Legal Rights', 'போக்குவரத்து விதிகள் & சட்ட உரிமை', 8, true
)
ON CONFLICT (id) DO UPDATE SET
  question_en = EXCLUDED.question_en, question_ta = EXCLUDED.question_ta, answer_en = EXCLUDED.answer_en, answer_ta = EXCLUDED.answer_ta,
  category_en = EXCLUDED.category_en, category_ta = EXCLUDED.category_ta, sort_order = EXCLUDED.sort_order;

-- Emergency Contacts (12 Verified Helplines in Tamil Nadu)
INSERT INTO awareness_emergency_contact (id, department_en, department_ta, number, description_en, description_ta, is_district_specific, district, is_active, sort_order) VALUES
('emg-1', 'Police Emergency', 'காவல்துறை அவசர எண்', '100', 'For crime, law and order, theft, and physical safety emergencies.', 'குற்றம், சட்டம்-ஒழுங்கு, திருட்டு மற்றும் அவசரப் பாதுகாப்புக்கு.', false, null, true, 1),
('emg-2', 'Fire & Rescue Services', 'தீயணைப்பு & மீட்புப் பணி', '101', 'For fire accidents, building collapses, and emergency rescue operations.', 'தீ விபத்துகள், கட்டிட இடிபாடுகள் மற்றும் உயிர்காப்பு மீட்பு பணிகளுக்கு.', false, null, true, 2),
('emg-3', 'Medical Ambulance Service', 'மருத்துவ ஆம்புலன்ஸ் சேவை', '108', '24x7 free emergency ambulance transport to government & empanelled hospitals.', '24 மணி நேர இலவச மருத்துவ அவசர ஆம்புலன்ஸ் சேவை.', false, null, true, 3),
('emg-4', 'Women Helpline', 'பெண்கள் அவசர உதவி எண்', '181', '24x7 crisis support, domestic violence shelter, and legal protection for women.', 'பெண்கள் பாதுகாப்பு, குடும்ப வன்முறைத் தடுப்பு மற்றும் அவசர உதவி.', false, null, true, 4),
('emg-5', 'Childline (Child Protection)', 'குழந்தைகள் உதவி எண்', '1098', 'For child abuse prevention, runaway children, and child labor rescue.', 'குழந்தைகள் பாதுகாப்பு, துஷ்பிரயோகம் தடுப்பு மற்றும் குழந்தை தொழிலாளர் மீட்பு.', false, null, true, 5),
('emg-6', 'Chief Minister Helpline', 'முதலமைச்சர் குறைதீர்க்கும் எண்', '1100', 'Toll-free single window hotline for public civic grievances and complaints.', 'பொதுமக்கள் குறைகள் மற்றும் அரசுத் துறை புகார்களுக்கான இலவச எண்.', false, null, true, 6),
('emg-7', 'Cyber Crime Helpline', 'சைபர் குற்றங்கள் தடுப்பு எண்', '1930', 'To report financial cyber fraud, UPI theft, and online scam account freezing.', 'ஆன்லைன் வங்கி மோசடி, UPI திருட்டு புகார்களுக்கான சைபர் க்ரைம் எண்.', false, null, true, 7),
('emg-8', 'DVAC Anti-Corruption Hotline', 'லஞ்ச ஒழிப்புத் துறை உதவி எண்', '1064', 'To report bribery demands by government officials confidentially.', 'அரசு ஊழியர்கள் லஞ்சம் கேட்டால் ரகசியமாக புகார் செய்ய.', false, null, true, 8),
('emg-9', 'TANGEDCO Minnagam Power Cut', 'மின்சார வாரிய பழுது நீக்க எண்', '1912', '24x7 electricity breakdown, transformer failure, and fuse-of-call support.', '24x7 மின்வெட்டு, டிரான்ஸ்பார்மர் பழுது மற்றும் மின்சாரப் புகார்கள்.', false, null, true, 9),
('emg-10', 'Health & Medical Counseling', 'சுகாதார ஆலோசனை உதவி எண்', '104', 'Free 24x7 doctor medical advice, mental health counseling, and health queries.', '24 மணி நேர இலவச மருத்துவ ஆலோசனைகள் மற்றும் மனநல வழிகாட்டுதல்.', false, null, true, 10),
('emg-11', 'Disaster Management Control Room', 'பேரிடர் மேலாண்மை மையம்', '1077', 'District level flood, cyclone, and heavy rain disaster response control room.', 'மழை, வெள்ளம் மற்றும் புயல் பேரிடர் அவசரக் கட்டுப்பாட்டு மையம்.', false, null, true, 11),
('emg-12', 'Elderline Senior Citizen Help', 'முதியோர் உதவி எண்', '14567', 'Toll-free elder abuse reporting, rescue, legal support, and pension assistance.', 'முதியோர் பாதுகாப்பு, ஜீவனாம்ச உதவி மற்றும் இலவச வழிகாட்டுதல்.', false, null, true, 12)
ON CONFLICT (id) DO UPDATE SET
  department_en = EXCLUDED.department_en, department_ta = EXCLUDED.department_ta, number = EXCLUDED.number, description_en = EXCLUDED.description_en, description_ta = EXCLUDED.description_ta, sort_order = EXCLUDED.sort_order;

-- Awareness Knowledge Base Articles (5 Detailed Articles)
INSERT INTO awareness_article (id, title_en, title_ta, slug, category_en, category_ta, summary_en, summary_ta, content_en, content_ta, seo_title, seo_description, seo_keywords, status, is_active, sort_order) VALUES
(
  'art-esevai-guide',
  'Complete Guide to Tamil Nadu e-Sevai Online Services and Certificate Applications',
  'தமிழ்நாடு இ-சேவை சான்றிதழ்கள் ஆன்லைனில் பெறுவது எப்படி? முழு வழிகாட்டி',
  'tamil-nadu-esevai-online-services-guide',
  'Government Services', 'அரசு சேவைகள்',
  'Learn how to apply for Community, Income, Native, Nativity, and First Graduate certificates online through TNEGA e-Sevai without agent fees.',
  'இடத்தரகர்கள் இன்றி சாதி, வருமானம், இருப்பிடம் மற்றும் முதல் பட்டதாரி சான்றிதழ்களை ஆன்லைனில் விண்ணப்பிக்கும் முறை.',
  'Tamil Nadu e-Governance Agency (TNEGA) provides over 150 government-to-citizen (G2C) services online via tnesevai.tn.gov.in. Citizens can register a CAN number (Citizen Access Number) linked to Aadhaar and apply for Revenue Department certificates directly. Certificates carry a verified digital signature and QR code, rendering them 100% valid for school admissions, college scholarships, and government jobs.',
  'தமிழ்நாடு மின் ஆளுமை முகமை (TNEGA) tnesevai.tn.gov.in மூலம் 150க்கும் மேற்பட்ட அரசு சேவைகளை வழங்குகிறது. ஆதாரை இணைத்து CAN எண் உருவாக்கி சாதி சான்றிதழ், வருமான சான்றிதழ் போன்றவற்றை நேரடியாக விண்ணப்பித்து QR குறியீட்டுடன் பதிவிறக்கம் செய்யலாம்.',
  'TN e-Sevai Online Certificate Application Guide | TNEGA Services',
  'Step-by-step guide to applying for Community, Income, Native, and Patta certificates online via TN e-Sevai portal.',
  'tn esevai, tnega online certificate, community certificate apply, income certificate tn, patta chitta download',
  'published', true, 1
),
(
  'art-rti-guide',
  'How to File an Effective RTI Application in Tamil Nadu: Laws, Fees & Workflow',
  'தமிழ்நாட்டில் தகவல் அறியும் உரிமைச் சட்டத்தில் (RTI) விண்ணப்பிப்பது எப்படி?',
  'how-to-file-rti-application-tamil-nadu-guide',
  'Citizen Rights', 'குடிமக்கள் உரிமைகள்',
  'Step-by-step instructions on drafting RTI queries, identifying Public Information Officers (PIO), court fee stamps, and filing first appeals.',
  'அரசுத் துறைகளிடம் இருந்து RTI மூலம் தகவல்களைப் பெற கேட்க வேண்டிய கேள்விகள் மற்றும் மேல்முறையீடு நடைமுறைகள்.',
  'Under the Right to Information Act 2005, citizens can request official records from any Tamil Nadu government department. Applications require a ₹10 Court Fee Stamp or Postal Order addressed to the Public Information Officer (PIO). The PIO must provide written response within 30 days. If the reply is incomplete or evasive, file a First Appeal to the First Appellate Authority (FAA) within 30 days.',
  'தகவல் அறியும் உரிமைச் சட்டம் 2005 மூலம் அரசுத் துறைகளிடம் கேள்விகள் கேட்டு 30 நாட்களில் பதில் பெறலாம். ₹10 நீதிமன்ற முத்திரை ஒட்டி பொதுத் தகவல் அதிகாரிக்கு விண்ணப்பிக்க வேண்டும். பதில் திருப்திகரமாக இல்லை என்றால் 30 நாட்களில் முதல் மேல்முறையீடு செய்யலாம்.',
  'How to File RTI in Tamil Nadu | RTI Application Format & Fee Rules',
  'Complete guide on filing RTI applications in Tamil Nadu state departments, fee payment methods, and 30-day appeal process.',
  'file rti tamil nadu, rti application format tn, public information officer address, rti appeal rules',
  'published', true, 2
),
(
  'art-cmchis-claims',
  'Understanding CMCHIS Health Insurance Coverage, Hospital Network & Claim Workflow',
  'முதலமைச்சர் விரிவான காப்பீட்டுத் திட்டத்தில் ₹5 லட்சம் இலவச சிகிச்சை பெறுவது எப்படி?',
  'cmchis-health-insurance-coverage-hospital-guide',
  'Health & Insurance', 'சுகாதாரம் & காப்பீடு',
  'Complete overview of medical procedures, cashless hospital admission workflow, empanelled government/private hospitals, and grievance escalation.',
  'முதலமைச்சர் காப்பீட்டு அட்டையைப் பயன்படுத்தி 1,150க்கும் மேற்பட்ட அரசு மற்றும் தனியார் மருத்துவமனைகளில் பணமில்லா சிகிச்சை பெறும் முறை.',
  'Chief Minister''s Comprehensive Health Insurance Scheme (CMCHIS) offers cashless hospitalization benefits up to ₹5,00,000 per family per year. Beneficiaries must show a valid TN Ration Card and CMCHIS card at empanelled hospital kiosks. Hospital Insurance Officers handle pre-authorization directly with United India Insurance Co. No cash deposit is required for approved procedures.',
  'முதலமைச்சர் காப்பீட்டுத் திட்டம் மூலம் குடும்பத்திற்கு ஆண்டுக்கு ₹5 லட்சம் வரை கட்டணமில்லா சிகிச்சை பெறலாம். அங்கீகரிக்கப்பட்ட மருத்துவமனைகளில் உள்ள காப்பீட்டு மையத்தில் ரேஷன் கார்டு மற்றும் காப்பீட்டு அட்டையைக் காட்டினால் கட்டணமில்லா அனுமதி வழங்கப்படும்.',
  'CMCHIS Health Insurance Claims & Empanelled Hospital List Guide',
  'Learn how to get cashless medical treatment up to ₹5 lakh under Tamil Nadu Chief Minister Health Insurance Scheme.',
  'cmchis hospital list, cm health insurance apply, cashless medical treatment tn, cmchis card download',
  'published', true, 3
),
(
  'art-land-records',
  'Patta, Chitta, FMB Sketch & EC Demystified for Property Owners in Tamil Nadu',
  'பட்டா, சிட்டா, வரைபடம் (FMB) மற்றும் வில்லங்கச் சான்றிதழ் (EC) — நில ஆவணங்களின் முழு விளக்கம்',
  'patta-chitta-fmb-ec-land-records-guide-tamil-nadu',
  'Property & Revenue', 'சொத்து & வருவாய்',
  'Essential guide explaining land revenue terminology in Tamil Nadu, online verification steps, and avoiding land fraud.',
  'தமிழ்நாட்டில் நிலம் வாங்கும் போது சரிபார்க்க வேண்டிய பட்டா, சிட்டா, வில்லங்கச் சான்றிதழ் மற்றும் FMB வரைபடங்களின் முக்கியத்துவம்.',
  'When buying or verifying land in Tamil Nadu, four legal documents are vital: 1. Patta (Revenue ownership record issued by Tahsildar). 2. Chitta (Land classification and tax details). 3. FMB Sketch (Field Measurement Book diagram showing exact boundary dimensions). 4. Encumbrance Certificate (EC from Sub-Registrar confirming no existing mortgages or legal disputes). All four can be verified online on eservices.tn.gov.in and tnreginet.gov.in.',
  'நிலம் வாங்கும் போது 4 ஆவணங்கள் முக்கியம்: 1. பட்டா (சொத்து உரிமையாளர் பெயர்). 2. சிட்டா (நிலத்தின் வகைப்பாடு). 3. FMB வரைபடம் (நிலத்தின் எல்லை அளவுகள்). 4. வில்லங்கச் சான்றிதழ் (EC - சொத்தில் கடன் அல்லது வில்லங்கம் உள்ளதா என்ற சான்று). இவை அனைத்தையும் ஆன்லைனில் சரிபார்க்கலாம்.',
  'Patta Chitta EC FMB Land Verification Guide Tamil Nadu',
  'Guide to understanding Patta, Chitta, FMB survey sketches, and Encumbrance Certificates (EC) for property owners in TN.',
  'patta chitta verification, fmb sketch download, encumbrance certificate tn, tnreginet ec search',
  'published', true, 4
),
(
  'art-traffic-police-rights',
  'Legal Protections & Citizen Rights During Traffic Police Vehicle Checks in TN',
  'வாகன சோதனையின் போது காவல்துறையிடம் ஓட்டுநர்களுக்கு உள்ள சட்டப்பூர்வ உரிமைகள்',
  'traffic-police-vehicle-check-citizen-rights-guide',
  'Legal Rights & Traffic', 'சட்ட உரிமைகள் & போக்குவரத்து',
  'Know the legal rules under Motor Vehicles Act regarding officer rank requirements, DigiLocker validity, key seizure prohibition, and fine payment.',
  'வாகன சோதனையின் போது காவல்துறை பின்பற்ற வேண்டிய விதிகள் மற்றும் ஓட்டுநர்களின் உரிமைகள் பற்றிய விழிப்புணர்வு.',
  'Citizens driving in Tamil Nadu are protected under the Motor Vehicles Act 1989: 1. Only officers of Sub-Inspector (SI) rank and above are authorized to demand fine payments or inspect documents on spot. 2. Officers CANNOT snatch your vehicle ignition keys or physically restrain you. 3. Documents presented electronically on DigiLocker or mParivahan apps are legally valid under MV Act Rule 139. 4. Spot fine receipts must be generated electronically with official e-Challan machines.',
  'தமிழ்நாட்டில் வாகன ஓட்டுநர்களுக்கான சட்ட உரிமைகள்: 1. சப்-இன்ஸ்பெக்டர் (SI) அல்லது அதற்கு மேற்பட்ட அதிகாரிகளே அபராதம் வசூலிக்க முடியும். 2. வாகனச் சாவியை பிடுங்குவது சட்டவிரோதம். 3. டிஜிலாக்கர் (DigiLocker) செயலியில் காட்டப்படும் உரிமம் மற்றும் ஆர்.சி புத்தகம் 100% செல்லுபடியாகும். 4. அபராதத்திற்கு இ-சலான் (e-Challan) ரசீது கட்டாயம் வழங்கப்பட வேண்டும்.',
  'Traffic Police Vehicle Check Rights & DigiLocker Rules in Tamil Nadu',
  'Understand your legal rights during traffic police stops in Tamil Nadu, MV Act Rule 139 DigiLocker rules, and fine payment guidelines.',
  'traffic police check rules tn, digilocker validity driving license, police key snatching illegal, e challan status',
  'published', true, 5
)
ON CONFLICT (id) DO UPDATE SET
  title_en = EXCLUDED.title_en, title_ta = EXCLUDED.title_ta, slug = EXCLUDED.slug, category_en = EXCLUDED.category_en, category_ta = EXCLUDED.category_ta,
  summary_en = EXCLUDED.summary_en, summary_ta = EXCLUDED.summary_ta, content_en = EXCLUDED.content_en, content_ta = EXCLUDED.content_ta,
  seo_title = EXCLUDED.seo_title, seo_description = EXCLUDED.seo_description, seo_keywords = EXCLUDED.seo_keywords, status = EXCLUDED.status, sort_order = EXCLUDED.sort_order;
