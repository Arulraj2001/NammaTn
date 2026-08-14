-- ============================================================
-- TN Today: Daily Tamil Nadu Headline CMS Table
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS tn_today (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title           text NOT NULL,
  slug            text NOT NULL UNIQUE,
  subtitle        text,
  featured_image  text,
  category        text DEFAULT 'general' CHECK (category IN (
    'infrastructure','education','healthcare','environment',
    'economy','governance','transport','agriculture',
    'technology','social','india','world','general'
  )),
  author_name     text DEFAULT 'VizhiTN Editorial Team',
  publish_date    timestamptz,
  status          text DEFAULT 'draft' CHECK (status IN ('draft','scheduled','published','archived')),
  reading_time    integer DEFAULT 5,
  content         text,                   -- Rich HTML content (main article body)
  summary         text,                   -- Short intro / summary block
  why_it_matters  text,                   -- Why this matters to TN citizens
  key_facts       text,                   -- JSON array of bullet facts: [{"fact":"..."}]
  timeline        text,                   -- JSON array of timeline events: [{"date":"...","event":"..."}]
  official_sources text,                  -- JSON array of source links: [{"label":"...","url":"..."}]
  related_civic_links text,               -- JSON array of related links
  seo_title       text,
  seo_description text,
  seo_keywords    text,
  canonical_url   text,
  social_image    text,
  is_featured     boolean DEFAULT false,
  view_count      integer DEFAULT 0,
  district_slug   text,
  district_name   text,
  created_date    timestamptz DEFAULT now(),
  updated_date    timestamptz DEFAULT now()
);

-- Index for fast slug lookups (public article pages)
CREATE UNIQUE INDEX IF NOT EXISTS idx_tn_today_slug ON tn_today (slug);

-- Index for published articles sorted by date
CREATE INDEX IF NOT EXISTS idx_tn_today_published ON tn_today (status, publish_date DESC)
  WHERE status = 'published';

-- Index for category archive pages
CREATE INDEX IF NOT EXISTS idx_tn_today_category ON tn_today (category, status, publish_date DESC);

-- Index for featured article on homepage
CREATE INDEX IF NOT EXISTS idx_tn_today_featured ON tn_today (is_featured, status, publish_date DESC);

-- Auto-update updated_date on row change
CREATE OR REPLACE FUNCTION update_tn_today_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_tn_today_updated_date ON tn_today;
CREATE TRIGGER set_tn_today_updated_date
  BEFORE UPDATE ON tn_today
  FOR EACH ROW EXECUTE FUNCTION update_tn_today_timestamp();

-- RLS: Public can read published articles; only authenticated admins can write
ALTER TABLE tn_today ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published tn_today" ON tn_today
  FOR SELECT TO public USING (status = 'published');

CREATE POLICY "Admins full access tn_today" ON tn_today
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- RPC to safely increment view count on select-only public rows
CREATE OR REPLACE FUNCTION increment_tn_today_view(article_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE tn_today
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to guarantee only one article is pinned to the homepage
CREATE OR REPLACE FUNCTION reset_other_featured_articles()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_featured = true AND (OLD.is_featured = false OR OLD.is_featured IS NULL OR TG_OP = 'INSERT') THEN
    UPDATE tn_today
    SET is_featured = false
    WHERE id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_single_featured_article ON tn_today;
CREATE TRIGGER enforce_single_featured_article
  BEFORE INSERT OR UPDATE ON tn_today
  FOR EACH ROW EXECUTE FUNCTION reset_other_featured_articles();
