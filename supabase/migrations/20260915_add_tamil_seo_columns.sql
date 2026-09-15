-- ============================================================
-- Migration: Add Tamil SEO columns to tn_today
-- Date: 2026-09-15
-- ============================================================

ALTER TABLE tn_today
  ADD COLUMN IF NOT EXISTS seo_title_ta text,
  ADD COLUMN IF NOT EXISTS seo_description_ta text,
  ADD COLUMN IF NOT EXISTS seo_keywords_ta text;

-- Add comments for documentation
COMMENT ON COLUMN tn_today.seo_title_ta IS 'Tamil SEO title for Google Search ranking in Tamil queries (<= 60 chars)';
COMMENT ON COLUMN tn_today.seo_description_ta IS 'Tamil meta description for search snippets (<= 160 chars)';
COMMENT ON COLUMN tn_today.seo_keywords_ta IS 'Tamil search phrases and keywords';
