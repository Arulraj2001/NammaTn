-- Ensure the unified_explore_feed view exists and is readable by anonymous and
-- authenticated users. The public feed (Explore, category, district pages) reads
-- this view; if it is missing, stale, or not granted, posts that exist in the
-- `post` table become invisible on those pages even though admin still shows them
-- (admin falls back to the `post` table, the public feed previously did not).
--
-- Run this in the Supabase SQL Editor (or via `supabase db push`).

CREATE OR REPLACE VIEW unified_explore_feed AS
-- 1. Standard posts
SELECT
  id,
  created_date,
  updated_date,
  title_en,
  title_ta,
  content_en,
  content_ta,
  post_type,
  district_slug,
  district_name,
  area_slug,
  area_name,
  category_slug,
  category_name,
  is_anonymous,
  author_name,
  upvotes,
  downvotes,
  comment_count,
  status,
  civic_receipt_id,
  civic_status,
  verification_count,
  duplicate_count,
  before_photos,
  media_urls,
  -- Fallback coordinates for posts
  CASE district_slug
    WHEN 'chennai' THEN 13.0827
    WHEN 'coimbatore' THEN 11.0168
    WHEN 'madurai' THEN 9.9252
    WHEN 'tiruchirappalli' THEN 10.8305
    WHEN 'salem' THEN 11.6643
    WHEN 'tirunelveli' THEN 8.7139
    ELSE 11.0000
  END::numeric AS latitude,
  CASE district_slug
    WHEN 'chennai' THEN 80.2707
    WHEN 'coimbatore' THEN 76.9558
    WHEN 'madurai' THEN 78.1198
    WHEN 'tiruchirappalli' THEN 78.6901
    WHEN 'salem' THEN 78.1462
    WHEN 'tirunelveli' THEN 77.7567
    ELSE 78.0000
  END::numeric AS longitude
FROM post

UNION ALL

-- 2. Situations (Power cuts / Water alerts)
SELECT
  id,
  created_date,
  updated_date,
  title AS title_en,
  NULL AS title_ta,
  details AS content_en,
  NULL AS content_ta,
  'alert' AS post_type,
  district_slug,
  district_name,
  area_slug,
  area_name,
  CASE situation_type
    WHEN 'eb_shutdown' THEN 'power-cut'
    WHEN 'water_shortage' THEN 'water-issue'
    ELSE 'road-problem'
  END AS category_slug,
  CASE situation_type
    WHEN 'eb_shutdown' THEN 'Power Cut'
    WHEN 'water_shortage' THEN 'Water Issue'
    ELSE 'Road Problem'
  END AS category_name,
  true AS is_anonymous,
  'Community Alert' AS author_name,
  confirm_count AS upvotes,
  0 AS downvotes,
  0 AS comment_count,
  status,
  'SIT-' || id AS civic_receipt_id,
  'reported' AS civic_status,
  0 AS verification_count,
  0 AS duplicate_count,
  '[]'::jsonb AS before_photos,
  media_urls,
  latitude,
  longitude
FROM situation_update

UNION ALL

-- 3. Scams
SELECT
  id,
  created_date,
  updated_date,
  title AS title_en,
  NULL AS title_ta,
  description AS content_en,
  NULL AS content_ta,
  'alert' AS post_type,
  district_slug,
  district_name,
  area_slug,
  area_name,
  'scam' AS category_slug,
  'Scam Alert' AS category_name,
  is_anonymous,
  'Scam Watch' AS author_name,
  confirm_count AS upvotes,
  0 AS downvotes,
  0 AS comment_count,
  status,
  'SCAM-' || id AS civic_receipt_id,
  'reported' AS civic_status,
  0 AS verification_count,
  0 AS duplicate_count,
  '[]'::jsonb AS before_photos,
  '[]'::jsonb AS media_urls,
  latitude,
  longitude
FROM scam_alert

UNION ALL

-- 4. Emergencies
SELECT
  id,
  created_date,
  updated_date,
  title AS title_en,
  NULL AS title_ta,
  description AS content_en,
  NULL AS content_ta,
  'alert' AS post_type,
  district_slug,
  district_name,
  area_slug,
  area_name,
  'scam' AS category_slug,
  'Scam Alert' AS category_name,
  false AS is_anonymous,
  'Emergency Aid' AS author_name,
  confirm_count AS upvotes,
  0 AS downvotes,
  0 AS comment_count,
  status,
  'EMERG-' || id AS civic_receipt_id,
  'reported' AS civic_status,
  0 AS verification_count,
  0 AS duplicate_count,
  '[]'::jsonb AS before_photos,
  '[]'::jsonb AS media_urls,
  latitude,
  longitude
FROM emergency_post;

-- Make the view readable by anonymous and authenticated users (public + admin).
GRANT SELECT ON "unified_explore_feed" TO anon, authenticated;